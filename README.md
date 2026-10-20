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

Select entities and names in each card's visual editor. Entity defaults were
cleared for this repository; existing installations should keep their explicit
card configuration. Device features require matching entities/integrations;
these cards do not add device protocol support.

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

## Publishing an update

Run the checks in [CONTRIBUTING.md](CONTRIBUTING.md), update the version, and
commit the sources and generated bundle. Push the commit and a `vX.Y.Z` tag.
GitHub Actions validates the code and publishes the release with the bundle.
HACS installs the bundle from `dist/` in that version.

## Validation

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
