# E2E coverage report — #4077

Verification record for Phase 7 (#4236). Numbers come from two dispatched
`playwright.yml` runs with `COVERAGE=1` against a Vercel preview.

| run                                                                                   | ref                      | tests                     | job   |
| ------------------------------------------------------------------------------------- | ------------------------ | ------------------------- | ----- |
| [34507684185](https://github.com/amitsingh-007/bypass-links/actions/runs/34507684185) | Phase 1 tip (`3e69f01e`) | 115 passed, 1 flaky, 2.6m | 3m53s |
| [34507672463](https://github.com/amitsingh-007/bypass-links/actions/runs/34507672463) | Phase 6 tip (`ecac19cd`) | 186 passed, 0 flaky, 5.6m | 6m52s |

The Phase 1 ref was re-run on the same day as the Phase 6 ref rather than
compared against the numbers recorded in
[#4230](https://github.com/amitsingh-007/bypass-links/issues/4230#issuecomment-5606441716),
because run-to-run drift on an identical ref is large enough to swallow a real
gain (see [Measurement noise](#measurement-noise)).

## Recovered measurement vs. new-test gains

The two are separate effects and are reported separately.

**Recovered measurement** — Phase 1 only, no test changes, same 170 files. The
collector was discarding everything a test executed before a `goto`, `reload`,
`goBack` or `goForward`:

| metric     | before the collector fix | after  |
| ---------- | ------------------------ | ------ |
| bytes      | 77.70%                   | 93.00% |
| statements | 74.67%                   | 91.73% |
| branches   | 67.78%                   | 80.91% |
| functions  | 68.97%                   | 89.66% |
| lines      | 76.03%                   | 91.13% |

Roughly four fifths of the headline improvement across this issue is this:
measurement error, not coverage that did not exist.

**New-test gains** — Phases 2 through 6, 115 → 186 tests, both refs measured
the same day. Every parenthesised delta below is in percentage points:

| area                  | files | bytes                      | statements                 | branches                   | functions                   | lines                      |
| --------------------- | ----- | -------------------------- | -------------------------- | -------------------------- | --------------------------- | -------------------------- |
| `apps/extension/src`  | 82    | 92.57 → **95.36%** (+2.79) | 92.51 → **95.47%** (+2.96) | 84.65 → **87.89%** (+3.24) | 89.26 → **93.54%** (+4.28)  | 92.04 → **94.85%** (+2.81) |
| `apps/web/src`        | 16    | 93.33 → **96.53%** (+3.20) | 83.05 → **88.98%** (+5.93) | 85.87 → **88.59%** (+2.72) | 83.67 → **93.88%** (+10.21) | 89.88 → **93.39%** (+3.51) |
| `packages/shared/src` | 72    | 94.48 → **95.14%** (+0.66) | 92.53 → **94.26%** (+1.73) | 77.21 → **80.00%** (+2.79) | 92.63 → **94.74%** (+2.11)  | 91.19 → **92.18%** (+0.99) |
| **TOTAL**             | 170   | 93.35 → **95.39%** (+2.04) | 92.06 → **94.84%** (+2.78) | 82.13 → **85.10%** (+2.97) | 90.21 → **94.04%** (+3.83)  | 91.51 → **93.71%** (+2.20) |

Largest function gains: `web-ext/page.tsx` 6/11 → 10/11, `cache.ts`
7/10 → 10/10, `ShortcutsPanel.tsx` 14/17 → 17/17, `useBookmarkStore.ts`
28/31 → 30/30, `ImagePicker.tsx` 4/6 → 6/6, `ScrollButton.tsx` 1/3 → 3/3.
`BookmarksPanel/utils/index.ts` 4/4 → 3/3 and `manipulate.ts` 7/7 → 5/5 lost
functions to the Phase 3 product fix and are still fully covered.

Four files read lower on one metric, and none of them is a loss of covered
code:

- `useTaggedBookmarks.ts` branches 91.67% → 85.71%, on an unchanged file: 11/12
  covered became 12/14. V8 only reports branches inside code it has actually
  run, so reaching further into a file can add more branches to the denominator
  than to the numerator. Covered branches went up.
- `ScrollButton.tsx` bytes 17.57% → 17.02%, `Bookmark.tsx` lines
  93.48% → 93.33%, and `BookmarkContextMenu.tsx` bytes 97.85% → 97.82% / lines
  98.39% → 98.37% all gained source in these phases, so the denominator moved
  under them.

That is the general caveat for every per-file percentage here: the denominators
are not fixed between the two runs.

### Measurement noise

The same ref, measured a day apart, moves on its own: total +0.35 bytes, +0.33
statements, +1.22 branches, +0.55 functions, +0.38 lines. Per area it is
worse — `apps/web/src` branches read 82.07% in the Phase 1 run and 85.87% in
today's re-run of that same ref, a 3.80 point swing with no code change. Treat
any per-area branch delta under ~4 points as unmeasurable, and total deltas
under ~1.2 points likewise.

## Runtime against the ten-minute budget

The Playwright job grew 3m53s → 6m52s, leaving 3m08s of the ten-minute
`timeout-minutes`. The timeout is unchanged and no overrun occurred.

On the marginal rate between the two CI runs — 71 more tests for 3.0m more
execution, 2.5s per test — the 3m08s of slack is worth roughly **70 further
tests**. That is the number to plan against, not the ~85 that dividing 6m52s
by 186 tests and filling ten minutes suggests: the fit is not linear through
the origin (the two points imply a negative intercept), so per-test cost is
rising, not flat.

Instrumentation is a large part of the per-test cost, but this record cannot
say how much: locally the same 186 tests finish in 2m35s without coverage,
which is a different machine (a Mac at ~600% CPU) than the CI runner. No
uninstrumented CI run of 186 tests exists to compare against.

## Suite verification

Both app projects, normal parallel settings, retry configuration untouched:

- CI (retries 2), run 34507672463: **186 passed, 0 flaky**
- Local run (retries 1): **186 passed, 0 flaky, 2m35s**
- An earlier local run of the same commit: 177 passed, 1 failed, 8 did not run

That earlier run is the one thing worth knowing about the suite's shape.
`context.newPage()` failed with `Target.createTarget: Failed to open a new tab`
under ~600% CPU, in `invalid URLs do not trigger redirect logic`. Because
`background-navigation.spec.ts` is a 20-test `describe.serial`, that single
transient failure also skipped the 8 tests behind it, and the retry landed in
the same state. The spec passes alone and the following full run was clean, so
this is Chrome refusing a tab under load rather than a product or test defect —
but a serial block that long turns one flake into nine lost tests.

Neither of the two runs above flaked, so the list below comes from other runs
of the same commits. All are pre-existing and all went green on retry:

- `toggle-history.spec.ts` › `should turn on history tracking` — the one flake
  in the Phase 1 re-run (34507684185), and the only flake seen in CI at all.
- The `repeated sequential BROWSERTEST navigations` case in
  `background-navigation.spec.ts`, which polls live `html5test.com` — flaked in
  the isolated local run of that spec.
- The persons image-upload dialog-hide timeout, against real Firebase Storage
  (recorded in Phases 3 and 5).
- The `sorts alphabetically once recency sorting is turned off` case in
  `person-select.spec.ts` (recorded in Phase 5).

## Confirmed product fixes

Two, each shipped with the test that fails without it.

- **Bookmark selection was keyed by row position** (`ae847a79`, Phase 3).
  Selection and cut were `boolean[]` indexed against the _search-filtered_
  list, while `handleBulkUrlRemove` and `handlePasteSelectedBookmarks` applied
  those positions to the unfiltered folder. A bulk delete or paste made under a
  filter acted on whichever bookmarks sat at those positions with the filter
  off. Both sets now hold bookmark ids. Four of the five new selection tests
  fail if the source change is reverted.
- **Web bookmarks panel never virtualized** (Phase 6). Its `ScrollArea` had
  `flex-1` without `min-h-0`; a flex child defaults to `min-height: auto`, so
  the scroller grew to the full list and all 150 seeded rows rendered. The
  persons panel already had `min-h-0` and the extension panel uses an explicit
  pixel height, so this was the only site.

The rest of the `src` diff across the six phases is not product behaviour:
three `data-testid` additions (`LabeledSlider.tsx`, `RedirectionRule.tsx`,
`ScrollButton.tsx`), the coverage collector fix in
`packages/shared/src/utils/coverage.ts`, and test infrastructure that lives
under `packages/shared/src` (`constants/e2e-tests.ts`, `utils/test-helpers.ts`,
`utils/test-poms.ts`, `utils/test-trpc.ts`, `testIndex.ts`).

## Remaining coverage gaps

Attribution, in descending size:

- **Pages the context emits rather than hands out.** Only `context.newPage()`
  is wrapped, so tabs arriving on the `page` event — `openNewPageFromAction`,
  the Open Defaults tabs — never get `startJSCoverage` and are wholly
  unattributed. Their behaviour _is_ asserted; only the measurement is missing.
- **Script-initiated navigation.** A document left because a page script
  navigated is still discarded.
- **Injected scripts.** Asserted behaviourally, invisible to attribution.
- **Silent per-page drops.** The Phase 6 run logged one
  `coverage.startJSCoverage: Target page, context or browser has been closed`.
  `safely` swallows it by design, so one page's coverage left that report with
  no failure.

Measured gaps: branches are the weakest metric everywhere — 85.10% overall,
and `packages/shared/src` branches sit at 80.00% against 94.74% functions.

## Deferred items

- `onErrorOccurred` / `onRemoved` marker cleanup for duplicate redirect
  handling has no browser-observable signature, since repeat handling is
  idempotent. The redirect-count case guards the defect those listeners exist
  for; the cleanup itself is exercised, not asserted.
- `openFolder` identifies the destination by its contents, not its name: the
  extension panel header shows only a count. Every test folder holds a distinct
  list, so a wrong destination fails — on contents rather than identity. Worth
  revisiting if a folder-name affordance is added.
- Staged shortcut rows surviving a panel remount would be a new feature, not a
  regression; both halves are asserted instead (saved rows persist, staged ones
  do not).
- `RedirectionSchema` has no per-rule active flag, so "deactivation" is read as
  the extension switch.
- Numerical coverage thresholds or gates, per the issue's own out-of-scope
  list. Nothing in this report is enforced by CI.
