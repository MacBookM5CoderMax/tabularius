import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStore, Store } from '../src/index.ts';
import { relatedRows } from '../src/related.ts';
import type { SqlValue } from '../src/find.ts';

function setup(context: TestContext) {
  const dir = mkdtempSync(join(tmpdir(), 'tabularius-related-find-'));
  const path = join(dir, 'Graph.sqlite');
  createStore(path);
  const store = new Store(path);
  context.after(() => { store.close(); rmSync(dir, { recursive: true, force: true }); });
  store.applyDesign([
    ...['Roots', 'Links', 'Edges', 'Leaves'].map((name) => ({ op: 'createTable' as const, name,
      fields: [{ name: 'Input' }, { name: 'Output' }, { name: 'Visible', type: 'number' as const }] })),
    ...[['Roots', 'Links'], ['Links', 'Edges'], ['Edges', 'Leaves']].map(([left, right]) => ({
      op: 'createRelationship' as const, left, right, predicates: [{ left: 'Output', right: 'Input' }],
    })),
  ]);
  return store;
}

const access = { view: true, edit: false, create: false, delete: false };
function reader(store: Store, tables: Record<string, unknown>) {
  store.savePrivilegeSet({ name: 'Reader', records: access, tables,
    layouts: 'viewOnly', valueLists: 'viewOnly', scripts: 'viewOnly', extendedPrivileges: ['fmapp'] });
  store.setPassword('reader', 'pw', 'Reader');
  return store.privileges('reader');
}

function checkForward(store: Store, target: string, expected: number[], privileges?: ReturnType<Store['privileges']>) {
  const occurrenceId = (name: string) => store.schema.tableOccurrences.find((occ) => occ.name === name)!.id;
  const all = store.sql.prepare('SELECT * FROM Roots ORDER BY _fm_record_id').all() as Record<string, SqlValue>[];
  const forward = all.filter((row) => {
    const result = relatedRows(store, occurrenceId('Roots'), row, occurrenceId(target), { privileges })!;
    return result.rows.some((child) => child.Visible === 1 && result.occurrence.store.canViewRecord(result.occurrence.table.name, Number(child._fm_record_id), privileges));
  }).map((row) => Number(row._fm_record_id));
  const criteria = { [`${target}::Visible`]: '1' };
  assert.deepEqual(forward, expected);
  assert.deepEqual(store.findIds('Roots', { query: [criteria], privileges }), forward);
  assert.deepEqual(store.findIds('Roots', { query: [{ ...criteria, omit: 'true' }], privileges }),
    all.map((row) => Number(row._fm_record_id)).filter((id) => !forward.includes(id)));
}

test('reverse candidates respect the direction of multi-line keys and comparisons', (context) => {
  const store = setup(context);
  for (const key of ['a', 'b', 'c', 'z\r\nB', 'a\rc', '']) store.create('Roots', { Output: key });
  for (const [key, visible] of [['B', 1], ['a\rc', 1], ['a', 0]] as const) store.create('Links', { Input: key, Visible: visible });
  const cases = [ ['=', [2, 4]], ['<', [1, 5]], ['≤', [1, 2, 5]], ['>', [2, 3, 4]],
    ['≥', [2, 3, 4]], ['≠', [1, 2, 3, 4, 5]], ['×', [1, 2, 3, 4, 5, 6]] ] as const;
  for (const [operator, expected] of cases) {
    for (const reverse of [false, true]) {
      const name = `Joined${cases.findIndex(([item]) => item === operator)}${Number(reverse)}`;
      const inverse = ({ '<': '>', '≤': '≥', '>': '<', '≥': '≤', '=': '=', '≠': '≠', '×': '×' } as const)[operator];
      store.applyDesign([{ op: 'createOccurrence', name, table: 'Links' }, { op: 'createRelationship',
        left: reverse ? name : 'Roots', right: reverse ? 'Roots' : name,
        predicates: [{ left: reverse ? 'Input' : 'Output', right: reverse ? 'Output' : 'Input', operator: reverse ? inverse : operator }] }]);
      checkForward(store, name, [...expected], store.privileges('Admin'));
    }
  }
});

test('compound keys must reach one visible hit; its incoming match key need not be readable', (context) => {
  const store = setup(context);
  store.applyDesign([{ op: 'createOccurrence', name: 'Pair', table: 'Links' }, { op: 'createRelationship', left: 'Roots', right: 'Pair',
    predicates: [{ left: 'Input', right: 'Input' }, { left: 'Output', right: 'Output' }] }]);
  for (const [input, output] of [['A', '1'], ['A', '2'], ['B', '2'], ['other\rA', '2']]) store.create('Roots', { Input: input, Output: output });
  for (const [input, output] of [['A', '1'], ['B', '2'], ['A', '2']]) store.create('Links', { Input: input, Output: output, Visible: 1 });
  const privileges = reader(store, { Links: { ...access, fields: { Input: 'none' }, view: 'Output = "1" or Input = "B"' } });
  checkForward(store, 'Pair', [1, 3], privileges);
});

test('global and unstored parent keys use session values; other hops still use candidates', (context) => {
  const store = setup(context);
  store.applyDesign([
    { op: 'createField', table: 'Links', name: 'Computed', type: 'text', kind: 'calculation', calculation: 'Lower ( Output )', options: { unstored: true } },
    { op: 'createField', table: 'Links', name: 'Current', options: { global: true } },
  ]);
  for (const key of ['YES', 'NO']) {
    store.create('Roots', { Output: key });
    store.create('Links', { Input: key, Output: key });
  }
  store.create('Edges', { Input: 'yes', Visible: 1 });
  store.setGlobalField('Links::Current', 'yes');
  const privileges = reader(store, {});
  for (const field of ['Computed', 'Current']) {
    const name = `By${field}`;
    store.applyDesign([{ op: 'createOccurrence', table: 'Edges', name }, { op: 'createRelationship', left: 'Links', right: name,
      predicates: [{ left: field, right: 'Input' }] }]);
    const occurrenceId = (to: string) => store.schema.tableOccurrences.find((occ) => occ.name === to)!.id;
    for (const pv of [undefined, privileges]) {
      const roots = store.sql.prepare('SELECT * FROM Roots').all() as Record<string, SqlValue>[];
      const forward = roots.filter((row) => relatedRows(store, occurrenceId('Roots'), row, occurrenceId('Links'), { privileges: pv })!.rows
        .some((link) => relatedRows(store, occurrenceId('Links'), link, occurrenceId(name), { privileges: pv })!.rows.some((edge) => edge.Visible === 1)))
        .map((row) => Number(row._fm_record_id));
      assert.deepEqual(forward, field === 'Computed' ? [1] : [1, 2]);
      const criteria = { [`${name}::Visible`]: '1' };
      assert.deepEqual(store.findIds('Roots', { query: [criteria], privileges: pv }), forward);
      assert.deepEqual(store.findIds('Roots', { query: [{ ...criteria, omit: 'true' }], privileges: pv }), field === 'Computed' ? [2] : []);
    }
  }
  store.setGlobalField('Links::Current', 'no');
  assert.deepEqual(store.findIds('Roots', { query: [{ 'ByCurrent::Visible': '1' }], privileges }), []);
  store.sql.exec(`WITH RECURSIVE seq(n) AS (VALUES(1) UNION ALL SELECT n+1 FROM seq WHERE n < 1000)
    INSERT INTO Roots (Output) SELECT n FROM seq`);
  const checks = context.mock.method(store, 'canViewRecord', store.canViewRecord);
  assert.deepEqual(store.findIds('Roots', { query: [{ 'ByComputed::Visible': '1' }], privileges }), [1]);
  assert.equal(checks.mock.calls.filter((call) => call.arguments[0] === 'Roots').length, 1);
});

test('a hit supplies the stored destination key, not its global or calculated display value', (context) => {
  const store = setup(context);
  store.applyDesign([
    { op: 'createField', table: 'Links', name: 'Computed', kind: 'calculation', type: 'text', calculation: 'Lower ( Input )', options: { unstored: true } },
    { op: 'createField', table: 'Links', name: 'Current', options: { global: true } },
  ]);
  store.create('Roots', { Output: 'stored' });
  store.create('Roots', { Output: 'display' });
  store.create('Links', { Input: 'display', Visible: 1 });
  store.setGlobalField('Links::Current', 'display');
  store.sql.exec("UPDATE Links SET Computed = 'stored', Current = 'stored'");
  for (const field of ['Computed', 'Current']) {
    const name = `To${field}`;
    store.applyDesign([{ op: 'createOccurrence', table: 'Links', name }, { op: 'createRelationship', left: 'Roots', right: name,
      predicates: [{ left: 'Output', right: field }] }]);
    checkForward(store, name, [1], store.privileges('Admin'));
  }
});

for (const restriction of ['table', 'calculation', 'source key', 'masked key']) {
  test(`related find and omit agree with forward traversal under a ${restriction} restriction`, (context) => {
    const store = setup(context);
    const roots = [1, 2, 3].map((key) => {
      store.create('Links', { Input: String(key), Output: String(key), Visible: Number(key !== 1) });
      store.create('Edges', { Input: String(key), Output: 'end', Visible: Number(key !== 2) });
      return store.create('Roots', { Output: String(key) }).recordId;
    });
    store.create('Leaves', { Input: 'end' });
    const criteria = { 'Leaves::Input': 'end' };
    assert.deepEqual(store.findIds('Roots', { query: [criteria] }), roots);
    const rule = { ...access, view: 'Visible = 1' };
    const privileges = reader(store, restriction === 'table' ? { Links: { ...access, view: false } }
      : restriction === 'calculation' ? { Links: rule, Edges: rule }
        : { Edges: { ...access, fields: { Output: restriction === 'masked key' ? 'masked' : 'none' } } });
    const occurrenceId = (name: string) => store.schema.tableOccurrences.find((occ) => occ.name === name)!.id;
    const forward = roots.filter((id) => {
      const row = store.sql.prepare('SELECT * FROM Roots WHERE _fm_record_id = ?').get(id);
      return relatedRows(store, occurrenceId('Roots'), row as Record<string, string | number>, occurrenceId('Leaves'), { privileges })!.count > 0;
    });
    assert.deepEqual(forward, restriction === 'calculation' ? roots.slice(2) : []);
    assert.deepEqual(store.find('Roots', { query: [criteria], privileges }).records.map((record) => record.recordId), forward);
    assert.deepEqual(store.findIds('Roots', { query: [{ ...criteria, omit: 'true' }], privileges }), roots.filter((id) => !forward.includes(id)));
  });
}

test('related finds keep all matching parents and intermediate records beyond a portal page', (context) => {
  const store = setup(context);
  const count = 10050;
  store.sql.exec(`WITH RECURSIVE seq(n) AS (VALUES(1) UNION ALL SELECT n+1 FROM seq WHERE n < ${count})
    INSERT INTO Links (Input, Output) SELECT n, 'end' FROM seq;
    INSERT INTO Roots (Output) SELECT Input FROM Links; INSERT INTO Edges (Input) VALUES ('end')`);
  const query = [{ 'Edges::Input': 'end' }];
  for (const privileges of [undefined, reader(store, {})]) {
    for (const layout of ['Links', 'Roots']) {
      const ids = store.findIds(layout, { query, privileges });
      assert.equal(ids.length, count, layout);
      assert.equal(ids.at(-1), count);
    }
  }
});

test('sparse related find checks candidate parents, not every parent', (context) => {
  const store = setup(context);
  store.sql.exec(`WITH RECURSIVE seq(n) AS (VALUES(1) UNION ALL SELECT n+1 FROM seq WHERE n < 100000)
    INSERT INTO Roots (Output) SELECT n FROM seq;
    INSERT INTO Links (Input, Visible) SELECT Output, _fm_record_id = 10050 FROM Roots WHERE _fm_record_id <= 10050`);
  const privileges = store.privileges('Admin');
  const queries = [[{ 'Links::Visible': '1' }], [{ 'Links::Visible': '>=0' }]];
  const checks = context.mock.method(store, 'canViewRecord', store.canViewRecord);
  for (const [index, query] of queries.entries()) {
    const expected = index ? 10050 : 1;
    const ids = store.findIds('Roots', { query, privileges });
    assert.equal(ids.length, expected);
    assert.equal(ids.at(-1), 10050);
    assert.ok(checks.mock.callCount() <= expected, `checked ${checks.mock.callCount()} records for ${expected} parents`);
    checks.mock.resetCalls();
  }
  store.sql.exec("UPDATE Roots SET Output = 'other' || char(13) || '10050' WHERE _fm_record_id = 100000");
  assert.deepEqual(store.findIds('Roots', { query: queries[0], privileges }), [10050, 100000]);
  assert.equal(checks.mock.callCount(), 2);
});
