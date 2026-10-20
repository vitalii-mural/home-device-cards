class HomeRiverCard extends HomeDeviceStandaloneCard {
  static get cardType() {
    return "river";
  }
  static get cardTitle() {
    return ["river_status", "EcoFlow RIVER Max"];
  }
  _content() {
    return this._river();
  }
  _riverRead(configKey, unit, digits = 1) {
    if (this._state(this._config.river_status)?.state !== "online") return "—";
    const state = this._state(this._config[configKey]);
    let value = this._number(state?.state);
    if (value === null) return "—";
    const sensorUnit = String(state?.attributes?.unit_of_measurement || "")
      .trim()
      .toLowerCase();
    if (
      unit === "A" &&
      (!sensorUnit ||
        sensorUnit === "ma" ||
        sensorUnit === "milliamp" ||
        sensorUnit === "milliamps")
    )
      value /= 1000;
    if (
      ["V", "В"].includes(unit) &&
      (sensorUnit === "mv" ||
        sensorUnit === "millivolt" ||
        sensorUnit === "millivolts")
    )
      value /= 1000;
    return unit
      ? `${this._format(value, digits)} ${unit}`
      : this._format(value, digits);
  }

  _riverRuntime() {
    if (this._state(this._config.river_status)?.state !== "online") return "—";
    const state = this._state(this._config.river_runtime);
    const value = this._number(state?.state);
    if (value === null || value <= 0) return "—";
    const unit = String(state?.attributes?.unit_of_measurement || "min")
      .trim()
      .toLowerCase();
    const minutes =
      unit === "s" || unit.startsWith("sec")
        ? value / 60
        : unit === "h" || unit.startsWith("hour")
          ? value * 60
          : value;
    const total = Math.round(minutes),
      hours = Math.floor(total / 60),
      remainingMinutes = total % 60;
    return hours
      ? `${hours} год ${remainingMinutes} хв`
      : `${remainingMinutes} хв`;
  }

  _river() {
    const c = this._config,
      online = this._state(c.river_status)?.state === "online";
    const percent = online
      ? this._number(this._state(c.river_battery)?.state)
      : null;
    const fill = percent === null ? 0 : Math.max(0, Math.min(100, percent));
    const icon = (name) => this._lucideIcon(name);
    const output = (configKey, label, iconName) =>
      `<div><span>${icon(iconName)}${label}</span><strong><span data-live="river-output-${configKey.replace(/^river_/, "").replace(/_output$/, "")}">${this._riverRead(configKey, "", 0)}</span><small>Вт</small></strong></div>`;
    const battery = (title, prefix, iconName) => {
      const level = online
        ? this._number(this._state(c[`${prefix}_level_entity`])?.state)
        : null;
      const levelFill = level === null ? 0 : Math.max(0, Math.min(100, level));
      return `<div class="river-battery"><div class="river-battery-title">${icon(iconName)}<span>${title}</span></div><div class="river-percent"><span data-live="river-${prefix}-level">${level === null ? "—" : this._format(level, 0)}</span><small>%</small></div><div class="river-track"><span data-live="river-${prefix}-fill" style="width:${levelFill}%"></span></div><div class="river-readings"><div class="river-reading">${icon("thermometer")}<span data-live="river-${prefix}-temperature">${this._riverRead(`${prefix}_temperature_entity`, "°C", 0)}</span></div><div class="river-reading">${icon("zap")}<span data-live="river-${prefix}-volts">${this._riverRead(`${prefix}_volts_entity`, "В", 1)}</span></div></div></div>`;
    };
    const detailRows = [
      [
        "Струм",
        this._riverRead("main_current_entity", "A", 1),
        this._riverRead("slave_current_entity", "A", 1),
        "current",
      ],
      [
        "Цикли",
        this._riverRead("main_cycles_entity", "", 0),
        this._riverRead("slave_cycles_entity", "", 0),
        "cycles",
      ],
      [
        "Мін. комірка",
        this._riverRead("main_min_cells_entity", "В", 2),
        this._riverRead("slave_min_cells_entity", "В", 2),
        "min-cell",
      ],
      [
        "Макс. комірка",
        this._riverRead("main_max_cells_entity", "В", 2),
        this._riverRead("slave_max_cells_entity", "В", 2),
        "max-cell",
      ],
    ];
    return `<style>
.river-card{--river-line:var(--k-line);--river-soft:var(--k-soft);--river-accent:var(--k-accent);width:100%;max-width:none;margin:0;padding:20px;border-radius:23px;background:var(--k-card);color:var(--k-text);font:14px/1.4 system-ui,sans-serif}
.river-card *{box-sizing:border-box}.river-card svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}.river-card .secondary{display:flex;align-items:center;gap:5px;margin-top:0;color:var(--k-muted);font-size:12px;line-height:1.4}.river-header{display:flex;align-items:center;gap:10px;padding:0}.river-device{display:grid;place-items:center;width:39px;height:39px;border-radius:14px;background:var(--k-accent-bg);color:var(--k-accent)}.river-device svg{width:21px;height:21px}.river-heading{flex:1;min-width:0}.river-heading h2{font-size:14px;font-weight:500;line-height:1.4;letter-spacing:normal;margin:0}.river-heading .secondary{margin:1px 0 0}.river-connection{display:flex;align-items:center;color:var(--k-accent)}.river-connection.offline{color:var(--k-muted)}
.river-charge{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:16px 0 12px}.river-large{font-size:46px;line-height:1;letter-spacing:-2px;font-variant-numeric:tabular-nums;margin-bottom:6px}.river-large small{font-size:18px;letter-spacing:0;vertical-align:top;margin-left:4px}.river-runtime{text-align:right}.river-runtime .secondary{justify-content:flex-end}.river-runtime strong{display:block;font-size:18px;font-weight:400;margin-top:6px;font-variant-numeric:tabular-nums}.river-track{height:5px;border-radius:5px;background:var(--river-soft);overflow:hidden}.river-track>span{display:block;height:100%;border-radius:inherit;background:var(--river-accent);transition:width .2s ease}
.river-power{display:grid;grid-template-columns:1fr 1fr;margin:12px 0 14px}.river-power>div:last-child{border-left:1px solid var(--river-line);padding-left:20px}.river-power .secondary{display:flex;align-items:center;gap:5px}.river-power strong{display:block;font-size:25px;font-weight:400;margin-top:5px;font-variant-numeric:tabular-nums}.river-power strong small{font-size:12px;color:var(--k-muted);margin-left:5px}
.river-outputs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;margin-bottom:14px;padding:0 0 14px;border-bottom:1px solid var(--river-line)}.river-outputs[hidden],.river-outputs>div>div[hidden]{display:none}.river-output-column{display:contents}.river-outputs>div>div{display:flex;flex-direction:column;align-items:center;gap:7px;min-width:0;font-size:11px}.river-outputs>div>div>span{display:flex;align-items:center;gap:4px;color:var(--k-muted);white-space:nowrap}.river-outputs svg{width:14px;height:14px}.river-outputs strong{font-size:13px;font-weight:500;white-space:nowrap;font-variant-numeric:tabular-nums}.river-outputs strong small{font-size:10px;color:var(--k-muted);margin-left:2px}
.river-batteries{display:grid;grid-template-columns:1fr 1fr;background:var(--river-soft);border-radius:14px;padding:12px 0}.river-battery{padding:0 14px;min-width:0}.river-battery+.river-battery{border-left:1px solid var(--river-line)}.river-battery-title{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--k-muted)}.river-percent{font-size:28px;line-height:1.2;letter-spacing:-.6px;margin:8px 0 7px;font-variant-numeric:tabular-nums}.river-percent small{font-size:12px;margin-left:3px;color:var(--k-muted)}.river-battery .river-track{height:4px;margin-bottom:8px;background:var(--k-card)}.river-readings{display:flex;justify-content:space-between;align-items:center;gap:5px}.river-reading{display:flex;align-items:center;gap:3px;font-size:11px;white-space:nowrap;font-variant-numeric:tabular-nums}.river-reading svg{width:14px;height:14px;color:var(--k-muted)}
.river-details{display:flex;justify-content:space-between;align-items:center;width:100%;min-height:44px;padding:12px 0 0;background:transparent;color:var(--k-muted);font-size:12px}.river-details svg{transition:transform .15s ease}.river-details[aria-expanded=true] svg{transform:rotate(180deg)}.river-detail-row{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:6px;padding:10px 0;border-bottom:1px solid var(--river-line);font-size:11px}.river-detail-row>span:not(:first-child){text-align:right;font-variant-numeric:tabular-nums}.river-detail-head{color:var(--k-muted)}
@media(max-width:380px){.river-card{padding:16px}.river-battery{padding:0 10px}.river-outputs{gap:3px}.river-outputs>div>div>span{gap:2px;font-size:10px}.river-outputs svg{width:12px;height:12px}.river-outputs strong{font-size:12px}}
</style><article class="river-card" aria-label="EcoFlow RIVER Max" data-live-panel="river" data-offline="${!online}"><header class="river-header"><span class="river-device">${icon("battery-charging")}</span><div class="river-heading"><h2>${this._escape(this._config.title || "EcoFlow RIVER Max")}</h2><span class="secondary" data-live="river-status">${online ? "Онлайн" : "Станція офлайн"}</span></div><span class="river-connection ${online ? "" : "offline"}" data-live="river-connection" aria-label="${online ? "Онлайн" : "Офлайн"}">${icon("wifi")}</span></header><p class="river-offline-note" data-live="river-offline-note" ${online ? "hidden" : ""}>Станція офлайн. Поточні дані знову будуть після підключення.</p><div class="river-charge"><div><div class="river-large"><span data-live="river-battery">${percent === null ? "—" : this._format(percent, 0)}</span><small>%</small></div><span class="secondary">Загальний заряд</span></div><div class="river-runtime"><span class="secondary">${icon("clock-3")}Залишилось</span><strong data-live="river-runtime">${this._riverRuntime()}</strong></div></div><div class="river-track" role="meter" aria-label="Загальний заряд" aria-valuemin="0" aria-valuemax="100" ${percent === null ? "" : `aria-valuenow="${fill}"`}><span data-live="river-charge-fill" style="width:${fill}%"></span></div><div class="river-power"><div><span class="secondary">${icon("arrow-down-left")}Вхід</span><strong><span data-live="river-input">${this._riverRead("river_input", "", 0)}</span><small>Вт</small></strong></div><div><span class="secondary">${icon("arrow-up-right")}Загальний вихід</span><strong><span data-live="river-output">${this._riverRead("river_output", "", 0)}</span><small>Вт</small></strong></div></div><section class="river-outputs" aria-label="Потужність виходів"><div class="river-output-column">${output("river_ac_output", "AC", "plug")}${output("river_dc_output", "DC", "cable")}${output("river_usb_c_output", "USB-C", "usb")}</div><div class="river-output-column">${output("river_usb_1_output", "USB 1", "usb")}${output("river_usb_2_output", "USB 2", "usb")}${output("river_usb_3_output", "USB 3", "usb")}</div></section><section class="river-batteries" aria-label="Дві батареї">${battery("Основна", "main", "battery")}${battery("Додаткова", "slave", "battery-plus")}</section><button class="river-details" data-action="river-details" aria-expanded="false" aria-controls="river-extra"><span>Деталі батарей</span>${icon("chevron-down")}</button><div id="river-extra" hidden><div class="river-detail-row river-detail-head"><span></span><span>Основна</span><span>Додаткова</span></div>${detailRows.map(([label, main, slave, key]) => `<div class="river-detail-row"><span>${label}</span><span data-live="river-main-${key}">${main}</span><span data-live="river-slave-${key}">${slave}</span></div>`).join("")}</div></article>`;
  }

  _updateRiver() {
    const online = this._state(this._config.river_status)?.state === "online";
    const riverCard = this.shadowRoot.querySelector(".river-card");
    if (riverCard) riverCard.dataset.offline = String(!online);
    this._setHidden('[data-live="river-offline-note"]', online);
    const status = online ? "Онлайн" : "Станція офлайн";
    this._setText('[data-live="river-status"]', status);
    const connection = this.shadowRoot.querySelector(
      '[data-live="river-connection"]',
    );
    if (connection) {
      connection.classList.toggle("offline", !online);
      connection.setAttribute("aria-label", online ? "Онлайн" : "Офлайн");
    }
    const percent = online
      ? this._number(this._state(this._config.river_battery)?.state)
      : null;
    const fill = percent === null ? 0 : Math.max(0, Math.min(100, percent));
    this._setText(
      '[data-live="river-battery"]',
      percent === null ? "—" : this._format(percent, 0),
    );
    this.shadowRoot
      .querySelector(".river-large")
      ?.classList.toggle("river-missing", percent === null);
    const runtime = this._riverRuntime();
    this._setText('[data-live="river-runtime"]', runtime);
    this.shadowRoot
      .querySelector('[data-live="river-runtime"]')
      ?.classList.toggle("river-missing", runtime === "—");
    const input = this._riverRead("river_input", "", 0),
      output = this._riverRead("river_output", "", 0);
    this._setText('[data-live="river-input"]', input);
    this._setText('[data-live="river-output"]', output);
    this.shadowRoot
      .querySelector('[data-live="river-input"]')
      ?.parentElement?.classList.toggle("river-missing", input === "—");
    this.shadowRoot
      .querySelector('[data-live="river-output"]')
      ?.parentElement?.classList.toggle("river-missing", output === "—");
    let activePorts = 0;
    for (const key of [
      "river_ac_output",
      "river_dc_output",
      "river_usb_c_output",
      "river_usb_1_output",
      "river_usb_2_output",
      "river_usb_3_output",
    ]) {
      const port = this.shadowRoot.querySelector(
        `[data-live="river-output-${key.replace(/^river_/, "").replace(/_output$/, "")}"]`,
      )?.parentElement?.parentElement;
      const active =
        online &&
        (this._number(this._state(this._config[key])?.state) ?? 0) > 0;
      if (port) port.hidden = !active;
      if (active) activePorts++;
      this._setText(
        `[data-live="river-output-${key.replace(/^river_/, "").replace(/_output$/, "")}"]`,
        this._riverRead(key, "", 0),
      );
    }
    const outputs = this.shadowRoot.querySelector(".river-outputs");
    if (outputs) outputs.hidden = activePorts === 0;
    const chargeFill = this.shadowRoot.querySelector(
      '[data-live="river-charge-fill"]',
    );
    if (chargeFill) chargeFill.style.width = `${fill}%`;
    const meter = this.shadowRoot.querySelector('.river-card [role="meter"]');
    if (meter) {
      if (percent === null) meter.removeAttribute("aria-valuenow");
      else meter.setAttribute("aria-valuenow", String(fill));
    }
    for (const prefix of ["main", "slave"]) {
      const level = online
        ? this._number(
            this._state(this._config[`${prefix}_level_entity`])?.state,
          )
        : null;
      const levelFill = level === null ? 0 : Math.max(0, Math.min(100, level));
      this._setText(
        `[data-live="river-${prefix}-level"]`,
        level === null ? "—" : this._format(level, 0),
      );
      this.shadowRoot
        .querySelector(`[data-live="river-${prefix}-level"]`)
        ?.parentElement?.classList.toggle("river-missing", level === null);
      const fillEl = this.shadowRoot.querySelector(
        `[data-live="river-${prefix}-fill"]`,
      );
      if (fillEl) fillEl.style.width = `${levelFill}%`;
      this._setText(
        `[data-live="river-${prefix}-temperature"]`,
        this._riverRead(`${prefix}_temperature_entity`, "°C", 0),
      );
      this._setText(
        `[data-live="river-${prefix}-volts"]`,
        this._riverRead(`${prefix}_volts_entity`, "В", 1),
      );
      this._setText(
        `[data-live="river-${prefix}-current"]`,
        this._riverRead(`${prefix}_current_entity`, "A", 1),
      );
      this._setText(
        `[data-live="river-${prefix}-cycles"]`,
        this._riverRead(`${prefix}_cycles_entity`, "", 0),
      );
      this._setText(
        `[data-live="river-${prefix}-min-cell"]`,
        this._riverRead(`${prefix}_min_cells_entity`, "В", 2),
      );
      this._setText(
        `[data-live="river-${prefix}-max-cell"]`,
        this._riverRead(`${prefix}_max_cells_entity`, "В", 2),
      );
    }
  }
  _updateCardDynamic({ all, has }) {
    const sources = HOME_DEVICE_CARD_FIELDS.river.map(
      ([name]) => this._config[name],
    );
    if (all || sources.some(has)) this._updateRiver();
  }
  _handleCardClick(button) {
    if (button?.dataset.action !== "river-details") return false;
    const details = this.shadowRoot.querySelector("#river-extra");
    if (details) {
      details.hidden = !details.hidden;
      button.setAttribute("aria-expanded", String(!details.hidden));
    }
    return true;
  }
  _click(event) {
    if (this._handleCardClick(event.target.closest("button[data-action]")))
      return;
    super._click(event);
  }
  _graphDefinitions() {
    return {
      "river-current": {
        title: "Струм батарей · 24 години",
        entities: [
          { entity: this._config.main_current_entity, name: "Основна" },
          { entity: this._config.slave_current_entity, name: "Додаткова" },
        ],
      },
      "river-cells": {
        title: "Напруги комірок · 24 години",
        entities: [
          { entity: this._config.main_min_cells_entity, name: "Осн. мін." },
          { entity: this._config.main_max_cells_entity, name: "Осн. макс." },
          { entity: this._config.slave_min_cells_entity, name: "Дод. мін." },
          { entity: this._config.slave_max_cells_entity, name: "Дод. макс." },
        ],
      },
    };
  }
}
if (!customElements.get("home-river-card"))
  customElements.define("home-river-card", HomeRiverCard);
