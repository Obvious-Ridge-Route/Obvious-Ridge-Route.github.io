import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { ROOT, contrast, read } from '../helpers.js';

const require = createRequire(import.meta.url);
const { colors } = require('../../tailwind.config.cjs').theme.extend;

describe('compiled stylesheet', () => {
  it('matches the Tailwind sources (run `npm run build:css` after editing templates or src/styles)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'orr-css-'));
    const output = join(dir, 'site.css');
    try {
      execFileSync(join(ROOT, 'node_modules/.bin/postcss'), ['src/styles/main.css', '--output', output, '--no-map'], {
        cwd: ROOT,
        stdio: 'pipe',
      });
      const fresh = readFileSync(output, 'utf8');
      const committed = read('assets/css/site.css');
      assert.ok(fresh === committed, 'assets/css/site.css is out of date. Run `npm run build:css` and commit the result.');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('includes the glass, sheen, and reduced-motion rules', () => {
    const css = read('assets/css/site.css');
    for (const selector of ['.glass', '.sheen', '.reveal-ready', '.hero__ridge', '.steps']) {
      assert.ok(css.includes(selector), `missing ${selector}`);
    }
    assert.match(css, /backdrop-filter:blur\(18px\)/);
    assert.match(css, /prefers-reduced-motion:reduce/);
    assert.match(css, /prefers-reduced-transparency:reduce/);
  });
});

describe('color tokens', () => {
  it('keep body text readable on the page and on solid panels (WCAG AA)', () => {
    for (const background of [colors.ground, colors.panel]) {
      assert.ok(contrast(colors.ink, background) >= 7, `ink on ${background}`);
      assert.ok(contrast(colors.muted, background) >= 4.5, `muted on ${background}: ${contrast(colors.muted, background).toFixed(2)}`);
      assert.ok(contrast(colors.accent, background) >= 4.5, `accent on ${background}`);
    }
  });
});
