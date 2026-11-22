"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ApiError, api } from "@/lib/api";
import { getAuthToken, getAuthUser } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";

interface RequestRepairButtonProps {
  serviceId: string;
  serviceTitle: string;
}

function getLocalDate() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export function RequestRepairButton({
  serviceId,
  serviceTitle,
}: RequestRepairButtonProps) {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getAuthUser>>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [problem, setProblem] = useState("");

  useEffect(() => {
    setUser(getAuthToken() ? getAuthUser() : null);
    setIsCheckingAuth(false);
  }, []);

  const isCustomer = user?.role === "customer";

  const handleRequestClick = () => {
    if (isCheckingAuth) return;

    if (!getAuthToken() || !user) {
      router.push(
        `/sign-in?redirect=${encodeURIComponent(`/services/${serviceId}`)}`,
      );
      return;
    }

    if (!isCustomer) return;

    setPhone(user.phone ?? "");
    setAddress(user.address ?? user.area ?? "");
    setPreferredDate(getLocalDate());
    setProblem("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!getAuthToken() || !user) {
      setIsModalOpen(false);
      router.push(`/sign-in?redirect=${encodeURIComponent(`/services/${serviceId}`)}`);
      return;
    }

    if (problem.trim().length < 20 || preferredDate < getLocalDate()) {
      toast.error("Enter a future date and describe the problem in at least 20 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post<{ message?: string }>("/api/bookings", {
        serviceId,
        name: user.name,
        email: user.email,
        phone: phone.trim(),
        address: address.trim(),
        preferredDate,
        problem: problem.trim(),
      });
      toast.success("Your repair request has been sent successfully!");
      setIsModalOpen(false);
      setIsSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (
        (error instanceof ApiError && error.status === 409) ||
        /already|duplicate|active request/i.test(message)
      ) {
        toast.error("You already have an active request");
      } else {
        toast.error(message || "Failed to send the repair request. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = getLocalDate();

  if (isCheckingAuth) {
    return (
      <Button size="lg" disabled>
        Request Repair
      </Button>
    );
  }

  return (
    <>
      <Button
        size="lg"
        onClick={handleRequestClick}
        disabled={Boolean(user && !isCustomer)}
      >
        {user && !isCustomer
          ? "Only customers can request a repair"
          : "Request Repair"}
      </Button>

      {isModalOpen && !isSubmitted ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-repair-title"
            className="w-full max-w-lg rounded-xl bg-card p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <h3 id="request-repair-title" className="text-lg font-semibold text-foreground">
                Request Repair
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{serviceTitle}</p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label
                  htmlFor="request-name"
                  className="text-sm font-medium text-foreground"
                >
                  Name
                </label>
                <input
                  id="request-name"
                  value={user?.name ?? ""}
                  readOnly
                  className="h-10 w-full rounded-md border border-input bg-secondary px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="request-email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <input
                  id="request-email"
                  value={user?.email ?? ""}
                  readOnly
                  className="h-10 w-full rounded-md border border-input bg-secondary px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="request-phone"
                  className="text-sm font-medium text-foreground"
                >
                  Phone
                </label>
                <input
                  id="request-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-10 w-full rounded-md border border-input px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="request-address"
                  className="text-sm font-medium text-foreground"
                >
                  Address
                </label>
                <input
                  id="request-address"
                  required
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="h-10 w-full rounded-md border border-input px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="request-date"
                  className="text-sm font-medium text-foreground"
                >
                  Preferred Date
                </label>
                <input
                  id="request-date"
                  type="date"
                  min={today}
                  required
                  value={preferredDate}
                  onChange={(event) => setPreferredDate(event.target.value)}
                  className="h-10 w-full rounded-md border border-input px-3 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="request-problem"
                  className="text-sm font-medium text-foreground"
                >
                  Problem
                </label>
                <textarea
                  id="request-problem"
                  required
                  minLength={20}
                  value={problem}
                  onChange={(event) => setProblem(event.target.value)}
                  placeholder="Describe the problem in at least 20 characters..."
                  className="min-h-24 w-full rounded-md border border-input px-3 py-2 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 20 characters required.
                </p>
              </div>
              <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || problem.trim().length < 20}
              >
                {isSubmitting ? "Sending..." : "Submit Request"}
              </Button>
            </div>
            </form>
          </div>
        </div>
      ) : null}

      {isSubmitted ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 text-center shadow-lg">
            <h3 className="text-lg font-semibold text-foreground">
              Request Sent
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your repair request for {serviceTitle} has been sent to the
              technician. You will be notified once the technician accepts the
              request.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild>
                <Link href="/bookings">My Bookings</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/services">Back to Services</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
