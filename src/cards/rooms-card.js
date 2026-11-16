class HomeRoomsCard extends HomeDeviceStandaloneCard {
  static get cardType() {
    return "rooms";
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        {
          name: "rooms",
          selector: {
            object: {
              multiple: true,
              label_field: "name",
              fields: {
                name: { label: "Назва кімнати", required: true, selector: { text: {} } },
                icon: { label: "Іконка", selector: { icon: {} } },
                temperature_entity: {
                  label: "Температура",
                  selector: { entity: { domain: ["sensor"] } },
                },
                humidity_entity: {
                  label: "Вологість",
                  selector: { entity: { domain: ["sensor"] } },
                },
              },
            },
          },
        },
      ],
      computeLabel: ({ name }) => name === "title" ? "Назва картки" : "Кімнати",
    };
  }

  setConfig(config) {
    const rooms = config?.rooms ?? [];
    if (!Array.isArray(rooms)) throw new Error('Configuration option "rooms" must be a list.');
    super.setConfig({
      ...this._validatedConfig(config, [], ["title"]),
      rooms: rooms.map(room => this._validatedConfig(
        room,
        ["temperature_entity", "humidity_entity"],
        ["name", "icon"],
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
    return `<button type="button" class="rooms-reading rooms-${metric}" data-rooms-metric="${metric}"
      data-action="more" data-entity="${id}" aria-label="${label}: ${reading}" data-label="${label}"
      ${this._disabled(!this._state(entity))}>${reading}</button>`;
  }

  _content() {
    const { rooms, title } = this._config;
    const rows = rooms.map(room => {
      const name = room.name?.trim() || "Кімната";
      return `<div class="rooms-row" role="listitem">
        <span class="rooms-name"><ha-icon icon="${this._escape(room.icon || "mdi:home-outline")}" aria-hidden="true"></ha-icon>${this._escape(name)}</span>
        ${this._roomReadingButton(room.temperature_entity, "temperature", name)}
        ${this._roomReadingButton(room.humidity_entity, "humidity", name)}
      </div>`;
    }).join("");
    return `<article class="rooms-list">
      <h2>${this._escape(title?.trim() || "Кімнати")}</h2>
      ${rows ? `<div class="rooms-row rooms-heading" aria-hidden="true">
        <span></span><span>Температура</span><span>Вологість</span>
      </div><div role="list">${rows}</div>` : '<p class="secondary">Додай кімнати в редакторі картки.</p>'}
    </article>`;
  }

  _updateCardDynamic({ all, has }) {
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
