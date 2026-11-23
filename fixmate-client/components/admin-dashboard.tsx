"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  Users,
  Wrench,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardStatCard } from "@/components/dashboard-stat-card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAdminSession } from "@/lib/use-admin-session";

interface AdminDashboardStats {
  totalUsers: number;
  totalTechnicians: number;
  totalCustomers: number;
  pendingServices: number;
  approvedServices: number;
  totalBookings: number;
  totalRevenue: number;
}

interface PendingServiceSummary {
  _id: string;
  title: string;
  category: string;
  price: number;
  technicianName: string;
  technicianEmail: string;
  createdAt: string;
}

export function AdminDashboard() {
  const user = useAdminSession("/dashboard/admin");
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [pendingServices, setPendingServices] = useState<PendingServiceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let isActive = true;
    setIsLoading(true);
    setLoadError("");

    const loadData = async () => {
      try {
        const [statsData, servicesData] = await Promise.all([
          api.get<AdminDashboardStats>("/api/admin/dashboard", { cache: "no-store" }),
          api.get<{ services?: PendingServiceSummary[] }>("/api/admin/services?status=pending", {
            cache: "no-store",
          }),
        ]);

        if (isActive) {
          setStats(statsData);
          setPendingServices(servicesData?.services ?? []);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not load admin metrics.";
        if (isActive) {
          setLoadError(message);
          toast.error(message);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadData();
    return () => {
      isActive = false;
    };
  }, [user]);

  const handleApproval = async (id: string, status: "approved" | "rejected") => {
    setProcessingId(id);
    try {
      await api.patch(`/api/admin/services/${id}/approval`, { approvalStatus: status });
      setPendingServices((prev) => prev.filter((s) => s._id !== id));
      if (stats) {
        setStats({
          ...stats,
          pendingServices: Math.max(0, stats.pendingServices - 1),
          approvedServices:
            status === "approved" ? stats.approvedServices + 1 : stats.approvedServices,
        });
      }
      toast.success(
        status === "approved"
          ? "Service approved and published."
          : "Service rejected.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update service status.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (!user) {
    return (
      <main className="px-4 py-12" role="status">
        <p className="text-sm text-muted-foreground">Checking admin privileges...</p>
      </main>
    );
  }

  const formatCurrency = (amount?: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount ?? 0);

  return (
    <DashboardLayout role="admin" user={user}>
      <div className="space-y-8">
        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              FixMate Control Center
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              Administrator Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time monitoring of users, service approvals, active repair jobs, and platform revenue.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button asChild variant="outline">
              <Link href="/dashboard/admin/services">Moderate Services</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/admin/users">Manage Users</Link>
            </Button>
          </div>
        </section>

        {/* Top Highlight Stats */}
        <section
          aria-label="Platform key metrics"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <DashboardStatCard
            icon={Users}
            label="Total Platform Users"
            value={isLoading ? "..." : String(stats?.totalUsers ?? 0)}
            description={`${stats?.totalTechnicians ?? 0} Technicians, ${stats?.totalCustomers ?? 0} Customers`}
          />
          <DashboardStatCard
            icon={Wrench}
            label="Approved Services"
            value={isLoading ? "..." : String(stats?.approvedServices ?? 0)}
            description="Active in public service catalog"
          />
          <DashboardStatCard
            icon={Clock}
            label="Pending Approvals"
            value={isLoading ? "..." : String(stats?.pendingServices ?? 0)}
            description={
              (stats?.pendingServices ?? 0) > 0
                ? "Requires moderation attention"
                : "All submissions reviewed"
            }
          />
          <DashboardStatCard
            icon={DollarSign}
            label="Total Stripe Revenue"
            value={isLoading ? "..." : formatCurrency(stats?.totalRevenue)}
            description={`${stats?.totalBookings ?? 0} total bookings created`}
          />
        </section>

        {/* Quick Action Hub */}
        <section className="grid gap-5 md:grid-cols-3">
          <Link
            href="/dashboard/admin/services"
            className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/50 hover:shadow-md"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary">
                Service Moderation
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Review newly added technician services, inspect prices and coverages, and approve or reject them.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
              View Moderation Queue <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            href="/dashboard/admin/users"
            className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/50 hover:shadow-md"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary">
                User & Role Management
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Inspect registered customer and technician profiles. Update roles and verify accounts.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
              Manage Platform Users <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>

          <Link
            href="/dashboard/admin/transactions"
            className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/50 hover:shadow-md"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary">
                Stripe Transactions
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Track payments after service completion, verify payment intents, and review total payout volumes.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
              View Financial Records <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Link>
        </section>

        {/* Pending Services Attention Queue */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Pending Service Approvals
              </h2>
              <p className="text-xs text-muted-foreground">
                Services submitted by technicians waiting for admin review before going live.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/admin/services">View All Services</Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading pending items...
            </div>
          ) : pendingServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="mt-3 font-semibold text-foreground">All Caught Up!</p>
              <p className="mt-1 text-xs text-muted-foreground">
                There are currently no technician services pending admin approval.
              </p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-border">
              {pendingServices.map((service) => (
                <div
                  key={service._id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-foreground">{service.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      Category: <span className="font-medium text-foreground">{service.category}</span> • Starting Price: <span className="font-medium text-foreground">${service.price}</span> • By {service.technicianName} ({service.technicianEmail})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={processingId === service._id}
                      onClick={() => handleApproval(service._id, "approved")}
                    >
                      {processingId === service._id ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      disabled={processingId === service._id}
                      onClick={() => handleApproval(service._id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
