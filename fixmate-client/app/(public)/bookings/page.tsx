import Link from "next/link";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface Booking {
  _id?: string;
  serviceTitle?: string;
  serviceImage?: string;
  status?: string;
  paymentStatus?: string;
  finalAmount?: number;
  createdAt?: string;
}

export default async function BookingsPage() {
  let bookings: Booking[] = [];

  try {
    const data = await api.get<Booking[] | { bookings?: Booking[] }>(
      "/api/bookings/my",
      { cache: "no-store" },
    );
    bookings = Array.isArray(data) ? data : (data?.bookings ?? []);
  } catch {
    bookings = [];
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        My Bookings
      </h1>
      <p className="mt-2 text-muted-foreground">
        Track the repair requests you have placed with FixMate.
      </p>

      {bookings.length > 0 ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {bookings.map((booking) => (
            <Card key={booking._id ?? booking.serviceTitle}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {booking.serviceImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={booking.serviceImage}
                      alt={booking.serviceTitle ?? "Service"}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : null}
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {booking.serviceTitle}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Status: {booking.status ?? "requested"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Payment: {booking.paymentStatus ?? "unpaid"}
                    </p>
                    {typeof booking.finalAmount === "number" ? (
                      <p className="text-sm font-medium text-foreground">
                        Amount: ${booking.finalAmount}
                      </p>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed bg-card p-12 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            No bookings yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You have not placed any repair requests yet.
          </p>
          <Button asChild className="mt-6">
            <Link href="/services">Book a service</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
