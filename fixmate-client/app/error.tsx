"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("FixMate Runtime Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertTriangle className="h-10 w-10" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Something went wrong!
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Our technicians have encountered an unexpected issue while processing your request. Please try again.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} size="lg">
          <RotateCcw className="mr-2 h-4 w-4" /> Try Again
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" /> Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
