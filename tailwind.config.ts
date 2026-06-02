import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#f7f4ee",
        mint: "#56c596",
        coral: "#ef7b64",
        plum: "#6f5b8f",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(20, 20, 20, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
