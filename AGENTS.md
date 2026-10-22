# Notes for coding agents

Read `README.md` first. It explains the structure, how to add or launch a project, the search and AI-assistant files, and how the site deploys.

## Rules

- Edit content in `_data/*.yml`, not in templates, unless the layout itself changes. `llms.txt`, `llms-full.txt`, and the structured data are generated from the same data; do not hand-write their content.
- After changing a template, a Tailwind class, or `src/styles/main.css`, run `npm run build:css` and commit `assets/css/site.css`.
- Run `npm run test:unit`, build the site (`npm run build` or `npm run docker:build`), then run `npm run test:site`. Do not commit with failing tests.
- GitHub Pages runs its own Jekyll 3.10 with a fixed plugin list. Do not add `_plugins/`, Sass, or gems the `github-pages` gem does not include. Keep `theme: null` in `_config.yml`. Jekyll 3 include parameters cannot take filters; assign first.
- Keep the professional voice: no slang, crypto shorthand, or profanity, and no claims the work does not show. Agentic AI development stays the lead capability and the first featured project.
- Security claims about agentic work stay within the confirmed facts in the `_data/agentic.yml` header comment. Add certifications, hosting, or encryption claims only after the owner confirms them.
- Keep the night ridge in the hero and the dark glass theme. Do not animate `backdrop-filter`, and keep the reduced-motion and reduced-transparency fallbacks working.
- Images go through `scripts/optimize_image.py`, stay under 500 KB, and need descriptive alt text. Every project needs an `og.jpg` link preview.
- Never link to a client's unlaunched preview site; use `launch_url` until it is live.
- Keep titles at 70 characters or fewer and descriptions between 50 and 160, and bump `last_modified_at` on pages whose content changes.
- Add a row to the Agent update log at the end of `README.md` describing the change and how you verified it.
