import { AuthForm } from "@/components/auth-form";

interface SignUpPageProps {
  searchParams: {
    redirect?: string;
  };
}

export const dynamic = "force-dynamic";

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  const redirect = searchParams?.redirect;

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sign Up
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create your FixMate account to book verified technicians.
        </p>

        <div className="mt-8">
          <AuthForm mode="signup" redirect={redirect} />
        </div>
      </div>
    </main>
  );
}
