import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "#dbe3ef",
        canvas: "#f7f8fc",
        field: "#f2f5fa",
        surface: "#ffffff",
        muted: "#64748b",
        subtle: "#94a3b8",
        ink: "#101828",
        brand: {
          50: "#f1efff",
          100: "#e7e4ff",
          200: "#d6d0ff",
          500: "#5b45ff",
          600: "#4f39f6",
          700: "#432dd7",
        },
      },
      boxShadow: {
        panel: "0 10px 30px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.08)",
        action: "0 10px 18px rgba(79, 57, 246, 0.22)",
      },
      borderRadius: {
        panel: "12px",
      },
    },
  },
  plugins: [],
} satisfies Config;
