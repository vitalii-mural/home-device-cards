# Source and distribution

These are Home Assistant frontend custom elements, not backend integrations.
They consume configured entities and call existing HA services.

## Compatibility boundary

The public contract includes custom element names, configuration keys, visual
editor values, service calls, sizing, rendered markup, and CSS cascade order.
Preserve these when reorganizing source. A different framework is not required
to implement the [custom-card contract](https://contributors.home-assistant.io/frontend/custom-ui/card/).

## Build

Maintained sources live under `src/`. `build.mjs` declares their evaluation order
and generates the two root scripts for manual installation plus the single
HACS bundle under `dist/`.

| Location | Responsibility |
| --- | --- |
| `src/dashboard/defaults.js` | Shared configuration defaults |
| `src/dashboard/styles.js` | Legacy dashboard styles |
| `src/dashboard/card.js` | Base lifecycle, state updates, rendering and commands |
| `src/dashboard/register.js` | Base custom-element registration |
| `src/device-cards/styles.js` | Standalone card styles and responsive overrides |
| `src/device-cards/icons.js` | Icon assets and their license notices |
| `src/device-cards/config.js` | Card metadata, fields and default configuration |
| `src/device-cards/base.js` | Shared lifecycle, visual editor, configuration validation, graph mounting and rendering |
| `src/cards/boiler-card.js` | Boiler markup, controls, and updates |
| `src/cards/air-card.js` | Air-conditioner markup, controls, and updates |
| `src/cards/room-card.js` | Room sensor markup and updates |
| `src/cards/socket-card.js` | Socket markup, service action, and updates |
| `src/cards/river-card.js` | EcoFlow markup, details action, graphs, and updates |
| `src/cards/energy-card.js` | Energy overview markup and updates |
| `src/cards/battery-card.js` | Battery card markup and updates |

The distribution stays self-contained: no runtime package downloads, extra
resource registration, or server configuration is required. Existing manual
installations keep their two script names and load order.

When moving a declaration, preserve its scope and initialization timing. In
particular, card subclasses must register after the base element is available.
Do not sort CSS rules or deduplicate overrides without a separate regression
test: source order is part of their behavior.

## Changes

1. Edit the relevant maintained source, never the generated outputs.
2. Add a focused regression check for a behavior change.
3. Build and run the automated and browser checks in [TESTING.md](TESTING.md).
4. Review and commit the source and generated artifacts together.
5. Publish a new version and update HA through HACS.

The structural extraction preserves the legacy implementation. Shared render
helpers, repeated styles, and localization can be improved in subsequent
focused changes; they are not silently rewritten as part of a file move.
