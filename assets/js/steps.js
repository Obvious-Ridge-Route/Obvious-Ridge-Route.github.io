// Scroll math for the Agentic AI steps. No DOM access, so it runs in tests too.

// 0 when the band's top reaches 82% of the viewport height, 1 after it has
// travelled three quarters of its own height past that line.
export function scrollProgress(bandTop, bandHeight, viewportHeight) {
  const start = viewportHeight * 0.82;
  const distance = Math.max(bandHeight * 0.75, 1);
  return Math.min(1, Math.max(0, (start - bandTop) / distance));
}

export function activeStepCount(progress, total) {
  if (progress <= 0) return 0;
  return Math.min(total, Math.ceil(progress * total - 1e-6));
}

// When the steps stack on narrow screens, each one lights up as its top
// crosses 72% of the viewport height.
export function stackedActiveCount(stepTops, viewportHeight, line = 0.72) {
  return stepTops.filter((top) => top < viewportHeight * line).length;
}

export function isStacked(stepTops) {
  return stepTops.length > 1 && stepTops[1] > stepTops[0] + 4;
}
