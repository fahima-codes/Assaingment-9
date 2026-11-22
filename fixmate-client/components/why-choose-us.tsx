import { BadgeCheck, CreditCard, ShieldCheck, Star } from "lucide-react";

const STATS = [
  { value: "500+", label: "Verified Technicians" },
  { value: "10K+", label: "Jobs Completed" },
  { value: "100%", label: "Pay After Service" },
  { value: "4.9/5", label: "Customer Rating" },
];

const TRUST_POINTS = [
  {
    icon: BadgeCheck,
    title: "Verified professionals",
    description:
      "Technicians are reviewed for their skills and experience before joining.",
  },
  {
    icon: ShieldCheck,
    title: "Clear, upfront pricing",
    description:
      "Know the expected cost before work begins, with no surprise charges.",
  },
  {
    icon: CreditCard,
    title: "Pay only when it is done",
    description:
      "Your payment is due after the repair is complete and you are satisfied.",
  },
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
          Reliable repairs start with trusted people, transparent pricing, and
          payment only after the work is done.
        </p>

        <div className="mt-8 grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <article
                key={point.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold text-foreground">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {point.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-10 grid auto-rows-fr gap-6 rounded-2xl bg-foreground p-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-white">{stat.value}</p>
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
                    aria-hidden="true"
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
