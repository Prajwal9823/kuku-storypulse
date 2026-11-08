import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#090D16",
        surface: {
          DEFAULT: "#111827",
          hover: "#1A2338",
          card: "#0F172A",
          border: "#1E293B",
          subtle: "#162032",
        },
        violet: {
          accent: "#8B5CF6",
          glow: "#7C3AED",
          light: "#A78BFA",
        },
        coral: {
          accent: "#F43F5E",
          glow: "#E11D48",
          light: "#FB7185",
        },
        emerald: {
          accent: "#10B981",
          subtle: "#064E3B",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;

