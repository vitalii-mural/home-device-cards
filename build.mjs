import { mkdir, readFile, writeFile } from 'node:fs/promises';

await mkdir(new URL('./dist/', import.meta.url), { recursive: true });
const { version } = JSON.parse(await readFile(new URL('./package.json', import.meta.url), 'utf8'));
const iconLicense = await readFile(new URL('./licenses/lucide-LICENSE', import.meta.url), 'utf8');
const sources = await Promise.all(
  ['home-dashboard.js', 'home-device-cards.js'].map(name =>
    readFile(new URL(name, import.meta.url), 'utf8'))
);
await writeFile(
  new URL('./dist/home-device-cards.js', import.meta.url),
  `// Home Device Cards v${version} — bundled base and standalone cards.\n/* Lucide icon license:\n${iconLicense}\n*/\n` + sources.join('\n;\n')
);
