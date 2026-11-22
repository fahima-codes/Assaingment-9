import type { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export function DashboardStatCard({
  label,
  value,
  description,
  icon: Icon,
}: DashboardStatCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </article>
  );
}
