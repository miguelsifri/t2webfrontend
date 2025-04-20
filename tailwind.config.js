/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts}"],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#1e293b',
        accent: '#38bdf8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
