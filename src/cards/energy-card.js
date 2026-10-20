class HomeEnergyCard extends HomeDeviceStandaloneCard {
  static get cardType() {
    return "energy";
  }
  static get cardTitle() {
    return ["power_entity", "Споживання"];
  }
  _content() {
    return `<div class="desktop-board">${this._energyOverview()}</div>`;
  }
  _energyOverview() {
    const c = this._config;
    return `<article class="panel desktop-energy" aria-label="Енергія бойлера"><div class="energy-heading"><div><h2>Споживання бойлера</h2><span class="secondary">Потужність та історія</span></div><span class="power-now"><span data-live="power">${this._format(this._value(c.power_entity), 0)}</span> <small>Вт зараз</small></span></div><div class="energy-stats"><div><span class="secondary">Сьогодні</span><strong><span data-live="energy-daily">${this._format(this._value(c.energy_daily), 2)}</span> <small>кВт·год</small></strong></div><div><span class="secondary">Цього місяця</span><strong><span data-live="energy-monthly">${this._format(this._value(c.energy_monthly), 2)}</span> <small>кВт·год</small></strong></div></div><div class="graph-slot" data-graph="boiler"><span class="secondary">Завантаження історії…</span></div><button class="text-button" data-action="view-energy">Детальні показники${this._icon("arrow-top-right")}</button></article>`;
  }
  _updateCardDynamic({ all, has }) {
    const sources = [
      this._config.power_entity,
      this._config.voltage_entity,
      this._config.current_entity,
      this._config.energy_total,
      this._config.energy_daily,
      this._config.energy_monthly,
    ];
    if (all || sources.some(has)) this._updateEnergy();
  }
  _graphDefinitions() {
    return {
      boiler: {
        entities: [this._config.power_entity],
        show_names: false,
        grid_options: { rows: 4 },
      },
    };
  }
  _graphCardHeight() {
    return "200px";
  }
}
if (!customElements.get("home-energy-card"))
  customElements.define("home-energy-card", HomeEnergyCard);
