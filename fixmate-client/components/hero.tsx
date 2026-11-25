import Link from "next/link";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="bg-slate-900 text-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
              Broken Device? Get It Fixed by Verified Technicians
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">
              Describe your issue in seconds and get it fixed by a verified
              technician at your doorstep. Pay only after the repair is complete.
            </p>

            <form
              action="/services"
              method="get"
              className="mt-8 flex w-full max-w-xl gap-2"
            >
              <input
                name="search"
                type="text"
                placeholder="What needs fixing? e.g. leaking pipe, AC not cooling"
                className="h-12 w-full rounded-md border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" size="lg">
                Search
              </Button>
            </form>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/services">Book a Service</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="#how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>

          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-repair.svg"
              alt="Verified technician repairing a broken device"
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
