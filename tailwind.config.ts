import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2DD4BF', // Cyber-Thrift Teal (Future-Tech)
        'secondary': '#020617', // Deep Space Background
        'accent': '#A855F7', // Purple Energy
        'text': '#FFFFFF', // Pure White Text
        'surface': 'rgba(255, 255, 255, 0.05)', // Glass Surface
        'glow': 'rgba(45, 212, 191, 0.2)', // Primary Glow
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;



















