import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold text-muted-foreground">
        Checkout cancelled
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
        No payment was made
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        You can return to your bookings and try again whenever you are ready.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard/customer/bookings">Back to My Bookings</Link>
      </Button>
    </main>
  );
}
