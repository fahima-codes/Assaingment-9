import Link from "next/link";
import { Wrench } from "lucide-react";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
];

const POPULAR_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Appliance Repair",
  "AC Service",
  "Painting",
];

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.656 8.55L24 21.75h-6.228l-4.857-6.286L6.26 21.75H3.333l7.63-8.835L0 2.25h6.39l4.63 6.13zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Wrench className="h-5 w-5 text-white" />
              </span>
              <span className="text-xl font-bold tracking-tight text-foreground">
                FixMate
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Expert repair services at your doorstep. We fix what others
              can&apos;t.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Quick Links
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Popular Categories
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              {POPULAR_CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    href={`/services?category=${encodeURIComponent(category)}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Contact
            </h3>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="mailto:hello@fixmate.com"
                  className="hover:text-foreground"
                >
                  hello@fixmate.com
                </a>
              </li>
              <li>
                <a href="tel:+15551234567" className="hover:text-foreground">
                  +1 (555) 123-4567
                </a>
              </li>
              <li>123 Main Street, Springfield</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {year} FixMate. All rights reserved.
          </p>
          <a
            href="https://x.com/fixmate"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="FixMate on X"
          >
            <XLogo className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
