"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Filter, Search, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard-layout";
import { api } from "@/lib/api";
import { useAdminSession } from "@/lib/use-admin-session";
import { cn } from "@/lib/utils";

interface PlatformBooking {
  _id: string;
  serviceTitle: string;
  serviceImage?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address?: string;
  technicianName: string;
  technicianEmail: string;
  preferredDate?: string;
  status: string;
  paymentStatus: string;
  basePrice: number;
  finalAmount: number;
  createdAt?: string;
}

const STATUS_STYLES: Record<string, string> = {
  requested: "bg-blue-100 text-blue-800 border-blue-200",
  accepted: "bg-indigo-100 text-indigo-800 border-indigo-200",
  "in-progress": "bg-amber-100 text-amber-800 border-amber-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700",
};

export function AdminBookings() {
  const user = useAdminSession("/dashboard/admin/bookings");
  const [bookings, setBookings] = useState<PlatformBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;

    let isActive = true;
    setIsLoading(true);

    const loadBookings = async () => {
      try {
        const response = await api.get<PlatformBooking[]>("/api/admin/bookings", {
          cache: "no-store",
        });
        if (isActive) setBookings(Array.isArray(response) ? response : []);
      } catch (error) {
        if (isActive) {
          toast.error(
            error instanceof Error ? error.message : "Failed to load bookings.",
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

  if (!user) {
    return (
      <main className="px-4 py-12" role="status">
        <p className="text-sm text-muted-foreground">Checking admin privileges...</p>
      </main>
    );
  }

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.technicianEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.customerName || "").toLowerCase().includes(searchTerm.toLowerCase());
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
    <DashboardLayout role="admin" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            All Repair Bookings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete platform-wide registry of repair orders, job statuses, and payment milestones.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by customer, technician, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex rounded-lg border border-border bg-background p-1 text-xs">
              {[
                "all",
                "requested",
                "accepted",
                "in-progress",
                "completed",
                "cancelled",
              ].map((tab) => (
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
              ))}
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading booking records...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-semibold text-foreground">No bookings found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No orders match your filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3.5">Service</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Technician</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Job Status</th>
                    <th className="px-6 py-3.5">Payment</th>
                    <th className="px-6 py-3.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-muted/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={b.serviceImage || "/hero-repair.svg"}
                            alt={b.serviceTitle}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-semibold text-foreground">
                              {b.serviceTitle}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              ID: {b._id.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{b.customerName}</p>
                        <p className="text-xs text-muted-foreground">{b.customerEmail}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{b.technicianName}</p>
                        <p className="text-xs text-muted-foreground">{b.technicianEmail}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {formatDate(b.preferredDate || b.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                            STATUS_STYLES[b.status.toLowerCase()] ?? "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-200",
                          )}
                        >
                          {b.status === "in-progress" ? "In Progress" : b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                            b.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800",
                          )}
                        >
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-foreground">
                        ${b.finalAmount || b.basePrice}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
