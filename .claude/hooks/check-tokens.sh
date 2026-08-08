#!/bin/bash
# PostToolUse hook: enforce "colors/grid come from central tokens, never
# hard-coded" on the file Claude just edited. Advisory — surfaces violations
# back to Claude (exit 2) so it self-corrects in-session, mirroring the
# `npm run lint` gate that CI runs for everyone. Same checks, scoped to one file.
#
# Reads the PostToolUse event JSON on stdin; acts only on Edit/Write/MultiEdit
# of src/ style files. Token-definition files are intentionally exempt (that is
# the one place literals are legitimate).

input=$(cat)
file=$(printf '%s' "$input" | python3 -c 'import sys, json; print(json.load(sys.stdin).get("tool_input", {}).get("file_path", ""))' 2>/dev/null)

# Nothing to check: no path, or a file outside src/.
case "$file" in
  */src/*) : ;;
  *) exit 0 ;;
esac

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

out=""
rc=0

# check-inline-colors.mjs owns BOTH rules and knows its own exemptions — the
# hex rule is markup-only, and the swatch rule exempts colors.css alone. So
# run it on every extension it covers, token files included: a token file may
# legitimately hold hex literals, but nothing outside colors.css may name a
# --gray-* swatch. Routing .css to stylelint only (the previous shape) meant
# the swatch rule never fired in-session on its primary surface.
case "$file" in
  *.css|*.tsx|*.jsx|*.astro|*.ts|*.mjs)
    out=$(node scripts/check-inline-colors.mjs "$file" 2>&1); rc=$?
    ;;
esac

# Stylelint additionally owns the declaration-value gate (colors, grid,
# line-height, letter-spacing, font-weight, z-index) inside stylesheets AND
# .astro <style> blocks (postcss-html) — but not in the token definitions,
# which are the one place literals belong.
if [ "$rc" -eq 0 ]; then
  case "$file" in
    */src/styles/tokens/*) : ;;
    *.css|*.astro)
      out=$(npx --no-install stylelint "$file" 2>&1); rc=$?
      ;;
  esac
fi

# Both checkers exit non-zero only on a real violation. Trust the exit code.
if [ "$rc" -ne 0 ]; then
  echo "Token check on $(basename "$file"): hard-coded styling value detected. Replace it with a central token (var(--color-…) / var(--grid-…)) from src/styles/tokens/. Details:" >&2
  printf '%s\n' "$out" >&2
  exit 2
fi
exit 0
