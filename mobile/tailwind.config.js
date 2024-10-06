/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        'eggshell': '#f4f1de',
        'burnt-sienna': '#e07a5f',
        'delft-blue': '#3d405b',
        'cambridge-blue': '#81b29a',
        'sunset': '#f2cc8f',
      },
      fontFamily: {
        'ubuntu': ['Ubuntu', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
