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

  it('loads one stylesheet and the module script from the head', () => {
    const head = read('_includes/head.html');
    assert.equal((head.match(/rel="stylesheet" href="\{\{ '\/assets\/css\//g) ?? []).length, 1);
    assert.match(head, /type="module" src="\{\{ '\/assets\/js\/site\.js'/);
  });
});
