"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard-layout";
import { TechnicianServiceForm } from "@/components/technician-service-form";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { type Service } from "@/lib/services";
import { useTechnicianSession } from "@/lib/use-technician-session";

interface MyServicesResponse {
  services?: Service[];
}

const APPROVAL_STYLES: Record<string, string> = {
  approved: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  rejected: "bg-red-100 text-red-800",
};

function formatApprovalStatus(status?: string) {
  if (!status) return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatPrice(price?: number) {
  if (typeof price !== "number") return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function TechnicianMyServices() {
  const user = useTechnicianSession("/dashboard/technician/my-services");
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [busyServiceId, setBusyServiceId] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await api.get<MyServicesResponse>("/api/services/my", {
        cache: "no-store",
      });
      setServices(response.services ?? []);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load your services.";
      setLoadError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadServices();
  }, [loadServices, reloadKey]);

  const handleAvailabilityChange = async (service: Service) => {
    setBusyServiceId(service._id);
    try {
      const updatedService = await api.patch<Service>(
        `/api/services/${service._id}/availability`,
      );
      setServices((current) =>
        current.map((item) =>
          item._id === service._id ? { ...item, ...updatedService } : item,
        ),
      );
      toast.success(
        updatedService.isAvailable
          ? "Service is now available."
          : "Service is now unavailable.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update service availability.",
      );
    } finally {
      setBusyServiceId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setBusyServiceId(deleteTarget._id);
    try {
      await api.delete(`/api/services/${deleteTarget._id}`);
      setServices((current) =>
        current.filter((service) => service._id !== deleteTarget._id),
      );
      setDeleteTarget(null);
      toast.success("Service deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete this service.",
      );
    } finally {
      setBusyServiceId(null);
    }
  };

  if (!user) {
    return (
      <main className="px-4 py-12" role="status">
        <p className="text-sm text-muted-foreground">Checking your account...</p>
      </main>
    );
  }

  return (
    <DashboardLayout role="technician" user={user}>
      <div className="space-y-8">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Technician workspace</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              My Services
            </h1>
            <p className="mt-2 text-muted-foreground">
              Review approval status and manage your service listings.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/technician/add-service">
              <Plus aria-hidden="true" />
              Add Service
            </Link>
          </Button>
        </section>

        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center" role="status">
            <p className="text-sm text-muted-foreground">Loading your services...</p>
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="font-medium text-foreground">
              We couldn&apos;t load your services.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-5"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try Again
            </Button>
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <h2 className="text-xl font-semibold text-foreground">
              No services yet
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Add your first service to submit it for administrator approval.
            </p>
            <Button asChild className="mt-6">
              <Link href="/dashboard/technician/add-service">Add a Service</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-border bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-4">Image</th>
                  <th scope="col" className="px-5 py-4">Title</th>
                  <th scope="col" className="px-5 py-4">Category</th>
                  <th scope="col" className="px-5 py-4">Price</th>
                  <th scope="col" className="px-5 py-4">Approval</th>
                  <th scope="col" className="px-5 py-4">Available</th>
                  <th scope="col" className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {services.map((service) => {
                  const status = service.approvalStatus?.toLowerCase() ?? "pending";
                  const isBusy = busyServiceId === service._id;
                  return (
                    <tr key={service._id}>
                      <td className="px-5 py-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={service.serviceImage || "/hero-repair.svg"}
                          alt=""
                          className="h-14 w-16 rounded-md object-cover"
                        />
                      </td>
                      <td className="max-w-64 px-5 py-4 font-medium text-foreground">
                        {service.title}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {service.category || "—"}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {formatPrice(service.price)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            APPROVAL_STYLES[status] ?? "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-200"
                          }`}
                        >
                          {formatApprovalStatus(status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            role="switch"
                            checked={Boolean(service.isAvailable)}
                            disabled={isBusy}
                            onChange={() => void handleAvailabilityChange(service)}
                            aria-label={`Make ${service.title} ${
                              service.isAvailable ? "unavailable" : "available"
                            }`}
                            className="h-4 w-4 accent-primary"
                          />
                          <span className="text-xs text-muted-foreground">
                            {service.isAvailable ? "On" : "Off"}
                          </span>
                        </label>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => setEditTarget(service)}
                            aria-label={`Edit ${service.title}`}
                          >
                            <Pencil aria-hidden="true" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={isBusy}
                            onClick={() => setDeleteTarget(service)}
                            aria-label={`Delete ${service.title}`}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-service-title"
            className="max-h-full w-full max-w-3xl overflow-y-auto rounded-xl bg-card p-6 shadow-xl"
          >
            <h2
              id="edit-service-title"
              className="mb-5 text-xl font-semibold text-foreground"
            >
              Edit Service
            </h2>
            <TechnicianServiceForm
              key={editTarget._id}
              user={user}
              service={editTarget}
              onCancel={() => setEditTarget(null)}
              onSaved={(savedService) => {
                if (savedService) {
                  setServices((current) =>
                    current.map((service) =>
                      service._id === savedService._id
                        ? { ...service, ...savedService }
                        : service,
                    ),
                  );
                }
                setEditTarget(null);
              }}
            />
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-service-title"
            aria-describedby="delete-service-description"
            className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl"
          >
            <h2
              id="delete-service-title"
              className="text-lg font-semibold text-foreground"
            >
              Delete this service?
            </h2>
            <p
              id="delete-service-description"
              className="mt-2 text-sm text-muted-foreground"
            >
              {deleteTarget.title} will be permanently removed. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={busyServiceId === deleteTarget._id}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={busyServiceId === deleteTarget._id}
                onClick={() => void handleDelete()}
              >
                {busyServiceId === deleteTarget._id ? "Deleting..." : "Delete Service"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
