"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/lib/api";
import {
  getAuthToken,
  getAuthUser,
  getDashboardPath,
  isAuthRole,
} from "@/lib/auth-session";
import { Button } from "@/components/ui/button";

interface PaymentSummary {
  amount: number;
  currency?: string;
  transactionId?: string;
  paymentStatus?: string;
}

interface PaymentVerifyResponse {
  payment?: PaymentSummary | null;
}

interface PaymentSuccessProps {
  sessionId?: string;
}

function formatAmount(amount: number, currency = "usd") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function PaymentSuccess({ sessionId }: PaymentSuccessProps) {
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentSummary | null>(null);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    let isActive = true;

    const verifyPayment = async () => {
      const currentUser = getAuthUser();
      if (!getAuthToken() || !currentUser) {
        router.replace(
          `/sign-in?redirect=${encodeURIComponent("/dashboard/customer/bookings")}`,
        );
        return;
      }

      if (!isAuthRole(currentUser.role)) {
        router.replace("/sign-in");
        return;
      }

      if (currentUser.role !== "customer") {
        router.replace(getDashboardPath(currentUser.role));
        return;
      }

      if (!sessionId) {
        const message = "Payment session was not found.";
        setError(message);
        setIsVerifying(false);
        toast.error(message);
        return;
      }

      try {
        const result = await api.get<PaymentVerifyResponse>(
          `/api/payments/verify?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" },
        );
        if (!isActive) return;

        if (result?.payment?.paymentStatus === "paid") {
          setPayment(result.payment);
          toast.success("Payment completed successfully.");
        } else {
          const message = "Payment has not been confirmed yet.";
          setError(message);
          toast.error(message);
        }
      } catch (verificationError) {
        const message =
          verificationError instanceof Error
            ? verificationError.message
            : "Could not verify the payment.";
        if (isActive) {
          setError(message);
          toast.error(message);
        }
      } finally {
        if (isActive) setIsVerifying(false);
      }
    };

    void verifyPayment();
    return () => {
      isActive = false;
    };
  }, [router, sessionId]);

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center px-4 py-16">
      <section className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
        <p className="text-sm font-semibold text-primary">Payment</p>
        {isVerifying ? (
          <>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              Confirming your payment
            </h1>
            <p className="mt-3 text-muted-foreground" role="status">
              Please wait while we verify your transaction.
            </p>
          </>
        ) : payment ? (
          <>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              Payment successful
            </h1>
            <p className="mt-3 text-muted-foreground">
              Your payment has been confirmed. Thank you for choosing FixMate.
            </p>
            <dl className="mx-auto mt-7 max-w-md divide-y divide-border rounded-xl border border-border text-left">
              <div className="flex items-center justify-between gap-4 p-4">
                <dt className="text-sm text-muted-foreground">Amount paid</dt>
                <dd className="font-semibold text-foreground">
                  {formatAmount(payment.amount, payment.currency)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 p-4">
                <dt className="shrink-0 text-sm text-muted-foreground">
                  Transaction ID
                </dt>
                <dd className="break-all text-right text-sm font-medium text-foreground">
                  {payment.transactionId || "Not available"}
                </dd>
              </div>
            </dl>
            <Button asChild className="mt-7">
              <Link href="/dashboard/customer/bookings">My Bookings</Link>
            </Button>
          </>
        ) : (
          <>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
              We couldn&apos;t confirm your payment
            </h1>
            <p className="mt-3 text-muted-foreground" role="alert">
              {error || "Please check your bookings for the latest payment status."}
            </p>
            <Button asChild className="mt-7">
              <Link href="/dashboard/customer/bookings">My Bookings</Link>
            </Button>
          </>
        )}
      </section>
    </main>
  );
}
