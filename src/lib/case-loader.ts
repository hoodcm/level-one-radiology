/**
 * case-loader.ts — a glob() wrapper that keeps ::case embeds fresh.
 *
 * The content layer caches rendered articles by CONTENT digest, so an
 * article whose markdown never changed keeps its cached render even when
 * the case it embeds was regenerated (new frame count, new windows) or
 * deleted. Previewing a case in the dev server IS the case-review workflow,
 * so stale shells are not acceptable there, and a build must never ship one.
 *
 * Mechanism: manifest `rev` (bumped by every case:build run) is compared
 * against the revs recorded in loader meta; any drift deletes the embedding
 * entries from the store, and the wrapped glob() re-renders them. In dev,
 * public/cases/ is additionally watched so a regeneration re-renders live.
 * (Frame files deleted WITHOUT a manifest change don't move `rev`; the
 * astro:build:start validation integration owns that hole.)
 */
import { utimesSync } from 'node:fs';
import path from 'node:path';
import type { Loader, LoaderContext } from 'astro/loaders';
import { glob } from 'astro/loaders';
// @ts-expect-error — plain-JS module shared with the remark plugin and scripts
import { CASE_DIRECTIVE_RE, caseManifestRev } from './case-shell.mjs';

type GlobOptions = Parameters<typeof glob>[0];

export function caseAwareGlob(options: GlobOptions): Loader {
  const base = glob(options);
  return {
    name: 'case-aware-glob',
    load: async (ctx: LoaderContext) => {
      const { store, meta, watcher, logger } = ctx;

      /** caseId → entry ids embedding it (from the persisted store). */
      const refs = () => {
        const map = new Map<string, Set<string>>();
        for (const [id, entry] of store.entries()) {
          const body = (entry as { body?: string }).body ?? '';
          for (const m of body.matchAll(CASE_DIRECTIVE_RE)) {
            (map.get(m[1]) ?? map.set(m[1], new Set()).get(m[1])!).add(id);
          }
        }
        return map;
      };

      const recordRevs = (map: Map<string, Set<string>>) => {
        const revs: Record<string, number | null> = {};
        for (const caseId of map.keys()) revs[caseId] = caseManifestRev(caseId);
        meta.set('caseRevs', JSON.stringify(revs));
      };

      // Startup: drop any cached entry whose case moved since last run. An
      // unrecorded case (first run of this wrapper, lost meta) counts as
      // moved — one conservative re-render beats a stale shell.
      const before = refs();
      const prev: Record<string, number | null> = JSON.parse(meta.get('caseRevs') ?? '{}');
      for (const [caseId, entryIds] of before) {
        if (prev[caseId] !== caseManifestRev(caseId)) {
          logger.info(`case "${caseId}" changed — re-rendering ${[...entryIds].join(', ')}`);
          for (const id of entryIds) store.delete(id);
        }
      }

      await base.load(ctx);
      recordRevs(refs());

      // Dev: a manifest write re-renders its embedding articles live. The
      // entry is dropped from the store, then its file's mtime is bumped so
      // glob's own watcher re-syncs it (an absent entry always re-renders).
      if (watcher) {
        const casesDir = path.resolve('public/cases');
        watcher.add(casesDir);
        const onCasesChange = (changed: string) => {
          if (!changed.startsWith(casesDir) || !changed.endsWith('manifest.json')) return;
          const caseId = path.basename(path.dirname(changed));
          const entryIds = refs().get(caseId);
          if (!entryIds?.size) return;
          logger.info(`case "${caseId}" regenerated — refreshing ${[...entryIds].join(', ')}`);
          for (const id of entryIds) {
            const entry = store.get(id) as { filePath?: string } | undefined;
            const filePath = entry?.filePath;
            store.delete(id);
            if (filePath) {
              const now = new Date();
              utimesSync(path.resolve(filePath), now, now);
            }
          }
          recordRevs(refs());
        };
        watcher.on('change', onCasesChange);
        watcher.on('add', onCasesChange);
      }
    },
  };
}
