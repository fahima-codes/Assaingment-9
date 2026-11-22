import { ServiceCard } from "@/components/services-card";
import type { ServiceCardData } from "@/components/services-card";
import { Hammer, Wrench, Zap } from "lucide-react";

const SERVICES: ServiceCardData[] = [
  {
    title: "Plumbing Repair",
    description:
      "Leaks, clogs, and installations fixed by certified plumbers in as little as 24 hours.",
    icon: Wrench,
  },
  {
    title: "Electrical Repair",
    description:
      "Wiring, panel upgrades, and safety checks handled by licensed electricians.",
    icon: Zap,
  },
  {
    title: "Carpentry & Furniture",
    description:
      "Custom furniture, shelves, doors, and structural repairs by expert carpenters.",
    icon: Hammer,
  },
];

export default function ServicesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Our Services
      </h1>
      <p className="mt-2 text-muted-foreground">
        Browse the services we offer and book an expert in minutes.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <ServiceCard key={service.title} {...service} />
        ))}
      </div>
    </main>
  );
}
