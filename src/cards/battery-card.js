class HomeBatteryCard extends HomeDeviceStandaloneCard {
  static get cardType() {
    return "battery";
  }
  _content() {
    return this._batteryDetails();
  }
  _batteryDetails() {
    const online = this._state(this._config.river_status)?.state === "online";
    const read = (entity, unit, digits = 1, positive = false) => {
      const value = this._value(this._config[entity]);
      return online && value !== null && (!positive || value > 0)
        ? this._format(value, digits) + (unit ? ` ${unit}` : "")
        : "—";
    };
    const sections = [
      [
        "Основна батарея",
        "main",
        [
          ["Заряд", "level_entity", "%", 1],
          ["Повна ємність", "full_entity", "мА·год", 0, true],
          ["Залишкова ємність", "remain_entity", "мА·год", 0],
          ["Напруга батареї", "volts_entity", "В", 3, true],
          ["Струм батареї", "current_entity", "мА", 0],
          [
            "Комірки · мін. / макс.",
            ["min_cells_entity", "max_cells_entity"],
            "В",
            3,
            true,
          ],
          [
            "Температури · мін. / макс.",
            ["min_temperature_entity", "max_temperature_entity"],
            "°C",
            1,
          ],
          ["Цикли", "cycles_entity", "", 0],
        ],
      ],
      [
        "Додаткова батарея",
        "slave",
        [
          ["Заряд", "level_entity", "%", 1],
          ["Повна ємність", "full_entity", "мА·год", 0, true],
          ["Залишкова ємність", "remain_entity", "мА·год", 0],
          ["Напруга батареї", "volts_entity", "В", 3, true],
          ["Струм батареї", "current_entity", "мА", 0],
          [
            "Комірки · мін. / макс.",
            ["min_cells_entity", "max_cells_entity"],
            "В",
            3,
            true,
          ],
          [
            "Температури · мін. / макс.",
            ["min_temperature_entity", "max_temperature_entity"],
            "°C",
            1,
          ],
          ["Цикли", "cycles_entity", "", 0],
        ],
      ],
    ];
    const rows = sections
      .map(
        ([title, prefix, fields]) =>
          `<article class="panel"><h2>${title}</h2>${fields
            .map(([label, field, unit, digits, positive]) => {
              const entity = (name) => `${prefix}_${name}`;
              const value = Array.isArray(field)
                ? field
                    .map((name) => read(entity(name), unit, digits, positive))
                    .join(" / ")
                : read(entity(field), unit, digits, positive);
              const key = `battery-${prefix}-${label === "Заряд" ? "level" : label === "Повна ємність" ? "full" : label === "Залишкова ємність" ? "remain" : label === "Напруга батареї" ? "volts" : label === "Струм батареї" ? "current" : label.startsWith("Комірки") ? "cells" : label.startsWith("Температури") ? "temps" : "cycles"}`;
              return this._row(label, value, key);
            })
            .join("")}</article>`,
      )
      .join("");
    return `<article class="panel" data-live="river-offline-note" ${online ? "hidden" : ""}><p class="notice">Станція офлайн. Поточні вимірювання приховані; попередні записи доступні на графіках.</p></article>${rows}<div class="graph-slot" data-graph="river-current"></div><div class="graph-slot" data-graph="river-cells"></div>`;
  }

  _updateBattery() {
    const online = this._state(this._config.river_status)?.state === "online";
    const read = (entity, unit, digits = 1, positive = false) => {
      const value = this._value(this._config[entity]);
      return online && value !== null && (!positive || value > 0)
        ? this._format(value, digits) + (unit ? ` ${unit}` : "")
        : "—";
    };
    const values = {};
    for (const prefix of ["main", "slave"]) {
      values[`battery-${prefix}-level`] = read(`${prefix}_level_entity`, "%");
      values[`battery-${prefix}-full`] = read(
        `${prefix}_full_entity`,
        "мА·год",
        0,
        true,
      );
      values[`battery-${prefix}-remain`] = read(
        `${prefix}_remain_entity`,
        "мА·год",
        0,
      );
      values[`battery-${prefix}-volts`] = read(
        `${prefix}_volts_entity`,
        "В",
        3,
        true,
      );
      values[`battery-${prefix}-current`] = read(
        `${prefix}_current_entity`,
        "мА",
        0,
      );
      values[`battery-${prefix}-cells`] =
        `${read(`${prefix}_min_cells_entity`, "В", 3, true)} / ${read(`${prefix}_max_cells_entity`, "В", 3, true)}`;
      values[`battery-${prefix}-temps`] =
        `${read(`${prefix}_min_temperature_entity`, "°C")} / ${read(`${prefix}_max_temperature_entity`, "°C")}`;
      values[`battery-${prefix}-cycles`] = read(
        `${prefix}_cycles_entity`,
        "",
        0,
      );
    }
    for (const [key, value] of Object.entries(values))
      this._setText(`[data-live="${key}"]`, value);
    this._setHidden('[data-live="river-offline-note"]', online);
  }
  _updateCardDynamic({ all, has }) {
    const sources = [
      this._config.river_status,
      ...HOME_DEVICE_CARD_FIELDS.battery
        .filter((field) => field[2] === "sensor")
        .map(([id]) => this._config[id]),
    ];
    if (all || sources.some(has)) this._updateBattery();
  }
}
if (!customElements.get("home-battery-card"))
  customElements.define("home-battery-card", HomeBatteryCard);
