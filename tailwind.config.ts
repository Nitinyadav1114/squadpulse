import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        daily: {
          DEFAULT: "hsl(var(--daily-primary) / <alpha-value>)",
          primary: "hsl(var(--daily-primary) / <alpha-value>)",
          secondary: "hsl(var(--daily-secondary) / <alpha-value>)",
          accent: "hsl(var(--daily-accent) / <alpha-value>)",
          surface: "hsl(var(--daily-surface) / <alpha-value>)",
          border: "hsl(var(--daily-border) / <alpha-value>)",
          light: "#ecfdf5",
          dark: "#065f46",
        },
        study: {
          DEFAULT: "hsl(var(--study-primary) / <alpha-value>)",
          primary: "hsl(var(--study-primary) / <alpha-value>)",
          secondary: "hsl(var(--study-secondary) / <alpha-value>)",
          accent: "hsl(var(--study-accent) / <alpha-value>)",
          surface: "hsl(var(--study-surface) / <alpha-value>)",
          border: "hsl(var(--study-border) / <alpha-value>)",
          light: "#eff6ff",
          dark: "#1e40af",
        },
        fun: {
          DEFAULT: "hsl(var(--fun-primary) / <alpha-value>)",
          primary: "hsl(var(--fun-primary) / <alpha-value>)",
          secondary: "hsl(var(--fun-secondary) / <alpha-value>)",
          accent: "hsl(var(--fun-accent) / <alpha-value>)",
          surface: "hsl(var(--fun-surface) / <alpha-value>)",
          border: "hsl(var(--fun-border) / <alpha-value>)",
          light: "#fdf2f8",
          dark: "#9d174d",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "pulse-subtle": "pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
