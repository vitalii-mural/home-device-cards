class HomeAirCard extends HomeDeviceStandaloneCard {
  connectedCallback() {
    super.connectedCallback();
    this._airRefreshAttached = true;
    this._airVisibilityListener ||= () => this._syncAirRefresh();
    document.addEventListener("visibilitychange", this._airVisibilityListener);
    this._syncAirRefresh();
  }

  disconnectedCallback() {
    this._airRefreshAttached = false;
    document.removeEventListener("visibilitychange", this._airVisibilityListener);
    clearTimeout(this._airRefreshTimer);
    this._airRefreshTimer = null;
    super.disconnectedCallback();
  }

  _canRefreshAir() {
    const entity = this._airId();
    return this._airRefreshAttached && document.visibilityState === "visible" &&
      this._available(entity) && this._state(entity).state !== "off";
  }

  _displayAirMode() {
    const entity = this._airId(), state = this._state(entity);
    const modes = (state?.attributes?.hvac_modes || []).filter((mode) => mode !== "off");
    this._lastAirModes ||= new Map();
    const key = `home-device-cards:air-mode:${entity}`;
    if (modes.includes(state?.state)) {
      if (this._lastAirModes.get(entity) !== state.state) {
        this._lastAirModes.set(entity, state.state);
        try { localStorage.setItem(key, state.state); } catch { /* Storage may be disabled. */ }
      }
      return state.state;
    }
    if (state?.state !== "off") return null;
    let previous = this._lastAirModes.get(entity);
    if (!previous) {
      try { previous = localStorage.getItem(key); } catch { /* Storage may be disabled. */ }
    }
    return modes.includes(previous) ? previous : null;
  }

  _syncAirRefresh() {
    if (!this._canRefreshAir()) {
      clearTimeout(this._airRefreshTimer);
      this._airRefreshTimer = null;
      return;
    }
    if (this._airRefreshTimer != null || this._airRefreshPending) return;
    this._airRefreshTimer = setTimeout(() => this._refreshAir(), 10000);
  }

  async _refreshAir() {
    this._airRefreshTimer = null;
    if (!this._canRefreshAir() || this._airRefreshPending) return;
    this._airRefreshPending = true;
    try {
      await this._hass.callService("homeassistant", "update_entity", {
        entity_id: this._airId(),
      });
    } catch {
      // A background refresh must not interrupt the card's controls or retry early.
    } finally {
      this._airRefreshPending = false;
      this._syncAirRefresh();
    }
  }

  static get cardType() {
    return "air";
  }
  static get cardTitle() {
    return ["air_entity", "Кондиціонер"];
  }
  _content() {
    return `<div class="desktop-board"><div class="desktop-air">${this._air()}</div></div>`;
  }
  _temperature(entity, delta) {
    if (this._busy(entity) || !this._available(entity)) return;
    this._temperatureAction = `air-${delta > 0 ? "plus" : "minus"}`;
    super._temperature(entity, delta);
  }

  _air() {
    const id = this._airId(),
      state = this._state(id),
      a = state?.attributes || {},
      available = this._available(id);
    const room = this._number(a.current_temperature);
    const fullMode = this._swingOption(a.swing_modes, "swing_full"),
      defaultMode = this._swingOption(a.swing_modes, "default");
    const moving = String(a.swing_mode || "")
      .toLowerCase()
      .startsWith("swing");
    const fixed = String(a.swing_mode || "")
      .toLowerCase()
      .startsWith("fixed");
    const fixedPosition = fixed ? this._fixedSwingPosition(a.swing_mode) : 2;
    const fixedModes = this._fixedSwingModes(a.swing_modes);
    const firstKeys = [
      "air_lights_entity",
      "air_x_fan_entity",
      "air_sleep_entity",
    ];
    const first = this._airSwitches(firstKeys);
    const second = this._airSwitches([
      "air_health_entity",
      "air_8deg_heat_entity",
      "air_power_save_entity",
      "air_beeper_entity",
    ]);
    const swingButtons = `<button class="air-swing-main-button" data-action="air-swing-toggle" title="Вгору-вниз" aria-label="Вгору-вниз" aria-pressed="${moving}" ${this._disabled(!available || !fullMode || !defaultMode, id)}><span class="air-swing-main-icon">${this._swingMainIcon("up-down")}</span><span>Рух</span></button><button class="air-swing-main-button" data-action="air-swing-palette" title="Фіксований кут" aria-label="Фіксований кут" aria-pressed="${fixed || !!this._airFixedPaletteOpen}" aria-expanded="${!!this._airFixedPaletteOpen}" aria-controls="air-fixed-palette" ${this._disabled(!available || !fixedModes.length, id)}><span class="air-swing-main-icon" data-position="${fixedPosition}">${this._fixedAngleIcon(fixedPosition)}</span><span>Кут</span></button>`;
    const palette = `<div class="air-fixed-palette" id="air-fixed-palette" data-air-fixed-palette ${this._airFixedPaletteOpen ? "" : "hidden"}>${this._fixedSwingButtons(fixedModes, a.swing_mode, available, this._busy(id))}</div>`;
    const controls = `<div class="air-unified"><div class="air-unified-first">${swingButtons}${first}</div><div class="air-unified-second" ${this._airFixedPaletteOpen ? "hidden" : ""}>${second}</div>${palette}</div>`;
    const modes = a.hvac_modes || [],
      target =
        this._pendingTargets.get(id)?.temperature ?? this._number(a.temperature),
      on = available && state.state !== "off";
    const names = {
      cool: "Охолодження",
      heat: "Обігрів",
      dry: "Осушення",
      fan_only: "Вентиляція",
      auto: "Авто",
      heat_cool: "Авто",
    };
    const status = !state
      ? "Не підключений до HA"
      : !available
        ? "Недоступний"
        : on
          ? names[state.state] || "Увімкнений"
          : "Вимкнений";
    const minimum = this._number(a.min_temp) ?? 16,
      maximum = this._number(a.max_temp) ?? 30;
    const busy = this._busy(id),
      pending = this._pendingTargets.has(id);

    return `<article class="panel" aria-label="Кондиціонер" data-live-panel="air"><div class="panel-top"><div class="heading"><span class="device-icon cool">${this._lucideIcon("air-vent")}</span><div><h2>Кондиціонер</h2><span class="secondary"><span data-live="air-status">${status}</span></span></div></div><button class="icon-button ${on ? "active-cool" : ""}" data-action="air-power" aria-label="${on ? "Вимкнути" : "Увімкнути"} кондиціонер" aria-pressed="${on}" ${this._disabled(!available, id)}>${this._lucideIcon("power")}</button></div>
    <div class="air-temperature"><button class="round" data-action="air-minus" aria-label="Зменшити температуру кондиціонера" ${this._disabled(!available || target === null || target <= minimum, id)}>${this._lucideIcon("minus")}</button><div><span class="air-value" data-live="air-target">${available ? this._format(target) : "—"}</span><span class="air-degree">°C</span><span class="secondary" data-live="air-room-caption">У кімнаті ${available ? this._format(room) : "—"} °C</span><span class="secondary pending-hint" data-live="air-pending" data-pending="${pending}" aria-hidden="${!pending}" role="status">Очікує підтвердження</span></div><button class="round" data-action="air-plus" aria-label="Збільшити температуру кондиціонера" ${this._disabled(!available || target === null || target >= maximum, id)}>${this._lucideIcon("plus")}</button></div>
    <div class="modes" role="group" aria-label="Режим кондиціонера">${this._airModeButtons(modes, this._displayAirMode(), available, busy)}</div><div class="air-fan"><div class="air-fan-heading"><span>Швидкість вентилятора</span><span class="air-fan-speed" data-live="air-fan-speed">${this._escape(this._fanLabel(a.fan_mode) || "—")}</span></div><div class="air-fan-speeds" data-air-fan-speeds role="group" aria-label="Швидкість вентилятора кондиціонера">${this._airFanButtons(a.fan_modes, a.fan_mode, available, busy)}</div></div>${controls}</article>`;
  }

  _airModeButtons(modes, current, available, busy) {
    const definitions = [
      ["cool", "snowflake", "Охолодження"],
      ["heat", "sun", "Обігрів"],
      ["fan_only", "fan", "Вентиляція"],
      ["dry", "droplet", "Осушення"],
      ["auto", "circle-a", "Автоматичний режим"],
    ];
    return definitions
      .filter(([mode]) => (modes || []).includes(mode))
      .map(
        ([mode, icon, label]) =>
          `<button class="mode" data-action="air-mode" data-mode="${mode}" title="${label}" aria-label="${label}" aria-pressed="${current === mode}" ${this._disabled(!available || busy, this._airId())}>${this._lucideIcon(icon)}</button>`,
      )
      .join("");
  }

  /*
   * Lucide ISC License
   * Copyright (c) 2026 Lucide Icons and Contributors
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * Feather-derived Lucide icons (circle, headphones, moon, minus, plus):
   * MIT License, Copyright (c) 2013-present Cole Bemis
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */

  _airFanButtons(modes, current, available, busy) {
    const order = [
      "auto",
      "quiet",
      "low",
      "medium_low",
      "medium",
      "medium_high",
      "high",
      "turbo",
    ];
    const names = {
      auto: "Авто",
      quiet: "Тихий",
      low: "Низька",
      medium_low: "Нижче середньої",
      medium: "Середня",
      medium_high: "Вище середньої",
      high: "Висока",
      turbo: "Турбо",
    };
    const blades = {
      low: 2,
      medium_low: 3,
      medium: 4,
      medium_high: 5,
      high: 6,
    };
    return order
      .filter((mode) => (modes || []).includes(mode))
      .map((mode) => {
        const icon =
          mode === "auto"
            ? this._lucideIcon("gauge")
            : mode === "quiet"
              ? this._lucideIcon("headphones")
              : mode === "turbo"
                ? this._lucideIcon("zap")
                : this._fanBladeIcon(blades[mode]);
        return `<button data-action="air-fan-mode" data-mode="${mode}" aria-label="${names[mode]}" title="${names[mode]}" aria-pressed="${current === mode}" ${this._disabled(!available || busy, this._airId())}>${icon}</button>`;
      })
      .join("");
  }

  _fanBladeIcon(bladeCount) {
    const blades = Array.from(
      { length: bladeCount },
      (_, index) =>
        `<path d="M21 16C23 10 29 5 31 10c3 6-4 9-8 9" transform="rotate(${(index * 360) / bladeCount} 20 20)"/>`,
    ).join("");
    return `<svg class="air-fan-blades" viewBox="0 0 40 40" aria-hidden="true">${blades}<circle cx="20" cy="20" r="2"/></svg>`;
  }

  _airSwitches(keys) {
    const definitions = [
      ["air_x_fan_entity", "X-Fan · просушування", "X-Fan", "x-fan"],
      ["air_lights_entity", "Підсвічування", "Світло", "light"],
      ["air_health_entity", "Іонізація · Health", "Health", "health"],
      ["air_power_save_entity", "Енергоощадження", "Економія", "save"],
      ["air_8deg_heat_entity", "Підтримання +8 °C", "+8 °C", "eight"],
      ["air_sleep_entity", "Сон", "Сон", "sleep"],
      ["air_valve_entity", "Клапан повітря", "Клапан", "valve"],
      [
        "air_anti_direct_blow_entity",
        "Захист від прямого потоку",
        "Захист потоку",
        "airflow",
      ],
      [
        "air_light_sensor_entity",
        "Датчик освітлення",
        "Датчик світла",
        "sensor",
      ],
      ["air_auto_x_fan_entity", "Автоматичний X-Fan", "Авто X-Fan", "x-fan"],
      [
        "air_auto_light_entity",
        "Автоматичне підсвічування",
        "Авто світло",
        "light",
      ],
      ["air_beeper_entity", "Звуковий сигнал", "Звук", "beeper"],
    ];
    return keys
      .map((key) => definitions.find((definition) => definition[0] === key))
      .filter(Boolean)
      .map(([key, label, short, icon]) => {
        const entity = this._config[key],
          feature = this._state(entity);
        if (!entity) return "";
        const unavailable = feature && !this._available(entity),
          title = unavailable ? `${label}: тимчасово недоступно` : label;
        return `<button class="air-switch" data-action="feature" data-entity="${this._escape(entity)}" title="${this._escape(title)}" aria-label="${this._escape(title)}" aria-pressed="${feature?.state === "on"}" ${feature ? this._disabled(!this._available(entity), entity) : "hidden disabled"}><span class="air-control-icon">${this._airOptionIcon(icon)}</span><span>${this._escape(short)}</span></button>`;
      })
      .join("");
  }

  _airOptionIcon(icon) {
    const icons = {
      "x-fan": "wind",
      light: "lightbulb",
      health: "trees",
      save: "leaf",
      eight: "house",
      sleep: "moon",
      valve: "air-vent",
      airflow: "wind",
      sensor: "sun",
      beeper: "volume-2",
    };
    return this._lucideIcon(icons[icon] || "wind");
  }

  _swingLabel(mode) {
    const key = String(mode)
      .toLowerCase()
      .replace(/[\s_-]/g, "");
    return (
      {
        default: "Стандартне",
        swingfull: "Повне хитання",
        fixedupmost: "Верхнє положення",
        fixedmiddleup: "Вище середини",
        fixedmiddle: "Середнє положення",
        fixedmiddlelow: "Нижче середини",
        fixedlowest: "Нижнє положення",
        swingdownmost: "Нижній діапазон",
        swingmiddlelow: "Середньо-нижній діапазон",
        swingmiddle: "Середній діапазон",
        swingmiddleup: "Середньо-верхній діапазон",
        swingupmost: "Верхній діапазон",
      }[key] || mode
    );
  }

  _swingOption(options, value) {
    const key = String(value)
      .toLowerCase()
      .replace(/[\s_-]/g, "");
    return (
      (options || []).find(
        (option) =>
          String(option)
            .toLowerCase()
            .replace(/[\s_-]/g, "") === key,
      ) || null
    );
  }

  _fixedSwingModes(modes) {
    return [
      "fixed_upmost",
      "fixed_middle_up",
      "fixed_middle",
      "fixed_middle_low",
      "fixed_lowest",
    ]
      .map((mode) => this._swingOption(modes, mode))
      .filter(Boolean);
  }

  _fixedSwingPosition(mode) {
    return [
      "fixed_upmost",
      "fixed_middle_up",
      "fixed_middle",
      "fixed_middle_low",
      "fixed_lowest",
    ].findIndex((value) => this._swingOption([mode], value));
  }

  _swingMainIcon(kind) {
    return kind === "fixed"
      ? HOME_AIR_SWING_ASSETS[2]
      : HOME_AIR_SWING_ASSETS[5];
  }

  _fixedAngleIcon(position = -1) {
    return (
      HOME_AIR_SWING_ASSETS[position < 0 ? 2 : position] ||
      HOME_AIR_SWING_ASSETS[2]
    );
  }

  _fixedSwingButtons(modes, current, available, busy) {
    return modes
      .map((mode) => {
        const position = this._fixedSwingPosition(mode);
        const label = this._swingLabel(mode),
          caption = `Положення ${position + 1}: ${label}`;
        return `<button class="air-fixed-position" data-action="air-fixed-position" data-mode="${this._escape(mode)}" title="${this._escape(caption)}" aria-label="${this._escape(caption)}" aria-pressed="${current === mode}" ${this._disabled(!available || busy, this._airId())}><span class="air-fixed-position-icon">${this._fixedAngleIcon(position)}</span><span>${position + 1}</span></button>`;
      })
      .join("");
  }

  _fanLabel(mode) {
    return (
      {
        auto: "Авто",
        low: "Низька",
        medium_low: "Нижче середньої",
        medium: "Середня",
        medium_high: "Вище середньої",
        high: "Висока",
        turbo: "Турбо",
        quiet: "Тихий",
      }[mode] || mode
    );
  }

  _updateAir() {
    super._updateAir();
    const panel = this.shadowRoot.querySelector('[data-live-panel="air"]');
    if (!panel) return;
    const id = this._airId(),
      state = this._state(id),
      a = state?.attributes || {},
      available = this._available(id);
    const roomTemperature = available
      ? this._number(a.current_temperature)
      : null;
    this._setText(
      '[data-live="air-room-caption"]',
      roomTemperature === null
        ? "Температура в кімнаті недоступна"
        : `У кімнаті ${this._format(roomTemperature)} °C`,
      panel,
    );
    const targetValue = available ? this._number(a.temperature) : null,
      targetNode = panel.querySelector(".air-value");
    if (!available) this._setText('[data-live="air-target"]', "—", panel);
    targetNode?.classList.toggle("temperature-missing", targetValue === null);
    this._setHidden(".air-degree", targetValue === null, panel);
    const modeGroup = panel.querySelector(".modes"),
      supportedModes = ["cool", "heat", "fan_only", "dry", "auto"].filter(
        (mode) => (a.hvac_modes || []).includes(mode),
      );
    if (modeGroup) {
      const currentModes = Array.from(
        modeGroup.querySelectorAll('[data-action="air-mode"]'),
      ).map((button) => button.dataset.mode);
      if (supportedModes.join("|") !== currentModes.join("|"))
        modeGroup.innerHTML = this._airModeButtons(
          supportedModes,
          this._displayAirMode(),
          available,
          this._busy(id),
        );
      modeGroup.hidden = supportedModes.length === 0;
      for (const button of modeGroup.querySelectorAll(
        '[data-action="air-mode"]',
      )) {
        button.disabled = !available || this._busy(id);
        button.title = available
          ? button.getAttribute("aria-label")
          : "Режим тимчасово недоступний";
        button.setAttribute(
          "aria-pressed",
          String(this._displayAirMode() === button.dataset.mode),
        );
      }
    }
    const fanGroup = panel.querySelector("[data-air-fan-speeds]"),
      fanModes = a.fan_modes || [];
    if (fanGroup) {
      const currentModes = Array.from(
        fanGroup.querySelectorAll('[data-action="air-fan-mode"]'),
      ).map((button) => button.dataset.mode);
      const orderedModes = [
        "auto",
        "quiet",
        "low",
        "medium_low",
        "medium",
        "medium_high",
        "high",
        "turbo",
      ].filter((mode) => fanModes.includes(mode));
      if (orderedModes.join("|") !== currentModes.join("|"))
        fanGroup.innerHTML = this._airFanButtons(
          fanModes,
          a.fan_mode,
          available,
          this._busy(id),
        );
      fanGroup.hidden = orderedModes.length === 0;
      for (const button of fanGroup.querySelectorAll(
        '[data-action="air-fan-mode"]',
      )) {
        button.disabled = !available || this._busy(id);
        button.title = available
          ? button.getAttribute("aria-label")
          : "Вентилятор тимчасово недоступний";
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.mode === a.fan_mode),
        );
      }
    }
    this._setText(
      '[data-live="air-fan-speed"]',
      this._fanLabel(a.fan_mode) || "—",
      panel,
    );
    this._updateAirSwing(panel, a, available);
    for (const [key] of HOME_DEVICE_CARD_FIELDS.air) {
      if (key === "air_entity") continue;
      const entity = this._config[key];
      const button =
        entity &&
        panel.querySelector(
          `[data-action="feature"][data-entity="${this._escape(entity)}"]`,
        );
      if (!button) continue;
      const feature = this._state(entity);
      const label =
        HOME_DEVICE_CARD_FIELDS.air.find((field) => field[0] === key)?.[1] ||
        key;
      button.hidden = !feature;
      button.disabled = !this._available(entity) || this._busy(entity);
      button.title =
        feature && !this._available(entity)
          ? `${label}: тимчасово недоступно`
          : label;
      button.setAttribute("aria-pressed", String(feature?.state === "on"));
      button.setAttribute("aria-label", button.title);
    }
  }

  _updateAirSwing(panel, attributes, available) {
    const modes = attributes.swing_modes || [],
      fixedModes = this._fixedSwingModes(modes),
      current = attributes.swing_mode;
    const fullMode = this._swingOption(modes, "swing_full"),
      defaultMode = this._swingOption(modes, "default");
    const toggle = panel.querySelector('[data-action="air-swing-toggle"]'),
      paletteButton = panel.querySelector('[data-action="air-swing-palette"]');
    const palette = panel.querySelector("[data-air-fixed-palette]"),
      busy = this._busy(this._airId());
    if (toggle) {
      toggle.hidden = !fullMode || !defaultMode;
      toggle.disabled = !available || !fullMode || !defaultMode || busy;
      toggle.title = available ? "Рух жалюзі" : "Жалюзі тимчасово недоступні";
      toggle.setAttribute(
        "aria-pressed",
        String(
          String(current || "")
            .toLowerCase()
            .startsWith("swing"),
        ),
      );
    }
    if (paletteButton) {
      paletteButton.hidden = !fixedModes.length;
      paletteButton.disabled = !available || !fixedModes.length || busy;
      paletteButton.title = available
        ? "Фіксований кут жалюзі"
        : "Жалюзі тимчасово недоступні";
      paletteButton.setAttribute(
        "aria-pressed",
        String(
          String(current || "")
            .toLowerCase()
            .startsWith("fixed") || this._airFixedPaletteOpen,
        ),
      );
      paletteButton.setAttribute(
        "aria-expanded",
        String(!!this._airFixedPaletteOpen),
      );
      const position = String(current || "")
        .toLowerCase()
        .startsWith("fixed")
        ? this._fixedSwingPosition(current)
        : 2;
      const icon = paletteButton.querySelector(".air-swing-main-icon");
      if (icon && icon.dataset.position !== String(position)) {
        icon.dataset.position = String(position);
        icon.innerHTML = this._fixedAngleIcon(position);
      }
    }
    if (!palette) return;
    const currentModes = Array.from(
      palette.querySelectorAll('[data-action="air-fixed-position"]'),
    ).map((button) => button.dataset.mode);
    if (fixedModes.join("|") !== currentModes.join("|"))
      palette.innerHTML = this._fixedSwingButtons(
        fixedModes,
        current,
        available,
        busy,
      );
    palette.hidden = !this._airFixedPaletteOpen || !fixedModes.length;
    const secondRow = panel.querySelector(".air-unified-second");
    if (secondRow) secondRow.hidden = !palette.hidden;
    const swingGroup = panel.querySelector(".air-swing-main");
    if (swingGroup)
      swingGroup.hidden =
        (!toggle || toggle.hidden) && (!paletteButton || paletteButton.hidden);
    for (const button of palette.querySelectorAll(
      '[data-action="air-fixed-position"]',
    )) {
      button.disabled = !available || busy;
      if (!available) button.title = "Положення жалюзі тимчасово недоступне";
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.mode === current),
      );
    }
  }

  _updateTemperatureFeedback() {
    const entity = this._airId();
    const pending = this._pendingTargets.has(entity);
    for (const button of this.shadowRoot.querySelectorAll(
      ".round[data-action]",
    )) {
      const active =
        pending && button.dataset.action === this._temperatureAction;
      if (button.dataset.pending !== String(active))
        button.dataset.pending = String(active);
      if (button.getAttribute("aria-busy") !== String(active))
        button.setAttribute("aria-busy", String(active));
    }
  }
  _updateCardDynamic({ all, has, serviceEntity }) {
    this._syncAirRefresh();
    const sources = [
      this._airId(),
      ...HOME_DEVICE_CARD_FIELDS.air
        .filter((field) => field[0] !== "air_entity")
        .map(([name]) => this._config[name]),
    ];
    if (
      all ||
      sources.some(has) ||
      (serviceEntity && sources.includes(serviceEntity))
    )
      this._updateAir();
    return { temperatureFeedback: true };
  }
  _handleCardClick(button) {
    if (button?.dataset.action === "air-fan-mode") {
      const entity = this._airId(),
        state = this._state(entity),
        mode = button.dataset.mode;
      if (
        !button.disabled &&
        this._available(entity) &&
        (state?.attributes?.fan_modes || []).includes(mode) &&
        !this._busy(entity)
      )
        this._service("climate", "set_fan_mode", {
          entity_id: entity,
          fan_mode: mode,
        });
      return true;
    }
    if (button?.dataset.action === "air-swing-palette") {
      this._airFixedPaletteOpen = !this._airFixedPaletteOpen;
      const state = this._state(this._airId());
      this._updateAirSwing(
        this.shadowRoot.querySelector('[data-live-panel="air"]'),
        state?.attributes || {},
        this._available(this._airId()),
      );
      return true;
    }
    if (
      ["air-swing-toggle", "air-fixed-position"].includes(
        button?.dataset.action,
      )
    ) {
      const entity = this._airId(),
        state = this._state(entity),
        modes = state?.attributes?.swing_modes || [];
      if (!button.disabled && this._available(entity) && !this._busy(entity)) {
        const mode =
          button.dataset.action === "air-swing-toggle"
            ? this._swingOption(
                modes,
                String(state?.attributes?.swing_mode || "")
                  .toLowerCase()
                  .startsWith("swing")
                  ? "default"
                  : "swing_full",
              )
            : this._swingOption(modes, button.dataset.mode);
        if (mode) {
          if (button.dataset.action === "air-fixed-position") {
            this._airFixedPaletteOpen = false;
            this._updateAirSwing(
              this.shadowRoot.querySelector('[data-live-panel="air"]'),
              state?.attributes || {},
              true,
            );
          }
          this._service("climate", "set_swing_mode", {
            entity_id: entity,
            swing_mode: mode,
          });
        }
      }
      return true;
    }
    return false;
  }
  _click(event) {
    if (this._handleCardClick(event.target.closest("button[data-action]")))
      return;
    super._click(event);
  }
}
if (!customElements.get("home-air-card"))
  customElements.define("home-air-card", HomeAirCard);
