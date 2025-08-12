/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(240, 80%, 50%)',
        accent: 'hsl(160, 70%, 45%)',
        bg: 'hsl(230, 15%, 95%)',
        surface: 'hsl(230, 15%, 100%)',
        'text-primary': 'hsl(230, 15%, 10%)',
        'text-secondary': 'hsl(230, 15%, 40%)',
      },
      fontSize: {
        'display': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5rem' }],
        'caption': ['0.875rem', { lineHeight: '1.25rem' }],
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
      },
      spacing: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(230, 15%, 10%, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-in-out',
        'slide-up': 'slideUp 200ms ease-in-out',
      },
    },
  },
  plugins: [],
}
