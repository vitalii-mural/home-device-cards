const HOME_MIDEA_ENTITY_REGISTRIES = new WeakMap();
const HOME_MIDEA_FEATURES = {
  memo_entity: ["switch", "_memory"],
  sterilization_entity: ["switch", "_sterilization"],
};

class HomeBoilerCard extends HomeDeviceStandaloneCard {
  constructor() {
    super();
    this._isConnected = false;
    this._autoEntities = {};
    this._autoHeatingTimeSensor = null;
    this._registryConnection = null;
    this._registryUnsubscribe = null;
    this._connectionEventCleanup = null;
    this._registrySubscriptionToken = 0;
    this._discoveryToken = 0;
    this._discoveryEntity = null;
  }

  setConfig(config) {
    this._discoveryToken++;
    this._discoveryEntity = null;
    this._autoEntities = {};
    this._autoHeatingTimeSensor = null;
    super.setConfig(config);
    if (this._isConnected) {
      this._observeRegistry(this._hass);
      this._resolveDeviceEntities();
    }
  }

  set hass(hass) {
    super.hass = hass;
    if (this._isConnected) {
      this._observeRegistry(hass);
      this._resolveDeviceEntities();
    }
  }

  connectedCallback() {
    this._isConnected = true;
    super.connectedCallback();
    this._observeRegistry(this._hass);
    this._resolveDeviceEntities();
  }

  disconnectedCallback() {
    this._isConnected = false;
    super.disconnectedCallback();
    this._discoveryToken++;
    this._registrySubscriptionToken++;
    this._registryUnsubscribe?.();
    this._registryUnsubscribe = null;
    this._connectionEventCleanup?.();
    this._connectionEventCleanup = null;
    this._registryConnection = null;
    this._discoveryEntity = null;
    this._autoEntities = {};
    this._autoHeatingTimeSensor = null;
  }

  _observeRegistry(hass) {
    const connection = hass?.connection;
    if (!connection || connection === this._registryConnection) return;
    this._registryUnsubscribe?.();
    this._registryUnsubscribe = null;
    this._connectionEventCleanup?.();
    this._connectionEventCleanup = null;
    this._registryConnection = connection;
    this._discoveryToken++;
    this._discoveryEntity = null;
    const hadResolvedEntities =
      Object.keys(this._autoEntities).length > 0 ||
      this._autoHeatingTimeSensor !== null;
    this._autoEntities = {};
    this._autoHeatingTimeSensor = null;
    if (hadResolvedEntities && this._rendered) this._render();
    const token = ++this._registrySubscriptionToken;
    if (!this._isConnected || typeof connection.subscribeEvents !== "function") return;
    const invalidateRegistry = () => {
      HOME_MIDEA_ENTITY_REGISTRIES.delete(connection);
      this._discoveryEntity = null;
      this._discoveryToken++;
    };
    const handleReady = () => {
      invalidateRegistry();
      if (this._isConnected) this._resolveDeviceEntities();
    };
    if (
      typeof connection.addEventListener === "function" &&
      typeof connection.removeEventListener === "function"
    ) {
      connection.addEventListener("disconnected", invalidateRegistry);
      connection.addEventListener("ready", handleReady);
      this._connectionEventCleanup = () => {
        connection.removeEventListener("disconnected", invalidateRegistry);
        connection.removeEventListener("ready", handleReady);
      };
    }
    Promise.resolve(
      connection.subscribeEvents(() => {
        HOME_MIDEA_ENTITY_REGISTRIES.delete(connection);
        this._discoveryEntity = null;
        this._discoveryToken++;
        this._resolveDeviceEntities();
      }, "entity_registry_updated"),
    )
      .then((unsubscribe) => {
        if (token !== this._registrySubscriptionToken || !this._isConnected)
          unsubscribe?.();
        else this._registryUnsubscribe = unsubscribe;
      })
      .catch(() => {});
  }

  async _resolveDeviceEntities() {
    const hass = this._hass;
    const primaryId = this._config?.boiler_entity;
    const connection = hass?.connection;
    if (
      !this._isConnected ||
      !primaryId?.startsWith("water_heater.") ||
      typeof hass?.callWS !== "function" ||
      !connection
    )
      return;
    if (this._discoveryEntity === primaryId) return;
    this._discoveryEntity = primaryId;
    const token = ++this._discoveryToken;
    let registryPromise = HOME_MIDEA_ENTITY_REGISTRIES.get(connection);
    if (!registryPromise) {
      registryPromise = Promise.resolve()
        .then(() => hass.callWS({ type: "config/entity_registry/list" }))
        .then((registry) => (Array.isArray(registry) ? registry : null))
        .catch(() => {
          HOME_MIDEA_ENTITY_REGISTRIES.delete(connection);
          return null;
        });
      HOME_MIDEA_ENTITY_REGISTRIES.set(connection, registryPromise);
    }
    const registry = await registryPromise;
    if (
      token !== this._discoveryToken ||
      !this._isConnected ||
      this._hass?.connection !== connection ||
      this._config?.boiler_entity !== primaryId ||
      !Array.isArray(registry)
    )
      return;
    const primary = registry.find((entry) => entry.entity_id === primaryId);
    const suffix = "_water_heater";
    if (
      primary?.platform !== "midea_ac_lan" ||
      primary.disabled_by != null ||
      !primary.device_id ||
      !primary.config_entry_id ||
      typeof primary.unique_id !== "string" ||
      !primary.unique_id.endsWith(suffix)
    ) {
      this._applyAutoEntities({}, null, token);
      return;
    }
    const baseUniqueId = primary.unique_id.slice(0, -suffix.length);
    const matches = (domain, entitySuffix) => {
      const candidates = registry.filter(
        (entry) =>
          entry.entity_id?.startsWith(`${domain}.`) &&
          entry.platform === "midea_ac_lan" &&
          entry.device_id === primary.device_id &&
          entry.config_entry_id === primary.config_entry_id &&
          entry.disabled_by == null &&
          entry.unique_id === `${baseUniqueId}${entitySuffix}`,
      );
      return candidates.length === 1 ? candidates[0].entity_id : null;
    };
    const resolved = {};
    for (const [key, [domain, entitySuffix]] of Object.entries(HOME_MIDEA_FEATURES)) {
      if (!this._config[key]) {
        const entityId = matches(domain, entitySuffix);
        if (entityId) resolved[key] = entityId;
      }
    }
    const timeSensor =
      this._config.boiler_hours || this._config.boiler_minutes
        ? null
        : matches("sensor", "_heating_time_remaining");
    this._applyAutoEntities(resolved, timeSensor, token);
  }

  _applyAutoEntities(entities, timeSensor, token) {
    if (token !== this._discoveryToken) return;
    const changed =
      JSON.stringify(this._autoEntities) !== JSON.stringify(entities) ||
      this._autoHeatingTimeSensor !== timeSensor;
    this._autoEntities = entities;
    this._autoHeatingTimeSensor = timeSensor;
    if (changed && this._rendered) this._render();
  }

  _featureEntity(key) {
    return this._config?.[key] || this._autoEntities[key] || null;
  }

  _entityIds() {
    return [
      ...super._entityIds(),
      ...Object.values(this._autoEntities),
      this._autoHeatingTimeSensor,
    ].filter(Boolean);
  }

  _heatingMinutes(attributes) {
    const attributeMinutes = this._number(attributes.heating_time_remaining);
    if (attributeMinutes !== null) return attributeMinutes;
    const hours = this._value(this._config.boiler_hours);
    const minutes = this._value(this._config.boiler_minutes);
    if (hours !== null && minutes !== null && hours >= 0 && minutes >= 0)
      return hours * 60 + minutes;
    const sensor = this._state(this._autoHeatingTimeSensor);
    const value = this._number(sensor?.state);
    if (value === null) return null;
    const unit = String(sensor.attributes?.unit_of_measurement || "").toLowerCase();
    if (["s", "sec", "second", "seconds"].includes(unit)) return value / 60;
    if (["h", "hr", "hour", "hours"].includes(unit)) return value * 60;
    return value;
  }

  _formatHeatingTime(remaining) {
    if (remaining === null || remaining <= 0) return "";
    const totalMinutes = Math.ceil(remaining);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours ? hours + " год " : ""}${minutes} хв`;
  }
  static get cardType() {
    return "boiler";
  }
  static get cardTitle() {
    return ["boiler_entity", "Гаряча вода"];
  }
  _content() {
    return `<div class="desktop-board"><div class="desktop-water">${this._boiler()}</div></div>`;
  }
  _temperature(entity, delta) {
    if (this._busy(entity) || !this._available(entity)) return;
    this._temperatureAction = `boiler-${delta > 0 ? "plus" : "minus"}`;
    super._temperature(entity, delta);
  }

  _boiler() {
    const c = this._config,
      state = this._state(c.boiler_entity),
      a = state?.attributes || {};
    const available = this._available(c.boiler_entity),
      on = available && state.state !== "off",
      heating =
        on && (a.hvac_action === "heating" || a.heating === true);
    const current = this._number(a.current_temperature),
      pendingTarget = this._pendingTargets.get(c.boiler_entity),
      target = pendingTarget?.temperature ?? this._number(a.temperature),
      min = this._number(a.min_temp) ?? 30;
    const progress =
      current !== null && target !== null && target > min
        ? Math.min(100, Math.max(0, ((current - min) / (target - min)) * 100))
        : 0;
    const remaining = this._heatingMinutes(a),
      time = this._formatHeatingTime(remaining);
    const status = !state
      ? "Не підключено"
      : !available
        ? "Недоступний"
        : !on
          ? "Вимкнено"
          : heating
            ? "Нагрівання"
            : a.hvac_action === "idle" || a.keep_warm === true
              ? "Підтримання температури"
              : "Увімкнено";

    return `<article class="panel" aria-label="Бойлер" data-live-panel="boiler"><div class="panel-top"><div class="heading"><span class="device-icon warm">${this._lucideIcon("heater")}</span><div><h2>Гаряча вода</h2><span class="secondary ${heating ? "heating" : ""}" data-live="boiler-status">${status}</span></div></div><button class="icon-button ${on ? "active-warm" : ""}" data-action="boiler-power" aria-label="${on ? "Вимкнути" : "Увімкнути"} бойлер" aria-pressed="${on}" ${this._disabled(!available, c.boiler_entity)}>${this._lucideIcon("power")}</button></div>
    <div class="water-large"><span class="secondary boiler-current-label">Температура води</span><span class="current"><span data-live="boiler-current">${available ? this._format(current) : "—"}</span><small class="degree" data-live="boiler-current-unit">°C</small></span><div class="setpoint"><span class="secondary">Нагріти до</span><div class="adjust"><button class="round" data-action="boiler-minus" aria-label="Зменшити температуру бойлера" ${this._disabled(!available || target === null || target <= min, c.boiler_entity)}>${this._lucideIcon("minus")}</button><span class="target"><span data-live="boiler-target">${this._format(target)}</span><small data-live="boiler-target-unit">°C</small></span><button class="round" data-action="boiler-plus" aria-label="Збільшити температуру бойлера" ${this._disabled(!available || target === null || target >= (this._number(a.max_temp) ?? 80), c.boiler_entity)}>${this._lucideIcon("plus")}</button></div><span class="secondary pending-hint" data-live="boiler-pending" data-pending="${!!pendingTarget}" aria-hidden="${!pendingTarget}" role="status">Очікує підтвердження</span></div></div>
    <div class="progress ${heating ? "" : "waiting"}" data-live="boiler-progress" role="progressbar" aria-label="Температура води до заданої" aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${progress}%"></span></div>
    <div class="time" data-live="boiler-time" ${heating && time ? "" : "hidden"}>${this._icon("clock-outline")}<span>До нагрівання · ${time}</span></div>${this._boilerFeatures()}</article>`;
  }

  _boilerFeatures() {
    const definitions = [
      ["memo_entity", "Memo U", "house"],
      ["mega_entity", "Mega Water", "droplets"],
      ["sterilization_entity", "Стерилізація", "shield-check"],
    ];
    const buttons = definitions
      .map(([key, label, icon]) => {
        const entity = this._featureEntity(key),
          feature = this._state(entity);
        if (!entity) return "";
        const unavailable = feature && !this._available(entity);
        const title = unavailable ? `${label}: тимчасово недоступно` : label;
        return `<button class="feature" data-action="feature" data-entity="${this._escape(entity)}" title="${this._escape(title)}" aria-label="${this._escape(title)}" aria-pressed="${feature?.state === "on"}" ${feature ? this._disabled(!this._available(entity), entity) : "hidden disabled"}><span class="boiler-feature-icon">${this._lucideIcon(icon)}</span><span>${label}</span></button>`;
      })
      .join("");
    if (!buttons) return "";
    const hasVisibleFeature = definitions.some(([key]) =>
      this._state(this._featureEntity(key)),
    );
    return `<div class="features" role="group" aria-label="Режими бойлера" ${hasVisibleFeature ? "" : "hidden"}>${buttons}</div>`;
  }

  _updateBoiler() {
    super._updateBoiler();
    const panel = this.shadowRoot.querySelector('[data-live-panel="boiler"]');
    if (!panel) return;
    const boiler = this._state(this._config.boiler_entity),
      attributes = boiler?.attributes || {},
      heating =
        this._available(this._config.boiler_entity) &&
        boiler.state !== "off" &&
        (attributes.hvac_action === "heating" || attributes.heating === true),
      time = this._formatHeatingTime(this._heatingMinutes(attributes));
    this._setHidden('[data-live="boiler-time"]', !heating || !time, panel);
    this._setText(
      '[data-live="boiler-time"] span',
      time ? `До нагрівання · ${time}` : "",
      panel,
    );
    if (!this._available(this._config.boiler_entity))
      this._setText('[data-live="boiler-target"]', "—", panel);
    this._setHidden(
      '[data-live="boiler-progress"]',
      !this._available(this._config.boiler_entity) ||
        this._number(
          this._state(this._config.boiler_entity)?.attributes
            ?.current_temperature,
        ) === null,
      panel,
    );
    for (const [key, unit] of [
      ["boiler-current", "boiler-current-unit"],
      ["boiler-target", "boiler-target-unit"],
    ]) {
      const value = panel.querySelector(`[data-live="${key}"]`),
        missing =
          !value || this._number(value.textContent.replace(/,/g, ".")) === null;
      value?.parentElement?.classList.toggle("temperature-missing", missing);
      this._setHidden(`[data-live="${unit}"]`, missing, panel);
    }
    let hasVisibleFeature = false;
    for (const [key, label] of [
      ["memo_entity", "Memo U"],
      ["mega_entity", "Mega Water"],
      ["sterilization_entity", "Стерилізація"],
    ]) {
      const entity = this._featureEntity(key);
      const button = Array.from(
        panel.querySelectorAll('[data-action="feature"]'),
      ).find((candidate) => candidate.dataset.entity === entity);
      if (!button) continue;
      const feature = this._state(entity),
        exists = !!feature,
        available = this._available(entity);
      button.hidden = !exists;
      button.disabled = !available || this._busy(entity);
      button.setAttribute("aria-pressed", String(feature?.state === "on"));
      button.title =
        exists && !available ? `${label}: тимчасово недоступно` : label;
      button.setAttribute("aria-label", button.title);
      hasVisibleFeature ||= exists;
    }
    this._setHidden(".features", !hasVisibleFeature, panel);
  }

  _updateTemperatureFeedback() {
    const entity = this._config.boiler_entity;
    const pending = this._pendingTargets.has(entity);
    for (const button of this.shadowRoot.querySelectorAll(
      ".round[data-action]",
    )) {
      const active =
        pending && button.dataset.action === this._temperatureAction;
      if (button.dataset.pending !== String(active))
        button.dataset.pending = String(active);
      if (button.getAttribute("aria-busy") !== String(active))
        button.setAttribute("aria-busy", String(active));
    }
  }
  _updateCardDynamic({ all, has, serviceEntity }) {
    const sources = [
      this._config.boiler_entity,
      this._config.boiler_hours,
      this._config.boiler_minutes,
      this._featureEntity("memo_entity"),
      this._featureEntity("mega_entity"),
      this._featureEntity("sterilization_entity"),
      this._autoHeatingTimeSensor,
    ];
    if (all || sources.some(has) || sources.includes(serviceEntity))
      this._updateBoiler();
    return { temperatureFeedback: true };
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
if (!customElements.get("home-boiler-card"))
  customElements.define("home-boiler-card", HomeBoilerCard);
