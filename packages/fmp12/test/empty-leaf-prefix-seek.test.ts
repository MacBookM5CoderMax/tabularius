import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BLOCK_SIZE, encodePathInt, FmpFile, rank } from '../src/file.ts';
import { readRecords } from '../src/records.ts';

function file(paths: (number[] | undefined)[]): Buffer {
  const bytes = Buffer.alloc((2 + paths.length) * BLOCK_SIZE);
  bytes.set([0, 1, 0, 0, 0, 2, 0, 1, 0, 5, 0, 2, 0, 2, 0xc0]);
  bytes.write('HBAM7', 15, 'ascii');
  bytes[521] = 0x1e;
  bytes.writeUInt32BE(1 + paths.length, BLOCK_SIZE + 8);
  bytes.writeUInt16BE(1, BLOCK_SIZE + 12);
  paths.forEach((path, i) => {
    const block = 2 + i;
    if (i > 0) bytes.writeUInt32BE(block - 1, block * BLOCK_SIZE + 4);
    if (i < paths.length - 1) bytes.writeUInt32BE(block + 1, block * BLOCK_SIZE + 8);
    if (path) {
      const payload = path.flatMap((part) => {
        const key = encodePathInt(part);
        return [key.length === 1 ? 0x20 : key.length === 2 ? 0x28 : 0x30, ...key];
      });
      bytes.set([...payload, 1, 1, 0x41 ^ 0x5a], block * BLOCK_SIZE + 20);
    }
  });
  return bytes;
}

function recordIds(f: FmpFile, table: number): number[] {
  return [...readRecords(f, table, new Set([1]))].map((record) => record.id);
}

function assertEveryTable(paths: (number[] | undefined)[]): void {
  const f = new FmpFile(file(paths));
  const tables = [...new Set(paths.flatMap((path) => path ? [path[0]] : []))];
  for (const table of tables) {
    assert.deepEqual(recordIds(f, table), [1], `table ${table}`);
    assert.equal([...f.chunks(undefined, [table, 5])].length, 1, `prefix for table ${table}`);
  }
}

test('record prefixes find every table with no empty leaves', () => {
  assertEveryTable([[129, 5, 1], [130, 5, 1], [131, 5, 1]]);
});

test('record prefixes find every table across an empty interior leaf', () => {
  const paths = [[129, 5, 1], [130, 5, 1], undefined, [131, 5, 1]];
  const f = new FmpFile(file(paths));
  assert.deepEqual([...f.leafOrder()], [2, 3, 4, 5]);
  assert.equal([...f.chunks()].filter(({ path }) => rank(path, [129, 5].map(encodePathInt)) === 0).length, 1);
  assertEveryTable(paths);
});

test('record prefixes find every table across several empty leaves', () => {
  assertEveryTable([[129, 5, 1], [130, 5, 1], undefined, undefined, undefined, [131, 5, 1]]);
});

test('record prefixes find every table with an empty first leaf', () => {
  assertEveryTable([undefined, [129, 5, 1], [130, 5, 1], [131, 5, 1]]);
});

test('record prefixes find every table with an empty last leaf', () => {
  assertEveryTable([[129, 5, 1], [130, 5, 1], [131, 5, 1], undefined]);
});

test('every prefix-seek caller finds its subtree across an empty interior leaf', () => {
  // Records, table containers, image library, fonts, themes, layouts and fields.
  const prefixes = [[129, 5], [129, 31, 5], [31, 5], [25, 5], [6, 5], [4, 5], [129, 3]];
  for (const prefix of prefixes) {
    const paths = [
      [...prefix, 1],
      [prefix[0] + 1, ...prefix.slice(1), 1],
      undefined,
      [prefix[0] + 2, ...prefix.slice(1), 1],
    ];
    const f = new FmpFile(file(paths));
    const expected = [...f.chunks()].filter(({ path }) => rank(path, prefix.map(encodePathInt)) === 0);
    assert.equal(expected.length, 1, `linear scan for ${prefix}`);
    assert.deepEqual([...f.chunks(undefined, prefix)], expected, `prefix ${prefix}`);
  }
});
