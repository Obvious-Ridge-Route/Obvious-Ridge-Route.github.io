import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { parse as parseYaml } from 'yaml';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SITE = join(ROOT, '_site');

export const read = (path) => readFileSync(join(ROOT, path), 'utf8');
export const exists = (path) => existsSync(join(ROOT, path));
export const sizeOf = (path) => statSync(join(ROOT, path)).size;
export const yaml = (path) => parseYaml(read(path));

export const config = () => yaml('_config.yml');
export const projects = () => yaml('_data/projects.yml');
export const domain = () => read('CNAME').trim();

// Front matter of a page, e.g. sitespecs.html -> { layout, project, permalink }.
export function frontMatter(path) {
  const match = read(path).match(/^---\n([\s\S]*?)\n---/);
  return match ? parseYaml(match[1]) ?? {} : null;
}

export function files(dir, test = () => true) {
  const base = join(ROOT, dir);
  if (!existsSync(base)) return [];
  return readdirSync(base, { recursive: true })
    .map((name) => join(base, name))
    .filter((path) => statSync(path).isFile())
    .map((path) => relative(ROOT, path))
    .filter(test);
}

// Every image path referenced by one project record.
export function projectImages(project) {
  const images = [project.card, project.hero, project.overview, project.design, ...(project.gallery ?? [])];
  return images.filter(Boolean);
}

// Built pages ------------------------------------------------------------------

export function requireSite() {
  if (!existsSync(join(SITE, 'index.html'))) {
    throw new Error('No _site build found. Run `npm run build` or `npm run docker:build` before `npm run test:site`.');
  }
}

export function builtPages() {
  requireSite();
  return files('_site', (path) => path.endsWith('.html'));
}

export function loadPage(path) {
  const html = readFileSync(join(ROOT, path), 'utf8');
  return { html, document: parseHTML(html).document };
}

// Resolve a site URL path the way GitHub Pages does: "/" -> index.html,
// "/sitespecs" -> sitespecs.html, "/assets/x.webp" -> the file itself.
export function resolveSitePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  const candidates = clean.endsWith('/')
    ? [join(clean, 'index.html')]
    : [clean, `${clean}.html`, join(clean, 'index.html')];
  return candidates.map((candidate) => join(SITE, candidate)).find((path) => existsSync(path) && statSync(path).isFile()) ?? null;
}

// Words that do not belong in a professional studio's copy.
export const BANNED_PATTERNS = [
  /\bshit\w*/i,
  /\bfuck\w*/i,
  /\bdamn\b/i,
  /\bcrap\b/i,
  /\bbitch\w*/i,
  /\bass(hole)?\b/i,
  /\banons?\b/i,
  /\bdegens?\b/i,
  /\bfrens?\b/i,
  /\bwagmi\b/i,
  /\bngmi\b/i,
  /\blfg\b/i,
  /\bser\b/i,
  /best on earth/i,
  /\bsauces\b/i,
  /your grandma/i,
  /obviousreidgeroute/i,
];

export function bannedMatches(text) {
  return BANNED_PATTERNS.filter((pattern) => pattern.test(text)).map(String);
}

// WCAG relative luminance and contrast ratio for hex colors.
export function contrast(foreground, background) {
  const luminance = (hex) => {
    const [r, g, b] = hex
      .replace('#', '')
      .match(/../g)
      .map((part) => parseInt(part, 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}
