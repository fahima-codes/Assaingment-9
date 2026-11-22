import {
  Laptop,
  Refrigerator,
  Snowflake,
  Smartphone,
  Tv,
  Zap,
  WashingMachine,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface Category {
  slug: string;
  label: string;
  icon: LucideIcon;
}

const POPULAR_CATEGORIES: Category[] = [
  { slug: "Smartphone", label: "Smartphone", icon: Smartphone },
  { slug: "Laptop & PC", label: "Laptop & PC", icon: Laptop },
  { slug: "AC", label: "AC", icon: Snowflake },
  { slug: "Refrigerator", label: "Refrigerator", icon: Refrigerator },
  { slug: "TV", label: "TV", icon: Tv },
  { slug: "Washing Machine", label: "Washing Machine", icon: WashingMachine },
  { slug: "Electrical", label: "Electrical", icon: Zap },
];

export function PopularCategories() {
  return (
    <section id="categories" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Popular Categories
            </h2>
            <p className="mt-2 text-muted-foreground">
              Find a trusted specialist for the device that needs attention.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/services">View all</Link>
          </Button>
        </div>

        <div className="mt-8 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {POPULAR_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/services?category=${encodeURIComponent(category.slug)}`}
                className="group flex h-full items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="font-semibold text-foreground">
                  {category.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
