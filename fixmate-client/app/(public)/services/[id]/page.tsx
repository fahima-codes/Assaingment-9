import Link from "next/link";
import { notFound } from "next/navigation";

import { api } from "@/lib/api";
import { toServiceCardData, type Service } from "@/lib/services";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RequestRepairButton } from "@/components/request-repair-button";

export const dynamic = "force-dynamic";

interface ServiceDetailPageProps {
  params: { id: string };
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  let service: Service | null = null;

  try {
    service = await api.get<Service>(
      `/api/services/${params.id}`,
      { cache: "no-store" },
    );
  } catch {
    service = null;
  }

  const data = service ? toServiceCardData(service) : null;

  if (!data) {
    notFound();
  }

  const technicianInitials = (data.technicianName ?? "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Button variant="outline" asChild>
        <Link href="/services">Back to Services</Link>
      </Button>

      <Card className="mt-6 overflow-hidden">
        {data.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.image}
            alt={data.title}
            className="h-72 w-full object-cover"
          />
        ) : null}

        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl">{data.title}</CardTitle>
          {data.category ? (
            <span className="w-fit rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
              {data.category}
            </span>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{data.description}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Price
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {typeof data.price === "number" ? `$${data.price}` : "N/A"}
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Duration
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {data.duration ?? "To be discussed"}
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Service Mode
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {data.serviceMode ?? "N/A"}
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Service Area
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {data.serviceArea ?? "N/A"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border bg-secondary/50 p-4">
            <p className="text-sm font-semibold text-foreground">Technician</p>
            <div className="mt-3 flex items-center gap-3">
              {data.technicianPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.technicianPhoto}
                  alt={data.technicianName ?? "Technician"}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F97316] text-sm font-bold text-white">
                  {technicianInitials || "TF"}
                </span>
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {data.technicianName ?? "Verified technician"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Verified technician
                </p>
              </div>
            </div>
            {data.technicianArea ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Area: {data.technicianArea}
              </p>
            ) : null}
            {data.technicianBio ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {data.technicianBio}
              </p>
            ) : null}
          </div>

          <RequestRepairButton serviceId={data.id ?? ""} serviceTitle={data.title} />
        </CardContent>
      </Card>
    </main>
  );
}
