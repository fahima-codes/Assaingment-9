import Link from "next/link";
import { Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { ServiceCardData } from "@/lib/services";

export type { ServiceCardData };

function formatServiceMode(serviceMode?: string) {
  if (!serviceMode) return "";
  return serviceMode
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ServiceCard({ service }: { service: ServiceCardData }) {
  const { title, description, image, category, serviceMode, serviceArea, price, technicianName } =
    service;
  const detailsHref = service.id ? `/services/${service.id}` : "/services";

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={title}
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-secondary">
          <Wrench className="h-10 w-10 text-muted-foreground" />
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-lg leading-snug">{title}</CardTitle>
        {category ? (
          <span className="w-fit rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            {category}
          </span>
        ) : null}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
        {description ? <p className="leading-relaxed">{description}</p> : null}
        {serviceMode ? <p>Service Mode: {formatServiceMode(serviceMode)}</p> : null}
        {serviceArea ? <p>Service Area: {serviceArea}</p> : null}
        {typeof price === "number" ? (
          <p className="text-lg font-semibold text-foreground">${price}</p>
        ) : null}
        {technicianName ? <p>Technician: {technicianName}</p> : null}
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full" size="sm">
          <Link href={detailsHref}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
