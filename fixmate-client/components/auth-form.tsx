"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { setAuthSession, type AuthUser } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthFormProps {
  mode: "signin" | "signup";
  redirect?: string;
}

interface AuthFormErrors {
  email?: string;
  password?: string;
}

export function AuthForm({ mode, redirect }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignIn = mode === "signin";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSignIn) {
      const validationErrors: AuthFormErrors = {};
      if (!email.trim()) {
        validationErrors.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        validationErrors.email = "Enter a valid email address.";
      }
      if (!password) {
        validationErrors.password = "Password is required.";
      }

      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) return;
    }

    setIsSubmitting(true);
    try {
      const payload = isSignIn ? { email, password } : { name, email, password };
      const data = await api.post<{ token?: string; user?: AuthUser }>(
        isSignIn ? "/api/auth/login" : "/api/auth/register",
        payload,
      );

      const token = data?.token;
      const user = data?.user;
      setAuthSession(token, user ?? {
        name: name || email.split("@")[0],
        email,
        role: "customer",
      });

      toast.success(
        isSignIn ? "Signed in successfully!" : "Account created successfully!",
      );

      const safeRedirect =
        redirect && redirect.startsWith("/") && !redirect.startsWith("//")
          ? redirect
          : undefined;
      const role = user?.role ?? "customer";
      const dashboard =
        role === "technician"
          ? "/dashboard/technician"
          : role === "admin"
            ? "/dashboard/admin"
            : "/dashboard/customer";
      const destination = safeRedirect ?? (isSignIn ? dashboard : "/");
      router.push(destination);
    } catch (error) {
      const message = (error as { message?: string })?.message;
      toast.error(
        message ?? (isSignIn ? "Invalid email or password." : "Could not create account."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {isSignIn ? "Sign In" : "Create Account"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate={isSignIn}>
          {!isSignIn ? (
            <div className="space-y-1">
              <label htmlFor="auth-name" className="text-sm font-medium text-foreground">
                Name
              </label>
              <input
                id="auth-name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          ) : null}

          <div className="space-y-1">
            <label htmlFor="auth-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              required={!isSignIn}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) {
                  setErrors((current) => ({ ...current, email: undefined }));
                }
              }}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "auth-email-error" : undefined}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            {errors.email ? (
              <p id="auth-email-error" className="text-sm text-destructive" role="alert">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label htmlFor="auth-password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <input
              id="auth-password"
              name="password"
              type="password"
              required={!isSignIn}
              minLength={isSignIn ? undefined : 6}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (errors.password) {
                  setErrors((current) => ({ ...current, password: undefined }));
                }
              }}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "auth-password-error" : undefined}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            {errors.password ? (
              <p id="auth-password-error" className="text-sm text-destructive" role="alert">
                {errors.password}
              </p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isSignIn ? "Sign In" : "Create Account"}
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
  );
}
