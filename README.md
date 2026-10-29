# Home Device Cards

Custom Home Assistant cards for a water heater, air conditioner, EcoFlow RIVER,
smart socket, and room temperature/humidity.

## HACS installation

In HACS → Custom repositories, add:
`https://github.com/vitalii-mural/home-device-cards`
with type **Dashboard**. Download Home Device Cards and reload the browser.

The single resource is:
`/hacsfiles/home-device-cards/home-device-cards.js`

HACS shows updates when a new release is published. Install the update from
HACS and reload your dashboard. Existing card configurations are preserved.
Remove the old `/local/home-dashboard.js` and `/local/home-device-cards.js`
resource entries when migrating to HACS to avoid registering cards twice.
Card-mod is not required.

## Theme

The Home Cards theme is a separate HACS package.
Install [Home Cards Theme](https://github.com/vitalii-mural/home-cards-theme)
with type **Theme**.

## Manual installation

Copy `home-dashboard.js` and `home-device-cards.js` into `/config/www/`.
Add both resources under Settings → Dashboards → Resources, with type
**JavaScript module**:

1. `/local/home-dashboard.js`
2. `/local/home-device-cards.js`

The base module is required. Card-mod is not required.
After updating either file, change its resource URL version query and reload
the browser, for example `/local/home-device-cards.js?v=2`.

## Cards

- `custom:home-boiler-card`
- `custom:home-air-card`
- `custom:home-river-card`
- `custom:home-socket-card`
- `custom:home-room-card`
- `custom:home-tv-card`

Select entities and names in each card's visual editor. Entity defaults were
cleared for this repository; existing installations should keep their explicit
card configuration. Device features require matching entities/integrations;
these cards do not add device protocol support.

The Android TV remote card needs a `remote` entity from the Android TV Remote
integration. Its optional `media_player` entity provides the active app name;
the card falls back to the remote's current activity. It does not infer
playback state from the remote entity. Commands use
Home Assistant's `remote.send_command`; supported keys and their behavior vary
by TV model, firmware, and the app in the foreground. The assistant key sends
`ASSIST` and does not transmit voice audio. Mi/PatchWall is omitted because
the integration's generic command list does not confirm a matching key for
this TV model. The card uses example entity IDs only:

```yaml
type: custom:home-tv-card
remote_entity: remote.example_tv
media_player_entity: media_player.example_tv
```

For the boiler, Midea Local Memo U and sterilization switches are detected
automatically when they share the selected water heater's Midea Local device
entry. The card also uses that device's remaining-heating-time sensor when the
water heater does not expose `heating_time_remaining`. Manual feature bindings
remain available under **Додаткові налаштування**. Detection uses Home
Assistant entity-registry identity; it does not infer entities from names or
entity IDs, and does not auto-map Mega Water.

```yaml
type: custom:home-room-card
room_temperature_entity: sensor.example_temperature
humidity_entity: sensor.example_humidity
battery_entity: sensor.example_battery
```

The current UI uses Ukrainian labels, Lucide icons, light/dark themes, and
responsive layouts targeting widths of 360 px and above. The code uses Home
Assistant frontend components and should be checked after frontend updates.
The HACS bundle includes both the base and standalone cards.

The standalone air card requests a state refresh every ten seconds while connected,
the browser tab is visible, and the AC entity is on. It stops additional refreshes
when hidden, disconnected, off, or unavailable. The integration's own polling stays
unchanged. Multiple open clients can each request refreshes. AC and boiler settings are disabled
while powered off; only the power button stays enabled. Displayed modes come from
Home Assistant, without browser storage.

## Publishing an update

Edit the maintained sources under `src/`. The two root JavaScript files and
the HACS bundle are generated distribution files; rebuild them before committing.
See [ARCHITECTURE.md](ARCHITECTURE.md) for the source map and compatibility rules.

Run the checks in [CONTRIBUTING.md](CONTRIBUTING.md), update the version, and
commit the sources and generated bundle. Push the commit and a `vX.Y.Z` tag.
GitHub Actions validates the code and publishes the release with the bundle.
HACS installs the bundle from `dist/` in that version.

## Validation

See [TESTING.md](TESTING.md) for automated checks and a local browser preview
with synthetic data at 360 px and desktop widths.

```sh
node --check home-dashboard.js
node --check home-device-cards.js
node build.mjs
node --check dist/home-device-cards.js
git diff --check
```

## Third-party assets

Lucide icon paths: see `licenses/lucide-LICENSE`.
Vertical louver icons originate from
https://github.com/lageorgem/ha-material-thermostat-card;
their MIT license notice is preserved in `home-device-cards.js`.

No Home Assistant credentials, dashboard exports, personal entity identifiers,
or server addresses are included.
