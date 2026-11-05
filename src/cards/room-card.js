class HomeRoomCard extends HomeDeviceStandaloneCard {
  constructor() {
    super();
    this._roomHistoryToken = 0;
    this._roomHistoryEntity = null;
    this._roomHistoryLoadedAt = 0;
    this._roomHistoryLoading = false;
    this._roomHistory = null;
    this._roomHistoryRange = null;
  }

  setConfig(config) {
    const previousEntity = this._roomHistoryEntity;
    const entity = config?.room_temperature_entity || null;
    if (entity !== previousEntity) {
      this._roomHistoryToken++;
      this._roomHistoryEntity = entity;
      this._roomHistoryLoadedAt = 0;
      this._roomHistoryLoading = false;
      this._roomHistory = null;
      this._roomHistoryRange = null;
    }
    super.setConfig(config);
    if (this.isConnected) this._loadRoomHistory();
  }

  set hass(hass) {
    super.hass = hass;
    this._loadRoomHistory();
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadRoomHistory();
  }

  disconnectedCallback() {
    this._roomHistoryToken++;
    this._roomHistoryLoading = false;
    super.disconnectedCallback();
  }

  static get cardType() {
    return "room";
  }
  static get cardTitle() {
    return ["room_temperature_entity", "Спальня"];
  }
  getGridOptions() {
    return { columns: 6, rows: 4, min_columns: 3, min_rows: 2 };
  }
  getCardSize() {
    return 4;
  }
  _content() {
    return this._room();
  }
  _roomValue(entityKey, digits) {
    const id = this._config[entityKey];
    return this._available(id) ? this._format(this._value(id), digits) : "—";
  }

  async _loadRoomHistory() {
    const entity = this._config?.room_temperature_entity;
    if (
      !this.isConnected ||
      !entity ||
      typeof this._hass?.callApi !== "function" ||
      this._roomHistoryLoading ||
      (this._roomHistoryLoadedAt &&
        Date.now() - this._roomHistoryLoadedAt < 300000)
    )
      return;

    this._roomHistoryLoading = true;
    this._roomHistoryEntity = entity;
    const token = ++this._roomHistoryToken;
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    const path = `history/period/${encodeURIComponent(start.toISOString())}?filter_entity_id=${encodeURIComponent(entity)}&end_time=${encodeURIComponent(end.toISOString())}&minimal_response&no_attributes`;
    try {
      const response = await this._hass.callApi("GET", path);
      if (
        token !== this._roomHistoryToken ||
        !this.isConnected ||
        this._config?.room_temperature_entity !== entity
      )
        return;
      const samples = Array.isArray(response?.[0]) ? response[0] : [];
      const points = samples
        .map((sample) => ({
          time: Date.parse(sample?.last_changed || sample?.last_updated),
          value: this._number(sample?.state),
        }))
        .filter((point) => Number.isFinite(point.time))
        .sort((left, right) => left.time - right.time);
      this._roomHistory =
        points.filter((point) => point.value !== null).length > 1
          ? points
          : null;
      this._roomHistoryRange = {
        start: start.getTime(),
        end: end.getTime(),
      };
      this._roomHistoryLoadedAt = Date.now();
      this._renderRoomHistory();
    } catch {
      if (token === this._roomHistoryToken) {
        this._roomHistory = null;
        this._roomHistoryLoadedAt = Date.now();
        this._renderRoomHistory();
      }
    } finally {
      if (token === this._roomHistoryToken) this._roomHistoryLoading = false;
    }
  }

  _renderRoomHistory() {
    const button = this.shadowRoot.querySelector('[data-live="room-history"]');
    const history = this._roomHistory;
    if (!button) return;
    if (!history) {
      button.hidden = true;
      return;
    }
    const values = history
      .map(({ value }) => value)
      .filter((value) => value !== null);
    const min = Math.min(...values), max = Math.max(...values);
    const width = 260, height = 48, padding = 2;
    const first = this._roomHistoryRange?.start ?? history[0].time;
    const last = this._roomHistoryRange?.end ?? history.at(-1).time;
    const low = min === max ? min - 0.5 : min;
    const high = min === max ? max + 0.5 : max;
    const x = (point, index) =>
      last === first
        ? padding + index * (width - padding * 2) / (history.length - 1)
        : padding + (point.time - first) * (width - padding * 2) / (last - first);
    const y = (value) =>
      height - padding - (value - low) * (height - padding * 2) / (high - low);
    let path = "";
    let previousWasValid = false;
    history.forEach((point, index) => {
      if (point.value === null) {
        previousWasValid = false;
        return;
      }
      path += `${previousWasValid ? "L" : "M"}${x(point, index).toFixed(1)} ${y(point.value).toFixed(1)} `;
      previousWasValid = true;
    });
    const label = `${this._format(min, 1)} — ${this._format(max, 1)} °C`;
    button.hidden = false;
    button.setAttribute("aria-label", `Температура за 24 години: ${label}. Відкрити сутність.`);
    button.querySelector('[data-live="room-history-range"]').textContent = label;
    button.querySelector("[data-live-room-history-path]")?.setAttribute("d", path);
  }

  _room() {
    const c = this._config,
      batteryId = c.battery_entity,
      battery = this._state(batteryId);
    const batteryAvailable = this._available(batteryId);
    const batteryValue = batteryAvailable ? this._number(battery.state) : null;
    const icon = (name) => this._lucideIcon(name);
    const batteryHtml = batteryId
      ? '<span class="room-battery" data-live="room-battery" ' +
        (batteryAvailable ? "" : "hidden") +
        ">" +
        icon("battery-medium") +
        "<span>" +
        (batteryValue === null ? "—" : this._format(batteryValue, 0) + "%") +
        "</span></span>"
      : "";
    return (
      '<article class="room-sensor-card" data-live-panel="room" aria-label="Температура та вологість">' +
      '<header class="room-header"><span class="room-icon">' +
      icon("thermometer") +
      '</span><div class="room-heading"><h2>' +
      this._escape(c.title || "Спальня") +
      '</h2><span class="secondary">Температура та вологість</span></div>' +
      batteryHtml +
      "</header>" +
      '<div class="room-readings"><div class="room-reading"><span class="secondary">' +
      icon("thermometer") +
      this._escape(c.room_temperature_label || "Температура") +
      '</span><button class="metric-value room-more-info" data-room-more="temperature" data-action="more" data-entity="' +
      this._escape(c.room_temperature_entity || "") +
      '" aria-label="Відкрити температуру" ' +
      this._disabled(!this._state(c.room_temperature_entity)) +
      '><span data-live="room-temperature">' +
      this._roomValue("room_temperature_entity", 1) +
      "</span><small>°C</small></button></div>" +
      '<div class="room-reading"><span class="secondary">' +
      icon("droplets") +
      this._escape(c.humidity_label || "Вологість") +
      '</span><button class="metric-value room-more-info" data-room-more="humidity" data-action="more" data-entity="' +
      this._escape(c.humidity_entity || "") +
      '" aria-label="Відкрити вологість" ' +
      this._disabled(!this._state(c.humidity_entity)) +
      '><span data-live="room-humidity">' +
      this._roomValue("humidity_entity", 0) +
      "</span><small>%</small></button></div></div>" +
      '<button class="room-history" data-live="room-history" data-room-more="history" data-action="more" data-entity="' +
      this._escape(c.room_temperature_entity || "") +
      '" aria-label="Відкрити історію температури" ' +
      this._disabled(!this._state(c.room_temperature_entity)) +
      ' hidden><svg class="room-history-chart" viewBox="0 0 260 48" preserveAspectRatio="none" role="img" aria-label="Температура за 24 години"><path data-live-room-history-path></path></svg><span class="room-history-caption"><span>За 24 години</span><span data-live="room-history-range"></span></span></button>' +
      "</article>"
    );
  }

  _updateRoom() {
    for (const key of ["room-temperature", "room-humidity"]) {
      const value = this._roomValue(
        key === "room-temperature"
          ? "room_temperature_entity"
          : "humidity_entity",
        1,
      );
      this.shadowRoot
        .querySelector(`[data-live="${key}"]`)
        ?.parentElement?.classList.toggle("room-missing", value === "—");
    }
    this._setText(
      '[data-live="room-temperature"]',
      this._roomValue("room_temperature_entity", 1),
    );
    this._setText(
      '[data-live="room-humidity"]',
      this._roomValue("humidity_entity", 0),
    );
    for (const [selector, key] of [
      ['[data-room-more="temperature"]', "room_temperature_entity"],
      ['[data-room-more="humidity"]', "humidity_entity"],
      ['[data-room-more="history"]', "room_temperature_entity"],
    ]) {
      const button = this.shadowRoot.querySelector(selector);
      if (button) {
        button.dataset.entity = this._config[key] || "";
        button.disabled = !this._state(this._config[key]);
      }
    }
    this._renderRoomHistory();
    const batteryId = this._config.battery_entity,
      battery = this._state(batteryId);
    const available = this._available(batteryId),
      value = available ? this._number(battery.state) : null;
    this._setHidden('[data-live="room-battery"]', !batteryId || !available);
    this._setText(
      '[data-live="room-battery"] span',
      value === null ? "—" : this._format(value, 0) + "%",
    );
  }
  _updateCardDynamic({ all, has }) {
    const sources = [
      this._config.room_temperature_entity,
      this._config.humidity_entity,
      this._config.battery_entity,
    ];
    if (all || sources.some(has)) this._updateRoom();
  }
}
if (!customElements.get("home-room-card"))
  customElements.define("home-room-card", HomeRoomCard);
