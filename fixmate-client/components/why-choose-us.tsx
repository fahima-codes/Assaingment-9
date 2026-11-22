import { Star } from "lucide-react";

const STATS = [
  { value: "10K+", label: "Repairs Completed" },
  { value: "500+", label: "Verified Technicians" },
  { value: "4.9", label: "Average Rating" },
  { value: "24h", label: "Avg. Response" },
];

const TESTIMONIALS = [
  {
    name: "Rafi Ahmed",
    quote:
      "My AC stopped cooling just before a heatwave. The technician fixed it properly and I only paid once it was working.",
    rating: 5,
  },
  {
    name: "Meera Nair",
    quote:
      "I sent a photo of a leaking pipe and got a technician out within the hour. No scary upfront costs, pay after completion.",
    rating: 4,
  },
  {
    name: "Tom Becker",
    quote:
      "Finally a repair service that vets its people. The fix was clean and the technician was fully transparent.",
    rating: 5,
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-us" className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Why Choose Us
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          We vet every technician, price every job upfront, and only charge
          after the repair is complete.
        </p>

        <div className="mt-8 grid gap-6 rounded-2xl bg-foreground p-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex h-full flex-col rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${
                      index < testimonial.rating
                        ? "fill-primary text-primary"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm text-muted-foreground">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <p className="mt-4 text-sm font-semibold text-foreground">
                {testimonial.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
