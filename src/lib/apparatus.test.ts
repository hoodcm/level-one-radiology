// Contract test for the apparatus kill-switch flag names (article-apparatus
// plan step 1). astro.config.mjs and the templates read these by name in
// plain JS — a renamed flag would come back `undefined` and silently disable
// its element instead of failing the build.
import { describe, expect, it } from 'vitest';
import { apparatus } from './apparatus';

describe('apparatus flag-name contract', () => {
  it('exposes exactly the known kill-switch booleans', () => {
    expect(Object.keys(apparatus).sort()).toEqual([
      'caseTapToActivate',
      'caseTapToBoot',
      'footnotePopovers',
      'mobileToc',
      'readNext',
    ]);
    for (const value of Object.values(apparatus)) {
      expect(typeof value).toBe('boolean');
    }
  });
});
