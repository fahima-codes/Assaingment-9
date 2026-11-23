"use client";

import { useEffect, useState } from "react";
import { Search, Shield, User, Wrench, ShieldCheck, Filter } from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAdminSession } from "@/lib/use-admin-session";
import { cn } from "@/lib/utils";

interface PlatformUser {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "technician" | "admin";
  phone?: string;
  area?: string;
  image?: string;
  createdAt?: string;
}

export function AdminUsers() {
  const user = useAdminSession("/dashboard/admin/users");
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let isActive = true;
    setIsLoading(true);

    const loadUsers = async () => {
      try {
        const response = await api.get<PlatformUser[]>("/api/admin/users", {
          cache: "no-store",
        });
        if (isActive) setUsers(Array.isArray(response) ? response : []);
      } catch (error) {
        if (isActive) {
          toast.error(
            error instanceof Error ? error.message : "Could not load user accounts.",
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadUsers();
    return () => {
      isActive = false;
    };
  }, [user]);

  const handleRoleChange = async (userId: string, targetEmail: string, newRole: string) => {
    if (user?.email?.toLowerCase() === targetEmail.toLowerCase()) {
      toast.error("Security Rule: You cannot change your own admin role.");
      return;
    }

    setUpdatingId(userId);
    try {
      const updatedUser = await api.patch<PlatformUser>(
        `/api/admin/users/${userId}/role`,
        { role: newRole },
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: updatedUser.role } : u)),
      );
      toast.success(`Role for ${targetEmail} updated to ${newRole}.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update user role.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user) {
    return (
      <main className="px-4 py-12" role="status">
        <p className="text-sm text-muted-foreground">Checking admin privileges...</p>
      </main>
    );
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "technician":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "customer":
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
  };

  return (
    <DashboardLayout role="admin" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Manage Users
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View all registered FixMate customers, technicians, and administrators. Promote or assign roles.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex rounded-lg border border-border bg-background p-1 text-xs">
              {["all", "customer", "technician", "admin"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRoleFilter(tab)}
                  className={cn(
                    "rounded-md px-3 py-1 font-medium capitalize transition",
                    roleFilter === tab
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab === "all" ? "All Users" : `${tab}s`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading users directory...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <User className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-semibold text-foreground">No users found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No accounts matched your search or role filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Contact / Area</th>
                    <th className="px-6 py-3.5">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u) => {
                    const isSelf = user.email?.toLowerCase() === u.email.toLowerCase();
                    return (
                      <tr key={u._id} className="hover:bg-muted/20">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                u.image ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                  u.name || u.email,
                                )}`
                              }
                              alt={u.name}
                              className="h-10 w-10 rounded-full border border-border object-cover"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">
                                  {u.name || "FixMate Member"}
                                </span>
                                {isSelf && (
                                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                              getRoleBadge(u.role),
                            )}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-foreground">
                            {u.phone || "No phone registered"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {u.area || "Area not provided"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {isSelf ? (
                            <span className="text-xs italic text-muted-foreground">
                              Locked (Current Admin)
                            </span>
                          ) : (
                            <select
                              aria-label={`Change role for ${u.name || u.email}`}
                              value={u.role}
                              disabled={updatingId === u._id}
                              onChange={(e) =>
                                handleRoleChange(u._id, u.email, e.target.value)
                              }
                              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="customer">Customer</option>
                              <option value="technician">Technician</option>
                              <option value="admin">Admin</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
