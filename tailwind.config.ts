import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identité Burkina Faso — drapeau rouge / vert / étoile d'or,
        // rehaussée de tons terre de Barsalogho et sable du Sahel.
        faso: {
          red: "#D62828",
          "red-dark": "#9E1B1B",
          "red-soft": "#F4B5B5",
          green: "#1F9254",
          "green-dark": "#136A3B",
          "green-soft": "#B7E4C7",
          gold: "#F4A93C",
          "gold-dark": "#C97F16",
          "gold-soft": "#FBE3B8",
        },
        clay: {
          50: "#FBF6EF",
          100: "#F5E9DA",
          200: "#E9D2B5",
          300: "#DAB588",
          400: "#C9945C",
          500: "#B5773B",
          600: "#985E2E",
          700: "#7A4A27",
          800: "#5E3A22",
          900: "#3D261A",
          950: "#241510",
        },
        ink: {
          DEFAULT: "#1A1109",
          soft: "#4A3F33",
          muted: "#7A6E5F",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      backgroundImage: {
        "faso-gradient":
          "linear-gradient(135deg, #D62828 0%, #C97F16 45%, #1F9254 100%)",
        "faso-radial":
          "radial-gradient(1200px 600px at 15% -10%, rgba(244,169,60,0.28), transparent 60%), radial-gradient(1000px 500px at 95% 0%, rgba(31,146,84,0.22), transparent 55%)",
        "clay-texture":
          "linear-gradient(180deg, rgba(251,246,239,0) 0%, rgba(245,233,218,0.6) 100%)",
      },
      boxShadow: {
        premium:
          "0 1px 2px rgba(26,17,9,0.04), 0 12px 32px -12px rgba(26,17,9,0.18)",
        "premium-lg":
          "0 2px 4px rgba(26,17,9,0.05), 0 32px 64px -24px rgba(26,17,9,0.28)",
        glow: "0 0 0 1px rgba(244,169,60,0.35), 0 16px 48px -12px rgba(214,40,40,0.35)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.75rem",
      },
      keyframes: {
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "gradient-pan": "gradient-pan 12s ease infinite",
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
