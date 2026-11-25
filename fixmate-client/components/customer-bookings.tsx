"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import {
  getAuthToken,
  getAuthUser,
  getDashboardPath,
  isAuthRole,
  type AuthUser,
} from "@/lib/auth-session";

interface CustomerBooking {
  _id: string;
  serviceTitle: string;
  serviceImage?: string;
  technicianName?: string;
  preferredDate?: string;
  basePrice?: number;
  finalAmount?: number;
  status: string;
  paymentStatus: string;
}

type BookingListResponse =
  | CustomerBooking[]
  | { bookings?: CustomerBooking[] };

const STATUS_STYLES: Record<string, string> = {
  requested: "bg-blue-100 text-blue-800",
  accepted: "bg-indigo-100 text-indigo-800",
  "in-progress": "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-200",
};

function formatStatus(status: string) {
  if (status === "in-progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value?: string) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAmount(value?: number) {
  return typeof value === "number"
    ? new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
      }).format(value)
    : "—";
}

export function CustomerBookings() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [cancelTarget, setCancelTarget] = useState<CustomerBooking | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadBookings = async () => {
      const token = getAuthToken();
      const currentUser = getAuthUser();
      if (!token || !currentUser) {
        router.replace(
          `/sign-in?redirect=${encodeURIComponent("/dashboard/customer/bookings")}`,
        );
        return;
      }

      const role = isAuthRole(currentUser.role) ? currentUser.role : "customer";
      if (role !== "customer") {
        router.replace(getDashboardPath(role));
        return;
      }

      setUser(currentUser);
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await api.get<BookingListResponse>("/api/bookings/my", {
          cache: "no-store",
        });
        const customerBookings = Array.isArray(response)
          ? response
          : (response?.bookings ?? []);
        if (isActive) setBookings(customerBookings);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not load your bookings.";
        if (isActive) {
          setLoadError(message);
          toast.error(message);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadBookings();
    return () => {
      isActive = false;
    };
  }, [reloadKey, router]);

  const handleCancel = async () => {
    if (!cancelTarget) return;

    setCancellingId(cancelTarget._id);
    try {
      const updatedBooking = await api.patch<CustomerBooking>(
        `/api/bookings/${cancelTarget._id}/cancel`,
      );
      setBookings((current) =>
        current.map((booking) =>
          booking._id === cancelTarget._id
            ? { ...booking, ...updatedBooking, status: "cancelled" }
            : booking,
        ),
      );
      setCancelTarget(null);
      toast.success("Repair request cancelled.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not cancel this request.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  const handlePayNow = async (booking: CustomerBooking) => {
    setPayingId(booking._id);
    try {
      const response = await api.post<{ url?: string }>(
        "/api/payments/create-checkout-session",
        { bookingId: booking._id },
      );
      if (!response.url) {
        throw new Error("Checkout could not be started. Please try again.");
      }

      const checkoutUrl = new URL(response.url);
      if (checkoutUrl.protocol !== "https:" && checkoutUrl.protocol !== "http:") {
        throw new Error("The checkout link is invalid.");
      }
      window.location.assign(checkoutUrl.href);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start checkout.",
      );
      setPayingId(null);
    }
  };

  if (!user) {
    return (
      <main className="px-4 py-12" role="status">
        <p className="text-sm text-muted-foreground">Loading your bookings...</p>
      </main>
    );
  }

  return (
    <DashboardLayout role="customer" user={user}>
      <div className="space-y-8">
        <section>
          <p className="text-sm font-semibold text-primary">Customer workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            My Bookings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Follow each repair request from booking through payment.
          </p>
        </section>

        {isLoading ? (
          <div
            className="grid gap-5 md:grid-cols-2"
            aria-label="Loading bookings"
            aria-busy="true"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-xl border border-border bg-card"
              />
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="font-medium text-foreground">
              We couldn&apos;t load your bookings.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
            <Button
              type="button"
              className="mt-5"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try Again
            </Button>
          </div>
        ) : bookings.length > 0 ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {bookings.map((booking) => {
              const status = booking.status.toLowerCase();
              const paymentStatus = booking.paymentStatus.toLowerCase();
              const statusStyle =
                STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-200";

              return (
                <article
                  key={booking._id}
                  className="rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={booking.serviceImage || "/hero-repair.svg"}
                      alt={booking.serviceTitle}
                      className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-semibold text-foreground">
                        {booking.serviceTitle}
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Technician: {booking.technicianName || "Assigned soon"}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Preferred date: {formatDate(booking.preferredDate)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}
                    >
                      {formatStatus(status)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : paymentStatus === "unpaid"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {formatStatus(paymentStatus)}
                    </span>
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-4 rounded-lg bg-secondary/60 p-4">
                    <div>
                      <dt className="text-xs text-muted-foreground">Base amount</dt>
                      <dd className="mt-1 text-sm font-semibold text-foreground">
                        {formatAmount(booking.basePrice)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Final amount</dt>
                      <dd className="mt-1 text-sm font-semibold text-foreground">
                        {formatAmount(booking.finalAmount)}
                      </dd>
                    </div>
                  </dl>

                  {status === "requested" ||
                  (status === "completed" && paymentStatus === "unpaid") ? (
                    <div className="mt-5 flex flex-wrap justify-end gap-3">
                      {status === "requested" ? (
                        <Button
                          type="button"
                          variant="outline"
                          disabled={cancellingId === booking._id}
                          onClick={() => setCancelTarget(booking)}
                        >
                          Cancel Request
                        </Button>
                      ) : null}
                      {status === "completed" && paymentStatus === "unpaid" ? (
                        <Button
                          type="button"
                          disabled={payingId === booking._id}
                          onClick={() => handlePayNow(booking)}
                        >
                          {payingId === booking._id ? "Opening checkout..." : "Pay Now"}
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <h2 className="text-xl font-semibold text-foreground">
              No requests yet
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your repair bookings will appear here once you request a service.
            </p>
            <Button asChild className="mt-6">
              <Link href="/services">Browse Services</Link>
            </Button>
          </div>
        )}
      </div>

      {cancelTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cancel-booking-title"
            aria-describedby="cancel-booking-description"
            className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl"
          >
            <h2
              id="cancel-booking-title"
              className="text-lg font-semibold text-foreground"
            >
              Cancel this request?
            </h2>
            <p
              id="cancel-booking-description"
              className="mt-2 text-sm text-muted-foreground"
            >
              Your request for {cancelTarget.serviceTitle} will be cancelled.
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={cancellingId === cancelTarget._id}
                onClick={() => setCancelTarget(null)}
              >
                Keep Request
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={cancellingId === cancelTarget._id}
                onClick={handleCancel}
              >
                {cancellingId === cancelTarget._id
                  ? "Cancelling..."
                  : "Confirm Cancel"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
