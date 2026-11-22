"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-session";

interface PaymentSuccessProps {
  sessionId?: string;
}

export function PaymentSuccess({ sessionId }: PaymentSuccessProps) {
  const router = useRouter();

  useEffect(() => {
    let isActive = true;

    const verifyPayment = async () => {
      if (!getAuthToken()) {
        router.replace(
          `/sign-in?redirect=${encodeURIComponent("/dashboard/customer/bookings")}`,
        );
        return;
      }

      if (!sessionId) {
        toast.error("Payment session was not found.");
        router.replace("/dashboard/customer/bookings");
        return;
      }

      try {
        const result = await api.get<{ payment?: unknown }>(
          `/api/payments/verify?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" },
        );
        if (!isActive) return;

        if (result?.payment) {
          toast.success("Payment completed successfully.");
        } else {
          toast.error("Payment has not been confirmed yet.");
        }
      } catch (error) {
        if (isActive) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not verify the payment.",
          );
        }
      } finally {
        if (isActive) router.replace("/dashboard/customer/bookings");
      }
    };

    void verifyPayment();
    return () => {
      isActive = false;
    };
  }, [router, sessionId]);

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center px-4 py-16 text-center">
      <div>
        <p className="text-sm font-semibold text-primary">Payment</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          Confirming your payment
        </h1>
        <p className="mt-3 text-muted-foreground" role="status">
          Please wait while we verify your transaction.
        </p>
      </div>
    </main>
  );
}
