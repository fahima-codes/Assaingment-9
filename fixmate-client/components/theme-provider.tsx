"use client";

import {
  ThemeProvider as NextThemesProvider,
  useTheme,
} from "next-themes";
import type { ComponentProps } from "react";
import { Toaster } from "sonner";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function ThemeToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      richColors
      position="top-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}
