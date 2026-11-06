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
          red: {
            50: "rgb(var(--faso-red-50) / <alpha-value>)",
            100: "rgb(var(--faso-red-100) / <alpha-value>)",
            200: "rgb(var(--faso-red-200) / <alpha-value>)",
            300: "rgb(var(--faso-red-300) / <alpha-value>)",
            400: "rgb(var(--faso-red-400) / <alpha-value>)",
            DEFAULT: "rgb(var(--faso-red) / <alpha-value>)",
            700: "rgb(var(--faso-red-700) / <alpha-value>)",
            800: "rgb(var(--faso-red-800) / <alpha-value>)",
            900: "rgb(var(--faso-red-900) / <alpha-value>)",
            950: "rgb(var(--faso-red-950) / <alpha-value>)",
          },
          gold: {
            50: "rgb(var(--faso-gold-50) / <alpha-value>)",
            100: "rgb(var(--faso-gold-100) / <alpha-value>)",
            200: "rgb(var(--faso-gold-200) / <alpha-value>)",
            300: "rgb(var(--faso-gold-300) / <alpha-value>)",
            400: "rgb(var(--faso-gold-400) / <alpha-value>)",
            DEFAULT: "rgb(var(--faso-gold) / <alpha-value>)",
            700: "rgb(var(--faso-gold-700) / <alpha-value>)",
            800: "rgb(var(--faso-gold-800) / <alpha-value>)",
            900: "rgb(var(--faso-gold-900) / <alpha-value>)",
            950: "rgb(var(--faso-gold-950) / <alpha-value>)",
          },
          "red-dark": "rgb(var(--faso-red-dark) / <alpha-value>)",
          "red-soft": "rgb(var(--faso-red-soft) / <alpha-value>)",
          green: "rgb(var(--faso-green) / <alpha-value>)",
          "green-dark": "rgb(var(--faso-green-dark) / <alpha-value>)",
          "green-soft": "rgb(var(--faso-green-soft) / <alpha-value>)",
          "gold-dark": "rgb(var(--faso-gold-dark) / <alpha-value>)",
          "gold-soft": "rgb(var(--faso-gold-soft) / <alpha-value>)",
        },
        clay: {
          50: "rgb(var(--clay-50) / <alpha-value>)",
          100: "rgb(var(--clay-100) / <alpha-value>)",
          200: "rgb(var(--clay-200) / <alpha-value>)",
          300: "rgb(var(--clay-300) / <alpha-value>)",
          400: "rgb(var(--clay-400) / <alpha-value>)",
          500: "rgb(var(--clay-500) / <alpha-value>)",
          600: "rgb(var(--clay-600) / <alpha-value>)",
          700: "rgb(var(--clay-700) / <alpha-value>)",
          800: "rgb(var(--clay-800) / <alpha-value>)",
          900: "rgb(var(--clay-900) / <alpha-value>)",
          950: "rgb(var(--clay-950) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          soft: "rgb(var(--ink-soft) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
        },
        state: {
          success: "rgb(var(--state-success) / <alpha-value>)",
          warning: "rgb(var(--state-warning) / <alpha-value>)",
          danger: "rgb(var(--state-danger) / <alpha-value>)",
          info: "rgb(var(--state-info) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      backgroundImage: {
        "faso-gradient":
          "linear-gradient(135deg, rgb(var(--faso-red)) 0%, rgb(var(--faso-gold-dark)) 48%, rgb(var(--faso-green)) 100%)",
        "faso-radial":
          "radial-gradient(1200px 600px at 15% -10%, rgb(var(--faso-gold) / 0.28), transparent 60%), radial-gradient(1000px 500px at 95% 0%, rgb(var(--faso-green) / 0.22), transparent 55%)",
        "clay-texture":
          "linear-gradient(180deg, rgba(251,246,239,0) 0%, rgba(245,233,218,0.6) 100%)",
      },
      boxShadow: {
        premium: "var(--shadow-2)",
        "premium-lg": "var(--shadow-3)",
        glow: "var(--shadow-brand)",
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
