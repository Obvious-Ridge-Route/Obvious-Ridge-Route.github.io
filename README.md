# Obvious Ridge Route website

The studio site at [obviousridgeroute.com](https://obviousridgeroute.com). It is a Jekyll site with Tailwind CSS, published by GitHub Pages from the `main` branch. Agentic AI development is the lead capability; the rest of the site supports that story with product work and a direct line to Mike.

The name is a climbing reference: the obvious route up a ridge. The night ridge in the hero (`assets/images/ridge.jpg`) is the brand image, so keep a mountain there.

## What lives where

| Path | What it holds |
| --- | --- |
| `_data/projects.yml` | Every project, in display order. The three with `featured: true` are the large homepage cards; the rest are listed under More work. |
| `_data/capabilities.yml` | Homepage capabilities. Agentic AI development stays first. |
| `_data/agentic.yml` | The Agentic AI band under the hero: heading, four steps, proof link. |
| `_data/process.yml`, `_data/navigation.yml` | How we work, and the header and footer links. |
| `index.html` | Homepage sections. |
| `<project-id>.html` | One short file per case study; the content comes from `projects.yml`. |
| `_layouts/`, `_includes/` | Page shells, head tags, header, footer, contact form. |
| `src/styles/main.css` | Tailwind source: the dark glass theme, sheen, scroll reveal, and motion fallbacks. |
| `assets/css/site.css` | Compiled CSS. Generated, but committed, because GitHub Pages does not run Tailwind. |
| `assets/js/` | `site.js` (nav, menu, reveal, steps, parallax), `steps.js` (scroll math), `contact.js` (form). |
| `assets/images/projects/<id>/` | Optimized WebP images for each project. |
| `tests/` | Unit tests and built-site tests, run by `npm test` and in CI. |
| `scripts/` | `optimize_image.py` (images to WebP) and `jekyll-docker.sh` (build or preview without installing Ruby). |

## Common updates

### Add a project

1. Save images to `assets/images/projects/<id>/`. Each needs a `card`, `hero`, and `overview`; `design` and a `gallery` are optional.

   ```sh
   python3 scripts/optimize_image.py ~/Desktop/hero.png assets/images/projects/<id>/hero.webp --width 1600
   ```

   Browser screenshots of sites without a page background come out partly transparent. Add `--flatten white` for those. Keep every image under 500 KB; the tests enforce it.

2. Add an entry to `_data/projects.yml`, copying the shape of an existing one. Every case study answers what the product is (`intro`), what we did (`role`), and what shipped (`delivered`). Only add `built_with` when the stack is confirmed.
3. Create `<id>.html`:

   ```yaml
   ---
   layout: project
   project: <id>
   permalink: /<id>
   ---
   ```

4. To feature it on the homepage, set `featured: true` and remove it from another project. Exactly three are featured, and the first should show agentic AI work.
5. Run `npm run build:css`, then the tests.

### Turn on the contact form

Create a form at [formspree.io](https://formspree.io), then paste its id (the part after `/f/`) into `formspree_id` in `_config.yml`. With it empty, the contact section shows only the email link. The form shows "Message sent" only after Formspree accepts the message.

### Change copy or styles

Copy lives in `_data/` and the HTML files. Styles live in `src/styles/main.css` and Tailwind classes in the templates. After either kind of change, run `npm run build:css` and commit `assets/css/site.css`; a test fails if it is stale.

## Develop, build, and test

Requirements: Node 20.9 or newer, plus either Ruby 3.3 with Bundler or Docker.

```sh
npm install
npm run build:css        # compile Tailwind to assets/css/site.css

# With Ruby 3.3:
bundle install
npm run dev              # watch CSS and serve http://localhost:4000
npm run build            # CSS + Jekyll build into _site/

# Without Ruby (Docker):
npm run docker:serve     # http://localhost:4000
npm run docker:build

npm test                 # unit tests, then built-site tests (needs a _site build)
```

`npm run test:unit` checks content data, banned slang and profanity, GitHub Pages compatibility, the contact and step logic, color contrast, and that the compiled CSS matches its sources. `npm run test:site` checks the built pages: one `h1` each, metadata, images and alt text, internal links and section anchors, external link safety, the sitemap, and that no repository files are published.

## Deploy

Pushing to `main` publishes the site: GitHub Pages builds it with the `github-pages` gem (Jekyll 3.10). The `Gemfile` pins that same gem. `_config.yml` sets `theme: null`; without it, Pages applies its default Primer theme, which publishes its own stylesheet over the site's.

The CI workflow (`.github/workflows/ci.yml`) builds and tests every push and pull request. It cannot stop a branch build that has already been pushed, so either:

- protect `main` and require the CI check on pull requests, or
- switch Settings > Pages > Source to GitHub Actions and add the repository variable `PAGES_DEPLOY=actions`. The workflow's deploy job then publishes only after the tests pass.

## Conventions

- **Voice.** A professional software studio. No slang, crypto shorthand, or profanity; `tests/unit/copy.test.js` lists the banned words. Claim only what the work shows.
- **Design.** One dark glass theme. Glass panels sit over the ridge and two fixed light blooms. Use glass for panels, not whole pages. Blur is never animated; motion comes from a short sheen, scroll reveal, and the four Agentic AI steps.
- **Motion and access.** Everything works without JavaScript. `prefers-reduced-motion` turns motion off; `prefers-reduced-transparency` and browsers without `backdrop-filter` get solid panels. Keep one `h1` per page and descriptive alt text.
- **mymember.site** stays in More work and never shows imagery outside its own page.

## Agent update log

Coding agents add a row here for every change they make, newest first. Note what changed and how it was verified.

| Date | Agent | Change | Verification |
| --- | --- | --- | --- |
| 2026-10-22 | Cursor agent (Claude) | Rebuilt the site around agentic AI development: new dark glass design with sheen, scroll reveal, and scroll-linked Agentic AI steps; a generated high-resolution night ridge hero; SiteSpecs AI and the Kenneth C. Griffin Applied Economics Incubator added, and Site Specs refreshed from sitespecs.io; professional rewrite of all copy; single projects data file; all images converted to WebP (about 80 MB down to 5 MB); Formspree-ready contact form that never fakes success; fixed email domain, logo link, nav links, metadata, sitemap, and 404; removed Swiper, Sass, and the unused Minima theme; set `theme: null` so the default Primer theme cannot replace the stylesheet; added unit and built-site tests, a Docker build script, and CI. | `npm run test:unit` (57 passing) and `npm run test:site` (85 passing) on a `github-pages` 232 / Jekyll 3.10 build; checked in the browser at 1120px and 390px, including the mobile menu and Escape-to-close. |
