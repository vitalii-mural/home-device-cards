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
    let html = super._boiler();
    html = html.replace(
      '<div class="water-large">',
      '<div class="water-large"><span class="secondary boiler-current-label">Температура води</span>',
    );
    html = html.replace(this._icon("water-boiler"), this._lucideIcon("heater"));
    for (const [action, icon] of [
      ["boiler-minus", "minus"],
      ["boiler-plus", "plus"],
      ["boiler-power", "power"],
    ]) {
      const pattern = new RegExp(
        `(<button[^>]*data-action="${action}"[^>]*>)[\\s\\S]*?(<\\/button>)`,
      );
      html = html.replace(
        pattern,
        (_, open, close) => `${open}${this._lucideIcon(icon)}${close}`,
      );
    }
    html = html.replace(
      '<small class="degree">°C</small>',
      '<small class="degree" data-live="boiler-current-unit">°C</small>',
    );
    html = html.replace(
      /(<span data-live="boiler-target">[^<]*<\/span>)°/,
      '$1<small data-live="boiler-target-unit">°C</small>',
    );
    html = html.replace(/<div class="features"[^>]*>[\s\S]*?<\/div>/, () =>
      this._boilerFeatures(),
    );
    return html;
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
