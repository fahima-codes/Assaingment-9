import Link from "next/link";

import { Button } from "@/components/ui/button";

import { ServiceCard } from "@/components/services-card";
import type { ServiceCardData } from "@/components/services-card";

interface FeaturedServicesProps {
  services: ServiceCardData[];
}

export function FeaturedServices({ services }: FeaturedServicesProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Featured Services
            </h2>
            <p className="mt-2 text-muted-foreground">
              Hand-picked repairs from our top verified technicians.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/services">View all</Link>
          </Button>
        </div>

        {services.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id ?? service.title}
                service={service}
              />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-muted-foreground">
            No featured services available right now.
          </p>
        )}
      </div>
    </section>
  );
}
