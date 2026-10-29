class HomeSensorStatusCard extends HomeDeviceStandaloneCard {
  _battery() {
    const id = this._config.battery_entity, state = this._state(id);
    const visible = !!id && this._available(id);
    const value = visible ? this._number(state.state) : null;
    this._setHidden('[data-live="sensor-battery"]', !visible);
    this._setText('[data-live="sensor-battery-value"]', value === null ? '—' : this._format(value, 0));
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
    this._battery();
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
      title = this._displayName(leak ? 'leak_entity' : 'door_entity', this._config.title, leak ? 'Протікання води' : 'Вхідні двері'),
      location = this._config.location,
      state = this._status(leak ? 'leak_entity' : 'door_entity'),
      icon = leak ? 'droplets' : 'door-closed',
      vibrationId = this._config.vibration_entity,
      batteryId = this._config.battery_entity;
    const battery = batteryId ? `<span class="sensor-battery" data-live="sensor-battery"><span class="sensor-inline-icon">${this._lucideIcon('battery-medium')}</span><span data-live="sensor-battery-value"></span>%</span>` : '';
    const vibration = !leak && vibrationId ? `<div class="sensor-extra" data-live="vibration" hidden><span class="sensor-caption">${this._lucideIcon('activity')}Вібрація</span><span class="sensor-extra-value" data-live="vibration-value"></span></div><div class="sensor-extra sensor-extra-missing" data-live="vibration-missing" hidden>Вібрація: немає зв’язку</div>` : '';
    return `<article class="sensor-status-card" data-live-panel="sensor" data-kind="${leak ? 'leak' : 'door'}" data-state="${state.state}"><header class="sensor-header"><span class="sensor-icon">${this._lucideIcon(icon)}</span><div class="sensor-heading"><h2>${this._escape(title)}</h2>${location ? `<span class="sensor-location">${this._escape(location)}</span>` : ''}</div>${battery}</header><div class="sensor-main"><span class="sensor-dot" aria-hidden="true"></span><span class="sensor-status" data-live="sensor-status" aria-live="polite">${this._escape(state.label)}</span></div>${vibration}</article>`;
  }

  _updateCardDynamic({ all, has }) {
    const entities = this._cardType === 'leak' ? ['leak_entity', 'battery_entity'] : ['door_entity', 'vibration_entity', 'battery_entity'];
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
