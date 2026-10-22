import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { activeStepCount, isStacked, scrollProgress, stackedActiveCount } from '../../assets/js/steps.js';

describe('Agentic AI step progress', () => {
  it('starts at zero before the band reaches the viewport', () => {
    assert.equal(scrollProgress(900, 600, 900), 0);
    assert.equal(activeStepCount(0, 4), 0);
  });

  it('lights steps in order as the band scrolls up', () => {
    const viewport = 900;
    const height = 600;
    const counts = [700, 560, 450, 300, 0].map((top) => activeStepCount(scrollProgress(top, height, viewport), 4));
    assert.deepEqual(counts, [1, 2, 3, 4, 4]);
  });

  it('never goes past the last step', () => {
    assert.equal(scrollProgress(-2000, 600, 900), 1);
    assert.equal(activeStepCount(1, 4), 4);
  });

  it('lights stacked steps one at a time as each crosses the line', () => {
    assert.equal(stackedActiveCount([100, 300, 700, 900], 844), 2);
    assert.equal(stackedActiveCount([900, 1100, 1300, 1500], 844), 0);
  });

  it('detects stacked and side-by-side layouts', () => {
    assert.equal(isStacked([100, 100, 100, 100]), false);
    assert.equal(isStacked([100, 290, 480, 670]), true);
  });
});
