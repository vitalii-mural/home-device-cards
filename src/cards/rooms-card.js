class HomeRoomsCard extends HomeNamedSensorListCard {
  static get cardType() {
    return "rooms";
  }

  static getConfigForm() {
    return homeRepeatableCardForm("rooms", "Кімнати", {
      name: HOME_SENSOR_LIST_NAME_FIELD,
      icon: { label: "Іконка", selector: { icon: {} } },
      temperature_entity: { label: "Температура", selector: { entity: { domain: ["sensor"] } } },
      humidity_entity: { label: "Вологість", selector: { entity: { domain: ["sensor"] } } },
    });
  }

  setConfig(config) {
    const rooms = config?.rooms ?? [];
    if (!Array.isArray(rooms)) throw new Error('Configuration option "rooms" must be a list.');
    super.setConfig({
      ...this._validatedConfig(config, [], ["title"]),
      rooms: rooms.map(room => this._validatedConfig(
        room,
        ["temperature_entity", "humidity_entity"],
        ["icon"],
      )),
    });
  }

  getCardSize() {
    return 1 + (this._config?.rooms.length ?? 0);
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }

  _entityIds() {
    return (this._config?.rooms ?? [])
      .flatMap(({ temperature_entity, humidity_entity }) => [temperature_entity, humidity_entity])
      .filter(Boolean);
  }

  _roomReading(entity, metric) {
    const temperature = metric === "temperature";
    const state = this._state(entity);
    const value = this._value(entity);
    const unit = state?.attributes?.unit_of_measurement || (temperature ? "°C" : "%");
    return value === null ? "—" : this._format(value, temperature ? 1 : 0) + (unit === "%" ? "" : " ") + unit;
  }

  _roomReadingButton(entity, metric, room) {
    const id = this._escape(entity);
    const label = this._escape((metric === "temperature" ? "Температура" : "Вологість") + " · " + room);
    const reading = this._escape(this._roomReading(entity, metric));
    return `<button type="button" class="sensor-list-reading rooms-${metric}" data-rooms-metric="${metric}"
      data-action="more" data-entity="${id}" aria-label="${label}: ${reading}" data-label="${label}"
      ${this._disabled(!this._state(entity))}>${reading}</button>`;
  }

  _content() {
    const { rooms, title } = this._config;
    const rows = rooms.map(room => {
      const entity = room.temperature_entity || room.humidity_entity;
      const name = this._sensorListName(entity, room.name, "Кімната");
      const icon = room.icon ? `<ha-icon icon="${this._escape(room.icon)}" aria-hidden="true"></ha-icon>` : this._sensorListIcon(entity, "mdi:home-outline");
      return `<div class="sensor-list-row" role="listitem">
        <span class="sensor-list-name">${icon}${this._escape(name)}</span>
        ${this._roomReadingButton(room.temperature_entity, "temperature", name)}
        ${this._roomReadingButton(room.humidity_entity, "humidity", name)}
      </div>`;
    }).join("");
    return `<article class="sensor-list">
      <div class="sensor-list-row sensor-list-heading">
        <div class="sensor-list-title">
          <span class="sensor-list-icon">${this._lucideIcon("thermometer")}</span>
          <h2>${this._escape(title?.trim() || "Мікроклімат")}</h2>
        </div>
        <span aria-hidden="true">Температура</span>
        <span aria-hidden="true">Вологість</span>
      </div>
      ${rows ? `<div role="list">${rows}</div>` : '<p class="secondary">Додай кімнати в редакторі картки.</p>'}
    </article>`;
  }

  _updateCardDynamic({ all, has }) {
    this._updateSensorListIcons({ all, has });
    for (const button of this.shadowRoot.querySelectorAll("[data-rooms-metric]")) {
      const { entity, roomsMetric, label } = button.dataset;
      if (!all && !has(entity)) continue;
      const reading = this._roomReading(entity, roomsMetric);
      if (button.textContent !== reading) button.textContent = reading;
      button.setAttribute("aria-label", `${label}: ${reading}`);
      button.disabled = !this._state(entity);
    }
  }
}

if (!customElements.get("home-rooms-card"))
  customElements.define("home-rooms-card", HomeRoomsCard);
