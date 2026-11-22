import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/services-card";
import type { ServiceCardData } from "@/components/services-card";
import { Hammer, Wrench, Zap } from "lucide-react";
import Link from "next/link";

const FEATURED_SERVICES: ServiceCardData[] = [
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

export default function Home() {
  return (
    <main className="flex-1">
      <section className="bg-[#0F172A] text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Expert repair services at your doorstep
          </h1>
          <p className="max-w-2xl text-lg text-white/80">
            FixMate connects you with trusted experts who fix everything from
            plumbing and electrical issues to furniture and appliances.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/services">Explore Services</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#book">Book a Service</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Popular Services
          </h2>
          <Button variant="outline" asChild>
            <Link href="/services">View all</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_SERVICES.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </section>
    </main>
  );
}
