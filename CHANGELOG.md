# Changelog

## 1.0.2

- Move maintained source into `src/`, with a separate class file for each card.
- Share configuration/editor infrastructure, lifecycle, styling, and icon assets.
- Preserve the existing card types, configuration keys, markup, and controls,
  including the legacy energy and battery card types.
- Generate the two manual-installation resources and the single HACS bundle.
- Check source syntax, reproducible artifacts, and card compatibility in tests.

## 1.0.1

- Handle empty configuration safely and observe only configured entities.
- Clean up timers and ignore stale asynchronous results after configuration
  changes or disconnection.
- Add lifecycle tests and automated validation/release workflows.

## 1.0.0

- Publish the initial HACS bundle and configurable standalone cards.
