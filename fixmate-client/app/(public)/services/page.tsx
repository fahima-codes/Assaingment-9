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
    page?: string;
  };
}

type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const PAGE_SIZE = 12;

function getPaginationItems(
  totalPages: number,
  currentPage: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const firstVisiblePage = Math.max(2, currentPage - 1);
  const lastVisiblePage = Math.min(totalPages - 1, currentPage + 1);
  const items: PaginationItem[] = [1];

  if (firstVisiblePage > 2) {
    items.push("start-ellipsis");
  }
  for (let page = firstVisiblePage; page <= lastVisiblePage; page += 1) {
    items.push(page);
  }
  if (lastVisiblePage < totalPages - 1) {
    items.push("end-ellipsis");
  }
  items.push(totalPages);

  return items;
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const search = searchParams?.search;
  const category = searchParams?.category;
  const serviceMode = searchParams?.serviceMode;
  const requestedSort = searchParams?.sort;
  const sort = SORT_OPTIONS.some((option) => option.value === requestedSort)
    ? requestedSort
    : undefined;
  const requestedPage = Number.parseInt(searchParams?.page ?? "1", 10);
  let currentPage =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const params = new URLSearchParams({
    page: String(currentPage),
    limit: String(PAGE_SIZE),
  });
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (serviceMode) params.set("serviceMode", serviceMode);
  if (sort) params.set("sort", sort);

  const fetchServices = () =>
    api.get<ServiceListResponse>(`/api/services?${params.toString()}`, {
      cache: "no-store",
    });
  let response = await fetchServices();
  const totalPages = response?.totalPages ?? 0;
  if (totalPages > 0 && currentPage > totalPages) {
    currentPage = totalPages;
    params.set("page", String(currentPage));
    response = await fetchServices();
  }
  const services: ServiceCardData[] = (response?.services ?? []).map(
    toServiceCardData,
  );
  const pageCount =
    response?.totalPages ??
    Math.ceil((response?.total ?? services.length) / PAGE_SIZE);

  const isFiltered =
    Boolean(search) ||
    Boolean(category) ||
    Boolean(serviceMode) ||
    Boolean(requestedSort);
  const activePage = response?.page ?? currentPage;
  const pageItems = getPaginationItems(pageCount, activePage);
  const pageHref = (page: number) => {
    const pageParams = new URLSearchParams(params);
    pageParams.set("page", String(page));
    return `/services?${pageParams.toString()}`;
  };

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
        <div className="mt-8 grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      {pageCount > 1 ? (
        <nav
          aria-label="Services pagination"
          className="mt-10 flex flex-wrap items-center justify-center gap-2"
        >
          {activePage === 1 ? (
            <span
              aria-disabled="true"
              className="rounded-md border border-border px-3 py-2 text-sm font-medium opacity-50"
            >
              Previous
            </span>
          ) : (
            <Link
              href={pageHref(activePage - 1)}
              className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              Previous
            </Link>
          )}
          {pageItems.map((item) =>
            typeof item === "number" ? (
              <Link
                key={item}
                href={pageHref(item)}
                aria-current={item === activePage ? "page" : undefined}
                className={`flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium ${
                  item === activePage
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:bg-accent"
                }`}
              >
                {item}
              </Link>
            ) : (
              <span
                key={item}
                aria-hidden="true"
                className="px-1 text-muted-foreground"
              >
                ...
              </span>
            ),
          )}
          {activePage === pageCount ? (
            <span
              aria-disabled="true"
              className="rounded-md border border-border px-3 py-2 text-sm font-medium opacity-50"
            >
              Next
            </span>
          ) : (
            <Link
              href={pageHref(activePage + 1)}
              className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
            >
              Next
            </Link>
          )}
        </nav>
      ) : null}
    </main>
  );
}
