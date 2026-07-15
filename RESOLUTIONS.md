# Yarn Resolutions

This file documents every entry in the `resolutions` block of `package.json`. Each entry should answer three questions: **what is being pinned**, **why it exists**, and **when it can be removed**.

`package.json` doesn't allow comments, so this file is the only place that knowledge lives. **If you add or remove a resolution, update this file in the same commit.**

## Conventions

- Use `^` ranges for `<package>: <range>` style pins so future patch/minor releases land naturally.
- Prefer **per-parent** paths (`parent/child`) over standalone descriptors. Yarn-berry only matches a standalone descriptor on exact text — `picomatch@npm:^4` will *not* match a child request of `^4.0.2`. The reliable forms are `parent/child`, `parent@npm:<exact-version>/child`, or `parent@npm:^<major>/child`.
- **Versioned-parent pins go stale silently.** When `minimatch@10.2.4` becomes `10.2.5` in the tree, `minimatch@npm:10.2.4/brace-expansion` matches nothing and yarn does not warn. Re-run `/sca-triage` periodically to catch this.

## Audit cadence

Run `/sca-triage` monthly or before every release. The classifier will surface any silently-broken resolution as a recurring high-severity finding. Each entry below has a **drop when** condition — when that condition becomes true, delete the entry and re-install.

---

## Active resolutions

### Pre-existing (rationale recovered from git history)

#### `@types/react: 17.0.30` and `@types/react-dom: 17.0.9`
- **Why:** Forces every transitive consumer onto the React 17 type definitions, so libraries that loosely peer on `@types/react` don't pull in React 18+ types and break the app's typecheck. Introduced in commit `30a8c433` ("Force @types/react@17 so all dependencies use it").
- **Fixes:** Not security-related — typecheck stability only.
- **Drop when:** The app migrates to React 18+, at which point these can be removed (or bumped to the matching major).

#### `qs: 6.14.2`
- **Why:** Pinned alongside the direct `qs` dep to override any older transitive request. Originally added at `6.14.1` in commit `73df6b5a` ("Address Snyk-reported vulnerabilities") to clear a transitive `qs@6.9.7`; later bumped to `6.14.2`.
- **Fixes:** SNYK-JS-QS-14724253 — Allocation of Resources Without Limits (High) in transitive `qs@6.9.7`.
- **Drop when:** No transitive consumer requests `qs < 6.14`. Verify with `yarn why qs`.

#### `diff: 5.2.2`
- **Why:** Forces transitive `diff` consumers off the vulnerable older line. Added in commit `73df6b5a`.
- **Fixes:** SNYK-JS-DIFF-14917201 — ReDoS (Medium).
- **Drop when:** All parents pulling `diff` request `^5.2.0` or later natively. Verify with `yarn why diff`.

#### `i18next: 19.8.5`
- **Why:** Held at the version `@dhis2/d2-i18n` expects, while overriding any older transitive request that would otherwise resolve to a vulnerable line. Added in commit `73df6b5a`.
- **Fixes:** SNYK-JS-I18NEXT-1065979 (Prototype Pollution, High), -575536, -585930 (Buffer Overflow, Medium).
- **Drop when:** `@dhis2/d2-i18n` updates to a version pulling a still-patched `i18next` natively, or the app migrates off `@dhis2/d2-i18n`. ⚠️ Holding at `19.8.5` indefinitely is itself risky — i18next 19 is EOL; revisit on next d2-i18n bump.

### Pre-existing (rationale not recovered)

| Pin | Notes |
|---|---|
| `@dhis2/ui-icons: 7.4.1` | Added in commit `f31d19d3` ("Fix yarn start and build"); commit message gives no further detail. Likely held back to match `@dhis2/ui` peer requirements, but this is inference, not confirmed. Leave alone until someone with project history can confirm. |

### Security pins (added 2026-05-27 by `/sca-triage`)

#### `styled-jsx/loader-utils: ^1.4.2`

-   **Why:** `styled-jsx@4.0.1` (pulled by `@dhis2/app-shell` and `@dhis2/cli-app-scripts`) pins `loader-utils` at exactly `1.2.3`, which is vulnerable across six advisories. The scoped resolution overrides only `styled-jsx`'s request, leaving the separate `2.0.4` line (used by `babel-loader`, `file-loader`, `@pmmmwh/react-refresh-webpack-plugin`) untouched. Build-time only — no runtime surface.
-   **Fixes:** CVE-2022-37599 (high 7.5), CVE-2022-37601 (critical 9.8), CVE-2022-37603 (high 7.5), GHSA-76p3-8jx3-jpfq (critical 9.8, confirmed 1.x fixed at `1.4.1` per GitHub advisory API), GHSA-3rfm-jhwj-7488 (high 7.5), GHSA-hhq3-ff78-jv3g (high 7.5).
-   **Drop when:** `styled-jsx` is upgraded to a version that either drops `loader-utils` or requests `^1.4.2` or later natively (or the DHIS2 app-shell chain migrates to a non-webpack CSS-in-JS approach). Verify with `yarn why loader-utils`.

#### `request/form-data: ^2.5.4`

-   **Why:** `request@2.88.2` (deprecated, pulled by `@dhis2/cli-helpers-engine` under `@dhis2/cli-app-scripts`) requests `form-data@~2.3.2`, which resolves to the vulnerable `2.3.3`. All other `form-data` consumers in the tree (`@dhis2/cli-app-scripts` → `3.0.4`, `axios` → `4.0.5`, `jsdom` → `3.0.4`) are already on patched versions and are unaffected by this scoped pin. Build/dev-tool chain only — no runtime surface.
-   **Fixes:** CVE-2025-7783 / GHSA-fjxv-7rqg-78g4 (critical 9.0) — unsafe boundary random in `form-data < 2.5.4`.
-   **Drop when:** The `request` chain is removed (i.e., `@dhis2/cli-helpers-engine` drops `request` as a dependency) or `@dhis2/cli-app-scripts` is upgraded to a version that no longer pulls `request`. Verify with `yarn why form-data`.

### Security pins (added 2026-05-08 by `/sca-triage`)

#### `lodash: ^4.18.0`
- **Why:** Direct dependency was bumped from `4.17.23` → `4.18.1`. The resolution forces every transitive consumer (DHIS2 libs, depcheck, ts-mockito, eslint-plugin-flowtype, i18next-scanner, etc.) onto the same line — without it, several parents stay on `4.17.21` and the CVEs persist.
- **Fixes:** CVE-2026-4800 (critical 9.8) and CVE-2021-23337 (high 8.1) — both template-injection in `_.template`. Fix landed in lodash 4.18.0, the first lodash minor in 5+ years and explicitly cut to address these advisories.
- **Drop when:** Either every transitive parent natively requests `lodash@^4.18.0` or higher (verify with `yarn why lodash`), or the project removes the direct `lodash` dep entirely.

#### `minimatch` per-parent (10 entries)
```jsonc
"@eslint/eslintrc/minimatch":                     "^3.1.4",
"@humanwhocodes/config-array/minimatch":          "^3.1.4",
"eslint/minimatch":                               "^3.1.4",
"eslint-plugin-import/minimatch":                 "^3.1.4",
"eslint-plugin-jsx-a11y/minimatch":               "^3.1.4",
"eslint-plugin-react/minimatch":                  "^3.1.4",
"multimatch/minimatch":                           "^3.1.4",
"glob@npm:7.2.3/minimatch":                       "^3.1.4",
"depcheck/minimatch":                             "^7.4.8",
"@typescript-eslint/typescript-estree/minimatch": "^9.0.7"
```
- **Why:** The dev-tool chain pulls minimatch in three vulnerable major lines (3.x via the eslint-8 ecosystem, 7.x via depcheck, 9.x via @typescript-eslint 6). The 10.x line (under `glob@13.0.6` / `cacache`) is already patched and untouched. Each pin is a patch-level bump within the parent's existing range, so the fix is mechanical: yarn resolves to `minimatch@3.1.5`, `7.4.9`, `9.0.9` respectively. The `glob@npm:7.2.3` entry is versioned-parent because `glob` lives in two majors here (v7 wants `^3.1.x`, v13 wants `^10.2.x`); a parent-name pin would mis-route.
- **Fixes:** CVE-2026-26996 / -27903 / -27904 (high 7.5 each), all ReDoS-class. Dev-tool only — no runtime path.
- **⚠️ Decay risk:** `glob@npm:7.2.3/minimatch` is the one versioned-parent entry; if `glob` v7 ever bumps to 7.2.4 anywhere in the tree, that pin silently no-ops. The other 9 are parent-name pins and ride patch/minor bumps naturally.
- **Drop when:** The dev toolchain is upgraded past these majors — concretely, eslint 9 (drops the minimatch 3.x chain across `eslint`, `@eslint/eslintrc`, `@humanwhocodes/config-array`, `eslint-plugin-{import,jsx-a11y,react}`), `@typescript-eslint` 8 (drops the 9.x line), and a depcheck bump past 1.4.7 (drops the 7.x line). Reconsider on each of those upgrades.

### Security pins (added 2026-05-06 by `/sca-triage`)

#### `axios: 1.16.0`
- **Why:** Direct dependency. The pin matches the direct `dependencies.axios` and is here defensively to override any transitive request for an older axios.
- **Fixes:** CVE-2025-62718, CVE-2026-42033, CVE-2026-42035, CVE-2026-42038, CVE-2026-42039, CVE-2026-42043, CVE-2026-42044 — and transitively cleared `follow-redirects@1.15.11` (CVE-2026-40895).
- **Drop when:** Both `dependencies.axios` is updated to a still-patched version (any `>= 1.16.0`) AND no transitive consumer requests anything older. In practice: keep this synced with `dependencies.axios` and remove the resolution only if the dep tree clearly has no other consumers of axios below 1.15.0.

#### `flatted: ^3.4.2`
- **Why:** `@vitest/ui`, `flat-cache`, `log4js` all pull `flatted@^3.x` ranges that include the vulnerable `3.3.3`. Forcing `^3.4.2` keeps every parent satisfied.
- **Fixes:** CVE-2026-32141 (high 7.5), GHSA-25h7-pfq9-p65f / CVE-2026-33228 (high 7.5).
- **Drop when:** All three parents publish new versions whose `flatted` range starts at `^3.4.0` or later. Verify with `yarn why flatted` — if every parent line shows `(via npm:^3.4.x)` or higher, the pin is redundant.

#### `tar: ^7.5.10`
- **Why:** `node-gyp@12.2.0` requests `tar@^7.5.4`, which resolves to the vulnerable `7.5.9` without this pin.
- **Fixes:** GHSA-qffp-2rhf-9h96 (high 8.0).
- **Drop when:** `node-gyp` updates to a version requesting `tar@^7.5.10` or later.

#### `picomatch` per-parent (5 entries)
```jsonc
"@rollup/pluginutils/picomatch": "^4.0.4",
"tinyglobby/picomatch":          "^4.0.4",
"vite/picomatch":                "^4.0.4",
"vitest/picomatch":              "^4.0.4",
"micromatch/picomatch":          "^2.3.2",
"readdirp/picomatch":            "^2.3.2",
"anymatch/picomatch":            "^2.3.2"
```
- **Why:** picomatch lives in two major lines in this tree (4.x via the rollup ecosystem, 2.x via the chokidar/micromatch ecosystem). A single global resolution would force one major onto parents that can't take it. Yarn-berry doesn't support range-scoped descriptors (`picomatch@npm:^4` matches literally nothing), so we resolve per-parent-name instead, which is name-stable and version-agnostic. The `vite/picomatch` and `vitest/picomatch` entries were added 2026-05-08 after BOM analysis showed `vite@7.3.2` and `vitest@3.2.4` were pulling `picomatch@4.0.3` directly — neither was covered by the original `@rollup/pluginutils` and `tinyglobby` parent paths.
- **Fixes:** GHSA-c2c7-rcm5-vvqj (CVE-2024-4067, CVE-2024-45296), high 7.5.
- **Drop when:** Each named parent updates to a version that pulls a patched picomatch on its own. Check with `yarn why picomatch`.

#### `brace-expansion` per-exact-parent (1 entry)
```jsonc
"minimatch@npm:10.2.4/brace-expansion": "^5.0.5"
```
- **Why:** brace-expansion now only needs exact-parent pinning for the 5.x major carried by `minimatch` 10.x. The 1.x and 2.x lines are already resolving to patched versions natively after the parent upgrades landed in the tree.
- **Fixes:** CVE-2026-33750 (high 7.5).
- **⚠️ Decay risk: HIGH.** Exact-parent entries silently no-op on parent patch bumps. `minimatch@10.2.4/brace-expansion` still covers the `glob@13.0.6` branch. The separate `glob@11.1.0 -> minimatch@10.2.5 -> brace-expansion@5.0.5` branch is already patched natively and does not need its own pin.
- **Drop when:** All remaining `minimatch` 10.x parents in the tree pull patched brace-expansion natively, OR the 10.x branches disappear entirely.

#### `vite@npm:^4.0.0/rollup: ^3.30.0`
- **Why:** The application's vite (`devDependencies.vite ^4.0.0` → `vite@4.5.14`) pulls rollup `^3.27.1`, which resolves to the vulnerable `3.29.5`. The vitest tree's vite 7 already gets `rollup@4.60.3` (past the v4 fix line of 4.59.0), so it does not need a pin. The `^4.0.0` parent path scopes this to vite 4.x only — without scoping, a global `rollup` resolution would also downgrade vite 7's rollup 4.
- **Fixes:** GHSA-mw96-cpmx-2vgc (high 8.0).
- **Drop when:** The application is upgraded to vite ≥ 5 (which pulls rollup 4 natively), at which point the pin becomes a no-op and should be removed. Tracked separately as the "vite 4 → 7 migration" PR.

#### `vitest/vite`, `vite-node/vite`, `@vitest/ui/vite: ^7.3.2`
- **Why:** vitest@3.2.4 (and friends) request vite via the range `^5.0.0 || ^6.0.0 || ^7.0.0-0`, which resolves to the vulnerable `vite@7.1.2` without these pins. We do **not** want a global vite resolution because the application's own vite is at v4.
- **Fixes:** CVE-2026-39363, CVE-2026-39364, GHSA-v2wj-q39q-566r — all high 7.5–8.0, dev-server-only.
- **Drop when:** vitest is upgraded past `^3.2.4` to a version whose vite peer range starts at `^7.3.2` or later. (Note: vitest@4 requires vite@6+, which the app does not yet have — see "vite 4 → 7 migration" PR.)

---

## Decay-monitoring checklist

When running `/sca-triage`, treat any of these as a signal that a pin has gone stale:

- A high-severity finding reappears for a package that has an active resolution.
- `yarn why <pkg>` shows the resolved version *not matching* the right-hand side of the resolution.
- A versioned-parent pin (e.g. `minimatch@npm:10.2.4/...`) where `yarn why minimatch` shows no `10.2.4` entry — the pin is now a no-op and should be either re-pinned to the new parent version or removed if no longer needed.

## Future improvements

- Make the existing `dependency-track-yarn4` GitHub workflow **block** on severity ≥ high so a regression doesn't reach `development`.
- Treat the `d2@31.7.0` chain (via `@dhis2/d2-ui-core`) as an **eviction candidate** rather than a pin-forever item. It still pulls packages with no upstream fix path.
