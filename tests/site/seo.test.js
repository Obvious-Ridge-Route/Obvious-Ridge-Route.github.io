import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { SITE, bannedMatches, builtPages, config, loadPage, projects, resolveSitePath, yaml } from '../helpers.js';

const site = config();
const pages = builtPages().filter((path) => !path.endsWith('404.html'));
const built = (path) => readFileSync(join(SITE, path), 'utf8');
const squash = (text) => text.replace(/\s+/g, ' ').trim();

function graph(document) {
  const blocks = [...document.querySelectorAll('script[type="application/ld+json"]')];
  assert.equal(blocks.length, 1, 'expected one JSON-LD block');
  let data;
  assert.doesNotThrow(() => {
    data = JSON.parse(blocks[0].textContent);
  }, 'JSON-LD is not valid JSON');
  assert.equal(data['@context'], 'https://schema.org');
  return data['@graph'];
}

const ofType = (nodes, type) => nodes.filter((node) => [].concat(node['@type']).includes(type));

describe('structured data', () => {
  for (const path of pages) {
    it(`${path.replace('_site/', '')} describes the organization and site`, () => {
      const nodes = graph(loadPage(path).document);
      const [org] = ofType(nodes, 'Organization');
      assert.ok(org, 'missing Organization');
      assert.equal(org.name, site.title);
      assert.equal(org.founder?.name, site.founder);
      assert.equal(org.foundingDate, String(site.founding_year));
      assert.equal(org.url, `${site.url}/`);
      assert.ok(resolveSitePath(new URL(org.logo.url).pathname), 'organization logo is missing from _site');
      assert.ok(org.makesOffer.length >= 3, 'organization should list its services');
      assert.equal(ofType(nodes, 'WebSite').length, 1, 'missing WebSite');
    });
  }

  for (const project of projects()) {
    it(`${project.id} is a CreativeWork with breadcrumbs and its own preview image`, () => {
      const { document } = loadPage(`_site/${project.id}.html`);
      const nodes = graph(document);
      const [work] = ofType(nodes, 'CreativeWork');
      assert.equal(work?.name, project.title);
      assert.equal(work.url, `${site.url}/${project.id}`);
      if (project.link) assert.equal(work.sameAs, project.link);
      const [crumbs] = ofType(nodes, 'BreadcrumbList');
      assert.equal(crumbs?.itemListElement.length, 3);
      const og = document.querySelector('meta[property="og:image"]').getAttribute('content');
      assert.equal(og, `${site.url}/assets/images/projects/${project.id}/og.jpg`);
      assert.ok(resolveSitePath(new URL(og).pathname), 'og:image is missing from _site');
    });
  }

  it('describes the Agentic AI page as a service with an FAQ that matches the page', () => {
    const { document } = loadPage('_site/agentic-ai.html');
    const nodes = graph(document);
    assert.equal(ofType(nodes, 'Service').length, 1, 'missing Service');
    const [faq] = ofType(nodes, 'FAQPage');
    const expected = yaml('_data/agentic.yml').faq;
    assert.equal(faq?.mainEntity.length, expected.length);
    const text = squash(document.querySelector('main').textContent);
    for (const entry of faq.mainEntity) {
      assert.ok(text.includes(squash(entry.name)), `FAQ question not on the page: ${entry.name}`);
      assert.ok(text.includes(squash(entry.acceptedAnswer.text)), `FAQ answer not on the page: ${entry.name}`);
    }
  });
});

describe('search metadata', () => {
  for (const path of builtPages()) {
    it(`${path.replace('_site/', '')} has a title and description that fit search results`, () => {
      const { document } = loadPage(path);
      const title = document.querySelector('title').textContent;
      assert.ok(title.length <= 70, `title is ${title.length} characters: ${title}`);
      assert.ok(title.endsWith(` | ${site.title}`), `title should end with the brand: ${title}`);
      const description = document.querySelector('meta[name="description"]').getAttribute('content');
      assert.ok(description.length >= 50 && description.length <= 160, `description is ${description.length} characters`);
      assert.equal(document.querySelectorAll('link[href*="fonts.googleapis.com"]').length, 0, 'fonts should be self-hosted');
    });
  }

  it('dates every page in the sitemap and includes the Agentic AI page', () => {
    const sitemap = built('sitemap.xml');
    const entries = sitemap.match(/<url>[\s\S]*?<\/url>/g) ?? [];
    assert.ok(entries.length >= projects().length + 2);
    for (const entry of entries) assert.match(entry, /<lastmod>\d{4}-\d{2}-\d{2}/, `no lastmod in ${entry}`);
    assert.ok(sitemap.includes(`<loc>${site.url}/agentic-ai</loc>`));
    assert.ok(!/llms|robots|\.txt/.test(sitemap), 'text files do not belong in the sitemap');
  });
});

describe('files for crawlers and AI assistants', () => {
  it('welcomes the AI crawlers in robots.txt and points to the sitemap', () => {
    const robots = built('robots.txt');
    for (const bot of ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Bingbot']) {
      assert.match(robots, new RegExp(`^User-agent: ${bot}$`, 'm'), `robots.txt should name ${bot}`);
    }
    assert.doesNotMatch(robots, /^Disallow:\s*\/\s*$/m, 'nothing should be disallowed');
    assert.match(robots, new RegExp(`^Sitemap: ${site.url}/sitemap.xml$`, 'm'));
  });

  it('publishes llms.txt with every service page and case study', () => {
    const llms = built('llms.txt');
    assert.match(llms, new RegExp(`^# ${site.title}\\n`));
    assert.match(llms, /^> .{80,}/m, 'llms.txt needs a one-paragraph summary line');
    assert.ok(llms.includes(`${site.url}/agentic-ai`));
    for (const project of projects()) assert.ok(llms.includes(`(${site.url}/${project.id})`), `llms.txt is missing ${project.id}`);
    assert.ok(llms.includes(`${site.url}/llms-full.txt`));
  });

  it('publishes llms-full.txt with the text of every case study', () => {
    const full = built('llms-full.txt');
    for (const project of projects()) {
      assert.ok(full.includes(`### ${project.title}`), `llms-full.txt is missing ${project.title}`);
      assert.ok(full.includes(project.intro), `llms-full.txt is missing the intro for ${project.title}`);
    }
    for (const item of yaml('_data/agentic.yml').faq) assert.ok(full.includes(item.question));
  });

  it('renders the text files completely, in a professional voice', () => {
    for (const file of ['llms.txt', 'llms-full.txt', 'robots.txt']) {
      const text = built(file);
      assert.doesNotMatch(text, /\{\{|\{%/, `${file} has unrendered Liquid`);
      assert.doesNotMatch(text, /^---$/m, `${file} still has front matter`);
      assert.deepEqual(bannedMatches(text), [], `${file} has banned words`);
    }
  });

  it('serves the IndexNow key file and the app icons', () => {
    assert.equal(built(`${site.indexnow_key}.txt`).trim(), site.indexnow_key);
    for (const path of ['assets/apple-touch-icon.png', 'assets/images/icon-512.png', 'assets/fonts/poppins-400-latin.woff2']) {
      assert.ok(existsSync(join(SITE, path)), `missing _site/${path}`);
    }
  });
});
