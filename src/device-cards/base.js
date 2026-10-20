const HOME_DEVICE_BASE = customElements.get("home-dashboard");

class HomeDeviceStandaloneCard extends HOME_DEVICE_BASE {
  constructor() {
    super();
    this._cardType = this.constructor.cardType;
    this._layout = "mobile";
    this._view = this._cardType === "battery" ? "battery" : "home";
  }

  static getStubConfig() {
    const kind = this.cardType;
    const [tag] = HOME_DEVICE_CARD_META[kind];
    return { type: `custom:${tag}`, ...HOME_DEVICE_CARD_DEFAULTS[kind] };
  }

  static getConfigForm() {
    const kind = this.cardType;
    const field = HOME_DEVICE_CARD_FIELDS[kind];
    const context = {
      boiler: "boiler_entity",
      air: "air_entity",
      room: "room_temperature_entity",
      socket: "switch_entity",
      river: "river_status",
      energy: "power_entity",
      energy_details: "power_entity",
    }[kind];
    return {
      schema: [
        ...(kind === "battery"
          ? []
          : [
              {
                name: "title",
                selector: { entity_name: {} },
                context: { entity: context },
              },
            ]),
        ...field.map(([name, , type]) => ({
          name,
          required:
            (kind === "boiler" && name === "boiler_entity") ||
            (kind === "air" && name === "air_entity") ||
            (kind === "socket" && name === "switch_entity"),
          default: HOME_DEVICE_CARD_DEFAULTS[kind][name],
          selector:
            type === "text"
              ? { text: {} }
              : { entity: { domain: type.split(",") } },
        })),
      ],
      computeLabel: (schema) =>
        schema.name === "title"
          ? "Назва картки"
          : field.find((item) => item[0] === schema.name)?.[1] || schema.name,
    };
  }

  setConfig(config) {
    const kind = this._cardType;
    const fields = HOME_DEVICE_CARD_FIELDS[kind];
    const entityKeys = fields
      .filter(([, , type]) => type !== "text")
      .map(([name]) => name);
    const stringKeys = [
      "energy_path",
      "battery_path",
      ...fields.filter(([, , type]) => type === "text").map(([name]) => name),
    ];
    const normalized = this._validatedConfig(config, entityKeys, stringKeys);
    if (
      normalized.title !== null &&
      normalized.title !== undefined &&
      typeof normalized.title !== "string" &&
      (typeof normalized.title !== "object" || Array.isArray(normalized.title))
    ) {
      throw new Error(
        'Configuration option "title" must be text or an entity name selector.',
      );
    }
    this._clearPendingTimers();
    this._generation++;
    this._config = { ...HOME_DEVICE_CARD_DEFAULTS[kind], ...normalized };
    this._rendered = false;
    this._entitySignatures.clear();
    this._render();
  }

  connectedCallback() {
    if (this._config && this._hass && !this._rendered) this._render();
  }

  _entityIds() {
    return HOME_DEVICE_CARD_FIELDS[this._cardType]
      .filter(([, , type]) => type !== "text")
      .map(([name]) => this._config?.[name])
      .filter(Boolean);
  }

  getCardSize() {
    return this._cardType === "battery" || this._cardType === "energy" ? 8 : 5;
  }
  getGridOptions() {
    const kind = this._cardType;
    return kind === "energy" || kind === "river"
      ? {
          columns: 12,
          rows: kind === "river" ? 8 : 5,
          min_columns: 6,
          min_rows: kind === "river" ? 5 : 4,
        }
      : {
          columns: 6,
          rows:
            kind === "boiler" || kind === "air" || kind === "battery" ? 5 : 3,
          min_columns: 3,
          min_rows: 2,
        };
  }

  _displayName(entityKey, name, fallback) {
    if (name == null) return fallback;
    if (typeof name === "string") return name || fallback;
    const state = this._hass?.states?.[this._config[entityKey]];
    return state && this._hass.formatEntityName
      ? this._hass.formatEntityName(state, name) || fallback
      : fallback;
  }

  _lucideIcon(name) {
    const icons = {
      snowflake:
        '<path d="m10 20-1.25-2.5L6 18M10 4 8.75 6.5 6 6m8 14 1.25-2.5L18 18m-4-14 1.25 2.5L18 6m-1 15-3-6h-4m7-12-3 6 1.5 3M2 12h6.5L10 9m10 1-1.5 2 1.5 2m2-2h-6.5L14 15m-10-5 1.5 2L4 14m3 7 3-6-1.5-3m-2-9 3 6h4"/>',
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2m8-10h2M2 12h2m14.07-7.07 1.41-1.41M4.93 19.07l1.41-1.41m12.73 1.41-1.41-1.41M4.93 4.93l1.41 1.41"/>',
      fan: '<path d="M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412Z"/><path d="M12 12v.01"/>',
      droplet:
        '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
      "circle-a":
        '<circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="11" stroke="none" fill="currentColor">A</text>',
      gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
      headphones:
        '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
      zap: '<path d="M15.914 4a1.5 1.5 0 0 0-2.474-1.561l-9 9A1.5 1.5 0 0 0 5.5 14h4.002a.5.5 0 0 1 .471.666L8.086 20a1.5 1.5 0 0 0 2.475 1.56l9-9A1.5 1.5 0 0 0 18.5 10h-3.997a.5.5 0 0 1-.472-.667z"/>',
      wind: '<path d="M12.8 19.6A2 2 0 1 0 14 16H2M17.5 8a2.5 2.5 0 1 1 2 4H2M9.8 4.4A2 2 0 1 1 11 8H2"/>',
      lightbulb:
        '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
      trees:
        '<path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0ZM7 16v6M13 19v3M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"/>',
      house:
        '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
      leaf: '<path d="M11 20a10 10 0 0 0 10-10 25.9 25.9 0 0 0-1.04-7.281 1 1 0 0 0-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0 0 11 20ZM2 21a5 5 0 0 1 2.911-4.544C7.613 15.212 8.351 15.24 11 13"/>',
      moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
      "volume-2":
        '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298zM16 9a5 5 0 0 1 0 6M19.364 18.364a9 9 0 0 0 0-12.728"/>',
      "air-vent":
        '<path d="M18 17.5a2.5 2.5 0 1 1-4 2.03V12M6 12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 8h12M6.6 15.572A2 2 0 1 0 10 17v-5"/>',
      heater:
        '<path d="M11 8c2-3-2-3 0-6M15.5 8c2-3-2-3 0-6M6 10h.01M6 14h.01M10 16v-4M14 16v-4M18 16v-4M20 6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3M5 20v2M19 20v2"/>',
      minus: '<path d="M5 12h14"/>',
      plus: '<path d="M5 12h14M12 5v14"/>',
      power: '<path d="M12 2v10M18.4 6.6a9 9 0 1 1-12.77.04"/>',
      "battery-charging":
        '<path d="m11 7-3 5h4l-3 5"/><path d="M14.856 6H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.935"/><path d="M22 14v-4"/><path d="M5.14 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2.936"/>',
      battery:
        '<path d="M22 14V10"/><rect x="2" y="6" width="16" height="12" rx="2"/>',
      "battery-plus":
        '<path d="M10 9v6"/><path d="M12.543 6H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3.605"/><path d="M22 14v-4"/><path d="M7 12h6"/><path d="M7.606 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.606"/>',
      wifi: '<path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>',
      "clock-3": '<circle cx="12" cy="12" r="10"/><path d="M12 6v6h4"/>',
      "arrow-down-left": '<path d="M17 7 7 17M17 17H7V7"/>',
      "arrow-up-right": '<path d="M7 7h10v10M7 17 17 7"/>',
      plug: '<path d="M12 22v-5"/><path d="M15 8V2"/><path d="M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z"/><path d="M9 8V2"/>',
      cable:
        '<path d="M17 19a1 1 0 0 1-1-1v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a1 1 0 0 1-1 1z"/><path d="M17 21v-2"/><path d="M19 14V6.5a1 1 0 0 0-7 0v11a1 1 0 0 1-7 0V10"/><path d="M21 21v-2"/><path d="M3 5V3"/><path d="M4 10a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a2 2 0 0 1-2 2z"/><path d="M7 5V3"/>',
      usb: '<circle cx="10" cy="7" r="1"/><circle cx="4" cy="20" r="1"/><path d="M4.7 19.3 19 5"/><path d="m21 3-3 1 2 2Z"/><path d="M9.26 7.68 5 12l2 5"/><path d="m10 14 5 2 3.5-3.5"/><path d="m18 12 1-1 1 1-1 1Z"/>',
      thermometer: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
      activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
      droplets:
        '<path d="M7 16.3A4 4 0 0 1 11 12.3"/><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5"/><path d="M5.5 17.5a3.5 3.5 0 0 1 0-7c.5 0 .9.1 1.3.3"/>',
      "battery-medium":
        '<rect x="2" y="6" width="18" height="12" rx="2"/><path d="M22 10v4"/><path d="M10 10v4"/>',
      "chart-no-axes-column":
        '<path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>',
      "shield-check":
        '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
      "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    };
    return `<svg class="air-inline-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.fan}</svg>`;
  }

  _updateCardName() {
    const [entityKey, fallback] = this.constructor.cardTitle || [];
    if (!entityKey) return;
    this._setText(
      "h2",
      this._displayName(entityKey, this._config.title, fallback),
    );
  }

  _updateDynamic(
    changedIds = null,
    themeChanged = false,
    serviceEntity = null,
  ) {
    if (!this._hass || !this._config) return;
    this._updateCardName();
    const all = changedIds === null,
      changed = new Set(changedIds || []),
      has = (id) => !!id && (all || changed.has(id));
    if (all || themeChanged)
      this.toggleAttribute("dark", !!this._hass.themes?.darkMode);
    this._setText('[data-live="error"]', this._error);
    this._setHidden('[data-live="error"]', !this._error);
    const result = this._updateCardDynamic({ all, has, serviceEntity });
    if (result?.temperatureFeedback) this._updateTemperatureFeedback();
    for (const [key, card] of this._graphCards) {
      if (
        card.isConnected &&
        (all || themeChanged || (this._graphSources.get(key) || []).some(has))
      )
        card.hass = this._hass;
    }
  }

  _updateCardDynamic() {}
  _click(event) {
    const button = event.target.closest("button[data-action]");
    if (
      button?.dataset.action === "view-energy" ||
      button?.dataset.action === "view-battery"
    ) {
      const path =
        button.dataset.action === "view-energy"
          ? this._config.energy_path
          : this._config.battery_path;
      if (path) {
        if (typeof this._hass?.navigate === "function") this._hass.navigate(path);
        else {
          window.history.pushState(null, "", path);
          window.dispatchEvent(new Event("location-changed"));
        }
      }
      return;
    }
    super._click(event);
  }
  _graphDefinitions() {
    return {};
  }
  _graphCardHeight() {
    return "";
  }

  async _mountGraphs(generation) {
    const slots = Array.from(this.shadowRoot.querySelectorAll("[data-graph]"));
    if (!slots.length) return;
    try {
      if (!window.loadCardHelpers) throw new Error("History cards unavailable");
      const helpers = await window.loadCardHelpers();
      if (generation !== this._generation) return;
      const definitions = this._graphDefinitions();
      for (const slot of slots) {
        const definition = definitions[slot.dataset.graph];
        if (!definition) continue;
        definition.entities = definition.entities.filter((item) =>
          typeof item === "string" ? !!item : !!item.entity,
        );
        if (!definition.entities.length) {
          slot.innerHTML =
            '<span class="secondary">Виберіть сутність для графіка в налаштуваннях картки.</span>';
          continue;
        }
        const key = JSON.stringify(definition);
        let card = this._graphCards.get(key);
        if (!card) {
          card = helpers.createCardElement({
            type: "history-graph",
            hours_to_show: 24,
            ...definition,
          });
          this._graphCards.set(key, card);
        }
        this._graphSources.set(
          key,
          definition.entities.map((item) =>
            typeof item === "string" ? item : item.entity,
          ),
        );
        card.style.height = this._graphCardHeight();
        card.hass = this._hass;
        slot.replaceChildren(card);
      }
    } catch {
      if (generation !== this._generation) return;
      for (const slot of slots)
        slot.innerHTML =
          '<span class="secondary">Історію можна відкрити через подробиці відповідної сутності.</span>';
    }
  }

  _render() {
    if (!this._config || !this._hass) return;
    this.toggleAttribute("dark", !!this._hass.themes?.darkMode);
    const content = this._content();
    this.shadowRoot.innerHTML = `<style>${HOME_DEVICE_CARD_STYLE}.pending-hint{min-height:17px;visibility:hidden}.pending-hint[data-pending="true"]{visibility:visible}.live-error{position:fixed;z-index:20;left:50%;bottom:18px;transform:translateX(-50%);width:min(440px,calc(100vw - 32px));box-shadow:0 8px 24px rgba(0,0,0,.18)}.single-card{width:100%}.single-card .desktop-board{display:block}[hidden]{display:none!important}@media(max-width:380px){.single-card .panel{padding:14px}}@media(min-width:680px){.single-card .desktop-board .panel{padding:20px}.single-card .desktop-water>.panel,.single-card .desktop-air>.panel{min-height:300px}.single-card .desktop-board .current{font-size:52px}.single-card .desktop-board .water-large{margin-top:30px;margin-bottom:25px}.single-card .desktop-board .heading{gap:8px}.single-card .desktop-board h2{font-size:14px}.single-card .desktop-board .target{font-size:19px}.single-card .desktop-board .adjust{gap:6px}.single-card .desktop-board .adjust .round{width:34px;min-width:34px;height:38px}.single-card .desktop-board .metric{padding:15px}.single-card .desktop-board .metric .secondary{padding-right:14px}.single-card .desktop-board .metric-value{font-size:26px}}</style><ha-card><div class="single-card"><div class="error live-error" role="alert" data-live="error" ${this._error ? "" : "hidden"}>${this._escape(this._error)}</div>${content}</div></ha-card>`;
    const feedbackStyle = document.createElement("style");
    feedbackStyle.textContent = HOME_DEVICE_FEEDBACK_STYLE;
    this.shadowRoot.append(feedbackStyle);
    for (const hint of this.shadowRoot.querySelectorAll(".pending-hint"))
      hint.remove();
    for (const button of this.shadowRoot.querySelectorAll(
      ".round[data-action]",
    )) {
      const spinner = document.createElement("span");
      spinner.className = "pending-spinner";
      spinner.setAttribute("aria-hidden", "true");
      button.append(spinner);
    }
    this._updateCardName();
    this._rendered = true;
    this._updateDynamic();
    const generation = ++this._generation;
    this._mountGraphs(generation);
  }
}
