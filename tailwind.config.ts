import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff8f1',
          100: '#dcf0df',
          200: '#bfe3c5',
          300: '#92cfa0',
          400: '#5eb375',
          500: '#28a45c',
          600: '#168348',
          700: '#12683b',
          800: '#115331',
          900: '#123b2b',
          950: '#082118',
        },
        ink: '#17251d',
      },
      boxShadow: {
        soft: '0 12px 34px rgba(18,59,43,.08)',
        dark: '0 12px 34px rgba(0,0,0,.35)',
      },
      borderRadius: {
        card: '20px',
      },
    },
  },
  plugins: [],
};

export default config;
