import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        indigo_velvet: {
          DEFAULT: '#3d348b',
          100: '#0c0a1c',
          200: '#181437',
          300: '#241f53',
          400: '#30296e',
          500: '#3d348b',
          600: '#5044b9',
          700: '#7b72cb',
          800: '#a7a1dc',
          900: '#d3d0ee',
        },
        medium_slate_blue: {
          DEFAULT: '#7678ed',
          100: '#08093f',
          200: '#10127e',
          300: '#191bbe',
          400: '#383be5',
          500: '#7678ed',
          600: '#9394f1',
          700: '#aeaff4',
          800: '#c9caf8',
          900: '#e4e4fb',
        },
        amber_flame: {
          DEFAULT: '#f7b801',
          100: '#322500',
          200: '#634b00',
          300: '#957001',
          400: '#c79501',
          500: '#f7b801',
          600: '#feca30',
          700: '#fed864',
          800: '#fee597',
          900: '#fff2cb',
        },
        tiger_orange: {
          DEFAULT: '#f18701',
          100: '#301b00',
          200: '#5f3600',
          300: '#8f5101',
          400: '#bf6d01',
          500: '#f18701',
          600: '#fea128',
          700: '#feb95e',
          800: '#fed093',
          900: '#ffe8c9',
        },
        cayenne_red: {
          DEFAULT: '#f35b04',
          100: '#301201',
          200: '#602401',
          300: '#913602',
          400: '#c14903',
          500: '#f35b04',
          600: '#fc792e',
          700: '#fd9b62',
          800: '#fdbc97',
          900: '#fedecb',
        },
        navy: {
          950: '#060f1e',
          900: '#09182d',
          800: '#0c2340',
          700: '#162a45',
          600: '#1e3a5f',
        },
        gold: {
          DEFAULT: '#e2a02b',
          400: '#f1b343',
          500: '#e2a02b',
          600: '#d99b26',
          700: '#b8801c',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          'Plus Jakarta Sans',
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: [
          'Plus Jakarta Sans',
          'Inter',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        handwriting: ['Caveat', 'cursive'],
        signature: ['"Alex Brush"', '"Great Vibes"', 'cursive'],
      },
      maxWidth: {
        '8xl': '88rem', // 1408px
        '9xl': '96rem', // 1536px
        'content': '1600px', // 10% reduced from 1780px navigation
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        '9999': '9999',
        'modal': '99999',
      },
      backgroundImage: {
        'indian-jaali': "radial-gradient(#f7b801 0.75px, transparent 0.75px), radial-gradient(#3d348b 0.75px, #fafaf9 0.75px)",
      },
    },
  },
  plugins: [],
};

export default config;
