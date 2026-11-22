import {
  Armchair,
  Hammer,
  Paintbrush,
  Refrigerator,
  Snowflake,
  Wrench,
  Zap,
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
  { slug: "AC", label: "AC Service", icon: Snowflake },
  { slug: "Plumbing", label: "Plumbing", icon: Wrench },
  { slug: "Electrical", label: "Electrical", icon: Zap },
  { slug: "Appliance Repair", label: "Appliance Repair", icon: Refrigerator },
  { slug: "Carpentry", label: "Carpentry", icon: Hammer },
  { slug: "Painting", label: "Painting", icon: Paintbrush },
  { slug: "Furniture Assembly", label: "Furniture Assembly", icon: Armchair },
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
              Pick a category and get a verified technician on it.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/services">View all</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.slug}
                href={`/services?category=${category.slug}`}
                className="group flex h-full flex-col rounded-xl border bg-card p-6 shadow-sm transition-colors hover:border-primary hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <p className="mt-4 font-medium text-foreground">
                  {category.label}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
