# Notes for coding agents

Read `README.md` first. It explains the structure, how to add a project, and how the site deploys.

## Rules

- Edit content in `_data/*.yml`, not in templates, unless the layout itself changes.
- After changing a template, a Tailwind class, or `src/styles/main.css`, run `npm run build:css` and commit `assets/css/site.css`.
- Run `npm run test:unit`, build the site (`npm run build` or `npm run docker:build`), then run `npm run test:site`. Do not commit with failing tests.
- GitHub Pages runs its own Jekyll 3.10 with a fixed plugin list. Do not add `_plugins/`, Sass, or gems the `github-pages` gem does not include. Keep `theme: null` in `_config.yml`.
- Keep the professional voice: no slang, crypto shorthand, or profanity, and no claims the work does not show. Agentic AI development stays the lead capability.
- Keep the night ridge in the hero and the dark glass theme. Do not animate `backdrop-filter`, and keep the reduced-motion and reduced-transparency fallbacks working.
- Images go through `scripts/optimize_image.py`, stay under 500 KB, and need descriptive alt text.
- Add a row to the Agent update log at the end of `README.md` describing the change and how you verified it.
