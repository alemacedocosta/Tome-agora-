
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '16px',
        'md': '16px',
        'lg': '16px',
        'xl': '16px',
        '2xl': '16px',
        '3xl': '16px',
        'full': '9999px',
        'custom': '16px',
      },
    },
  },
  plugins: [],
}
