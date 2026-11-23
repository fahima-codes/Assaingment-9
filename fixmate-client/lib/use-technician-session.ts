"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getAuthToken,
  getAuthUser,
  getDashboardPath,
  isAuthRole,
  type AuthUser,
} from "@/lib/auth-session";

export function useTechnicianSession(redirectPath: string) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    const currentUser = getAuthUser();
    if (!token || !currentUser) {
      router.replace(
        `/sign-in?redirect=${encodeURIComponent(redirectPath)}`,
      );
      return;
    }

    const role = isAuthRole(currentUser.role) ? currentUser.role : "customer";
    if (role !== "technician") {
      router.replace(getDashboardPath(role));
      return;
    }

    setUser(currentUser);
  }, [redirectPath, router]);

  return user;
}
