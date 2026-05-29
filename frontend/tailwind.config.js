/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: "rgba(255, 255, 255, 0.1)",
        glassborder: "rgba(255, 255, 255, 0.2)",
        darkglass: "rgba(0, 0, 0, 0.3)",
        primary: "#4F46E5",
        secondary: "#10B981",
        background: "#0F172A",
        surface: "#1E293B",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: "0 4px 30px rgba(0, 0, 0, 0.1)",
        neon: "0 0 15px rgba(79, 70, 229, 0.5)",
      },
      backdropBlur: {
        md: "10px",
      }
    },
  },
  plugins: [],
}
