"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      {isAuthorized && user ? (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium text-primary">
            {ROLE_LABELS[role]} dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Welcome, {user.name?.trim() || user.email || "there"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your FixMate account dashboard.
          </p>
          <Link
            href="/profile"
            className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Update Profile
          </Link>
        </section>
      ) : (
        <p className="text-sm text-muted-foreground" role="status">
          Checking your account...
        </p>
      )}
    </main>
  );
}
