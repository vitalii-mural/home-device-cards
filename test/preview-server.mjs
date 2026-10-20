import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

// Serve only the fixture and built bundle, bound to this computer.
const files = new Map([
  ['/', ['preview.html', 'text/html']],
  ['/preview.html', ['preview.html', 'text/html']],
  ['/preview-frame.html', ['preview-frame.html', 'text/html']],
  ['/dist/home-device-cards.js', ['../dist/home-device-cards.js', 'text/javascript']],
]);

createServer(async (request, response) => {
  const file = files.get(new URL(request.url, 'http://localhost').pathname);
  if (!file || request.method !== 'GET') {
    response.writeHead(404).end();
    return;
  }
  try {
    const body = await readFile(new URL(file[0], import.meta.url));
    response.writeHead(200, {
      'Content-Type': `${file[1]}; charset=utf-8`,
      'Cache-Control': 'no-store',
    }).end(body);
  } catch {
    response.writeHead(500).end('Run npm run build first.');
  }
}).listen(8769, '127.0.0.1', () => {
  console.log('Card preview: http://127.0.0.1:8769');
});
