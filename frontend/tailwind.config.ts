import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17212B",
        field: "#F6F8FB",
        line: "#D8E0EA",
        safety: "#0F766E",
        cobalt: "#2563EB",
        ember: "#EA580C",
      },
      boxShadow: {
        panel: "0 12px 32px rgba(23, 33, 43, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
