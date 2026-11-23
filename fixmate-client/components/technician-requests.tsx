"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Phone,
  MapPin,
  AlertCircle,
  X,
  Play,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useTechnicianSession } from "@/lib/use-technician-session";
import { cn } from "@/lib/utils";

interface TechnicianBooking {
  _id: string;
  customerName: string;
  customerEmail: string;
  phone?: string;
  address?: string;
  preferredDate?: string;
  problem?: string;
  serviceTitle: string;
  serviceImage?: string;
  category?: string;
  basePrice: number;
  finalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt?: string;
}

const STATUS_STYLES: Record<string, string> = {
  requested: "bg-blue-100 text-blue-800 border-blue-200",
  accepted: "bg-indigo-100 text-indigo-800 border-indigo-200",
  "in-progress": "bg-amber-100 text-amber-800 border-amber-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

export function TechnicianRequests() {
  const user = useTechnicianSession("/dashboard/technician/requests");
  const [bookings, setBookings] = useState<TechnicianBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal for Mark Completed
  const [completeModalTarget, setCompleteModalTarget] =
    useState<TechnicianBooking | null>(null);
  const [customFinalAmount, setCustomFinalAmount] = useState<number>(0);

  // Modal for Reject
  const [rejectModalTarget, setRejectModalTarget] =
    useState<TechnicianBooking | null>(null);

  useEffect(() => {
    if (!user) return;

    let isActive = true;
    setIsLoading(true);

    const loadBookings = async () => {
      try {
        const response = await api.get<TechnicianBooking[]>(
          "/api/bookings/technician",
          { cache: "no-store" },
        );
        if (isActive) setBookings(Array.isArray(response) ? response : []);
      } catch (error) {
        if (isActive) {
          toast.error(
            error instanceof Error ? error.message : "Failed to load requests.",
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadBookings();
    return () => {
      isActive = false;
    };
  }, [user]);

  const updateBookingStatus = async (
    bookingId: string,
    newStatus: string,
    extraData?: { finalAmount?: number },
  ) => {
    setProcessingId(bookingId);
    try {
      const updated = await api.patch<TechnicianBooking>(
        `/api/bookings/${bookingId}/status`,
        { status: newStatus, ...extraData },
      );

      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, ...updated } : b)),
      );

      toast.success(`Job status updated to "${newStatus}"!`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update status.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenCompleteModal = (booking: TechnicianBooking) => {
    setCompleteModalTarget(booking);
    setCustomFinalAmount(booking.finalAmount || booking.basePrice || 0);
  };

  const handleConfirmCompletion = async () => {
    if (!completeModalTarget) return;
    if (customFinalAmount <= 0) {
      toast.error("Final amount must be greater than 0.");
      return;
    }

    await updateBookingStatus(completeModalTarget._id, "completed", {
      finalAmount: customFinalAmount,
    });
    setCompleteModalTarget(null);
  };

  const handleConfirmReject = async () => {
    if (!rejectModalTarget) return;
    await updateBookingStatus(rejectModalTarget._id, "rejected");
    setRejectModalTarget(null);
  };

  if (!user) {
    return (
      <main className="px-4 py-12" role="status">
        <p className="text-sm text-muted-foreground">Checking technician account...</p>
      </main>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.problem || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      statusFilter === "all" || b.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const formatDate = (val?: string) => {
    if (!val) return "—";
    const date = new Date(val);
    return Number.isNaN(date.getTime())
      ? val
      : date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  return (
    <DashboardLayout role="technician" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Manage Incoming Requests
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Advance repair jobs along the pipeline: Requested → Accepted → In Progress → Completed.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by customer name, phone, or problem description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex rounded-lg border border-border bg-background p-1 text-xs">
              {["all", "requested", "accepted", "in-progress", "completed"].map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusFilter(tab)}
                    className={cn(
                      "rounded-md px-2.5 py-1 font-medium capitalize whitespace-nowrap transition",
                      statusFilter === tab
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab === "in-progress" ? "In Progress" : tab}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Bookings / Requests Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading incoming jobs...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-semibold text-foreground">No requests found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                You do not have any requests matching your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3.5">Customer & Contact</th>
                    <th className="px-6 py-3.5">Service & Issue</th>
                    <th className="px-6 py-3.5">Schedule</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5 text-right">Pipeline Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-muted/20">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground">
                          {b.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {b.customerEmail}
                        </p>
                        {b.phone && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" /> {b.phone}
                          </p>
                        )}
                        {b.address && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" /> {b.address}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 max-w-xs">
                        <span className="font-medium text-foreground">
                          {b.serviceTitle}
                        </span>
                        <p className="mt-1 line-clamp-2 text-xs italic text-muted-foreground bg-muted/40 rounded p-1.5">
                          &quot;{b.problem || "No description provided."}&quot;
                        </p>
                      </td>

                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {formatDate(b.preferredDate || b.createdAt)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                            STATUS_STYLES[b.status.toLowerCase()] ?? "bg-gray-100 text-gray-700",
                          )}
                        >
                          {b.status === "in-progress" ? "In Progress" : b.status}
                        </span>
                        {b.status === "completed" && (
                          <span
                            className={cn(
                              "block mt-1 text-[10px] font-bold uppercase",
                              b.paymentStatus === "paid"
                                ? "text-emerald-600"
                                : "text-amber-600",
                            )}
                          >
                            {b.paymentStatus}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-semibold text-foreground">
                        ${b.finalAmount || b.basePrice}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {/* Status Pipeline Buttons */}
                        {b.status === "requested" && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                              disabled={processingId === b._id}
                              onClick={() => updateBookingStatus(b._id, "accepted")}
                            >
                              <Check className="h-3.5 w-3.5" /> Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 gap-1"
                              disabled={processingId === b._id}
                              onClick={() => setRejectModalTarget(b)}
                            >
                              <X className="h-3.5 w-3.5" /> Reject
                            </Button>
                          </div>
                        )}

                        {b.status === "accepted" && (
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white gap-1"
                            disabled={processingId === b._id}
                            onClick={() => updateBookingStatus(b._id, "in-progress")}
                          >
                            <Play className="h-3.5 w-3.5" /> Start Work
                          </Button>
                        )}

                        {b.status === "in-progress" && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            disabled={processingId === b._id}
                            onClick={() => handleOpenCompleteModal(b)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Completed
                          </Button>
                        )}

                        {(b.status === "completed" ||
                          b.status === "rejected" ||
                          b.status === "cancelled") && (
                          <span className="text-xs text-muted-foreground italic">
                            No further actions
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Completion Modal: Enter Final Amount */}
      {completeModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground">
              Complete Repair Job
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Please enter the final billable amount for this job. Once marked completed, the customer will receive the Pay Now button to pay via Stripe.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Service
                </label>
                <p className="font-semibold text-foreground">
                  {completeModalTarget.serviceTitle}
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Customer
                </label>
                <p className="text-sm text-foreground">
                  {completeModalTarget.customerName} ({completeModalTarget.customerEmail})
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Final Amount (USD) *
                </label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={customFinalAmount}
                    onChange={(e) => setCustomFinalAmount(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background py-2 pl-7 pr-3 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Base estimate was ${completeModalTarget.basePrice}. You may adjust for replacement parts.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompleteModalTarget(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={processingId === completeModalTarget._id}
                onClick={handleConfirmCompletion}
              >
                Confirm & Complete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-foreground">
              Reject Request?
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Are you sure you want to decline this repair request from{" "}
              <strong className="text-foreground">{rejectModalTarget.customerName}</strong>? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectModalTarget(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={processingId === rejectModalTarget._id}
                onClick={handleConfirmReject}
              >
                Yes, Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
