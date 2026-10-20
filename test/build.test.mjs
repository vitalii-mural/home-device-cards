import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';
import { buildArtifacts, SOURCE_FILES } from '../build.mjs';

test('every maintained source file parses independently', async () => {
  for (const file of [...SOURCE_FILES.dashboard, ...SOURCE_FILES.deviceCards]) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.doesNotThrow(() => new vm.Script(source, { filename: file }), file);
  }
});

test('generated root scripts and HACS bundle match a deterministic source build', async () => {
  const first = await buildArtifacts();
  const second = await buildArtifacts();
  assert.deepEqual(first, second);
  assert.equal(await readFile(new URL('../home-dashboard.js', import.meta.url), 'utf8'), first.dashboard);
  assert.equal(await readFile(new URL('../home-device-cards.js', import.meta.url), 'utf8'), first.deviceCards);
  assert.equal(await readFile(new URL('../dist/home-device-cards.js', import.meta.url), 'utf8'), first.bundle);
  assert.ok(first.bundle.indexOf('const HOME_DASHBOARD_DEFAULTS') < first.bundle.indexOf('const HOME_DASHBOARD_STYLE'));
  assert.ok(first.bundle.indexOf('class HomeDashboard') < first.bundle.indexOf("customElements.whenDefined('home-dashboard')"));
  assert.ok(first.deviceCards.indexOf('HOME_DEVICE_CARD_STYLE') < first.deviceCards.indexOf('HOME_DEVICE_CARD_DEFAULTS'));
});
