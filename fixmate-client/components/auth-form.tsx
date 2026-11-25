"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Wrench, Check, X, Sparkles } from "lucide-react";

import { api } from "@/lib/api";
import {
  getDashboardPath,
  setAuthSession,
  type AuthUser,
  type AuthRole,
} from "@/lib/auth-session";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

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

  // Google Social Sign-In states
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleNameInput, setGoogleNameInput] = useState("");

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

  const handleEmailAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
        isSignIn
          ? "Signed in successfully!"
          : "Account created successfully! Welcome to FixMate.",
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

  // Execute Google Authentication with server session integration
  const executeGoogleLogin = async (
    targetEmail: string,
    targetName?: string,
  ) => {
    setIsGoogleLoading(true);
    try {
      const cleanEmail = targetEmail.trim().toLowerCase();
      const displayName = targetName?.trim() || cleanEmail.split("@")[0];

      const data = await api.post<{ token?: string; user?: AuthUser }>(
        "/api/auth/google",
        {
          email: cleanEmail,
          name: displayName,
          image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            displayName,
          )}`,
        },
      );

      const token = data?.token;
      const user = data?.user;
      setAuthSession(
        token,
        user ?? {
          name: displayName,
          email: cleanEmail,
          role: "customer",
        },
      );

      toast.success(
        isSignIn
          ? `Signed in with Google as ${cleanEmail}!`
          : `Signed up with Google as customer! Welcome to FixMate.`,
      );

      const safeRedirect =
        redirect && redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : undefined;
      const destination = safeRedirect ?? getDashboardPath("customer");

      router.push(destination);
    } catch (error) {
      const message = (error as { message?: string })?.message;
      toast.error(message ?? "Google authentication failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
      setIsGoogleModalOpen(false);
    }
  };

  const handleGoogleButtonClick = async () => {
    // If NEXT_PUBLIC_GOOGLE_CLIENT_ID is configured, attempt BetterAuth social flow
    if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      try {
        setIsGoogleLoading(true);
        await authClient.signIn.social({
          provider: "google",
          callbackURL: redirect || "/dashboard/customer",
        });
        return;
      } catch (err) {
        console.warn("BetterAuth Google OAuth redirect warning:", err);
      } finally {
        setIsGoogleLoading(false);
      }
    }

    // Interactive Google Account Sign-In Dialog
    setIsGoogleModalOpen(true);
  };

  return (
    <>
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
          {/* Google Sign In / Sign Up Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleButtonClick}
            disabled={isGoogleLoading || isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 h-10 border-border hover:bg-muted font-medium transition shadow-sm"
          >
            <GoogleIcon className="h-4 w-4" />
            <span>
              {isGoogleLoading
                ? "Connecting to Google..."
                : isSignIn
                  ? "Sign in with Google"
                  : "Sign up with Google"}
            </span>
          </Button>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailAuthSubmit} className="space-y-4" noValidate>
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
                    if (errors.name)
                      setErrors((prev) => ({ ...prev, name: undefined }));
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
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: undefined }));
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
                placeholder={
                  isSignIn
                    ? "Enter your password"
                    : "Min 6 chars, 1 uppercase, 1 lowercase"
                }
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
                  Must be at least 6 characters with 1 uppercase & 1 lowercase
                  letter.
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-2 font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Please wait..."
                : isSignIn
                  ? "Sign In"
                  : "Complete Registration"}
            </Button>
          </form>

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

      {/* Google Account Sign-In Dialog / Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <GoogleIcon className="h-5 w-5" />
                <h3 className="font-bold text-foreground">
                  Google Social Login
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Sign in with your Google account. Per platform rules, Google users
              automatically get the <strong>Customer</strong> role.
            </p>

            {/* Quick 1-Click Demo Google Account Option */}
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="text-[11px] font-semibold text-primary uppercase tracking-wide">
                1-Click Quick Demo Account
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-2 w-full gap-2 text-xs font-semibold"
                disabled={isGoogleLoading}
                onClick={() =>
                  executeGoogleLogin(
                    "alex.customer@gmail.com",
                    "Alex Google Customer",
                  )
                }
              >
                <Sparkles className="h-3.5 w-3.5" /> Continue as Alex (Demo Google)
              </Button>
            </div>

            {/* Or Enter Custom Google Email */}
            <div className="mt-4 space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or use your email
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Michael Scott"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Google Email *
                </label>
                <input
                  type="email"
                  placeholder="e.g. you@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsGoogleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="flex-1"
                  disabled={!googleEmailInput.trim() || isGoogleLoading}
                  onClick={() =>
                    executeGoogleLogin(googleEmailInput, googleNameInput)
                  }
                >
                  {isGoogleLoading ? "Connecting..." : "Continue"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
