/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./_includes/**/*.html', './_layouts/**/*.html', './*.html', './assets/js/**/*.js'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        ground: '#07080c',
        panel: '#1a1c22',
        ink: '#eef1f6',
        muted: '#b4bccb',
        accent: '#8ec8ff',
        line: 'rgba(255, 255, 255, 0.14)',
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      maxWidth: {
        content: '76rem',
        prose: '40rem',
      },
    },
  },
  plugins: [],
};
