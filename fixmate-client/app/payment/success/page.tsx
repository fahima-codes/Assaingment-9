import { PaymentSuccess } from "@/components/payment-success";

export const dynamic = "force-dynamic";

interface PaymentSuccessPageProps {
  searchParams: {
    session_id?: string;
  };
}

export default function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  return <PaymentSuccess sessionId={searchParams?.session_id} />;
}
