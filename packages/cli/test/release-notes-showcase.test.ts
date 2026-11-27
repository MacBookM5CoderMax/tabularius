// The release notes for the current version say what the showcase has; they are checked against the showcase guide so a
// page that is renamed or dropped there cannot stay in the notes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');
const read = (path: string): string => readFileSync(join(root, path), 'utf8');

test('the release notes name each showcase page the showcase guide lists, and the programs for this version', () => {
  const { version } = JSON.parse(read('package.json')) as { version: string };
  const notes = read(`.github/release-notes/v${version}.md`);
  const guide = read('docs/showcase-crm.md');
  const line = notes.split('\n').find((l) => l.startsWith('- **A CRM showcase.**'));
  assert.ok(line, 'the notes have a CRM showcase bullet');
  const pages = /five modern HTML pages \(([^)]+)\)/.exec(line)?.[1].split(', ');
  assert.equal(pages?.length, 5, 'the bullet lists five pages');
  for (const page of pages!) assert.ok(guide.includes(`**${page}** (modern layout)`), `the showcase guide describes the page "${page}"`);
  assert.ok(notes.includes(`tabularius-${version}-linux-x64`), 'the download table names this version');
});

test('the changelog has a section for this version, and 0.2.0 still says the Admin API records security events', () => {
  const { version } = JSON.parse(read('package.json')) as { version: string };
  const changelog = read('CHANGELOG.md');
  assert.ok(changelog.includes(`\n## ${version}\n`), 'the changelog has a heading for this version');
  const section = changelog.slice(changelog.indexOf(`## ${version}`)).split('\n## ')[0];
  assert.ok(section.trim().length > `## ${version}`.length, 'the section for this version says something');
  const earlier = changelog.slice(changelog.indexOf('## 0.2.0')).split('\n## ')[0];
  for (const text of [earlier, read('.github/release-notes/v0.2.0.md')]) assert.match(text, /through the Admin API/);
});
