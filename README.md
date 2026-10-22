# Obvious Ridge Route website

The studio site at [obviousridgeroute.com](https://obviousridgeroute.com). It is a Jekyll site with Tailwind CSS, published by GitHub Pages from the `main` branch. Agentic AI development is the lead capability; the rest of the site supports that story with product work and a direct line to Mike.

The name is a climbing reference: the obvious route up a ridge. The night ridge in the hero (`assets/images/ridge.jpg`) is the brand image, so keep a mountain there.

## What lives where

| Path | What it holds |
| --- | --- |
| `_data/projects.yml` | Every project, in display order. Three or four with `featured: true` are the large homepage cards; the rest are listed under More work. |
| `_data/capabilities.yml` | Homepage capabilities. Agentic AI development stays first. Each can point at a case study and list short points. |
| `_data/agentic.yml` | The Agentic AI band under the hero and the whole `/agentic-ai` page, including its security section and FAQ. The header comment lists the security claims the owner has confirmed. |
| `_data/process.yml`, `_data/navigation.yml` | How we work, and the header and footer links. |
| `index.html`, `agentic-ai.html` | The homepage and the Agentic AI service page. |
| `<project-id>.html` | One short file per case study; the content comes from `projects.yml`. |
| `_layouts/`, `_includes/` | Page shells, head tags, structured data, header, footer, contact form. |
| `llms.txt`, `llms-full.txt`, `robots.txt` | Files for AI assistants and crawlers, generated from the same data as the pages. |
| `src/styles/main.css` | Tailwind source: the dark glass theme, sheen, scroll reveal, and motion fallbacks. |
| `assets/css/site.css` | Compiled CSS. Generated, but committed, because GitHub Pages does not run Tailwind. |
| `assets/js/` | `site.js` (nav, menu, reveal, steps, parallax), `steps.js` (scroll math), `contact.js` (form). |
| `assets/fonts/` | Self-hosted Poppins (SIL Open Font License). |
| `assets/images/projects/<id>/` | Optimized WebP images and the `og.jpg` link preview for each project. |
| `tests/` | Unit tests and built-site tests, run by `npm test` and in CI. |
| `scripts/` | `optimize_image.py` (images and link previews), `jekyll-docker.sh` (build without Ruby), `indexnow.py` (search engine notice). |

## Common updates

### Add a project

1. Save images to `assets/images/projects/<id>/`. Each needs a `card`, `hero`, and `overview`; `design` and a `gallery` are optional. A gallery needs 2, 3, 4, 6, 8, or 9 images so its rows fill evenly (2 and 4 show as two columns).

   ```sh
   python3 scripts/optimize_image.py ~/Desktop/hero.png assets/images/projects/<id>/hero.webp --width 1600
   python3 scripts/optimize_image.py assets/images/projects/<id>/card.webp assets/images/projects/<id>/og.jpg --og
   ```

   The second command makes the 1200×630 image shown when the page is shared. Browser screenshots of sites without a page background come out partly transparent; add `--flatten white` for those. Keep every image under 500 KB; the tests enforce it.

2. Add an entry to `_data/projects.yml`, copying the shape of an existing one. Every case study answers what the product is (`intro`), what we did (`role`), and what shipped (`delivered`). Only add `built_with` when the stack is confirmed. Add a `seo_title` if `title | Obvious Ridge Route` would run past 70 characters.
3. Create `<id>.html`:

   ```yaml
   ---
   layout: project
   project: <id>
   permalink: /<id>
   last_modified_at: 2026-10-22
   ---
   ```

4. To feature it on the homepage, set `featured: true`. Three or four projects are featured, and the first should show agentic AI work.
5. Run `npm run build:css`, then the tests.

### Launch a project that is still in preview

Before a site is live, give the project a `launch_url` instead of a `link`. The case study then says "Launching at fhpaschen.com" and links nowhere, so search engines are not sent to a preview. On launch day, rename `launch_url` to `link` in `_data/projects.yml` and bump `last_modified_at` on the project page. F.H. Paschen is in this state now.

### Turn on the contact form

Open the claim link below and sign in to Formspree. That creates the form with the same fields and rules as the site, delivering to mike@obviousridgeroute.com. Formspree then shows an endpoint like `https://formspree.io/f/abcd1234`. Paste the id (`abcd1234`) into `formspree_id` in `_config.yml`.

[Create the ORR contact form on Formspree](https://formspree.io/claim?name=ORR+Website+Contact&project=obvious-ridge-route&field.name=text,required,minlength:2,maxlength:100&field.email=email,required&field.need=text,required,maxlength:40&field.message=text,required,minlength:10,maxlength:5000&action.email=mike%40obviousridgeroute.com)

With `formspree_id` empty, the contact section shows only the email link. The form shows "Message sent" only after Formspree accepts the message. Formspree asks you to confirm the first submission by email.

### Change copy or styles

Copy lives in `_data/` and the HTML files. Styles live in `src/styles/main.css` and Tailwind classes in the templates. After either kind of change, run `npm run build:css` and commit `assets/css/site.css`; a test fails if it is stale. When a page's content changes, bump its `last_modified_at` so the sitemap reports it.

## Search and AI assistants

The site is built to be found and quoted by search engines and by AI assistants such as ChatGPT, Claude, Perplexity, and Copilot.

- **Structured data.** `_includes/structured-data.html` adds one JSON-LD graph to every page: the organization (founder, founding year, Chicago, services, and the `knows_about` topics in `_config.yml`), the website, each case study as a `CreativeWork` with breadcrumbs, and the `/agentic-ai` page as a `Service` with an `FAQPage` that matches the visible FAQ.
- **`llms.txt` and `llms-full.txt`.** A short summary and the full text of the site in Markdown, generated from `_data`, so they never drift from the pages.
- **`robots.txt`.** Allows every crawler and names the AI search and assistant crawlers explicitly.
- **Sitemap.** `jekyll-sitemap` publishes `/sitemap.xml` with each page's `last_modified_at`.
- **IndexNow.** After every push to `main`, CI waits for GitHub Pages to publish and then submits the sitemap to IndexNow (Bing, which also feeds ChatGPT search and Copilot). The key lives in `_config.yml` and its key file at the site root.
- **Profiles.** Add company profile URLs (LinkedIn, GitHub, Clutch) to `same_as` in `_config.yml`; they become `sameAs` links in the structured data.
- **Search consoles.** Paste the verification tokens from Google Search Console and Bing Webmaster Tools into `google_site_verification` and `bing_site_verification`, push, verify, and submit `https://obviousridgeroute.com/sitemap.xml` in both.

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

`npm run test:unit` checks content data, title and description lengths, banned slang and profanity, GitHub Pages compatibility, fonts and the IndexNow key, the contact and step logic, color contrast, and that the compiled CSS matches its sources. `npm run test:site` checks the built pages: one `h1` each, metadata, images and alt text, internal links and section anchors, external link safety, launch-pending projects, capability points, the Agentic AI security section, structured data and the FAQ, the sitemap dates, `robots.txt`, `llms.txt`, and that no repository files are published.

## Deploy

Pushing to `main` publishes the site: GitHub Pages builds it with the `github-pages` gem (Jekyll 3.10). The `Gemfile` pins that same gem. `_config.yml` sets `theme: null`; without it, Pages applies its default Primer theme, which publishes its own stylesheet over the site's.

The CI workflow (`.github/workflows/ci.yml`) builds and tests every push and pull request, then sends the IndexNow notice for `main`. It cannot stop a branch build that has already been pushed, so either:

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
| 2026-10-22 | Cursor agent (Claude) | Added the owner-confirmed agentic security points (secure agent harnesses, AI models that protect proprietary data, knowledge bases siloed per company) to the lead capability, the Agentic AI band, a new `/agentic-ai` security section, two FAQ entries, the SiteSpecs AI case study, and both `llms` files. Added SEO, GEO, and consent-based analytics points to the Software development capability, and F.H. Paschen's cookie consent and Google Analytics (verified in its code) to its case study. Moved `knowsAbout` into `_config.yml` and added "secure" to the company definition. Three-card grids no longer leave a card alone at tablet width. The Econ Incubator case study is unchanged until its analytics are confirmed. | `npm run test:unit` (74 passing) and `npm run test:site` (157 passing) on a `github-pages` 232 / Jekyll 3.10 build, including a new check that caught `llms.txt` running sentences together; checked the homepage and `/agentic-ai` in the browser at 1286px, 820px, and 390px. |
| 2026-10-22 | Cursor agent (Claude) | Galleries with 2, 4, or 8 images now use two columns so no image sits alone on the last row; F.H. Paschen's four screenshots show as a 2×2 grid. Added a site test that every gallery fills its rows. | `npm run test:unit` and `npm run test:site` on a `github-pages` 232 / Jekyll 3.10 build; checked `/fh-paschen` and `/sitespecs` galleries in the browser. |
| 2026-10-22 | Cursor agent (Claude) | Added the F.H. Paschen website as a fourth featured case study (captured from the preview at a 1440px desktop width so its navigation renders as designed, and shown as "Launching at fhpaschen.com" with no preview link). Added the `/agentic-ai` service page with use cases, connections, outputs, and an FAQ. Added SEO and AI-assistant support: JSON-LD (organization with founder Mike Reilly and 2013, website, case studies, breadcrumbs, service, FAQ), `llms.txt`, `llms-full.txt`, named AI crawlers in `robots.txt`, sitemap dates, keyword-first titles, per-project link previews, verification settings, and an IndexNow job in CI. Self-hosted Poppins, added an app icon, linked capabilities to case studies, and added a Formspree claim link for the contact form. | `npm run test:unit` (73 passing) and `npm run test:site` (152 passing) on a `github-pages` 232 / Jekyll 3.10 build; checked the homepage, `/agentic-ai`, and `/fh-paschen` in the browser at 1120px, and the main pages at 390px for overflow. |
| 2026-10-22 | Cursor agent (Claude) | Rebuilt the site around agentic AI development: new dark glass design with sheen, scroll reveal, and scroll-linked Agentic AI steps; a generated high-resolution night ridge hero; SiteSpecs AI and the Kenneth C. Griffin Applied Economics Incubator added, and Site Specs refreshed from sitespecs.io; professional rewrite of all copy; single projects data file; all images converted to WebP (about 80 MB down to 5 MB); Formspree-ready contact form that never fakes success; fixed email domain, logo link, nav links, metadata, sitemap, and 404; removed Swiper, Sass, and the unused Minima theme; set `theme: null` so the default Primer theme cannot replace the stylesheet; added unit and built-site tests, a Docker build script, and CI. | `npm run test:unit` (57 passing) and `npm run test:site` (85 passing) on a `github-pages` 232 / Jekyll 3.10 build; checked in the browser at 1120px and 390px, including the mobile menu and Escape-to-close. |
