import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A12",
        base: "#0F0F1A",
        panel: "#13131F",
        panel2: "#1B1B29",
        surface: "#222236",
        line: "#26263A",
        mist: "#9A96B3",
        paper: "#F3F1FA",
        violet: "#7C5CFF",
        violet2: "#5B3DE0",
        coral: "#FF4F79",
        gold: "#FFC24B",
        teal: "#3CE7C0",
        // Semantic aliases used across components
        accent: "#7C5CFF",
        primary: "#7C5CFF",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      backgroundImage: {
        spectra:
          "linear-gradient(90deg,#7C5CFF 0%,#5B3DE0 22%,#FF4F79 48%,#FFC24B 74%,#3CE7C0 100%)"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,92,255,0.25), 0 20px 60px -20px rgba(124,92,255,0.45)"
      },
      keyframes: {
        drift: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" }
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        drift: "drift 6s linear infinite",
        rise: "rise .5s ease-out both"
      }
    }
  },
  plugins: []
};
export default config;
