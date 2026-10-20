import { mkdir, readFile, writeFile } from 'node:fs/promises';

await mkdir(new URL('./dist/', import.meta.url), { recursive: true });
const sources = await Promise.all(
  ['home-dashboard.js', 'home-device-cards.js'].map(name =>
    readFile(new URL(name, import.meta.url), 'utf8'))
);
await writeFile(
  new URL('./dist/home-device-cards.js', import.meta.url),
  '// Home Device Cards — bundled base and standalone cards.\n' + sources.join('\n;\n')
);
