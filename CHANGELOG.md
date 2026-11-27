# Changelog

What changed in each version of Tabularius, newest first. Each area lists its newest changes; work on reading FileMaker files is counted, not listed.

## 0.3.0

The full notes are in the release notes for v0.3.0 (`.github/release-notes/v0.3.0.md`) and in `docs/upgrading.md`.

### Changes

- **Fixed: conversion could skip records.** A file whose record index held an empty block could be converted with a table's records and containers missing. If you converted a file with an earlier version, compare record counts and convert again if they differ.
- **Fixed: related finds.** A find on a related table now follows the same access rules as reading through the relationship, and returns every match instead of stopping at 10,000.
- **Outside SQL sources.** Shadow tables with write-through. PostgreSQL can be added in Connections; MySQL, SQL Server and Oracle Connections binding is coming, and the Connections path has not been run against a real server.
- **QR codes** can be read from images in scripts and calculations.
- **`fmp://` links** work in the web client, and the OnWindowTransaction trigger runs (set it in design mode).
- **XML publishing** has opt-in script phases and record writes that are off by default.
- **`tabularius compatibility-report`** gives a counts-only report of one file.
- **Security.** File access authorization across hosted files, single-use OAuth `fmDataSource` grants, no control characters in account names, SQL statements refused after a password reset, and more redaction in diagnostics.
- **Command-line tools** stop on more unknown options and missing values.

### Known problems

- In a multi-file transaction, a failure in a later file can leave earlier files committed.
- `Min` and `Max` of text values can give a different answer when a blank argument is added.
- After converting a file again, undoing an older change to a container field can point at the wrong or a missing file.
- Converting a file with missing or very large contents in a repeating container field can leave a dangling reference.
- The Windows program is built only if it passes its check.

## 0.2.0

The full notes, with what to check before upgrading, are in the release notes for v0.2.0 (`.github/release-notes/v0.2.0.md`) and in `docs/upgrading.md`.

### Showcase

- A CRM showcase: `tabularius demo --starter crm-showcase`, with `--full` for the sign-ins, a read-only SQL port and an AI token, and `--ai` for the demo's assistant. Classic layouts, five modern HTML pages that share one design (headline tiles, a quota ring, a funnel, a leaderboard and a dark mode, and an Account timeline with an account picker), scripts, an automation and privilege sets that show a rep only their own deals. `docs/showcase-crm.md` walks through it.

### Security and accounts

- Credential files, the hosted-file record, command-line export folders and write-back files, plug-in packages, backup sets and logs, the outbox, inbound-hook call logs and standby copies are read and written only when they are what they should be: no planted link, hard link or pipe, the right owner and a private mode.
- Restores, ended sessions, server-wide settings, admin passkeys, schedules, inbound hooks, webhooks, backup destination changes and changes made through the Admin API are recorded in the security log or the Admin log, with the way in and address.
- A failed notification send logs the address's domain, not the address.
- A standby refuses an unsafe primary address, never follows a redirect, and needs `--allow-plain-http` for a plain `http://` primary on another computer; `TABULARIUS_ALLOW_PLAIN_HTTP` no longer lifts that refusal.
- Agent write proposals respect the caller's privileges and the ceiling of the token they came from.
- The OAuth approval cookie keeps its `__Host-` name and `Secure` attribute behind a trusted HTTPS proxy.
- Invalid numeric server and store settings stop `tabularius serve` and name the setting.

### Calculations, SQL and data

- SQL: fractional seconds from `EXTRACT(SECOND ...)`, parameters in `OFFSET` and `FETCH FIRST`, exact 64-bit integers, date arithmetic checked against years 0001 to 9999, `INTERSECT`, `EXCEPT` and `DISTINCT`.
- Calculations keep exact digits for `Ceiling`, `Floor`, `Factorial`, `Combination`, exact square roots and large exponent literals; `Proper` keeps combining marks; years below 1000 are written with four digits.
- Number fields keep non-decimal text instead of changing it; Excel round trips keep negative and long durations; field indexes sort by their own index language.

### Web client and admin console

- Names on form controls in Design mode and the admin console, a darker light palette, and plain sentences for a lost connection or a reply that is not JSON.
- Empty, error and failed-start messages are announced to screen readers, relationship lines in Design mode can be reached from the keyboard, and Show All Records, Show Omitted Only and Perform Quick Find keep the found set's sort.
- The fault log hides folders in a path, including Windows long paths.
- Redo works after Undo removes a record's only uncommitted change.

### Command line and migration

- The command-line tools stop on an option they do not know or one with no value, and on a port, limit or address that is not valid, instead of running without it; `report --json` prints one JSON document for any number of files.
- Answers from the Data API, OData, SCIM, Admin API and MCP routes carry `no-store` and `nosniff`; `migrate-fms --save` will not replace a file, and its read of FileMaker Server's Admin API is capped at 16 MiB and two minutes a call.

### Cluster and server

- Cluster messages are checked at both ends, and a worker that cannot open a file reports it to the leader for the admin status and console.
- Backups make a full copy when a symlink makes the previous set unsafe, and ignore symlinked sets and logs.

## 0.1.0

### Web client

- Web client: an alternative, data-first client at /next/ (#2)
- Web client: the address bar follows the layout, mode, view and record, and Back and Forward restore them (#11)
- Web client: screen readers hear record position, found counts, sorts, saves and mode changes (#13)
- Web client: a startup bundle budget, and the chart and dashboard view load only when drawn (#30)
- Web client: modules are kept by the browser, keyed by content hash (#181)

### Calculations and scripts

- Scripts: stop writing "?" after a failed calculation; digest auth and script-test fixes (#38)
- Calc: trimming and number checks in the MBS functions run in linear time (#184)
- Calc: JSON functions refuse work and memory a small formula could ask for (#185)
- Scripts: linear-time report masking, bounded PDF cross-references, recorder snapshot budget (#198)

### Build and tests

- Tests: neutral sample account name (#48)
- Tests: build token-shaped sample keys from parts at runtime (#49)
- CI: run macOS on pull requests that touch what fails there; one run per push to main (#116)
- CI: macOS only on main, nightly, by hand or with the macos label (#183)
- CI: gates job, four test shards, and one required check that reports them (#187)

### Other

- README opening names the MIT licence (#1)
- Treat backups as hostile input: signed manifests and checked point-in-time restores (#3)
- Overload: a bounded request gate, a busy screen, and capacity numbers (#4)
- Privileges: automation conditions run as their account; correct privilege-set names (#5)
- Heap gate: collect before refusing a request for memory (#7)
- Add a browser-support self-check page and a no-script message (#8)
- Harden the fmp12 reader against corrupt blocks, varints and deep layouts (#9)
- Observability robustness: debugger runs end cleanly, WAL checkpoints are handed back, logs and sync console checks are bounded (#10)
- CLI folder claim for encrypt/decrypt, stricter option values, mail attachment permission and private secret errors (#12)
- FileMaker file reader: refuse cut-off formulas and text, infer date order from evidence, compare conversion sources by content (#14)
- Roll back a failed bulk plug-in state change and replay suspended steps once (#15)
- Script transactions: cover every window, honour the Open Transaction options at commit, stop cleanly when a paused debugger run is canceled (#16)
- …and 159 more

185 merged pull requests.
