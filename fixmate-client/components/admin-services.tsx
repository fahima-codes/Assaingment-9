"use client";

import { useEffect, useState } from "react";
import { Check, X, ShieldAlert, Filter, Wrench, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAdminSession } from "@/lib/use-admin-session";
import { cn } from "@/lib/utils";

interface ServiceApprovalItem {
  _id: string;
  title: string;
  category: string;
  price: number;
  duration?: string;
  serviceMode?: string;
  serviceImage?: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: "pending" | "approved" | "rejected";
  isAvailable: boolean;
  createdAt?: string;
}

export function AdminServices() {
  const user = useAdminSession("/dashboard/admin/services");
  const [services, setServices] = useState<ServiceApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let isActive = true;
    setIsLoading(true);

    const loadServices = async () => {
      try {
        const response = await api.get<{ services?: ServiceApprovalItem[] }>(
          "/api/admin/services",
          { cache: "no-store" },
        );
        if (isActive) {
          setServices(response?.services ?? []);
        }
      } catch (error) {
        if (isActive) {
          toast.error(
            error instanceof Error ? error.message : "Failed to load services.",
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadServices();
    return () => {
      isActive = false;
    };
  }, [user]);

  const handleUpdateApproval = async (
    serviceId: string,
    newStatus: "approved" | "rejected",
  ) => {
    setProcessingId(serviceId);
    try {
      await api.patch(`/api/admin/services/${serviceId}/approval`, {
        approvalStatus: newStatus,
      });

      setServices((prev) =>
        prev.map((s) =>
          s._id === serviceId ? { ...s, approvalStatus: newStatus } : s,
        ),
      );

      toast.success(
        newStatus === "approved"
          ? "Service approved and published to catalog!"
          : "Service rejected.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update service status.",
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

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.technicianEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      statusFilter === "all" || s.approvalStatus === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  return (
    <DashboardLayout role="admin" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Service Approvals
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and moderate repair listings provided by platform technicians.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by service title, category, technician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex rounded-lg border border-border bg-background p-1 text-xs">
              {["all", "pending", "approved", "rejected"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={cn(
                    "rounded-md px-3 py-1 font-medium capitalize transition",
                    statusFilter === tab
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab === "pending"
                    ? `Pending (${services.filter((s) => s.approvalStatus === "pending").length})`
                    : tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading service catalog...
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="p-12 text-center">
              <Wrench className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-semibold text-foreground">No services found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No listings matched your criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3.5">Service Details</th>
                    <th className="px-6 py-3.5">Technician</th>
                    <th className="px-6 py-3.5">Pricing & Mode</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredServices.map((service) => (
                    <tr key={service._id} className="hover:bg-muted/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={service.serviceImage || "/hero-repair.svg"}
                            alt={service.title}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div>
                            <span className="font-semibold text-foreground">
                              {service.title}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {service.category} • {service.duration || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">
                          {service.technicianName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {service.technicianEmail}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground">
                          ${service.price}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {service.serviceMode || "On-site"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
                            getStatusBadge(service.approvalStatus),
                          )}
                        >
                          {service.approvalStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {service.approvalStatus !== "approved" && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                              disabled={processingId === service._id}
                              onClick={() =>
                                handleUpdateApproval(service._id, "approved")
                              }
                            >
                              <Check className="h-3.5 w-3.5" /> Approve
                            </Button>
                          )}
                          {service.approvalStatus !== "rejected" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50 gap-1"
                              disabled={processingId === service._id}
                              onClick={() =>
                                handleUpdateApproval(service._id, "rejected")
                              }
                            >
                              <X className="h-3.5 w-3.5" /> Reject
                            </Button>
                          )}
                        </div>
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
