# Home Device Cards

Custom Home Assistant cards for a water heater, air conditioner, EcoFlow RIVER,
smart socket, and room temperature/humidity.

## Installation

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
This repository is a manual installation snapshot, not yet a HACS release.

## Validation

```sh
node --check home-dashboard.js
node --check home-device-cards.js
git diff --check
```

## Third-party assets

Lucide icon paths: see `licenses/lucide-LICENSE`.
Vertical louver icons originate from
https://github.com/lageorgem/ha-material-thermostat-card;
their MIT license notice is preserved in `home-device-cards.js`.

No Home Assistant credentials, dashboard exports, personal entity identifiers,
or server addresses are included.
