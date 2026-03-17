import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
        },
        accent: {
          DEFAULT: '#EA580C',
          hover: '#C2410C',
        },
      },
      boxShadow: {
        'accent': '0 4px 14px rgba(79, 70, 229, 0.25)',
      },
      keyframes: {
        'shimmer-provision': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'shimmer-provision': 'shimmer-provision 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
