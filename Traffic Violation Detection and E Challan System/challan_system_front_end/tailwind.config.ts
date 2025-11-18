// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        brand: "var(--brand)",
        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Lato", "sans-serif"],
      },
    },
  },
  darkMode: "media",
  plugins: [],
};

export default config;
