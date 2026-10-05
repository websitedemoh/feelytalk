/* Tailwind build config – every colour points at a CSS variable defined in assets/css/site.css */
module.exports = {
  content: ['../../*.html', '../../assets/js/components.js'],
  theme: {
    extend: {
      colors: {
        brand: { 400: 'var(--brand-400)', DEFAULT: 'var(--brand-500)', 500: 'var(--brand-500)', 600: 'var(--brand-600)' },
        tint: { 50: 'var(--tint-50)', 100: 'var(--tint-100)' },
        ghost: 'var(--ghost)',
        line: 'var(--line)',
        ink: 'var(--ink)',
        body: 'var(--text)',
        muted: 'var(--muted)',
        page: 'var(--bg)',
        surface: 'var(--surface)',
        white: 'var(--white)',
      },
      fontFamily: { sans: ['Nunito', 'system-ui', 'sans-serif'], hand: ['Caveat', 'cursive'] },
    },
  },
};
