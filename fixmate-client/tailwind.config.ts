import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: "#f97316",
        background: "#f8fafc",
        foreground: "#0f172a",
        primary: {
          DEFAULT: "#f97316",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#eef2f7",
          foreground: "#0f172a",
        },
        destructive: {
          DEFAULT: "#dc2626",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#eef2f7",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#fff4ec",
          foreground: "#0f172a",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
