"use client";

import {
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CheckCircle2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardStatCard } from "@/components/dashboard-stat-card";
import { api } from "@/lib/api";
import {
  getAuthToken,
  getAuthUser,
  getDashboardPath,
  isAuthRole,
  type AuthRole,
  type AuthUser,
} from "@/lib/auth-session";

const ROLE_LABELS: Record<AuthRole, string> = {
  customer: "Customer",
  technician: "Technician",
  admin: "Admin",
};

interface ProtectedDashboardProps {
  role: AuthRole;
}

interface CustomerBookingSummary {
  status?: string;
}

export function ProtectedDashboard({ role }: ProtectedDashboardProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [customerBookings, setCustomerBookings] = useState<
    CustomerBookingSummary[] | null
  >(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    const currentUser = getAuthUser();
    if (!token || !currentUser) {
      router.replace(
        `/sign-in?redirect=${encodeURIComponent(getDashboardPath(role))}`,
      );
      return;
    }

    const userRole = isAuthRole(currentUser.role) ? currentUser.role : "customer";
    if (userRole !== role) {
      router.replace(getDashboardPath(userRole));
      return;
    }

    setUser(currentUser);
    setIsAuthorized(true);
  }, [role, router]);

  useEffect(() => {
    if (!isAuthorized || role !== "customer") return;

    let isActive = true;
    setIsLoadingBookings(true);

    const loadBookings = async () => {
      try {
        const response = await api.get<
          CustomerBookingSummary[] | { bookings?: CustomerBookingSummary[] }
        >("/api/bookings/my", { cache: "no-store" });
        const bookings = Array.isArray(response)
          ? response
          : (response?.bookings ?? []);
        if (isActive) setCustomerBookings(bookings);
      } catch (error) {
        if (isActive) {
          toast.error(
            error instanceof Error ? error.message : "Could not load booking stats.",
          );
        }
      } finally {
        if (isActive) setIsLoadingBookings(false);
      }
    };

    void loadBookings();
    return () => {
      isActive = false;
    };
  }, [isAuthorized, role]);

  if (!isAuthorized || !user) {
    return (
      <main className="px-4 py-12" role="status">
        <p className="text-sm text-muted-foreground">Checking your account...</p>
      </main>
    );
  }

  const profileFields = [
    user.name,
    user.email,
    user.phone,
    user.area,
    user.bio,
    user.image,
  ];
  const profileCompletion = Math.round(
    (profileFields.filter((field) => Boolean(field?.trim())).length /
      profileFields.length) *
      100,
  );

  return (
    <DashboardLayout role={role} user={user}>
      <div className="space-y-8">
        <section>
          <p className="text-sm font-semibold text-primary">
            {ROLE_LABELS[role]} dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Welcome, {user.name?.trim() || user.email || "there"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Here&apos;s a quick overview of your FixMate account.
          </p>
        </section>

        {role === "customer" ? (
          <section
            aria-label="Customer booking stats"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <DashboardStatCard
              icon={CalendarDays}
              label="Total Requests"
              value={
                isLoadingBookings
                  ? "..."
                  : customerBookings
                    ? String(customerBookings.length)
                    : "—"
              }
              description="All repair requests in your account."
            />
            <DashboardStatCard
              icon={BriefcaseBusiness}
              label="Active Jobs"
              value={
                isLoadingBookings
                  ? "..."
                  : customerBookings
                    ? String(
                        customerBookings.filter(
                          (booking) =>
                            booking.status === "accepted" ||
                            booking.status === "in-progress",
                        ).length,
                      )
                    : "—"
              }
              description="Requests accepted or currently in progress."
            />
            <DashboardStatCard
              icon={CheckCircle2}
              label="Completed Jobs"
              value={
                isLoadingBookings
                  ? "..."
                  : customerBookings
                    ? String(
                        customerBookings.filter(
                          (booking) => booking.status === "completed",
                        ).length,
                      )
                    : "—"
              }
              description="Repairs completed by your technicians."
            />
          </section>
        ) : (
          <section
            aria-label="Account stats"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <DashboardStatCard
              icon={ShieldCheck}
              label="Account Role"
              value={ROLE_LABELS[role]}
              description="Your FixMate access level."
            />
            <DashboardStatCard
              icon={UserRound}
              label="Profile Completion"
              value={`${profileCompletion}%`}
              description="Add profile details to help others recognize you."
            />
            <DashboardStatCard
              icon={Camera}
              label="Profile Photo"
              value={user.image ? "Added" : "Not added"}
              description="A profile photo makes your account easier to recognize."
            />
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
