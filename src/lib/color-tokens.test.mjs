import { describe, expect, it } from 'vitest';
import { colorToken } from './color-tokens.mjs';

describe('colorToken', () => {
  it('follows a var() chain to the swatch literal', () => {
    const css = ':root { --gray-10: #0b0a09; --color-bg-deepest: var(--gray-10); }';
    expect(colorToken('--color-bg-deepest', css)).toBe('#0b0a09');
  });

  it('matches the whole property name, not a suffix of a longer one', () => {
    const css = ':root { --x-gray-10: #ffffff; --gray-10: #0b0a09; }';
    expect(colorToken('--gray-10', css)).toBe('#0b0a09');
  });

  it('throws on a missing token rather than returning nothing', () => {
    expect(() => colorToken('--nope', ':root { --a: #000; }')).toThrow(/no --nope/);
  });

  it('throws on a var() cycle', () => {
    expect(() => colorToken('--a', ':root { --a: var(--b); --b: var(--a); }')).toThrow(/cycle/);
  });

  it('skips a declaration inside a comment', () => {
    const css = ':root { /* --gray-10: #000000; */ --gray-10: #0b0a09; }';
    expect(colorToken('--gray-10', css)).toBe('#0b0a09');
  });

  it('resolves the theme-color source in the real colors.css', () => {
    expect(colorToken('--color-bg-deepest')).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
