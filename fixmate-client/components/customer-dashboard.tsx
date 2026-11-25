"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  BriefcaseBusiness,
  CheckCircle2,
  CreditCard,
  Search,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardStatCard } from "@/components/dashboard-stat-card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useCustomerSession } from "@/lib/use-customer-session";
import { cn } from "@/lib/utils";

interface CustomerBooking {
  _id: string;
  serviceTitle: string;
  serviceImage?: string;
  category?: string;
  technicianName?: string;
  preferredDate?: string;
  basePrice?: number;
  finalAmount?: number;
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
  cancelled: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700",
};

export function CustomerDashboard() {
  const user = useCustomerSession("/dashboard/customer");
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let isActive = true;
    setIsLoading(true);

    const loadBookings = async () => {
      try {
        const response = await api.get<CustomerBooking[]>("/api/bookings/my", {
          cache: "no-store",
        });
        if (isActive) setBookings(Array.isArray(response) ? response : []);
      } catch (error) {
        if (isActive) {
          toast.error(
            error instanceof Error ? error.message : "Could not load booking history.",
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
        <p className="text-sm text-muted-foreground">Checking your account...</p>
      </main>
    );
  }

  const totalRequests = bookings.length;
  const activeJobs = bookings.filter(
    (b) =>
      b.status === "requested" ||
      b.status === "accepted" ||
      b.status === "in-progress",
  ).length;
  const completedJobs = bookings.filter((b) => b.status === "completed").length;
  const totalSpent = bookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (b.finalAmount || b.basePrice || 0), 0);

  const recentBookings = bookings.slice(0, 3);

  return (
    <DashboardLayout role="customer" user={user}>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-6 text-white shadow-md sm:p-8">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Customer Portal
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Hello, {user.name?.trim() || "Customer"} 👋
            </h1>
            <p className="mt-2 text-sm text-white/90 sm:text-base">
              Track your device and appliance repairs step by step. Remember, on FixMate you only pay after the job is completely done!
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-white text-primary hover:bg-white/90 shadow-sm font-semibold dark:bg-zinc-900 dark:text-orange-400 dark:hover:bg-zinc-800"
              >
                <Link href="/services">
                  <Search className="mr-2 h-4 w-4" /> Book a Repair
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/dashboard/customer/bookings">My Bookings</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section
          aria-label="Customer booking summary"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <DashboardStatCard
            icon={CalendarDays}
            label="Total Requests"
            value={isLoading ? "..." : String(totalRequests)}
            description="All orders placed with FixMate"
          />
          <DashboardStatCard
            icon={Clock}
            label="Active Jobs"
            value={isLoading ? "..." : String(activeJobs)}
            description="Requested, accepted, or in progress"
          />
          <DashboardStatCard
            icon={CheckCircle2}
            label="Completed Jobs"
            value={isLoading ? "..." : String(completedJobs)}
            description="Repairs finished by technicians"
          />
          <DashboardStatCard
            icon={CreditCard}
            label="Total Spent"
            value={
              isLoading
                ? "..."
                : `$${totalSpent}`
            }
            description="Paid securely through Stripe"
          />
        </section>

        {/* Recent Bookings & Escrow Trust */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Bookings (2 cols) */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Recent Repair Requests
                </h2>
                <p className="text-xs text-muted-foreground">
                  Live status of your latest repair bookings.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/customer/bookings">View All</Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading your repair status...
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="py-12 text-center">
                <BriefcaseBusiness className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 font-semibold text-foreground">
                  No repair requests yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Browse our verified technicians to fix your devices or home appliances.
                </p>
                <Button asChild className="mt-4" size="sm">
                  <Link href="/services">Find a Service</Link>
                </Button>
              </div>
            ) : (
              <div className="mt-4 divide-y divide-border">
                {recentBookings.map((b) => (
                  <div
                    key={b._id}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.serviceImage || "/hero-repair.svg"}
                        alt={b.serviceTitle}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {b.serviceTitle}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Technician: <span className="font-medium text-foreground">{b.technicianName}</span> • Amount: <span className="font-medium text-foreground">${b.finalAmount || b.basePrice}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                          STATUS_STYLES[b.status.toLowerCase()] ?? "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-200",
                        )}
                      >
                        {b.status === "in-progress" ? "In Progress" : b.status}
                      </span>

                      {b.status === "completed" && b.paymentStatus === "unpaid" ? (
                        <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                          <Link href="/dashboard/customer/bookings">Pay Now</Link>
                        </Button>
                      ) : (
                        <Button asChild variant="outline" size="sm">
                          <Link href="/dashboard/customer/bookings">Details</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* FixMate Trust Card */}
          <section className="flex flex-col justify-between rounded-xl border border-primary/20 bg-primary/5 p-6">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">
                FixMate Customer Guarantee
              </h3>
              <ul className="mt-4 space-y-3 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Pay After Service:</strong> Never pay before the work is done. You pay only after inspecting the repair.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Verified Technicians:</strong> Every technician is vetted and approved by our admin team.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    <strong className="text-foreground">Secure Payments:</strong> Powered by Stripe with instant receipts and refund protection.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <Link
                href="/services"
                className="flex items-center justify-between text-xs font-semibold text-primary hover:underline"
              >
                <span>Browse Approved Services</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
