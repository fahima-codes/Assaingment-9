import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ServiceNotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">
        Service unavailable
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
        We couldn&apos;t find that service
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        It may have been removed, is not available, or is still awaiting
        approval.
      </p>
      <Button asChild className="mt-6">
        <Link href="/services">Browse available services</Link>
      </Button>
    </main>
  );
}
