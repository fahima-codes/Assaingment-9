import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">FixMate</CardTitle>
          <CardDescription>
            The FixMate client is up and running.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Backend API: <code>{process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}</code>
          </p>
          <Button asChild>
            <a
              href={process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}
              target="_blank"
              rel="noopener noreferrer"
            >
              Check backend status
            </a>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
