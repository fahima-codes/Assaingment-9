import { CreditCard, Search, Send, Wrench } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Find Service",
    description: "Search for the repair your device or home needs.",
  },
  {
    icon: Send,
    title: "Send Request",
    description: "Book a verified technician in minutes.",
  },
  {
    icon: Wrench,
    title: "Technician Fixes It",
    description: "A vetted technician arrives and completes the repair.",
  },
  {
    icon: CreditCard,
    title: "Pay After Completion",
    description: "Release payment only after the repair is done and approved.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            How FixMate Works
          </h2>
          <p className="mt-2 text-muted-foreground">
            From a broken device to a fixed one in four simple steps.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="relative rounded-xl border bg-card p-6 shadow-sm"
              >
                <span className="absolute right-6 top-6 text-3xl font-bold text-muted">
                  {index + 1}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
