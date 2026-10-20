class HomeBoilerCard extends HomeDeviceStandaloneCard {
  static get cardType() {
    return "boiler";
  }
  static get cardTitle() {
    return ["boiler_entity", "Гаряча вода"];
  }
  _content() {
    return `<div class="desktop-board"><div class="desktop-water">${this._boiler()}</div></div>`;
  }
  _temperature(entity, delta) {
    if (this._busy(entity) || !this._available(entity)) return;
    this._temperatureAction = `boiler-${delta > 0 ? "plus" : "minus"}`;
    super._temperature(entity, delta);
  }

  _boiler() {
    const c = this._config,
      state = this._state(c.boiler_entity),
      a = state?.attributes || {};
    const available = this._available(c.boiler_entity),
      on = available && state.state !== "off",
      heating =
        on && (a.hvac_action === "heating" || a.heating === true);
    const current = this._number(a.current_temperature),
      pendingTarget = this._pendingTargets.get(c.boiler_entity),
      target = pendingTarget?.temperature ?? this._number(a.temperature),
      min = this._number(a.min_temp) ?? 30;
    const progress =
      current !== null && target !== null && target > min
        ? Math.min(100, Math.max(0, ((current - min) / (target - min)) * 100))
        : 0;
    const h = this._value(c.boiler_hours),
      m = this._value(c.boiler_minutes),
      remaining = c.boiler_entity?.startsWith("water_heater.")
        ? this._number(a.heating_time_remaining)
        : h !== null && m !== null && h >= 0 && m >= 0
          ? h * 60 + m
          : null;
    const time =
      remaining !== null && remaining > 0
        ? `${remaining >= 60 ? Math.floor(remaining / 60) + " год " : ""}${remaining % 60} хв`
        : "";
    const status = !state
      ? "Не підключено"
      : !available
        ? "Недоступний"
        : !on
          ? "Вимкнено"
          : heating
            ? "Нагрівання"
            : a.hvac_action === "idle" || a.keep_warm === true
              ? "Підтримання температури"
              : "Увімкнено";

    return `<article class="panel" aria-label="Бойлер" data-live-panel="boiler"><div class="panel-top"><div class="heading"><span class="device-icon warm">${this._lucideIcon("heater")}</span><div><h2>Гаряча вода</h2><span class="secondary ${heating ? "heating" : ""}" data-live="boiler-status">${status}</span></div></div><button class="icon-button ${on ? "active-warm" : ""}" data-action="boiler-power" aria-label="${on ? "Вимкнути" : "Увімкнути"} бойлер" aria-pressed="${on}" ${this._disabled(!available, c.boiler_entity)}>${this._lucideIcon("power")}</button></div>
    <div class="water-large"><span class="secondary boiler-current-label">Температура води</span><span class="current"><span data-live="boiler-current">${available ? this._format(current) : "—"}</span><small class="degree" data-live="boiler-current-unit">°C</small></span><div class="setpoint"><span class="secondary">Нагріти до</span><div class="adjust"><button class="round" data-action="boiler-minus" aria-label="Зменшити температуру бойлера" ${this._disabled(!available || target === null || target <= min, c.boiler_entity)}>${this._lucideIcon("minus")}</button><span class="target"><span data-live="boiler-target">${this._format(target)}</span><small data-live="boiler-target-unit">°C</small></span><button class="round" data-action="boiler-plus" aria-label="Збільшити температуру бойлера" ${this._disabled(!available || target === null || target >= (this._number(a.max_temp) ?? 80), c.boiler_entity)}>${this._lucideIcon("plus")}</button></div><span class="secondary pending-hint" data-live="boiler-pending" data-pending="${!!pendingTarget}" aria-hidden="${!pendingTarget}" role="status">Очікує підтвердження</span></div></div>
    <div class="progress ${heating ? "" : "waiting"}" data-live="boiler-progress" role="progressbar" aria-label="Температура води до заданої" aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${progress}%"></span></div>
    <div class="time" data-live="boiler-time" ${heating && time ? "" : "hidden"}>${this._icon("clock-outline")}<span>До нагрівання · ${time}</span></div>${this._boilerFeatures()}</article>`;
  }

  _boilerFeatures() {
    const definitions = [
      ["memo_entity", "Memo U", "house"],
      ["mega_entity", "Mega Water", "droplets"],
      ["sterilization_entity", "Стерилізація", "shield-check"],
    ];
    const buttons = definitions
      .map(([key, label, icon]) => {
        const entity = this._config[key],
          feature = this._state(entity);
        if (!entity) return "";
        const unavailable = feature && !this._available(entity);
        const title = unavailable ? `${label}: тимчасово недоступно` : label;
        return `<button class="feature" data-action="feature" data-entity="${this._escape(entity)}" title="${this._escape(title)}" aria-label="${this._escape(title)}" aria-pressed="${feature?.state === "on"}" ${feature ? this._disabled(!this._available(entity), entity) : "hidden disabled"}><span class="boiler-feature-icon">${this._lucideIcon(icon)}</span><span>${label}</span></button>`;
      })
      .join("");
    return `<div class="features" role="group" aria-label="Режими бойлера">${buttons}</div>`;
  }

  _updateBoiler() {
    super._updateBoiler();
    const panel = this.shadowRoot.querySelector('[data-live-panel="boiler"]');
    if (!panel) return;
    if (!this._available(this._config.boiler_entity))
      this._setText('[data-live="boiler-target"]', "—", panel);
    this._setHidden(
      '[data-live="boiler-progress"]',
      !this._available(this._config.boiler_entity) ||
        this._number(
          this._state(this._config.boiler_entity)?.attributes
            ?.current_temperature,
        ) === null,
      panel,
    );
    for (const [key, unit] of [
      ["boiler-current", "boiler-current-unit"],
      ["boiler-target", "boiler-target-unit"],
    ]) {
      const value = panel.querySelector(`[data-live="${key}"]`),
        missing =
          !value || this._number(value.textContent.replace(/,/g, ".")) === null;
      value?.parentElement?.classList.toggle("temperature-missing", missing);
      this._setHidden(`[data-live="${unit}"]`, missing, panel);
    }
    for (const [key, label] of [
      ["memo_entity", "Memo U"],
      ["mega_entity", "Mega Water"],
      ["sterilization_entity", "Стерилізація"],
    ]) {
      const entity = this._config[key];
      const button =
        entity &&
        panel.querySelector(
          `[data-action="feature"][data-entity="${this._escape(entity)}"]`,
        );
      if (!button) continue;
      const feature = this._state(entity),
        exists = !!feature,
        available = this._available(entity);
      button.hidden = !exists;
      button.disabled = !available || this._busy(entity);
      button.setAttribute("aria-pressed", String(feature?.state === "on"));
      button.title =
        exists && !available ? `${label}: тимчасово недоступно` : label;
      button.setAttribute("aria-label", button.title);
    }
  }

  _updateTemperatureFeedback() {
    const entity = this._config.boiler_entity;
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
    const sources = [
      this._config.boiler_entity,
      this._config.boiler_hours,
      this._config.boiler_minutes,
      this._config.memo_entity,
      this._config.mega_entity,
      this._config.sterilization_entity,
    ];
    if (all || sources.some(has) || sources.includes(serviceEntity))
      this._updateBoiler();
    return { temperatureFeedback: true };
  }
  _graphDefinitions() {
    return {
      boiler: {
        title: "Потужність бойлера · 24 години",
        entities: [this._config.power_entity],
      },
    };
  }
}
if (!customElements.get("home-boiler-card"))
  customElements.define("home-boiler-card", HomeBoilerCard);
