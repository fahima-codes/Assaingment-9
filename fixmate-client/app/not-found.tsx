import Link from "next/link";
import { Wrench, Home, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Wrench className="h-12 w-12 animate-bounce" />
        <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
          <AlertCircle className="h-5 w-5" />
        </span>
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        404 — Page Under Repair
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
        We searched our entire workshop, but couldn&apos;t find the page or service you were looking for. It might have been moved or doesn&apos;t exist.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/services">
            <Search className="mr-2 h-4 w-4" /> Browse Services
          </Link>
        </Button>
      </div>
    </div>
  );
}
