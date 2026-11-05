class HomeRoomCard extends HomeDeviceStandaloneCard {
  constructor() {
    super();
    this._roomHistories = new Map();
    this._roomHistoryTokens = new Map();
    this._roomHistoryLoading = new Set();
    this._roomHistoryLoadedAt = new Map();
  }

  setConfig(config) {
    for (const [key, entityKey] of Object.entries({
      temperature: "room_temperature_entity",
      humidity: "humidity_entity",
    })) {
      if (config?.[entityKey] !== this._config?.[entityKey]) this._clearRoomHistory(key);
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
    for (const key of ["temperature", "humidity"])
      this._roomHistoryTokens.set(key, (this._roomHistoryTokens.get(key) || 0) + 1);
    this._roomHistoryLoading.clear();
    super.disconnectedCallback();
  }

  static get cardType() {
    return "room";
  }
  static get cardTitle() {
    return ["room_temperature_entity", "Спальня"];
  }
  getGridOptions() {
    return { columns: 6, rows: 3, min_columns: 3, min_rows: 2 };
  }
  getCardSize() {
    return 3;
  }
  _content() {
    return this._room();
  }
  _roomValue(entityKey, digits) {
    const id = this._config[entityKey];
    return this._available(id) ? this._format(this._value(id), digits) : "—";
  }

  _clearRoomHistory(key) {
    this._roomHistoryTokens.set(key, (this._roomHistoryTokens.get(key) || 0) + 1);
    this._roomHistoryLoading.delete(key);
    this._roomHistoryLoadedAt.delete(key);
    this._roomHistories.delete(key);
  }

  async _loadRoomHistory() {
    if (!this.isConnected || typeof this._hass?.callApi !== "function") return;
    await Promise.all([
      this._loadRoomHistoryFor("temperature", "room_temperature_entity"),
      this._loadRoomHistoryFor("humidity", "humidity_entity"),
    ]);
  }

  async _loadRoomHistoryFor(key, entityKey) {
    const entity = this._config?.[entityKey];
    const loadedAt = this._roomHistoryLoadedAt.get(key);
    if (!entity || this._roomHistoryLoading.has(key) ||
      (loadedAt && Date.now() - loadedAt < 300000)) return;
    this._roomHistoryLoading.add(key);
    const token = (this._roomHistoryTokens.get(key) || 0) + 1;
    this._roomHistoryTokens.set(key, token);
    const end = new Date(), start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    const path = `history/period/${encodeURIComponent(start.toISOString())}?filter_entity_id=${encodeURIComponent(entity)}&end_time=${encodeURIComponent(end.toISOString())}&minimal_response&no_attributes`;
    try {
      const response = await this._hass.callApi("GET", path);
      if (token !== this._roomHistoryTokens.get(key) || !this.isConnected || this._config?.[entityKey] !== entity) return;
      const samples = Array.isArray(response?.[0]) ? response[0] : [];
      const points = samples.map((sample) => ({
        time: Date.parse(sample?.last_changed || sample?.last_updated),
        value: this._number(sample?.state),
      })).filter((point) => Number.isFinite(point.time))
        .sort((left, right) => left.time - right.time);
      const reduced = this._downsampleRoomHistory(points, 60);
      this._roomHistories.set(key, reduced.filter((point) => point.value !== null).length > 1
        ? { points: reduced, start: start.getTime(), end: end.getTime() }
        : null);
      this._roomHistoryLoadedAt.set(key, Date.now());
      this._renderRoomHistory(key);
    } catch {
      if (token === this._roomHistoryTokens.get(key)) {
        this._roomHistories.set(key, null);
        this._roomHistoryLoadedAt.set(key, Date.now());
        this._renderRoomHistory(key);
      }
    } finally {
      if (token === this._roomHistoryTokens.get(key)) this._roomHistoryLoading.delete(key);
    }
  }

  _downsampleRoomHistory(points, limit) {
    if (points.length <= limit) return points;
    const buckets = Array.from({ length: limit }, () => []);
    const first = points[0].time, last = points.at(-1).time;
    for (const point of points) {
      const index = Math.min(limit - 1, Math.floor((point.time - first) * limit / (last - first || 1)));
      buckets[index].push(point);
    }
    return buckets.flatMap((bucket) => {
      const reduced = [];
      let run = [];
      const flush = () => {
        if (!run.length) return;
        reduced.push({
          time: run.reduce((sum, point) => sum + point.time, 0) / run.length,
          value: run.reduce((sum, point) => sum + point.value, 0) / run.length,
        });
        run = [];
      };
      for (const point of bucket) {
        if (point.value === null) {
          flush();
          if (reduced.at(-1)?.value !== null) reduced.push(point);
        } else {
          run.push(point);
        }
      }
      flush();
      return reduced;
    });
  }

  _renderRoomHistory(key) {
    const button = this.shadowRoot.querySelector(`[data-live="room-history-${key}"]`);
    const history = this._roomHistories.get(key);
    if (!button) return;
    if (!history) {
      button.hidden = true;
      return;
    }
    const { points, start, end } = history;
    const values = points
      .map(({ value }) => value)
      .filter((value) => value !== null);
    const min = Math.min(...values), max = Math.max(...values);
    const width = 180, height = 24, padding = 1;
    const low = min === max ? min - 0.5 : min;
    const high = min === max ? max + 0.5 : max;
    const x = (point) =>
      start === end
        ? padding
        : padding + (point.time - start) * (width - padding * 2) / (end - start);
    const y = (value) =>
      height - padding - (value - low) * (height - padding * 2) / (high - low);
    let path = "";
    let previousWasValid = false;
    points.forEach((point) => {
      if (point.value === null) {
        previousWasValid = false;
        return;
      }
      path += `${previousWasValid ? "L" : "M"}${x(point).toFixed(1)} ${y(point.value).toFixed(1)} `;
      previousWasValid = true;
    });
    button.hidden = false;
    button.setAttribute("aria-label", `${key === "temperature" ? "Температура" : "Вологість"} за 24 години. Відкрити сутність.`);
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
      "</span><small>°C</small></button><button class=\"room-history\" data-live=\"room-history-temperature\" data-room-more=\"history-temperature\" data-action=\"more\" data-entity=\"" +
      this._escape(c.room_temperature_entity || "") +
      '" aria-label="Відкрити історію температури" ' +
      this._disabled(!this._state(c.room_temperature_entity)) +
      ' hidden><svg class="room-history-chart" viewBox="0 0 180 24" preserveAspectRatio="none" role="img" aria-label="Температура за 24 години"><path data-live-room-history-path></path></svg></button></div>' +
      '<div class="room-reading"><span class="secondary">' +
      icon("droplets") +
      this._escape(c.humidity_label || "Вологість") +
      '</span><button class="metric-value room-more-info" data-room-more="humidity" data-action="more" data-entity="' +
      this._escape(c.humidity_entity || "") +
      '" aria-label="Відкрити вологість" ' +
      this._disabled(!this._state(c.humidity_entity)) +
      '><span data-live="room-humidity">' +
      this._roomValue("humidity_entity", 0) +
      "</span><small>%</small></button><button class=\"room-history\" data-live=\"room-history-humidity\" data-room-more=\"history-humidity\" data-action=\"more\" data-entity=\"" +
      this._escape(c.humidity_entity || "") +
      '" aria-label="Відкрити історію вологості" ' +
      this._disabled(!this._state(c.humidity_entity)) +
      ' hidden><svg class="room-history-chart" viewBox="0 0 180 24" preserveAspectRatio="none" role="img" aria-label="Вологість за 24 години"><path data-live-room-history-path></path></svg></button></div></div>' +
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
      ['[data-room-more="history-temperature"]', "room_temperature_entity"],
      ['[data-room-more="history-humidity"]', "humidity_entity"],
    ]) {
      const button = this.shadowRoot.querySelector(selector);
      if (button) {
        button.dataset.entity = this._config[key] || "";
        button.disabled = !this._state(this._config[key]);
      }
    }
    this._renderRoomHistory("temperature");
    this._renderRoomHistory("humidity");
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
