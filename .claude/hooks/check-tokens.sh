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

# Nothing to check: no path, file outside src/, or a token-definition file.
case "$file" in
  */src/*) : ;;
  *) exit 0 ;;
esac
case "$file" in
  */src/styles/tokens/*) exit 0 ;;
esac

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

out=""
rc=0
case "$file" in
  *.css)
    out=$(npx --no-install stylelint "$file" 2>&1); rc=$?
    ;;
  *.tsx|*.jsx|*.astro)
    out=$(node scripts/check-inline-colors.mjs "$file" 2>&1); rc=$?
    ;;
  *) exit 0 ;;
esac

# Both checkers exit non-zero only on a real violation. Trust the exit code.
if [ "$rc" -ne 0 ]; then
  echo "Token check on $(basename "$file"): hard-coded styling value detected. Replace it with a central token (var(--color-…) / var(--grid-…)) from src/styles/tokens/. Details:" >&2
  printf '%s\n' "$out" >&2
  exit 2
fi
exit 0
