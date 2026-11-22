import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import {
  SERVICE_CATEGORIES,
  SERVICE_MODES,
  toServiceCardData,
  type ServiceListResponse,
} from "@/lib/services";
import { ServiceCard } from "@/components/services-card";
import type { ServiceCardData } from "@/components/services-card";

export const dynamic = "force-dynamic";

interface ServicesPageProps {
  searchParams: {
    search?: string;
    category?: string;
    serviceMode?: string;
    sort?: string;
  };
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const search = searchParams?.search;
  const category = searchParams?.category;
  const serviceMode = searchParams?.serviceMode;
  const sort = searchParams?.sort;
  const params = new URLSearchParams({ page: "1", limit: "12" });
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (serviceMode) params.set("serviceMode", serviceMode);
  if (sort) params.set("sort", sort);

  const response = await api.get<ServiceListResponse>(
    `/api/services?${params.toString()}`,
    { cache: "no-store" },
  );
  const services: ServiceCardData[] = (response?.services ?? []).map(
    toServiceCardData,
  );

  const isFiltered =
    Boolean(search) || Boolean(category) || Boolean(serviceMode) || Boolean(sort);

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Our Services
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse the services we offer and book an expert in minutes.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/services">Reset filters</Link>
        </Button>
      </div>

      {isFiltered ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Showing results based on your filters.
        </p>
      ) : null}

      <Card className="mt-8 p-6">
        <form action="/services" method="get" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search services..."
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <select
            name="category"
            defaultValue={category ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {SERVICE_CATEGORIES.map((categoryOption) => (
              <option key={categoryOption} value={categoryOption}>
                {categoryOption}
              </option>
            ))}
          </select>
          <select
            name="serviceMode"
            defaultValue={serviceMode ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All service modes</option>
            {SERVICE_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={sort ?? "newest"}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-4">
            <Button type="submit">Apply Filters</Button>
            <Button variant="outline" asChild>
              <Link href="/services">Reset</Link>
            </Button>
          </div>
        </form>
      </Card>

      {services.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.id ?? service.title} service={service} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed bg-card p-12 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            No services found
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn&apos;t find any services matching your filters right now.
          </p>
          <Button asChild className="mt-6">
            <Link href="/services">Browse all services</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
