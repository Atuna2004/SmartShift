import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "#d8dee8",
        surface: "#ffffff",
        muted: "#667085",
        ink: "#182230",
        brand: {
          50: "#eef8ff",
          100: "#d9efff",
          500: "#1677c8",
          600: "#0f63a8",
          700: "#0d4f87",
        },
      },
      boxShadow: {
        panel: "0 1px 2px rgba(16, 24, 40, 0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
