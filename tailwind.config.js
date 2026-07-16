/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f4f7fc',
        panel: '#ffffff',
        panel2: '#eef2fa',
        line: '#d7e0f0',
        lineSoft: '#e4eaf6',
        text: '#0b1a3a',
        muted: '#5b6a8c',
        brand: '#1f5fd6',
        brandSoft: '#dbe9ff',
        brandDim: '#e8f0ff',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xl2: '18px',
      },
    },
  },
  plugins: [],
};
