/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sandal: {
          50: '#FAF4F1',
          100: '#F3DED5', // Very Soft Peach
          200: '#EAC7B8', // Soft Peach
          300: '#D5A492',
          400: '#C78B77',
          500: '#B97863', // Primary Sandal / Terracotta
          600: '#9E6252', // Deep Terracotta
          700: '#844E40',
          800: '#683B30',
          900: '#4E3A33', // Deep Warm Brown
        },
        terracotta: {
          light: '#C78B77',
          DEFAULT: '#B97863',
          deep: '#9E6252',
          dark: '#844E40',
        },
        peach: {
          soft: '#EAC7B8',
          verySoft: '#F3DED5',
          light: '#F8ECE7',
        },
        warm: {
          ivory: '#FCF8F4',
          cream: '#F7F0EA',
          brown: '#4E3A33',
          muted: '#806D64',
          sand: '#EFE6DE',
        },
        sage: {
          soft: '#DCE8DE',
          light: '#EDF4EE',
          DEFAULT: '#B4CCB8',
          text: '#667B6B',
          dark: '#4A5B4F',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 8px -2px rgba(78, 58, 51, 0.05), 0 1px 4px -1px rgba(78, 58, 51, 0.03)',
        'warm-sm': '0 2px 10px rgba(185, 120, 99, 0.06)',
        'warm-md': '0 8px 24px -4px rgba(185, 120, 99, 0.08), 0 4px 12px -2px rgba(78, 58, 51, 0.04)',
        'warm-lg': '0 16px 32px -8px rgba(78, 58, 51, 0.08), 0 6px 16px -4px rgba(185, 120, 99, 0.05)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
