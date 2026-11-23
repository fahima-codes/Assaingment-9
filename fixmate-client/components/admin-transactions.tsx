"use client";

import { useEffect, useState } from "react";
import { CreditCard, DollarSign, Search, TrendingUp, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardStatCard } from "@/components/dashboard-stat-card";
import { api } from "@/lib/api";
import { useAdminSession } from "@/lib/use-admin-session";

interface PaymentRecord {
  _id: string;
  bookingId: string;
  serviceTitle: string;
  customerName?: string;
  customerEmail: string;
  technicianName?: string;
  technicianEmail: string;
  amount: number;
  currency: string;
  transactionId?: string;
  stripeSessionId: string;
  paymentStatus: string;
  paidAt: string;
}

interface AdminPaymentsResponse {
  payments: PaymentRecord[];
  totalRevenue: number;
}

export function AdminTransactions() {
  const user = useAdminSession("/dashboard/admin/transactions");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;

    let isActive = true;
    setIsLoading(true);

    const loadPayments = async () => {
      try {
        const response = await api.get<AdminPaymentsResponse>(
          "/api/admin/payments",
          { cache: "no-store" },
        );
        if (isActive) {
          setPayments(response?.payments ?? []);
          setTotalRevenue(response?.totalRevenue ?? 0);
        }
      } catch (error) {
        if (isActive) {
          toast.error(
            error instanceof Error ? error.message : "Failed to load payments.",
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadPayments();
    return () => {
      isActive = false;
    };
  }, [user]);

  if (!user) {
    return (
      <main className="px-4 py-12" role="status">
        <p className="text-sm text-muted-foreground">Checking admin privileges...</p>
      </main>
    );
  }

  const filteredPayments = payments.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.serviceTitle.toLowerCase().includes(term) ||
      p.customerEmail.toLowerCase().includes(term) ||
      p.technicianEmail.toLowerCase().includes(term) ||
      (p.transactionId || "").toLowerCase().includes(term)
    );
  });

  const formatDate = (val?: string) => {
    if (!val) return "—";
    const date = new Date(val);
    return Number.isNaN(date.getTime())
      ? val
      : date.toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const formatCurrency = (amt: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amt);

  return (
    <DashboardLayout role="admin" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Platform Transactions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Audit Stripe payments, processed job settlements, and platform gross volume.
          </p>
        </div>

        {/* Revenue Banner & Key Stats */}
        <div className="grid gap-5 sm:grid-cols-3">
          <DashboardStatCard
            icon={DollarSign}
            label="Gross Platform Revenue"
            value={isLoading ? "..." : formatCurrency(totalRevenue)}
            description="Verified via Stripe Checkout and Webhooks"
          />
          <DashboardStatCard
            icon={CheckCircle}
            label="Successful Transactions"
            value={isLoading ? "..." : String(payments.length)}
            description="100% completed after repair delivery"
          />
          <DashboardStatCard
            icon={TrendingUp}
            label="Average Job Value"
            value={
              isLoading || payments.length === 0
                ? "..."
                : formatCurrency(Math.round(totalRevenue / payments.length))
            }
            description="Per completed service payment"
          />
        </div>

        {/* Search Bar */}
        <div className="flex rounded-xl border border-border bg-card p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by transaction ID, customer, technician, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading financial records...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 font-semibold text-foreground">No payments recorded</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No Stripe transactions match your query.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3.5">Service</th>
                    <th className="px-6 py-3.5">Customer (Payer)</th>
                    <th className="px-6 py-3.5">Technician (Recipient)</th>
                    <th className="px-6 py-3.5">Stripe Transaction ID</th>
                    <th className="px-6 py-3.5">Date Paid</th>
                    <th className="px-6 py-3.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPayments.map((p) => (
                    <tr key={p._id} className="hover:bg-muted/20">
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {p.serviceTitle}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-foreground">{p.customerName || "Customer"}</p>
                        <p className="text-xs text-muted-foreground">{p.customerEmail}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-foreground">{p.technicianName || "Technician"}</p>
                        <p className="text-xs text-muted-foreground">{p.technicianEmail}</p>
                      </td>
                      <td className="px-6 py-4">
                        <code className="rounded bg-muted px-2 py-1 text-xs font-mono text-foreground">
                          {p.transactionId || p.stripeSessionId.slice(0, 18) + "..."}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {formatDate(p.paidAt)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">
                        ${p.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
