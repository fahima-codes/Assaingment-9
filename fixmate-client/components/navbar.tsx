"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Wrench, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AUTH_SESSION_CHANGE_EVENT,
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  getDashboardPath,
  isAuthRole,
  type AuthRole,
  type AuthUser,
} from "@/lib/auth-session";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
];

const ROLE_LABELS: Record<AuthRole, string> = {
  customer: "Customer",
  technician: "Technician",
  admin: "Admin",
};

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const syncUser = () => setUser(getAuthToken() ? getAuthUser() : null);
    syncUser();
    setAuthReady(true);
    setMobileOpen(false);

    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, [pathname]);

  const role = isAuthRole(user?.role) ? user.role : "customer";
  const displayName = user?.name?.trim() || user?.email || "Account";

  const handleSignOut = () => {
    clearAuthSession();
    setUser(null);
    setMobileOpen(false);
    toast.success("Signed out successfully.");
    router.replace("/");
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navLinks = user
    ? [...NAV_LINKS, { href: "/bookings", label: "My Bookings" }]
    : NAV_LINKS;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="FixMate home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Wrench className="h-5 w-5 text-white" />
          </span>
          <span className="text-xl font-bold tracking-tight text-foreground">
            FixMate
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {authReady && user ? (
            <details key={pathname} className="relative hidden md:block">
              <summary
                aria-label="Open account menu"
                className="flex cursor-pointer list-none items-center gap-2 rounded-full p-1 pr-3 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-32 truncate text-sm font-medium">
                  {displayName}
                </span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                  {ROLE_LABELS[role]}
                </span>
              </summary>
              <div className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-white p-2 shadow-lg">
                <div className="border-b border-border px-3 py-2">
                  <p className="truncate text-sm font-semibold">{displayName}</p>
                  <span className="mt-1 inline-flex rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                    {ROLE_LABELS[role]}
                  </span>
                </div>
                <Link
                  href={getDashboardPath(role)}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  Update Profile
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-accent"
                >
                  Sign Out
                </button>
              </div>
            </details>
          ) : authReady && !user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="outline" size="sm" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={
              mobileOpen
                ? "Close account menu"
                : user
                  ? "Open account menu"
                  : "Open navigation menu"
            }
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : authReady && user ? (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {displayName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={cn(
          "border-t border-border bg-white md:hidden",
          !mobileOpen && "hidden"
        )}
      >
          <nav className="flex flex-col gap-1 px-4 py-4">
            {authReady && user ? (
              <div className="mb-2 flex items-center gap-3 border-b border-border px-3 pb-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{displayName}</p>
                  <span className="inline-flex rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                    {ROLE_LABELS[role]}
                  </span>
                </div>
              </div>
            ) : null}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium",
                  isActive(link.href)
                    ? "bg-accent text-primary"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              {authReady && user ? (
                <>
                  <Link
                    href={getDashboardPath(role)}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  >
                    Update Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-accent"
                  >
                    Sign Out
                  </button>
                </>
              ) : authReady ? (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </>
              ) : null}
            </div>
          </nav>
      </div>
    </header>
  );
}
