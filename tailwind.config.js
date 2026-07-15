/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0d0c',
        panel: '#101312',
        panel2: '#151918',
        line: '#232827',
        lineSoft: '#1c2120',
        text: '#e8eae9',
        muted: '#8b9390',
        brand: '#2fae66',
        brandSoft: '#1c3d2a',
        brandDim: '#173322'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      borderRadius: {
        xl2: '18px'
      }
    }
  },
  plugins: []
}
