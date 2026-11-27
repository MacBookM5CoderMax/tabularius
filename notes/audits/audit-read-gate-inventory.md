# Read-gate inventory (r28-01)

This extends the generated privilege matrix already present in `docs/audit-privilege-matrix.md`, the store summary/related-privilege regressions, and `notes/audits/r22-02-cross-file-isolation.md`. Initial filename/content searches found no earlier r28-01 inventory, backlog, claims directory, or AGENTS.md in this checkout. Existing gates were retained. No private corpus or downloaded fixture was opened; all runtime inputs are generated. No real git command ran. There were no dependency changes, service operations, commits or pushes; the optional version probe was blocked by a command stub as described below.

The security policy is: an account-facing result must not disclose hidden fields, records, counts, found-set sizes, grouping, sort order or aggregates. A raw store/SQLite primitive is **not** an authorization boundary. Local operator operations, authenticated server administration, and internal materialization are separately classified below; they do not accept a restricted file account as authority. An omitted `Privileges` argument means trusted execution, not an anonymous caller.

## Public expectations and KNOWN

Public references establish the following principles; synthetic numeric results are computed from generated inputs, not claimed as vendor test results. No Claris instance was used.

| Expectation used by tests | Public page / short expression | Result expected here |
| --- | --- | --- |
| Row formula and hidden fields/tables | [Editing record access privileges](https://help.claris.com/en/pro-help/content/record-access-privileges.html): “No access”, “Boolean calculation” | Only the caller-owned row contributes; hidden fields/tables contribute no returned data. |
| Found-set cardinality and summaries | [Editing record access privileges](https://help.claris.com/en/pro-help/content/record-access-privileges.html): “found set is always filtered”, “exclude data” | One visible row; aggregate total 7 in the store regression, excluding the other row. |
| Record and layout checks both apply | [Get(RecordAccess)](https://help.claris.com/en/pro-help/content/get-recordaccess.html): “Get(LayoutAccess)” | Hidden parent/layout requests fail before portal counts. |
| Found-count meaning | [Get(FoundCount)](https://help.claris.com/en/pro-help/content/get-foundcount.html): “number of records” | Counts describe the visible found set, including portal paging and current dashboard counts. |
| Value lists and ordinary scripts | [Editing record access privileges](https://help.claris.com/en/pro-help/content/record-access-privileges.html): “does not display any values” | No hidden source values; caller-run scripts keep their account gates. |

| KNOWN | Status / boundary |
| --- | --- |
| Exact error envelopes, omission versus empty value, rejection of hidden sort/group fields | **Unverified Claris compatibility**. Tabularius security policy; the cited record-access page documents access restrictions, not these API representations. Existing protocol matrix expectations remain its own policy. |
| Live presence/event filtering, calendar headers, MCP tools, dashboards, saved digest prose and RAG spaces | **Unverified Claris compatibility**. Tabularius extensions. Expected results implement the stated invariant; there is no public Claris page establishing equivalent endpoints. |
| Historical digest payloads | Restricted readers receive run metadata with empty data/highlights and no saved prose. Re-run the dashboard for current filtered results. Existing snapshots have no row/field provenance. |
| AI digest prose for restricted accounts | Suppressed, because arbitrary prose cannot be re-filtered after row access changes. Current dashboard data remains available. |
| RAG snapshots | File-scoped documents have no row/field provenance. The server adapter now requires `readsEverything` on each operation. No claim of per-document RLA. |
| Internal/operator readers | Raw primitives have no account parameter. They are catalogued as trusted capabilities, with their account-facing caller boundary documented below. They are not independently safe to expose as routes. |
| Static inventory limits | Type-resolved references, aliases, bracket calls, destructured capabilities, raw SQLite statements and calculation/relationship reads are checked. Reflective/dynamically constructed property names and values erased to `any` are not a complete call-graph proof. |
| Runtime completeness | Generated tests exercise reader APIs and boundary families, including existing protocol matrices. They do **not** invoke every internal helper or every branch of every classified function as a restricted account. The inventory is exhaustive for the enumerated code APIs, not a claim of exhaustive execution coverage. |
| Operator diagnostics and outgoing hooks | Local diagnostics require filesystem/operator authority; change webhooks require server-admin configuration. Their internal builders do not accept a restricted account. Real service commands, thumbnail tools, external webhook/model calls and vendor conformance are unverified here. |
| Independent security review | A different-model review follows this change; it has not been performed by this author. |

## Reproduced gaps and fixes

Each row has a synthetic regression. Before fixes the four new store regressions failed; surface regressions reproduced the live and snapshot disclosures. Test data values are deliberately omitted from this report.

| Gap | Fix | Regression |
| --- | --- | --- |
| `sortIdsCurrent` trusted supplied ids and hidden sort columns | Layout/table/field checks plus record view filter before ordering | `store/test/read-gate.test.ts`: sortIds |
| `groupSummariesCurrent` grouped supplied ids and included hidden summary fields | Layout/table/group-key gate, visible ids, visible output summary fields | Same file: groupSummaries |
| `foundSetRowsCurrent` returned unfiltered supplied-id count and pagination | Filter before choosing the page and reporting count | Same file: foundSetRows |
| `portalCountsCurrent` accepted a hidden parent and reused restricted cached counts | Parent gate before fast paths; restricted callers recompute related counts | Same file: portalCounts; extended `privileges-everywhere.test.ts` cached related-row regression |
| Live locks/viewers and event ids used only table visibility | Per-record rules for snapshots, presence writes, individual events and bulk ids; missing/deleted restricted rows fail closed | `server/test/read-gate-surfaces.test.ts`: locks/viewers and fenced stream |
| Digest histories kept earlier, broader account data | Suppress unverifiable historical payloads for restricted readers on list/detail/runs routes | Same file: saved digest |
| Digest data/prose survived access changes across the summary await | Compare data/security stamps of hosted files before webhook handoff and after awaits; discard changed snapshots; release running state in `finally` | Same file: asynchronous digest, with an in-process poster |
| RAG file-only scope returned copied record data to restricted accounts | Server adapter checks unrestricted record/field visibility on every space operation; script engine also rejects restricted/scoped callers with custom backends | Same file: RAG adapter and script regressions, with generated vectors and no embedding request |

## Inventory generation and enforcement

`node scripts/read-gate-inventory.ts --check` scans only package source trees, resolves the declarations behind reads using the already installed TypeScript compiler, compares call-expression fingerprints and multiplicity with `read-gate-allowlist.json`, and checks this generated table. `node scripts/read-gate-inventory.ts` updates **only** the table after classification has been reviewed. There is deliberately no command to accept new call sites automatically.

The inventory contains **2,462 read/capability sites in 716 functions**. The initial discovery used `rg` over Store's read methods and their callers. The generator additionally includes direct `Store.sql` capability transfers, SQLite `prepare/get/all/iterate`, calculation and relationship reads, so SQL aliases and builders that bypass Store methods are visible. SQLite writes and schema/security reads are retained conservatively: their presence in the table does not mean they disclose record values. Each row names the enclosing function, every relevant source line, and its gate classification. New sites, changed call arguments, duplicate sites, removed sites and moved functions fail the allow-list test; shifting line numbers only requires regenerating the report.

The guard regression injects synthetic unlisted readers in memory, including aliases, bracket access and destructuring, without editing production source. It also checks duplicate call-site multiplicity. Passing the guard means classification is current, not that a fingerprint proves authorization: the `CORE` entries in particular are fingerprints of call text, so they show that a site did not change, not that its privilege argument is right (a `privileges` variable rebound upstream would go unnoticed).

The scan is a regression catcher, not a hard boundary. Resolution is by declaration file, so a member of a receiver typed `any` or `unknown` is reported by name (as `Untyped.<api>`). Everyday names (`get`, `find`, `select`, `query`, `row`, `describe`, `container`, `sql` and a few more) are reported only when the receiver is a Store, calculation engine or SQLite connection cast to `any`/`unknown`, directly, through a variable whose initialiser is the cast (up to four aliases deep) or by destructuring, and only for types declared in `store.ts`, `calc.ts`, `related.ts` or `node:sqlite`; on any other untyped value they would be a Map or an array. These are not found: a variable annotated `any` and assigned a reader instead of cast (`const a: any = s`, `let a: any; a = s`), an alias passed through a function parameter, an object property or an array element, a chain deeper than four, a function that returns `any`, a cast of a union, intersection or generic (`Store | Calculations`), a cast of a Store subclass declared in another file, a JSDoc cast in a `.mjs` file, `.prepare` or `.exec` on a SQLite connection cast to `any`, a computed key (`(s as any)[key]()`, `Reflect.get(s, 'find')`), a cast to a structural type, a call through a subclass that overrides the method in another file, and anything outside `packages/*/src`.

The inventory also classifies the authentication metadata reads in `Store.useRecoveryCode` and `Store.knownSharedAccount` as `CORE`. The former checks for an unused code matching the account and supplied code hash before consuming it and opening a session; the latter returns an internal account-existence boolean for sign-in lockout accounting. Both query security metadata rather than solution records, and neither returns the stored metadata to the caller.

## Route and gate ledger

The route dispatcher is `packages/server/src/index.ts`. The generated function inventory below expands these boundaries rather than replacing them with a filename-only exemption.

| ID | Entry/caller gate and data handling | Synthetic evidence |
| --- | --- | --- |
| REST | `DataApi.authorize` / `sessionPrivileges`, layout scope; `Store.find/get` apply record rules and field omission before count/data envelopes | privilege-matrix-dataapi, api-token |
| WEB | `WebClient.handle` session/layout gate; store readers receive privileges; groups/export reselect visible ids; history uses field/table concealment | privilege-matrix-web, read-gate |
| ODATA | `ODataEndpoint` authenticated privileges, visible entity sets/properties; select/count/compute and related readers pass privileges | privilege-matrix-odata |
| XML | `CwpXmlEndpoint` authentication/fmxml plus layout; `find/get` receive privileges | privilege-matrix-xml |
| SQL | HTTP `checkReadsEverything`, pgwire authentication and per-query privilege recheck, destination-file check; MCP `readsEverything` for raw SQL/formulas/numeric containers | privilege-matrix-sql, pgwire, mcp |
| MCP | `privilegesIn`, tool-specific layout/read gates; raw tools use SQL gate; `registerResources` uses `designAccess`/Full Access for whole-file resources | privilege-matrix-mcp |
| SCRIPT | ScriptEngine caller privileges, `reading`, found-set/value readers and calculation passes; related raw match ids filtered through destination `viewableIds`; export/print flags checked separately | privilege-matrix-scripts; store related/summary tests |
| GATED-STORE | `checkLayout`, local/destination privileges, `viewFilter`/`checkRecordRule`, field checks and `toRecord` masking; calculations carry privileges | read-gate, summary-privileges, privileges-everywhere |
| CALC | Calculation `Pass.privileges`, field visibility, visible related rows and `scopedTableSql`; raw materialization is internal and must not be returned directly | summary-privileges, privileges-everywhere |
| RELATED | Raw relationship primitives; caller supplies privileges or filters ids before exposure (`ScriptEngine.relatedIds`, store portals/calculation pass) | privileges-everywhere, protocol matrices |
| CALENDAR | Data API session/scoped token, readable mapping, `find(... privileges)` before event count/content | read-gate-surfaces |
| LIVE | Session per request/event, file binding, record gate for presence and event ids; design events require Full Access | read-gate-surfaces |
| CHANGE | Data API account refresh; table and `canViewRecord` check for record events. Configured webhook consumers are server-admin authority | existing change-feed code review; live synthetic fence |
| DASHBOARD | Saved definitions are metadata; `DashboardApi` computes widgets through `summarizeRecords` with requesting privileges | read-gate-surfaces |
| DIGEST | `mayRead` account ownership/Full Access plus restricted-history suppression; runner obtains current privileges and rechecks snapshot stamps before delivery | read-gate-surfaces |
| SUMMARY | `findIds` with privileges; visible grouping/measure fields; raw SELECT restricted to authorized ids, evaluated path carries privileges | read-gate-surfaces, privilege-matrix-mcp |
| PROFILE | `layoutProfile` field access and destination `viewableIds`; `columnProfile` operates on those ids. MCP layout gate precedes entry | read-gate-surfaces, privilege-matrix-mcp |
| SEARCH | Text/semantic search checks tables, visible fields, visible ids and readable layouts before hits; vectors read with privileges | privilege-matrix-mcp |
| RECORD | Explanation/context helpers use account-bearing calculation passes and visible related rows; route/tool checks parent record first | protocol matrices; related/summary tests |
| HISTORY | Web parent read gate and `hideField`/`hideTable` callbacks; MCP history is a design tool requiring Full Access | privilege-matrix-web, mcp |
| CONTAINER | Signed URL minted from privileged field read; the `index.ts` container route calls `Host.checkUrl` to validate signature, expiry and bound account identity/inactive state before raw container/range/thumbnail reads | protocol matrix container checks; actual thumbnail programs not run |
| DESIGN | `DesignApi`/`SecurityApi` Full Access; MCP design guard or `designAccess` (modifiable scripts plus readsEverything); debug Full Access. Sampling/diagnostic raw helpers inherit that caller gate | privilege-matrix-mcp, admin; static caller review |
| ADMIN | Separate server-admin authorization in `Admin.handle`/Admin API, not file credentials; includes logs/statistics | privilege-matrix-admin |
| AUTOMATION | Full Access configuration, saved execution account and current script privileges; stored run logs are privileged metadata/history | static caller review; protocol script matrix |
| CLEANUP | Scans/updates select visible ids and fields; raw undo/snapshot journal is internal to checked mutation paths; HTTP session and MCP caller gate | static caller review |
| IMPORT | Import route/layout/write privileges before target-key/undo journal access; configuration/history uses design/admin authority | static caller review |
| ACCOUNT | Assistant tool calls retain requesting account/file; model redaction does not replace the underlying read gate | protocol MCP matrix; RAG regression |
| RAG | `Assistant.scriptAi` adapter `checkRag`: current `readsEverything` plus model policy; ScriptEngine `checkRagRead` enforces account/ceiling gates; raw RagStore is an internal file-scoped cache | read-gate-surfaces |
| REDACTION | Raw secret/PII inspection is used to remove values or build account-scoped stand-ins; preview belongs to privileged design tools | static caller review |
| POLICY | SQL/AI policy inspection is an internal refusal path, not a returned record result | static caller review |
| AUTH | Account/token/identity/configuration SQL; authentication/session/admin gates, not solution record reads | protocol authentication matrices |
| JOIN | Worker receives only rows/columns already filtered by `ODataEndpoint.crossjoined`; its database is in memory | static caller review |
| OPERATOR | Local CLI/filesystem ownership, import/reconversion/sync/backup operator, or server-admin boundary; no restricted-account invocation of raw functions | static caller review; no real operator commands executed |
| INTERNAL | Summary warmer/materializer for internal caches; account-facing reads reapply gates | summary-privileges |
| CORE | Store/SQLite internals, security metadata, transactions and raw capabilities. **No independent account gate**; only the caller boundaries above authorize exposure | store and protocol regressions; static inventory |

## Validation

Run `node scripts/test-read-gate.ts` for the generated store/surface regressions and existing synthetic protocol matrix. It uses `--test-concurrency=2`, per-test timeout 55 seconds and a stub-only child PATH. Stubs for launchctl, systemctl, sc, git, npm, curl and sudo write a marker and exit 99; any marker fails the runner. Temporary synthetic release metadata prevents the existing optional git version probe, and is removed afterward. No tests are skipped or disabled.

Run `node --test --test-concurrency=2 packages/server/test/read-gate-inventory.test.ts` for the static guard, `node scripts/read-gate-inventory.ts --check` for report freshness, and `node node_modules/typescript/bin/tsc --noEmit --pretty false` for types.

Prior implementation runtime run (before this repair): **4,483 passed, 0 failed, 0 cancelled, 0 skipped**, across 20 generated-input test files in **126.52 s** total. The command-stub marker remained absent. The final inventory guard passed **3/3** in **17.11 s**; inventory freshness and TypeScript checks passed. Summed top-level test durations for the ten protocol files ranged from **12.15 to 26.69 s** (excluding module startup); the new store and surface regressions also remained well below the per-file budget. The live-stream fence has a 15-second failure bound, with observed event handling comfortably below one third of that bound. The combined hidden-field/hidden-table/row-rule solution also exercises REST, web export, XML, OData counts/aggregates, dashboards, and MCP filtered/denied readers. The first broad run passed 4,384 assertions but correctly **failed the runner** because its command stub caught the pre-existing optional version probe; synthetic build metadata removes that probe without weakening the marker check. Initial sandbox-only HTTP attempts could not bind loopback; subsequent runs used approved loopback execution.

## PR repair review after merging main

The post-merge baseline failed both inventory assertions (111 changed/unclassified fingerprints) and the cached portal-count cost assertion. Review covered each changed expression and its caller boundary. The repaired inventory has 2,454 read/capability sites in 713 functions; 33 functions carry explicit review reasons in the JSON allow-list. Obsolete `oauth.ts/passwordMark` and `calc.ts/Calculations/context/summary/group` inventory scopes were removed because their enumerated reads moved. No wildcard classifications or test relaxations were added.

Two reads required code fixes before classification: `Calculations/context/summary` could use a hidden break field or hidden summary field, and `Store/runningSummaryValues` could use a hidden restart field supplied through sort state. Both now check field visibility before reading those values. The synthetic regressions compare unrestricted results with concealed restricted results. These are Tabularius access invariants, not claims of documented Claris behavior.

`Store/portalCountsCurrent` now reuses account-free snapshot counts before querying design metadata. Every account-bearing call still resolves the current layout and checks layout/parent access before returning cached counts; restricted accounts still recompute related totals. Its new regression covers both layout argument forms, a newly hidden parent, and a layout-denied account whose record privileges otherwise read everything.

Repair validation uses generated stores only. Final regeneration and `node --no-warnings scripts/read-gate-inventory.ts --check` passed for all 2,454 sites; the final standalone inventory test run passed **3 tests, 0 failures, 0 skips** in 23.69 seconds. `npm run typecheck` passed both TypeScript projects. The focused command `node --no-warnings --test --test-concurrency=2 packages/server/test/read-gate-inventory.test.ts packages/store/test/related-path-cost.test.ts packages/store/test/read-gate.test.ts packages/store/test/summary-aggregates-generated.test.ts` passed **18 tests, 0 failures, 0 skips** in 19.81 seconds.

Each new regression was checked in a temporary source copy with only its corresponding production fix removed. The portal snapshot test, hidden GetSummary key test, and hidden running-restart test each failed as expected (**7 passed, 1 failed** per run). Restoring the pre-repair allow-list in that copy reproduced both inventory assertion failures (**1 passed, 2 failed**). The working tree was never reverted. The three new store tests completed in a file comfortably below the 60-second target; none adds timing assertions.

The initial `node scripts/test-read-gate.ts` run reached its existing 180-second overall timeout; the admin matrix also reached its existing 55-second file timeout while other checks were running. It emitted 3,719 passing test lines and one failing file line before interruption; those are partial counts. Admin rerun alone with the same 55-second file limit passed **298 tests, 0 failures, 0 skips** in 30.00 seconds. The other 19 files were rerun with the same concurrency and file limit: **4,187 passed, 1 failed, 0 skipped** in 147.11 seconds. The failure was the digest-history regression reusing a session after privilege changes; main now invalidates that session. The test now additionally asserts HTTP 401 for the revoked session, signs in again, and retains all three HTTP 200 plus hidden-data checks. `node scripts/test-read-gate.ts --surfaces` then passed **27 tests, 0 failures, 0 skips** in 4.42 seconds. Reverting only this test repair in a temporary copy reproduced the stale-session assertion (**26 passed, 1 failed**). Across the latest results for all 20 PR runtime files, **4,486 tests passed, 0 failed, 0 skipped**. All spawned test processes used the marker-writing forbidden-command stubs; no timeout or test was edited.

The broader reruns use `node --no-warnings --test --test-concurrency=2 --test-timeout=55000` under the same stub-only child environment as the PR runner. Files run:

- `packages/store/test/`: `read-gate.test.ts`, `summary-privileges.test.ts`, `found-set-portal.test.ts`, `privileges-everywhere.test.ts`.
- `packages/scripts/test/`: `ai-steps.test.ts`.
- `packages/server/test/`: `read-gate-surfaces.test.ts`, `rag-store.test.ts`, `rag-hybrid.test.ts`, `r15-rag-ai.test.ts`, `calendar-feed.test.ts`, `privilege-matrix-admin.test.ts`, `privilege-matrix-api-token.test.ts`, `privilege-matrix-dataapi.test.ts`, `privilege-matrix-mcp.test.ts`, `privilege-matrix-odata.test.ts`, `privilege-matrix-pgwire.test.ts`, `privilege-matrix-scripts.test.ts`, `privilege-matrix-sql.test.ts`, `privilege-matrix-web.test.ts`, `privilege-matrix-xml.test.ts`.

Also red on main, per the repair brief: `packages/store/test/consistency.test.ts` retains its four pre-existing failing TODO probes (SQL accent equality, date overflow, time overflow, web date normalization). The reported `packages/server/test/container-large-files.test.ts` peak-memory failure did not reproduce here after loopback access was allowed. Combined rerun: **10 passed, 0 hard failures, 4 existing TODO failures**, 12.34 seconds. The initial sandbox run had **9 passed, 1 loopback setup failure, 4 TODO failures**. Neither file was changed.

The following reasons apply to the exact enumerated expressions in each named function. Raw internal materialization and security bookkeeping are explicitly identified as trusted capabilities; they are not independently authorized readers.

| File / function | Gate | Reviewed boundary or repair |
| --- | --- | --- |
| `packages/store/src/store.ts` / `Store/checkProposedWrite`, `Store/gateAgentWrite`, `Store/approvePending`, `Store/constructor` | CORE | Approval preflight reads the target and first related rows only to evaluate the same layout, record and field checks as direct writes, before any proposal/event. The constructor adds a nullable credential-ceiling column; queue/replay SQL stores and restores only that ceiling. Replay narrows current agent privileges, and a refused replay retains its proposal. |
| `packages/scripts/src/engine.ts` / `ScriptEngine/record` | SCRIPT | Store.get receives the current script privileges; getCurrent checks the saved row before overlaying pending edits and masks hidden fields. The cache key includes the privilege fingerprint. |
| `packages/scripts/src/engine.ts` / `ScriptEngine/newRecord` | SCRIPT | The other-window found-set comparison calls findIds with this.reading, which carries the current script privileges; findIdsHere applies viewFilter before returning ids. |
| `packages/server/src/backup.ts` / `stageRestorePoint` | OPERATOR | The new SQLite existence probes inspect only a staged restore copy to refuse unsupported external-container replay. Entry is through local restoreAt or server-admin restorePointTo; no record payload is returned. |
| `packages/server/src/containers.ts` / `ContainerFiles/make` | CONTAINER | The new containerInfo read bounds thumbnail input after index.ts validates the signed URL through Host.checkUrl (signature, expiry and bound account identity/inactive state). This private helper is not a route. |
| `packages/server/src/containers.ts` / `ContainerFiles/makeAdmitted` | CONTAINER | The container byte read moved from make into this private admitted helper; it inherits index.ts/Host.checkUrl signed-URL validation and returns only the authorized container thumbnail. |
| `packages/server/src/oauth.ts` / `legacyPasswordMark` | AUTH | Renamed legacy password fingerprint helper: account row id/password hash are hashed for grant validation and startup migration, never returned as solution data or raw credentials. |
| `packages/server/src/oauth.ts` / `OAuthServer/constructor` | AUTH | Startup migration reads refresh grants and matching account/token provenance, relabels valid legacy delegated credentials and revokes invalid grants. These are internal authentication tables, not record results. |
| `packages/server/src/webclient.ts` / `WebClient/refresh` | WEB | getMany retains the session privileges while adding sort state; getManyCurrent filters supplied ids/found-set rows and toRecord masks fields. Hidden summary break/restart fields are now explicitly suppressed. |
| `packages/server/src/webclient.ts` / `WebClient/records` | WEB | foundIds selects visible records and getMany receives session privileges with sort state; its row filter and field masking remain in force, including the repaired summary key checks. |
| `packages/server/src/webclient.ts` / `WebClient/exportRecords` | WEB | canExport is checked, foundIds receives privileges, and each getMany batch retains them while adding sort state; hidden fields are omitted and masked fields export empty. |
| `packages/server/src/webclient.ts` / `WebClient/aiReplace` | WEB | The AI access and editable target-field checks precede getMany batches carrying session privileges; only visible rows/fields reach model input, with secret/container redaction afterward. |
| `packages/store/src/calc.ts` / `Calculations/computed` | CALC | The repetition-aware context retains the caller's Pass, including privileges. User-facing context field reads enforce field visibility; internal stored passes remain trusted materialization. |
| `packages/store/src/calc.ts` / `Calculations/context/summary` | CALC | Repaired: refuse hidden summary and break fields before direct value reads. Found-set rows come from the checked Store caller; the break-key pass carries privileges. related.clear is cache maintenance, not a record read. |
| `packages/store/src/calc.ts` / `Calculations/beforeWrite` | CORE | Repetition-aware contexts compute persisted auto-enter/stored values inside checked create/update paths. This is intentionally full-data internal materialization, not an independently account-gated reader; later toRecord/context reads apply visibility. |
| `packages/store/src/calc.ts` / `Calculations/computeStoredStyled` | CORE | Repetition-aware contexts materialize stored calculation values and styles for internal write/recompute callers. No account gate exists here; returned storage values are exposed only through checked record/calculation readers. |
| `packages/store/src/store.ts` / `Store/constructor` | CORE | The Store.sql references register deterministic sort-key, first-repetition and SQL substring functions. They do not read or return solution rows; opening the raw store remains an operator/internal capability. |
| `packages/store/src/store.ts` / `Store/joinTransaction` | CORE | The new createSession capability records pending transaction changes after transaction ownership checks. It is private write bookkeeping, with no account-facing row result. |
| `packages/store/src/store.ts` / `Store/independentWindowWrite` | CORE | ScriptEngine.via invokes this for checked create/update/delete/container operations in another window. The raw audit read retains only held transaction audit entries for internal replay and hash relinking; it is not returned to the caller. No independent read authorization is claimed. |
| `packages/store/src/store.ts` / `Store/setPassword` | AUTH | The new statement deletes delegated API tokens during securityChange. Password/security callers enforce their own account or Full Access authority; this raw mutation primitive does not return credential rows. |
| `packages/store/src/store.ts` / `Store/setAccountActive` | AUTH | The added statements rotate identity and revoke account/person/mapping tokens on deactivation inside securityChange. SecurityApi requires Full Access; script account-management callers check their authority. No solution data is returned. |
| `packages/store/src/store.ts` / `Store/signInMark` | AUTH | The new prepared statement persists an authentication generation after rereading the current fingerprint under ledgerWrite. Only generation plus a cryptographic fingerprint leaves this internal helper. |
| `packages/store/src/store.ts` / `Store/signInBase` | AUTH | Reads identity/password metadata solely to hash credentials and authority for session invalidation; raw metadata is not returned. |
| `packages/store/src/store.ts` / `Store/signInBase/identity` | AUTH | Reads only the selected mapping/person identity id into signInBase's hash; no solution records or raw credentials are exposed. |
| `packages/store/src/store.ts` / `Store/ledgerRow` | AUTH | Private schema-presence and main sign-in-ledger reads serve signInMark/settleSignIns. The generation is validated; ledger rows remain inside authentication bookkeeping. |
| `packages/store/src/store.ts` / `Store/ledgerWrite` | AUTH | Private SQL capabilities create the sign-in ledger and manage its transaction. Used only by signInMark/settleSignIns; no record-result exposure or independent account gate is claimed. |
| `packages/store/src/store.ts` / `Store/settleSignIns` | AUTH | Private securityChange bookkeeping reads live account names and ledger keys, removes obsolete identities and advances generations atomically. These internal authentication lists are not returned to clients. |
| `packages/store/src/store.ts` / `Store/savePrivilegeSet` | AUTH | The added token deletion revokes credentials for accounts whose authority changed. SecurityApi requires Full Access and internal bootstrap uses operator authority; no record data is returned. |
| `packages/store/src/store.ts` / `Store/setAccountPrivilegeSet` | AUTH | The added token deletion revokes credentials when an account's effective set changes. Security/admin/script-management callers authorize the mutation; this raw security primitive exposes no record rows. |
| `packages/store/src/store.ts` / `Store/portalCountsCurrent` | GATED-STORE | Account-bearing calls resolve the current layout and checkLayout/canView before any cached count. Only account-free snapshots bypass metadata refresh; restricted callers recompute related counts. |
| `packages/store/src/store.ts` / `Store/findHere` | GATED-STORE | The running-summary id query and repeated found-set portal query use where/params already combined with viewFilter; checkFieldsVisible validates find/sort fields and the public find entry checks the layout. |
| `packages/store/src/store.ts` / `Store/runningSummaryValues` | GATED-STORE | viewableIds filters rows before accumulation and source fields are checked with fieldHidden. Repaired: hidden restart fields in supplied sort state suppress the running result before calc.value; pass privileges follow calculations. related.clear only clears a cache. |
| `packages/store/src/store.ts` / `Store/getCurrent` | GATED-STORE | checkLayout and checkRecordRule precede pending-edit overlay; running-summary ids use viewFilter and toRecord masks output. opts.row references are typed row-supply capability references, not additional SQL reads. |
| `packages/store/src/store.ts` / `Store/groupSummariesCurrent` | GATED-STORE | Layout/table/group-key checks and viewableIds filter supplied ids before fraction totals collect rowsById; visible summary definitions and a privilege-bearing calculation pass govern aggregation. |
| `packages/server/src/pgwrite.ts` / `executeWrite/reader` | SQL | SQL writes (`--sql-writes`) read the table to find the records a WHERE names and to work out each new value. They run as the signed-in account, which already passed the SQL connection's gate (fmxdbc, reads every record and field) and the table's create, edit or delete privilege and the written fields' modify rights before the first read. The changes themselves go through Store.create, update and delete with the account's privileges, so every record rule and audit entry applies there. |
| `packages/server/src/pgwrite.ts` / `returningColumns` | SQL | Describes the columns RETURNING gives back (names and declared types only, no rows) for the account's own table. |
| `packages/store/src/store.ts` / `Store/selectIn` | CORE | Reads through Store.select, or, for the caller that holds the file's open transaction, through the connection holding it. No account gate here: the PostgreSQL connection checks fmxdbc and reads-everything before it calls. |
| `packages/store/src/store.ts` / `Store/selectHeldCurrent` | CORE | The same query screening as Store.select (readOnlyChecked), run on the writable connection so a transaction sees its own uncommitted changes. Only text that passed the read-only screening reaches that connection. |

<!-- generated read-gate inventory -->
| Function | Store read / capability (source lines) | Gate |
| --- | --- | --- |
| [packages/cli/src/diagnostics.ts:230](../../packages/cli/src/diagnostics.ts#L230) `designCopy` | `SQLite.all` (230); `SQLite.prepare` (230, 233) | OPERATOR |
| [packages/cli/src/diagnostics.ts:470](../../packages/cli/src/diagnostics.ts#L470) `diagnostics` | `SQLite.get` (470); `SQLite.prepare` (470, 474); `SQLite.all` (474) | OPERATOR |
| [packages/cli/src/doctor.ts:140](../../packages/cli/src/doctor.ts#L140) `accountChecks` | `SQLite.all` (140); `SQLite.prepare` (140) | OPERATOR |
| [packages/cli/src/main.ts:780](../../packages/cli/src/main.ts#L780) `accountsWithPasswordOff` | `SQLite.all` (780); `SQLite.prepare` (780) | OPERATOR |
| [packages/cli/src/main.ts:813](../../packages/cli/src/main.ts#L813) `hostedRead` | `SQLite.all` (813, 816); `SQLite.prepare` (813, 816); `Store.sql` (813, 816) | OPERATOR |
| [packages/cli/src/main.ts:2621](../../packages/cli/src/main.ts#L2621) `main` | `Store.orphanContainerReport` (2621); `Store.auditLog` (3113); `SQLite.get` (3382); `SQLite.prepare` (3382) | OPERATOR |
| [packages/scripts/src/data-api-step.ts:104](../../packages/scripts/src/data-api-step.ts#L104) `respond` | `Store.get` (104, 131, 140); `Store.find` (105, 117) | SCRIPT |
| [packages/scripts/src/engine.ts:9591](../../packages/scripts/src/engine.ts#L9591) `clearRecords` | `SQLite.all` (9591); `SQLite.prepare` (9591) | SCRIPT |
| [packages/scripts/src/engine.ts:8358](../../packages/scripts/src/engine.ts#L8358) `ScriptEngine/containerFile` | `Store.get` (8358); `Store.containerId` (8359); `Store.container` (8360) | SCRIPT |
| [packages/scripts/src/engine.ts:5909](../../packages/scripts/src/engine.ts#L5909) `ScriptEngine/design` | `Store.valueListItems` (5909) | SCRIPT |
| [packages/scripts/src/engine.ts:6669](../../packages/scripts/src/engine.ts#L6669) `ScriptEngine/exportField` | `Store.get` (6669); `Store.containerId` (6670); `Store.container` (6672) | SCRIPT |
| [packages/scripts/src/engine.ts:8778](../../packages/scripts/src/engine.ts#L8778) `ScriptEngine/fileMakerRows` | `Store.findIds` (8778); `Store.get` (8783) | SCRIPT |
| [packages/scripts/src/engine.ts:3469](../../packages/scripts/src/engine.ts#L3469) `ScriptEngine/findIdsCooperative` | `Store.findIdsProgress` (3469) | SCRIPT |
| [packages/scripts/src/engine.ts:2436](../../packages/scripts/src/engine.ts#L2436) `ScriptEngine/foundSet` | `Store.findIds` (2436) | SCRIPT |
| [packages/scripts/src/engine.ts:5749](../../packages/scripts/src/engine.ts#L5749) `ScriptEngine/get` | `Store.findIds` (5749); `Store.canViewRecord` (5842); `Store.get` (5878) | SCRIPT |
| [packages/scripts/src/engine.ts:2035](../../packages/scripts/src/engine.ts#L2035) `ScriptEngine/goToLayout` | `Store.findIds` (2035) | SCRIPT |
| [packages/scripts/src/engine.ts:8549](../../packages/scripts/src/engine.ts#L8549) `ScriptEngine/importRecords` | `Store.get` (8549) | SCRIPT |
| [packages/scripts/src/engine.ts:6021](../../packages/scripts/src/engine.ts#L6021) `ScriptEngine/lookupNext` | `Store.get` (6021); `Store.row` (6022); `Calculations.context` (6024) | SCRIPT |
| [packages/scripts/src/engine.ts:5552](../../packages/scripts/src/engine.ts#L5552) `ScriptEngine/newCalcContext/executeSQL` | `Calculations.executeSQL` (5552) | SCRIPT |
| [packages/scripts/src/engine.ts:5560](../../packages/scripts/src/engine.ts#L5560) `ScriptEngine/newCalcContext/persistentData` | `Store.persistentData` (5560) | SCRIPT |
| [packages/scripts/src/engine.ts:5561](../../packages/scripts/src/engine.ts#L5561) `ScriptEngine/newCalcContext/persistentDataIds` | `Store.persistentDataIds` (5561) | SCRIPT |
| [packages/scripts/src/engine.ts:8818](../../packages/scripts/src/engine.ts#L8818) `ScriptEngine/newRecord` | `Store.findIds` (8818) | SCRIPT |
| [packages/scripts/src/engine.ts:9198](../../packages/scripts/src/engine.ts#L9198) `ScriptEngine/quickFind` | `Store.get` (9198) | SCRIPT |
| [packages/scripts/src/engine.ts:5963](../../packages/scripts/src/engine.ts#L5963) `ScriptEngine/record` | `Store.get` (5963) | SCRIPT |
| [packages/scripts/src/engine.ts:2352](../../packages/scripts/src/engine.ts#L2352) `ScriptEngine/transactionContext` | `Store.get` (2352) | SCRIPT |
| [packages/scripts/src/engine.ts:6124](../../packages/scripts/src/engine.ts#L6124) `ScriptEngine/relatedIds` | `Store.findIds` (6124); `rowsById` (6132); `Store.select` (6136); `Store.matchIds` (6150); `Store.viewableIds` (6173) | SCRIPT |
| [packages/scripts/src/engine.ts:6158](../../packages/scripts/src/engine.ts#L6158) `ScriptEngine/relatedIds/matching` | `Store.matchIds` (6158) | SCRIPT |
| [packages/scripts/src/engine.ts:6823](../../packages/scripts/src/engine.ts#L6823) `ScriptEngine/relookup` | `Store.get` (6823) | SCRIPT |
| [packages/scripts/src/engine.ts:3629](../../packages/scripts/src/engine.ts#L3629) `ScriptEngine/revertTransaction` | `Store.findIds` (3629) | SCRIPT |
| [packages/scripts/src/engine.ts:3483](../../packages/scripts/src/engine.ts#L3483) `ScriptEngine/sortIdsCooperative` | `Store.sortIdsProgress` (3483) | SCRIPT |
| [packages/scripts/src/engine.ts:3511](../../packages/scripts/src/engine.ts#L3511) `ScriptEngine/sortIdsProgress` | `Store.sortIdsProgress` (3511); `Store.valueListItems` (3517) | SCRIPT |
| [packages/scripts/src/engine.ts:7605](../../packages/scripts/src/engine.ts#L7605) `ScriptEngine/sourceValue` | `Store.get` (7605); `Store.containerId` (7606); `Store.container` (7607) | SCRIPT |
| [packages/scripts/src/engine.ts:3420](../../packages/scripts/src/engine.ts#L3420) `ScriptEngine/sqlByNaturalLanguage` | `Calculations.translateSQL` (3420); `Calculations.executeSQL` (3427) | SCRIPT |
| [packages/scripts/src/engine.ts:4239](../../packages/scripts/src/engine.ts#L4239) `ScriptEngine/step` | `Store.fieldIndex` (4239) | SCRIPT |
| [packages/scripts/src/engine.ts:5996](../../packages/scripts/src/engine.ts#L5996) `ScriptEngine/valueOf` | `Store.findIds` (5996, 5996); `Store.containerId` (6004) | SCRIPT |
| [packages/scripts/src/recorder.ts:83](../../packages/scripts/src/recorder.ts#L83) `lastSeq` | `Store.auditLog` (83) | DESIGN |
| [packages/scripts/src/recorder.ts:121](../../packages/scripts/src/recorder.ts#L121) `recordRun` | `Store.auditLog` (121) | DESIGN |
| [packages/scripts/src/script-tests.ts:213](../../packages/scripts/src/script-tests.ts#L213) `runCase` | `Store.findIds` (213); `Store.auditLog` (220, 221, 265); `Store.evaluateEach` (248) | DESIGN |
| [packages/scripts/src/testrun.ts:306](../../packages/scripts/src/testrun.ts#L306) `recordWith` | `Store.evaluateEach` (306) | DESIGN |
| [packages/scripts/src/testrun.ts:199](../../packages/scripts/src/testrun.ts#L199) `seedSelections` | `Calculations.globalValue` (199); `Store.find` (204) | DESIGN |
| [packages/scripts/src/testrun.ts:338](../../packages/scripts/src/testrun.ts#L338) `testRun` | `Store.evaluateEach` (338) | DESIGN |
| [packages/scripts/src/testrun.ts:270](../../packages/scripts/src/testrun.ts#L270) `testScript` | `Store.findIds` (270) | DESIGN |
| [packages/server/src/admin.ts:2578](../../packages/server/src/admin.ts#L2578) `Admin/audit` | `Store.auditLog` (2578) | ADMIN |
| [packages/server/src/admin.ts:1198](../../packages/server/src/admin.ts#L1198) `Admin/handle` | `Store.externalContainerReport` (1198); `Store.orphanContainerReport` (1203, 1207) | ADMIN |
| [packages/server/src/admin.ts:3018](../../packages/server/src/admin.ts#L3018) `Admin/status` | `Store.externalContainerCount` (3018) | ADMIN |
| [packages/server/src/admin.ts:2661](../../packages/server/src/admin.ts#L2661) `Admin/viewAs` | `Store.find` (2661) | ADMIN |
| [packages/server/src/agent.ts:320](../../packages/server/src/agent.ts#L320) `dryRunPlan` | `Store.findIds` (320) | DESIGN |
| [packages/server/src/agent.ts:343](../../packages/server/src/agent.ts#L343) `runApprovedStep` | `Store.findIds` (343) | DESIGN |
| [packages/server/src/agent.ts:164](../../packages/server/src/agent.ts#L164) `runStep` | `Store.findIds` (164); `Store.auditLog` (233); `Store.canViewRecord` (245) | DESIGN |
| [packages/server/src/agent.ts:156](../../packages/server/src/agent.ts#L156) `runStep/visible` | `Store.findIds` (156) | DESIGN |
| [packages/server/src/ai-output.ts:147](../../packages/server/src/ai-output.ts#L147) `storedSecretValues` | `Calculations.globalValue` (147); `Store.select` (152) | REDACTION |
| [packages/server/src/ai-policy-sql.ts:49](../../packages/server/src/ai-policy-sql.ts#L49) `sqlFieldRefs` | `SQLite.all` (49, 51); `SQLite.prepare` (49, 51) | POLICY |
| [packages/server/src/ai-policy.ts:355](../../packages/server/src/ai-policy.ts#L355) `sql` | `Store.inspectQuery` (355) | POLICY |
| [packages/server/src/ai-usage.ts:201](../../packages/server/src/ai-usage.ts#L201) `AiUsage/add` | `SQLite.prepare` (201, 204) | AUTH |
| [packages/server/src/ai-usage.ts:250](../../packages/server/src/ai-usage.ts#L250) `AiUsage/importOld` | `SQLite.prepare` (250, 260, 268, 272) | AUTH |
| [packages/server/src/ai-usage.ts:186](../../packages/server/src/ai-usage.ts#L186) `AiUsage/month` | `SQLite.get` (186); `SQLite.prepare` (186) | AUTH |
| [packages/server/src/ai-usage.ts:212](../../packages/server/src/ai-usage.ts#L212) `AiUsage/question` | `SQLite.prepare` (212, 214, 215, 217) | AUTH |
| [packages/server/src/ai-usage.ts:193](../../packages/server/src/ai-usage.ts#L193) `AiUsage/recent` | `SQLite.all` (193); `SQLite.prepare` (193) | AUTH |
| [packages/server/src/ai-usage.ts:179](../../packages/server/src/ai-usage.ts#L179) `AiUsage/today` | `SQLite.get` (179); `SQLite.prepare` (179) | AUTH |
| [packages/server/src/assistant.ts:2159](../../packages/server/src/assistant.ts#L2159) `Assistant/answer` | `Store.find` (2159) | ACCOUNT |
| [packages/server/src/automations.ts:437](../../packages/server/src/automations.ts#L437) `AutomationRunner/changed` | `Store.auditLog` (437) | AUTOMATION |
| [packages/server/src/automations.ts:468](../../packages/server/src/automations.ts#L468) `AutomationRunner/run` | `Store.select` (468); `Store.canViewRecord` (478); `Store.evaluateEach` (481); `Store.evaluate` (487) | AUTOMATION |
| [packages/server/src/automations.ts:514](../../packages/server/src/automations.ts#L514) `AutomationRunner/runDeleted` | `Store.auditLog` (514) | AUTOMATION |
| [packages/server/src/automations.ts:309](../../packages/server/src/automations.ts#L309) `dryRunAutomation` | `Store.canViewRecord` (309); `Store.findIds` (309); `Store.auditLog` (325, 353, 361); `Store.select` (338); `Store.evaluate` (354) | AUTOMATION |
| [packages/server/src/automations.ts:308](../../packages/server/src/automations.ts#L308) `dryRunAutomation/truth` | `Store.evaluateEach` (308) | AUTOMATION |
| [packages/server/src/automations.ts:196](../../packages/server/src/automations.ts#L196) `Saved/delete` | `SQLite.prepare` (196, 198); `Store.sql` (196, 198) | AUTOMATION |
| [packages/server/src/automations.ts:180](../../packages/server/src/automations.ts#L180) `Saved/list` | `SQLite.all` (180); `SQLite.prepare` (180); `Store.sql` (180) | AUTOMATION |
| [packages/server/src/automations.ts:203](../../packages/server/src/automations.ts#L203) `Saved/logRun` | `SQLite.prepare` (203, 205); `Store.sql` (203, 205) | AUTOMATION |
| [packages/server/src/automations.ts:210](../../packages/server/src/automations.ts#L210) `Saved/runs` | `SQLite.all` (210); `SQLite.prepare` (210); `Store.sql` (210) | AUTOMATION |
| [packages/server/src/automations.ts:190](../../packages/server/src/automations.ts#L190) `Saved/save` | `SQLite.prepare` (190); `Store.sql` (190) | AUTOMATION |
| [packages/server/src/automations.ts:169](../../packages/server/src/automations.ts#L169) `Saved/table` | `Store.sql` (169, 170) | AUTOMATION |
| [packages/server/src/backup-verify.ts:152](../../packages/server/src/backup-verify.ts#L152) `testRestore` | `Store.recordCount` (152) | OPERATOR |
| [packages/server/src/backup.ts:1188](../../packages/server/src/backup.ts#L1188) `accountDifferences/read` | `SQLite.all` (1188, 1190); `SQLite.prepare` (1188, 1190) | OPERATOR |
| [packages/server/src/backup.ts:1301](../../packages/server/src/backup.ts#L1301) `columnInfo` | `SQLite.all` (1301); `SQLite.prepare` (1301) | OPERATOR |
| [packages/server/src/backup.ts:1245](../../packages/server/src/backup.ts#L1245) `credentialsReadable` | `SQLite.all` (1245); `SQLite.prepare` (1245) | OPERATOR |
| [packages/server/src/backup.ts:1215](../../packages/server/src/backup.ts#L1215) `readNames` | `SQLite.all` (1215); `SQLite.prepare` (1215) | OPERATOR |
| [packages/server/src/backup.ts:1336](../../packages/server/src/backup.ts#L1336) `reconcileCredentials` | `SQLite.all` (1336, 1358, 1373, 1383, 1389); `SQLite.prepare` (1336, 1344, 1358, 1360, 1373, 1374, 1381, 1383, 1384, 1389, 1390, 1394, 1395, 1396); `SQLite.get` (1344, 1394) | OPERATOR |
| [packages/server/src/backup.ts:1363](../../packages/server/src/backup.ts#L1363) `reconcileCredentials/accountColumns` | `SQLite.all` (1363); `SQLite.prepare` (1363) | OPERATOR |
| [packages/server/src/backup.ts:1339](../../packages/server/src/backup.ts#L1339) `reconcileCredentials/has` | `SQLite.all` (1339); `SQLite.prepare` (1339) | OPERATOR |
| [packages/server/src/backup.ts:1272](../../packages/server/src/backup.ts#L1272) `retainCurrentRecordIdMarks` | `SQLite.prepare` (1272, 1283, 1284, 1285); `SQLite.all` (1274, 1284); `SQLite.get` (1283) | OPERATOR |
| [packages/server/src/backup.ts:1511](../../packages/server/src/backup.ts#L1511) `stageRestorePoint` | `SQLite.get` (1511, 1513, 1514); `SQLite.prepare` (1511, 1513, 1514) | OPERATOR |
| [packages/server/src/calendar.ts:389](../../packages/server/src/calendar.ts#L389) `CalendarFeeds/feed` | `Store.find` (389) | CALENDAR |
| [packages/server/src/changes.ts:196](../../packages/server/src/changes.ts#L196) `ChangeFeed/visible` | `Store.canViewRecord` (196) | CHANGE |
| [packages/server/src/cleanup.ts:748](../../packages/server/src/cleanup.ts#L748) `applyCleanup/apply` | `Store.findIds` (748, 758); `SQLite.all` (749); `SQLite.prepare` (749, 786); `Store.sql` (749, 786); `SQLite.get` (786) | CLEANUP |
| [packages/server/src/cleanup.ts:1052](../../packages/server/src/cleanup.ts#L1052) `CleanupJournal/add` | `SQLite.prepare` (1052); `Store.sql` (1052) | CLEANUP |
| [packages/server/src/cleanup.ts:1047](../../packages/server/src/cleanup.ts#L1047) `CleanupJournal/append` | `SQLite.prepare` (1047); `Store.sql` (1047) | CLEANUP |
| [packages/server/src/cleanup.ts:1038](../../packages/server/src/cleanup.ts#L1038) `CleanupJournal/constructor` | `Store.sql` (1038) | CLEANUP |
| [packages/server/src/cleanup.ts:1058](../../packages/server/src/cleanup.ts#L1058) `CleanupJournal/get` | `SQLite.get` (1058); `SQLite.prepare` (1058); `Store.sql` (1058) | CLEANUP |
| [packages/server/src/cleanup.ts:1063](../../packages/server/src/cleanup.ts#L1063) `CleanupJournal/list` | `SQLite.all` (1063); `SQLite.prepare` (1063); `Store.sql` (1063) | CLEANUP |
| [packages/server/src/cleanup.ts:1067](../../packages/server/src/cleanup.ts#L1067) `CleanupJournal/markUndone` | `SQLite.prepare` (1067); `Store.sql` (1067) | CLEANUP |
| [packages/server/src/cleanup.ts:524](../../packages/server/src/cleanup.ts#L524) `findDuplicates` | `Store.findIds` (524) | CLEANUP |
| [packages/server/src/cleanup.ts:886](../../packages/server/src/cleanup.ts#L886) `journalDeletes` | `SQLite.get` (886); `SQLite.prepare` (886); `Store.sql` (886) | CLEANUP |
| [packages/server/src/cleanup.ts:618](../../packages/server/src/cleanup.ts#L618) `keyValue` | `SQLite.get` (618); `SQLite.prepare` (618); `Store.sql` (618) | CLEANUP |
| [packages/server/src/cleanup.ts:622](../../packages/server/src/cleanup.ts#L622) `relatedIds` | `SQLite.all` (622); `SQLite.prepare` (622); `Store.sql` (622) | CLEANUP |
| [packages/server/src/cleanup.ts:328](../../packages/server/src/cleanup.ts#L328) `scanData` | `Store.findIds` (328); `Store.select` (334) | CLEANUP |
| [packages/server/src/cleanup.ts:817](../../packages/server/src/cleanup.ts#L817) `snapshotField` | `SQLite.all` (817); `SQLite.prepare` (817); `Store.sql` (817) | CLEANUP |
| [packages/server/src/cleanup.ts:877](../../packages/server/src/cleanup.ts#L877) `snapshotRows` | `SQLite.all` (877); `SQLite.prepare` (877); `Store.sql` (877) | CLEANUP |
| [packages/server/src/cleanup.ts:998](../../packages/server/src/cleanup.ts#L998) `undoCleanup` | `SQLite.get` (998, 1014); `SQLite.prepare` (998, 1014); `Store.sql` (998, 1014) | CLEANUP |
| [packages/server/src/cleanup.ts:936](../../packages/server/src/cleanup.ts#L936) `updateMany` | `Store.findIds` (936) | CLEANUP |
| [packages/server/src/compaction.ts:65](../../packages/server/src/compaction.ts#L65) `compactStore` | `SQLite.get` (65, 66, 80, 88); `SQLite.prepare` (65, 66, 80, 88) | OPERATOR |
| [packages/server/src/compare.ts:206](../../packages/server/src/compare.ts#L206) `count` | `Store.query` (206) | DESIGN |
| [packages/server/src/containers.ts:301](../../packages/server/src/containers.ts#L301) `ContainerFiles/make` | `Store.containerInfo` (301) | CONTAINER |
| [packages/server/src/containers.ts:313](../../packages/server/src/containers.ts#L313) `ContainerFiles/makeAdmitted` | `Store.container` (313) | CONTAINER |
| [packages/server/src/containers.ts:134](../../packages/server/src/containers.ts#L134) `ContainerFiles/send` | `Store.containerInfo` (134); `Store.container` (200); `Store.containerRange` (209) | CONTAINER |
| [packages/server/src/conversion-guide.ts:436](../../packages/server/src/conversion-guide.ts#L436) `ConversionGuides/save` | `SQLite.prepare` (436); `Store.sql` (436) | DESIGN |
| [packages/server/src/conversion-guide.ts:427](../../packages/server/src/conversion-guide.ts#L427) `ConversionGuides/saved` | `SQLite.get` (427); `SQLite.prepare` (427); `Store.sql` (427) | DESIGN |
| [packages/server/src/conversion-guide.ts:417](../../packages/server/src/conversion-guide.ts#L417) `ConversionGuides/table` | `Store.sql` (417) | DESIGN |
| [packages/server/src/conversion-guide.ts:138](../../packages/server/src/conversion-guide.ts#L138) `convertedAt` | `SQLite.get` (138); `SQLite.prepare` (138); `Store.sql` (138) | DESIGN |
| [packages/server/src/conversion.ts:377](../../packages/server/src/conversion.ts#L377) `conversionReport` | `Store.externalContainerCheck` (377) | DESIGN |
| [packages/server/src/cwp-xml.ts:721](../../packages/server/src/cwp-xml.ts#L721) `CwpXmlEndpoint/layoutDoc` | `Store.valueListItems` (721) | XML |
| [packages/server/src/cwp-xml.ts:625](../../packages/server/src/cwp-xml.ts#L625) `CwpXmlEndpoint/records` | `Store.get` (625, 645, 653); `Store.findIds` (628); `Store.sortIds` (633); `Store.getMany` (634); `Store.find` (635, 637, 639, 640, 646, 649) | XML |
| [packages/server/src/cwp-xml.ts:589](../../packages/server/src/cwp-xml.ts#L589) `CwpXmlEndpoint/write` | `Store.get` (589, 593, 602); `Store.find` (601) | XML sign-in requires fmxml; every record/version read and count passes the signed-in Privileges, and the response layout is checked for access and the same table before any mutation. Writes and response reads share an atomic transaction. |
| [packages/server/src/dashboards.ts:390](../../packages/server/src/dashboards.ts#L390) `Dashboards/create` | `SQLite.prepare` (390); `Store.sql` (390) | DASHBOARD |
| [packages/server/src/dashboards.ts:410](../../packages/server/src/dashboards.ts#L410) `Dashboards/delete` | `SQLite.prepare` (410); `Store.sql` (410) | DASHBOARD |
| [packages/server/src/dashboards.ts:376](../../packages/server/src/dashboards.ts#L376) `Dashboards/get` | `SQLite.get` (376); `SQLite.prepare` (376); `Store.sql` (376) | DASHBOARD |
| [packages/server/src/dashboards.ts:370](../../packages/server/src/dashboards.ts#L370) `Dashboards/list` | `SQLite.all` (370); `SQLite.prepare` (370); `Store.sql` (370) | DASHBOARD |
| [packages/server/src/dashboards.ts:360](../../packages/server/src/dashboards.ts#L360) `Dashboards/table` | `Store.sql` (360) | DASHBOARD |
| [packages/server/src/dashboards.ts:403](../../packages/server/src/dashboards.ts#L403) `Dashboards/update` | `SQLite.prepare` (403); `Store.sql` (403) | DASHBOARD |
| [packages/server/src/dataapi.ts:2160](../../packages/server/src/dataapi.ts#L2160) `DataApi/route` | `Store.get` (2160, 2385, 2386, 2409, 2417, 2470, 2494, 2514, 2551); `Store.valueListItems` (2175); `Store.find` (2336, 2388, 2585); `Store.findIds` (2340, 2590); `Store.query` (2590) | REST |
| [packages/server/src/dataapi.ts:2288](../../packages/server/src/dataapi.ts#L2288) `DataApi/route/recordOut` | `Store.portalCounts` (2288) | REST |
| [packages/server/src/dataapi.ts:2324](../../packages/server/src/dataapi.ts#L2324) `DataApi/route/shownAs` | `Store.get` (2324) | REST |
| [packages/server/src/debug.ts:346](../../packages/server/src/debug.ts#L346) `DebugApi/handle` | `Store.row` (346, 475); `Store.get` (355, 480); `Store.evaluate` (379) | DESIGN |
| [packages/server/src/debug.ts:195](../../packages/server/src/debug.ts#L195) `learnStoredCredentials` | `Calculations.globalValue` (195); `Store.sql` (201, 211, 211); `SQLite.iterate` (211, 211); `SQLite.prepare` (211, 211); `Store.iterateCommitted` (211) | DESIGN |
| [packages/server/src/design.ts:244](../../packages/server/src/design.ts#L244) `containerData` | `Store.query` (244) | DESIGN |
| [packages/server/src/design.ts:753](../../packages/server/src/design.ts#L753) `DesignApi/handle` | `Store.auditLog` (753); `Store.evaluate` (820) | DESIGN |
| [packages/server/src/design.ts:253](../../packages/server/src/design.ts#L253) `recordCount` | `Store.query` (253) | DESIGN |
| [packages/server/src/digests.ts:232](../../packages/server/src/digests.ts#L232) `Digests/addRun` | `SQLite.prepare` (232, 233); `Store.sql` (232, 233) | DIGEST |
| [packages/server/src/digests.ts:209](../../packages/server/src/digests.ts#L209) `Digests/create` | `SQLite.prepare` (209); `Store.sql` (209) | DIGEST |
| [packages/server/src/digests.ts:226](../../packages/server/src/digests.ts#L226) `Digests/delete` | `SQLite.prepare` (226, 227); `Store.sql` (226, 227) | DIGEST |
| [packages/server/src/digests.ts:190](../../packages/server/src/digests.ts#L190) `Digests/get` | `SQLite.get` (190); `SQLite.prepare` (190); `Store.sql` (190) | DIGEST |
| [packages/server/src/digests.ts:197](../../packages/server/src/digests.ts#L197) `Digests/lastSlot` | `SQLite.get` (197); `SQLite.prepare` (197); `Store.sql` (197) | DIGEST |
| [packages/server/src/digests.ts:184](../../packages/server/src/digests.ts#L184) `Digests/list` | `SQLite.all` (184); `SQLite.prepare` (184); `Store.sql` (184) | DIGEST |
| [packages/server/src/digests.ts:201](../../packages/server/src/digests.ts#L201) `Digests/markSlot` | `SQLite.prepare` (201); `Store.sql` (201) | DIGEST |
| [packages/server/src/digests.ts:239](../../packages/server/src/digests.ts#L239) `Digests/runs` | `SQLite.all` (239); `SQLite.prepare` (239); `Store.sql` (239) | DIGEST |
| [packages/server/src/digests.ts:173](../../packages/server/src/digests.ts#L173) `Digests/table` | `Store.sql` (173) | DIGEST |
| [packages/server/src/digests.ts:218](../../packages/server/src/digests.ts#L218) `Digests/update` | `SQLite.prepare` (218); `Store.sql` (218) | DIGEST |
| [packages/server/src/docs.ts:158](../../packages/server/src/docs.ts#L158) `count` | `Store.query` (158) | DESIGN |
| [packages/server/src/dry-run.ts:92](../../packages/server/src/dry-run.ts#L92) `dryRunChanges/runOnce` | `Store.auditLog` (92, 96) | DESIGN |
| [packages/server/src/find-advice.ts:99](../../packages/server/src/find-advice.ts#L99) `findAdvice` | `Store.recordCount` (99) | DESIGN |
| [packages/server/src/formula-preview.ts:31](../../packages/server/src/formula-preview.ts#L31) `previewFormula` | `Store.findIds` (31); `Store.evaluate` (42) | DESIGN |
| [packages/server/src/hosted-record.ts:221](../../packages/server/src/hosted-record.ts#L221) `approveRestoredFiles` | `SQLite.get` (221); `SQLite.prepare` (221, 225) | OPERATOR |
| [packages/server/src/hosted-record.ts:114](../../packages/server/src/hosted-record.ts#L114) `markStore` | `SQLite.get` (114); `SQLite.prepare` (114, 118) | OPERATOR |
| [packages/server/src/hosted-record.ts:73](../../packages/server/src/hosted-record.ts#L73) `peekInstance` | `SQLite.get` (73); `SQLite.prepare` (73) | OPERATOR |
| [packages/server/src/import-mapping.ts:1024](../../packages/server/src/import-mapping.ts#L1024) `applyImportAddStream` | `SQLite.prepare` (1024); `Store.sql` (1024) | IMPORT |
| [packages/server/src/import-mapping.ts:785](../../packages/server/src/import-mapping.ts#L785) `applyImportRun` | `SQLite.prepare` (785); `Store.sql` (785) | IMPORT |
| [packages/server/src/import-mapping.ts:505](../../packages/server/src/import-mapping.ts#L505) `existingKeys` | `Store.viewableIds` (505); `Store.query` (507) | IMPORT |
| [packages/server/src/import-mapping.ts:829](../../packages/server/src/import-mapping.ts#L829) `fileIdentity` | `Store.sql` (829, 830, 831); `SQLite.prepare` (830, 831); `SQLite.get` (831) | IMPORT |
| [packages/server/src/import-mapping.ts:888](../../packages/server/src/import-mapping.ts#L888) `importHistory` | `SQLite.iterate` (888); `SQLite.prepare` (888); `Store.sql` (888) | IMPORT |
| [packages/server/src/import-mapping.ts:817](../../packages/server/src/import-mapping.ts#L817) `journal` | `Store.sql` (817, 820, 821, 822, 823, 824); `SQLite.all` (820); `SQLite.prepare` (820) | IMPORT |
| [packages/server/src/import-mapping.ts:805](../../packages/server/src/import-mapping.ts#L805) `targetKeys` | `SQLite.all` (805); `SQLite.prepare` (805); `Store.sql` (805) | IMPORT |
| [packages/server/src/import-mapping.ts:910](../../packages/server/src/import-mapping.ts#L910) `undoImportRun` | `SQLite.get` (910, 942); `SQLite.prepare` (910, 942, 956); `Store.sql` (910, 942, 956) | IMPORT |
| [packages/server/src/inbound-hooks.ts:306](../../packages/server/src/inbound-hooks.ts#L306) `InboundHooks/claim` | `SQLite.get` (306, 314, 315); `SQLite.prepare` (306, 310, 311, 314, 315, 317) | AUTH |
| [packages/server/src/insight.ts:1025](../../packages/server/src/insight.ts#L1025) `checkCalculation` | `Store.findIds` (1025); `Store.evaluate` (1029) | DESIGN |
| [packages/server/src/insight.ts:946](../../packages/server/src/insight.ts#L946) `columnProfile` | `Store.query` (946, 953, 965, 968) | PROFILE |
| [packages/server/src/insight.ts:870](../../packages/server/src/insight.ts#L870) `layoutProfile` | `Store.query` (870) | PROFILE |
| [packages/server/src/insight.ts:866](../../packages/server/src/insight.ts#L866) `layoutProfile/viewableIds` | `Store.viewableIds` (866) | PROFILE |
| [packages/server/src/insight.ts:1208](../../packages/server/src/insight.ts#L1208) `solutionOverview/counts` | `Store.query` (1208) | DESIGN |
| [packages/server/src/insight.ts:396](../../packages/server/src/insight.ts#L396) `webViewerScripts` | `Store.query` (396) | DESIGN |
| [packages/server/src/integrity-check.ts:13](../../packages/server/src/integrity-check.ts#L13) `integrity` | `SQLite.all` (13); `SQLite.prepare` (13, 17); `SQLite.get` (17) | OPERATOR |
| [packages/server/src/integrity-check.ts:55](../../packages/server/src/integrity-check.ts#L55) `pageCheck` | `SQLite.all` (55); `SQLite.prepare` (55, 58); `SQLite.get` (58) | OPERATOR |
| [packages/server/src/live.ts:208](../../packages/server/src/live.ts#L208) `Live/handle` | `Store.canView` (208) | LIVE |
| [packages/server/src/live.ts:283](../../packages/server/src/live.ts#L283) `Live/visibleRecord` | `Store.canViewRecord` (283) | LIVE |
| [packages/server/src/logs.ts:79](../../packages/server/src/logs.ts#L79) `LogShipper/follow` | `SQLite.get` (79); `SQLite.prepare` (79); `Store.sql` (79, 80, 81, 82) | ADMIN |
| [packages/server/src/logs.ts:91](../../packages/server/src/logs.ts#L91) `LogShipper/releaseIfIdle` | `Store.sql` (91) | ADMIN |
| [packages/server/src/mcp-design.ts:513](../../packages/server/src/mcp-design.ts#L513) `registerDesignTools/audit_log` | `Store.auditLog` (513) | DESIGN |
| [packages/server/src/mcp.ts:1491](../../packages/server/src/mcp.ts#L1491) `createMcpServer/check_record` | `Store.get` (1491); `Store.row` (1493) | MCP |
| [packages/server/src/mcp.ts:1212](../../packages/server/src/mcp.ts#L1212) `createMcpServer/evaluate_calculation` | `Store.get` (1212, 1220); `Store.find` (1213); `Store.evaluate` (1214); `Store.row` (1219) | SQL |
| [packages/server/src/mcp.ts:1515](../../packages/server/src/mcp.ts#L1515) `createMcpServer/explain_related` | `Store.get` (1515) | MCP |
| [packages/server/src/mcp.ts:1468](../../packages/server/src/mcp.ts#L1468) `createMcpServer/explain_value` | `Store.get` (1468); `Store.row` (1469) | MCP |
| [packages/server/src/mcp.ts:1092](../../packages/server/src/mcp.ts#L1092) `createMcpServer/find_records` | `Store.find` (1092) | MCP |
| [packages/server/src/mcp.ts:1287](../../packages/server/src/mcp.ts#L1287) `createMcpServer/get_container` | `Store.container` (1287) | SQL |
| [packages/server/src/mcp.ts:1105](../../packages/server/src/mcp.ts#L1105) `createMcpServer/get_record` | `Store.get` (1105) | MCP |
| [packages/server/src/mcp.ts:1311](../../packages/server/src/mcp.ts#L1311) `createMcpServer/sql_query` | `Store.queryWithOrigins` (1311) | SQL |
| [packages/server/src/mcp.ts:1155](../../packages/server/src/mcp.ts#L1155) `createMcpServer/update_record` | `Store.get` (1155, 1159) | MCP |
| [packages/server/src/mcp.ts:2413](../../packages/server/src/mcp.ts#L2413) `registerResources/audit` | `Store.auditLog` (2413) | MCP |
| [packages/server/src/oauth.ts:87](../../packages/server/src/oauth.ts#L87) `legacyPasswordMark` | `SQLite.get` (87); `SQLite.prepare` (87); `Store.sql` (87) | AUTH |
| [packages/server/src/oauth.ts:901](../../packages/server/src/oauth.ts#L901) `OAuthServer/accessAllowed` | `SQLite.get` (901); `SQLite.prepare` (901) | AUTH |
| [packages/server/src/oauth.ts:519](../../packages/server/src/oauth.ts#L519) `OAuthServer/authorize` | `SQLite.get` (519); `SQLite.prepare` (519, 523, 525, 532, 563, 564) | AUTH |
| [packages/server/src/oauth.ts:500](../../packages/server/src/oauth.ts#L500) `OAuthServer/authorize/done` | `SQLite.prepare` (500, 501) | AUTH |
| [packages/server/src/oauth.ts:399](../../packages/server/src/oauth.ts#L399) `OAuthServer/client` | `SQLite.get` (399); `SQLite.prepare` (399) | AUTH |
| [packages/server/src/oauth.ts:202](../../packages/server/src/oauth.ts#L202) `OAuthServer/constructor` | `SQLite.all` (202); `SQLite.prepare` (202, 229, 231, 240, 241, 244); `SQLite.iterate` (229); `SQLite.get` (231); `Store.sql` (231, 240) | AUTH |
| [packages/server/src/oauth.ts:195](../../packages/server/src/oauth.ts#L195) `OAuthServer/constructor/cols` | `SQLite.all` (195); `SQLite.prepare` (195) | AUTH |
| [packages/server/src/oauth.ts:884](../../packages/server/src/oauth.ts#L884) `OAuthServer/endGrant` | `SQLite.prepare` (884, 885); `SQLite.all` (885) | AUTH |
| [packages/server/src/oauth.ts:840](../../packages/server/src/oauth.ts#L840) `OAuthServer/issue/write` | `SQLite.get` (840); `SQLite.prepare` (840, 841, 842) | AUTH |
| [packages/server/src/oauth.ts:897](../../packages/server/src/oauth.ts#L897) `OAuthServer/managedAccess` | `SQLite.get` (897); `SQLite.prepare` (897) | AUTH |
| [packages/server/src/oauth.ts:379](../../packages/server/src/oauth.ts#L379) `OAuthServer/register` | `SQLite.prepare` (379, 380, 381, 382, 383); `SQLite.get` (380, 382) | AUTH |
| [packages/server/src/oauth.ts:914](../../packages/server/src/oauth.ts#L914) `OAuthServer/revoke` | `SQLite.get` (914, 915, 927, 928); `SQLite.prepare` (914, 915, 921, 927, 928, 934) | AUTH |
| [packages/server/src/oauth.ts:860](../../packages/server/src/oauth.ts#L860) `OAuthServer/sweep` | `SQLite.all` (860); `SQLite.prepare` (860, 862, 863, 864, 865) | AUTH |
| [packages/server/src/oauth.ts:719](../../packages/server/src/oauth.ts#L719) `OAuthServer/token` | `SQLite.get` (719, 750, 752, 755, 768); `SQLite.prepare` (719, 750, 752, 755, 764, 767, 768, 768, 770, 772) | AUTH |
| [packages/server/src/oauth.ts:74](../../packages/server/src/oauth.ts#L74) `storedName` | `SQLite.get` (74); `SQLite.prepare` (74); `Store.sql` (74) | AUTH |
| [packages/server/src/odata-crossjoin-worker.ts:42](../../packages/server/src/odata-crossjoin-worker.ts#L42) `join` | `SQLite.prepare` (42, 51, 60, 75); `SQLite.get` (60); `SQLite.all` (75) | JOIN |
| [packages/server/src/odata.ts:1532](../../packages/server/src/odata.ts#L1532) `ODataEndpoint/applied` | `Store.selectIds` (1532); `SQLite.prepare` (1548, 1585, 1598, 1602); `Store.getMany` (1559); `SQLite.all` (1598); `SQLite.get` (1602) | ODATA |
| [packages/server/src/odata.ts:1652](../../packages/server/src/odata.ts#L1652) `ODataEndpoint/crossjoined` | `Store.selectIds` (1652); `Store.getMany` (1681, 1716) | ODATA |
| [packages/server/src/odata.ts:1752](../../packages/server/src/odata.ts#L1752) `ODataEndpoint/entity` | `Store.getMany` (1752) | ODATA |
| [packages/server/src/odata.ts:1411](../../packages/server/src/odata.ts#L1411) `ODataEndpoint/lambdaFor` | `Store.selectIds` (1411); `Store.row` (1420); `relatedIdList` (1421) | ODATA |
| [packages/server/src/odata.ts:1474](../../packages/server/src/odata.ts#L1474) `ODataEndpoint/list` | `Store.selectIds` (1474); `Store.getMany` (1479); `Store.computeValues` (1480); `Store.countIds` (1485) | ODATA |
| [packages/server/src/odata.ts:1851](../../packages/server/src/odata.ts#L1851) `ODataEndpoint/property` | `Store.containerId` (1851); `Store.container` (1857) | ODATA |
| [packages/server/src/odata.ts:1793](../../packages/server/src/odata.ts#L1793) `ODataEndpoint/relatedIds` | `Store.row` (1793); `relatedIdList` (1796, 1811); `Store.selectIds` (1800) | ODATA |
| [packages/server/src/odata.ts:1827](../../packages/server/src/odata.ts#L1827) `ODataEndpoint/relatedRecords` | `Store.getMany` (1827) | ODATA |
| [packages/server/src/odata.ts:1064](../../packages/server/src/odata.ts#L1064) `ODataEndpoint/resource` | `Store.countIds` (1064); `Store.get` (1109, 1116, 1205, 1233, 1240) | ODATA |
| [packages/server/src/odata.ts:1822](../../packages/server/src/odata.ts#L1822) `ODataEndpoint/viewableIn` | `Store.viewableSet` (1822) | ODATA |
| [packages/server/src/oidc.ts:471](../../packages/server/src/oidc.ts#L471) `Oidc/authorizeUrl` | `SQLite.prepare` (471, 474) | AUTH |
| [packages/server/src/oidc.ts:526](../../packages/server/src/oidc.ts#L526) `Oidc/callback` | `SQLite.get` (526); `SQLite.prepare` (526, 537, 541); `SQLite.all` (537) | AUTH |
| [packages/server/src/oidc.ts:218](../../packages/server/src/oidc.ts#L218) `Oidc/constructor` | `SQLite.all` (218, 229); `SQLite.prepare` (218, 229, 239, 240, 245, 245) | AUTH |
| [packages/server/src/oidc.ts:646](../../packages/server/src/oidc.ts#L646) `Oidc/finish` | `SQLite.prepare` (646, 647, 649); `SQLite.get` (647) | AUTH |
| [packages/server/src/oidc.ts:444](../../packages/server/src/oidc.ts#L444) `Oidc/makeRoom` | `SQLite.get` (444, 446, 448); `SQLite.prepare` (444, 445, 446, 448, 450); `SQLite.all` (445, 450) | AUTH |
| [packages/server/src/oidc.ts:386](../../packages/server/src/oidc.ts#L386) `Oidc/takeGrant` | `SQLite.all` (386); `SQLite.prepare` (386) | AUTH |
| [packages/server/src/optimization-containers.ts:78](../../packages/server/src/optimization-containers.ts#L78) `planContainerMove` | `Store.embeddedContainerCount` (78) | DESIGN |
| [packages/server/src/optimization-containers.ts:46](../../packages/server/src/optimization-containers.ts#L46) `read` | `SQLite.get` (46); `SQLite.prepare` (46); `Store.sql` (46) | DESIGN |
| [packages/server/src/optimization-containers.ts:147](../../packages/server/src/optimization-containers.ts#L147) `undoContainerMove` | `SQLite.prepare` (147); `Store.sql` (147); `SQLite.get` (148) | DESIGN |
| [packages/server/src/optimization-containers.ts:57](../../packages/server/src/optimization-containers.ts#L57) `write` | `SQLite.prepare` (57); `Store.sql` (57) | DESIGN |
| [packages/server/src/optimization-data.ts:61](../../packages/server/src/optimization-data.ts#L61) `dataFindings` | `Store.recordCount` (61) | DESIGN |
| [packages/server/src/optimization-data.ts:46](../../packages/server/src/optimization-data.ts#L46) `held` | `SQLite.get` (46); `SQLite.prepare` (46); `Store.sql` (46) | DESIGN |
| [packages/server/src/optimization-data.ts:113](../../packages/server/src/optimization-data.ts#L113) `layoutFindings` | `Store.recordCount` (113) | DESIGN |
| [packages/server/src/optimization-fix.ts:150](../../packages/server/src/optimization-fix.ts#L150) `history` | `SQLite.get` (150); `SQLite.prepare` (150); `Store.sql` (150) | DESIGN |
| [packages/server/src/optimization-fix.ts:154](../../packages/server/src/optimization-fix.ts#L154) `keep` | `SQLite.prepare` (154); `Store.sql` (154) | DESIGN |
| [packages/server/src/optimization-fix.ts:158](../../packages/server/src/optimization-fix.ts#L158) `withHistory` | `Store.sql` (158, 161, 164, 164) | DESIGN |
| [packages/server/src/optimization.ts:141](../../packages/server/src/optimization.ts#L141) `containerUse` | `SQLite.get` (141); `SQLite.prepare` (141); `Store.sql` (141) | DESIGN |
| [packages/server/src/optimization.ts:120](../../packages/server/src/optimization.ts#L120) `hasTable` | `SQLite.get` (120); `SQLite.prepare` (120); `Store.sql` (120) | DESIGN |
| [packages/server/src/optimization.ts:564](../../packages/server/src/optimization.ts#L564) `heldBytes` | `SQLite.get` (564); `SQLite.prepare` (564); `Store.sql` (564) | DESIGN |
| [packages/server/src/optimization.ts:269](../../packages/server/src/optimization.ts#L269) `oversizedPictures` | `SQLite.all` (269); `SQLite.prepare` (269); `Store.sql` (269) | DESIGN |
| [packages/server/src/optimization.ts:316](../../packages/server/src/optimization.ts#L316) `sizes` | `SQLite.all` (316); `SQLite.prepare` (316); `Store.sql` (316) | DESIGN |
| [packages/server/src/optimization.ts:312](../../packages/server/src/optimization.ts#L312) `sizes/one` | `SQLite.get` (312); `SQLite.prepare` (312); `Store.sql` (312) | DESIGN |
| [packages/server/src/optimization.ts:449](../../packages/server/src/optimization.ts#L449) `speedFindings` | `Store.recordCount` (449, 492, 510) | DESIGN |
| [packages/server/src/pgwire.ts:995](../../packages/server/src/pgwire.ts#L995) `Connection/bareNames` | `Store.describe` (995) | SQL |
| [packages/server/src/pgwire.ts:1011](../../packages/server/src/pgwire.ts#L1011) `Connection/catalog` | `Store.describeTyped` (1011) | SQL |
| [packages/server/src/pgwire.ts:1453](../../packages/server/src/pgwire.ts#L1453) `Connection/describe` | `Store.describeTyped` (1453) | SQL |
| [packages/server/src/pgwire.ts:1022](../../packages/server/src/pgwire.ts#L1022) `Connection/run` | `Store.selectIn` (1022); `Store.describeTyped` (1026) | SQL |
| [packages/server/src/pgwire.ts:972](../../packages/server/src/pgwire.ts#L972) `Connection/translate` | `Calculations.translateSQL` (972) | SQL |
| [packages/server/src/pgwire.ts:1220](../../packages/server/src/pgwire.ts#L1220) `Connection/validateSyntax` | `SQLite.prepare` (1220); `Store.sql` (1220) | SQL |
| [packages/server/src/pgwrite.ts:431](../../packages/server/src/pgwrite.ts#L431) `executeWrite/reader` | `Store.selectIn` (431) | SQL |
| [packages/server/src/pgwrite.ts:404](../../packages/server/src/pgwrite.ts#L404) `returningColumns` | `Store.describe` (404) | SQL |
| [packages/server/src/pii.ts:310](../../packages/server/src/pii.ts#L310) `forgetVault` | `Store.sql` (310) | REDACTION |
| [packages/server/src/pii.ts:124](../../packages/server/src/pii.ts#L124) `holdsOnlyUuids` | `Store.query` (124) | REDACTION |
| [packages/server/src/pii.ts:349](../../packages/server/src/pii.ts#L349) `PiiMasker/constructor` | `SQLite.get` (349); `SQLite.prepare` (349); `Store.sql` (349) | REDACTION |
| [packages/server/src/pii.ts:445](../../packages/server/src/pii.ts#L445) `PiiMasker/known` | `SQLite.iterate` (445); `SQLite.prepare` (445); `Store.sql` (445) | REDACTION |
| [packages/server/src/pii.ts:359](../../packages/server/src/pii.ts#L359) `PiiMasker/refresh` | `SQLite.iterate` (359); `SQLite.prepare` (359); `Store.sql` (359) | REDACTION |
| [packages/server/src/pii.ts:417](../../packages/server/src/pii.ts#L417) `PiiMasker/text` | `SQLite.get` (417); `SQLite.prepare` (417); `Store.sql` (417) | REDACTION |
| [packages/server/src/pii.ts:402](../../packages/server/src/pii.ts#L402) `PiiMasker/token` | `SQLite.prepare` (402, 403); `Store.sql` (402, 403); `SQLite.get` (403) | REDACTION |
| [packages/server/src/pii.ts:486](../../packages/server/src/pii.ts#L486) `PiiMasker/unmask` | `SQLite.get` (486); `SQLite.prepare` (486); `Store.sql` (486) | REDACTION |
| [packages/server/src/pii.ts:655](../../packages/server/src/pii.ts#L655) `piiPreview` | `Store.find` (655); `SQLite.prepare` (662); `Store.sql` (662) | REDACTION |
| [packages/server/src/pii.ts:136](../../packages/server/src/pii.ts#L136) `sampledValues` | `Store.query` (136) | REDACTION |
| [packages/server/src/pii.ts:301](../../packages/server/src/pii.ts#L301) `vaultTable` | `Store.sql` (301, 304) | REDACTION |
| [packages/server/src/privilege-review.ts:274](../../packages/server/src/privilege-review.ts#L274) `reviewPrivileges` | `Store.previewRecordRule` (274) | DESIGN |
| [packages/server/src/rag.ts:79](../../packages/server/src/rag.ts#L79) `RagStore/add` | `SQLite.prepare` (79, 86, 88, 89); `SQLite.get` (86) | RAG |
| [packages/server/src/rag.ts:138](../../packages/server/src/rag.ts#L138) `RagStore/hybridSearch` | `SQLite.prepare` (138, 143) | RAG |
| [packages/server/src/rag.ts:148](../../packages/server/src/rag.ts#L148) `RagStore/hybridSearch/candidates` | `SQLite.all` (148); `SQLite.iterate` (150) | RAG |
| [packages/server/src/rag.ts:61](../../packages/server/src/rag.ts#L61) `RagStore/info` | `SQLite.all` (61, 66); `SQLite.prepare` (61, 63) | RAG |
| [packages/server/src/rag.ts:224](../../packages/server/src/rag.ts#L224) `RagStore/load` | `SQLite.get` (224); `SQLite.prepare` (224, 231); `SQLite.iterate` (231) | RAG |
| [packages/server/src/rag.ts:276](../../packages/server/src/rag.ts#L276) `RagStore/remove` | `SQLite.prepare` (276, 278) | RAG |
| [packages/server/src/rag.ts:270](../../packages/server/src/rag.ts#L270) `RagStore/searchCached` | `SQLite.prepare` (270); `SQLite.get` (271) | RAG |
| [packages/server/src/rag.ts:186](../../packages/server/src/rag.ts#L186) `RagStore/searchSpace` | `SQLite.iterate` (186); `SQLite.prepare` (186) | RAG |
| [packages/server/src/rag.ts:105](../../packages/server/src/rag.ts#L105) `RagStore/sizes` | `SQLite.all` (105); `SQLite.prepare` (105) | RAG |
| [packages/server/src/rag.ts:56](../../packages/server/src/rag.ts#L56) `RagStore/spaces` | `SQLite.all` (56); `SQLite.prepare` (56) | RAG |
| [packages/server/src/rag.ts:208](../../packages/server/src/rag.ts#L208) `RagStore/version` | `SQLite.get` (208); `SQLite.prepare` (208) | RAG |
| [packages/server/src/record-context.ts:112](../../packages/server/src/record-context.ts#L112) `describeRecord` | `Store.row` (112); `Store.get` (121); `keyValue` (127); `Store.viewableIds` (165); `relatedRows` (169, 174) | RECORD |
| [packages/server/src/record-history.ts:101](../../packages/server/src/record-history.ts#L101) `recordHistory` | `Store.auditLog` (101, 154) | HISTORY |
| [packages/server/src/record-search.ts:61](../../packages/server/src/record-search.ts#L61) `searchRecords` | `Store.viewableIds` (61); `SQLite.all` (74); `SQLite.prepare` (74); `Store.sql` (74) | SEARCH |
| [packages/server/src/record-search.ts:104](../../packages/server/src/record-search.ts#L104) `searchRecords/snippet` | `SQLite.get` (104); `SQLite.prepare` (104); `Store.sql` (104) | SEARCH |
| [packages/server/src/record-search.ts:109](../../packages/server/src/record-search.ts#L109) `searchRecords/source` | `SQLite.get` (109); `SQLite.prepare` (109); `Store.sql` (109) | SEARCH |
| [packages/server/src/rule-suggestions.ts:57](../../packages/server/src/rule-suggestions.ts#L57) `suggestRules` | `Store.query` (57, 69, 86, 136, 138, 152, 153, 169) | DESIGN |
| [packages/server/src/scim.ts:296](../../packages/server/src/scim.ts#L296) `ScimDirectory/atomically` | `Store.sql` (296) | AUTH |
| [packages/server/src/scim.ts:410](../../packages/server/src/scim.ts#L410) `ScimDirectory/create/scim_user_create` | `SQLite.prepare` (410); `Store.sql` (410) | AUTH |
| [packages/server/src/scim.ts:335](../../packages/server/src/scim.ts#L335) `ScimDirectory/rebind` | `SQLite.prepare` (335); `Store.sql` (335) | AUTH |
| [packages/server/src/scim.ts:460](../../packages/server/src/scim.ts#L460) `ScimDirectory/remove/scim_user_remove` | `SQLite.prepare` (460); `Store.sql` (460) | AUTH |
| [packages/server/src/scim.ts:357](../../packages/server/src/scim.ts#L357) `ScimDirectory/revokePersonTokens` | `SQLite.all` (357); `SQLite.prepare` (357); `Store.sql` (357) | AUTH |
| [packages/server/src/scim.ts:230](../../packages/server/src/scim.ts#L230) `ScimDirectory/rows` | `SQLite.all` (230); `SQLite.prepare` (230, 235); `Store.sql` (230, 235) | AUTH |
| [packages/server/src/scim.ts:148](../../packages/server/src/scim.ts#L148) `ScimDirectory/save` | `SQLite.prepare` (148); `Store.sql` (148) | AUTH |
| [packages/server/src/scim.ts:259](../../packages/server/src/scim.ts#L259) `ScimDirectory/setMemberships` | `SQLite.prepare` (259); `Store.sql` (259) | AUTH |
| [packages/server/src/scim.ts:140](../../packages/server/src/scim.ts#L140) `ScimDirectory/settings` | `SQLite.get` (140); `SQLite.prepare` (140); `Store.sql` (140) | AUTH |
| [packages/server/src/scim.ts:127](../../packages/server/src/scim.ts#L127) `ScimDirectory/table` | `Store.sql` (127, 129); `SQLite.all` (129); `SQLite.prepare` (129) | AUTH |
| [packages/server/src/scim.ts:132](../../packages/server/src/scim.ts#L132) `ScimDirectory/table/scim_identity_column` | `SQLite.all` (132); `SQLite.prepare` (132); `Store.sql` (132, 133) | AUTH |
| [packages/server/src/scim.ts:433](../../packages/server/src/scim.ts#L433) `ScimDirectory/update/scim_user_update` | `SQLite.prepare` (433); `Store.sql` (433) | AUTH |
| [packages/server/src/script-failure.ts:212](../../packages/server/src/script-failure.ts#L212) `explainScriptFailure` | `Store.row` (212) | RECORD |
| [packages/server/src/security.ts:81](../../packages/server/src/security.ts#L81) `importApproximations` | `SQLite.all` (81); `SQLite.prepare` (81); `Store.sql` (81) | DESIGN |
| [packages/server/src/security.ts:218](../../packages/server/src/security.ts#L218) `SecurityApi/handle` | `Store.previewRecordRule` (218) | DESIGN |
| [packages/server/src/security.ts:117](../../packages/server/src/security.ts#L117) `securityOf` | `Store.pendingChanges` (117) | DESIGN |
| [packages/server/src/semantic-find.ts:52](../../packages/server/src/semantic-find.ts#L52) `semanticFind` | `Store.findIds` (52) | SEARCH |
| [packages/server/src/semantic-find.ts:108](../../packages/server/src/semantic-find.ts#L108) `vectorOf` | `Store.containerId` (108); `Store.containerInfo` (110); `Store.container` (112); `Store.get` (117) | SEARCH |
| [packages/server/src/sql.ts:103](../../packages/server/src/sql.ts#L103) `SqlEndpoint/handle` | `Calculations.translateSQL` (103); `Store.select` (110) | SQL |
| [packages/server/src/sql.ts:163](../../packages/server/src/sql.ts#L163) `SqlEndpoint/tables` | `SQLite.all` (163); `SQLite.prepare` (163); `Store.sql` (163) | SQL |
| [packages/server/src/standby.ts:445](../../packages/server/src/standby.ts#L445) `Standby/copy` | `SQLite.get` (445); `SQLite.prepare` (445) | OPERATOR |
| [packages/server/src/summarize.ts:184](../../packages/server/src/summarize.ts#L184) `summarizeByRecord` | `Store.evaluateEach` (184); `Store.row` (186) | SUMMARY |
| [packages/server/src/summarize.ts:69](../../packages/server/src/summarize.ts#L69) `summarizeRecords` | `Store.findIds` (69); `Store.select` (126, 133, 143) | SUMMARY |
| [packages/server/src/sync-console.ts:463](../../packages/server/src/sync-console.ts#L463) `SyncConsole/runCheck` | `Store.sql` (463) | DESIGN |
| [packages/server/src/sync-console.ts:468](../../packages/server/src/sync-console.ts#L468) `SyncConsole/runCheck/assertActive` | `Store.sql` (468) | DESIGN |
| [packages/server/src/warm-worker.ts:34](../../packages/server/src/warm-worker.ts#L34) `message` | `Store.find` (34) | INTERNAL |
| [packages/server/src/warm-worker.ts:19](../../packages/server/src/warm-worker.ts#L19) `message/count` | `Store.recordCount` (19) | INTERNAL |
| [packages/server/src/window-transaction.ts:32](../../packages/server/src/window-transaction.ts#L32) `context` | `Store.get` (32) | WEB |
| [packages/server/src/webclient.ts:2679](../../packages/server/src/webclient.ts#L2679) `foundIds` | `Store.findIds` (2679, 2681) | WEB |
| [packages/server/src/webclient.ts:2600](../../packages/server/src/webclient.ts#L2600) `listItems` | `Store.valueListItems` (2600) | WEB |
| [packages/server/src/webclient.ts:1710](../../packages/server/src/webclient.ts#L1710) `WebClient/aiReplace` | `Store.canView` (1710); `Store.getMany` (1726) | WEB |
| [packages/server/src/webclient.ts:1894](../../packages/server/src/webclient.ts#L1894) `WebClient/button` | `Store.findIds` (1894, 1949); `Store.evaluateEach` (1908, 1909) | WEB |
| [packages/server/src/webclient.ts:1296](../../packages/server/src/webclient.ts#L1296) `WebClient/charts` | `Calculations.context` (1296); `Store.canView` (1324); `Store.evaluateEach` (1333, 1337); `Store.evaluateRows` (1342, 1344) | WEB |
| [packages/server/src/webclient.ts:1287](../../packages/server/src/webclient.ts#L1287) `WebClient/charts/foundSet` | `Store.findIds` (1287) | WEB |
| [packages/server/src/webclient.ts:1327](../../packages/server/src/webclient.ts#L1327) `WebClient/charts/get` | `Store.get` (1327) | WEB |
| [packages/server/src/webclient.ts:695](../../packages/server/src/webclient.ts#L695) `WebClient/explain` | `Store.get` (695); `Store.row` (728, 741) | WEB |
| [packages/server/src/webclient.ts:1516](../../packages/server/src/webclient.ts#L1516) `WebClient/exportRecords` | `Store.getMany` (1516) | WEB |
| [packages/server/src/webclient.ts:1203](../../packages/server/src/webclient.ts#L1203) `WebClient/foundIds` | `Store.findIds` (1203) | WEB |
| [packages/server/src/webclient.ts:1247](../../packages/server/src/webclient.ts#L1247) `WebClient/foundSetPortal` | `Store.foundSetRows` (1247, 1254) | WEB |
| [packages/server/src/webclient.ts:1786](../../packages/server/src/webclient.ts#L1786) `WebClient/groups` | `Store.findIds` (1786); `Store.groupSummaries` (1792) | WEB |
| [packages/server/src/webclient.ts:555](../../packages/server/src/webclient.ts#L555) `WebClient/history` | `Store.get` (555) | WEB |
| [packages/server/src/webclient.ts:754](../../packages/server/src/webclient.ts#L754) `WebClient/index` | `Store.fieldIndex` (754) | WEB |
| [packages/server/src/webclient.ts:861](../../packages/server/src/webclient.ts#L861) `WebClient/menus` | `Store.evaluateEach` (861) | WEB |
| [packages/server/src/webclient.ts:1218](../../packages/server/src/webclient.ts#L1218) `WebClient/records` | `Store.getMany` (1218); `Store.find` (1221) | WEB |
| [packages/server/src/webclient.ts:1164](../../packages/server/src/webclient.ts#L1164) `WebClient/refresh` | `Store.previewRow` (1164); `Store.getMany` (1169); `Store.foundSetRows` (1191) | WEB |
| [packages/server/src/webclient.ts:1410](../../packages/server/src/webclient.ts#L1410) `WebClient/streamExportRecords/nextBatch` | `Store.selectIds` (1410); `Store.getMany` (1416) | WEB |
| [packages/server/src/webclient.ts:1078](../../packages/server/src/webclient.ts#L1078) `WebClient/view` | `Store.evaluateEach` (1078, 1102, 1121); `Store.canView` (1096); `Store.previewRow` (1100, 1122); `Store.get` (1113); `Store.row` (1114, 1114) | WEB |
| [packages/server/src/webclient.ts:1099](../../packages/server/src/webclient.ts#L1099) `WebClient/view/get` | `Store.get` (1099) | WEB |
| [packages/store/src/activity.ts:502](../../packages/store/src/activity.ts#L502) `SharedRecordLocks/acquire` | `SQLite.prepare` (502) | CORE |
| [packages/store/src/activity.ts:540](../../packages/store/src/activity.ts#L540) `SharedRecordLocks/all` | `SQLite.all` (540); `SQLite.prepare` (540) | CORE |
| [packages/store/src/activity.ts:444](../../packages/store/src/activity.ts#L444) `SharedRecordLocks/constructor` | `SQLite.get` (444); `SQLite.prepare` (444) | CORE |
| [packages/store/src/activity.ts:475](../../packages/store/src/activity.ts#L475) `SharedRecordLocks/count` | `SQLite.get` (475); `SQLite.prepare` (475) | CORE |
| [packages/store/src/activity.ts:487](../../packages/store/src/activity.ts#L487) `SharedRecordLocks/holder` | `SQLite.get` (487); `SQLite.prepare` (487) | CORE |
| [packages/store/src/activity.ts:559](../../packages/store/src/activity.ts#L559) `SharedRecordLocks/leave` | `SQLite.prepare` (559) | CORE |
| [packages/store/src/activity.ts:563](../../packages/store/src/activity.ts#L563) `SharedRecordLocks/leaveOwner` | `SQLite.all` (563); `SQLite.prepare` (563) | CORE |
| [packages/store/src/activity.ts:530](../../packages/store/src/activity.ts#L530) `SharedRecordLocks/release` | `SQLite.prepare` (530) | CORE |
| [packages/store/src/activity.ts:534](../../packages/store/src/activity.ts#L534) `SharedRecordLocks/releaseOwner` | `SQLite.all` (534); `SQLite.prepare` (534) | CORE |
| [packages/store/src/activity.ts:516](../../packages/store/src/activity.ts#L516) `SharedRecordLocks/renew` | `SQLite.prepare` (516) | CORE |
| [packages/store/src/activity.ts:479](../../packages/store/src/activity.ts#L479) `SharedRecordLocks/sweep` | `SQLite.prepare` (479) | CORE |
| [packages/store/src/activity.ts:546](../../packages/store/src/activity.ts#L546) `SharedRecordLocks/view` | `SQLite.prepare` (546, 547, 548, 549); `SQLite.get` (547, 548) | CORE |
| [packages/store/src/activity.ts:567](../../packages/store/src/activity.ts#L567) `SharedRecordLocks/viewers` | `SQLite.prepare` (567, 568); `SQLite.all` (568) | CORE |
| [packages/store/src/audit-anchor.ts:72](../../packages/store/src/audit-anchor.ts#L72) `checkAnchor` | `SQLite.get` (72, 75, 81, 86); `SQLite.prepare` (72, 75, 79, 86) | CORE |
| [packages/store/src/cache-versions.ts:10](../../packages/store/src/cache-versions.ts#L10) `ensureCacheVersions` | `SQLite.all` (10); `SQLite.prepare` (10, 21); `SQLite.get` (21) | CORE |
| [packages/store/src/calc.ts:618](../../packages/store/src/calc.ts#L618) `Calculations/allRecords` | `SQLite.iterate` (618); `SQLite.prepare` (618); `Store.sql` (618) | CALC |
| [packages/store/src/calc.ts:1213](../../packages/store/src/calc.ts#L1213) `Calculations/applyDelta/value` | `Calculations.value` (1213) | CALC |
| [packages/store/src/calc.ts:2394](../../packages/store/src/calc.ts#L2394) `Calculations/beforeWrite` | `relatedRows` (2394); `Calculations.related` (2448); `Calculations.context` (2461) | CORE |
| [packages/store/src/calc.ts:629](../../packages/store/src/calc.ts#L629) `Calculations/collect` | `Calculations.collector` (629) | CALC |
| [packages/store/src/calc.ts:660](../../packages/store/src/calc.ts#L660) `Calculations/collector/add` | `Calculations.related` (660) | CALC |
| [packages/store/src/calc.ts:1693](../../packages/store/src/calc.ts#L1693) `Calculations/columnNames` | `SQLite.all` (1693); `SQLite.prepare` (1693); `Store.sql` (1693) | CALC |
| [packages/store/src/calc.ts:2257](../../packages/store/src/calc.ts#L2257) `Calculations/computeColumn` | `Calculations.statement` (2257); `SQLite.get` (2257); `Calculations.value` (2260) | CALC |
| [packages/store/src/calc.ts:565](../../packages/store/src/calc.ts#L565) `Calculations/computed` | `Calculations.context` (565) | CALC |
| [packages/store/src/calc.ts:2512](../../packages/store/src/calc.ts#L2512) `Calculations/computeStored` | `Calculations.computeStoredStyled` (2512); `Calculations.value` (2512) | CALC |
| [packages/store/src/calc.ts:2527](../../packages/store/src/calc.ts#L2527) `Calculations/computeStoredStyled` | `Calculations.context` (2527) | CORE |
| [packages/store/src/calc.ts:1915](../../packages/store/src/calc.ts#L1915) `Calculations/context/executeSQL` | `Calculations.executeSQL` (1915) | CALC |
| [packages/store/src/calc.ts:1764](../../packages/store/src/calc.ts#L1764) `Calculations/context/field` | `Calculations.summary` (1764); `Calculations.globalValue` (1767); `Calculations.value` (1768) | CALC |
| [packages/store/src/calc.ts:1889](../../packages/store/src/calc.ts#L1889) `Calculations/context/get` | `Store.recordCount` (1889, 1896); `Calculations.statement` (1894); `SQLite.get` (1894) | CALC |
| [packages/store/src/calc.ts:1812](../../packages/store/src/calc.ts#L1812) `Calculations/context/lookupNext` | `Store.canViewRecord` (1812) | CALC |
| [packages/store/src/calc.ts:1916](../../packages/store/src/calc.ts#L1916) `Calculations/context/persistentData` | `Store.persistentData` (1916) | CALC |
| [packages/store/src/calc.ts:1917](../../packages/store/src/calc.ts#L1917) `Calculations/context/persistentDataIds` | `Store.persistentDataIds` (1917) | CALC |
| [packages/store/src/calc.ts:1746](../../packages/store/src/calc.ts#L1746) `Calculations/context/records` | `Calculations.firstRelated` (1746) | CALC |
| [packages/store/src/calc.ts:1777](../../packages/store/src/calc.ts#L1777) `Calculations/context/related` | `Calculations.globalValue` (1777); `Calculations.value` (1779, 1790); `Calculations.related` (1792) | CALC |
| [packages/store/src/calc.ts:1827](../../packages/store/src/calc.ts#L1827) `Calculations/context/summary` | `Calculations.value` (1827, 1837); `Calculations.related` (1839); `Calculations.summary` (1857) | CALC |
| [packages/store/src/calc.ts:2220](../../packages/store/src/calc.ts#L2220) `Calculations/defineComputedColumn/fm_computed` | `Calculations.related` (2220) | CALC |
| [packages/store/src/calc.ts:1942](../../packages/store/src/calc.ts#L1942) `Calculations/design` | `Store.valueListItems` (1942) | CALC |
| [packages/store/src/calc.ts:1720](../../packages/store/src/calc.ts#L1720) `Calculations/ensureIndex` | `Store.sql` (1720, 1721) | CALC |
| [packages/store/src/calc.ts:1959](../../packages/store/src/calc.ts#L1959) `Calculations/executeSQL` | `Calculations.translateSQL` (1959); `Store.select` (1997); `Store.sql` (2008) | CALC |
| [packages/store/src/calc.ts:1359](../../packages/store/src/calc.ts#L1359) `Calculations/firstRelated` | `Calculations.related` (1359, 1371, 1386); `Store.viewableIds` (1366); `Calculations.relatedIds` (1369, 1382); `Calculations.statement` (1379); `SQLite.get` (1379) | CALC |
| [packages/store/src/calc.ts:673](../../packages/store/src/calc.ts#L673) `Calculations/foundSummary` | `Calculations.collect` (673) | CALC |
| [packages/store/src/calc.ts:1608](../../packages/store/src/calc.ts#L1608) `Calculations/foundSums` | `Store.sql` (1608) | CALC |
| [packages/store/src/calc.ts:746](../../packages/store/src/calc.ts#L746) `Calculations/globalsKey` | `Calculations.globalValue` (746) | CALC |
| [packages/store/src/calc.ts:358](../../packages/store/src/calc.ts#L358) `Calculations/globalValue` | `SQLite.get` (358); `SQLite.prepare` (358); `Store.sql` (358) | CALC |
| [packages/store/src/calc.ts:1671](../../packages/store/src/calc.ts#L1671) `Calculations/hopQuery` | `Calculations.value` (1671) | CALC |
| [packages/store/src/calc.ts:1511](../../packages/store/src/calc.ts#L1511) `Calculations/joinHop` | `Calculations.statement` (1511, 1513); `SQLite.get` (1511); `SQLite.iterate` (1513) | CALC |
| [packages/store/src/calc.ts:1569](../../packages/store/src/calc.ts#L1569) `Calculations/lookup` | `Store.sql` (1569) | CALC |
| [packages/store/src/calc.ts:340](../../packages/store/src/calc.ts#L340) `Calculations/meta` | `SQLite.get` (340); `SQLite.prepare` (340); `Store.sql` (340) | CALC |
| [packages/store/src/calc.ts:1559](../../packages/store/src/calc.ts#L1559) `Calculations/passStamp` | `Store.sql` (1559) | CALC |
| [packages/store/src/calc.ts:1404](../../packages/store/src/calc.ts#L1404) `Calculations/relatedIds` | `Calculations.related` (1404, 1434, 1448); `rowsById` (1418, 1445); `Calculations.statement` (1429); `SQLite.all` (1429) | CALC |
| [packages/store/src/calc.ts:1337](../../packages/store/src/calc.ts#L1337) `Calculations/relatedRecs` | `Calculations.relatedIds` (1337); `Store.viewableIds` (1342); `rowsById` (1348) | CALC |
| [packages/store/src/calc.ts:1393](../../packages/store/src/calc.ts#L1393) `Calculations/rowById` | `Calculations.statement` (1393); `SQLite.get` (1393) | CALC |
| [packages/store/src/calc.ts:345](../../packages/store/src/calc.ts#L345) `Calculations/saveMeta` | `SQLite.prepare` (345); `Store.sql` (345) | CALC |
| [packages/store/src/calc.ts:382](../../packages/store/src/calc.ts#L382) `Calculations/setNextSerial` | `Store.sql` (382, 383, 389, 391, 391) | CALC |
| [packages/store/src/calc.ts:2188](../../packages/store/src/calc.ts#L2188) `Calculations/shareColumn` | `Store.recordCount` (2188) | CALC |
| [packages/store/src/calc.ts:1704](../../packages/store/src/calc.ts#L1704) `Calculations/statement` | `SQLite.prepare` (1704); `Store.sql` (1704) | CALC |
| [packages/store/src/calc.ts:1540](../../packages/store/src/calc.ts#L1540) `Calculations/storedRelatedValues` | `Calculations.statement` (1540); `SQLite.iterate` (1540) | CALC |
| [packages/store/src/calc.ts:1285](../../packages/store/src/calc.ts#L1285) `Calculations/storedRows` | `SQLite.iterate` (1285); `SQLite.prepare` (1285); `Store.sql` (1285) | CALC |
| [packages/store/src/calc.ts:684](../../packages/store/src/calc.ts#L684) `Calculations/summary` | `Calculations.collect` (684) | CALC |
| [packages/store/src/calc.ts:921](../../packages/store/src/calc.ts#L921) `Calculations/summaryDependencies` | `Store.sql` (921) | CALC |
| [packages/store/src/calc.ts:636](../../packages/store/src/calc.ts#L636) `Calculations/summaryInput` | `Calculations.value` (636) | CALC |
| [packages/store/src/calc.ts:691](../../packages/store/src/calc.ts#L691) `Calculations/tableSummary` | `Calculations.wholeTable` (691) | CALC |
| [packages/store/src/calc.ts:2124](../../packages/store/src/calc.ts#L2124) `Calculations/translateSQL` | `Store.scopedTableSql` (2124, 2156) | CALC |
| [packages/store/src/calc.ts:2563](../../packages/store/src/calc.ts#L2563) `Calculations/uniqueCollision` | `Calculations.value` (2563) | CALC |
| [packages/store/src/calc.ts:580](../../packages/store/src/calc.ts#L580) `Calculations/unstoredValue` | `Calculations.unstoredStyled` (580); `Calculations.value` (580) | CALC |
| [packages/store/src/calc.ts:2590](../../packages/store/src/calc.ts#L2590) `Calculations/validate` | `Calculations.value` (2590); `Store.valueListItems` (2611); `Calculations.context` (2625) | CALC |
| [packages/store/src/calc.ts:2576](../../packages/store/src/calc.ts#L2576) `Calculations/validate/fail` | `Calculations.context` (2576) | CALC |
| [packages/store/src/calc.ts:530](../../packages/store/src/calc.ts#L530) `Calculations/value` | `Calculations.globalValue` (530) | CALC |
| [packages/store/src/calc.ts:960](../../packages/store/src/calc.ts#L960) `Calculations/wholeTable` | `rowsById` (960); `Store.viewableIds` (960); `Calculations.collect` (962, 1052); `Calculations.value` (1023); `Store.sql` (1031, 1039) | CALC |
| [packages/store/src/calc.ts:2772](../../packages/store/src/calc.ts#L2772) `containerValue` | `Store.containerInfo` (2772); `Store.containerRange` (2779); `Store.container` (2780) | CALC |
| [packages/store/src/calc.ts:2788](../../packages/store/src/calc.ts#L2788) `containerValue/read` | `Store.container` (2788) | CALC |
| [packages/store/src/calc.ts:2801](../../packages/store/src/calc.ts#L2801) `containerValue/value` | `Store.containerRange` (2801) | CALC |
| [packages/store/src/calc.ts:2687](../../packages/store/src/calc.ts#L2687) `nearest` | `SQLite.get` (2687); `SQLite.prepare` (2687); `Store.sql` (2687) | CALC |
| [packages/store/src/calc.ts:3234](../../packages/store/src/calc.ts#L3234) `rowsById/flush` | `Calculations.statement` (3234); `SQLite.iterate` (3234) | CALC |
| [packages/store/src/calc.ts:2919](../../packages/store/src/calc.ts#L2919) `sameValuesElsewhere` | `SQLite.all` (2919); `SQLite.prepare` (2919, 2926, 2928); `Store.sql` (2919, 2926, 2928); `Calculations.value` (2921); `SQLite.get` (2926, 2928) | CALC |
| [packages/store/src/cross-file.ts:58](../../packages/store/src/cross-file.ts#L58) `CrossFileProofs/read` | `SQLite.get` (58); `SQLite.prepare` (58) | AUTH |
| [packages/store/src/cross-file.ts:115](../../packages/store/src/cross-file.ts#L115) `CrossFileProofs/save` | `SQLite.prepare` (115) | AUTH |
| [packages/store/src/damage.ts:93](../../packages/store/src/damage.ts#L93) `watchDatabase` | `SQLite.prepare` (93); `SQLite.iterate` (103) | CORE |
| [packages/store/src/exit-bundle.ts:463](../../packages/store/src/exit-bundle.ts#L463) `build` | `SQLite.prepare` (463) | EXIT-BUNDLE |
| [packages/store/src/exit-bundle.ts:486](../../packages/store/src/exit-bundle.ts#L486) `copyTables` | `SQLite.all` (486); `SQLite.prepare` (486, 492, 493, 510); `SQLite.get` (495, 507, 510) | EXIT-BUNDLE |
| [packages/store/src/exit-bundle.ts:669](../../packages/store/src/exit-bundle.ts#L669) `finish` | `SQLite.all` (669); `SQLite.prepare` (669); `Calculations.globalValue` (681) | EXIT-BUNDLE |
| [packages/store/src/exit-bundle.ts:520](../../packages/store/src/exit-bundle.ts#L520) `writeContainers` | `SQLite.all` (520, 532); `SQLite.prepare` (520, 532, 533, 567); `Store.containerInfo` (537); `Store.containerRange` (553); `SQLite.get` (567) | EXIT-BUNDLE |
| [packages/store/src/exit-bundle.ts:583](../../packages/store/src/exit-bundle.ts#L583) `writeCsv` | `SQLite.prepare` (583); `SQLite.iterate` (587) | EXIT-BUNDLE |
| [packages/store/src/explain-related.ts:364](../../packages/store/src/explain-related.ts#L364) `explainCandidate` | `SQLite.get` (364, 378); `SQLite.prepare` (364, 378); `Store.sql` (364, 378); `keyValue` (375); `Calculations.context` (383) | RECORD |
| [packages/store/src/explain-related.ts:301](../../packages/store/src/explain-related.ts#L301) `explainHop` | `keyValue` (301); `SQLite.get` (321); `SQLite.prepare` (321, 335); `Store.sql` (321, 335); `SQLite.all` (335) | RECORD |
| [packages/store/src/explain-related.ts:103](../../packages/store/src/explain-related.ts#L103) `explainRelated` | `Store.row` (103); `Store.get` (193); `Calculations.value` (242); `Calculations.context` (250) | RECORD |
| [packages/store/src/explain-related.ts:183](../../packages/store/src/explain-related.ts#L183) `explainRelated/runFilter` | `Calculations.context` (183) | RECORD |
| [packages/store/src/explain.ts:144](../../packages/store/src/explain.ts#L144) `explainField` | `Calculations.value` (144); `Calculations.context` (173) | RECORD |
| [packages/store/src/explain.ts:395](../../packages/store/src/explain.ts#L395) `lintFormula` | `Calculations.context` (395) | RECORD |
| [packages/store/src/export-sql.ts:230](../../packages/store/src/export-sql.ts#L230) `exportSql` | `Store.scopedTableSql` (230); `Store.select` (231, 364); `Store.container` (435) | OPERATOR |
| [packages/store/src/export-sql.ts:306](../../packages/store/src/export-sql.ts#L306) `exportSql/duplicates` | `Store.select` (306) | OPERATOR |
| [packages/store/src/export-sql.ts:256](../../packages/store/src/export-sql.ts#L256) `exportSql/page` | `Store.select` (256) | OPERATOR |
| [packages/store/src/fidelity.ts:214](../../packages/store/src/fidelity.ts#L214) `calcFidelity` | `Calculations.executeSQL` (214, 215, 301); `Store.sql` (219, 227, 300); `SQLite.all` (227); `SQLite.prepare` (227); `Calculations.computeStored` (263) | DESIGN |
| [packages/store/src/fidelity.ts:176](../../packages/store/src/fidelity.ts#L176) `changedAfter` | `Untyped.executeSQL` (176) | DESIGN |
| [packages/store/src/fidelity.ts:196](../../packages/store/src/fidelity.ts#L196) `queryProblem` | `Calculations.translateSQL` (196); `Store.describe` (197) | DESIGN |
| [packages/store/src/fmexport.ts:236](../../packages/store/src/fmexport.ts#L236) `fmExport` | `Store.recordCount` (236); `Store.query` (237); `Store.containerInfo` (252); `Store.container` (259) | OPERATOR |
| [packages/store/src/foreign-keys.ts:172](../../packages/store/src/foreign-keys.ts#L172) `childIds` | `SQLite.all` (172) | CORE |
| [packages/store/src/foreign-keys.ts:179](../../packages/store/src/foreign-keys.ts#L179) `childrenWithKeys` | `SQLite.all` (179) | CORE |
| [packages/store/src/foreign-keys.ts:188](../../packages/store/src/foreign-keys.ts#L188) `orphans` | `SQLite.get` (188); `SQLite.all` (189) | CORE |
| [packages/store/src/foreign-keys.ts:165](../../packages/store/src/foreign-keys.ts#L165) `parentHas` | `SQLite.get` (165) | CORE |
| [packages/store/src/import.ts:95](../../packages/store/src/import.ts#L95) `addExternalSizeColumn` | `SQLite.all` (95); `SQLite.prepare` (95) | OPERATOR |
| [packages/store/src/import.ts:243](../../packages/store/src/import.ts#L243) `applyFileAccountStatus` | `SQLite.get` (243, 245); `SQLite.prepare` (243, 245, 247, 259) | OPERATOR |
| [packages/store/src/import.ts:288](../../packages/store/src/import.ts#L288) `createStore` | `SQLite.prepare` (288, 300) | OPERATOR |
| [packages/store/src/import.ts:199](../../packages/store/src/import.ts#L199) `importDesigns` | `SQLite.all` (199); `SQLite.prepare` (199, 213, 216, 219, 221); `SQLite.get` (213, 216) | OPERATOR |
| [packages/store/src/import.ts:424](../../packages/store/src/import.ts#L424) `importFmp12` | `SQLite.prepare` (424, 437, 443, 449, 453, 468, 479, 569, 570, 571); `SQLite.get` (443, 468); `SQLite.all` (449) | OPERATOR |
| [packages/store/src/import.ts:415](../../packages/store/src/import.ts#L415) `importFmp12/save` | `SQLite.prepare` (415) | OPERATOR |
| [packages/store/src/import.ts:527](../../packages/store/src/import.ts#L527) `importFmp12/skipped` | `SQLite.get` (527); `SQLite.prepare` (527) | OPERATOR |
| [packages/store/src/import.ts:149](../../packages/store/src/import.ts#L149) `moveAddedImages` | `SQLite.prepare` (149, 159, 175, 176); `SQLite.get` (152); `SQLite.all` (176) | OPERATOR |
| [packages/store/src/import.ts:312](../../packages/store/src/import.ts#L312) `needsDesigns` | `SQLite.get` (312); `SQLite.prepare` (312) | OPERATOR |
| [packages/store/src/import.ts:135](../../packages/store/src/import.ts#L135) `nextImageId` | `SQLite.get` (135); `SQLite.prepare` (135) | OPERATOR |
| [packages/store/src/import.ts:359](../../packages/store/src/import.ts#L359) `readState` | `SQLite.get` (359); `SQLite.prepare` (359) | OPERATOR |
| [packages/store/src/import.ts:107](../../packages/store/src/import.ts#L107) `writeDesign` | `SQLite.prepare` (107, 111) | OPERATOR |
| [packages/store/src/layout-speed.ts:56](../../packages/store/src/layout-speed.ts#L56) `layoutCost/recordCount` | `Store.recordCount` (56) | DESIGN |
| [packages/store/src/layout-speed.ts:419](../../packages/store/src/layout-speed.ts#L419) `speedContext` | `Store.recordCount` (419) | DESIGN |
| [packages/store/src/native-compat.ts:112](../../packages/store/src/native-compat.ts#L112) `dateFields` | `SQLite.all` (112); `SQLite.prepare` (112) | OPERATOR |
| [packages/store/src/native-compat.ts:136](../../packages/store/src/native-compat.ts#L136) `inspectUpgrade` | `SQLite.get` (136); `SQLite.prepare` (136, 144); `SQLite.iterate` (144) | OPERATOR |
| [packages/store/src/native-compat.ts:82](../../packages/store/src/native-compat.ts#L82) `storedState/meta` | `SQLite.get` (82); `SQLite.prepare` (82) | OPERATOR |
| [packages/store/src/native-compat.ts:178](../../packages/store/src/native-compat.ts#L178) `upgradeNativeFile` | `SQLite.iterate` (178); `SQLite.prepare` (178, 179, 185) | OPERATOR |
| [packages/store/src/privileges.ts:571](../../packages/store/src/privileges.ts#L571) `ensurePrivilegeTables` | `SQLite.all` (571); `SQLite.prepare` (571) | AUTH |
| [packages/store/src/privileges.ts:543](../../packages/store/src/privileges.ts#L543) `privilegeSets` | `SQLite.all` (543); `SQLite.prepare` (543) | AUTH |
| [packages/store/src/reconvert.ts:222](../../packages/store/src/reconvert.ts#L222) `build` | `SQLite.get` (222); `SQLite.prepare` (222, 225, 230); `SQLite.all` (230) | OPERATOR |
| [packages/store/src/reconvert.ts:375](../../packages/store/src/reconvert.ts#L375) `carryImages` | `SQLite.all` (375, 377); `SQLite.prepare` (375, 377, 378) | OPERATOR |
| [packages/store/src/reconvert.ts:327](../../packages/store/src/reconvert.ts#L327) `carryRecords` | `SQLite.prepare` (327, 333, 336, 341, 342, 352, 358, 359); `SQLite.all` (333, 341, 345, 358) | OPERATOR |
| [packages/store/src/reconvert.ts:384](../../packages/store/src/reconvert.ts#L384) `carrySettings` | `SQLite.all` (384, 388, 396); `SQLite.prepare` (384, 388, 396, 397, 403); `SQLite.get` (403) | OPERATOR |
| [packages/store/src/reconvert.ts:100](../../packages/store/src/reconvert.ts#L100) `columns` | `SQLite.all` (100); `SQLite.prepare` (100) | OPERATOR |
| [packages/store/src/reconvert.ts:290](../../packages/store/src/reconvert.ts#L290) `copyContainer` | `SQLite.get` (290); `SQLite.prepare` (290, 292, 298) | OPERATOR |
| [packages/store/src/reconvert.ts:91](../../packages/store/src/reconvert.ts#L91) `meta` | `SQLite.get` (91); `SQLite.prepare` (91) | OPERATOR |
| [packages/store/src/reconvert.ts:270](../../packages/store/src/reconvert.ts#L270) `previewOf` | `SQLite.get` (270); `SQLite.prepare` (270) | OPERATOR |
| [packages/store/src/reconvert.ts:257](../../packages/store/src/reconvert.ts#L257) `previewOf/count` | `SQLite.get` (257); `SQLite.prepare` (257) | OPERATOR |
| [packages/store/src/reconvert.ts:146](../../packages/store/src/reconvert.ts#L146) `reconvertCheck` | `SQLite.get` (146); `SQLite.prepare` (146) | OPERATOR |
| [packages/store/src/reconvert.ts:96](../../packages/store/src/reconvert.ts#L96) `tableExists` | `SQLite.get` (96); `SQLite.prepare` (96) | OPERATOR |
| [packages/store/src/record-chain.ts:58](../../packages/store/src/record-chain.ts#L58) `ensureRecordChain` | `SQLite.all` (58); `SQLite.prepare` (58, 67, 68, 71); `SQLite.get` (67, 68) | CORE |
| [packages/store/src/record-chain.ts:80](../../packages/store/src/record-chain.ts#L80) `linkRecordEntry` | `SQLite.prepare` (80, 81, 82, 85, 86); `SQLite.get` (81, 82) | CORE |
| [packages/store/src/record-chain.ts:93](../../packages/store/src/record-chain.ts#L93) `pruneRecordEntries` | `SQLite.prepare` (93, 94, 95, 97); `SQLite.get` (94) | CORE |
| [packages/store/src/record-chain.ts:115](../../packages/store/src/record-chain.ts#L115) `verifyRecordAudit` | `SQLite.get` (115, 129); `SQLite.prepare` (115, 119, 129, 132); `SQLite.all` (119); `SQLite.iterate` (132) | CORE |
| [packages/store/src/related.ts:151](../../packages/store/src/related.ts#L151) `condition` | `Store.canViewRecord` (151); `keyValue` (164) | RELATED |
| [packages/store/src/related.ts:474](../../packages/store/src/related.ts#L474) `firstRelatedEach` | `Calculations.statement` (474); `SQLite.all` (474) | RELATED |
| [packages/store/src/related.ts:453](../../packages/store/src/related.ts#L453) `firstRelatedEach/keysOf` | `keyValue` (453) | RELATED |
| [packages/store/src/related.ts:440](../../packages/store/src/related.ts#L440) `firstRelatedEach/oneByOne` | `relatedRows` (440) | RELATED |
| [packages/store/src/related.ts:140](../../packages/store/src/related.ts#L140) `keyValue` | `Calculations.value` (140) | RELATED |
| [packages/store/src/related.ts:377](../../packages/store/src/related.ts#L377) `relatedIdList` | `Calculations.relatedIds` (377); `Calculations.statement` (382); `SQLite.iterate` (382) | RELATED |
| [packages/store/src/related.ts:420](../../packages/store/src/related.ts#L420) `relatedKeys` | `keyValue` (420) | RELATED |
| [packages/store/src/related.ts:319](../../packages/store/src/related.ts#L319) `relatedRows` | `Calculations.relatedIds` (319); `rowsById` (320); `Calculations.statement` (335, 339, 349); `SQLite.get` (335); `SQLite.all` (339); `SQLite.iterate` (349) | RELATED |
| [packages/store/src/related.ts:220](../../packages/store/src/related.ts#L220) `findCandidates` | `SQLite.prepare` (220, 234, 244); `Store.sql` (220, 234, 244); `SQLite.iterate` (235, 237, 244) | CORE |
| [packages/store/src/related.ts:266](../../packages/store/src/related.ts#L266) `relatedFindParents/reachesHit` | `Calculations.statement` (266, 267); `SQLite.get` (266); `SQLite.iterate` (268) | CORE |
| [packages/store/src/results.ts:122](../../packages/store/src/results.ts#L122) `ResultCache/claimed` | `SQLite.get` (122); `SQLite.prepare` (122) | CORE |
| [packages/store/src/results.ts:74](../../packages/store/src/results.ts#L74) `ResultCache/get` | `SQLite.get` (74); `SQLite.prepare` (74) | CORE |
| [packages/store/src/results.ts:65](../../packages/store/src/results.ts#L65) `ResultCache/lastWrite` | `SQLite.get` (65); `SQLite.prepare` (65) | CORE |
| [packages/store/src/results.ts:86](../../packages/store/src/results.ts#L86) `ResultCache/put` | `SQLite.prepare` (86) | CORE |
| [packages/store/src/results.ts:131](../../packages/store/src/results.ts#L131) `ResultCache/release` | `SQLite.prepare` (131) | CORE |
| [packages/store/src/results.ts:110](../../packages/store/src/results.ts#L110) `ResultCache/renew` | `SQLite.prepare` (110) | CORE |
| [packages/store/src/results.ts:56](../../packages/store/src/results.ts#L56) `ResultCache/wrote` | `SQLite.prepare` (56) | CORE |
| [packages/store/src/security-chain.ts:144](../../packages/store/src/security-chain.ts#L144) `appendSecurityEvent` | `SQLite.prepare` (144, 146, 148, 150, 154, 156); `SQLite.get` (146, 150) | CORE |
| [packages/store/src/security-chain.ts:100](../../packages/store/src/security-chain.ts#L100) `ensureSecurityChain` | `SQLite.get` (100, 114, 115, 118, 119); `SQLite.prepare` (100, 101, 109, 114, 115, 118, 119, 123, 126, 134); `SQLite.all` (101, 109); `SQLite.iterate` (126) | CORE |
| [packages/store/src/security-chain.ts:164](../../packages/store/src/security-chain.ts#L164) `pruneSecurityEntries` | `SQLite.prepare` (164, 166, 171, 175, 177, 178); `SQLite.get` (166, 171, 175) | CORE |
| [packages/store/src/security-chain.ts:197](../../packages/store/src/security-chain.ts#L197) `verifySecurityAudit` | `SQLite.get` (197, 198); `SQLite.prepare` (197, 198, 203, 207, 222); `SQLite.all` (203, 207); `SQLite.iterate` (224) | CORE |
| [packages/store/src/sql-child.ts:32](../../packages/store/src/sql-child.ts#L32) `run` | `SQLite.iterate` (32) | CORE |
| [packages/store/src/sql-recursive.ts:44](../../packages/store/src/sql-recursive.ts#L44) `builtinFunctions` | `SQLite.all` (44); `SQLite.prepare` (44) | CORE |
| [packages/store/src/sql-result.ts:42](../../packages/store/src/sql-result.ts#L42) `boundedStatement` | `SQLite.prepare` (42, 53) | CORE |
| [packages/store/src/stale-calcs.ts:107](../../packages/store/src/stale-calcs.ts#L107) `current` | `Calculations.computeStored` (107) | DESIGN |
| [packages/store/src/stale-calcs.ts:128](../../packages/store/src/stale-calcs.ts#L128) `findStaleCalcs` | `Store.sql` (128, 135, 158); `Store.recordCount` (133); `SQLite.iterate` (135); `SQLite.prepare` (135) | DESIGN |
| [packages/store/src/stale-calcs.ts:283](../../packages/store/src/stale-calcs.ts#L283) `RefreshJournal/add` | `SQLite.prepare` (283); `Store.sql` (283) | DESIGN |
| [packages/store/src/stale-calcs.ts:277](../../packages/store/src/stale-calcs.ts#L277) `RefreshJournal/constructor` | `Store.sql` (277) | DESIGN |
| [packages/store/src/stale-calcs.ts:289](../../packages/store/src/stale-calcs.ts#L289) `RefreshJournal/get` | `SQLite.get` (289); `SQLite.prepare` (289); `Store.sql` (289) | DESIGN |
| [packages/store/src/stale-calcs.ts:294](../../packages/store/src/stale-calcs.ts#L294) `RefreshJournal/list` | `SQLite.all` (294); `SQLite.prepare` (294); `Store.sql` (294) | DESIGN |
| [packages/store/src/stale-calcs.ts:298](../../packages/store/src/stale-calcs.ts#L298) `RefreshJournal/markUndone` | `SQLite.prepare` (298); `Store.sql` (298) | DESIGN |
| [packages/store/src/stale-calcs.ts:205](../../packages/store/src/stale-calcs.ts#L205) `refreshStaleCalcsBatch` | `Store.sql` (205, 210, 228, 231); `SQLite.iterate` (210); `SQLite.prepare` (210) | DESIGN |
| [packages/store/src/stale-calcs.ts:243](../../packages/store/src/stale-calcs.ts#L243) `undoStaleRefreshBatch` | `Store.sql` (243, 261, 263) | DESIGN |
| [packages/store/src/store-format.ts:50](../../packages/store/src/store-format.ts#L50) `checkFormat` | `SQLite.prepare` (50) | CORE |
| [packages/store/src/store-format.ts:32](../../packages/store/src/store-format.ts#L32) `storedFormat` | `SQLite.get` (32); `SQLite.prepare` (32) | CORE |
| [packages/store/src/store.ts:5744](../../packages/store/src/store.ts#L5744) `Store/accountIdentityId` | `SQLite.get` (5744, 5750); `SQLite.prepare` (5744, 5749, 5750); `Store.sql` (5744, 5749, 5750) | CORE |
| [packages/store/src/store.ts:5738](../../packages/store/src/store.ts#L5738) `Store/accountIdentityIdIfSet` | `SQLite.get` (5738); `SQLite.prepare` (5738); `Store.sql` (5738) | CORE |
| [packages/store/src/store.ts:5700](../../packages/store/src/store.ts#L5700) `Store/accountInactive` | `SQLite.get` (5700); `SQLite.prepare` (5700); `Store.sql` (5700) | CORE |
| [packages/store/src/store.ts:5897](../../packages/store/src/store.ts#L5897) `Store/accountLocalOnly` | `SQLite.get` (5897); `SQLite.prepare` (5897); `Store.sql` (5897) | CORE |
| [packages/store/src/store.ts:6766](../../packages/store/src/store.ts#L6766) `Store/accountPrivilegeSet` | `SQLite.get` (6766); `SQLite.prepare` (6766); `Store.sql` (6766) | CORE |
| [packages/store/src/store.ts:5902](../../packages/store/src/store.ts#L5902) `Store/accountRequires2fa` | `SQLite.get` (5902); `SQLite.prepare` (5902); `Store.sql` (5902) | CORE |
| [packages/store/src/store.ts:4010](../../packages/store/src/store.ts#L4010) `Store/accounts` | `SQLite.all` (4010); `SQLite.prepare` (4010); `Store.sql` (4010) | CORE |
| [packages/store/src/store.ts:4006](../../packages/store/src/store.ts#L4006) `Store/accountsSharingLockout` | `SQLite.all` (4006); `SQLite.prepare` (4006); `Store.sql` (4006) | CORE |
| [packages/store/src/store.ts:6122](../../packages/store/src/store.ts#L6122) `Store/accountUsage` | `SQLite.get` (6122); `SQLite.prepare` (6122, 6123); `Store.sql` (6122, 6123); `SQLite.all` (6123); `Store.auditLog` (6139) | CORE |
| [packages/store/src/store.ts:9010](../../packages/store/src/store.ts#L9010) `Store/addContainer` | `SQLite.all` (9010); `SQLite.prepare` (9010, 9015, 9029, 9033, 9034); `Store.sql` (9010, 9015, 9029, 9031, 9033, 9034, 9036, 9039); `SQLite.get` (9020); `Store.containerRange` (9022) | CORE |
| [packages/store/src/store.ts:9056](../../packages/store/src/store.ts#L9056) `Store/addExternalContainer` | `SQLite.prepare` (9056); `Store.sql` (9056) | CORE |
| [packages/store/src/store.ts:9543](../../packages/store/src/store.ts#L9543) `Store/addFieldIndex` | `Store.sql` (9543) | CORE |
| [packages/store/src/store.ts:7655](../../packages/store/src/store.ts#L7655) `Store/addImage` | `Store.sql` (7655, 7656); `SQLite.prepare` (7656) | CORE |
| [packages/store/src/store.ts:6816](../../packages/store/src/store.ts#L6816) `Store/addProvisionedAccount` | `SQLite.get` (6816); `SQLite.prepare` (6816, 6820); `Store.sql` (6816, 6820) | CORE |
| [packages/store/src/store.ts:8115](../../packages/store/src/store.ts#L8115) `Store/addRelated` | `relatedRows` (8115); `rowsById` (8150); `firstRelatedEach` (8176) | CORE |
| [packages/store/src/store.ts:8103](../../packages/store/src/store.ts#L8103) `Store/addRelated/summaries` | `Calculations.summary` (8103) | CORE |
| [packages/store/src/store.ts:4028](../../packages/store/src/store.ts#L4028) `Store/agentNeedsApproval` | `SQLite.get` (4028); `SQLite.prepare` (4028); `Store.sql` (4028) | CORE |
| [packages/store/src/store.ts:7043](../../packages/store/src/store.ts#L7043) `Store/allowedIds` | `SQLite.iterate` (7043); `SQLite.prepare` (7043); `Store.sql` (7043) | CORE |
| [packages/store/src/store.ts:6179](../../packages/store/src/store.ts#L6179) `Store/apiToken` | `SQLite.get` (6179); `SQLite.prepare` (6179, 6197); `Store.sql` (6179, 6197) | CORE |
| [packages/store/src/store.ts:6155](../../packages/store/src/store.ts#L6155) `Store/apiTokens` | `SQLite.all` (6155); `SQLite.prepare` (6155); `Store.sql` (6155) | CORE |
| [packages/store/src/store.ts:4451](../../packages/store/src/store.ts#L4451) `Store/appendSecurityEvent` | `Store.sql` (4451) | CORE |
| [packages/store/src/store.ts:3468](../../packages/store/src/store.ts#L3468) `Store/appendSecurityRow` | `Store.sql` (3468) | CORE |
| [packages/store/src/store.ts:5520](../../packages/store/src/store.ts#L5520) `Store/applyAccountImport` | `Store.sql` (5520, 5528, 5557); `SQLite.get` (5528); `SQLite.prepare` (5528, 5557) | CORE |
| [packages/store/src/store.ts:2735](../../packages/store/src/store.ts#L2735) `Store/applyDesign` | `Store.sql` (2735, 2736, 2756, 2759, 2764, 2780, 2783, 2783); `SQLite.prepare` (2759, 2764) | CORE |
| [packages/store/src/store.ts:4280](../../packages/store/src/store.ts#L4280) `Store/approvePending` | `SQLite.get` (4280); `SQLite.prepare` (4280, 4292); `Store.sql` (4280, 4292) | CORE |
| [packages/store/src/store.ts:3259](../../packages/store/src/store.ts#L3259) `Store/audit/write` | `Store.sql` (3259) | CORE |
| [packages/store/src/store.ts:2847](../../packages/store/src/store.ts#L2847) `Store/auditLog` | `SQLite.all` (2847); `SQLite.prepare` (2847); `Store.sql` (2847) | CORE |
| [packages/store/src/store.ts:2268](../../packages/store/src/store.ts#L2268) `Store/backup` | `Store.sql` (2268) | CORE |
| [packages/store/src/store.ts:4034](../../packages/store/src/store.ts#L4034) `Store/blankPasswordAccounts` | `SQLite.all` (4034); `SQLite.prepare` (4034); `Store.sql` (4034) | CORE |
| [packages/store/src/store.ts:5448](../../packages/store/src/store.ts#L5448) `Store/canonicalAccount` | `SQLite.all` (5448); `SQLite.prepare` (5448); `Store.sql` (5448) | CORE |
| [packages/store/src/store.ts:10125](../../packages/store/src/store.ts#L10125) `Store/canView` | `Store.canView` (10125); `Store.row` (10126) | GATED-STORE |
| [packages/store/src/store.ts:10107](../../packages/store/src/store.ts#L10107) `Store/canViewRecord` | `SQLite.get` (10107); `SQLite.prepare` (10107); `Store.sql` (10107) | GATED-STORE |
| [packages/store/src/store.ts:11246](../../packages/store/src/store.ts#L11246) `Store/cascadeDelete` | `relatedRows` (11246) | CORE |
| [packages/store/src/store.ts:2568](../../packages/store/src/store.ts#L2568) `Store/changeOne` | `Store.sql` (2568, 2570) | CORE |
| [packages/store/src/store.ts:2571](../../packages/store/src/store.ts#L2571) `Store/changeOne/read` | `SQLite.get` (2571); `SQLite.prepare` (2571); `Store.sql` (2571) | CORE |
| [packages/store/src/store.ts:9400](../../packages/store/src/store.ts#L9400) `Store/checkContainerWrite` | `Store.row` (9400) | CORE |
| [packages/store/src/store.ts:10859](../../packages/store/src/store.ts#L10859) `Store/checkEditable` | `Store.row` (10859) | CORE |
| [packages/store/src/store.ts:1790](../../packages/store/src/store.ts#L1790) `Store/checkpoint` | `SQLite.get` (1790); `SQLite.prepare` (1790); `Store.sql` (1790) | CORE |
| [packages/store/src/store.ts:4179](../../packages/store/src/store.ts#L4179) `Store/checkProposedWrite` | `Store.row` (4179); `relatedRows` (4193) | CORE |
| [packages/store/src/store.ts:6802](../../packages/store/src/store.ts#L6802) `Store/clearAccountPrivilegeSet` | `SQLite.prepare` (6802); `Store.sql` (6802) | CORE |
| [packages/store/src/store.ts:1812](../../packages/store/src/store.ts#L1812) `Store/close` | `Store.sql` (1812) | CORE |
| [packages/store/src/store.ts:9359](../../packages/store/src/store.ts#L9359) `Store/compactFile` | `Store.sql` (9359, 9360, 9362) | CORE |
| [packages/store/src/store.ts:9775](../../packages/store/src/store.ts#L9775) `Store/computedRows` | `Store.sql` (9775, 9778, 9779, 9780, 9782, 9792, 9793, 9794, 9797); `SQLite.prepare` (9778, 9780, 9782, 9792); `SQLite.iterate` (9782); `Calculations.globalValue` (9785); `Calculations.unstoredValue` (9786); `Calculations.related` (9789); `SQLite.all` (9792) | CORE |
| [packages/store/src/store.ts:11373](../../packages/store/src/store.ts#L11373) `Store/computeValuesCurrent` | `Store.computeValues` (11373); `Store.sql` (11379, 11383); `SQLite.all` (11383); `SQLite.prepare` (11383) | GATED-STORE |
| [packages/store/src/store.ts:6224](../../packages/store/src/store.ts#L6224) `Store/confirmTotp` | `SQLite.get` (6224); `SQLite.prepare` (6224, 6226); `Store.sql` (6224, 6226) | CORE |
| [packages/store/src/store.ts:1418](../../packages/store/src/store.ts#L1418) `Store/constructor` | `Store.sql` (1418, 1420, 1422, 1423, 1427, 1431, 1432, 1441, 1449, 1465, 1470, 1475, 1476, 1480, 1481, 1482, 1489, 1493, 1497, 1498, 1499, 1501, 1511, 1512, 1516, 1519, 1520, 1522, 1523, 1526, 1527, 1531, 1532, 1536, 1537, 1540, 1543, 1544, 1546, 1549, 1550, 1554, 1555, 1559, 1560, 1564, 1565, 1568, 1571, 1572, 1575, 1576, 1578, 1578, 1579, 1579, 1580, 1584, 1586, 1590, 1592, 1595, 1596, 1597, 1600, 1601, 1603, 1605, 1606, 1610, 1611, 1613, 1625, 1627, 1628, 1629, 1629, 1633, 1634); `SQLite.get` (1422, 1441); `SQLite.prepare` (1422, 1441, 1449, 1501, 1519, 1520, 1523, 1526, 1531, 1536, 1543, 1549, 1554, 1559, 1571, 1575, 1578, 1579, 1600, 1605, 1610); `SQLite.all` (1519, 1526, 1531, 1536, 1543, 1549, 1554, 1559, 1571, 1575, 1578, 1579, 1600, 1605, 1610) | CORE |
| [packages/store/src/store.ts:6582](../../packages/store/src/store.ts#L6582) `Store/consumeRecoveryCode` | `SQLite.prepare` (6582); `Store.sql` (6582) | CORE |
| [packages/store/src/store.ts:8934](../../packages/store/src/store.ts#L8934) `Store/container` | `SQLite.get` (8934); `SQLite.prepare` (8934, 8943); `Store.sql` (8934, 8943); `SQLite.all` (8943) | CORE |
| [packages/store/src/store.ts:9368](../../packages/store/src/store.ts#L9368) `Store/containerId` | `Store.containerId` (9368); `Store.row` (9369) | CORE |
| [packages/store/src/store.ts:8951](../../packages/store/src/store.ts#L8951) `Store/containerInfo` | `SQLite.get` (8951); `SQLite.prepare` (8951); `Store.sql` (8951) | CORE |
| [packages/store/src/store.ts:8915](../../packages/store/src/store.ts#L8915) `Store/containerIntact` | `SQLite.get` (8915); `SQLite.prepare` (8915); `Store.sql` (8915) | CORE |
| [packages/store/src/store.ts:8854](../../packages/store/src/store.ts#L8854) `Store/containerIntegrityReport` | `SQLite.all` (8854); `SQLite.prepare` (8854, 8865); `Store.sql` (8854, 8865); `SQLite.get` (8865) | CORE |
| [packages/store/src/store.ts:8929](../../packages/store/src/store.ts#L8929) `Store/containerMeta` | `SQLite.get` (8929); `SQLite.prepare` (8929); `Store.sql` (8929) | CORE |
| [packages/store/src/store.ts:8985](../../packages/store/src/store.ts#L8985) `Store/containerRange` | `SQLite.all` (8985); `SQLite.prepare` (8985, 8992); `Store.sql` (8985, 8992); `SQLite.get` (8992) | CORE |
| [packages/store/src/store.ts:8756](../../packages/store/src/store.ts#L8756) `Store/containerReferences` | `SQLite.all` (8756, 8775, 8777, 8783, 8796, 8807, 8821); `SQLite.prepare` (8756, 8775, 8777, 8783, 8796, 8807, 8819, 8821); `Store.sql` (8756, 8775, 8777, 8783, 8796, 8807, 8819, 8821); `SQLite.get` (8819); `Store.row` (8830) | CORE |
| [packages/store/src/store.ts:11352](../../packages/store/src/store.ts#L11352) `Store/countIds` | `Store.countIds` (11352); `SQLite.get` (11357); `SQLite.prepare` (11357); `Store.sql` (11357) | GATED-STORE |
| [packages/store/src/store.ts:10156](../../packages/store/src/store.ts#L10156) `Store/create` | `SQLite.get` (10156); `SQLite.prepare` (10156, 10169); `Store.sql` (10156, 10169) | CORE |
| [packages/store/src/store.ts:4423](../../packages/store/src/store.ts#L4423) `Store/createAccountOnly` | `SQLite.get` (4423); `SQLite.prepare` (4423, 4427, 4433, 4438, 4443); `Store.sql` (4423, 4427, 4433, 4438, 4443) | CORE |
| [packages/store/src/store.ts:5955](../../packages/store/src/store.ts#L5955) `Store/createApiToken` | `SQLite.get` (5955, 5983); `SQLite.prepare` (5955, 5982, 5983, 5993); `Store.sql` (5955, 5982, 5983, 5993) | CORE |
| [packages/store/src/store.ts:5461](../../packages/store/src/store.ts#L5461) `Store/createLocalAccount` | `SQLite.prepare` (5461); `Store.sql` (5461) | CORE |
| [packages/store/src/store.ts:4000](../../packages/store/src/store.ts#L4000) `Store/credentialIdentity` | `SQLite.get` (4000); `SQLite.prepare` (4000); `Store.sql` (4000) | CORE |
| [packages/store/src/store.ts:5876](../../packages/store/src/store.ts#L5876) `Store/credentialStamp` | `SQLite.get` (5876); `SQLite.prepare` (5876); `Store.sql` (5876) | CORE |
| [packages/store/src/store.ts:7481](../../packages/store/src/store.ts#L7481) `Store/crossFileBusy` | `Store.sql` (7481) | AUTH |
| [packages/store/src/store.ts:7453](../../packages/store/src/store.ts#L7453) `Store/crossFileHash` | `SQLite.get` (7453); `SQLite.prepare` (7453); `Store.sql` (7453) | AUTH |
| [packages/store/src/store.ts:2358](../../packages/store/src/store.ts#L2358) `Store/dataVersion` | `SQLite.get` (2358); `SQLite.prepare` (2358); `Store.sql` (2358) | CORE |
| [packages/store/src/store.ts:11920](../../packages/store/src/store.ts#L11920) `Store/decimalViewSql` | `SQLite.all` (11920); `SQLite.prepare` (11920) | CORE |
| [packages/store/src/store.ts:10902](../../packages/store/src/store.ts#L10902) `Store/delete` | `Store.row` (10902) | CORE |
| [packages/store/src/store.ts:10910](../../packages/store/src/store.ts#L10910) `Store/delete/run` | `SQLite.get` (10910); `SQLite.prepare` (10910, 10915); `Store.sql` (10910, 10915) | CORE |
| [packages/store/src/store.ts:5615](../../packages/store/src/store.ts#L5615) `Store/deleteAccount` | `SQLite.prepare` (5615, 5619, 5620, 5621, 5622, 5623, 5624, 5625, 5626, 5633, 5635, 5637, 5639, 5643); `Store.sql` (5615, 5619, 5620, 5621, 5622, 5623, 5624, 5625, 5626, 5633, 5635, 5637, 5639, 5643) | CORE |
| [packages/store/src/store.ts:10986](../../packages/store/src/store.ts#L10986) `Store/deleteBeingUndone` | `SQLite.all` (10986); `SQLite.prepare` (10986); `Store.sql` (10986) | CORE |
| [packages/store/src/store.ts:3636](../../packages/store/src/store.ts#L3636) `Store/deletedRows` | `SQLite.get` (3636); `SQLite.prepare` (3636, 3638, 3638); `Store.sql` (3636, 3638, 3638); `SQLite.all` (3638, 3638) | CORE |
| [packages/store/src/store.ts:10998](../../packages/store/src/store.ts#L10998) `Store/deleteEndingTheLifeAt` | `SQLite.get` (10998); `SQLite.prepare` (10998); `Store.sql` (10998) | CORE |
| [packages/store/src/store.ts:6667](../../packages/store/src/store.ts#L6667) `Store/deletePrivilegeSet` | `SQLite.prepare` (6667); `Store.sql` (6667) | CORE |
| [packages/store/src/store.ts:4561](../../packages/store/src/store.ts#L4561) `Store/deleteScriptTest` | `SQLite.prepare` (4561); `Store.sql` (4561) | CORE |
| [packages/store/src/store.ts:10887](../../packages/store/src/store.ts#L10887) `Store/deleteVisibility` | `Store.canViewRecord` (10887) | CORE |
| [packages/store/src/store.ts:7597](../../packages/store/src/store.ts#L7597) `Store/design` | `SQLite.get` (7597) | CORE |
| [packages/store/src/store.ts:3746](../../packages/store/src/store.ts#L3746) `Store/designEffect` | `Store.sql` (3746, 3747, 3753, 3754, 3757, 3763, 3768, 3771, 3777, 3788, 3789, 3791, 3792, 3805, 3806, 3809, 3811, 3817, 3818, 3819, 3825, 3827, 3831, 3834, 3835, 3837, 3840, 3846, 3848, 3855, 3856, 3858, 3859, 3860, 3861, 3868, 3869, 3871, 3871, 3873, 3874, 3875, 3879, 3883, 3885, 3923, 3925, 3927); `SQLite.prepare` (3757, 3788, 3789, 3805, 3806, 3817, 3818, 3825, 3827, 3831, 3835, 3846, 3848, 3861, 3868, 3869, 3871, 3873, 3875, 3879, 3883); `SQLite.get` (3788, 3805, 3817, 3818, 3831, 3835, 3871, 3879); `SQLite.all` (3868, 3869); `SQLite.iterate` (3873) | CORE |
| [packages/store/src/store.ts:3739](../../packages/store/src/store.ts#L3739) `Store/designEffect/renameExcluded` | `SQLite.prepare` (3739); `Store.sql` (3739) | CORE |
| [packages/store/src/store.ts:3723](../../packages/store/src/store.ts#L3723) `Store/designEffect/renameKey` | `SQLite.prepare` (3723); `Store.sql` (3723) | CORE |
| [packages/store/src/store.ts:3677](../../packages/store/src/store.ts#L3677) `Store/designHistory` | `SQLite.all` (3677); `SQLite.prepare` (3677); `Store.sql` (3677) | CORE |
| [packages/store/src/store.ts:6245](../../packages/store/src/store.ts#L6245) `Store/disableTotp` | `SQLite.prepare` (6245); `Store.sql` (6245) | CORE |
| [packages/store/src/store.ts:3935](../../packages/store/src/store.ts#L3935) `Store/dropColumnIndexes` | `SQLite.all` (3935, 3937); `SQLite.prepare` (3935, 3937); `Store.sql` (3935, 3937, 3938) | CORE |
| [packages/store/src/store.ts:9555](../../packages/store/src/store.ts#L9555) `Store/dropFieldIndex` | `SQLite.get` (9555); `SQLite.prepare` (9555); `Store.sql` (9555, 9556) | CORE |
| [packages/store/src/store.ts:10195](../../packages/store/src/store.ts#L10195) `Store/duplicate` | `Store.row` (10195); `SQLite.prepare` (10213); `Store.sql` (10213) | CORE |
| [packages/store/src/store.ts:9172](../../packages/store/src/store.ts#L9172) `Store/embeddedContainerCount` | `SQLite.prepare` (9172); `Store.sql` (9172); `SQLite.get` (9173) | CORE |
| [packages/store/src/store.ts:9158](../../packages/store/src/store.ts#L9158) `Store/embeddedContainers` | `SQLite.prepare` (9158, 9159); `Store.sql` (9158, 9159); `SQLite.all` (9159); `SQLite.get` (9163) | CORE |
| [packages/store/src/store.ts:3662](../../packages/store/src/store.ts#L3662) `Store/emptyDeleted` | `Store.sql` (3662, 3665, 3666, 3668, 3670); `SQLite.prepare` (3666) | CORE |
| [packages/store/src/store.ts:2234](../../packages/store/src/store.ts#L2234) `Store/endTransaction` | `Store.sql` (2234, 2237, 2237) | CORE |
| [packages/store/src/store.ts:6213](../../packages/store/src/store.ts#L6213) `Store/enrollTotp` | `SQLite.prepare` (6213); `Store.sql` (6213) | CORE |
| [packages/store/src/store.ts:3631](../../packages/store/src/store.ts#L3631) `Store/ensureDeleted` | `Store.sql` (3631) | CORE |
| [packages/store/src/store.ts:1644](../../packages/store/src/store.ts#L1644) `Store/ensureNativeIds` | `SQLite.all` (1644, 1656); `SQLite.prepare` (1644, 1647, 1655, 1656); `Store.sql` (1644, 1647, 1650, 1654, 1655, 1656, 1659, 1661) | CORE |
| [packages/store/src/store.ts:2480](../../packages/store/src/store.ts#L2480) `Store/ensureRecordIdHighWater` | `Store.sql` (2480, 2481, 2483, 2485, 2487) | CORE |
| [packages/store/src/store.ts:2499](../../packages/store/src/store.ts#L2499) `Store/ensureRecordIdMarks` | `SQLite.all` (2499, 2502, 2505, 2514); `SQLite.prepare` (2499, 2502, 2505, 2508, 2514, 2517); `Store.sql` (2499, 2502, 2505, 2508, 2514, 2517, 2521, 2522) | CORE |
| [packages/store/src/store.ts:10536](../../packages/store/src/store.ts#L10536) `Store/evaluateCurrent` | `Store.row` (10536, 10536, 10537, 10537); `Calculations.context` (10542); `Store.get` (10543, 10545) | GATED-STORE |
| [packages/store/src/store.ts:10577](../../packages/store/src/store.ts#L10577) `Store/evaluateEachCurrent` | `Store.row` (10577, 10577, 10582); `Calculations.context` (10583); `Store.get` (10585) | GATED-STORE |
| [packages/store/src/store.ts:10639](../../packages/store/src/store.ts#L10639) `Store/evaluateRowsCurrent` | `Store.row` (10639, 10639, 10640, 10640) | GATED-STORE |
| [packages/store/src/store.ts:10618](../../packages/store/src/store.ts#L10618) `Store/evaluateRowsCurrent/each` | `Calculations.context` (10618); `Store.get` (10620) | GATED-STORE |
| [packages/store/src/store.ts:10654](../../packages/store/src/store.ts#L10654) `Store/evaluateRowsCurrent/found/[Symbol.iterator]` | `rowsById` (10654) | GATED-STORE |
| [packages/store/src/store.ts:10676](../../packages/store/src/store.ts#L10676) `Store/evaluateRowsCurrent/key` | `Calculations.context` (10676) | GATED-STORE |
| [packages/store/src/store.ts:4324](../../packages/store/src/store.ts#L4324) `Store/externalAccount` | `SQLite.all` (4324); `SQLite.prepare` (4324); `Store.sql` (4324) | CORE |
| [packages/store/src/store.ts:8677](../../packages/store/src/store.ts#L8677) `Store/externalContainerCheck` | `SQLite.all` (8677); `SQLite.prepare` (8677); `Store.sql` (8677) | CORE |
| [packages/store/src/store.ts:8684](../../packages/store/src/store.ts#L8684) `Store/externalContainerCount` | `SQLite.get` (8684); `SQLite.prepare` (8684); `Store.sql` (8684) | CORE |
| [packages/store/src/store.ts:8693](../../packages/store/src/store.ts#L8693) `Store/externalContainerReport` | `SQLite.all` (8693, 8706); `SQLite.prepare` (8693, 8706); `Store.sql` (8693, 8706) | CORE |
| [packages/store/src/store.ts:5726](../../packages/store/src/store.ts#L5726) `Store/externalIdentityId` | `SQLite.get` (5726, 5733); `SQLite.prepare` (5726, 5732, 5733); `Store.sql` (5726, 5732, 5733) | CORE |
| [packages/store/src/store.ts:8925](../../packages/store/src/store.ts#L8925) `Store/externalOf` | `SQLite.get` (8925); `SQLite.prepare` (8925); `Store.sql` (8925) | CORE |
| [packages/store/src/store.ts:3412](../../packages/store/src/store.ts#L3412) `Store/failureAuditRoom` | `SQLite.get` (3412); `SQLite.prepare` (3412); `Store.sql` (3412) | CORE |
| [packages/store/src/store.ts:8324](../../packages/store/src/store.ts#L8324) `Store/fieldIndexCurrent` | `SQLite.iterate` (8324); `SQLite.prepare` (8324, 8329); `Store.sql` (8324, 8329); `SQLite.all` (8329) | GATED-STORE |
| [packages/store/src/store.ts:9595](../../packages/store/src/store.ts#L9595) `Store/find` | `Store.find` (9595) | GATED-STORE |
| [packages/store/src/store.ts:9962](../../packages/store/src/store.ts#L9962) `Store/findCandidates` | `Store.query` (9962) | CORE |
| [packages/store/src/store.ts:9606](../../packages/store/src/store.ts#L9606) `Store/findHere` | `Store.query` (9606, 9611, 9613, 9627, 9629, 9640); `Store.recordCount` (9624); `SQLite.get` (9625, 9629); `SQLite.prepare` (9625, 9629, 9635, 9642, 9651); `Store.sql` (9625, 9629, 9635, 9642, 9651); `SQLite.all` (9635, 9642, 9651) | GATED-STORE |
| [packages/store/src/store.ts:9646](../../packages/store/src/store.ts#L9646) `Store/findHere/[Symbol.iterator]` | `SQLite.iterate` (9646); `SQLite.prepare` (9646); `Store.sql` (9646) | GATED-STORE |
| [packages/store/src/store.ts:11485](../../packages/store/src/store.ts#L11485) `Store/findIdsCurrent` | `Store.findIds` (11485) | GATED-STORE |
| [packages/store/src/store.ts:11420](../../packages/store/src/store.ts#L11420) `Store/findIdsCurrentProgress` | `Store.findIdsProgress` (11420); `Store.query` (11422, 11424, 11437, 11439); `Store.recordCount` (11429, 11457); `SQLite.iterate` (11454); `SQLite.prepare` (11454, 11462, 11463); `Store.sql` (11454, 11462, 11463); `SQLite.get` (11466); `SQLite.all` (11472) | GATED-STORE |
| [packages/store/src/store.ts:11491](../../packages/store/src/store.ts#L11491) `Store/findIdsHere` | `Store.query` (11491, 11497, 11499); `SQLite.iterate` (11510); `SQLite.prepare` (11510); `Store.sql` (11510) | GATED-STORE |
| [packages/store/src/store.ts:9906](../../packages/store/src/store.ts#L9906) `Store/findSource` | `Store.query` (9906); `SQLite.all` (9915, 9932); `SQLite.prepare` (9915, 9923, 9931); `Store.sql` (9915, 9920, 9923, 9928, 9931, 9945, 9947); `Calculations.globalValue` (9937); `Calculations.unstoredValue` (9938); `Calculations.related` (9942) | CORE |
| [packages/store/src/store.ts:3524](../../packages/store/src/store.ts#L3524) `Store/flushDeferredSecurity` | `Store.sql` (3524) | CORE |
| [packages/store/src/store.ts:5582](../../packages/store/src/store.ts#L5582) `Store/forgetStandIns` | `SQLite.prepare` (5582); `Store.sql` (5582) | CORE |
| [packages/store/src/store.ts:10953](../../packages/store/src/store.ts#L10953) `Store/forgetStandInValues` | `Store.sql` (10953, 10974); `SQLite.prepare` (10974) | CORE |
| [packages/store/src/store.ts:8205](../../packages/store/src/store.ts#L8205) `Store/foundSetPage` | `rowsById` (8205) | CORE |
| [packages/store/src/store.ts:8221](../../packages/store/src/store.ts#L8221) `Store/foundSetRowsCurrent` | `Store.viewableIds` (8221); `Store.row` (8237) | GATED-STORE |
| [packages/store/src/store.ts:4242](../../packages/store/src/store.ts#L4242) `Store/gateAgentWrite` | `SQLite.get` (4242); `SQLite.prepare` (4242, 4244); `Store.sql` (4242, 4244) | CORE |
| [packages/store/src/store.ts:6520](../../packages/store/src/store.ts#L6520) `Store/generateRecoveryCodes` | `SQLite.prepare` (6520, 6523); `Store.sql` (6520, 6523) | CORE |
| [packages/store/src/store.ts:10035](../../packages/store/src/store.ts#L10035) `Store/getCurrent` | `Store.get` (10035); `Store.row` (10036, 10036, 10050); `SQLite.all` (10053); `SQLite.prepare` (10053); `Store.sql` (10053) | GATED-STORE |
| [packages/store/src/store.ts:10073](../../packages/store/src/store.ts#L10073) `Store/getManyCurrent` | `Store.getMany` (10073); `SQLite.get` (10091); `SQLite.prepare` (10091); `Store.sql` (10091) | GATED-STORE |
| [packages/store/src/store.ts:10084](../../packages/store/src/store.ts#L10084) `Store/getManyCurrent/[Symbol.iterator]` | `rowsById` (10084) | GATED-STORE |
| [packages/store/src/store.ts:1691](../../packages/store/src/store.ts#L1691) `Store/grantFullAccessClients` | `SQLite.prepare` (1691); `Store.sql` (1691) | CORE |
| [packages/store/src/store.ts:11527](../../packages/store/src/store.ts#L11527) `Store/groupSummariesCurrent` | `Store.groupSummaries` (11527); `Store.viewableIds` (11532); `Calculations.collect` (11548); `rowsById` (11548, 11598); `Calculations.collector` (11570) | GATED-STORE |
| [packages/store/src/store.ts:11596](../../packages/store/src/store.ts#L11596) `Store/groupSummariesCurrent/flush` | `Calculations.collector` (11596) | GATED-STORE |
| [packages/store/src/store.ts:11560](../../packages/store/src/store.ts#L11560) `Store/groupSummariesCurrent/key` | `Calculations.value` (11560); `Calculations.related` (11562) | GATED-STORE |
| [packages/store/src/store.ts:1718](../../packages/store/src/store.ts#L1718) `Store/hasOwnPassword` | `SQLite.get` (1718); `SQLite.prepare` (1718); `Store.sql` (1718) | CORE |
| [packages/store/src/store.ts:6375](../../packages/store/src/store.ts#L6375) `Store/hasPasskey` | `SQLite.get` (6375); `SQLite.prepare` (6375); `Store.sql` (6375) | CORE |
| [packages/store/src/store.ts:1699](../../packages/store/src/store.ts#L1699) `Store/hasProvingPassword` | `SQLite.get` (1699); `SQLite.prepare` (1699); `Store.sql` (1699) | CORE |
| [packages/store/src/store.ts:9509](../../packages/store/src/store.ts#L9509) `Store/hasTable` | `SQLite.get` (9509); `SQLite.prepare` (9509); `Store.sql` (9509) | CORE |
| [packages/store/src/store.ts:6234](../../packages/store/src/store.ts#L6234) `Store/hasTotp` | `SQLite.get` (6234); `SQLite.prepare` (6234); `Store.sql` (6234) | CORE |
| [packages/store/src/store.ts:5705](../../packages/store/src/store.ts#L5705) `Store/identityAllowed` | `SQLite.get` (5705, 5711, 5717); `SQLite.prepare` (5705, 5711, 5717); `Store.sql` (5705, 5711, 5717) | CORE |
| [packages/store/src/store.ts:7632](../../packages/store/src/store.ts#L7632) `Store/image` | `SQLite.get` (7632); `SQLite.prepare` (7632); `Store.sql` (7632) | CORE |
| [packages/store/src/store.ts:7642](../../packages/store/src/store.ts#L7642) `Store/images` | `SQLite.all` (7642); `SQLite.prepare` (7642); `Store.sql` (7642) | CORE |
| [packages/store/src/store.ts:5425](../../packages/store/src/store.ts#L5425) `Store/importAccounts` | `SQLite.all` (5425); `SQLite.prepare` (5425); `Store.sql` (5425) | CORE |
| [packages/store/src/store.ts:2033](../../packages/store/src/store.ts#L2033) `Store/independentWindowWrite` | `SQLite.get` (2033); `SQLite.prepare` (2033, 2041, 2102); `Store.sql` (2033, 2041, 2051, 2080, 2097, 2102, 2105); `SQLite.all` (2041); `Store.row` (2100) | CORE |
| [packages/store/src/store.ts:9521](../../packages/store/src/store.ts#L9521) `Store/indexedFields` | `SQLite.all` (9521, 9522); `SQLite.prepare` (9521, 9522); `Store.sql` (9521, 9522) | CORE |
| [packages/store/src/store.ts:11953](../../packages/store/src/store.ts#L11953) `Store/internalRoots` | `SQLite.get` (11953); `SQLite.prepare` (11953, 11955); `SQLite.all` (11955) | CORE |
| [packages/store/src/store.ts:4022](../../packages/store/src/store.ts#L4022) `Store/isAgent` | `SQLite.get` (4022); `SQLite.prepare` (4022); `Store.sql` (4022) | CORE |
| [packages/store/src/store.ts:4130](../../packages/store/src/store.ts#L4130) `Store/isExternal` | `SQLite.get` (4130); `SQLite.prepare` (4130); `Store.sql` (4130) | CORE |
| [packages/store/src/store.ts:6289](../../packages/store/src/store.ts#L6289) `Store/issueWebauthnChallenge` | `SQLite.prepare` (6289, 6291, 6292, 6294); `Store.sql` (6289, 6291, 6292, 6294); `SQLite.get` (6291) | CORE |
| [packages/store/src/store.ts:11814](../../packages/store/src/store.ts#L11814) `Store/iterateCommitted` | `SQLite.iterate` (11814) | CORE |
| [packages/store/src/store.ts:1972](../../packages/store/src/store.ts#L1972) `Store/joinTransaction` | `Store.sql` (1972, 1973, 1975, 1977, 1983, 1986) | CORE |
| [packages/store/src/store.ts:11193](../../packages/store/src/store.ts#L11193) `Store/keyStepWork` | `Store.sql` (11193, 11199, 11203, 11205) | CORE |
| [packages/store/src/store.ts:7441](../../packages/store/src/store.ts#L7441) `Store/knownSharedAccount` | `SQLite.get` (7441); `SQLite.prepare` (7441); `Store.sql` (7441) | CORE |
| [packages/store/src/store.ts:4898](../../packages/store/src/store.ts#L4898) `Store/lastSignIns` | `Store.auditLog` (4898) | CORE |
| [packages/store/src/store.ts:11004](../../packages/store/src/store.ts#L11004) `Store/latestDeleteSeq` | `SQLite.get` (11004); `SQLite.prepare` (11004); `Store.sql` (11004) | CORE |
| [packages/store/src/store.ts:7675](../../packages/store/src/store.ts#L7675) `Store/layout` | `SQLite.get` (7675); `SQLite.prepare` (7675); `Store.sql` (7675) | CORE |
| [packages/store/src/store.ts:3694](../../packages/store/src/store.ts#L3694) `Store/layoutHistory` | `SQLite.all` (3694); `SQLite.prepare` (3694); `Store.sql` (3694) | CORE |
| [packages/store/src/store.ts:7562](../../packages/store/src/store.ts#L7562) `Store/layouts` | `SQLite.all` (7562); `SQLite.prepare` (7562); `Store.sql` (7562) | CORE |
| [packages/store/src/store.ts:5198](../../packages/store/src/store.ts#L5198) `Store/leastPrivilege` | `SQLite.all` (5198); `SQLite.prepare` (5198); `Store.sql` (5198) | CORE |
| [packages/store/src/store.ts:5803](../../packages/store/src/store.ts#L5803) `Store/ledgerRow` | `SQLite.get` (5803, 5804); `SQLite.prepare` (5803, 5804); `Store.sql` (5803, 5804) | AUTH |
| [packages/store/src/store.ts:5815](../../packages/store/src/store.ts#L5815) `Store/ledgerWrite` | `Store.sql` (5815, 5816, 5818, 5820, 5823, 5823) | AUTH |
| [packages/store/src/store.ts:5509](../../packages/store/src/store.ts#L5509) `Store/limitAccountImport` | `SQLite.prepare` (5509, 5510, 5513); `Store.sql` (5509, 5510, 5513); `SQLite.get` (5510) | CORE |
| [packages/store/src/store.ts:3975](../../packages/store/src/store.ts#L3975) `Store/linkIdentity` | `SQLite.get` (3975); `SQLite.prepare` (3975); `Store.sql` (3975) | CORE |
| [packages/store/src/store.ts:3967](../../packages/store/src/store.ts#L3967) `Store/linkPrincipal` | `SQLite.get` (3967); `SQLite.prepare` (3967); `Store.sql` (3967) | CORE |
| [packages/store/src/store.ts:4784](../../packages/store/src/store.ts#L4784) `Store/markPiiField` | `SQLite.prepare` (4784); `Store.sql` (4784) | CORE |
| [packages/store/src/store.ts:8650](../../packages/store/src/store.ts#L8650) `Store/markRepeating` | `SQLite.prepare` (8650); `Store.sql` (8650) | CORE |
| [packages/store/src/store.ts:11745](../../packages/store/src/store.ts#L11745) `Store/matchIds` | `Store.matchIds` (11745); `SQLite.all` (11751); `SQLite.prepare` (11751); `Store.sql` (11751) | CORE |
| [packages/store/src/store.ts:1733](../../packages/store/src/store.ts#L1733) `Store/meta` | `SQLite.get` (1733); `SQLite.prepare` (1733); `Store.sql` (1733) | CORE |
| [packages/store/src/store.ts:1030](../../packages/store/src/store.ts#L1030) `Store/metadataVersions` | `SQLite.get` (1030); `SQLite.prepare` (1030); `Store.sql` (1030) | CORE |
| [packages/store/src/store.ts:9287](../../packages/store/src/store.ts#L9287) `Store/moveContainersIn` | `Store.sql` (9287, 9293, 9295, 9296, 9297, 9298, 9318, 9323, 9323, 9334, 9337, 9340, 9347); `SQLite.prepare` (9295, 9296, 9297, 9298, 9334, 9340); `SQLite.get` (9300, 9334, 9340) | CORE |
| [packages/store/src/store.ts:9209](../../packages/store/src/store.ts#L9209) `Store/moveContainersOut` | `Store.sql` (9209, 9217, 9219, 9221, 9226, 9227, 9247, 9253, 9255, 9257, 9257, 9263, 9263, 9268, 9270, 9272, 9272, 9278); `SQLite.get` (9217); `SQLite.prepare` (9217, 9226, 9227); `Store.container` (9229) | CORE |
| [packages/store/src/store.ts:5379](../../packages/store/src/store.ts#L5379) `Store/mustChangePassword` | `SQLite.get` (5379); `SQLite.prepare` (5379); `Store.sql` (5379) | CORE |
| [packages/store/src/store.ts:1669](../../packages/store/src/store.ts#L1669) `Store/nativeIdGuards` | `Store.sql` (1669, 1670, 1672) | CORE |
| [packages/store/src/store.ts:2535](../../packages/store/src/store.ts#L2535) `Store/nextRecordId` | `SQLite.get` (2535); `SQLite.prepare` (2535); `Store.sql` (2535) | CORE |
| [packages/store/src/store.ts:6109](../../packages/store/src/store.ts#L6109) `Store/objectUseSince` | `SQLite.get` (6109); `SQLite.prepare` (6109); `Store.sql` (6109) | CORE |
| [packages/store/src/store.ts:9481](../../packages/store/src/store.ts#L9481) `Store/orderBy` | `Store.valueListItems` (9481) | CORE |
| [packages/store/src/store.ts:8842](../../packages/store/src/store.ts#L8842) `Store/orphanContainerReport` | `SQLite.all` (8842); `SQLite.prepare` (8842); `Store.sql` (8842) | CORE |
| [packages/store/src/store.ts:6341](../../packages/store/src/store.ts#L6341) `Store/passkeyAllowList` | `SQLite.all` (6341); `SQLite.prepare` (6341); `Store.sql` (6341) | CORE |
| [packages/store/src/store.ts:6380](../../packages/store/src/store.ts#L6380) `Store/passkeyIds` | `SQLite.all` (6380); `SQLite.prepare` (6380); `Store.sql` (6380) | CORE |
| [packages/store/src/store.ts:6368](../../packages/store/src/store.ts#L6368) `Store/passkeys` | `SQLite.all` (6368); `SQLite.prepare` (6368); `Store.sql` (6368) | CORE |
| [packages/store/src/store.ts:5418](../../packages/store/src/store.ts#L5418) `Store/passwordDaysRemaining` | `SQLite.get` (5418); `SQLite.prepare` (5418); `Store.sql` (5418) | CORE |
| [packages/store/src/store.ts:7399](../../packages/store/src/store.ts#L7399) `Store/passwordState` | `SQLite.get` (7399); `SQLite.prepare` (7399); `Store.sql` (7399) | CORE |
| [packages/store/src/store.ts:4266](../../packages/store/src/store.ts#L4266) `Store/pendingChanges` | `SQLite.all` (4266); `SQLite.prepare` (4266); `Store.sql` (4266) | CORE |
| [packages/store/src/store.ts:1751](../../packages/store/src/store.ts#L1751) `Store/persistentData` | `SQLite.get` (1751) | CORE |
| [packages/store/src/store.ts:1760](../../packages/store/src/store.ts#L1760) `Store/persistentDataIds` | `SQLite.all` (1760) | CORE |
| [packages/store/src/store.ts:1741](../../packages/store/src/store.ts#L1741) `Store/persistentTable` | `Store.sql` (1741) | CORE |
| [packages/store/src/store.ts:10844](../../packages/store/src/store.ts#L10844) `Store/portalContainerTarget` | `Store.row` (10844); `relatedIdList` (10846) | CORE |
| [packages/store/src/store.ts:8260](../../packages/store/src/store.ts#L8260) `Store/portalCountsCurrent` | `Store.canView` (8260); `Store.row` (8287) | GATED-STORE |
| [packages/store/src/store.ts:8505](../../packages/store/src/store.ts#L8505) `Store/portalRows` | `relatedRows` (8505); `relatedIdList` (8506); `Store.viewableSet` (8509); `rowsById` (8534, 8572); `Calculations.related` (8548) | CORE |
| [packages/store/src/store.ts:8516](../../packages/store/src/store.ts#L8516) `Store/portalRows/context` | `Calculations.context` (8516) | CORE |
| [packages/store/src/store.ts:8526](../../packages/store/src/store.ts#L8526) `Store/portalRows/valueOf` | `Calculations.value` (8526) | CORE |
| [packages/store/src/store.ts:2913](../../packages/store/src/store.ts#L2913) `Store/prepared` | `SQLite.prepare` (2913); `Store.sql` (2913) | CORE |
| [packages/store/src/store.ts:5491](../../packages/store/src/store.ts#L5491) `Store/previewAccountImport` | `Store.sql` (5491, 5492, 5501) | CORE |
| [packages/store/src/store.ts:7197](../../packages/store/src/store.ts#L7197) `Store/previewRecordRuleCurrent` | `SQLite.get` (7197); `SQLite.prepare` (7197, 7200); `Store.sql` (7197, 7200); `SQLite.all` (7200); `Calculations.context` (7206, 7222) | CORE |
| [packages/store/src/store.ts:9997](../../packages/store/src/store.ts#L9997) `Store/previewRow` | `Store.row` (9997) | CORE |
| [packages/store/src/store.ts:6595](../../packages/store/src/store.ts#L6595) `Store/privilegeSets` | `Store.sql` (6595) | CORE |
| [packages/store/src/store.ts:3151](../../packages/store/src/store.ts#L3151) `Store/pruneAudit` | `Store.sql` (3151, 3154, 3159, 3161, 3169, 3174, 3176); `SQLite.get` (3159, 3172, 3176); `SQLite.prepare` (3159, 3169, 3176) | CORE |
| [packages/store/src/store.ts:8877](../../packages/store/src/store.ts#L8877) `Store/purgeOrphanContainers` | `Store.sql` (8877, 8881, 8890, 8893, 8894, 8899, 8900, 8902, 8902); `Store.orphanContainerReport` (8885); `SQLite.get` (8890); `SQLite.prepare` (8890, 8893, 8894) | CORE |
| [packages/store/src/store.ts:12076](../../packages/store/src/store.ts#L12076) `Store/query` | `SQLite.iterate` (12076) | CORE |
| [packages/store/src/store.ts:12116](../../packages/store/src/store.ts#L12116) `Store/queryWithOriginsCurrent` | `SQLite.iterate` (12116); `SQLite.all` (12125, 12128); `SQLite.prepare` (12125, 12128) | CORE |
| [packages/store/src/store.ts:11865](../../packages/store/src/store.ts#L11865) `Store/readOnlyChecked` | `SQLite.prepare` (11865, 11869, 11878, 11883); `SQLite.all` (11869, 11878, 11883) | CORE |
| [packages/store/src/store.ts:3947](../../packages/store/src/store.ts#L3947) `Store/recompute` | `SQLite.prepare` (3947, 3951); `Store.sql` (3947, 3951); `SQLite.iterate` (3951); `Calculations.computeStoredStyled` (3952); `Calculations.value` (3952) | CORE |
| [packages/store/src/store.ts:2928](../../packages/store/src/store.ts#L2928) `Store/recordAsOf` | `SQLite.get` (2928, 2930); `SQLite.prepare` (2928, 2930, 2932, 2933); `Store.sql` (2928, 2930, 2932, 2933); `SQLite.all` (2932, 2933) | CORE |
| [packages/store/src/store.ts:2622](../../packages/store/src/store.ts#L2622) `Store/recordCount` | `SQLite.get` (2622); `SQLite.prepare` (2622); `Store.sql` (2622) | CORE |
| [packages/store/src/store.ts:1798](../../packages/store/src/store.ts#L1798) `Store/recordedFormat` | `Store.sql` (1798) | CORE |
| [packages/store/src/store.ts:3006](../../packages/store/src/store.ts#L3006) `Store/recordLife` | `SQLite.all` (3006); `SQLite.prepare` (3006); `Store.sql` (3006) | CORE |
| [packages/store/src/store.ts:6040](../../packages/store/src/store.ts#L6040) `Store/recordObjectUse` | `Store.sql` (6040) | CORE |
| [packages/store/src/store.ts:10526](../../packages/store/src/store.ts#L10526) `Store/recordViewable` | `Store.row` (10526) | GATED-STORE |
| [packages/store/src/store.ts:9181](../../packages/store/src/store.ts#L9181) `Store/recoverContainersOut` | `SQLite.prepare` (9181); `Store.sql` (9181); `SQLite.get` (9184) | CORE |
| [packages/store/src/store.ts:1901](../../packages/store/src/store.ts#L1901) `Store/recoverPendingExternalFiles` | `Store.sql` (1901, 1903, 1927, 1929); `SQLite.prepare` (1903); `SQLite.get` (1914) | CORE |
| [packages/store/src/store.ts:6538](../../packages/store/src/store.ts#L6538) `Store/recoveryCodesRemaining` | `SQLite.get` (6538); `SQLite.prepare` (6538); `Store.sql` (6538) | CORE |
| [packages/store/src/store.ts:11905](../../packages/store/src/store.ts#L11905) `Store/refreshDecimalSqlViews` | `SQLite.get` (11905); `SQLite.prepare` (11905) | CORE |
| [packages/store/src/store.ts:4121](../../packages/store/src/store.ts#L4121) `Store/refuseLookalikeAccount` | `SQLite.all` (4121); `SQLite.prepare` (4121); `Store.sql` (4121) | CORE |
| [packages/store/src/store.ts:6404](../../packages/store/src/store.ts#L6404) `Store/registerPasskey` | `SQLite.prepare` (6404); `Store.sql` (6404) | CORE |
| [packages/store/src/store.ts:4302](../../packages/store/src/store.ts#L4302) `Store/rejectPending` | `SQLite.get` (4302); `SQLite.prepare` (4302, 4304); `Store.sql` (4302, 4304) | CORE |
| [packages/store/src/store.ts:9752](../../packages/store/src/store.ts#L9752) `Store/relatedCriteria` | `SQLite.iterate` (9752); `SQLite.prepare` (9752); `Store.sql` (9752) | CORE |
| [packages/store/src/store.ts:8015](../../packages/store/src/store.ts#L8015) `Store/relatedValues` | `Calculations.globalValue` (8015); `Calculations.unstoredValue` (8017) | CORE |
| [packages/store/src/store.ts:6417](../../packages/store/src/store.ts#L6417) `Store/removePasskey` | `SQLite.get` (6417); `SQLite.prepare` (6417, 6418); `Store.sql` (6417, 6418) | CORE |
| [packages/store/src/store.ts:9580](../../packages/store/src/store.ts#L9580) `Store/reportFind` | `Store.query` (9580, 9582, 9583); `Store.recordCount` (9585) | CORE |
| [packages/store/src/store.ts:11031](../../packages/store/src/store.ts#L11031) `Store/restoreDeletedRowLocked` | `SQLite.get` (11031, 11036); `SQLite.prepare` (11031, 11032, 11036, 11046); `Store.sql` (11031, 11032, 11036, 11046); `SQLite.all` (11032) | CORE |
| [packages/store/src/store.ts:2964](../../packages/store/src/store.ts#L2964) `Store/restoreRecord` | `Store.recordAsOf` (2964); `SQLite.get` (2968); `SQLite.prepare` (2968, 2973, 2982, 2993); `Store.sql` (2968, 2973, 2982, 2993) | CORE |
| [packages/store/src/store.ts:3022](../../packages/store/src/store.ts#L3022) `Store/revertAuditEntry` | `SQLite.get` (3022); `SQLite.prepare` (3022); `Store.sql` (3022); `Store.canViewRecord` (3024); `Store.auditLog` (3027) | CORE |
| [packages/store/src/store.ts:6165](../../packages/store/src/store.ts#L6165) `Store/revokeApiToken` | `SQLite.prepare` (6165); `Store.sql` (6165) | CORE |
| [packages/store/src/store.ts:5688](../../packages/store/src/store.ts#L5688) `Store/revokeSignInCredentials` | `SQLite.prepare` (5688, 5689, 5690); `Store.sql` (5688, 5689, 5690) | AUTH |
| [packages/store/src/store.ts:10016](../../packages/store/src/store.ts#L10016) `Store/row` | `SQLite.get` (10016) | CORE |
| [packages/store/src/store.ts:12009](../../packages/store/src/store.ts#L12009) `Store/rowsOf` | `SQLite.iterate` (12009, 12018) | CORE |
| [packages/store/src/store.ts:7002](../../packages/store/src/store.ts#L7002) `Store/ruleOutcome` | `Calculations.context` (7002) | CORE |
| [packages/store/src/store.ts:9860](../../packages/store/src/store.ts#L9860) `Store/runningSummaryValues` | `Store.viewableIds` (9860); `rowsById` (9862); `Calculations.value` (9873, 9879); `Calculations.related` (9890) | GATED-STORE |
| [packages/store/src/store.ts:6624](../../packages/store/src/store.ts#L6624) `Store/savePrivilegeSet` | `SQLite.prepare` (6624, 6632); `Store.sql` (6624, 6632) | AUTH |
| [packages/store/src/store.ts:4552](../../packages/store/src/store.ts#L4552) `Store/saveScriptTest` | `SQLite.prepare` (4552); `Store.sql` (4552) | CORE |
| [packages/store/src/store.ts:7162](../../packages/store/src/store.ts#L7162) `Store/scopedTableSql` | `Store.viewableIds` (7162); `SQLite.all` (7165); `SQLite.prepare` (7165); `Store.sql` (7165) | GATED-STORE |
| [packages/store/src/store.ts:3684](../../packages/store/src/store.ts#L3684) `Store/scriptHistory` | `SQLite.all` (3684); `SQLite.prepare` (3684); `Store.sql` (3684) | CORE |
| [packages/store/src/store.ts:1877](../../packages/store/src/store.ts#L1877) `Store/securityChainHeadAudit` | `SQLite.get` (1877); `SQLite.prepare` (1877); `Store.sql` (1877) | CORE |
| [packages/store/src/store.ts:3357](../../packages/store/src/store.ts#L3357) `Store/securityChange` | `Store.sql` (3357, 3359); `SQLite.prepare` (3359) | CORE |
| [packages/store/src/store.ts:2887](../../packages/store/src/store.ts#L2887) `Store/securityEvents` | `Store.auditLog` (2887) | CORE |
| [packages/store/src/store.ts:5889](../../packages/store/src/store.ts#L5889) `Store/securityToken` | `SQLite.get` (5889); `SQLite.prepare` (5889); `Store.sql` (5889) | CORE |
| [packages/store/src/store.ts:12039](../../packages/store/src/store.ts#L12039) `Store/selectHeldCurrent` | `Store.sql` (12039, 12041, 12044); `SQLite.prepare` (12041) | CORE |
| [packages/store/src/store.ts:11337](../../packages/store/src/store.ts#L11337) `Store/selectIdsCurrent` | `Store.selectIds` (11337); `SQLite.all` (11344); `SQLite.prepare` (11344); `Store.sql` (11344) | GATED-STORE |
| [packages/store/src/store.ts:12029](../../packages/store/src/store.ts#L12029) `Store/selectIn` | `Store.select` (12029) | CORE |
| [packages/store/src/store.ts:2288](../../packages/store/src/store.ts#L2288) `Store/selfContainedCopy` | `Store.sql` (2288); `SQLite.all` (2293); `SQLite.prepare` (2293, 2295, 2296, 2297) | CORE |
| [packages/store/src/store.ts:5667](../../packages/store/src/store.ts#L5667) `Store/setAccountActive` | `SQLite.prepare` (5667, 5675, 5676); `Store.sql` (5667, 5675, 5676) | AUTH |
| [packages/store/src/store.ts:5908](../../packages/store/src/store.ts#L5908) `Store/setAccountLocalOnly` | `SQLite.prepare` (5908); `Store.sql` (5908) | CORE |
| [packages/store/src/store.ts:6780](../../packages/store/src/store.ts#L6780) `Store/setAccountPrivilegeSet` | `SQLite.get` (6780); `SQLite.prepare` (6780, 6783, 6787); `Store.sql` (6780, 6783, 6787) | AUTH |
| [packages/store/src/store.ts:5917](../../packages/store/src/store.ts#L5917) `Store/setAccountRequire2fa` | `SQLite.prepare` (5917); `Store.sql` (5917) | CORE |
| [packages/store/src/store.ts:4154](../../packages/store/src/store.ts#L4154) `Store/setAgentAccount` | `SQLite.get` (4154); `SQLite.prepare` (4154, 4160); `Store.sql` (4154, 4160) | CORE |
| [packages/store/src/store.ts:4631](../../packages/store/src/store.ts#L4631) `Store/setAiAllowed` | `SQLite.prepare` (4631); `Store.sql` (4631) | CORE |
| [packages/store/src/store.ts:4742](../../packages/store/src/store.ts#L4742) `Store/setAiPolicy` | `SQLite.prepare` (4742); `Store.sql` (4742) | CORE |
| [packages/store/src/store.ts:7428](../../packages/store/src/store.ts#L7428) `Store/setAllowBlankPasswordFromLan` | `SQLite.prepare` (7428); `Store.sql` (7428) | CORE |
| [packages/store/src/store.ts:3128](../../packages/store/src/store.ts#L3128) `Store/setAuditSettings` | `SQLite.prepare` (3128); `Store.sql` (3128) | CORE |
| [packages/store/src/store.ts:9410](../../packages/store/src/store.ts#L9410) `Store/setContainer` | `Store.sql` (9410); `Store.row` (9416) | CORE |
| [packages/store/src/store.ts:4101](../../packages/store/src/store.ts#L4101) `Store/setExternalAccount` | `SQLite.get` (4101); `SQLite.prepare` (4101, 4106); `Store.sql` (4101, 4106) | CORE |
| [packages/store/src/store.ts:5365](../../packages/store/src/store.ts#L5365) `Store/setMustChangePassword` | `SQLite.prepare` (5365); `Store.sql` (5365) | CORE |
| [packages/store/src/store.ts:4355](../../packages/store/src/store.ts#L4355) `Store/setPasswordOnly` | `SQLite.all` (4355); `SQLite.prepare` (4355, 4361, 4376, 4382, 4391, 4398, 4399, 4400); `Store.sql` (4355, 4361, 4376, 4382, 4391, 4398, 4399, 4400); `SQLite.get` (4361, 4376) | AUTH |
| [packages/store/src/store.ts:4493](../../packages/store/src/store.ts#L4493) `Store/setPasswordPolicy` | `SQLite.prepare` (4493); `Store.sql` (4493) | CORE |
| [packages/store/src/store.ts:1766](../../packages/store/src/store.ts#L1766) `Store/setPersistentData` | `SQLite.prepare` (1766, 1770); `Store.sql` (1766, 1770) | CORE |
| [packages/store/src/store.ts:4762](../../packages/store/src/store.ts#L4762) `Store/setPiiIsolation` | `SQLite.prepare` (4762); `Store.sql` (4762) | CORE |
| [packages/store/src/store.ts:4529](../../packages/store/src/store.ts#L4529) `Store/setRequireTotpForFullAccess` | `SQLite.prepare` (4529); `Store.sql` (4529) | CORE |
| [packages/store/src/store.ts:4674](../../packages/store/src/store.ts#L4674) `Store/setScriptNetwork` | `SQLite.prepare` (4674); `Store.sql` (4674) | CORE |
| [packages/store/src/store.ts:4731](../../packages/store/src/store.ts#L4731) `Store/setSqlRequiresFmxdbc` | `SQLite.prepare` (4731); `Store.sql` (4731) | CORE |
| [packages/store/src/store.ts:10447](../../packages/store/src/store.ts#L10447) `Store/setStoredCalcValues` | `SQLite.prepare` (10447, 10448); `Store.sql` (10447, 10448); `SQLite.get` (10452) | CORE |
| [packages/store/src/store.ts:5842](../../packages/store/src/store.ts#L5842) `Store/settleSignIns` | `SQLite.all` (5842, 5848); `SQLite.prepare` (5842, 5848, 5854, 5858, 5860); `Store.sql` (5842, 5848, 5854, 5858, 5860) | AUTH |
| [packages/store/src/store.ts:9513](../../packages/store/src/store.ts#L9513) `Store/setUserPref` | `Store.sql` (9513, 9514, 9515); `SQLite.prepare` (9514, 9515) | CORE |
| [packages/store/src/store.ts:4715](../../packages/store/src/store.ts#L4715) `Store/setWebViewerHosts` | `SQLite.prepare` (4715); `Store.sql` (4715) | CORE |
| [packages/store/src/store.ts:2419](../../packages/store/src/store.ts#L2419) `Store/shareResults` | `Store.sql` (2419) | CORE |
| [packages/store/src/store.ts:1828](../../packages/store/src/store.ts#L1828) `Store/shipWal` | `Store.sql` (1828) | CORE |
| [packages/store/src/store.ts:5789](../../packages/store/src/store.ts#L5789) `Store/signInBase` | `SQLite.get` (5789); `SQLite.prepare` (5789); `Store.sql` (5789) | AUTH |
| [packages/store/src/store.ts:5791](../../packages/store/src/store.ts#L5791) `Store/signInBase/identity` | `SQLite.get` (5791); `SQLite.prepare` (5791); `Store.sql` (5791) | AUTH |
| [packages/store/src/store.ts:5778](../../packages/store/src/store.ts#L5778) `Store/signInMark` | `SQLite.prepare` (5778); `Store.sql` (5778) | AUTH |
| [packages/store/src/store.ts:9679](../../packages/store/src/store.ts#L9679) `Store/sortedPage` | `SQLite.iterate` (9679); `SQLite.prepare` (9679, 9694); `Store.sql` (9679, 9694); `SQLite.all` (9694) | CORE |
| [packages/store/src/store.ts:11639](../../packages/store/src/store.ts#L11639) `Store/sortIdsCurrentProgress` | `Store.sortIds` (11639); `Store.sortIdsProgress` (11639); `SQLite.all` (11652); `SQLite.prepare` (11652, 11731); `Store.sql` (11652, 11731); `Store.valueListItems` (11660); `rowsById` (11672); `Calculations.globalValue` (11675); `Calculations.unstoredValue` (11676); `Calculations.related` (11682); `SQLite.iterate` (11731) | GATED-STORE |
| [packages/store/src/store.ts:11819](../../packages/store/src/store.ts#L11819) `Store/storedFileId` | `SQLite.get` (11819); `SQLite.prepare` (11819) | CORE |
| [packages/store/src/store.ts:9822](../../packages/store/src/store.ts#L9822) `Store/summaries` | `Calculations.wholeTable` (9822); `Calculations.collect` (9842, 9847) | CORE |
| [packages/store/src/store.ts:9838](../../packages/store/src/store.ts#L9838) `Store/summaries/recs` | `SQLite.iterate` (9838); `SQLite.prepare` (9838); `Store.sql` (9838) | CORE |
| [packages/store/src/store.ts:6355](../../packages/store/src/store.ts#L6355) `Store/takeWebauthnChallenge` | `SQLite.get` (6355); `SQLite.prepare` (6355, 6359); `Store.sql` (6355, 6359) | CORE |
| [packages/store/src/store.ts:7619](../../packages/store/src/store.ts#L7619) `Store/themes` | `SQLite.get` (7619) | CORE |
| [packages/store/src/store.ts:9566](../../packages/store/src/store.ts#L9566) `Store/timeFind` | `Store.query` (9566) | CORE |
| [packages/store/src/store.ts:7954](../../packages/store/src/store.ts#L7954) `Store/toRecord` | `Calculations.value` (7954, 7964); `Calculations.globalValue` (7958); `Calculations.unstoredStyled` (7963) | CORE |
| [packages/store/src/store.ts:6239](../../packages/store/src/store.ts#L6239) `Store/totpAccounts` | `SQLite.all` (6239); `SQLite.prepare` (6239); `Store.sql` (6239) | CORE |
| [packages/store/src/store.ts:1840](../../packages/store/src/store.ts#L1840) `Store/trial` | `Store.sql` (1840) | CORE |
| [packages/store/src/store.ts:1845](../../packages/store/src/store.ts#L1845) `Store/trial/undo` | `Store.sql` (1845) | CORE |
| [packages/store/src/store.ts:11775](../../packages/store/src/store.ts#L11775) `Store/truncate/run` | `Store.sql` (11775, 11777, 11784, 11786, 11788, 11789); `SQLite.prepare` (11777, 11784); `SQLite.all` (11779) | CORE |
| [packages/store/src/store.ts:4045](../../packages/store/src/store.ts#L4045) `Store/unmigratedAccounts` | `SQLite.all` (4045); `SQLite.prepare` (4045); `Store.sql` (4045) | CORE |
| [packages/store/src/store.ts:5271](../../packages/store/src/store.ts#L5271) `Store/unusedAccess` | `SQLite.get` (5271); `SQLite.prepare` (5271, 5280); `Store.sql` (5271, 5280); `SQLite.all` (5280) | CORE |
| [packages/store/src/store.ts:5319](../../packages/store/src/store.ts#L5319) `Store/unusedObjects` | `SQLite.get` (5319); `SQLite.prepare` (5319, 5322); `Store.sql` (5319, 5322); `SQLite.all` (5322) | CORE |
| [packages/store/src/store.ts:6479](../../packages/store/src/store.ts#L6479) `Store/unusedRecoveryHashes` | `SQLite.all` (6479); `SQLite.prepare` (6479); `Store.sql` (6479) | CORE |
| [packages/store/src/store.ts:5101](../../packages/store/src/store.ts#L5101) `Store/unusualAccess` | `Store.auditLog` (5101, 5167) | CORE |
| [packages/store/src/store.ts:10261](../../packages/store/src/store.ts#L10261) `Store/update` | `Store.row` (10261); `Store.sql` (10292, 10293, 10339, 10342) | CORE |
| [packages/store/src/store.ts:10295](../../packages/store/src/store.ts#L10295) `Store/update/undo` | `Store.sql` (10295) | CORE |
| [packages/store/src/store.ts:10732](../../packages/store/src/store.ts#L10732) `Store/updatePortals` | `Store.row` (10732, 10785); `relatedRows` (10786) | CORE |
| [packages/store/src/store.ts:10742](../../packages/store/src/store.ts#L10742) `Store/updatePortals/portal/related` | `relatedIdList` (10742) | CORE |
| [packages/store/src/store.ts:10714](../../packages/store/src/store.ts#L10714) `Store/updateRelated` | `relatedRows` (10714) | CORE |
| [packages/store/src/store.ts:5357](../../packages/store/src/store.ts#L5357) `Store/usageCounting` | `SQLite.get` (5357); `SQLite.prepare` (5357); `Store.sql` (5357) | CORE |
| [packages/store/src/store.ts:9504](../../packages/store/src/store.ts#L9504) `Store/userPrefs` | `SQLite.all` (9504); `SQLite.prepare` (9504); `Store.sql` (9504) | CORE |
| [packages/store/src/store.ts:8376](../../packages/store/src/store.ts#L8376) `Store/valueListItemsCurrent` | `Store.valueListItems` (8376); `Store.get` (8390); `relatedRows` (8391); `Store.row` (8391); `SQLite.iterate` (8393); `SQLite.prepare` (8393); `Store.sql` (8393); `Calculations.related` (8403); `Calculations.value` (8407, 8408) | GATED-STORE |
| [packages/store/src/store.ts:10946](../../packages/store/src/store.ts#L10946) `Store/vaultHeld` | `SQLite.get` (10946); `SQLite.prepare` (10946); `Store.sql` (10946) | CORE |
| [packages/store/src/store.ts:6439](../../packages/store/src/store.ts#L6439) `Store/verifyPasskeyCredential` | `SQLite.get` (6439); `SQLite.prepare` (6439, 6451); `Store.sql` (6439, 6451) | CORE |
| [packages/store/src/store.ts:6268](../../packages/store/src/store.ts#L6268) `Store/verifyTotp` | `SQLite.get` (6268); `SQLite.prepare` (6268, 6275); `Store.sql` (6268, 6275) | CORE |
| [packages/store/src/store.ts:2555](../../packages/store/src/store.ts#L2555) `Store/versionNumber` | `SQLite.get` (2555); `SQLite.prepare` (2555); `Store.sql` (2555) | CORE |
| [packages/store/src/store.ts:2430](../../packages/store/src/store.ts#L2430) `Store/versionTriggers` | `SQLite.get` (2430); `SQLite.prepare` (2430, 2435, 2436); `Store.sql` (2430, 2435, 2436, 2453, 2455, 2456, 2458); `SQLite.all` (2435, 2436) | CORE |
| [packages/store/src/store.ts:2398](../../packages/store/src/store.ts#L2398) `Store/warmSummariesCurrent` | `Calculations.wholeTable` (2398) | CORE |
| [packages/store/src/store.ts:4697](../../packages/store/src/store.ts#L4697) `Store/webViewerChecked` | `SQLite.get` (4697); `SQLite.prepare` (4697); `Store.sql` (4697) | CORE |
| [packages/store/src/store.ts:2134](../../packages/store/src/store.ts#L2134) `Store/withWriteTransaction` | `Store.sql` (2134, 2147, 2154, 2159, 2159) | CORE |
| [packages/store/src/store.ts:7883](../../packages/store/src/store.ts#L7883) `Store/wordIndex` | `Store.sql` (7883, 7891, 7896); `Store.recordCount` (7895); `SQLite.get` (7896); `SQLite.prepare` (7896) | CORE |
| [packages/store/src/store.ts:9074](../../packages/store/src/store.ts#L9074) `Store/writeExternalFile` | `Store.evaluateEach` (9074); `SQLite.prepare` (9097); `Store.sql` (9097) | CORE |
| [packages/store/src/store.ts:9098](../../packages/store/src/store.ts#L9098) `Store/writeExternalFile/taken` | `SQLite.get` (9098) | CORE |
| [packages/store/src/store.ts:6098](../../packages/store/src/store.ts#L6098) `Store/writeObjectUseRows` | `SQLite.prepare` (6098, 6099, 6104); `Store.sql` (6098, 6099, 6104) | CORE |
| [packages/store/src/store.ts:2610](../../packages/store/src/store.ts#L2610) `Store/writeToken` | `SQLite.get` (2610); `SQLite.prepare` (2610); `Store.sql` (2610) | CORE |
| [packages/store/src/store.ts:6070](../../packages/store/src/store.ts#L6070) `Store/writeUsage` | `Store.sql` (6070, 6071, 6073, 6077, 6079) | CORE |
| [packages/store/src/store.ts:6086](../../packages/store/src/store.ts#L6086) `Store/writeUsageRows` | `SQLite.prepare` (6086, 6087, 6093); `Store.sql` (6086, 6087, 6093) | CORE |
| [packages/store/src/sync-apply.ts:352](../../packages/store/src/sync-apply.ts#L352) `applySyncRun` | `Store.container` (352, 353, 383); `Store.containerInfo` (369); `SQLite.prepare` (464, 730, 762, 786); `Store.sql` (464, 730, 762, 786); `SQLite.get` (762, 786) | OPERATOR |
| [packages/store/src/sync-apply.ts:676](../../packages/store/src/sync-apply.ts#L676) `applySyncRun/containerChanges` | `Store.container` (676) | OPERATOR |
| [packages/store/src/sync-apply.ts:485](../../packages/store/src/sync-apply.ts#L485) `applySyncRun/fail` | `SQLite.get` (485); `SQLite.prepare` (485); `Store.sql` (485) | OPERATOR |
| [packages/store/src/sync-apply.ts:825](../../packages/store/src/sync-apply.ts#L825) `applySyncRun/filesToSend` | `SQLite.all` (825); `SQLite.prepare` (825); `Store.sql` (825); `Store.containerInfo` (836); `Store.container` (841) | OPERATOR |
| [packages/store/src/sync-apply.ts:580](../../packages/store/src/sync-apply.ts#L580) `applySyncRun/pullWouldChange` | `Store.container` (580, 584) | OPERATOR |
| [packages/store/src/sync-apply.ts:185](../../packages/store/src/sync-apply.ts#L185) `atomically` | `Store.sql` (185, 188, 191, 192) | OPERATOR |
| [packages/store/src/sync-apply.ts:216](../../packages/store/src/sync-apply.ts#L216) `clearContainersPending` | `SQLite.prepare` (216); `Store.sql` (216) | OPERATOR |
| [packages/store/src/sync-apply.ts:206](../../packages/store/src/sync-apply.ts#L206) `dropMap` | `SQLite.prepare` (206, 207); `Store.sql` (206, 207) | OPERATOR |
| [packages/store/src/sync-apply.ts:178](../../packages/store/src/sync-apply.ts#L178) `finishRow` | `SQLite.prepare` (178); `Store.sql` (178) | OPERATOR |
| [packages/store/src/sync-apply.ts:242](../../packages/store/src/sync-apply.ts#L242) `heldReason` | `SQLite.get` (242); `SQLite.prepare` (242); `Store.sql` (242) | OPERATOR |
| [packages/store/src/sync-apply.ts:247](../../packages/store/src/sync-apply.ts#L247) `holdTable` | `SQLite.prepare` (247); `Store.sql` (247) | OPERATOR |
| [packages/store/src/sync-apply.ts:171](../../packages/store/src/sync-apply.ts#L171) `logRow` | `SQLite.prepare` (171); `Store.sql` (171) | OPERATOR |
| [packages/store/src/sync-apply.ts:211](../../packages/store/src/sync-apply.ts#L211) `markContainersPending` | `SQLite.prepare` (211); `Store.sql` (211) | OPERATOR |
| [packages/store/src/sync-apply.ts:231](../../packages/store/src/sync-apply.ts#L231) `owedContainers` | `SQLite.all` (231); `SQLite.prepare` (231); `Store.sql` (231) | OPERATOR |
| [packages/store/src/sync-apply.ts:268](../../packages/store/src/sync-apply.ts#L268) `readSyncLog` | `SQLite.get` (268); `SQLite.prepare` (268, 270, 271); `Store.sql` (268, 270, 271); `SQLite.all` (270, 271) | OPERATOR |
| [packages/store/src/sync-apply.ts:312](../../packages/store/src/sync-apply.ts#L312) `recordsIn` | `SQLite.get` (312); `SQLite.prepare` (312); `Store.sql` (312) | OPERATOR |
| [packages/store/src/sync-apply.ts:259](../../packages/store/src/sync-apply.ts#L259) `releaseHeldTables` | `SQLite.prepare` (259); `Store.sql` (259) | OPERATOR |
| [packages/store/src/sync-apply.ts:198](../../packages/store/src/sync-apply.ts#L198) `upsertMap` | `SQLite.prepare` (198); `Store.sql` (198) | OPERATOR |
| [packages/store/src/sync.ts:200](../../packages/store/src/sync.ts#L200) `ensureSyncTables` | `Store.sql` (200, 214, 224, 232) | OPERATOR |
| [packages/store/src/sync.ts:273](../../packages/store/src/sync.ts#L273) `lastPullTimestamp` | `SQLite.get` (273); `SQLite.prepare` (273); `Store.sql` (273) | OPERATOR |
| [packages/store/src/sync.ts:45](../../packages/store/src/sync.ts#L45) `openForPlanning` | `SQLite.get` (45, 46); `SQLite.prepare` (45, 46) | OPERATOR |
| [packages/store/src/sync.ts:292](../../packages/store/src/sync.ts#L292) `readLocalRecords` | `SQLite.all` (292); `SQLite.prepare` (292); `Store.sql` (292) | OPERATOR |
| [packages/store/src/sync.ts:252](../../packages/store/src/sync.ts#L252) `readSyncMap` | `SQLite.all` (252); `SQLite.prepare` (252); `Store.sql` (252) | OPERATOR |
| [packages/store/src/sync.ts:190](../../packages/store/src/sync.ts#L190) `tableExists` | `SQLite.get` (190); `SQLite.prepare` (190); `Store.sql` (190) | OPERATOR |
| [packages/store/src/text-styles.ts:22](../../packages/store/src/text-styles.ts#L22) `ensureTextStyles` | `SQLite.all` (22, 26); `SQLite.prepare` (22, 26) | CORE |
| [packages/store/src/text-styles.ts:81](../../packages/store/src/text-styles.ts#L81) `TextStyles/has` | `SQLite.all` (81) | CORE |
| [packages/store/src/text-styles.ts:94](../../packages/store/src/text-styles.ts#L94) `TextStyles/rows` | `SQLite.all` (94) | CORE |
| [packages/store/src/text-styles.ts:73](../../packages/store/src/text-styles.ts#L73) `TextStyles/st` | `SQLite.prepare` (73) | CORE |
| [packages/store/src/trace.ts:159](../../packages/store/src/trace.ts#L159) `traceDatabase/get` | `SQLite.prepare` (159) | CORE |
| [packages/store/src/words.ts:155](../../packages/store/src/words.ts#L155) `WordIndexes/dropAll` | `SQLite.all` (155); `SQLite.prepare` (155) | CORE |
| [packages/store/src/words.ts:78](../../packages/store/src/words.ts#L78) `WordIndexes/ensure` | `SQLite.prepare` (78, 82); `SQLite.get` (81); `SQLite.all` (82) | CORE |
| [packages/store/src/words.ts:85](../../packages/store/src/words.ts#L85) `WordIndexes/ensure/covers` | `SQLite.get` (85, 89); `SQLite.all` (86); `SQLite.prepare` (86, 89) | CORE |
| [packages/store/src/store.ts:1094](../../packages/store/src/store.ts#L1094) `Store/referenceSecurity` | `SQLite.get` (1094); `SQLite.prepare` (1094); `Store.sql` (1094) | Internal File Access authorization reads only its version and file-local security metadata; public management reads require Full Access. No record values are read. |
| [packages/store/src/store.ts:1113](../../packages/store/src/store.ts#L1113) `Store/writeFileAccess` | `SQLite.prepare` (1113); `Store.sql` (1113) | Writes only File Access security metadata inside securityChange; public mutations require Full Access, while hosted rename observation changes display names without granting access. |
| [packages/store/src/store.ts:1155](../../packages/store/src/store.ts#L1155) `Store/resetFileAccessId` | `SQLite.prepare` (1155, 1157); `Store.sql` (1155, 1157) | Full Access checked inside the security transaction before writing the new reference identity and retaining the stable token-scope identity; no record data is read. |
| [packages/store/src/ess/driver.ts:129](../../packages/store/src/ess/driver.ts#L129) `SqliteDriver/query` | `SQLite.prepare` (129); `SQLite.iterate` (134) | CORE |
| [packages/store/src/ess/driver.ts:148](../../packages/store/src/ess/driver.ts#L148) `SqliteDriver/tables` | `SQLite.all` (148); `SQLite.prepare` (148) | CORE |
| [packages/store/src/ess/driver.ts:153](../../packages/store/src/ess/driver.ts#L153) `SqliteDriver/columns` | `SQLite.all` (153); `SQLite.prepare` (153) | CORE |
| [packages/store/src/ess/mirror.ts:82](../../packages/store/src/ess/mirror.ts#L82) `refreshMirror` | `SQLite.all` (82); `SQLite.prepare` (82, 84, 85, 86, 102, 103) | CORE |
| [packages/store/src/store.ts:1318](../../packages/store/src/store.ts#L1318) `Store/refreshShadow` | `Store.sql` (1318) | CORE |
| [packages/store/src/store.ts:1263](../../packages/store/src/store.ts#L1263) `Store/flushEssWrites` | `Store.sql` (1263, 1264, 1272, 1274); `SQLite.prepare` (1264, 1272, 1274) | CORE |
| [packages/store/src/store.ts:1203](../../packages/store/src/store.ts#L1203) `Store/loadShadow` | `Store.sql` (1203, 1205) | CORE |
<!-- end generated read-gate inventory -->
