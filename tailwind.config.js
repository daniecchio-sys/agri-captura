/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Verde campo oscuro — tema principal
        campo: {
          50:  '#f0f7f2',
          100: '#d8eede',
          200: '#b4ddc1',
          300: '#82c49d',
          400: '#4ea375',
          500: '#2d8556',
          600: '#1f6b42',
          700: '#1a5435',
          800: '#163f28',
          900: '#0f2a1b',
          950: '#071610',
        },
        tierra: {
          100: '#f5ede0',
          300: '#d4a96a',
          500: '#a0722a',
          700: '#6b4a18',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      screens: {
        // Mobile-first breakpoints
        xs: '375px',
      },
    },
  },
  plugins: [],
}
