class HomeRoomCard extends HomeDeviceStandaloneCard {
  static get cardType() {
    return "room";
  }
  static get cardTitle() {
    return ["room_temperature_entity", "Спальня"];
  }
  _content() {
    return this._room();
  }
  _roomValue(entityKey, digits) {
    const id = this._config[entityKey];
    return this._available(id) ? this._format(this._value(id), digits) : "—";
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
      '</span><div class="metric-value"><span data-live="room-temperature">' +
      this._roomValue("room_temperature_entity", 1) +
      "</span><small>°C</small></div></div>" +
      '<div class="room-reading"><span class="secondary">' +
      icon("droplets") +
      this._escape(c.humidity_label || "Вологість") +
      '</span><div class="metric-value"><span data-live="room-humidity">' +
      this._roomValue("humidity_entity", 0) +
      "</span><small>%</small></div></div></div>" +
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
