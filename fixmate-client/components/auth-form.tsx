"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Wrench, ShieldAlert, Check } from "lucide-react";

import { api } from "@/lib/api";
import {
  getDashboardPath,
  setAuthSession,
  type AuthUser,
  type AuthRole,
} from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthFormProps {
  mode: "signin" | "signup";
  redirect?: string;
}

interface AuthFormErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export function AuthForm({ mode, redirect }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "technician">("customer");
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignIn = mode === "signin";

  const validatePassword = (pass: string) => {
    if (pass.length < 6) {
      return "Password must be at least 6 characters.";
    }
    if (!/[A-Z]/.test(pass)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[a-z]/.test(pass)) {
      return "Password must contain at least one lowercase letter.";
    }
    return undefined;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors: AuthFormErrors = {};

    if (!email.trim()) {
      validationErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      validationErrors.email = "Enter a valid email address.";
    }

    if (!isSignIn) {
      if (!name.trim()) {
        validationErrors.name = "Full name is required.";
      }
      const passError = validatePassword(password);
      if (passError) {
        validationErrors.password = passError;
      }
    } else {
      if (!password) {
        validationErrors.password = "Password is required.";
      }
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const payload = isSignIn
        ? { email: email.trim().toLowerCase(), password }
        : {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role,
          };

      const data = await api.post<{ token?: string; user?: AuthUser }>(
        isSignIn ? "/api/auth/login" : "/api/auth/register",
        payload,
      );

      const token = data?.token;
      const user = data?.user;
      setAuthSession(
        token,
        user ?? {
          name: name || email.split("@")[0],
          email: email.trim().toLowerCase(),
          role: isSignIn ? "customer" : role,
        },
      );

      toast.success(
        isSignIn ? "Signed in successfully!" : "Account created successfully! Welcome to FixMate.",
      );

      const safeRedirect =
        redirect && redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : undefined;

      const userRole = (user?.role as AuthRole) || (isSignIn ? "customer" : role);
      const dashboard = getDashboardPath(userRole);
      const destination = safeRedirect ?? dashboard;

      router.push(destination);
    } catch (error) {
      const message = (error as { message?: string })?.message;
      toast.error(
        message ??
          (isSignIn ? "Invalid email or password." : "Could not create account."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg border-border">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {isSignIn ? "Welcome Back to FixMate" : "Join FixMate"}
        </CardTitle>
        <CardDescription>
          {isSignIn
            ? "Sign in to access your repair requests and dashboard"
            : "Create an account to book repairs or offer technician services"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Sign Up Role Selector */}
          {!isSignIn && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Select Your Role *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition",
                    role === "customer"
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                      : "border-border hover:bg-muted/50 text-muted-foreground",
                  )}
                >
                  <User className="h-6 w-6 mb-1.5" />
                  <span className="text-sm font-semibold text-foreground">
                    Customer
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    I need device repairs
                  </span>
                  {role === "customer" && (
                    <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRole("technician")}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition",
                    role === "technician"
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                      : "border-border hover:bg-muted/50 text-muted-foreground",
                  )}
                >
                  <Wrench className="h-6 w-6 mb-1.5" />
                  <span className="text-sm font-semibold text-foreground">
                    Technician
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    I provide repair services
                  </span>
                  {role === "technician" && (
                    <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Full Name for Sign Up */}
          {!isSignIn && (
            <div className="space-y-1">
              <label
                htmlFor="auth-name"
                className="text-xs font-semibold text-foreground"
              >
                Full Name *
              </label>
              <input
                id="auth-name"
                name="name"
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="auth-email"
              className="text-xs font-semibold text-foreground"
            >
              Email Address *
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label
              htmlFor="auth-password"
              className="text-xs font-semibold text-foreground"
            >
              Password *
            </label>
            <input
              id="auth-password"
              name="password"
              type="password"
              placeholder={isSignIn ? "Enter your password" : "Min 6 chars, 1 uppercase, 1 lowercase"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
            {!isSignIn && !errors.password && (
              <p className="text-[11px] text-muted-foreground">
                Must be at least 6 characters with 1 uppercase & 1 lowercase letter.
              </p>
            )}
          </div>

          <Button type="submit" className="w-full mt-2 font-semibold" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isSignIn ? "Sign In" : "Complete Registration"}
          </Button>
        </form>

        {/* Demo Credentials Helper Box */}
        <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
          <p className="font-semibold text-primary mb-1">Testing Credentials:</p>
          <div className="space-y-0.5 text-muted-foreground">
            <p><strong>Admin:</strong> admin@fixmate.com / Admin123!</p>
            <p><strong>Technician:</strong> rahim@fixmate.com / Tech123!</p>
            <p><strong>Customer:</strong> sakib@fixmate.com / Customer123!</p>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isSignIn ? "New to FixMate? " : "Already have an account? "}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="font-medium text-primary hover:underline"
          >
            {isSignIn ? "Create an account" : "Sign in"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
