class HomeLeakListCard extends HomeNamedSensorListCard {
  static get cardType() {
    return "leak_list";
  }

  static getConfigForm() {
    return homeRepeatableCardForm("sensors", "Датчики", {
      name: HOME_SENSOR_LIST_NAME_FIELD,
      entity: {
        label: "Датчик протікання",
        required: true,
        selector: { entity: { filter: { domain: "binary_sensor", device_class: "moisture" } } },
      },
    });
  }

  setConfig(config) {
    const sensors = config?.sensors ?? [];
    if (!Array.isArray(sensors)) throw new Error('Configuration option "sensors" must be a list.');
    super.setConfig({
      ...this._validatedConfig(config, [], ["title"]),
      sensors: sensors.map(sensor => this._validatedConfig(sensor, ["entity"])),
    });
  }

  getCardSize() {
    return 1 + (this._config?.sensors.length ?? 0);
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6 };
  }

  _entityIds() {
    return (this._config?.sensors ?? []).map(({ entity }) => entity).filter(Boolean);
  }

  _content() {
    const { sensors, title } = this._config;
    const rows = sensors.map(({ name, entity }) => {
      const label = this._sensorListName(entity, name, "Датчик протікання");
      const state = this._state(entity);
      const status = homeBinarySensorStatus(state, "Виявлено воду", "Сухо");
      return `<div class="sensor-list-row" role="listitem">
        <span class="sensor-list-name">${this._sensorListIcon(entity, "mdi:water-outline")}${this._escape(label)}</span>
        <button type="button" class="sensor-list-reading leak-list-status" data-action="more"
          data-entity="${this._escape(entity)}" data-state="${status.state}" data-label="${this._escape(label)}"
          aria-label="${this._escape(label)}: ${status.label}" ${this._disabled(!state)}>${status.label}</button>
      </div>`;
    }).join("");
    return `<article class="sensor-list leak-list">
      <div class="sensor-list-row sensor-list-heading">
        <div class="sensor-list-title">
          <span class="sensor-list-icon">${this._icon("waves")}</span>
          <h2>${this._escape(title?.trim() || "Протікання води")}</h2>
        </div>
      </div>
      ${rows ? `<div role="list">${rows}</div>` : '<p class="secondary">Додай датчики в редакторі картки.</p>'}
    </article>`;
  }

  _updateCardDynamic({ all, has }) {
    this._updateSensorListIcons({ all, has });
    for (const button of this.shadowRoot.querySelectorAll(".leak-list-status")) {
      const { entity, label } = button.dataset;
      if (!all && !has(entity)) continue;
      const state = this._state(entity);
      const status = homeBinarySensorStatus(state, "Виявлено воду", "Сухо");
      if (button.textContent !== status.label) button.textContent = status.label;
      button.dataset.state = status.state;
      button.setAttribute("aria-label", `${label}: ${status.label}`);
      button.disabled = !state;
    }
  }
}

if (!customElements.get("home-leak-list-card"))
  customElements.define("home-leak-list-card", HomeLeakListCard);
