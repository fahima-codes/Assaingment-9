"use client";

import { Camera, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardStatCard } from "@/components/dashboard-stat-card";
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

export function ProtectedDashboard({ role }: ProtectedDashboardProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

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
      </div>
    </DashboardLayout>
  );
}
