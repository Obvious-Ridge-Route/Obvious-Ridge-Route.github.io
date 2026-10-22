import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { SITE, bannedMatches, builtPages, config, domain, loadPage, projects, read, resolveSitePath, yaml } from '../helpers.js';

const pages = builtPages();
const site = config();

describe('built site', () => {
  it('has a page for the homepage, the 404, and every project', () => {
    for (const path of ['index.html', '404.html', ...projects().map((project) => `${project.id}.html`)]) {
      assert.ok(existsSync(join(SITE, path)), `missing _site/${path}`);
    }
  });

  it('does not publish repository files', () => {
    for (const path of ['README.html', 'README.md', 'AGENTS.html', 'AGENTS.md', 'package.json', 'Gemfile', 'tests', 'scripts', 'src', 'node_modules', 'feed.xml']) {
      assert.equal(existsSync(join(SITE, path)), false, `_site/${path} should not be published`);
    }
  });

  it('publishes our stylesheet unchanged, with no theme stylesheet beside it', () => {
    assert.equal(readFileSync(join(SITE, 'assets/css/site.css'), 'utf8'), read('assets/css/site.css'));
    assert.equal(existsSync(join(SITE, 'assets/css/style.css')), false, 'a theme stylesheet was published; is theme: null set?');
  });

  it('lists every project in the sitemap at its clean URL', () => {
    const sitemap = readFileSync(join(SITE, 'sitemap.xml'), 'utf8');
    for (const project of projects()) {
      assert.ok(sitemap.includes(`<loc>${site.url}/${project.id}</loc>`), `sitemap is missing /${project.id}`);
    }
    assert.ok(!sitemap.includes('404'), 'the 404 page should not be in the sitemap');
  });
});

for (const path of pages) {
  describe(path.replace('_site/', ''), () => {
    const { html, document } = loadPage(path);

    it('has exactly one h1', () => {
      assert.equal(document.querySelectorAll('h1').length, 1);
    });

    it('has a title, description, canonical URL, and social preview', () => {
      assert.ok(document.querySelector('title')?.textContent.trim(), 'missing <title>');
      assert.ok(document.querySelector('meta[name="description"]')?.getAttribute('content')?.length > 40, 'missing meta description');
      assert.match(document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '', new RegExp(`^${site.url}/`));
      assert.match(document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '', new RegExp(`^${site.url}/assets/images/`));
      assert.equal(document.documentElement.getAttribute('lang'), site.lang);
    });

    it('gives every image a source that exists and alt text', () => {
      for (const img of document.querySelectorAll('img')) {
        const src = img.getAttribute('src');
        assert.ok(img.hasAttribute('alt'), `<img src="${src}"> has no alt attribute`);
        if (!img.classList.contains('brand__mark')) {
          assert.ok(img.getAttribute('alt').trim().length > 0, `<img src="${src}"> needs alt text`);
        }
        assert.ok(resolveSitePath(src), `<img src="${src}"> does not exist in _site`);
      }
    });

    it('links only to pages, files, and sections that exist', () => {
      for (const link of document.querySelectorAll('a[href]')) {
        const href = link.getAttribute('href');
        if (/^(https?:|mailto:)/.test(href)) continue;
        if (href.startsWith('#')) {
          assert.ok(document.getElementById(href.slice(1)), `${href} has no target on this page`);
          continue;
        }
        const target = resolveSitePath(href);
        assert.ok(target, `${href} does not resolve to a file in _site`);
        const hash = href.split('#')[1];
        if (hash) {
          const targetDocument = loadPage(target.replace(`${SITE}/`, '_site/')).document;
          assert.ok(targetDocument.getElementById(hash), `${href} points to a missing section`);
        }
      }
    });

    it('opens external links in new tabs safely', () => {
      for (const link of document.querySelectorAll('a[target="_blank"]')) {
        assert.match(link.getAttribute('rel') ?? '', /noopener/, `${link.getAttribute('href')} needs rel="noopener"`);
      }
    });

    it('uses professional language', () => {
      assert.deepEqual(bannedMatches(document.body.textContent), []);
    });

    it('never shows a sent message before anything is sent', () => {
      for (const success of document.querySelectorAll('[data-form-success]')) {
        assert.ok(success.hasAttribute('hidden'), 'the success message must start hidden');
      }
      assert.doesNotMatch(html.replace(/<div[^>]*data-form-success[\s\S]*?<\/div>/g, ''), /message (has been )?sent/i);
    });
  });
}

describe('homepage', () => {
  const { document } = loadPage('_site/index.html');

  it('leads with agentic AI', () => {
    const band = document.getElementById('agentic-ai');
    assert.ok(band, 'missing the #agentic-ai band');
    assert.equal(band.querySelectorAll('[data-step]').length, 4);
    assert.match(document.querySelector('.cap--featured')?.textContent ?? '', /Agentic AI development/);
    const firstCard = document.querySelector('.work-card');
    assert.match(firstCard?.textContent ?? '', /Agentic AI/);
  });

  it('shows the featured projects in order and lists the rest under More work', () => {
    const all = projects();
    const featured = all.filter((project) => project.featured);
    assert.deepEqual(
      [...document.querySelectorAll('.work-card')].map((card) => card.getAttribute('href')),
      featured.map((project) => `/${project.id}`),
    );
    assert.equal(document.querySelectorAll('.archive__row').length, all.length - featured.length);
    assert.equal(document.querySelectorAll('.archive img').length, 0, 'More work rows are text only');
  });

  it('offers a working email address on the site domain', () => {
    const mailto = [...document.querySelectorAll('a[href^="mailto:"]')].map((link) => link.getAttribute('href'));
    assert.ok(mailto.length > 0, 'no mailto link');
    for (const href of mailto) assert.equal(href, `mailto:${site.email}`);
    assert.ok(site.email.endsWith(`@${domain()}`));
  });

  it('links each capability to a real case study', () => {
    const ids = new Set(projects().map((project) => `/${project.id}`));
    const links = [...document.querySelectorAll('.cap__links a')].map((link) => link.getAttribute('href'));
    assert.ok(links.some((href) => ids.has(href)));
    assert.ok(links.includes('/agentic-ai'));
  });

  it('lists every capability point on its card', () => {
    const cards = [...document.querySelectorAll('.cap')];
    for (const cap of yaml('_data/capabilities.yml')) {
      const card = cards.find((el) => el.querySelector('.cap__title')?.textContent.trim() === cap.title);
      assert.ok(card, `no card for ${cap.title}`);
      const ticks = [...card.querySelectorAll('.ticks li')].map((li) => li.textContent.trim());
      assert.deepEqual(ticks, cap.points ?? [], `${cap.title} points`);
    }
  });

  it('only renders the contact form when a Formspree id is configured', () => {
    const form = document.querySelector('[data-contact-form]');
    if (site.formspree_id) {
      assert.ok(form, 'formspree_id is set but the form is missing');
      assert.equal(form.getAttribute('action'), `https://formspree.io/f/${site.formspree_id}`);
      for (const name of ['name', 'email', 'need', 'message']) {
        const field = form.querySelector(`[name="${name}"]`);
        assert.ok(field, `missing ${name} field`);
        assert.ok(form.querySelector(`label[for="${field.id}"]`), `${name} needs a label`);
      }
      assert.equal(form.querySelector('[name="name"]').getAttribute('maxlength'), '100', 'match the Formspree name limit');
      assert.equal(form.querySelector('[name="message"]').getAttribute('maxlength'), '5000', 'match the Formspree message limit');
    } else {
      assert.equal(form, null, 'no formspree_id, so there should be no form');
    }
  });
});

describe('case study site links', () => {
  for (const project of projects()) {
    it(`${project.id} links to its live site, or says where it is launching`, () => {
      const { document } = loadPage(`_site/${project.id}.html`);
      const external = [...document.querySelectorAll('.case-hero a[target="_blank"]')].map((link) => link.getAttribute('href'));
      if (project.link) {
        assert.deepEqual(external, [project.link]);
      } else {
        assert.deepEqual(external, [], 'an unlaunched project must not link to its preview');
        const domainName = new URL(project.launch_url).hostname.replace(/^www\./, '');
        assert.equal(document.querySelector('.launch-badge')?.textContent.trim(), `Launching at ${domainName}`);
      }
    });
  }
});

describe('Agentic AI page', () => {
  it('explains how proprietary data is protected', () => {
    const { document } = loadPage('_site/agentic-ai.html');
    const agentic = yaml('_data/agentic.yml');
    const section = document.querySelector('[aria-labelledby="security-title"]');
    assert.ok(section, 'missing the security section');
    assert.equal(section.querySelector('h2')?.textContent.trim(), agentic.security_title);
    const titles = [...section.querySelectorAll('.use h3')].map((title) => title.textContent.trim());
    assert.deepEqual(titles, agentic.security.map((item) => item.title));
  });
});

describe('case study galleries', () => {
  for (const project of projects().filter((p) => p.gallery?.length)) {
    it(`${project.id} fills every gallery row`, () => {
      const { document } = loadPage(`_site/${project.id}.html`);
      const gallery = document.querySelector('.gallery');
      const columns = gallery.classList.contains('gallery--pairs') ? 2 : 3;
      const shots = gallery.querySelectorAll('.gallery__item').length;
      assert.equal(shots, project.gallery.length);
      assert.equal(shots % columns, 0, `${shots} images leave a partial row; use 2, 3, 4, 6, 8, or 9`);
    });
  }
});
