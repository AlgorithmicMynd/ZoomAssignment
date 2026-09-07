import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'zoom-bg-primary': '#1C1C1E',
        'zoom-bg-secondary': '#232325',
        'zoom-bg-tertiary': '#2D2D2E',
        'zoom-bg-dark': '#0A0A0A',
        'zoom-text-primary': '#FFFFFF',
        'zoom-text-secondary': '#A0A0A0',
        'zoom-text-tertiary': '#6A6A6A',
        'zoom-brand-blue': '#0E72ED',
        'zoom-brand-orange': '#F26D21',
        'zoom-brand-green': '#23D959',
        'zoom-status-red': '#E02828',
        'zoom-border': '#3A3A3C',
        'zoom-hover': '#383838',
      },
    },
  },
  plugins: [],
};
export default config;
