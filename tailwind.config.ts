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
        violet: "#22C55E",
        violet2: "#16A34A",
        coral: "#FF4F79",
        gold: "#FFC24B",
        teal: "#FACC15",
        // Semantic aliases used across components
        accent: "#22C55E",
        primary: "#22C55E",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"]
      },
      backgroundImage: {
        spectra:
          "linear-gradient(90deg, #22C55E 0%, #4ADE80 30%, #FACC15 60%, #EAB308 100%)",
        rgb:
          "linear-gradient(90deg, #22C55E 0%, #4ADE80 30%, #FACC15 60%, #EAB308 100%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34,197,94,0.3), 0 20px 60px -20px rgba(250,204,21,0.3)",
        "rgb-glow": "0 0 15px rgba(34,197,94,0.4), 0 0 30px rgba(250,204,21,0.3)"
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
