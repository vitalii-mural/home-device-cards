# Working on these cards

Keep the existing card types, configuration keys, entity bindings, and visual
design compatible. Configuration belongs to the user's dashboard, never to
source-code defaults. Do not embed server addresses, tokens, or private IDs.

## Card contract

Follow the Home Assistant custom-card contract:
https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/

- Validate supplied configuration in `setConfig`; handle an unconfigured editor
  preview and unavailable entities without throwing incidental runtime errors.
- Observe only configured entities. Never control an unrelated device discovered
  by scanning the entire state registry.
- Update affected DOM nodes on state changes; keep graphs and user focus intact.
- Clear timers and invalidate asynchronous work on disconnect. Reconnection must
  restore a usable card.
- Keep accessible button names, focus styles, selected/busy states, and touch
  targets. Verify 360 px and desktop widths, light and dark themes.
- Keep entity-name selectors and visual editing compatible.
- Treat Home Assistant internal UI elements as version-sensitive dependencies.

## Checks and releases

Install the locked Node dependencies and Chromium browser before running the
checks. The test suite uses a synthetic fixture and never controls real devices.

```sh
npm ci
npx playwright install chromium
npm run build
npm run check
npm test
npm run test:browser
git diff --check
```

The automated browser checks cover narrow touch and desktop layouts, a narrow
card inside a wide viewport, dark mode, EcoFlow offline recovery, and synthetic
control dispatch. Use [TESTING.md](TESTING.md) for the preview and manual
checklist as well.
Commit the generated `dist/home-device-cards.js` alongside its sources.
CI checks that the committed bundle matches the source.

Update `package.json`, push the commit, then push a matching `vX.Y.Z` tag.
The release workflow validates the code and publishes the HACS bundle.
Do not modify a published tag to ship a fix: release a new version.

## Follow-up work

The sources are separated by responsibility under `src/`; the root scripts
remain generated compatibility entry points for manual installations.
Keep the build order explicit and do not edit generated files directly.

The source still contains duplicated legacy dashboard styles and rendering
helpers. Refactor them incrementally behind regression tests.
Extract Ukrainian labels into a localization layer before adding languages.
Avoid a whole-codebase rewrite just to change framework.
