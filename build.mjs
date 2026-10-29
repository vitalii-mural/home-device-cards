import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SOURCE_FILES = Object.freeze({
  dashboard: Object.freeze([
    'src/dashboard/defaults.js',
    'src/dashboard/styles.js',
    'src/dashboard/card.js',
    'src/dashboard/register.js',
  ]),
  deviceCards: Object.freeze([
    'src/device-cards/styles.js',
    'src/device-cards/icons.js',
    'src/device-cards/config.js',
    'src/device-cards/base.js',
    'src/cards/boiler-card.js',
    'src/cards/air-card.js',
    'src/cards/sensor-cards.js',
    'src/cards/room-card.js',
    'src/cards/socket-card.js',
    'src/cards/river-card.js',
    'src/cards/energy-card.js',
    'src/cards/battery-card.js',
    'src/cards/tv-card.js',
    'src/device-cards/register.js',
  ]),
});

const readSource = async file =>
  (await readFile(new URL(`./${file}`, import.meta.url), 'utf8')).replace(/\r\n?/g, '\n');

export async function buildArtifacts() {
  const [{ version }, iconLicense, dashboardSources, deviceCardSources] = await Promise.all([
    readSource('package.json').then(JSON.parse),
    readSource('licenses/lucide-LICENSE'),
    Promise.all(SOURCE_FILES.dashboard.map(readSource)),
    Promise.all(SOURCE_FILES.deviceCards.map(readSource)),
  ]);
  const dashboard = dashboardSources.join('');
  const deviceCards = `customElements.whenDefined('home-dashboard').then(() => {\n${deviceCardSources.join('')}\n});\n`;
  const license = iconLicense.replace(/\r\n?/g, '\n');

  return {
    dashboard,
    deviceCards,
    bundle: `// Home Device Cards v${version} — bundled base and standalone cards.\n/* Lucide icon license:\n${license}\n*/\n${dashboard}\n;\n${deviceCards}`,
  };
}

export async function build() {
  const artifacts = await buildArtifacts();
  await mkdir(new URL('./dist/', import.meta.url), { recursive: true });
  await Promise.all([
    writeFile(new URL('./home-dashboard.js', import.meta.url), artifacts.dashboard),
    writeFile(new URL('./home-device-cards.js', import.meta.url), artifacts.deviceCards),
    writeFile(new URL('./dist/home-device-cards.js', import.meta.url), artifacts.bundle),
  ]);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  await build();
}
