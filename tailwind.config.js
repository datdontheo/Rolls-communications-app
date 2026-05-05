/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        bg: {
          default: 'var(--color-bg-default)',
          card: 'var(--color-bg-card)',
          sidebar: 'var(--color-bg-sidebar)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          sidebar: 'var(--color-text-sidebar)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
