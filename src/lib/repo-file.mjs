/**
 * repo-file.mjs — find a file by its repo-relative path from wherever a build-time reader runs.
 *
 * The Astro build bundles its frontmatter into chunks, so `import.meta.url` doesn't point into `src/`. The
 * readers resolve against the working directory instead, walking up to the folder that holds the file, so a
 * test or script started from a subdirectory finds the same file. Node-only.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';

export function repoFile(rel) {
  for (let dir = process.cwd(); ; dir = path.dirname(dir)) {
    const candidate = path.join(dir, rel);
    if (existsSync(candidate)) return candidate;
    if (path.dirname(dir) === dir) throw new Error(`repo-file: no ${rel} above ${process.cwd()}`);
  }
}
