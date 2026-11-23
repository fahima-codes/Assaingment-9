"use client";

import { useRouter } from "next/navigation";

import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TechnicianServiceForm } from "@/components/technician-service-form";
import { useTechnicianSession } from "@/lib/use-technician-session";

export function TechnicianAddService() {
  const router = useRouter();
  const user = useTechnicianSession("/dashboard/technician/add-service");

  if (!user) {
    return (
      <main className="px-4 py-12" role="status">
        <p className="text-sm text-muted-foreground">Checking your account...</p>
      </main>
    );
  }

  return (
    <DashboardLayout role="technician" user={user}>
      <div className="mx-auto max-w-3xl space-y-6">
        <section>
          <p className="text-sm font-semibold text-primary">Technician workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Add a Service
          </h1>
          <p className="mt-2 text-muted-foreground">
            Submit your service details for administrator approval.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            <TechnicianServiceForm
              user={user}
              onSaved={() => router.push("/dashboard/technician/my-services")}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
