import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { bannedMatches, files, read } from '../helpers.js';

const SOURCES = [
  ...files('_data', (path) => path.endsWith('.yml')),
  ...files('_includes', (path) => path.endsWith('.html')),
  ...files('_layouts', (path) => path.endsWith('.html')),
  ...files('.', (path) => !path.includes('/') && /\.(html|txt)$/.test(path)),
  '_config.yml',
];

describe('site copy', () => {
  it('scans the content sources', () => {
    for (const path of ['index.html', 'agentic-ai.html', '_data/projects.yml', 'llms.txt', 'llms-full.txt', 'robots.txt']) {
      assert.ok(SOURCES.includes(path), `${path} is not scanned`);
    }
  });

  for (const path of SOURCES) {
    it(`keeps ${path} free of slang and profanity`, () => {
      assert.deepEqual(bannedMatches(read(path)), [], `${path} contains copy that does not fit a professional studio`);
    });
  }

  it('does not hard-code line breaks into copy', () => {
    for (const path of SOURCES) {
      assert.doesNotMatch(read(path), /<br\s*\/?>/i, `${path} uses <br>; let the layout wrap text`);
    }
  });
});
