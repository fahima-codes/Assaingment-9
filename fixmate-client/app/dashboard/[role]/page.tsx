import { notFound } from "next/navigation";

import { ProtectedDashboard } from "@/components/protected-dashboard";
import { isAuthRole } from "@/lib/auth-session";

interface DashboardPageProps {
  params: {
    role: string;
  };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  if (!isAuthRole(params.role)) {
    notFound();
  }

  return <ProtectedDashboard role={params.role} />;
}
