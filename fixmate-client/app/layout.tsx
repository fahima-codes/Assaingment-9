import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider, ThemeToaster } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "FixMate",
    template: "%s | FixMate",
  },
  description:
    "FixMate - Smart Device & Home Appliance Repair Service Booking Platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className={`${inter.className} min-h-full flex flex-col font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <ThemeToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
