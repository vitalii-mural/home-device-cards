class HomeSocketCard extends HomeDeviceStandaloneCard {
  constructor() {
    super();
    this._socketHistories = new Map();
    this._socketHistoryTokens = new Map();
    this._socketHistoryLoading = new Set();
    this._socketHistoryLoadedAt = new Map();
    this._socketHistoryDay = null;
  }

  setConfig(config) {
    if (config?.energy_daily_entity !== this._config?.energy_daily_entity)
      this._clearSocketHistory("energy");
    super.setConfig(config);
    if (this.isConnected) this._loadSocketEnergy();
  }

  set hass(hass) {
    super.hass = hass;
    this._loadSocketEnergy();
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadSocketEnergy();
  }

  disconnectedCallback() {
    this._socketHistoryTokens.set(
      "energy",
      (this._socketHistoryTokens.get("energy") || 0) + 1,
    );
    this._socketHistoryLoading.delete("energy");
    super.disconnectedCallback();
  }

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

  _clearSocketHistory(key) {
    this._socketHistoryTokens.set(
      key,
      (this._socketHistoryTokens.get(key) || 0) + 1,
    );
    this._socketHistoryLoading.delete(key);
    this._socketHistoryLoadedAt.delete(key);
    if (key === "energy") this._socketHistoryDay = null;
    this._socketHistories.delete(key);
  }

  _canLoadSocketHistory(key) {
    if (this._socketHistoryLoading.has(key)) return false;
    const loadedAt = this._socketHistoryLoadedAt.get(key);
    if (key === "energy" && this._socketHistoryDay) {
      const timeZone = this._hass.config?.time_zone || "UTC";
      const date = this._socketLocalDateParts(Date.now(), timeZone).date;
      if (this._socketHistoryDay !== `${timeZone}|${date}`) return true;
    }
    return !(loadedAt && Date.now() - loadedAt < 300000);
  }

  _beginSocketHistory(key) {
    this._socketHistoryLoading.add(key);
    const token = (this._socketHistoryTokens.get(key) || 0) + 1;
    this._socketHistoryTokens.set(key, token);
    return token;
  }

  _isCurrentSocketHistory(key, token, entityKey, entity) {
    return token === this._socketHistoryTokens.get(key) &&
      this.isConnected &&
      this._config?.[entityKey] === entity;
  }

  _finishSocketHistory(key) {
    this._socketHistoryLoadedAt.set(key, Date.now());
    this._socketHistoryLoading.delete(key);
  }

  async _loadSocketEnergy() {
    const entity = this._config?.energy_daily_entity;
    if (!this.isConnected || !this._hass || !entity ||
      typeof this._hass.callWS !== "function" ||
      !this._canLoadSocketHistory("energy")) return;
    const token = this._beginSocketHistory("energy");
    const now = new Date();
    const start = new Date(now.getTime() - 26 * 60 * 60 * 1000);
    const timeZone = this._hass.config?.time_zone || "UTC";
    try {
      const response = await this._hass.callWS({
        type: "recorder/statistics_during_period",
        start_time: start.toISOString(),
        end_time: now.toISOString(),
        statistic_ids: [entity],
        period: "hour",
        units: { energy: "kWh" },
        types: ["change"],
      });
      if (!this._isCurrentSocketHistory("energy", token, "energy_daily_entity", entity)) return;
      const dateParts = this._socketLocalDateParts(now.getTime(), timeZone);
      this._socketHistoryDay = `${timeZone}|${dateParts.date}`;
      const hours = Array(24).fill(null);
      const rows = Array.isArray(response?.[entity]) ? response[entity] : [];
      for (const row of rows) {
        const timestamp = typeof row?.start === "number" ? row.start : Date.parse(row?.start);
        const change = this._number(row?.change);
        if (!Number.isFinite(timestamp) || timestamp > now.getTime() || change === null || change < 0) continue;
        const parts = this._socketLocalDateParts(timestamp, timeZone);
        if (parts.date !== dateParts.date || parts.hour > dateParts.hour) continue;
        hours[parts.hour] = (hours[parts.hour] ?? 0) + change;
      }
      this._socketHistories.set("energy", hours.some((value) => value !== null)
        ? { type: "bars", values: hours }
        : null);
      this._finishSocketHistory("energy");
      this._renderSocketHistory("energy");
    } catch {
      if (this._isCurrentSocketHistory("energy", token, "energy_daily_entity", entity)) {
        this._socketHistories.set("energy", null);
        this._finishSocketHistory("energy");
        this._renderSocketHistory("energy");
      }
    }
  }

  _socketLocalDateParts(timestamp, timeZone) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(timestamp));
    const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return { date: `${value.year}-${value.month}-${value.day}`, hour: Number(value.hour) };
  }

  _renderSocketHistory(key) {
    const chart = this.shadowRoot.querySelector(`[data-socket-chart="${key}"]`);
    const history = this._socketHistories.get(key);
    if (!chart) return;
    if (!history) {
      chart.toggleAttribute("hidden", true);
      return;
    }
    chart.toggleAttribute("hidden", false);
    if (history.type === "bars") {
      const values = history.values;
      const max = Math.max(0, ...values.filter((value) => value !== null));
      const slot = 192 / 24, width = slot * 0.7;
      let path = "";
      values.forEach((value, hour) => {
        const height = value === null || max === 0 || value === 0
          ? 0.8
          : value / max * 32;
        const x = hour * slot + (slot - width) / 2;
        const y = 40 - height;
        path += `M${x.toFixed(1)} 40 V${y.toFixed(1)} H${(x + width).toFixed(1)} V40 Z `;
      });
      chart.querySelector("path")?.setAttribute("d", path);
    }
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
      '<button class="socket-energy" type="button" data-action="more" data-socket-metric="energy" data-entity="' +
      this._escape(c.energy_daily_entity || "") +
      '" aria-label="Відкрити енергію сьогодні" ' +
      this._disabled(!this._state(c.energy_daily_entity)) +
      '><span class="socket-energy-copy"><span class="secondary">' +
      this._escape(c.energy_label || "Енергія сьогодні") +
      '</span><span class="socket-energy-value"><span data-live="socket-energy">' +
      this._socketReading("energy_daily_entity", 2, "energy") +
      '</span><small>кВт·год</small></span></span><svg class="socket-energy-chart" data-socket-chart="energy" viewBox="0 0 192 40" preserveAspectRatio="none" role="img" aria-label="Споживання енергії за годинами сьогодні" hidden><path></path></svg></button>' +
      '<div class="socket-metrics">' +
      this._socketReadingMetric("power", "power_entity", "Потужність", "zap", 0, "power", "socket-power", "Вт") +
      this._socketReadingMetric("voltage", "voltage_entity", "Напруга", "activity", 1, "voltage", "socket-voltage", "В") +
      this._socketReadingMetric("current", "current_entity", "Струм", "gauge", 2, "current", "socket-current", "А") +
      "</div></article>"
    );
  }

  _socketReadingMetric(key, entityKey, label, iconName, digits, conversion, liveKey, unit) {
    const entity = this._config[entityKey] || "";
    return '<button class="socket-reading" type="button" data-action="more" data-socket-metric="' +
      key + '" data-entity="' + this._escape(entity) + '" aria-label="Відкрити ' +
      this._escape(label) + '" ' + this._disabled(!this._state(entity)) +
      '><span class="socket-reading-label secondary">' + this._lucideIcon(iconName) +
      this._escape(label) + '</span><span class="socket-reading-value"><span data-live="' + liveKey + '">' +
      this._socketReading(entityKey, digits, conversion) + '</span><small>' + unit +
      "</small></span></button>";
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
      ["power", "power_entity", "socket-power", 0, "power"],
      ["voltage", "voltage_entity", "socket-voltage", 1, "voltage"],
      ["current", "current_entity", "socket-current", 2, "current"],
      ["energy", "energy_daily_entity", "socket-energy", 2, "energy"],
    ];
    for (const [key, entityKey, liveKey, digits, conversion] of values) {
      const value = this._socketReading(entityKey, digits, conversion);
      this._setText(`[data-live="${liveKey}"]`, value);
      const metric = this.shadowRoot.querySelector(`[data-socket-metric="${key}"]`);
      if (metric) {
        metric.disabled = !this._state(this._config[entityKey]);
        metric.dataset.entity = this._config[entityKey] || "";
      }
      metric?.querySelector(".socket-reading-value, .socket-energy-value")
        ?.classList.toggle("socket-missing", value === "—");
      metric?.querySelector(".socket-reading-value small, .socket-energy-value small")
        ?.toggleAttribute("hidden", value === "—");
    }
    this._renderSocketHistory("energy");
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
