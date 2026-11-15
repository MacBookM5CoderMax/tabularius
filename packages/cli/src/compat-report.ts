// tabularius compatibility-report: what one .fmp12 file uses and what Tabularius could not do with it, as a short text a
// person reads and then pastes into an issue by hand. Nothing is sent anywhere by the command.
//
// The report is built from a corpus-scan of the one file, and then narrowed again: every list keeps only names that are
// FileMaker's own vocabulary (function, script step and Get ( ) option names, plug-in ids, layout object kinds) or ids, in a
// fixed shape. A name that is not in that shape is not shown but counted ("names not shown"). Left out on purpose: the file's
// name and path, its content hash, formula shapes, and every table, field, layout, script, account and value list name.
// What is in it is counts (so many tables, so many uses of a step), the fixed error class and code location of a failure, the
// version of FileMaker that last saved the file, and the versions of Tabularius, Node and the operating system.

import { statSync } from 'node:fs';
import { SCRIPT_STEP_NAMES } from '../../fmp12/src/index.ts';
import { MBS_CURL } from '../../calc/src/mbs-curl.ts';
import { MBS_DICT } from '../../calc/src/mbs-dict.ts';
import { MBS_JS } from '../../calc/src/mbs-js.ts';
import { MBS_JSON } from '../../calc/src/mbs-json.ts';
import { MBS_LIST } from '../../calc/src/mbs-list.ts';
import { MBS_MATH } from '../../calc/src/mbs-math.ts';
import { MBS_QUICKLIST } from '../../calc/src/mbs-quicklist.ts';
import { MBS_REGEX } from '../../calc/src/mbs-regex.ts';
import { MBS_TEXT } from '../../calc/src/mbs-text.ts';
import { MBS_XML } from '../../calc/src/mbs-xml.ts';
import { scanInChild, type FileScan } from './corpus-scan.ts';

type Tally = Record<string, number>;

export const COMPAT_REPORT_TOOL = 'tabularius compatibility-report';
/** Where a person files the report: an issue form in the project's repository. */
export const COMPAT_REPORT_ISSUE_URL = 'https://github.com/MacBookM5CoderMax/OpenSourceFilemaker/issues/new?template=compatibility_report.md';

/** The counts a report may carry; each is a number of things, never a name. */
const COUNT_KEYS = [
  'tables', 'fields', 'calculationFields', 'summaryFields', 'containerFields', 'tableOccurrences', 'relationships', 'layouts', 'scripts',
  'scriptSteps', 'valueLists', 'customFunctions', 'customFunctionCalls', 'accounts', 'privilegeSets', 'dataSources', 'customMenus',
  'formulas', 'conditionalFormats', 'hideConditions',
] as const;

const STEP_NAMES = new Set(SCRIPT_STEP_NAMES);

/**
 * The MBS function names Tabularius has built in (lower case, as it keeps them). The scan reads an MBS name from the first
 * string in the call, which is the file's own text, so only a name in these tables is shown. One that is not in them is
 * shown only as "<namespace>.(other)" when its namespace (the part before the dot) is one of these tables', and otherwise
 * counted without being shown: a lookalike name cannot be told from MBS's own by its shape.
 */
const MBS_KNOWN: ReadonlySet<string> = new Set([MBS_CURL, MBS_DICT, MBS_JS, MBS_JSON, MBS_LIST, MBS_MATH, MBS_QUICKLIST, MBS_REGEX, MBS_TEXT, MBS_XML].flatMap((t) => Object.keys(t)));
const MBS_NAMESPACES: ReadonlySet<string> = new Set([...MBS_KNOWN].map((k) => k.split('.')[0]));

/** The shape each kind of name must have to be shown. Anything else is counted, not named. */
const SHAPES = {
  function: /^[A-Za-z][A-Za-z0-9]{0,40}$/,
  get: /^[A-Za-z][A-Za-z0-9]{0,40}$/,
  plugin: /^[A-Za-z0-9]{4}:\d{1,5}$/,
  unknownFunction: /^[0-9a-f]{1,8}$/,
  unknownGet: /^[0-9a-f]{1,8}$/,
  unknownStep: /^\d{1,5}$/,
  layoutObject: /^[a-z][a-z0-9-]{0,24}(:[a-z][a-z0-9-]{0,24})?$/,
  trigger: /^(?:file|layout|object):[A-Za-z0-9]{1,40}$/,
} as const;

/** What FileMaker writes into a file's header as the version that saved it ("Pro 12.0"): one of its product words and a version. A header is the file's own text, so any other word is not shown. */
const SAVED_BY = /^(?:Pro|Server|Go|Advanced|Pro Advanced|Runtime|Cloud|WebDirect) \d{1,3}(?:\.\d{1,3}){0,3}[a-z]?$/;
const SAVED_ON = /^\d{2}[A-Z]{3}\d{2}$/;
/** The fixed class and code location `errorClass` makes ("TypeError @ fmp12/src/file.ts:120"), or one of the scan's fixed process messages. */
const ERROR_CLASS = /^(?:(?:Range|Type)?Error(?: @ [\w-]+\/src\/[\w.-]+:\d+)?|process (?:could not start|cleanup failed|out of memory|exited with code -?\d+))$/;

export interface Entry {
  name: string;
  uses: number;
}

export interface CompatReport {
  tool: typeof COMPAT_REPORT_TOOL;
  version: 1;
  /** The day it was made, not the time. */
  date: string;
  environment: { tabularius: string; node: string; os: string; arch: string };
  file: {
    /** A range, not the exact size. */
    size: string;
    status: FileScan['status'];
    /** Where it stopped, as a fixed class and code location; never a message from the file. */
    error?: string;
    /** The FileMaker version that last saved it, as the file's header says. */
    savedBy?: string;
    savedOn?: string;
  };
  conversion?: { ok: boolean; seconds: number; error?: string };
  timing?: { seconds: number; stageReached: string; peakMemoryMB: number };
  counts: Tally;
  /** Things Tabularius does not run or name yet: the first thing a maintainer reads. */
  notYet: { functions: Entry[]; getOptions: Entry[]; scriptSteps: Entry[] };
  plugins: Entry[];
  mbs: Entry[];
  functions: Entry[];
  getOptions: Entry[];
  scriptSteps: Entry[];
  layoutObjects: Entry[];
  triggers: Entry[];
  /** How many uses were left out of the lists above because their name was not in the shape of a FileMaker name or id. */
  namesNotShown: number;
}

export interface CompatEnvironment {
  tabularius: string;
  node: string;
  os: string;
  arch: string;
  date: string;
}

/** The size as a range: enough to tell a small file from a large one, not enough to tell which file. */
export function sizeRange(bytes: number): string {
  const mb = bytes / 1e6;
  if (mb < 1) return 'under 1 MB';
  if (mb < 10) return '1 to 10 MB';
  if (mb < 100) return '10 to 100 MB';
  if (mb < 1000) return '100 MB to 1 GB';
  if (mb < 10000) return '1 to 10 GB';
  return 'over 10 GB';
}

const LIST_LIMIT = 150;

/** Narrows a tally to the names that fit `shape` (and `allowed`, when given), most-used first; the rest are only counted. */
function entries(tally: Tally | undefined, shape: RegExp, hidden: { n: number }, allowed?: ReadonlySet<string>): Entry[] {
  const out: Entry[] = [];
  for (const [name, uses] of Object.entries(tally ?? {})) {
    const n = Number.isFinite(uses) && uses > 0 ? Math.floor(uses) : 0;
    if (shape.test(name) && (!allowed || allowed.has(name))) out.push({ name, uses: n });
    else hidden.n += n;
  }
  out.sort((a, b) => b.uses - a.uses || a.name.localeCompare(b.name));
  return out.slice(0, LIST_LIMIT);
}

/** MBS function names: those Tabularius knows by name, then the others by namespace only (see MBS_KNOWN). */
function mbsEntries(tally: Tally | undefined, hidden: { n: number }): Entry[] {
  const merged: Tally = {};
  for (const [name, uses] of Object.entries(tally ?? {})) {
    const n = Number.isFinite(uses) && uses > 0 ? Math.floor(uses) : 0;
    const key = name.toLowerCase();
    const space = key.split('.')[0];
    if (MBS_KNOWN.has(key)) merged[key] = (merged[key] ?? 0) + n;
    else if (key.includes('.') && MBS_NAMESPACES.has(space)) merged[`${space}.(other)`] = (merged[`${space}.(other)`] ?? 0) + n;
    else hidden.n += n;
  }
  return Object.entries(merged).map(([name, uses]) => ({ name, uses })).sort((a, b) => b.uses - a.uses || a.name.localeCompare(b.name)).slice(0, LIST_LIMIT);
}

/** Builds the report from one file's scan, keeping only what is safe to share. */
export function buildCompatReport(scan: FileScan, env: CompatEnvironment, sizeBytes: number): CompatReport {
  const hidden = { n: 0 };
  const counts: Tally = {};
  for (const k of COUNT_KEYS) {
    const v = scan.counts?.[k];
    if (typeof v === 'number' && Number.isFinite(v)) counts[k] = Math.floor(v);
  }
  const stageMs = Object.values(scan.progress?.stageMs ?? {}).reduce((n: number, ms) => n + (typeof ms === 'number' ? ms : 0), 0);
  const stage = scan.progress?.stage;
  const report: CompatReport = {
    tool: COMPAT_REPORT_TOOL,
    version: 1,
    date: /^\d{4}-\d{2}-\d{2}$/.test(env.date) ? env.date : 'unknown',
    environment: {
      tabularius: String(env.tabularius).slice(0, 40).replace(/[^\w.+-]/g, '?'),
      node: String(env.node).slice(0, 20).replace(/[^\w.+-]/g, '?'),
      os: String(env.os).slice(0, 20).replace(/[^\w.+-]/g, '?'),
      arch: String(env.arch).slice(0, 20).replace(/[^\w.+-]/g, '?'),
    },
    file: {
      size: sizeRange(sizeBytes),
      status: scan.status,
      ...(scan.error ? { error: ERROR_CLASS.test(scan.error) ? scan.error : 'Error' } : {}),
      ...(scan.creator && SAVED_BY.test(scan.creator) ? { savedBy: scan.creator } : {}),
      ...(scan.versionDate && SAVED_ON.test(scan.versionDate) ? { savedOn: scan.versionDate } : {}),
    },
    ...(scan.conversion
      ? { conversion: {
        ok: scan.conversion.ok,
        seconds: Math.round(Number(scan.conversion.seconds) * 10) / 10 || 0,
        ...(scan.conversion.error ? { error: ERROR_CLASS.test(scan.conversion.error) ? scan.conversion.error : 'Error' } : {}),
      } }
      : {}),
    ...(scan.progress
      ? { timing: {
        seconds: Math.round(stageMs / 100) / 10,
        stageReached: stage && ['read blocks', 'schema', 'tables', 'records', 'calcs', 'layouts', 'scripts'].includes(stage) ? stage : 'unknown',
        peakMemoryMB: Math.round((scan.progress.peakHeapBytes || 0) / 1e6),
      } }
      : {}),
    counts,
    notYet: {
      functions: entries(scan.unknownFunctions, SHAPES.unknownFunction, hidden),
      getOptions: entries(scan.unknownGet, SHAPES.unknownGet, hidden),
      scriptSteps: entries(scan.unknownSteps, SHAPES.unknownStep, hidden),
    },
    plugins: entries(scan.plugins, SHAPES.plugin, hidden),
    mbs: mbsEntries(scan.mbs, hidden),
    functions: entries(scan.functions, SHAPES.function, hidden),
    getOptions: entries(scan.getOptions, SHAPES.get, hidden),
    scriptSteps: entries(scan.steps, /^.{1,60}$/, hidden, STEP_NAMES),
    layoutObjects: entries(scan.layoutObjects, SHAPES.layoutObject, hidden),
    triggers: entries(scan.triggers, SHAPES.trigger, hidden),
    namesNotShown: 0,
  };
  report.namesNotShown = hidden.n;
  return report;
}

const cell = (s: string | number) => String(s).replace(/[|\r\n`]/g, '?');

function list(title: string, rows: Entry[], head: string, empty?: string): string[] {
  if (!rows.length) return empty ? [`**${title}:** ${empty}`, ''] : [];
  return [`**${title}**`, '', `| ${head} | Uses |`, '| --- | ---: |', ...rows.map((r) => `| ${cell(r.name)} | ${r.uses} |`), ''];
}

/** The report as Markdown, ready to paste into an issue. */
export function compatReportMarkdown(r: CompatReport): string {
  const f = r.file;
  const lines: string[] = [
    '## Tabularius compatibility report',
    '',
    `Made by \`${r.tool}\` on ${r.date}. It holds counts and FileMaker's own names and ids only: no file name, no field, table, layout or script names, no records, no formulas.`,
    '',
    '### Result',
    '',
    '| | |',
    '| --- | --- |',
    `| Tabularius | ${cell(r.environment.tabularius)} on Node ${cell(r.environment.node)}, ${cell(r.environment.os)} ${cell(r.environment.arch)} |`,
    `| File size | ${f.size} |`,
    `| Saved by | ${f.savedBy ? `FileMaker ${cell(f.savedBy)}${f.savedOn ? ` (${cell(f.savedOn)})` : ''}` : 'not recognised'} |`,
    `| Read | ${f.status === 'ok' ? 'yes' : f.status === 'encrypted' ? 'no: the file is encrypted (the command does not ask for a password)' : f.status === 'timeout' ? 'no: it ran out of time' : `no: stopped with ${cell(f.error ?? 'an error')}`} |`,
  ];
  if (r.conversion) lines.push(`| Converted | ${r.conversion.ok ? `yes, in ${r.conversion.seconds} s` : `no: ${cell(r.conversion.error ?? 'an error')}`} |`);
  else if (f.status === 'ok') lines.push('| Converted | not tried (--no-convert) |');
  if (r.timing) lines.push(`| Time and memory | ${r.timing.seconds} s, ${r.timing.peakMemoryMB} MB at most; got as far as "${r.timing.stageReached}" |`);
  lines.push('');
  const counted = Object.entries(r.counts);
  if (counted.length) lines.push('**Size of the solution:** ' + counted.map(([k, n]) => `${n} ${k.replace(/[A-Z]/g, (c) => ' ' + c.toLowerCase())}`).join(', '), '');
  const { functions, getOptions, scriptSteps } = r.notYet;
  if (f.status === 'ok') {
    lines.push('### What Tabularius does not know yet', '');
    if (!functions.length && !getOptions.length && !scriptSteps.length) lines.push('Nothing: Tabularius recognises every function, Get ( ) option and script step in the file. Recognising one is not the same as every option of it working: [script-steps-support.md](https://github.com/MacBookM5CoderMax/OpenSourceFilemaker/blob/main/docs/script-steps-support.md) lists which steps are partial.', '');
    else {
      lines.push(...list('Calculation functions (by id)', functions, 'Id'), ...list('Get ( ) options (by id)', getOptions, 'Id'), ...list('Script steps (by id)', scriptSteps, 'Step id'));
    }
    lines.push('### What the file uses', '', ...list('Plug-in functions (plug-in id and function number)', r.plugins, 'Call', 'none'));
    if (r.mbs.length) lines.push(...list('MBS functions', r.mbs, 'Function'));
    lines.push(...list('Script steps', r.scriptSteps, 'Step'), ...list('Calculation functions', r.functions, 'Function'), ...list('Get ( ) options', r.getOptions, 'Option'));
    lines.push(...list('Layout objects', r.layoutObjects, 'Kind'), ...list('Triggers', r.triggers, 'Trigger'));
    if (r.namesNotShown) lines.push(`${r.namesNotShown} uses of names that are not FileMaker's own were counted but not shown.`, '');
  }
  lines.push('<details><summary>The same report as JSON</summary>', '', '```json', JSON.stringify(r, null, 2), '```', '', '</details>', '');
  return lines.join('\n');
}

/** Scans one file in its own process and builds its report. The file is only read; nothing is written and nothing leaves the computer. */
export async function compatibilityReport(path: string, opts: { entry: string; convert: boolean; timeoutSeconds: number; env: Omit<CompatEnvironment, 'date'> }): Promise<CompatReport> {
  let st;
  try { st = statSync(path); } catch { throw new Error(`compatibility-report: ${path} doesn't exist`); }
  if (st.isDirectory()) throw new Error('compatibility-report: give one .fmp12 file, not a folder. To count what many files use, run corpus-scan on the folder');
  if (!st.isFile()) throw new Error(`compatibility-report: ${path} is not a file`);
  const scan = await scanInChild(opts.entry, path, opts.convert, opts.timeoutSeconds * 1000);
  return buildCompatReport(scan, { ...opts.env, date: new Date().toISOString().slice(0, 10) }, st.size);
}
