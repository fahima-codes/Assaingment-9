import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FixMate",
    template: "%s | FixMate",
  },
  description: "FixMate - connect people who need help fixing things with trusted repair experts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans antialiased">{children}</body>
      <Toaster richColors position="top-right" />
    </html>
  );
}
