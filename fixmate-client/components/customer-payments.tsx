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

interface CustomerPayment {
  _id: string;
  serviceTitle: string;
  technicianName?: string;
  amount: number;
  currency?: string;
  transactionId?: string;
  paidAt?: string;
}

interface PaymentListResponse {
  payments?: CustomerPayment[];
}

function formatAmount(amount: number, currency = "usd") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CustomerPayments() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadPayments = async () => {
      const token = getAuthToken();
      const currentUser = getAuthUser();
      if (!token || !currentUser) {
        router.replace(
          `/sign-in?redirect=${encodeURIComponent("/dashboard/customer/payments")}`,
        );
        return;
      }

      if (!isAuthRole(currentUser.role)) {
        router.replace("/sign-in");
        return;
      }

      if (currentUser.role !== "customer") {
        router.replace(getDashboardPath(currentUser.role));
        return;
      }

      setUser(currentUser);
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await api.get<PaymentListResponse>(
          "/api/payments/my",
          { cache: "no-store" },
        );
        if (isActive) setPayments(response?.payments ?? []);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not load your payments.";
        if (isActive) {
          setLoadError(message);
          toast.error(message);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadPayments();
    return () => {
      isActive = false;
    };
  }, [reloadKey, router]);

  if (!user) {
    return (
      <main className="px-4 py-12" role="status">
        <p className="text-sm text-muted-foreground">Loading your payments...</p>
      </main>
    );
  }

  return (
    <DashboardLayout role="customer" user={user}>
      <div className="space-y-8">
        <section>
          <p className="text-sm font-semibold text-primary">Customer workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Payments
          </h1>
          <p className="mt-2 text-muted-foreground">
            Review payments for your completed repair services.
          </p>
        </section>

        {isLoading ? (
          <div
            className="h-56 animate-pulse rounded-xl border border-border bg-card"
            aria-label="Loading payments"
            aria-busy="true"
          />
        ) : loadError ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="font-medium text-foreground">
              We couldn&apos;t load your payments.
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
        ) : payments.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="min-w-full divide-y divide-border text-left">
              <thead className="bg-secondary/60">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Service
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Technician
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Amount
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Transaction ID
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Payment date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-foreground">
                      {payment.serviceTitle}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                      {payment.technicianName || "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-foreground">
                      {formatAmount(payment.amount, payment.currency)}
                    </td>
                    <td
                      className="max-w-64 truncate px-5 py-4 text-sm text-muted-foreground"
                      title={payment.transactionId || "Not available"}
                    >
                      {payment.transactionId || "Not available"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-muted-foreground">
                      {formatDate(payment.paidAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <h2 className="text-xl font-semibold text-foreground">
              No payments yet
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Completed and paid repair services will appear here.
            </p>
            <Button asChild className="mt-6">
              <Link href="/dashboard/customer/bookings">View My Bookings</Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
