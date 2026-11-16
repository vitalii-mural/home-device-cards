class HomeSensorStatusCard extends HomeDeviceStandaloneCard {
  _sensorName() {
    const [entity, fallback] = this.constructor.cardTitle;
    return this._displayName(entity, this._config.title, fallback);
  }

  _updateCardName() {
    const name = this._sensorName();
    this._setText('[data-live="sensor-name"]', name);
    this._setHidden('.sensor-heading p', name === this._config.location);
  }

  _reading(key, name) {
    const value = this._value(this._config[key]);
    this._setHidden(`[data-live="sensor-${name}"]`, value === null);
    this._setText(`[data-live="sensor-${name}-value"]`, value === null ? '' : this._format(value, 0));
  }

  _status(entity) {
    const state = this._state(this._config[entity]);
    if (!state || state.state === 'unavailable') return { label: 'Немає зв’язку', state: 'offline' };
    if (state.state === 'unknown') return { label: 'Стан невідомий', state: 'offline' };
    if (state.state === 'on') return { label: this._cardType === 'leak' ? 'Виявлено воду' : 'Відчинено', state: 'active' };
    if (state.state === 'off') return { label: this._cardType === 'leak' ? 'Сухо' : 'Зачинено', state: 'normal' };
    return { label: 'Невідомий стан', state: 'offline' };
  }

  _updateStatus() {
    const primary = this._status(this._cardType === 'leak' ? 'leak_entity' : 'door_entity');
    this._setText('[data-live="sensor-status"]', primary.label);
    const article = this.shadowRoot.querySelector('[data-live-panel="sensor"]');
    article?.setAttribute('data-state', primary.state);
    this._reading('battery_entity', 'battery');
    this._reading('linkquality_entity', 'lqi');
    if (this._cardType !== 'door') return;

    const vibrationId = this._config.vibration_entity,
      vibration = this._state(vibrationId),
      unavailable = !vibration || vibration.state === 'unavailable';
    this._setText('[data-live="vibration-value"]', !vibrationId || unavailable ? '' : vibration.state === 'on' ? 'Вібрація' : vibration.state === 'off' ? 'Без вібрації' : 'Стан невідомий');
    this._setHidden('[data-live="vibration"]', !vibrationId || unavailable);
    this._setHidden('[data-live="vibration-missing"]', !vibrationId || !unavailable);
  }

  _content() {
    const leak = this._cardType === 'leak',
      title = this._sensorName(),
      location = this._config.location,
      state = this._status(leak ? 'leak_entity' : 'door_entity'),
      icon = leak ? 'droplets' : 'door-closed',
      vibrationId = this._config.vibration_entity;
    const battery = this._config.battery_entity ? `<span class="sensor-reading" data-live="sensor-battery" hidden><span class="sensor-inline-icon">${this._lucideIcon('battery-medium')}</span><span class="sensor-reading-label">Заряд батареї </span><span><span data-live="sensor-battery-value"></span>%</span></span>` : '';
    const lqi = this._config.linkquality_entity ? `<span class="sensor-reading" data-live="sensor-lqi" hidden><span class="sensor-inline-icon">${this._lucideIcon('chart-no-axes-column')}</span><span class="sensor-reading-label">Якість зв’язку Zigbee (LQI) </span><span data-live="sensor-lqi-value"></span></span>` : '';
    const vibration = !leak && vibrationId ? `<div class="sensor-extra" data-live="vibration" hidden><span class="sensor-caption">${this._lucideIcon('activity')}Вібрація</span><span class="sensor-extra-value" data-live="vibration-value"></span></div><div class="sensor-extra sensor-extra-missing" data-live="vibration-missing" hidden>Вібрація: немає зв’язку</div>` : '';
    return `<article class="sensor-status-card" data-live-panel="sensor" data-kind="${leak ? 'leak' : 'door'}" data-state="${state.state}">
      <header class="sensor-header">
        <span class="sensor-icon">${this._lucideIcon(icon)}</span>
        <div class="sensor-meta">${battery}${lqi}</div>
      </header>
      <div class="sensor-heading">
        ${location
          ? `<h2>${this._escape(location)}</h2><p data-live="sensor-name"${location === title ? ' hidden' : ''}>${this._escape(title)}</p>`
          : `<h2 data-live="sensor-name">${this._escape(title)}</h2>`}
      </div>
      <div class="sensor-main"><span class="sensor-dot" aria-hidden="true"></span><span class="sensor-status" data-live="sensor-status" aria-live="polite">${this._escape(state.label)}</span></div>
      ${vibration}
    </article>`;
  }

  _updateCardDynamic({ all, has }) {
    const entities = this._cardType === 'leak'
      ? ['leak_entity', 'battery_entity', 'linkquality_entity']
      : ['door_entity', 'vibration_entity', 'battery_entity', 'linkquality_entity'];
    if (all || entities.some(key => has(this._config[key]))) this._updateStatus();
  }
}

class HomeLeakCard extends HomeSensorStatusCard {
  static get cardType() { return 'leak'; }
  static get cardTitle() { return ['leak_entity', 'Протікання води']; }
}

class HomeDoorCard extends HomeSensorStatusCard {
  static get cardType() { return 'door'; }
  static get cardTitle() { return ['door_entity', 'Вхідні двері']; }
}

if (!customElements.get('home-leak-card')) customElements.define('home-leak-card', HomeLeakCard);
if (!customElements.get('home-door-card')) customElements.define('home-door-card', HomeDoorCard);
