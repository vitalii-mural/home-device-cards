class HomeEnergyDetailsCard extends HomeDeviceStandaloneCard {
  static get cardType() {
    return "energy_details";
  }
  static get cardTitle() {
    return ["power_entity", "Споживання"];
  }
  _content() {
    return this._energy();
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
        title: "Потужність бойлера · 24 години",
        entities: [this._config.power_entity],
      },
    };
  }
}
if (!customElements.get("home-energy-details-card"))
  customElements.define("home-energy-details-card", HomeEnergyDetailsCard);
