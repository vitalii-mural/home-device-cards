class HomeWeatherCard extends HomeDeviceStandaloneCard {
  static get cardType() { return 'weather'; }
  static get cardTitle() { return []; }
  getCardSize() { return 3; }
  getGridOptions() { return { columns: 6, rows: 4, min_columns: 6, min_rows: 3 }; }

  constructor() {
    super();
    this._forecastType = 'hourly';
    this._weatherSubscriptions = new Map();
  }

  setConfig(config) {
    if (config?.weather_entity && !config.weather_entity.startsWith?.('weather.')) {
      throw new Error('Configuration option "weather_entity" must be a weather entity.');
    }
    this._clearWeatherSubscriptions();
    super.setConfig(config);
  }

  set hass(value) {
    super.hass = value;
    this._syncWeatherSubscriptions();
  }

  connectedCallback() {
    super.connectedCallback();
    this._syncWeatherSubscriptions();
    if (!this._weatherTimer) this._weatherTimer = setInterval(() => {
      for (const [type, job] of this._weatherSubscriptions) {
        if (job.failed) this._weatherSubscriptions.delete(type);
      }
      this._syncWeatherSubscriptions();
      this._renderWeather();
    }, 60000);
  }

  disconnectedCallback() {
    clearInterval(this._weatherTimer);
    this._weatherTimer = null;
    this._clearWeatherSubscriptions();
    super.disconnectedCallback();
  }

  _clearWeatherSubscriptions() {
    for (const job of this._weatherSubscriptions.values()) {
      if (job.unsubscribe) Promise.resolve().then(job.unsubscribe).catch(() => {});
    }
    this._weatherSubscriptions.clear();
    this._weatherConnection = null;
  }

  _supportedWeatherTypes() {
    const flags = this._state(this._config?.weather_entity)?.attributes?.supported_features || 0;
    return [['hourly', 2], ['daily', 1]].filter(([, flag]) => flags & flag).map(([type]) => type);
  }

  _syncWeatherSubscriptions() {
    if (!this.isConnected || !this._config || !this._hass) return;
    const connection = this._hass.connection;
    const types = this._supportedWeatherTypes();
    const entity = this._config.weather_entity;
    const available = this._available(entity);
    const key = `${entity}|${types.join(',')}|${available}`;
    if (connection !== this._weatherConnection || key !== this._weatherSubscriptionKey) {
      this._clearWeatherSubscriptions();
      this._weatherConnection = connection;
      this._weatherSubscriptionKey = key;
    }
    if (!available || !connection?.subscribeMessage) return;
    for (const type of types) {
      if (this._weatherSubscriptions.has(type)) continue;
      const job = { forecast: null, failed: false };
      this._weatherSubscriptions.set(type, job);
      Promise.resolve().then(() => connection.subscribeMessage(event => {
        if (this._weatherSubscriptions.get(type) !== job) return;
        job.forecast = Array.isArray(event?.forecast) ? event.forecast : [];
        job.failed = false;
        this._renderWeather();
      }, { type: 'weather/subscribe_forecast', entity_id: entity, forecast_type: type }))
        .then(unsubscribe => {
          if (this._weatherSubscriptions.get(type) !== job) return unsubscribe();
          job.unsubscribe = unsubscribe;
        }).catch(() => {
          if (this._weatherSubscriptions.get(type) !== job) return;
          job.failed = true;
          this._renderWeather();
        });
    }
  }

  _content() {
    return `<style>
      .weather-card{padding:12px 16px;border-radius:20px;background:var(--k-card);font-variant-numeric:tabular-nums;line-height:1.4}
      .weather-muted{font-size:11px;color:var(--k-muted)}
      .weather-current{display:grid;grid-template-columns:auto minmax(0,1fr) 34px;align-items:center;gap:12px;padding:8px 0}
      .weather-temperature{font-size:40px;line-height:1.1;letter-spacing:-1.5px}.weather-condition{font-size:12px;overflow-wrap:anywhere}.weather-feels{margin-top:3px}
      .weather-symbol svg{width:34px;height:34px;color:var(--k-accent)}.weather-card svg{fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
      .weather-metrics{display:flex;flex-wrap:wrap;gap:7px 14px;font-size:11px}.weather-metrics span{display:flex;align-items:center;gap:4px}.weather-metrics svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.6}.weather-metrics ha-icon{--mdc-icon-size:13px}
      .weather-forecast-header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 8px;margin-top:5px}
      .weather-tabs{display:flex;gap:12px}.weather-tabs button{min-height:44px;padding:0;background:transparent;border-bottom:2px solid transparent;border-radius:0;font-size:11px;color:var(--k-muted)}.weather-tabs button[aria-pressed=true]{color:var(--k-accent);border-bottom-color:var(--k-accent)}
      .weather-forecast{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;padding-top:6px}.weather-slot{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0;font-size:11px}.weather-slot strong{font-size:12px;font-weight:500}.weather-slot svg{width:19px;height:19px;color:var(--k-accent)}.weather-empty{grid-column:1/-1;font-size:11px;color:var(--k-muted);padding-bottom:3px}
    </style><article class="weather-card" aria-label="Погода">
      <div class="weather-current"><span class="weather-temperature" data-weather="temperature">—</span><div><div class="weather-condition" data-weather="condition"></div><div class="weather-feels weather-muted" data-weather="feels"></div></div><span class="weather-symbol" data-weather="icon" aria-hidden="true"></span></div>
      <div class="weather-metrics" data-weather="metrics"></div>
      <div class="weather-forecast-header"><div class="weather-tabs" role="group" aria-label="Період прогнозу"><button type="button" data-action="weather-period" data-period="hourly" aria-pressed="true">Погодинно</button><button type="button" data-action="weather-period" data-period="daily" aria-pressed="false">На 5 днів</button></div><span class="weather-muted" data-weather="range"></span></div>
      <div class="weather-forecast" data-weather="forecast" aria-live="polite"></div>
    </article>`;
  }

  _weatherCondition(condition) {
    return {
      sunny: ['Сонячно', 'sunny'], 'clear-night': ['Ясна ніч', 'night'],
      partlycloudy: ['Мінлива хмарність', 'partly-cloudy'], cloudy: ['Хмарно', 'cloudy'],
      rainy: ['Дощ', 'rainy'], pouring: ['Злива', 'pouring'], snowy: ['Сніг', 'snowy'],
      'snowy-rainy': ['Сніг із дощем', 'snowy-rainy'], fog: ['Туман', 'fog'],
      hail: ['Град', 'hail'], lightning: ['Гроза', 'lightning'],
      'lightning-rainy': ['Гроза з дощем', 'lightning-rainy'], windy: ['Вітряно', 'windy'],
      'windy-variant': ['Хмарно та вітряно', 'windy-variant'], exceptional: ['Небезпечна погода', 'cloudy-alert'],
    }[condition] || ['Немає даних', 'cloudy'];
  }

  _weatherTemp(value, unit = '°') {
    const number = this._number(value);
    if (number === null) return '—';
    const rounded = Math.round(number);
    return `${rounded > 0 ? '+' : ''}${rounded}${unit}`;
  }

  _weatherIcon(condition) {
    if (condition === 'sunny') return this._lucideIcon('sun');
    if (condition === 'clear-night') return this._lucideIcon('moon');
    if (condition === 'windy') return this._lucideIcon('wind');
    if (condition === 'snowy') return this._lucideIcon('snowflake');
    const cloud = '<path d="M20 16a4 4 0 0 0-.9-7.9A6 6 0 0 0 7.2 7 4.5 4.5 0 0 0 6.5 16H20Z"/>';
    const marks = {
      partlycloudy: '<path d="M12 3v1M4.2 4.2l.7.7M2 10h1M19.8 4.2l-.7.7"/>',
      rainy: '<path d="m8 19-1 2m6-2-1 2m6-2-1 2"/>',
      pouring: '<path d="m8 18-2 4m7-4-2 4m7-4-2 4"/>',
      'snowy-rainy': '<path d="m8 19-1 2m10-2-1 2M12 20h.01"/>',
      hail: '<path d="M8 20h.01M13 20h.01M18 20h.01"/>',
      fog: '<path d="M4 19h16M6 22h12"/>',
      lightning: '<path d="m13 16-3 4h4l-2 3"/>',
      'lightning-rainy': '<path d="m13 16-3 4h4l-2 3m-6-4-1 2m14-2-1 2"/>',
      'windy-variant': '<path d="M3 20h14m-7 3h10"/>',
      exceptional: '<path d="M12 10v2m0 2h.01"/>',
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${cloud}${marks[condition] || ''}</svg>`;
  }

  _weatherDate(value) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: this._hass?.config?.time_zone || 'Europe/Kyiv', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
  }

  _weatherForecast(type) {
    const today = this._weatherDate(Date.now());
    return (this._weatherSubscriptions.get(type)?.forecast || [])
      .filter(item => item && Number.isFinite(Date.parse(item.datetime)))
      .filter(item => type === 'daily' ? this._weatherDate(item.datetime) >= today : Date.parse(item.datetime) >= Date.now() - 3600000)
      .sort((a, b) => Date.parse(a.datetime) - Date.parse(b.datetime));
  }

  _updateCardDynamic() {
    this._syncWeatherSubscriptions();
    this._renderWeather();
  }

  _renderWeather() {
    if (!this._config || !this.shadowRoot.querySelector('[data-weather="forecast"]')) return;
    const state = this._state(this._config.weather_entity);
    const available = this._available(this._config.weather_entity);
    const attrs = available ? state.attributes : {};
    const zone = this._hass?.config?.time_zone || 'Europe/Kyiv';
    const time = value => new Intl.DateTimeFormat('uk-UA', { timeZone: zone, hour: '2-digit', minute: '2-digit' }).format(new Date(value));
    const set = (key, value) => this._setText(`[data-weather="${key}"]`, value);
    const unit = attrs.temperature_unit || this._hass?.config?.unit_system?.temperature || '°C';
    set('temperature', this._weatherTemp(attrs.temperature, unit === '°C' ? '°' : unit));
    const [condition] = this._weatherCondition(available ? state.state : null);
    set('condition', !this._config.weather_entity ? 'Виберіть сутність погоди' : condition);
    const iconNode = this.shadowRoot.querySelector('[data-weather="icon"]');
    iconNode.innerHTML = available ? this._weatherIcon(state.state) : '';
    iconNode.hidden = !available;
    set('feels', this._number(attrs.apparent_temperature) === null ? '' : `Відчувається як ${this._weatherTemp(attrs.apparent_temperature)}`);
    const metrics = [];
    if (this._number(attrs.wind_speed) !== null) {
      const bearing = this._number(attrs.wind_bearing);
      const direction = bearing === null ? (attrs.wind_bearing || '') : ['Пн', 'ПнСх', 'Сх', 'ПдСх', 'Пд', 'ПдЗх', 'Зх', 'ПнЗх'][((Math.round(bearing / 45) % 8) + 8) % 8];
      const windUnit = { 'm/s': 'м/с', 'km/h': 'км/год' }[attrs.wind_speed_unit] || attrs.wind_speed_unit || '';
      metrics.push(`${this._lucideIcon('wind')}<span>${this._escape(`${this._format(attrs.wind_speed)} ${windUnit} ${direction}`)}</span>`);
    }
    if (this._number(attrs.humidity) !== null) metrics.push(`${this._lucideIcon('droplet')}<span>${this._format(attrs.humidity, 0)}%</span>`);
    // Do not invent precipitation probability: UkrHMC supplies amounts, not probabilities.
    if (this._number(attrs.precipitation_probability) !== null) metrics.push(`<ha-icon icon="mdi:umbrella-outline" aria-hidden="true"></ha-icon><span>${this._format(attrs.precipitation_probability, 0)}%</span>`);
    this.shadowRoot.querySelector('[data-weather="metrics"]').innerHTML = metrics.map(value => `<span>${value}</span>`).join('');
    const types = this._supportedWeatherTypes();
    if (!types.includes(this._forecastType)) this._forecastType = types[0] || 'hourly';
    for (const button of this.shadowRoot.querySelectorAll('[data-action="weather-period"]')) {
      button.hidden = !types.includes(button.dataset.period);
      button.setAttribute('aria-pressed', String(button.dataset.period === this._forecastType));
    }
    const daily = available ? this._weatherForecast('daily') : [];
    const today = daily.find(item => this._weatherDate(item.datetime) === this._weatherDate(Date.now()));
    set('range', today && this._number(today.temperature) !== null && this._number(today.templow) !== null ? `↑ ${this._weatherTemp(today.temperature)} ↓ ${this._weatherTemp(today.templow)}` : '');
    const forecast = available ? this._weatherForecast(this._forecastType).slice(0, 5) : [];
    const container = this.shadowRoot.querySelector('[data-weather="forecast"]');
    if (!forecast.length) {
      const job = this._weatherSubscriptions.get(this._forecastType);
      container.innerHTML = `<span class="weather-empty">${!available ? 'Прогноз недоступний' : !types.length ? 'Джерело не надає прогнозу' : job?.failed ? 'Не вдалося отримати прогноз' : job && job.forecast === null ? 'Завантаження прогнозу…' : 'Немає прогнозу'}</span>`;
      return;
    }
    container.innerHTML = forecast.map(item => {
      const [label] = this._weatherCondition(item.condition);
      const date = this._weatherDate(item.datetime);
      const tomorrow = new Date(`${this._weatherDate(Date.now())}T12:00:00Z`);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      const day = date === this._weatherDate(Date.now()) ? 'Сьогодні' : date === tomorrow.toISOString().slice(0, 10) ? 'Завтра' : new Intl.DateTimeFormat('uk-UA', { timeZone: zone, weekday: 'short' }).format(new Date(item.datetime));
      return `<div class="weather-slot"><span class="weather-muted">${this._escape(this._forecastType === 'hourly' ? time(item.datetime) : day)}</span><span role="img" aria-label="${label}">${this._weatherIcon(item.condition)}</span><strong>${this._weatherTemp(item.temperature)}</strong>${this._forecastType === 'daily' ? `<span class="weather-muted">${this._weatherTemp(item.templow)}</span>` : ''}</div>`;
    }).join('');
  }

  _click(event) {
    const button = event.target.closest('[data-action="weather-period"]');
    if (!button) return super._click(event);
    if (!this._supportedWeatherTypes().includes(button.dataset.period)) return;
    this._forecastType = button.dataset.period;
    this._renderWeather();
  }
}

if (!customElements.get('home-weather-card')) customElements.define('home-weather-card', HomeWeatherCard);
