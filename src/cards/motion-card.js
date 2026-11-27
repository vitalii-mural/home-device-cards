class HomeMotionCard extends HomeDeviceStandaloneCard {
  static get cardType() { return 'motion'; }
  static get cardTitle() { return ['motion_entity', 'Рух']; }
  getCardSize() { return 2; }
  getGridOptions() { return { columns: 6, rows: 2, min_columns: 3, min_rows: 2 }; }

  setConfig(config) {
    if (config?.motion_entity !== this._config?.motion_entity) this._lastMotion = null;
    super.setConfig(config);
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this._motionTimer) this._motionTimer = setInterval(() => this._updateMotion(), 30000);
  }

  disconnectedCallback() {
    clearInterval(this._motionTimer);
    this._motionTimer = null;
    super.disconnectedCallback();
  }

  _content() {
    return `<style>
      .motion-card{position:relative;display:grid;grid-template-columns:38px minmax(0,1fr) auto;align-items:center;gap:10px;padding:14px;border-radius:20px;background:var(--k-card)}
      .motion-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:var(--k-soft);color:var(--k-muted)}
      .motion-icon svg{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      .motion-card[data-state=active] .motion-icon{background:var(--k-accent-bg);color:var(--k-accent)}
      .motion-card h2{font-size:14px;overflow-wrap:anywhere}.motion-state{font-size:12px;margin-top:3px}.motion-card[data-state=active] .motion-state{color:var(--k-accent)}
      .motion-time{font-size:11px;color:var(--k-muted);margin-top:3px}.motion-meta{display:flex;flex-direction:column;align-items:flex-end;gap:5px}.motion-illuminance{font-size:11px;color:var(--k-muted);white-space:nowrap}
      .motion-battery{display:flex;align-items:center;gap:4px;font-size:11px;color:var(--k-muted);white-space:nowrap}
      .motion-battery svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.6}.motion-battery[data-low=true]{color:var(--k-danger)}
      .motion-history{position:absolute;inset:0;width:100%;height:100%;background:transparent;border-radius:20px}.motion-history:focus-visible{outline-offset:-3px}
    </style><article class="motion-card" data-state="offline">
      <span class="motion-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="13" cy="4" r="2"/><path d="m7 21 3-6m6 6-2-5-3-3 1-5m-5 5 3-5 4 1 3 4h3M3 8h2M2 12h2"/></svg></span>
      <div><h2></h2><div class="motion-state" data-motion="state" aria-live="polite"></div><div class="motion-time" data-motion="time" hidden></div></div>
      <div class="motion-meta"><span class="motion-illuminance" data-motion="illuminance" hidden></span><span class="motion-battery" data-motion="battery" hidden>${this._lucideIcon('battery-medium')}<span data-motion="battery-value"></span></span></div>
      <button type="button" class="motion-history" data-action="more" data-entity="${this._escape(this._config.motion_entity || '')}" aria-label="Історія руху" disabled></button>
    </article>`;
  }

  _elapsed(timestamp) {
    const elapsed = Date.now() - timestamp;
    if (!Number.isFinite(elapsed) || elapsed < 0) return '';
    const minutes = Math.floor(elapsed / 60000);
    if (!minutes) return 'менше хвилини';
    if (minutes < 60) return `${minutes} хв`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} год${minutes % 60 ? ` ${minutes % 60} хв` : ''}`;
    return `${Math.floor(minutes / 1440)} дн`;
  }

  _updateCardDynamic() { this._updateMotion(); }

  _updateMotion() {
    if (!this._config || !this._hass) return;
    const article = this.shadowRoot.querySelector('.motion-card');
    if (!article) return;
    const state = this._state(this._config.motion_entity);
    const presence = state?.attributes?.device_class === 'occupancy' || state?.attributes?.device_class === 'presence';
    const status = homeBinarySensorStatus(state, presence ? 'Є присутність' : 'Є рух', presence ? 'Немає присутності' : 'Немає руху');
    article.dataset.state = status.state;
    this._setText('[data-motion="state"]', this._config.motion_entity ? status.label : 'Виберіть датчик руху');
    const button = this.shadowRoot.querySelector('.motion-history');
    button.disabled = !state;
    button.setAttribute('aria-label', `Історія ${presence ? 'присутності' : 'руху'}: ${this._displayName('motion_entity', this._config.title, 'Рух')}`);
    const changed = Date.parse(state?.last_changed);
    if (state?.state === 'on' && Number.isFinite(changed)) this._lastMotion = changed;
    const explicit = Date.parse(this._state(this._config.last_motion_entity)?.state);
    const last = Number.isFinite(explicit) ? explicit : this._lastMotion;
    let time = '';
    if (status.state === 'normal') {
      if (last && this._elapsed(last)) time = `Остання активність ${this._elapsed(last)} тому`;
      else if (this._elapsed(changed)) time = `${presence ? 'Без присутності' : 'Без руху'} ${this._elapsed(changed)}`;
    }
    this._setText('[data-motion="time"]', time);
    this._setHidden('[data-motion="time"]', !time);
    const illuminanceState = this._state(this._config.illuminance_entity);
    const illuminance = this._number(illuminanceState?.state);
    const validIlluminance = illuminance !== null && illuminance >= 0 && ['lx', 'lux'].includes(illuminanceState?.attributes?.unit_of_measurement);
    this._setHidden('[data-motion="illuminance"]', !validIlluminance);
    this._setText('[data-motion="illuminance"]', validIlluminance ? `${this._format(illuminance, 0)} лк` : '');
    const battery = this._value(this._config.battery_entity);
    const validBattery = battery !== null && battery >= 0 && battery <= 100;
    this._setHidden('[data-motion="battery"]', !validBattery);
    this._setText('[data-motion="battery-value"]', validBattery ? `${this._format(battery, 0)}%` : '');
    const batteryNode = this.shadowRoot.querySelector('[data-motion="battery"]');
    batteryNode.dataset.low = String(validBattery && battery <= 20);
    batteryNode.setAttribute('aria-label', validBattery ? `Заряд батареї ${this._format(battery, 0)}%` : '');
  }
}

if (!customElements.get('home-motion-card')) customElements.define('home-motion-card', HomeMotionCard);
