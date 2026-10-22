module.exports = {
  plugins: [
    require('tailwindcss')('./tailwind.config.cjs'),
    require('autoprefixer'),
    require('cssnano')({ preset: 'default' }),
  ],
};
