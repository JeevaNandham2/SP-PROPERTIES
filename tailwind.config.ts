import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.ts", "./lib/**/*.ts"],
  theme: {
    extend: {
      colors: {
        white: "#FBF8F2",
        navy: { DEFAULT: "#1E2F5B", dark: "#1E2F5B", deep: "#1E2F5B" },
        gold: { DEFAULT: "#F9BF2C", hover: "#F9BF2C", tint: "rgb(249 191 44 / 0.12)" },
        soft: "#FBF8F2",
        line: "rgb(30 47 91 / 0.16)",
        ink: "#1E2F5B",
        body: "#1E2F5B",
        muted: "rgb(30 47 91 / 0.72)",
        mist: "#FBF8F2",
        error: "#1E2F5B",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        eyebrow: ["12.5px", { lineHeight: "1.4", letterSpacing: "0.22em", fontWeight: "600" }],
      },
      maxWidth: { container: "1280px" },
      borderRadius: { card: "4px" },
      boxShadow: { float: "0 8px 24px rgb(30 47 91 / 0.18)" },
      keyframes: { rise: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "none" } } },
      animation: { rise: "rise .5s ease both" },
    },
  },
  plugins: [],
};
export default config;
