"use client";

import {
  CalendarDays,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import {
  AUTH_SESSION_CHANGE_EVENT,
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  type AuthRole,
  type AuthUser,
} from "@/lib/auth-session";
import { cn } from "@/lib/utils";

interface DashboardNavItem {
  label: string;
  href: string;
  icon: typeof Home;
}

const ROLE_LABELS: Record<AuthRole, string> = {
  customer: "Customer",
  technician: "Technician",
  admin: "Admin",
};

const ROLE_NAV_ITEMS: Record<AuthRole, DashboardNavItem[]> = {
  customer: [
    { label: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
    { label: "Find Services", href: "/services", icon: Search },
    {
      label: "My Bookings",
      href: "/dashboard/customer/bookings",
      icon: CalendarDays,
    },
    { label: "Profile", href: "/dashboard/profile", icon: UserRound },
  ],
  technician: [
    { label: "Overview", href: "/dashboard/technician", icon: LayoutDashboard },
    { label: "Service Catalog", href: "/services", icon: Wrench },
    { label: "Profile", href: "/dashboard/profile", icon: UserRound },
  ],
  admin: [
    { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Service Catalog", href: "/services", icon: ShieldCheck },
    { label: "Profile", href: "/dashboard/profile", icon: UserRound },
  ],
};

function getInitials(user: AuthUser) {
  const name = user.name?.trim() || user.email || "FixMate";
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface DashboardLayoutProps {
  role: AuthRole;
  user: AuthUser;
  children: ReactNode;
}

export function DashboardLayout({
  role,
  user,
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    const syncUser = () => {
      const nextUser = getAuthToken() ? getAuthUser() : null;
      if (nextUser) {
        setCurrentUser(nextUser);
      }
    };

    window.addEventListener(AUTH_SESSION_CHANGE_EVENT, syncUser);
    return () => window.removeEventListener(AUTH_SESSION_CHANGE_EVENT, syncUser);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const displayName =
    currentUser.name?.trim() || currentUser.email || "FixMate User";
  const initials = getInitials(currentUser);

  const handleSignOut = () => {
    clearAuthSession();
    toast.success("Signed out successfully.");
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close dashboard menu"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        id="dashboard-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-white transition-transform duration-200 md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <Wrench className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">
              FixMate
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close dashboard menu"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary md:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {ROLE_LABELS[role]} workspace
          </p>
          <p className="mt-1 truncate text-sm font-medium text-foreground">
            {displayName}
          </p>
        </div>

        <nav aria-label={`${ROLE_LABELS[role]} dashboard`} className="flex-1 space-y-1 px-3 py-5">
          {ROLE_NAV_ITEMS[role].map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/services"
                ? pathname.startsWith("/services")
                : pathname === item.href ||
                  (item.href !== "/dashboard/customer" &&
                    pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="min-h-screen md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-expanded={sidebarOpen}
              aria-controls="dashboard-sidebar"
              aria-label={sidebarOpen ? "Close dashboard menu" : "Open dashboard menu"}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary md:hidden"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Home
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-48 truncate text-sm font-semibold text-foreground">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-semibold text-primary">
              {currentUser.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
