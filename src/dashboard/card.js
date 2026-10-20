class HomeDashboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._view = 'home';
    this._busyEntities = new Set();
    this._error = '';
    this._generation = 0;
    this._layout = 'mobile';
    this._columns = 'one';
    this._graphCards = new Map();
    this._graphSources = new Map();
    this._entitySignatures = new Map();
    this._pendingTargets = new Map();
    this.shadowRoot.addEventListener('click', event => this._click(event));
    this.shadowRoot.addEventListener('change', event => this._change(event));
  }

  connectedCallback() {
    this._resizeObserver = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      const layout = width >= 680 ? 'desktop' : 'mobile';
      const columns = width >= 1000 ? 'three' : width >= 680 ? 'two' : 'one';
      if (layout !== this._layout || columns !== this._columns) {
        this._layout = layout;
        this._columns = columns;
        this._render();
      }
    });
    this._resizeObserver.observe(this);
    if (this._config && this._hass && !this._rendered) this._render();
  }

  disconnectedCallback() {
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
    this._generation++;
    this._rendered = false;
    this._clearPendingTimers();
  }

  _clearPendingTimers() {
    for (const pending of this._pendingTargets.values()) clearTimeout(pending.timer);
    this._pendingTargets.clear();
    if (this._socketPending) clearTimeout(this._socketPending.timer);
    this._socketPending = null;
    this._busyEntities.clear();
  }

  _validatedConfig(config, entityKeys, stringKeys = []) {
    if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error('Card configuration must be an object.');
    const normalized = { ...config };
    for (const key of entityKeys) {
      const value = normalized[key];
      if (value === '' || value === null || value === undefined) normalized[key] = null;
      else if (typeof value !== 'string') throw new Error(`Configuration option "${key}" must be an entity ID or empty.`);
    }
    for (const key of stringKeys) {
      const value = normalized[key];
      if (value !== null && value !== undefined && typeof value !== 'string') throw new Error(`Configuration option "${key}" must be text.`);
    }
    return normalized;
  }

  setConfig(config) {
    const entityKeys = Object.keys(HOME_DASHBOARD_DEFAULTS);
    const normalized = this._validatedConfig(config, entityKeys);
    this._clearPendingTimers();
    this._generation++;
    this._entitySignatures.clear();
    this._config = { ...HOME_DASHBOARD_DEFAULTS, ...normalized };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const ids = this._entityIds();
    const changed=[];
    for(const id of new Set(ids)){
      const signature=JSON.stringify(hass.states[id]);
      if(this._entitySignatures.get(id)!==signature)changed.push(id);
      this._entitySignatures.set(id,signature);
    }
    const themeChanged=this._darkMode!==hass.themes?.darkMode;
    this._darkMode=hass.themes?.darkMode;
    for(const [entity,pending] of this._pendingTargets){
      if(changed.includes(entity)&&this._number(hass.states[entity]?.attributes?.temperature)===pending.temperature){clearTimeout(pending.timer);this._pendingTargets.delete(entity);}
    }
    if(!this._rendered)this._render();
    else if(changed.length||themeChanged)this._updateDynamic(changed,themeChanged);
  }

  getCardSize() { return this._view === 'home' ? 15 : 10; }
  static getStubConfig() { return { type: 'custom:home-dashboard' }; }
  _state(id) { return id ? this._hass?.states[id] : undefined; }
  _entityIds() { return Object.keys(HOME_DASHBOARD_DEFAULTS).map(key => this._config?.[key]).filter(Boolean); }
  _available(id) { const s = this._state(id); return !!s && !['unknown', 'unavailable'].includes(s.state); }
  _number(value) { return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) ? Number(value) : null; }
  _value(id) { return this._number(this._state(id)?.state); }
  _format(value, digits = 1) { return this._number(value) === null ? '—' : new Intl.NumberFormat('uk-UA', { maximumFractionDigits: digits }).format(Number(value)); }
  _escape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
  _icon(name, className = '') { return `<ha-icon icon="mdi:${name}" class="${className}" aria-hidden="true"></ha-icon>`; }
  _busy(entity) { return !!entity&&this._busyEntities.has(entity); }
  _disabled(disabled,entity) { return disabled || this._busy(entity) ? 'disabled' : ''; }
  _airId() { return this._config?.air_entity || null; }
  _row(label, value, key=null) { return `<div class="data-row"><span>${this._escape(label)}</span><span>${key?`<span data-live="${key}">`:''}${this._escape(value)}${key?'</span>':''}</span></div>`; }
  _setText(selector,value,root=this.shadowRoot) { const el=root.querySelector(selector),text=String(value??''); if(el&&el.textContent!==text)el.textContent=text; }
  _setHidden(selector,hidden,root=this.shadowRoot) { const el=root.querySelector(selector),value=!!hidden; if(el&&el.hidden!==value)el.hidden=value; }
  _moreButton(entity, label) { return `<button class="flat-button wide-button" data-action="more" data-entity="${this._escape(entity)}" ${this._disabled(!this._state(entity),entity)}>${this._escape(label)}</button>`; }

  _boiler() {
    const c = this._config, state = this._state(c.boiler_entity), a = state?.attributes || {};
    const available = this._available(c.boiler_entity), on = available && state.state !== 'off', heating = on && (a.hvac_action === 'heating' || a.heating === true);
    const current = this._number(a.current_temperature), pendingTarget=this._pendingTargets.get(c.boiler_entity), target = pendingTarget?.temperature??this._number(a.temperature);
    const min = this._number(a.min_temp) ?? 30;
    const progress = current !== null && target !== null && target > min ? Math.min(100, Math.max(0, (current - min) / (target - min) * 100)) : 0;
    const h = this._value(c.boiler_hours), m = this._value(c.boiler_minutes);
    const remaining = c.boiler_entity?.startsWith('water_heater.') ? this._number(a.heating_time_remaining) : h !== null && m !== null && h >= 0 && m >= 0 ? h * 60 + m : null;
    const time = remaining !== null && remaining > 0 ? `${remaining >= 60 ? Math.floor(remaining / 60) + ' год ' : ''}${remaining % 60} хв` : '';
    const status = !state ? 'Не підключено' : !available ? 'Недоступний' : !on ? 'Вимкнено' : heating ? 'Нагрівання' : (a.hvac_action === 'idle' || a.keep_warm === true) ? 'Підтримання температури' : 'Увімкнено';
    const features = [[c.memo_entity, 'Memo U'], [c.mega_entity, 'Mega Water'], [c.sterilization_entity, 'Стерилізація']].map(([id,label]) =>
      `<button class="feature" data-action="feature" data-entity="${this._escape(id)}" aria-pressed="${this._state(id)?.state === 'on'}" aria-label="${label}${!this._state(id) ? ': не підключено' : ''}" title="${!this._state(id) ? 'Сутність не підключена' : label}" ${this._disabled(!this._available(id),id)}>${label}</button>`).join('');
    return `<article class="panel" aria-label="Бойлер" data-live-panel="boiler"><div class="panel-top"><div class="heading"><span class="device-icon warm">${this._icon('water-boiler')}</span><div><h2>Гаряча вода</h2><span class="secondary ${heating ? 'heating' : ''}" data-live="boiler-status">${status}</span></div></div><button class="icon-button ${on ? 'active-warm' : ''}" data-action="boiler-power" aria-label="${on ? 'Вимкнути' : 'Увімкнути'} бойлер" aria-pressed="${on}" ${this._disabled(!available,c.boiler_entity)}>${this._icon('power')}</button></div>
    <div class="water-large"><span class="current"><span data-live="boiler-current">${available ? this._format(current) : '—'}</span><small class="degree">°C</small></span><div class="setpoint"><span class="secondary">Нагріти до</span><div class="adjust"><button class="round" data-action="boiler-minus" aria-label="Зменшити температуру бойлера" ${this._disabled(!available || target === null || target <= min,c.boiler_entity)}>${this._icon('minus')}</button><span class="target"><span data-live="boiler-target">${this._format(target)}</span>°</span><button class="round" data-action="boiler-plus" aria-label="Збільшити температуру бойлера" ${this._disabled(!available || target === null || target >= (this._number(a.max_temp) ?? 80),c.boiler_entity)}>${this._icon('plus')}</button></div><span class="secondary pending-hint" data-live="boiler-pending" data-pending="${!!pendingTarget}" aria-hidden="${!pendingTarget}" role="status">Очікує підтвердження</span></div></div>
    <div class="progress ${heating ? '' : 'waiting'}" data-live="boiler-progress" role="progressbar" aria-label="Температура води до заданої" aria-valuenow="${Math.round(progress)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${progress}%"></span></div>
    <div class="time" data-live="boiler-time" ${heating&&time?'':'hidden'}>${this._icon('clock-outline')}<span>До нагрівання · ${time}</span></div><div class="features" role="group" aria-label="Режими бойлера">${features}</div></article>`;
  }

  _air() {
    const id = this._airId(), state = this._state(id), a = state?.attributes || {}, available = this._available(id), on = available && state.state !== 'off';
    const modes = a.hvac_modes || [], target = this._pendingTargets.get(id)?.temperature??this._number(a.temperature), room = this._number(a.current_temperature);
    const names = { cool:'Охолодження', heat:'Обігрів', dry:'Осушення', fan_only:'Вентиляція', auto:'Авто', heat_cool:'Авто' };
    const status = !state ? 'Не підключений до HA' : !available ? 'Недоступний' : on ? (names[state.state] || 'Увімкнений') : 'Вимкнений';
    const fanModes = a.fan_modes || [], fanNames = { auto:'Авто', low:'Тихо', medium:'Середня', high:'Висока', quiet:'Тихо' };
    const modesHtml = [['cool','snowflake','Холод'], ['heat','white-balance-sunny','Тепло'], ['dry','water-outline','Осушення']].map(([mode,icon,label]) => `<button class="mode" data-action="air-mode" data-mode="${mode}" aria-pressed="${state?.state === mode}" ${this._disabled(!available || !modes.includes(mode),id)}>${this._icon(icon)}${label}</button>`).join('');
    const fanOptions = fanModes.length ? fanModes.map(mode => `<option value="${this._escape(mode)}" ${a.fan_mode === mode ? 'selected' : ''}>${this._escape(fanNames[mode] || mode)}</option>`).join('') : '<option>Недоступно</option>';
    return `<article class="panel" aria-label="Кондиціонер" data-live-panel="air"><div class="panel-top"><div class="heading"><span class="device-icon cool">${this._icon('air-conditioner')}</span><div><h2>Кондиціонер</h2><span class="secondary"><span data-live="air-status">${status}</span><span data-live="air-room">${room !== null && available ? ' · у кімнаті ' + this._format(room) + ' °C' : ''}</span></span></div></div><button class="icon-button ${on ? 'active-cool' : ''}" data-action="air-power" aria-label="${on ? 'Вимкнути' : 'Увімкнути'} кондиціонер" aria-pressed="${on}" ${this._disabled(!available,id)}>${this._icon('power')}</button></div>
    <div class="air-temperature"><button class="round" data-action="air-minus" aria-label="Зменшити температуру кондиціонера" ${this._disabled(!available || target === null || target <= (this._number(a.min_temp) ?? 16),id)}>${this._icon('minus')}</button><div><span class="air-value" data-live="air-target">${available ? this._format(target) : '—'}</span><span class="air-degree">°C</span><span class="secondary">Задана температура</span><span class="secondary pending-hint" data-live="air-pending" data-pending="${this._pendingTargets.has(id)}" aria-hidden="${!this._pendingTargets.has(id)}" role="status">Очікує підтвердження</span></div><button class="round" data-action="air-plus" aria-label="Збільшити температуру кондиціонера" ${this._disabled(!available || target === null || target >= (this._number(a.max_temp) ?? 30),id)}>${this._icon('plus')}</button></div>
    <div class="modes" role="group" aria-label="Режим кондиціонера">${modesHtml}</div><div class="fan"><span class="fan-label">${this._icon('fan')}Вентилятор</span><select data-action="air-fan" aria-label="Швидкість вентилятора кондиціонера" ${this._disabled(!available || !fanModes.length,id)}>${fanOptions}</select></div></article>`;
  }

  _climateMetrics() {
    const roomId = this._config.room_temperature_entity, humidityId = this._config.humidity_entity;
    const air = this._state(this._airId()), fallback = this._available(this._airId()) ? this._number(air?.attributes.current_temperature) : null;
    const temperature = this._available(roomId) ? this._value(roomId) : fallback;
    const humidity = this._available(humidityId) ? this._value(humidityId) : null;
    return `<div class="small-grid" data-live-panel="metrics"><div class="metric">${this._icon('thermometer')}<span class="secondary">${this._escape(this._config.room_temperature_label || 'Кімната')}</span><span class="metric-value"><span data-live="room-temperature">${this._format(temperature)}</span> <small>°C</small></span><span class="empty-caption" data-live="room-temperature-empty" ${temperature===null?'':'hidden'}>Датчик не підключено</span></div><div class="metric">${this._icon('water-percent')}<span class="secondary">${this._escape(this._config.humidity_label || 'Вологість')}</span><span class="metric-value"><span data-live="humidity">${this._format(humidity)}</span> <small>%</small></span><span class="empty-caption" data-live="humidity-empty" ${humidity===null?'':'hidden'}>Датчик не підключено</span></div></div>`;
  }

  _river() {
    const c = this._config, online = this._state(c.river_status)?.state === 'online';
    return `<article class="panel" aria-label="EcoFlow" data-live-panel="river"><div class="panel-top"><div class="heading"><span class="device-icon neutral">${this._icon('battery-charging-outline')}</span><div><h2>EcoFlow RIVER Max</h2><span class="secondary" data-live="river-status">${online ? 'Онлайн' : 'Станція офлайн'}</span></div></div><span class="status-dot ${online ? 'online' : ''}" data-live="river-dot" aria-label="${online ? 'Онлайн' : 'Офлайн'}"></span></div>
    <div class="river-values" data-live="river-values" ${online?'':'hidden'}><div><span class="river-value"><span data-live="river-battery">${this._format(this._value(c.river_battery))}</span><small>%</small></span><span class="secondary">Заряд станції</span></div><div><span class="secondary">Вхід / вихід</span><div class="power-values"><span data-live="river-input">${this._format(this._value(c.river_input),0)}</span> / <span data-live="river-output">${this._format(this._value(c.river_output),0)}</span> Вт</div></div></div>
    <button class="text-button" data-action="view-battery">Батареї та історія${this._icon('arrow-top-right')}</button></article>`;
  }

  _home() {
    if (this._layout === 'desktop') return this._desktopHome();
    return this._boiler() + this._air() + this._climateMetrics() + this._river() + `<div class="links"><button class="link" data-action="view-energy">${this._icon('chart-line')}<span><strong>Енергія</strong><small>Бойлер · <span data-live="energy-daily">${this._format(this._value(this._config.energy_daily),2)}</span> кВт·год сьогодні</small></span>${this._icon('chevron-right','chevron')}</button></div>`;
  }

  _desktopHome() {
    const c = this._config;
    return `<div class="desktop-board"><div class="desktop-water">${this._boiler()}</div><div class="desktop-air">${this._air()}</div><aside class="desktop-overview" aria-label="Стан дому">${this._river()}${this._climateMetrics()}</aside>
    <article class="panel desktop-energy" aria-label="Енергія бойлера"><div class="energy-heading"><div><h2>Споживання бойлера</h2><span class="secondary">Потужність та історія</span></div><span class="power-now"><span data-live="power">${this._format(this._value(c.power_entity),0)}</span> <small>Вт зараз</small></span></div><div class="energy-stats"><div><span class="secondary">Сьогодні</span><strong><span data-live="energy-daily">${this._format(this._value(c.energy_daily),2)}</span> <small>кВт·год</small></strong></div><div><span class="secondary">Цього місяця</span><strong><span data-live="energy-monthly">${this._format(this._value(c.energy_monthly),2)}</span> <small>кВт·год</small></strong></div></div><div class="graph-slot" data-graph="boiler"><span class="secondary">Завантаження історії…</span></div><button class="text-button" data-action="view-energy">Детальні показники${this._icon('arrow-top-right')}</button></article>
</div>`;
  }

  _energy() {
    const c=this._config;
    return `<div class="small-grid"><div class="metric"><span class="secondary">Сьогодні</span><span class="metric-value"><span data-live="energy-daily">${this._format(this._value(c.energy_daily),2)}</span> <small>кВт·год</small></span></div><div class="metric"><span class="secondary">Цього місяця</span><span class="metric-value"><span data-live="energy-monthly">${this._format(this._value(c.energy_monthly),2)}</span> <small>кВт·год</small></span></div></div><article class="panel"><h2>Розетка бойлера</h2><div class="data-row"><span>Потужність зараз</span><span><span data-live="power">${this._format(this._value(c.power_entity),0)}</span> Вт</span></div><div class="data-row"><span>Напруга</span><span><span data-live="voltage">${this._format(this._value(c.voltage_entity),1)}</span> В</span></div><div class="data-row"><span>Струм</span><span><span data-live="current">${this._format(this._value(c.current_entity),2)}</span> А</span></div><div class="data-row"><span>Від початку обліку</span><span><span data-live="energy-total">${this._format(this._value(c.energy_total),2)}</span> кВт·год</span></div></article><div class="graph-slot" data-graph="boiler"><span class="secondary">Завантаження історії…</span></div><div class="button-row">${this._moreButton(c.energy_daily,'Історія за день')}${this._moreButton(c.energy_monthly,'Історія за місяць')}</div>`;
  }

  _batteryDetails() {
    const online=this._state(this._config.river_status)?.state==='online';
    const reading=(suffix,unit,digits=1,positive=false)=>{
      const n=this._value(null+suffix);
      return online && n!==null && (!positive || n>0) ? this._format(n,digits)+(unit?' '+unit:'') : '—';
    };
    const battery=(slave)=>{
      const p=slave?'slave_':'', id=slave?'slave':'main';
      return `<article class="panel"><h2>${slave?'Додаткова батарея':'Основна батарея'}</h2>${this._row('Заряд',reading(slave?'slave_battery_level':'main_battery_level','%'),`battery-${id}-level`)}${this._row('Повна ємність',reading(slave?'slave_full_capacity':'main_full_capacity','мА·год',0,true),`battery-${id}-full`)}${this._row('Залишкова ємність',reading(slave?'slave_remain_capacity':'main_remain_capacity','мА·год',0),`battery-${id}-remain`)}${this._row('Напруга батареї',reading(p+'battery_volts','В',3,true),`battery-${id}-volts`)}${this._row('Струм батареї',reading(p+'battery_current','мА',0),`battery-${id}-current`)}${this._row('Комірки · мін. / макс.',reading(p+'min_cell_volts','В',3,true)+' / '+reading(p+'max_cell_volts','В',3,true),`battery-${id}-cells`)}${this._row('Температури · мін. / макс.',reading(p+'min_cell_temperature','°C')+' / '+reading(p+'max_cell_temperature','°C'),`battery-${id}-temps`)}${this._row('Цикли',reading(p+'cycles','',0),`battery-${id}-cycles`)}</article>`;
    };
    return `<article class="panel" data-live="river-offline-note" ${online?'hidden':''}><p class="notice">Станція офлайн. Поточні вимірювання приховані; попередні записи доступні на графіках.</p></article>${battery(false)}${battery(true)}<div class="graph-slot" data-graph="river-current"></div><div class="graph-slot" data-graph="river-cells"></div>`;
  }

  _devices() {
    const c=this._config;
    return `<article class="panel"><h2>Керування та подробиці</h2><div class="links" style="margin-top:15px">${this._moreButton(c.boiler_entity,'Бойлер Midea')}${this._moreButton(this._airId(),'Кондиціонер Cooper&Hunter')}${this._moreButton(c.memo_entity,'Memo U')}${this._moreButton(c.sterilization_entity,'Стерилізація')}${this._moreButton(c.river_status,'EcoFlow RIVER Max')}</div></article><article class="panel"><h2>Підключення</h2>${this._row('Кондиціонер',this._state(this._airId())?'Додано':'Ще не додано в HA','device-air')}${this._row('Кімнатні датчики',this._state(c.room_temperature_entity)?'Додано':'Ще не підключено','device-room')}${this._row('Mega Water',this._state(c.mega_entity)?'Додано':'Окремої сутності немає','device-mega')}</article>`;
  }

  _updateDynamic(changedIds=null,themeChanged=false,serviceEntity=null) {
    const all=changedIds===null,changed=new Set(changedIds||[]),has=id=>!!id&&(all||changed.has(id)),boiler=this._config.boiler_entity,air=this._airId();
    if(all||themeChanged)this.toggleAttribute('dark',!!this._hass?.themes?.darkMode);
    this._setText('[data-live="error"]',this._error);
    this._setHidden('[data-live="error"]',!this._error);
    if(this._view==='home'){
      const features=[this._config.memo_entity,this._config.mega_entity,this._config.sterilization_entity];
      if(all||has(boiler)||has(this._config.boiler_hours)||has(this._config.boiler_minutes)||serviceEntity===boiler||features.some(id=>has(id)||serviceEntity===id))this._updateBoiler();
      if(all||has(air)||serviceEntity===air)this._updateAir();
      if(all||has(air)||has(this._config.room_temperature_entity)||has(this._config.humidity_entity))this._updateMetrics();
      if(all||[this._config.river_status,this._config.river_battery,this._config.river_input,this._config.river_output].some(has))this._updateRiver();
      if(all||[this._config.power_entity,this._config.energy_daily,this._config.energy_monthly].some(has))this._updateEnergy();
    } else if(this._view==='energy'){
      if(all||[this._config.power_entity,this._config.voltage_entity,this._config.current_entity,this._config.energy_total,this._config.energy_daily,this._config.energy_monthly].some(has))this._updateEnergy();
    } else if(this._view==='battery'){
      const riverChanged=all||[this._config.river_status,this._config.river_battery,this._config.river_input,this._config.river_output].some(has);
      if(riverChanged){this._updateRiver();this._updateBattery();}
    } else if(this._view==='devices'){
      if(all||has(air)||has(this._config.room_temperature_entity)||has(this._config.mega_entity))this._updateDevices();
    }
    for(const button of this.shadowRoot.querySelectorAll('[data-action="more"]')){
      if(all||has(button.dataset.entity)||serviceEntity===button.dataset.entity)button.disabled=!this._state(button.dataset.entity)||this._busy(button.dataset.entity);
    }
    for(const [key,card] of this._graphCards){
      if(card.isConnected&&(all||themeChanged||(this._graphSources.get(key)||[]).some(has)))card.hass=this._hass;
    }
  }

  _updateBoiler() {
    const panel=this.shadowRoot.querySelector('[data-live-panel="boiler"]');
    if(!panel)return;
    const id=this._config.boiler_entity,state=this._state(id),a=state?.attributes||{},available=this._available(id),on=available&&state.state!=='off';
    const pending=this._pendingTargets.get(id),target=pending?.temperature??this._number(a.temperature),current=this._number(a.current_temperature);
    const min=this._number(a.min_temp)??30,max=this._number(a.max_temp)??80,heating=on&&(a.hvac_action==='heating'||a.heating===true);
    const progress=current!==null&&target!==null&&target>min?Math.min(100,Math.max(0,(current-min)/(target-min)*100)):0;
    const h=this._value(this._config.boiler_hours),m=this._value(this._config.boiler_minutes);
    const remaining=id?.startsWith('water_heater.')?this._number(a.heating_time_remaining):h!==null&&m!==null&&h>=0&&m>=0?h*60+m:null;
    const time=remaining!==null&&remaining>0?`${remaining>=60?Math.floor(remaining/60)+' год ':''}${remaining%60} хв`:'';
    const status=!state?'Не підключено':!available?'Недоступний':!on?'Вимкнено':heating?'Нагрівання':(a.hvac_action==='idle'||a.keep_warm===true)?'Підтримання температури':'Увімкнено';
    this._setText('[data-live="boiler-status"]',status,panel);
    panel.querySelector('[data-live="boiler-status"]')?.classList.toggle('heating',heating);
    this._setText('[data-live="boiler-current"]',available?this._format(current):'—',panel);
    this._setText('[data-live="boiler-target"]',this._format(target),panel);
    const pendingHint=panel.querySelector('[data-live="boiler-pending"]');if(pendingHint){pendingHint.dataset.pending=String(!!pending);pendingHint.setAttribute('aria-hidden',String(!pending));}
    const bar=panel.querySelector('[data-live="boiler-progress"] span');if(bar)bar.style.width=`${progress}%`;
    const progressEl=panel.querySelector('[data-live="boiler-progress"]');if(progressEl){progressEl.setAttribute('aria-valuenow',String(Math.round(progress)));progressEl.classList.toggle('waiting',!heating);}
    const timeEl=panel.querySelector('[data-live="boiler-time"]');if(timeEl){this._setHidden('[data-live="boiler-time"]',!heating||!time,panel);this._setText('[data-live="boiler-time"] span',time?`До нагрівання · ${time}`:'',panel);}
    const power=panel.querySelector('[data-action="boiler-power"]');if(power){power.disabled=!available||this._busy(id);power.setAttribute('aria-pressed',String(on));power.setAttribute('aria-label',`${on?'Вимкнути':'Увімкнути'} бойлер`);power.classList.toggle('active-warm',on);}
    const minus=panel.querySelector('[data-action="boiler-minus"]'),plus=panel.querySelector('[data-action="boiler-plus"]');
    if(minus)minus.disabled=!available||target===null||target<=min||this._busy(id);
    if(plus)plus.disabled=!available||target===null||target>=max||this._busy(id);
    for(const button of panel.querySelectorAll('[data-action="feature"]')){const feature=this._state(button.dataset.entity);button.disabled=!this._available(button.dataset.entity)||this._busy(button.dataset.entity);button.setAttribute('aria-pressed',String(feature?.state==='on'));button.setAttribute('aria-label',`${button.textContent.trim()}${!feature?': не підключено':''}`);}
  }

  _updateAir() {
    const panel=this.shadowRoot.querySelector('[data-live-panel="air"]');if(!panel)return;
    const id=this._airId(),state=this._state(id),a=state?.attributes||{},available=this._available(id),on=available&&state.state!=='off';
    const modes=a.hvac_modes||[],target=this._pendingTargets.get(id)?.temperature??this._number(a.temperature),room=this._number(a.current_temperature);
    const names={cool:'Охолодження',heat:'Обігрів',dry:'Осушення',fan_only:'Вентиляція',auto:'Авто',heat_cool:'Авто'};
    this._setText('[data-live="air-status"]',!state?'Не підключений до HA':!available?'Недоступний':on?(names[state.state]||'Увімкнений'):'Вимкнений',panel);
    this._setText('[data-live="air-room"]',room!==null&&available?` · у кімнаті ${this._format(room)} °C`:'',panel);
    this._setText('[data-live="air-target"]',available?this._format(target):'—',panel);
    const pendingHint=panel.querySelector('[data-live="air-pending"]'),pending=!!this._pendingTargets.get(id);if(pendingHint){pendingHint.dataset.pending=String(pending);pendingHint.setAttribute('aria-hidden',String(!pending));}
    const power=panel.querySelector('[data-action="air-power"]');if(power){power.disabled=!available||this._busy(id);power.setAttribute('aria-pressed',String(on));power.setAttribute('aria-label',`${on?'Вимкнути':'Увімкнути'} кондиціонер`);power.classList.toggle('active-cool',on);}
    const min=this._number(a.min_temp)??16,max=this._number(a.max_temp)??30;
    const minus=panel.querySelector('[data-action="air-minus"]'),plus=panel.querySelector('[data-action="air-plus"]');
    if(minus)minus.disabled=!available||target===null||target<=min||this._busy(id);
    if(plus)plus.disabled=!available||target===null||target>=max||this._busy(id);
    for(const button of panel.querySelectorAll('[data-action="air-mode"]')){const mode=button.dataset.mode;button.disabled=!available||!modes.includes(mode)||this._busy(id);button.setAttribute('aria-pressed',String(state?.state===mode));}
    const fan=panel.querySelector('[data-action="air-fan"]');if(fan){
      const fanModes=a.fan_modes||[],currentModes=Array.from(fan.options).map(option=>option.value).filter(Boolean);
      if(fanModes.join('|')!==currentModes.join('|')){
        fan.replaceChildren();
        if(fanModes.length){const names={auto:'Авто',low:'Тихо',medium:'Середня',high:'Висока',quiet:'Тихо'};for(const mode of fanModes){const option=fan.ownerDocument.createElement('option');option.value=mode;option.textContent=names[mode]||mode;fan.append(option);}}
        else{const option=fan.ownerDocument.createElement('option');option.textContent='Недоступно';fan.append(option);}
      }
      fan.disabled=!available||!fanModes.length||this._busy(id);if(fanModes.includes(a.fan_mode))fan.value=a.fan_mode;
    }
  }

  _updateMetrics() {
    const roomId=this._config.room_temperature_entity,humidityId=this._config.humidity_entity;
    const air=this._state(this._airId()),fallback=this._available(this._airId())?this._number(air?.attributes.current_temperature):null;
    const temperature=this._available(roomId)?this._value(roomId):fallback,humidity=this._available(humidityId)?this._value(humidityId):null;
    this._setText('[data-live="room-temperature"]',this._format(temperature));this._setHidden('[data-live="room-temperature-empty"]',temperature!==null);
    this._setText('[data-live="humidity"]',this._format(humidity));this._setHidden('[data-live="humidity-empty"]',humidity!==null);
  }

  _updateRiver() {
    const c=this._config,online=this._state(c.river_status)?.state==='online';
    this._setText('[data-live="river-status"]',online?'Онлайн':'Станція офлайн');
    const dot=this.shadowRoot.querySelector('[data-live="river-dot"]');if(dot){dot.classList.toggle('online',online);dot.setAttribute('aria-label',online?'Онлайн':'Офлайн');}
    this._setHidden('[data-live="river-values"]',!online);this._setHidden('[data-live="river-offline-note"]',online);
    this._setText('[data-live="river-battery"]',this._format(this._value(c.river_battery)));
    this._setText('[data-live="river-input"]',this._format(this._value(c.river_input),0));this._setText('[data-live="river-output"]',this._format(this._value(c.river_output),0));
  }

  _updateEnergy() {
    const c=this._config;
    this._setText('[data-live="power"]',this._format(this._value(c.power_entity),0));
    this._setText('[data-live="voltage"]',this._format(this._value(c.voltage_entity),1));this._setText('[data-live="current"]',this._format(this._value(c.current_entity),2));
    this._setText('[data-live="energy-total"]',this._format(this._value(c.energy_total),2));
    this._setText('[data-live="energy-daily"]',this._format(this._value(c.energy_daily),2));this._setText('[data-live="energy-monthly"]',this._format(this._value(c.energy_monthly),2));
  }

  _updateBattery() {
    const online=this._state(this._config.river_status)?.state==='online';
    const reading=(suffix,unit,digits=1,positive=false)=>{const n=this._value(`sensor.river_${suffix}`);return online&&n!==null&&(!positive||n>0)?this._format(n,digits)+(unit?' '+unit:''):'—';};
    const values={
      'battery-main-level':reading('main_battery_level','%'),'battery-main-full':reading('main_full_capacity','мА·год',0,true),'battery-main-remain':reading('main_remain_capacity','мА·год',0),'battery-main-volts':reading('battery_volts','В',3,true),'battery-main-current':reading('battery_current','мА',0),'battery-main-cells':reading('min_cell_volts','В',3,true)+' / '+reading('max_cell_volts','В',3,true),'battery-main-temps':reading('min_cell_temperature','°C')+' / '+reading('max_cell_temperature','°C'),'battery-main-cycles':reading('cycles','',0),
      'battery-slave-level':reading('slave_battery_level','%'),'battery-slave-full':reading('slave_full_capacity','мА·год',0,true),'battery-slave-remain':reading('slave_remain_capacity','мА·год',0),'battery-slave-volts':reading('slave_battery_volts','В',3,true),'battery-slave-current':reading('slave_battery_current','мА',0),'battery-slave-cells':reading('slave_min_cell_volts','В',3,true)+' / '+reading('slave_max_cell_volts','В',3,true),'battery-slave-temps':reading('slave_min_cell_temperature','°C')+' / '+reading('slave_max_cell_temperature','°C'),'battery-slave-cycles':reading('slave_cycles','',0)
    };
    for(const [key,value] of Object.entries(values))this._setText(`[data-live="${key}"]`,value);
  }

  _updateDevices() {
    const id=this._airId(),room=this._config.room_temperature_entity,humidity=this._config.humidity_entity,mega=this._config.mega_entity;
    this._setText('[data-live="device-air"]',this._state(id)?'Додано':'Ще не додано в HA');
    this._setText('[data-live="device-room"]',this._state(room)?'Додано':'Ще не підключено');
    this._setText('[data-live="device-mega"]',this._state(mega)?'Додано':'Окремої сутності немає');
  }

  _render() {
    if (!this._config || !this._hass) return;
    const focused=this.shadowRoot.activeElement;
    const focusAction=focused?.dataset.action, focusEntity=focused?.dataset.entity;
    this.toggleAttribute('dark',!!this._hass.themes?.darkMode);
    const names={home:'Дім',energy:'Енергія',battery:'EcoFlow',devices:'Пристрої'};
    const content=this._view==='energy'?this._energy():this._view==='battery'?this._batteryDetails():this._view==='devices'?this._devices():this._home();
    const nav=[['home','home-outline','Дім'],['energy','lightning-bolt-outline','Енергія'],['devices','tune','Пристрої']].map(([view,icon,label])=>`<button class="nav-button" data-action="view-${view}" aria-pressed="${this._view===view}">${this._icon(icon)}${label}</button>`).join('');
    this.shadowRoot.innerHTML=`<style>${HOME_DASHBOARD_STYLE}.pending-hint{min-height:17px;visibility:hidden}.pending-hint[data-pending="true"]{visibility:visible}.live-error{position:fixed;z-index:20;left:50%;bottom:18px;transform:translateX(-50%);width:min(440px,calc(100vw - 32px));box-shadow:0 8px 24px rgba(0,0,0,.18)}</style><ha-card><div class="screen" data-layout="${this._layout}" data-columns="${this._columns}"><header><div><h1>${names[this._view]}</h1></div>${this._view==='home'?this._icon('home-heart','header-icon'):'<button class="icon-button" data-action="view-home" aria-label="Повернутися на головну">'+this._icon('arrow-left')+'</button>'}</header><main><div class="error live-error" role="alert" data-live="error" ${this._error?'':'hidden'}>${this._escape(this._error)}</div>${content}</main><nav aria-label="Розділи панелі">${nav}</nav></div></ha-card>`;
    this._rendered=true;
    this._updateDynamic();
    if(focusAction){const button=Array.from(this.shadowRoot.querySelectorAll('[data-action]')).find(el=>el.dataset.action===focusAction&&el.dataset.entity===focusEntity);if(button&&!button.disabled)button.focus({preventScroll:true});}
    const generation=++this._generation;
    this._mountGraphs(generation);
  }

  async _mountGraphs(generation) {
    const slots=Array.from(this.shadowRoot.querySelectorAll('[data-graph]'));
    if(!slots.length)return;
    try {
      if(!window.loadCardHelpers)throw new Error('History cards unavailable');
      const helpers=await window.loadCardHelpers();
      if(generation!==this._generation)return;
      const definitions={
        boiler:{title:'Потужність бойлера · 24 години',entities:[this._config.power_entity]},
        'river-current':{title:'Струм батарей · 24 години',entities:[{entity:null,name:'Основна'},{entity:null,name:'Додаткова'}]},
        'river-cells':{title:'Напруги комірок · 24 години',entities:[{entity:null,name:'Осн. мін.'},{entity:null,name:'Осн. макс.'},{entity:null,name:'Дод. мін.'},{entity:null,name:'Дод. макс.'}]},
      };
      if(this._layout==='desktop'&&this._view==='home')definitions.boiler={entities:[this._config.power_entity],show_names:false,grid_options:{rows:4}};
      for(const slot of slots){
        const key=JSON.stringify(definitions[slot.dataset.graph]);
        let card=this._graphCards.get(key);
        if(!card){card=helpers.createCardElement({type:'history-graph',hours_to_show:24,...definitions[slot.dataset.graph]});this._graphCards.set(key,card);}
        this._graphSources.set(key,definitions[slot.dataset.graph].entities.map(entity=>typeof entity==='string'?entity:entity.entity));
        card.style.height=this._layout==='desktop'&&this._view==='home'?'200px':'';
        card.hass=this._hass;
        slot.replaceChildren(card);
      }
    } catch {
      if(generation!==this._generation)return;
      for(const slot of slots)slot.innerHTML='<span class="secondary">Історію можна відкрити через подробиці відповідної сутності.</span>';
    }
  }

  async _service(domain,service,data,pendingTarget=null) {
    const entity=pendingTarget?.entity||data.entity_id;
    if(this._busy(entity))return;
    const generation=this._generation;
    this._busyEntities.add(entity);this._error='';this._updateDynamic([],false,entity);
    try { await this._hass.callService(domain,service,data); }
    catch(error){
      if(generation!==this._generation)return;
      if(pendingTarget&&this._pendingTargets.get(pendingTarget.entity)===pendingTarget){clearTimeout(pendingTarget.timer);this._pendingTargets.delete(pendingTarget.entity);}
      this._error=error?.message||'Команду не виконано. Перевірте з’єднання з пристроєм.';
    }
    finally{if(generation===this._generation){this._busyEntities.delete(entity);this._updateDynamic([],false,entity);}}
  }

  _temperature(entity,delta) {
    if(this._busy(entity)||!this._available(entity))return;
    const a=this._state(entity).attributes, value=this._pendingTargets.get(entity)?.temperature??this._number(a.temperature);
    if(value===null)return;
    const step=this._number(a.target_temp_step)??1,min=this._number(a.min_temp),max=this._number(a.max_temp);
    const temperature=Number(Math.min(max??Infinity,Math.max(min??-Infinity,value+delta*step)).toFixed(2));
    if(temperature!==value){
      const previous=this._pendingTargets.get(entity);if(previous)clearTimeout(previous.timer);
      const pending={temperature,timer:null};
      pending.timer=setTimeout(()=>{
        if(this._pendingTargets.get(entity)!==pending)return;
        this._pendingTargets.delete(entity);
        const name=this._state(entity)?.attributes?.friendly_name||entity;
        this._error=`${name} не підтвердив нову температуру за 15 секунд. Показано останнє значення від пристрою.`;
        this._updateDynamic([],false,entity);
      },15000);
      this._pendingTargets.set(entity,pending);
      this._updateDynamic([],false,entity);
      this._service(entity.split('.')[0],'set_temperature',{entity_id:entity,temperature},Object.assign(pending,{entity}));
    }
  }

  _click(event) {
    const button=event.target.closest('button[data-action]');
    if(!button||button.disabled)return;
    const action=button.dataset.action,c=this._config;
    if(action.startsWith('view-')){this._view=action.slice(5);this._error='';this._render();this.shadowRoot.querySelector('h1')?.scrollIntoView({block:'nearest'});return;}
    if(action==='more'){
      this.dispatchEvent(new CustomEvent('hass-more-info',{detail:{entityId:button.dataset.entity},bubbles:true,composed:true}));return;
    }
    if(action==='boiler-plus'||action==='boiler-minus'){this._temperature(c.boiler_entity,action.endsWith('plus')?1:-1);return;}
    if(action==='air-plus'||action==='air-minus'){this._temperature(this._airId(),action.endsWith('plus')?1:-1);return;}
    if(action==='feature'&&this._available(button.dataset.entity)){this._service('switch','toggle',{entity_id:button.dataset.entity});return;}
    if(action==='boiler-power'&&this._available(c.boiler_entity)){
      if(c.boiler_entity?.startsWith('water_heater.'))this._service('water_heater',this._state(c.boiler_entity).state==='off'?'turn_on':'turn_off',{entity_id:c.boiler_entity});
      else this._service('climate','set_hvac_mode',{entity_id:c.boiler_entity,hvac_mode:this._state(c.boiler_entity).state==='off'?'heat':'off'});return;
    }
    const air=this._airId();
    if(action==='air-mode'&&this._available(air)&&(this._state(air).attributes.hvac_modes||[]).includes(button.dataset.mode)){
      this._service('climate','set_hvac_mode',{entity_id:air,hvac_mode:button.dataset.mode});return;
    }
    if(action==='air-power'&&this._available(air)){
      const state=this._state(air),modes=state.attributes.hvac_modes||[];
      const mode=state.state!=='off'?'off':modes.includes('cool')?'cool':modes.find(m=>m!=='off');
      if(mode)this._service('climate','set_hvac_mode',{entity_id:air,hvac_mode:mode});
    }
  }

  _change(event) {
    if(event.target.dataset.action!=='air-fan')return;
    const id=this._airId(),value=event.target.value;
    if(this._available(id)&&(this._state(id).attributes.fan_modes||[]).includes(value))this._service('climate','set_fan_mode',{entity_id:id,fan_mode:value});
  }
}

