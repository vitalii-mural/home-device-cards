# Testing

Requires Node.js 22 or later. No Home Assistant credentials or running devices
are needed. Run these commands from the repository root.

## Automated checks

```sh
npm ci
npx playwright install chromium
npm run build
npm run check
npm test
git diff --check
```

The build tests verify generated artifacts and deterministic source assembly.
The Node tests cover registration, invalid and empty configuration, explicit
entity selection, EcoFlow online states, disconnect/reconnect cleanup, and
stale service responses. Chromium browser tests check 360 px touch and desktop
widths, a narrow card inside a wide viewport, light/dark styling, offline
recovery, and controls using a stub that rejects device commands. They do not
connect to Home Assistant or call real devices. GitHub Actions runs these checks
on pushes and pull requests. The release workflow also verifies that the version
tag matches `package.json` and that the committed bundle matches the source.

## Browser preview

```sh
npm run preview
```

Open <http://127.0.0.1:8769>. Stop the server with Ctrl+C.
The page displays 360 px and desktop frames using the actual built bundle.
All entity IDs and readings are synthetic. Service calls deliberately fail;
the fixture cannot control real devices.

In each frame:

1. Click **Перевірити** and check that all assertions say **PASS**.
   These cover unit conversion, room updates, preserved card DOM, and overflow.
2. Test **Офлайн**, then **Онлайн**: values and disabled controls should recover.
3. Toggle **Темна тема** and inspect contrast and selected controls.
4. Check keyboard focus, button names, louver expansion, and battery details.
5. Return to **Онлайн** before running the assertions again.

## Home Assistant release verification

After publishing a new version, update the existing installation through HACS
and reload the browser. Check the installed version, existing entity bindings,
visual editor, composed/custom titles, and desktop/mobile layout. No HA restart
is needed for a frontend bundle update.

The fixture does not load Home Assistant's internal editor components.
Their compatibility must be checked in HA; do not claim complete integration
coverage from the local tests alone. Keep device-control smoke tests deliberate.
