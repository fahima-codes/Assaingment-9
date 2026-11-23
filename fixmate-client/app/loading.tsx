import { Wrench } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary animate-pulse">
        <Wrench className="h-8 w-8 animate-spin" />
      </div>
      <p className="mt-4 text-sm font-semibold text-foreground">
        Loading FixMate...
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Fetching the latest repair data and service providers
      </p>
    </div>
  );
}
