## 1.0.9

- Refresh the standalone AC card every ten seconds while the AC is on and its browser tab is visible; stop on hide, power-off, or disconnect.
- Remember the last observed AC operating mode in the browser and highlight it while the AC is off.

## 1.0.8

- Preserve the air conditioner's previous operating mode when turning it on from the power button.

## 1.0.7

- Let the TV remote card fill the width assigned by the Home Assistant dashboard.

## 1.0.6

- Add a compact standalone Android TV remote card with editable remote and optional media-player entities.

## 1.0.5

- Automatically resolve Midea Local Memo U, sterilization and heating-time entities from the selected water heater's entity-registry device identity.
- Keep manual entity bindings in a collapsed Advanced section of the boiler editor.
- Remove the standalone boiler's fixed desktop minimum height.
# Changelog

## 1.0.4

- Use each standalone card's rendered width for compact and desktop layouts.
- Render the boiler and air cards directly from their own templates while preserving their current markup and controls.
- Recognize EcoFlow online state from either a sensor (`online`) or binary sensor (`on`).
- Report closer card-size estimates for compact room and socket cards.
- Add Chromium layout regression checks to local tests and CI.

## 1.0.3

- Remove the unused `home-energy-details-card`, its editor configuration and registration.
- Preserve the appearance and behavior of all remaining cards.

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
