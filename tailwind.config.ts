import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0d12",
        panel: "#121724",
        panel2: "#0f1420",
        brand: "#4f46e5",
        brand2: "#7c3aed",
      },
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,.35)",
      },
      borderRadius: {
        "2xl": "1rem",
      }
    },
  },
  plugins: [],
};
export default config;
