import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { config, domain, exists, files, read } from '../helpers.js';

// Plugins GitHub Pages will run (github-pages gem PLUGIN_WHITELIST).
const PAGES_PLUGINS = new Set([
  'jekyll-coffeescript',
  'jekyll-commonmark-ghpages',
  'jekyll-feed',
  'jekyll-gist',
  'jekyll-github-metadata',
  'jekyll-paginate',
  'jekyll-redirect-from',
  'jekyll-seo-tag',
  'jekyll-sitemap',
  'jekyll-avatar',
  'jemoji',
  'jekyll-mentions',
  'jekyll-relative-links',
  'jekyll-optional-front-matter',
  'jekyll-readme-index',
  'jekyll-default-layout',
  'jekyll-titles-from-headings',
  'jekyll-include-cache',
  'jekyll-octicons',
  'jekyll-remote-theme',
]);

describe('Jekyll config', () => {
  const site = config();

  it('serves from the custom domain in CNAME', () => {
    assert.equal(site.url, `https://${domain()}`);
    assert.equal(site.baseurl, '');
  });

  it('publishes an email address on the same domain', () => {
    assert.match(site.email, new RegExp(`@${domain().replace('.', '\\.')}$`));
  });

  it('turns off the default GitHub Pages theme, whose style.css would replace ours', () => {
    assert.ok(Object.hasOwn(site, 'theme'), '_config.yml must set theme: null');
    assert.equal(site.theme, null);
  });

  it('only uses plugins that GitHub Pages runs', () => {
    for (const plugin of site.plugins ?? []) {
      assert.ok(PAGES_PLUGINS.has(plugin), `${plugin} is not supported on GitHub Pages`);
    }
    assert.equal(exists('_plugins'), false, 'GitHub Pages ignores _plugins/');
  });

  it('keeps repository files out of the published site', () => {
    for (const entry of ['README.md', 'AGENTS.md', 'node_modules', 'package.json', 'package-lock.json', 'src', 'tests', 'scripts', 'Gemfile', 'Gemfile.lock', 'vendor']) {
      assert.ok(site.exclude.includes(entry), `add ${entry} to exclude in _config.yml`);
    }
  });

  it('has no Sass for GitHub Pages to compile', () => {
    assert.deepEqual(files('assets', (path) => /\.s[ac]ss$/.test(path)), []);
    assert.equal(exists('_sass'), false);
  });

  it('keeps the form id a string so an empty value hides the form', () => {
    assert.equal(typeof site.formspree_id, 'string');
  });

  it('loads one stylesheet, self-hosted fonts, and the module script from the head', () => {
    const head = read('_includes/head.html');
    assert.equal((head.match(/rel="stylesheet"/g) ?? []).length, 1, 'only site.css should be a stylesheet');
    assert.doesNotMatch(head, /fonts\.(googleapis|gstatic)\.com/, 'fonts are self-hosted in assets/fonts');
    assert.match(head, /type="module" src="\{\{ '\/assets\/js\/site\.js'/);
    for (const weight of [400, 500, 600]) {
      assert.ok(exists(`assets/fonts/poppins-${weight}-latin.woff2`), `missing Poppins ${weight}`);
    }
    assert.ok(exists('assets/fonts/OFL.txt'), 'keep the font license beside the fonts');
  });

  it('states the company facts used in structured data', () => {
    assert.ok(site.founder, 'founder is required');
    assert.match(String(site.founding_year), /^\d{4}$/);
    assert.ok(Array.isArray(site.same_as), 'same_as must be a list');
    for (const url of site.same_as) assert.match(url, /^https:\/\//);
    assert.equal(typeof site.google_site_verification, 'string');
    assert.equal(typeof site.bing_site_verification, 'string');
  });

  it('publishes the IndexNow key file at the site root', () => {
    assert.match(site.indexnow_key, /^[0-9a-f]{32}$/);
    const keyFile = `${site.indexnow_key}.txt`;
    assert.ok(exists(keyFile), `missing ${keyFile}`);
    assert.equal(read(keyFile).trim(), site.indexnow_key);
    assert.ok(!site.exclude.includes(keyFile));
  });
});
