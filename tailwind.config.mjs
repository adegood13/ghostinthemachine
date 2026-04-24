/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,svelte,md,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Ghost in the Machine brand palette. These four are the entire palette.
        'signal-black': '#0A0A0A',
        'ghost-white': '#F5F5F5',
        'static-teal': '#7A9BA8',
        'circuit-silver': '#B8B8B8',
      },
      fontFamily: {
        // Inter is the only typeface. No Helvetica or Arial fallback in UI.
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
      },
      fontSize: {
        'display-xl': ['clamp(2.75rem, 7vw, 5.5rem)', { lineHeight: '0.95', letterSpacing: '-0.04em', fontWeight: '900' }],
        'display-lg': ['clamp(2rem, 5vw, 3.75rem)', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-md': ['clamp(1.5rem, 3.5vw, 2.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '800' }],
      },
      maxWidth: {
        prose: '68ch',
      },
      animation: {
        'pulse-live': 'pulse-live 1.6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-live': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.9)' },
        },
      },
    },
  },
  plugins: [],
};
