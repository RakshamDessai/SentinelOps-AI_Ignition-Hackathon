import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090d16",
        surface: {
          DEFAULT: "#0f172a",
          50: "#1e293b",
          100: "#141e33",
          200: "#0b1220",
        },
        primary: {
          DEFAULT: "#38bdf8",
          dark: "#0284c7",
          glow: "rgba(56, 189, 248, 0.15)",
        },
        danger: {
          DEFAULT: "#f43f5e",
          glow: "rgba(244, 63, 94, 0.2)",
        },
        warning: {
          DEFAULT: "#fbbf24",
          glow: "rgba(251, 191, 36, 0.15)",
        },
        success: {
          DEFAULT: "#10b981",
          glow: "rgba(16, 185, 129, 0.15)",
        },
        accent: {
          purple: "#a855f7",
          cyan: "#06b6d4",
          emerald: "#10b981",
        },
      },
      fontFamily: {
        mono: ['Consolas', 'Monaco', 'ui-monospace', 'SFMono-Regular', '"Segoe UI Mono"', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
