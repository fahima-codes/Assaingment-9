"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness, CheckCircle2, ClipboardList } from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardStatCard } from "@/components/dashboard-stat-card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useTechnicianSession } from "@/lib/use-technician-session";

interface TechnicianStats {
  totalServices: number;
  approvedServices: number;
  pendingRequests: number;
}

export function TechnicianDashboard() {
  const user = useTechnicianSession("/dashboard/technician");
  const [stats, setStats] = useState<TechnicianStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user) return;

    let isActive = true;
    setIsLoading(true);
    setLoadError("");

    const loadStats = async () => {
      try {
        const response = await api.get<TechnicianStats>(
          "/api/technician/dashboard",
          { cache: "no-store" },
        );
        if (isActive) setStats(response);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not load dashboard stats.";
        if (isActive) {
          setLoadError(message);
          toast.error(message);
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadStats();
    return () => {
      isActive = false;
    };
  }, [reloadKey, user]);

  if (!user) {
    return (
      <main className="px-4 py-12" role="status">
        <p className="text-sm text-muted-foreground">Checking your account...</p>
      </main>
    );
  }

  const statValue = (value: number | undefined) =>
    isLoading ? "..." : value === undefined ? "—" : String(value);

  return (
    <DashboardLayout role="technician" user={user}>
      <div className="space-y-8">
        <section>
          <p className="text-sm font-semibold text-primary">Technician workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Welcome, {user.name?.trim() || user.email || "Technician"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your services and keep track of incoming repair requests.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard/technician/add-service">Add a Service</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/technician/my-services">Manage Services</Link>
            </Button>
          </div>
        </section>

        <section
          aria-label="Technician service stats"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <DashboardStatCard
            icon={BriefcaseBusiness}
            label="Total Services"
            value={statValue(stats?.totalServices)}
            description="Services you have added to FixMate."
          />
          <DashboardStatCard
            icon={CheckCircle2}
            label="Approved Services"
            value={statValue(stats?.approvedServices)}
            description="Services currently approved by an administrator."
          />
          <DashboardStatCard
            icon={ClipboardList}
            label="Pending Requests"
            value={statValue(stats?.pendingRequests)}
            description="Customer repair requests waiting for your response."
          />
        </section>

        {loadError ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{loadError}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try Again
            </Button>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
