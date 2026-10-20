class HomeSocketCard extends HomeDeviceStandaloneCard {
  static get cardType() {
    return "socket";
  }
  static get cardTitle() {
    return ["switch_entity", "Розетка"];
  }
  _content() {
    return this._socket();
  }
  _socketReading(key, digits = 1, conversion = null) {
    const id = this._config[key],
      state = this._state(id);
    let value = this._available(id) ? this._number(state.state) : null;
    const unit = String(state?.attributes?.unit_of_measurement || "")
      .trim()
      .toLowerCase();
    if (
      value !== null &&
      conversion === "power" &&
      ["kw", "kilowatt", "kilowatts"].includes(unit)
    )
      value *= 1000;
    if (
      value !== null &&
      conversion === "voltage" &&
      ["mv", "millivolt", "millivolts"].includes(unit)
    )
      value /= 1000;
    if (
      value !== null &&
      conversion === "current" &&
      ["ma", "milliamp", "milliamps"].includes(unit)
    )
      value /= 1000;
    if (
      value !== null &&
      conversion === "energy" &&
      ["wh", "watt-hour", "watt hours"].includes(unit)
    )
      value /= 1000;
    return value === null ? "—" : this._format(value, digits);
  }

  _socket() {
    const c = this._config,
      state = this._state(c.switch_entity);
    const available = this._available(c.switch_entity),
      on = available && state.state === "on";
    const pending = !!this._socketPending,
      icon = (name) => this._lucideIcon(name);
    return (
      '<article class="socket-card" data-live-panel="socket" aria-label="Розетка">' +
      '<header class="socket-header"><span class="socket-icon">' +
      icon("plug") +
      '</span><div class="socket-heading"><h2>' +
      this._escape(c.title || "Розетка") +
      '</h2><span class="secondary" data-live="socket-status">' +
      (pending
        ? "Очікує підтвердження"
        : on
          ? "Увімкнено"
          : available
            ? "Вимкнено"
            : "Недоступна") +
      '</span></div><button class="socket-power-button" data-action="socket-toggle" data-pending="' +
      pending +
      '" aria-label="' +
      (on ? "Вимкнути" : "Увімкнути") +
      ' розетку" aria-pressed="' +
      on +
      '" aria-busy="' +
      pending +
      '" ' +
      this._disabled(!available || pending, c.switch_entity) +
      '><span class="socket-spinner" aria-hidden="true"></span>' +
      icon("power") +
      "</button></header>" +
      '<div class="socket-reading"><div class="metric-value"><span data-live="socket-power">' +
      this._socketReading("power_entity", 0, "power") +
      '</span><small data-live="socket-power-unit">Вт</small></div><span class="secondary">Поточне споживання</span></div>' +
      '<div class="socket-metrics"><div><span class="secondary">' +
      icon("zap") +
      'Напруга</span><strong><span data-live="socket-voltage">' +
      this._socketReading("voltage_entity", 1, "voltage") +
      '</span><small data-live="socket-voltage-unit">В</small></strong></div>' +
      '<div><span class="secondary">' +
      icon("activity") +
      'Струм</span><strong><span data-live="socket-current">' +
      this._socketReading("current_entity", 2, "current") +
      "</span><small>А</small></strong></div>" +
      '<div><span class="secondary">' +
      icon("chart-no-axes-column") +
      this._escape(c.energy_label || "Енергія") +
      '</span><strong><span data-live="socket-energy">' +
      this._socketReading("energy_daily_entity", 2, "energy") +
      "</span><small>кВт·год</small></strong></div></div></article>"
    );
  }

  _updateSocket() {
    const entity = this._config.switch_entity,
      state = this._state(entity);
    const available = this._available(entity),
      on = available && state.state === "on";
    if (
      this._socketPending &&
      this._socketPending.entity === entity &&
      available &&
      on === this._socketPending.on
    ) {
      clearTimeout(this._socketPending.timer);
      this._socketPending = null;
    }
    const pending = !!this._socketPending;
    const button = this.shadowRoot.querySelector(
      '[data-action="socket-toggle"]',
    );
    this._setText(
      '[data-live="socket-status"]',
      pending
        ? "Очікує підтвердження"
        : on
          ? "Увімкнено"
          : available
            ? "Вимкнено"
            : "Недоступна",
    );
    if (button) {
      button.disabled = !available || pending || this._busy(entity);
      button.setAttribute("aria-pressed", String(on));
      button.setAttribute("aria-busy", String(pending));
      button.setAttribute(
        "aria-label",
        (on ? "Вимкнути" : "Увімкнути") + " розетку",
      );
      button.dataset.pending = String(pending);
    }
    const values = [
      [
        '[data-live="socket-power"]',
        this._socketReading("power_entity", 0, "power"),
        ".socket-reading .metric-value",
      ],
      [
        '[data-live="socket-voltage"]',
        this._socketReading("voltage_entity", 1, "voltage"),
        ".socket-metrics>div:nth-child(1) strong",
      ],
      [
        '[data-live="socket-current"]',
        this._socketReading("current_entity", 2, "current"),
        ".socket-metrics>div:nth-child(2) strong",
      ],
      [
        '[data-live="socket-energy"]',
        this._socketReading("energy_daily_entity", 2, "energy"),
        ".socket-metrics>div:nth-child(3) strong",
      ],
    ];
    for (const [selector, value, parent] of values) {
      this._setText(selector, value);
      const reading = this.shadowRoot.querySelector(parent);
      reading?.classList.toggle("socket-missing", value === "—");
      reading?.querySelector("small")?.toggleAttribute("hidden", value === "—");
    }
  }

  async _toggleSocket() {
    const entity = this._config.switch_entity;
    if (!this._available(entity) || this._busy(entity) || this._socketPending)
      return;
    const generation = this._generation;
    const on = this._state(entity).state !== "on";
    this._error = "";
    this._setHidden('[data-live="error"]', true);
    const pending = { entity, on, timer: null };
    this._socketPending = pending;
    this._updateSocket();
    pending.timer = setTimeout(() => {
      if (this._socketPending !== pending) return;
      this._socketPending = null;
      this._error =
        (this._state(entity)?.attributes?.friendly_name || entity) +
        " не підтвердив зміну стану за 15 секунд.";
      this._updateSocket();
      this._setText('[data-live="error"]', this._error);
      this._setHidden('[data-live="error"]', false);
    }, 15000);
    try {
      await this._hass.callService("switch", on ? "turn_on" : "turn_off", {
        entity_id: entity,
      });
      if (generation === this._generation) this._updateSocket();
    } catch (error) {
      if (generation !== this._generation) return;
      if (this._socketPending === pending) {
        clearTimeout(pending.timer);
        this._socketPending = null;
      }
      this._error = error?.message || "Не вдалося змінити стан розетки.";
      this._updateSocket();
      this._setText('[data-live="error"]', this._error);
      this._setHidden('[data-live="error"]', false);
    }
  }
  _updateCardDynamic({ all, has }) {
    const sources = HOME_DEVICE_CARD_FIELDS.socket.map(
      ([name]) => this._config[name],
    );
    if (all || sources.some(has)) this._updateSocket();
  }
  _handleCardClick(button) {
    if (button?.dataset.action !== "socket-toggle") return false;
    this._toggleSocket();
    return true;
  }
  _click(event) {
    if (this._handleCardClick(event.target.closest("button[data-action]")))
      return;
    super._click(event);
  }
}
if (!customElements.get("home-socket-card"))
  customElements.define("home-socket-card", HomeSocketCard);
