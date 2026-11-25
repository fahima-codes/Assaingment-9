"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const THEMES = ["light", "dark", "system"] as const;

export function ModeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const currentTheme = THEMES.find((candidate) => candidate === theme) ?? "system";
  const nextTheme = THEMES[(THEMES.indexOf(currentTheme) + 1) % THEMES.length];

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      disabled={!mounted}
      onClick={() => setTheme(nextTheme)}
    >
      {resolvedTheme === "dark" ? (
        <Moon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Sun className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  );
}
