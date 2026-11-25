import Link from 'next/link';
import { ArrowRight, MapPin, Wrench, BadgeCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

import type { ServiceCardData } from '@/lib/services';

export type { ServiceCardData };

function formatServiceMode(serviceMode?: string) {
  if (!serviceMode) return '';
  return serviceMode
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase());
}

export function ServiceCard({ service }: { service: ServiceCardData }) {
  const {
    title,
    description,
    image,
    category,
    serviceMode,
    serviceArea,
    price,
    technicianName,
  } = service;
  const detailsHref = service.id ? `/services/${service.id}` : '/services';
  const serviceImage = image || '/hero-repair.svg';

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-orange-100 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-2 hover:border-orange-200 hover:shadow-[0_20px_40px_rgba(249,115,22,0.12)] dark:border-zinc-800 dark:hover:border-orange-900">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={serviceImage}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

        {category ? (
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-600 shadow-md dark:bg-zinc-900">
            {category}
          </span>
        ) : null}

        {typeof price === 'number' ? (
          <div className="absolute bottom-4 right-4 rounded-2xl bg-white px-3.5 py-2 shadow-lg dark:bg-zinc-900">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
              Starting at
            </p>
            <p className="text-lg font-extrabold leading-none text-orange-600">
              ${price}
            </p>
          </div>
        ) : null}

        {serviceMode ? (
          <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-zinc-700 backdrop-blur dark:bg-zinc-900/90 dark:text-zinc-200">
            <Wrench className="h-3.5 w-3.5 text-orange-500" />
            {formatServiceMode(serviceMode)}
          </span>
        ) : null}
      </div>

      {/* Content */}
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-[19px] font-bold leading-snug text-zinc-900 transition-colors group-hover:text-orange-600 dark:text-zinc-100">
          {title}
        </h3>

        {description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        ) : null}

        {serviceArea ? (
          <p className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-600 dark:text-zinc-300">
            <MapPin className="h-4 w-4 text-orange-500" />
            {serviceArea}
          </p>
        ) : null}

        {technicianName ? (
          <div className="mt-auto flex items-center gap-2.5 border-t border-dashed border-orange-100 pt-4 dark:border-zinc-700">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-sm font-bold text-orange-600 ring-1 ring-orange-100 dark:bg-orange-950 dark:ring-orange-900">
              {technicianName.charAt(0).toUpperCase()}
            </div>
            <div className="leading-tight">
              <p className="flex items-center gap-1 text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
                {technicianName}
                <BadgeCheck className="h-4 w-4 text-blue-500" />
              </p>
              <p className="text-[11px] text-zinc-400">Verified Technician</p>
            </div>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button
          asChild
          className="w-full rounded-xl bg-orange-500 py-6 font-semibold text-white shadow-sm transition-all hover:bg-orange-600 hover:shadow-md"
        >
          <Link
            href={detailsHref}
            className="flex items-center justify-center gap-2"
          >
            View Details
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
