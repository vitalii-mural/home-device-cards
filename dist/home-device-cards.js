// Home Device Cards v1.0.2 — bundled base and standalone cards.
/* Lucide icon license:
ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

---

The following Lucide icons are derived from the Feather project:

airplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out

The MIT License (MIT) (for the icons listed above)

Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
const HOME_DASHBOARD_DEFAULTS = {
  boiler_entity: null,
  boiler_hours: null,
  boiler_minutes: null,
  memo_entity: null,
  mega_entity: null,
  sterilization_entity: null,
  air_entity: null,
  room_temperature_entity: null,
  humidity_entity: null,
  energy_daily: null,
  energy_monthly: null,
  energy_total: null,
  power_entity: null,
  voltage_entity: null,
  current_entity: null,
  river_status: null,
  river_battery: null,
  river_input: null,
  river_output: null,
};

const HOME_DASHBOARD_STYLE = `
:host{display:block;color-scheme:light;--k-bg:#f4f3ef;--k-card:#fff;--k-text:#26322e;--k-muted:#64716b;--k-line:#e5e8e1;--k-soft:#edf0eb;--k-warm:#a46135;--k-warm-bg:#fbefe3;--k-cool:#386d7b;--k-cool-bg:#e9f2f3;--k-accent:#55765f;--k-accent-bg:#e8f0e7;--k-danger:#a53333}
:host([dark]){color-scheme:dark;--k-bg:#171a1c;--k-card:#24282b;--k-text:#eef1ed;--k-muted:#abb6af;--k-line:#363d3b;--k-soft:#303735;--k-warm:#efb185;--k-warm-bg:#3b3028;--k-cool:#94cbd3;--k-cool-bg:#26373c;--k-accent:#a5cfaf;--k-accent-bg:#2d3e32;--k-danger:#ffb4ab}
*{box-sizing:border-box}ha-card{display:block;background:transparent;box-shadow:none;border:0;border-radius:0;color:var(--k-text);font-family:var(--primary-font-family,system-ui,sans-serif)}
.screen{max-width:440px;width:100%;margin:0 auto;background:var(--k-bg);border-radius:28px;padding:24px 17px 12px;min-height:360px}
header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 6px 19px}.eyebrow{font-size:11px;letter-spacing:2px;color:var(--k-muted)}h1{font-size:31px;line-height:1.2;letter-spacing:-1px;font-weight:500;margin:4px 0 0}h2{font-size:15px;line-height:1.4;font-weight:500;letter-spacing:-.2px;margin:0}h3{font-size:14px;font-weight:500;margin:0 0 12px}.header-icon{color:var(--k-accent);--mdc-icon-size:23px}
main{display:grid;gap:13px}.panel{padding:17px;border-radius:23px;background:var(--k-card)}.panel-top{display:flex;align-items:center;justify-content:space-between;gap:9px}.heading{display:flex;align-items:center;gap:10px;min-width:0}.device-icon{height:39px;width:39px;flex-shrink:0;border-radius:14px;display:grid;place-items:center;--mdc-icon-size:21px}.warm{background:var(--k-warm-bg);color:var(--k-warm)}.cool{background:var(--k-cool-bg);color:var(--k-cool)}.neutral{background:var(--k-soft);color:var(--k-muted)}
.secondary{display:block;color:var(--k-muted);font-size:11px;line-height:1.5;margin-top:2px}.heating{color:var(--k-warm)}button,select{font:inherit;font-size:12px;color:inherit}button{border:0;cursor:pointer}button:focus-visible,select:focus-visible,a:focus-visible{outline:2px solid var(--k-accent);outline-offset:3px}button:disabled,select:disabled{cursor:default;opacity:.42}button[disabled] ha-icon{opacity:.7}.icon-button,.round{display:grid;place-items:center;width:44px;height:44px;min-width:44px;border-radius:50%;background:var(--k-soft);--mdc-icon-size:19px}.icon-button.active-warm{background:var(--k-warm-bg);color:var(--k-warm)}.icon-button.active-cool{background:var(--k-cool-bg);color:var(--k-cool)}
.water-large{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:25px 1px 20px}.current{font-size:54px;line-height:1;letter-spacing:-2px;font-weight:400;white-space:nowrap;font-variant-numeric:tabular-nums}.degree{font-size:18px;letter-spacing:0;vertical-align:top;display:inline-block;margin:4px 0 0 3px}.setpoint{text-align:center}.adjust{display:flex;align-items:center;gap:9px;margin-top:8px}.adjust .round{width:40px;height:40px;min-width:40px}.target{font-size:20px;font-variant-numeric:tabular-nums;white-space:nowrap}.progress{height:6px;background:var(--k-soft);border-radius:5px;overflow:hidden}.progress>span{display:block;height:100%;background:var(--k-warm);border-radius:5px}.waiting.progress>span{background:var(--k-muted)}.time{display:flex;align-items:center;gap:6px;color:var(--k-muted);font-size:11px;margin-top:12px;--mdc-icon-size:14px}
.features,.modes{display:grid;grid-template-columns:1fr 1fr 1.15fr;gap:4px;padding:4px;background:var(--k-soft);border-radius:14px;margin-top:14px}.feature,.mode{min-height:42px;border-radius:10px;font-size:11px;background:transparent;padding:6px 3px;white-space:nowrap}.feature[aria-pressed=true]{background:var(--k-card);color:var(--k-warm)}.mode{display:flex;align-items:center;justify-content:center;gap:4px;--mdc-icon-size:15px}.mode[aria-pressed=true]{background:var(--k-card);color:var(--k-cool)}
.air-temperature{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:23px 11px;text-align:center}.air-value{font-size:43px;line-height:1;letter-spacing:-1.8px;font-variant-numeric:tabular-nums}.air-degree{font-size:17px;vertical-align:top}.fan{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:12px;font-size:11px;color:var(--k-muted)}.fan-label{display:flex;align-items:center;gap:7px;--mdc-icon-size:16px}.fan select{max-width:145px;min-height:36px;background:transparent;border:0;border-radius:8px;padding:7px 6px;font-size:11px}.fan option{background:var(--k-card);color:var(--k-text)}
.small-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.metric{position:relative;border-radius:21px;background:var(--k-card);padding:17px;min-width:0}.metric>ha-icon{position:absolute;right:14px;top:17px;color:var(--k-muted);--mdc-icon-size:17px}.metric-value{display:block;margin-top:10px;font-size:27px;font-variant-numeric:tabular-nums;letter-spacing:-.8px}.metric-value small{font-size:13px;letter-spacing:0;color:var(--k-muted)}.metric .secondary{padding-right:15px}.empty-caption{display:block;color:var(--k-muted);font-size:11px;margin-top:4px}
.status-dot{width:7px;height:7px;border-radius:50%;background:var(--k-muted);margin-right:5px}.status-dot.online{background:var(--k-accent)}.river-values{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-top:18px}.river-value{font-size:29px;line-height:1.2;font-variant-numeric:tabular-nums}.river-value small{font-size:14px}.power-values{font-size:16px;margin-top:5px;font-variant-numeric:tabular-nums}.text-button{display:flex;align-items:center;justify-content:space-between;width:100%;padding:15px 0 0;color:var(--k-muted);background:transparent;font-size:11px;min-height:38px;--mdc-icon-size:16px}
.links{display:grid;gap:8px}.link{display:flex;align-items:center;gap:12px;width:100%;padding:14px 17px;border-radius:18px;background:var(--k-card);text-align:left;color:var(--k-text);text-decoration:none;--mdc-icon-size:20px;min-height:67px}.link>ha-icon{flex-shrink:0;color:var(--k-muted)}.link .chevron{margin-left:auto;--mdc-icon-size:17px}.link strong{font-size:12px;font-weight:500}.link small{display:block;font-size:11px;font-weight:400;color:var(--k-muted);margin-top:3px}
nav{display:flex;justify-content:space-around;gap:5px;border-top:1px solid var(--k-line);margin-top:17px;padding-top:12px}.nav-button{display:flex;flex-direction:column;align-items:center;gap:5px;background:transparent;color:var(--k-muted);border-radius:14px;padding:8px 17px;font-size:11px;min-width:75px;--mdc-icon-size:20px}.nav-button[aria-pressed=true]{background:var(--k-accent-bg);color:var(--k-accent)}
.data-row{display:flex;justify-content:space-between;align-items:center;gap:15px;border-bottom:1px solid var(--k-line);padding:12px 0;font-size:12px;line-height:1.5}.data-row:last-child{border:0}.data-row>span:last-child{text-align:right;font-variant-numeric:tabular-nums}.subheading{font-size:11px;color:var(--k-muted);margin:6px 0 3px}.notice{font-size:12px;line-height:1.6;color:var(--k-muted);margin:0}.error{padding:12px 15px;border-radius:15px;background:var(--k-card);color:var(--k-danger);font-size:12px;line-height:1.5}.graph-slot{min-height:120px}.graph-slot>*{display:block}.button-row{display:flex;gap:8px;flex-wrap:wrap}.flat-button{background:var(--k-soft);border-radius:12px;min-height:44px;padding:10px 14px;font-size:12px}.wide-button{width:100%;text-align:left}.powered-note{font-size:11px;color:var(--k-muted);line-height:1.5}.screen [hidden]{display:none!important}
@media(max-width:380px){.screen{padding:20px 12px 12px;border-radius:23px}.panel{padding:14px}.heading{gap:8px}.device-icon{width:34px;height:34px}.current{font-size:47px}.adjust{gap:6px}.adjust .round{min-width:36px;width:36px;height:42px}.target{font-size:19px}h2{font-size:14px}.air-temperature{padding:22px 3px}.metric{padding:14px}.metric-value{font-size:25px}.feature,.mode{font-size:11px}.water-large{gap:8px}.data-row{gap:8px}}
@media(pointer:coarse){.feature,.mode,.fan select,.round,.adjust .round{min-height:44px}.adjust .round{min-width:40px;width:40px}}
.screen[data-layout=desktop]{max-width:none;min-height:calc(100vh - 56px);padding:28px;display:grid;grid-template-columns:1fr auto;grid-template-rows:auto 1fr;gap:22px;border-radius:0}
.screen[data-layout=desktop] header{padding:0}.screen[data-layout=desktop] .header-icon{display:none}.desktop-caption{font-size:12px;color:var(--k-muted);margin:8px 0 0}
.screen[data-layout=desktop] nav{grid-column:2;grid-row:1;margin:0;padding:0;border:0;align-self:center}.screen[data-layout=desktop] main{grid-column:1/-1;min-width:0;align-content:start}
.desktop-board{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-areas:'water air overview' 'energy energy energy';gap:16px;align-items:start}
.desktop-water{grid-area:water}.desktop-air{grid-area:air}.desktop-overview{grid-area:overview;display:grid;gap:14px;min-width:0}.desktop-energy{grid-area:energy;min-width:0}.desktop-media{grid-area:media;min-width:0}
.desktop-water>.panel,.desktop-air>.panel{min-height:300px}.desktop-board .panel{padding:20px}.desktop-board .current{font-size:52px}.desktop-board .water-large{margin-top:30px;margin-bottom:25px}.desktop-board .heading{gap:8px}.desktop-board h2{font-size:14px}.desktop-board .target{font-size:19px}.desktop-board .adjust{gap:6px}.desktop-board .adjust .round{width:34px;min-width:34px;height:38px}.desktop-board .metric{padding:15px}.desktop-board .metric .secondary{padding-right:14px}.desktop-board .metric-value{font-size:26px}
.energy-heading{display:flex;justify-content:space-between;align-items:center;gap:12px}.power-now{font-size:20px;white-space:nowrap;font-variant-numeric:tabular-nums}.power-now small{font-size:11px;color:var(--k-muted)}.energy-stats{display:flex;gap:34px;margin:16px 0 10px}.energy-stats strong{display:block;font-size:24px;font-weight:400;margin-top:4px;font-variant-numeric:tabular-nums}.energy-stats strong small{font-size:11px;color:var(--k-muted)}.desktop-energy .graph-slot{min-height:180px}.desktop-energy .text-button{border-top:1px solid var(--k-line)}.desktop-media>.device-icon{margin-bottom:16px}.desktop-media .link{background:var(--k-soft);margin-top:22px;padding:12px}.desktop-media .notice{margin-top:14px}
.screen[data-columns=two] .desktop-board{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-areas:'water air' 'overview overview' 'energy energy'}.screen[data-columns=two] .desktop-overview{grid-template-columns:1fr 1fr;align-items:stretch}.screen[data-columns=two] .desktop-overview>.small-grid{align-content:stretch}.screen[data-columns=two] .energy-heading{align-items:start;flex-direction:column}.screen[data-columns=two] .energy-stats{gap:16px;flex-wrap:wrap}.screen[data-columns=two]{padding:20px}
`;

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

if(!customElements.get('home-dashboard'))customElements.define('home-dashboard',HomeDashboard);
window.customCards=window.customCards||[];
if(!window.customCards.some(card=>card.type==='home-dashboard'))window.customCards.push({type:'home-dashboard',name:'Домашня панель',description:'Бойлер, клімат, EcoFlow та енергія.'});

;
customElements.whenDefined('home-dashboard').then(() => {
const HOME_DEVICE_CARD_STYLE = ":host{display:block;color-scheme:light;--k-bg:#f4f3ef;--k-card:#fff;--k-text:#26322e;--k-muted:#64716b;--k-line:#e5e8e1;--k-soft:#edf0eb;--k-warm:#a46135;--k-warm-bg:#fbefe3;--k-cool:#386d7b;--k-cool-bg:#e9f2f3;--k-accent:#55765f;--k-accent-bg:#e8f0e7;--k-danger:#a53333}\n:host([dark]){color-scheme:dark;--k-bg:#171a1c;--k-card:#24282b;--k-text:#eef1ed;--k-muted:#abb6af;--k-line:#363d3b;--k-soft:#303735;--k-warm:#efb185;--k-warm-bg:#3b3028;--k-cool:#94cbd3;--k-cool-bg:#26373c;--k-accent:#a5cfaf;--k-accent-bg:#2d3e32;--k-danger:#ffb4ab}\n*{box-sizing:border-box}ha-card{display:block;background:transparent;box-shadow:none;border:0;border-radius:0;color:var(--k-text);font-family:var(--primary-font-family,system-ui,sans-serif)}\n.screen{max-width:440px;width:100%;margin:0 auto;background:var(--k-bg);border-radius:28px;padding:24px 17px 12px;min-height:360px}\nheader{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 6px 19px}.eyebrow{font-size:11px;letter-spacing:2px;color:var(--k-muted)}h1{font-size:31px;line-height:1.2;letter-spacing:-1px;font-weight:500;margin:4px 0 0}h2{font-size:15px;line-height:1.4;font-weight:500;letter-spacing:-.2px;margin:0}h3{font-size:14px;font-weight:500;margin:0 0 12px}.header-icon{color:var(--k-accent);--mdc-icon-size:23px}\nmain{display:grid;gap:13px}.panel{padding:17px;border-radius:23px;background:var(--k-card)}.panel-top{display:flex;align-items:center;justify-content:space-between;gap:9px}.heading{display:flex;align-items:center;gap:10px;min-width:0}.device-icon{height:39px;width:39px;flex-shrink:0;border-radius:14px;display:grid;place-items:center;--mdc-icon-size:21px}.warm{background:var(--k-warm-bg);color:var(--k-warm)}.cool{background:var(--k-cool-bg);color:var(--k-cool)}.neutral{background:var(--k-soft);color:var(--k-muted)}\n.secondary{display:block;color:var(--k-muted);font-size:11px;line-height:1.5;margin-top:2px}.heating{color:var(--k-warm)}button,select{font:inherit;font-size:12px;color:inherit}button{border:0;cursor:pointer}button:focus-visible,select:focus-visible,a:focus-visible{outline:2px solid var(--k-accent);outline-offset:3px}button:disabled,select:disabled{cursor:default;opacity:.42}button[disabled] ha-icon{opacity:.7}.icon-button,.round{display:grid;place-items:center;width:44px;height:44px;min-width:44px;border-radius:50%;background:var(--k-soft);--mdc-icon-size:19px}.icon-button.active-warm{background:var(--k-warm-bg);color:var(--k-warm)}.icon-button.active-cool{background:var(--k-cool-bg);color:var(--k-cool)}\n.water-large{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:25px 1px 20px}.current{font-size:54px;line-height:1;letter-spacing:-2px;font-weight:400;white-space:nowrap;font-variant-numeric:tabular-nums}.degree{font-size:18px;letter-spacing:0;vertical-align:top;display:inline-block;margin:4px 0 0 3px}.setpoint{text-align:center}.adjust{display:flex;align-items:center;gap:9px;margin-top:8px}.adjust .round{width:40px;height:40px;min-width:40px}.target{font-size:20px;font-variant-numeric:tabular-nums;white-space:nowrap}.progress{height:6px;background:var(--k-soft);border-radius:5px;overflow:hidden}.progress>span{display:block;height:100%;background:var(--k-warm);border-radius:5px}.waiting.progress>span{background:var(--k-muted)}.time{display:flex;align-items:center;gap:6px;color:var(--k-muted);font-size:11px;margin-top:12px;--mdc-icon-size:14px}\n.features,.modes{display:grid;grid-template-columns:1fr 1fr 1.15fr;gap:4px;padding:4px;background:var(--k-soft);border-radius:14px;margin-top:14px}.feature,.mode{min-height:42px;border-radius:10px;font-size:11px;background:transparent;padding:6px 3px;white-space:nowrap}.feature[aria-pressed=true]{background:var(--k-card);color:var(--k-warm)}.mode{display:flex;align-items:center;justify-content:center;gap:4px;--mdc-icon-size:15px}.mode[aria-pressed=true]{background:var(--k-card);color:var(--k-cool)}\n.air-temperature{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:23px 11px;text-align:center}.air-value{font-size:43px;line-height:1;letter-spacing:-1.8px;font-variant-numeric:tabular-nums}.air-degree{font-size:17px;vertical-align:top}.fan{display:flex;align-items:center;justify-content:space-between;gap:8px;padding-top:12px;font-size:11px;color:var(--k-muted)}.fan-label{display:flex;align-items:center;gap:7px;--mdc-icon-size:16px}.fan select{max-width:145px;min-height:36px;background:transparent;border:0;border-radius:8px;padding:7px 6px;font-size:11px}.fan option{background:var(--k-card);color:var(--k-text)}\n.small-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.metric{position:relative;border-radius:21px;background:var(--k-card);padding:17px;min-width:0}.metric>ha-icon{position:absolute;right:14px;top:17px;color:var(--k-muted);--mdc-icon-size:17px}.metric-value{display:block;margin-top:10px;font-size:27px;font-variant-numeric:tabular-nums;letter-spacing:-.8px}.metric-value small{font-size:13px;letter-spacing:0;color:var(--k-muted)}.metric .secondary{padding-right:15px}.empty-caption{display:block;color:var(--k-muted);font-size:11px;margin-top:4px}\n.status-dot{width:7px;height:7px;border-radius:50%;background:var(--k-muted);margin-right:5px}.status-dot.online{background:var(--k-accent)}.river-values{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-top:18px}.river-value{font-size:29px;line-height:1.2;font-variant-numeric:tabular-nums}.river-value small{font-size:14px}.power-values{font-size:16px;margin-top:5px;font-variant-numeric:tabular-nums}.text-button{display:flex;align-items:center;justify-content:space-between;width:100%;padding:15px 0 0;color:var(--k-muted);background:transparent;font-size:11px;min-height:38px;--mdc-icon-size:16px}\n.links{display:grid;gap:8px}.link{display:flex;align-items:center;gap:12px;width:100%;padding:14px 17px;border-radius:18px;background:var(--k-card);text-align:left;color:var(--k-text);text-decoration:none;--mdc-icon-size:20px;min-height:67px}.link>ha-icon{flex-shrink:0;color:var(--k-muted)}.link .chevron{margin-left:auto;--mdc-icon-size:17px}.link strong{font-size:12px;font-weight:500}.link small{display:block;font-size:11px;font-weight:400;color:var(--k-muted);margin-top:3px}\nnav{display:flex;justify-content:space-around;gap:5px;border-top:1px solid var(--k-line);margin-top:17px;padding-top:12px}.nav-button{display:flex;flex-direction:column;align-items:center;gap:5px;background:transparent;color:var(--k-muted);border-radius:14px;padding:8px 17px;font-size:11px;min-width:75px;--mdc-icon-size:20px}.nav-button[aria-pressed=true]{background:var(--k-accent-bg);color:var(--k-accent)}\n.data-row{display:flex;justify-content:space-between;align-items:center;gap:15px;border-bottom:1px solid var(--k-line);padding:12px 0;font-size:12px;line-height:1.5}.data-row:last-child{border:0}.data-row>span:last-child{text-align:right;font-variant-numeric:tabular-nums}.subheading{font-size:11px;color:var(--k-muted);margin:6px 0 3px}.notice{font-size:12px;line-height:1.6;color:var(--k-muted);margin:0}.error{padding:12px 15px;border-radius:15px;background:var(--k-card);color:var(--k-danger);font-size:12px;line-height:1.5}.graph-slot{min-height:120px}.graph-slot>*{display:block}.button-row{display:flex;gap:8px;flex-wrap:wrap}.flat-button{background:var(--k-soft);border-radius:12px;min-height:44px;padding:10px 14px;font-size:12px}.wide-button{width:100%;text-align:left}.powered-note{font-size:11px;color:var(--k-muted);line-height:1.5}.screen [hidden]{display:none!important}\n@media(max-width:380px){.screen{padding:20px 12px 12px;border-radius:23px}.panel{padding:14px}.heading{gap:8px}.device-icon{width:34px;height:34px}.current{font-size:47px}.adjust{gap:6px}.adjust .round{min-width:36px;width:36px;height:42px}.target{font-size:19px}h2{font-size:14px}.air-temperature{padding:22px 3px}.metric{padding:14px}.metric-value{font-size:25px}.feature,.mode{font-size:11px}.water-large{gap:8px}.data-row{gap:8px}}\n@media(pointer:coarse){.feature,.mode,.fan select,.round,.adjust .round{min-height:44px}.adjust .round{min-width:40px;width:40px}}\n.screen[data-layout=desktop]{max-width:none;min-height:calc(100vh - 56px);padding:28px;display:grid;grid-template-columns:1fr auto;grid-template-rows:auto 1fr;gap:22px;border-radius:0}\n.screen[data-layout=desktop] header{padding:0}.screen[data-layout=desktop] .header-icon{display:none}.desktop-caption{font-size:12px;color:var(--k-muted);margin:8px 0 0}\n.screen[data-layout=desktop] nav{grid-column:2;grid-row:1;margin:0;padding:0;border:0;align-self:center}.screen[data-layout=desktop] main{grid-column:1/-1;min-width:0;align-content:start}\n.desktop-board{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-areas:'water air overview' 'energy energy energy';gap:16px;align-items:start}\n.desktop-water{grid-area:water}.desktop-air{grid-area:air}.desktop-overview{grid-area:overview;display:grid;gap:14px;min-width:0}.desktop-energy{grid-area:energy;min-width:0}.desktop-media{grid-area:media;min-width:0}\n.desktop-water>.panel,.desktop-air>.panel{min-height:300px}.desktop-board .panel{padding:20px}.desktop-board .current{font-size:52px}.desktop-board .water-large{margin-top:30px;margin-bottom:25px}.desktop-board .heading{gap:8px}.desktop-board h2{font-size:14px}.desktop-board .target{font-size:19px}.desktop-board .adjust{gap:6px}.desktop-board .adjust .round{width:34px;min-width:34px;height:38px}.desktop-board .metric{padding:15px}.desktop-board .metric .secondary{padding-right:14px}.desktop-board .metric-value{font-size:26px}\n.energy-heading{display:flex;justify-content:space-between;align-items:center;gap:12px}.power-now{font-size:20px;white-space:nowrap;font-variant-numeric:tabular-nums}.power-now small{font-size:11px;color:var(--k-muted)}.energy-stats{display:flex;gap:34px;margin:16px 0 10px}.energy-stats strong{display:block;font-size:24px;font-weight:400;margin-top:4px;font-variant-numeric:tabular-nums}.energy-stats strong small{font-size:11px;color:var(--k-muted)}.desktop-energy .graph-slot{min-height:180px}.desktop-energy .text-button{border-top:1px solid var(--k-line)}.desktop-media>.device-icon{margin-bottom:16px}.desktop-media .link{background:var(--k-soft);margin-top:22px;padding:12px}.desktop-media .notice{margin-top:14px}\n.screen[data-columns=two] .desktop-board{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-areas:'water air' 'overview overview' 'energy energy'}.screen[data-columns=two] .desktop-overview{grid-template-columns:1fr 1fr;align-items:stretch}.screen[data-columns=two] .desktop-overview>.small-grid{align-content:stretch}.screen[data-columns=two] .energy-heading{align-items:start;flex-direction:column}.screen[data-columns=two] .energy-stats{gap:16px;flex-wrap:wrap}.screen[data-columns=two]{padding:20px}";

const HOME_DEVICE_FEEDBACK_STYLE = `
.single-card .socket-card,.single-card .room-sensor-card{width:100%;margin:0;padding:20px;border-radius:24px;background:var(--k-card);color:var(--k-text);font:14px/1.4 system-ui,sans-serif}
.single-card .socket-card *,.single-card .room-sensor-card *{box-sizing:border-box}
.single-card .socket-card svg,.single-card .room-sensor-card svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.single-card .socket-header,.single-card .room-header{display:flex;align-items:center;gap:10px;padding:0}
.single-card .socket-icon,.single-card .room-icon{width:40px;height:40px;display:grid;place-items:center;flex:0 0 40px;border-radius:14px;background:var(--k-soft);color:var(--k-accent)}
.single-card .socket-heading,.single-card .room-heading{flex:1;min-width:0}
.single-card .socket-card h2,.single-card .room-sensor-card h2{font-size:14px;font-weight:500;line-height:1.4;margin:0}
.single-card .socket-card .secondary,.single-card .room-sensor-card .secondary{display:flex;align-items:center;gap:5px;color:var(--k-muted);font-size:12px;line-height:1.4}
.single-card .socket-power-button{width:44px;height:44px;display:grid;place-items:center;flex:0 0 44px;border-radius:50%;background:var(--k-soft);color:var(--k-accent);position:relative}
.single-card .socket-power-button[aria-pressed=false]{background:transparent;color:var(--k-muted);box-shadow:inset 0 0 0 1px var(--k-line)}
.single-card .socket-power-button[data-pending=true] svg{visibility:hidden}
.single-card .socket-spinner{display:none;position:absolute;width:19px;height:19px;border:2px solid var(--k-line);border-top-color:currentColor;border-radius:50%;animation:home-pending-spin .75s linear infinite}
.single-card .socket-power-button[data-pending=true] .socket-spinner{display:block}
.single-card .socket-reading{margin:12px 0 14px}.single-card .socket-reading .metric-value{margin-top:0}
.single-card .socket-reading .metric-value,.single-card .room-reading .metric-value{font-size:36px;line-height:1.2;font-weight:400;letter-spacing:-1.5px;font-variant-numeric:tabular-nums}
.single-card .socket-reading .metric-value small,.single-card .room-reading .metric-value small{font-size:17px;margin-left:5px;letter-spacing:0;color:var(--k-muted)}
.single-card .socket-metrics{display:grid;grid-template-columns:1fr 1fr 1.25fr;background:var(--k-soft);border-radius:14px;padding:10px 0}
.single-card .socket-metrics>div{padding:0 12px;min-width:0}
.single-card .socket-metrics>div+div{border-left:1px solid var(--k-line)}
.single-card .socket-metrics .secondary{white-space:nowrap}
.single-card .socket-metrics strong{display:block;font-size:18px;font-weight:400;margin-top:5px;white-space:nowrap;font-variant-numeric:tabular-nums}
.single-card .socket-metrics strong small{font-size:11px;color:var(--k-muted);margin-left:4px}
.single-card .socket-card .socket-missing{color:var(--k-muted);font-size:17px!important;letter-spacing:0!important;font-weight:400!important}
.single-card .socket-reading .socket-missing{font-size:23px!important;letter-spacing:0!important}
.single-card .socket-metrics strong.socket-missing small{opacity:.6}
.single-card .room-battery{display:flex;align-items:center;gap:5px;color:var(--k-muted);font-size:12px;white-space:nowrap}
.single-card .room-battery svg{width:16px;height:16px}
.single-card .room-readings{display:grid;grid-template-columns:1fr 1fr;margin:16px 0 0}
.single-card .room-reading{min-width:0}
.single-card .room-reading+.room-reading{border-left:1px solid var(--k-line);padding-left:22px}
.single-card .room-reading .secondary{white-space:nowrap}
.single-card .room-reading .metric-value{margin-top:8px}
.single-card .river-card .river-missing{color:var(--k-muted);font-size:17px!important;letter-spacing:0!important;font-weight:400!important}
.single-card .river-card .river-large.river-missing{font-size:23px!important;margin-bottom:10px}
.single-card .river-card .river-percent.river-missing{font-size:17px!important;margin-top:13px;margin-bottom:14px}
.single-card .river-card .river-power strong.river-missing{font-size:15px!important;margin-top:9px}
@media(max-width:380px){.single-card .socket-card,.single-card .room-sensor-card{padding:16px}.single-card .socket-reading .metric-value,.single-card .room-reading .metric-value{font-size:34px}.single-card .socket-metrics>div{padding:0 8px}.single-card .socket-metrics strong{font-size:17px}.single-card .socket-metrics strong small{font-size:11px}.single-card .room-reading+.room-reading{padding-left:16px}}
.single-card .socket-card .socket-missing,.single-card .room-sensor-card .room-missing,.single-card .river-card .river-missing{font-size:16px!important;color:var(--k-muted);font-weight:400!important;letter-spacing:0!important}
.single-card .socket-missing small,.single-card .room-missing small,.single-card .river-missing small{display:none}
.single-card .socket-reading .metric-value,.single-card .room-reading .metric-value{min-height:43px;display:flex;align-items:baseline}
@media(prefers-reduced-motion:reduce){.single-card .socket-spinner{animation:none}}

.single-card [data-live-panel="boiler"] .adjust .round{width:40px;height:40px;min-width:40px;min-height:40px;flex:0 0 40px;padding:0;aspect-ratio:1;border-radius:50%}
.single-card [data-live-panel="air"] .air-more{border-top:1px solid var(--k-line);margin-top:12px;padding-top:7px}
.single-card [data-live-panel="air"] .air-more summary{display:flex;align-items:center;min-height:44px;color:var(--k-muted);font-size:12px;cursor:pointer}
.single-card [data-live-panel="air"] .air-more summary::after{content:'⌄';margin-left:auto;font-size:18px}
.single-card [data-live-panel="air"] .air-more[open] summary::after{transform:rotate(180deg)}
.single-card [data-live-panel="air"] .modes{grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;padding:4px}
.single-card [data-live-panel="air"] .air-temperature{padding:14px 0;min-height:0}
.single-card [data-live-panel="air"] .modes{margin-top:0;margin-bottom:12px}
.single-card [data-live-panel="air"] .mode{width:100%;height:44px;min-height:44px;padding:0;border-radius:12px;background:transparent;--mdc-icon-size:20px}
.single-card [data-live-panel="air"] .mode[aria-pressed="true"]{background:var(--k-cool-bg);color:var(--k-cool)}
.single-card [data-live-panel="air"] .mode svg{width:23px;height:23px}
.single-card [data-live-panel="air"] .air-fan{border-top:1px solid var(--k-line);padding:10px 0 12px}
.single-card [data-live-panel="air"] .air-fan-heading{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px;font-size:12px}
.single-card [data-live-panel="air"] .air-fan-speed{color:var(--k-muted);font-size:12px}
.single-card [data-live-panel="air"] .air-fan-speeds{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:2px}
.single-card [data-live-panel="air"] .air-fan-speeds button{display:grid;place-items:center;min-width:0;min-height:44px;padding:4px 0;border-radius:10px;background:transparent;color:var(--k-muted)}
.single-card [data-live-panel="air"] .air-fan-speeds button[aria-pressed="true"]{background:var(--k-cool-bg);color:var(--k-cool)}
.single-card [data-live-panel="air"] .air-fan-speeds svg{width:24px;height:24px;flex-shrink:0}
.single-card [data-live-panel="air"] .air-inline-icon{fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.single-card [data-live-panel="air"] .air-inline-icon text{fill:currentColor;stroke:none;font:10px system-ui,sans-serif}
.single-card [data-live-panel="air"] .air-fan-blades{fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.single-card [data-live-panel="air"] .air-swing-main{display:grid;grid-template-columns:1fr 1fr;gap:15px;border-top:1px solid var(--k-line);margin-top:2px;padding:10px 0 12px}
.single-card [data-live-panel="air"] .air-swing-main-button{display:flex;flex-direction:row;align-items:center;justify-content:center;gap:7px;min-width:0;min-height:44px;padding:2px;background:transparent;color:var(--k-text);font-size:11px}
.single-card [data-live-panel="air"] .air-swing-main-icon{display:grid;place-items:center;width:44px;height:44px;flex:0 0 44px;border:1px solid var(--k-line);border-radius:50%;color:var(--k-muted)}
.single-card [data-live-panel="air"] .air-swing-main-button[aria-pressed="true"] .air-swing-main-icon{border-color:var(--k-cool);background:var(--k-cool-bg);color:var(--k-cool)}
.single-card [data-live-panel="air"] .air-swing-main-icon svg{width:28px;height:28px}
.single-card [data-live-panel="air"] .air-fixed-palette{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:3px;padding:4px 0 10px}
.single-card [data-live-panel="air"] .air-fixed-position{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0;min-height:64px;padding:7px 2px;background:var(--k-soft);color:var(--k-muted);border-radius:14px;font-size:11px}
.single-card [data-live-panel="air"] .air-fixed-position[aria-pressed="true"]{background:var(--k-cool-bg);color:var(--k-cool)}
.single-card [data-live-panel="air"] .air-fixed-position-icon{display:grid;place-items:center;width:36px;height:36px;color:inherit}
.single-card [data-live-panel="air"] .air-fixed-position-icon svg{width:36px;height:36px}
.single-card [data-live-panel="air"] .air-control-label{font-size:11px;color:var(--k-muted);margin:8px 0 5px}
.single-card [data-live-panel="air"] .air-switches{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}
.single-card [data-live-panel="air"] .air-switch{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-width:0;min-height:70px;padding:4px 2px;background:transparent;color:var(--k-muted);font-size:10px;text-align:center;white-space:normal}
.single-card [data-live-panel="air"] .air-control-icon{display:grid;place-items:center;width:48px;height:48px;border:1px solid var(--k-line);border-radius:50%;color:var(--k-muted)}
.single-card [data-live-panel="air"] .air-control-icon svg{width:28px;height:28px}
.single-card [data-live-panel="air"] .air-switch[aria-pressed="true"]{color:var(--k-cool)}
.single-card [data-live-panel="air"] .air-switch[aria-pressed="true"] .air-control-icon{border-color:var(--k-cool);background:transparent;color:var(--k-cool);border-width:1.6px}
.single-card [data-live-panel="air"] .air-switch[aria-pressed="true"]{font-weight:500}
.single-card [data-live-panel="air"] .air-switch[aria-pressed="true"] .air-control-icon svg{stroke-width:1.9}
.single-card [data-live-panel="air"] .air-line-icon{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.single-card [data-live-panel="air"] .air-icon-text{fill:currentColor;stroke:none;font:700 10px system-ui,sans-serif}
.single-card [data-live-panel="air"] .air-rays path{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
.single-card [data-live-panel="air"] .air-rays .ray{stroke-dasharray:1.5 2.5}
.single-card [data-live-panel="air"] .air-rays .ray.selected{stroke-dasharray:none}
.single-card [data-live-panel="air"] .round[data-pending="true"] .air-inline-icon{display:none}
.pending-spinner{box-sizing:border-box;width:16px;height:16px;border:2px solid var(--k-line);border-top-color:currentColor;border-radius:50%;color:var(--k-warm)}
.round .pending-spinner{display:none}

.single-card .device-icon>.air-inline-icon{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.single-card [data-live-panel="air"] .air-unified{background:var(--k-soft);border-radius:12px;padding:4px;margin-top:12px;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px}
.single-card [data-live-panel="air"] .air-unified-first,.single-card [data-live-panel="air"] .air-unified-second,.single-card [data-live-panel="air"] .air-unified .air-fixed-palette{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;height:54px;padding:0;margin:0}
.single-card [data-live-panel="air"] .air-unified button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-width:0;width:100%;height:54px;min-height:54px;padding:7px 2px;border:0;border-radius:8px;background:transparent;color:var(--k-muted);font-size:11px;white-space:nowrap}
.single-card [data-live-panel="air"] .air-unified button[aria-pressed="true"]{background:transparent;color:var(--k-cool);font-weight:500}
.single-card [data-live-panel="air"] .air-unified .air-control-icon,.single-card [data-live-panel="air"] .air-unified .air-swing-main-icon,.single-card [data-live-panel="air"] .air-unified .air-fixed-position-icon{width:18px;height:18px;flex:0 0 18px;border:0;background:transparent;color:inherit;border-radius:0}
.single-card [data-live-panel="air"] .air-unified svg{width:18px;height:18px}
.single-card [data-live-panel="air"] .air-fan-speeds{background:var(--k-soft);border-radius:12px;padding:3px}
.single-card [data-live-panel="air"] .air-fan-speeds button[aria-pressed="true"]{background:var(--k-card)}

.single-card [data-live-panel="boiler"] .features{grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:3px}
.single-card [data-live-panel="boiler"] .feature{display:flex;align-items:center;justify-content:center;gap:4px;min-width:0;padding:6px 3px;font-size:11px;white-space:normal}
.single-card [data-live-panel="boiler"] .boiler-feature-icon{display:inline-grid;place-items:center;flex:0 0 16px;width:16px;height:16px;color:inherit}
.single-card [data-live-panel="boiler"] .boiler-feature-icon svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.single-card .secondary{font-size:12px}
.single-card [data-live-panel="boiler"] .feature{font-size:12px}
.single-card [data-live-panel="boiler"] .feature[aria-pressed="true"]{font-weight:600}
.single-card .features:not(:has(>button:not([hidden]))),.single-card .air-unified:not(:has(button:not([hidden]))),.single-card .air-fan:has(.air-fan-speeds[hidden]){display:none}
.single-card .socket-missing small,.single-card .room-missing small,.single-card .river-missing small,.temperature-missing small{display:none}
.single-card .temperature-missing{font-size:16px!important;color:var(--k-muted)!important;letter-spacing:0!important;font-weight:400!important}
.single-card [data-live-panel="air"] .mode[aria-pressed="true"],.single-card [data-live-panel="air"] .air-fan-speeds button[aria-pressed="true"],.single-card [data-live-panel="air"] .air-fixed-position[aria-pressed="true"],.single-card [data-live-panel="air"] .air-unified button[aria-pressed="true"]{background:var(--k-card);color:var(--k-cool);font-weight:600}
.single-card [data-live-panel="air"] .air-swing-main-button[aria-pressed="true"]{background:var(--k-card);color:var(--k-cool);font-weight:600}
.single-card [data-live-panel="air"] .air-swing-main-button[aria-pressed="true"] .air-swing-main-icon{border-color:transparent;background:transparent;color:var(--k-cool)}
.single-card [data-live-panel="air"] .air-unified-first,.single-card [data-live-panel="air"] .air-unified-second{display:contents}
.single-card [data-live-panel="air"] .air-unified-first[hidden],.single-card [data-live-panel="air"] .air-unified-second[hidden]{display:none}.single-card [data-live-panel="air"] .air-unified .air-fixed-palette{grid-column:1/-1}
.single-card [data-live-panel="air"] .air-unified button{font-size:12px;line-height:1.1;white-space:normal;text-align:center;border-radius:10px}
.single-card [data-live-panel="air"] .air-switch[aria-pressed="true"]{font-weight:600}
.single-card .river-card[data-offline="true"]>:not(.river-header):not(.river-offline-note){display:none!important}
.single-card .river-card .river-offline-note{margin:12px 0 0;color:var(--k-muted);font-size:12px}
.round[data-pending="true"] ha-icon,.round[data-pending="true"] .air-inline-icon{display:none}
.single-card .round>.air-inline-icon,.single-card .icon-button>.air-inline-icon{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
[data-live-panel="air"] .pending-spinner{color:var(--k-cool)}
.round[data-pending="true"] .pending-spinner{display:block;animation:home-pending-spin .75s linear infinite}
/* Shared typography for every standalone device card, including mobile >= 360px. */
:host{--card-value-size:40px;--card-secondary-size:20px;--card-title-size:14px;--card-caption-size:12px}
.single-card{font-family:var(--primary-font-family,system-ui,sans-serif)}
.single-card .socket-card,.single-card .room-sensor-card,.single-card .river-card{font-family:inherit}
.single-card h2,.single-card .desktop-board h2,.single-card .socket-card h2,.single-card .room-sensor-card h2,.single-card .river-heading h2{font-size:var(--card-title-size);font-weight:500;line-height:1.4;letter-spacing:0}
.single-card .desktop-board .current,.single-card .air-value,.single-card .socket-reading .metric-value,.single-card .room-reading .metric-value,.single-card .river-large{font-size:var(--card-value-size);font-weight:400;line-height:1.2;letter-spacing:-1px;font-variant-numeric:tabular-nums}
.single-card .desktop-board .target,.single-card .socket-metrics strong,.single-card .river-power strong,.single-card .river-percent,.single-card .river-runtime strong{font-size:var(--card-secondary-size);font-weight:400;line-height:1.3;letter-spacing:-.3px;font-variant-numeric:tabular-nums}
.single-card .secondary,.single-card .socket-card .secondary,.single-card .room-sensor-card .secondary,.single-card .river-card .secondary,.single-card .river-reading,.single-card .river-detail-row{font-size:var(--card-caption-size);line-height:1.4}
.single-card .degree,.single-card .air-degree,.single-card .metric-value small,.single-card .target small,.single-card .socket-metrics strong small,.single-card .river-large small,.single-card .river-percent small,.single-card .river-power strong small{font-size:var(--card-caption-size);font-weight:400;line-height:1.4;letter-spacing:0;vertical-align:baseline;margin:0 0 0 4px;color:var(--k-muted)}
.single-card .desktop-board .water-large{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto 48px;align-items:center;column-gap:12px;row-gap:7px;margin:24px 0 20px}
.single-card .water-large .setpoint{display:contents}
.single-card .water-large .setpoint>.secondary{grid-column:2;grid-row:1;text-align:center;margin:0}
.single-card .water-large>.current{grid-column:1;grid-row:2}
.single-card .desktop-board .water-large .adjust{grid-column:2;grid-row:2;margin:0;align-self:center}
.single-card .water-large>.boiler-current-label{grid-column:1;grid-row:1;margin:0}
.single-card .desktop-board .water-large .adjust{height:48px;gap:8px}
.single-card .water-large .target{min-width:45px;text-align:center}
@media(max-width:400px){.single-card .desktop-board .water-large{column-gap:8px}.single-card .desktop-board .water-large .adjust{gap:5px}}
@keyframes home-pending-spin{to{transform:rotate(360deg)}}
@media(pointer:coarse){.single-card [data-live-panel="boiler"] .adjust .round{width:44px;height:44px;min-width:44px;min-height:44px;flex-basis:44px}}
@media(prefers-reduced-motion:reduce){.round[data-pending="true"] .pending-spinner{animation:none}}
`;

// Swing icons from https://github.com/lageorgem/ha-material-thermostat-card
/* MIT License

Copyright (c) 2026 George Mihai

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */
const HOME_AIR_SWING_ASSETS=["<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M2.8 2.4L2.8 20.9A0.9 0.9 0 0 0 4.6 20.9L4.6 2.4L2.8 2.4ZM2.8 4.2L20.2 4.2A0.9 0.9 0 0 0 20.2 2.4L2.8 2.4L2.8 4.2ZM20.444 6.827A16 16 0 0 1 19.746 9.756L9.144 6.147A4.8 4.8 0 0 0 9.353 5.268Z\" fill=\"currentColor\"/><path d=\"M19.295 10.929A16 16 0 0 1 17.849 13.57L8.575 7.291A4.8 4.8 0 0 0 9.009 6.499ZM17.104 14.582A16 16 0 0 1 15.012 16.748L7.724 8.245A4.8 4.8 0 0 0 8.351 7.595ZM14.027 17.528A16 16 0 0 1 11.438 19.065L6.651 8.94A4.8 4.8 0 0 0 7.428 8.478ZM10.282 19.557A16 16 0 0 1 7.378 20.357L5.434 9.327A4.8 4.8 0 0 0 6.305 9.087Z\" fill=\"currentColor\" opacity=\"0.5\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M2.8 2.4L2.8 20.9A0.9 0.9 0 0 0 4.6 20.9L4.6 2.4L2.8 2.4ZM2.8 4.2L20.2 4.2A0.9 0.9 0 0 0 20.2 2.4L2.8 2.4L2.8 4.2ZM19.295 10.929A16 16 0 0 1 17.849 13.57L8.575 7.291A4.8 4.8 0 0 0 9.009 6.499Z\" fill=\"currentColor\"/><path d=\"M20.444 6.827A16 16 0 0 1 19.746 9.756L9.144 6.147A4.8 4.8 0 0 0 9.353 5.268ZM17.104 14.582A16 16 0 0 1 15.012 16.748L7.724 8.245A4.8 4.8 0 0 0 8.351 7.595ZM14.027 17.528A16 16 0 0 1 11.438 19.065L6.651 8.94A4.8 4.8 0 0 0 7.428 8.478ZM10.282 19.557A16 16 0 0 1 7.378 20.357L5.434 9.327A4.8 4.8 0 0 0 6.305 9.087Z\" fill=\"currentColor\" opacity=\"0.5\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M2.8 2.4L2.8 20.9A0.9 0.9 0 0 0 4.6 20.9L4.6 2.4L2.8 2.4ZM2.8 4.2L20.2 4.2A0.9 0.9 0 0 0 20.2 2.4L2.8 2.4L2.8 4.2ZM17.104 14.582A16 16 0 0 1 15.012 16.748L7.724 8.245A4.8 4.8 0 0 0 8.351 7.595Z\" fill=\"currentColor\"/><path d=\"M20.444 6.827A16 16 0 0 1 19.746 9.756L9.144 6.147A4.8 4.8 0 0 0 9.353 5.268ZM19.295 10.929A16 16 0 0 1 17.849 13.57L8.575 7.291A4.8 4.8 0 0 0 9.009 6.499ZM14.027 17.528A16 16 0 0 1 11.438 19.065L6.651 8.94A4.8 4.8 0 0 0 7.428 8.478ZM10.282 19.557A16 16 0 0 1 7.378 20.357L5.434 9.327A4.8 4.8 0 0 0 6.305 9.087Z\" fill=\"currentColor\" opacity=\"0.5\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M2.8 2.4L2.8 20.9A0.9 0.9 0 0 0 4.6 20.9L4.6 2.4L2.8 2.4ZM2.8 4.2L20.2 4.2A0.9 0.9 0 0 0 20.2 2.4L2.8 2.4L2.8 4.2ZM14.027 17.528A16 16 0 0 1 11.438 19.065L6.651 8.94A4.8 4.8 0 0 0 7.428 8.478Z\" fill=\"currentColor\"/><path d=\"M20.444 6.827A16 16 0 0 1 19.746 9.756L9.144 6.147A4.8 4.8 0 0 0 9.353 5.268ZM19.295 10.929A16 16 0 0 1 17.849 13.57L8.575 7.291A4.8 4.8 0 0 0 9.009 6.499ZM17.104 14.582A16 16 0 0 1 15.012 16.748L7.724 8.245A4.8 4.8 0 0 0 8.351 7.595ZM10.282 19.557A16 16 0 0 1 7.378 20.357L5.434 9.327A4.8 4.8 0 0 0 6.305 9.087Z\" fill=\"currentColor\" opacity=\"0.5\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M2.8 2.4L2.8 20.9A0.9 0.9 0 0 0 4.6 20.9L4.6 2.4L2.8 2.4ZM2.8 4.2L20.2 4.2A0.9 0.9 0 0 0 20.2 2.4L2.8 2.4L2.8 4.2ZM10.282 19.557A16 16 0 0 1 7.378 20.357L5.434 9.327A4.8 4.8 0 0 0 6.305 9.087Z\" fill=\"currentColor\"/><path d=\"M20.444 6.827A16 16 0 0 1 19.746 9.756L9.144 6.147A4.8 4.8 0 0 0 9.353 5.268ZM19.295 10.929A16 16 0 0 1 17.849 13.57L8.575 7.291A4.8 4.8 0 0 0 9.009 6.499ZM17.104 14.582A16 16 0 0 1 15.012 16.748L7.724 8.245A4.8 4.8 0 0 0 8.351 7.595ZM14.027 17.528A16 16 0 0 1 11.438 19.065L6.651 8.94A4.8 4.8 0 0 0 7.428 8.478Z\" fill=\"currentColor\" opacity=\"0.5\"/></svg>", "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M2.8 2.4L2.8 20.9A0.9 0.9 0 0 0 4.6 20.9L4.6 2.4L2.8 2.4ZM2.8 4.2L20.2 4.2A0.9 0.9 0 0 0 20.2 2.4L2.8 2.4L2.8 4.2ZM17.077 6.354A12.6 12.6 0 0 1 16.528 8.661L9.144 6.147A4.8 4.8 0 0 0 9.353 5.268ZM16.172 9.584A12.6 12.6 0 0 1 15.034 11.664L8.575 7.291A4.8 4.8 0 0 0 9.009 6.499ZM14.447 12.461A12.6 12.6 0 0 1 12.8 14.167L7.724 8.245A4.8 4.8 0 0 0 8.351 7.595ZM12.024 14.781A12.6 12.6 0 0 1 9.985 15.991L6.651 8.94A4.8 4.8 0 0 0 7.428 8.478ZM9.074 16.379A12.6 12.6 0 0 1 6.788 17.009L5.434 9.327A4.8 4.8 0 0 0 6.305 9.087ZM19.935 9.505A16.1 16.1 0 0 1 10.037 19.754L9.497 18.248A14.5 14.5 0 0 0 18.411 9.017ZM19.965 6.785L21.268 9.931L17.077 8.591ZM7.319 19.879L9.024 16.93L10.51 21.072Z\" fill=\"currentColor\"/></svg>"];

const HOME_DEVICE_CARD_DEFAULTS = {
  boiler: {
    boiler_entity: null,
    boiler_hours: null,
    boiler_minutes: null,
    memo_entity: null,
    mega_entity: null,
    sterilization_entity: null,
  },
  air: {
    air_entity: null,
    air_x_fan_entity: null,
    air_lights_entity: null,
    air_health_entity: null,
    air_power_save_entity: null,
    air_8deg_heat_entity: null,
    air_sleep_entity: null,
    air_valve_entity: null,
    air_anti_direct_blow_entity: null,
    air_light_sensor_entity: null,
    air_auto_x_fan_entity: null,
    air_auto_light_entity: null,
    air_beeper_entity: null,
  },
  room: {
    room_temperature_entity: null,
    humidity_entity: null,
    battery_entity: null,
    room_temperature_label: 'Температура',
    humidity_label: 'Вологість',
  },
  socket: {
    switch_entity: null,
    power_entity: null,
    voltage_entity: null,
    current_entity: null,
    energy_daily_entity: null,
    energy_label: 'Енергія',
  },
  river: {
    river_status: null,
    river_battery: null,
    river_input: null,
    river_output: null,
    river_runtime: null,
    river_ac_output: null,
    river_dc_output: null,
    river_usb_c_output: null,
    river_usb_1_output: null,
    river_usb_2_output: null,
    river_usb_3_output: null,
    main_level_entity: null,
    main_full_entity: null,
    main_remain_entity: null,
    main_volts_entity: null,
    main_temperature_entity: null,
    main_current_entity: null,
    main_min_cells_entity: null,
    main_max_cells_entity: null,
    main_cycles_entity: null,
    slave_level_entity: null,
    slave_full_entity: null,
    slave_remain_entity: null,
    slave_volts_entity: null,
    slave_temperature_entity: null,
    slave_current_entity: null,
    slave_min_cells_entity: null,
    slave_max_cells_entity: null,
    slave_cycles_entity: null,
  },
  energy: {
    power_entity: null,
    voltage_entity: null,
    current_entity: null,
    energy_daily: null,
    energy_monthly: null,
    energy_total: null,
    energy_path: '/home-cards/energy',
  },
  energy_details: {
    power_entity: null,
    voltage_entity: null,
    current_entity: null,
    energy_daily: null,
    energy_monthly: null,
    energy_total: null,
    energy_path: '/home-cards/energy',
  },
  battery: {
    river_status: null,
    battery_path: '/home-cards/battery',
    main_level_entity: null,
    main_full_entity: null,
    main_remain_entity: null,
    main_volts_entity: null,
    main_current_entity: null,
    main_min_cells_entity: null,
    main_max_cells_entity: null,
    main_min_temperature_entity: null,
    main_max_temperature_entity: null,
    main_cycles_entity: null,
    slave_level_entity: null,
    slave_full_entity: null,
    slave_remain_entity: null,
    slave_volts_entity: null,
    slave_current_entity: null,
    slave_min_cells_entity: null,
    slave_max_cells_entity: null,
    slave_min_temperature_entity: null,
    slave_max_temperature_entity: null,
    slave_cycles_entity: null,
  },
};

const HOME_DEVICE_CARD_FIELDS = {
  boiler: [
    ['boiler_entity', 'Бойлер', 'water_heater,climate'],
    ['memo_entity', 'Memo U', 'switch'],
    ['mega_entity', 'Mega Water', 'switch'],
    ['sterilization_entity', 'Стерилізація', 'switch'],
  ],
  air: [
    ['air_entity', 'Кондиціонер', 'climate'],
    ['air_x_fan_entity', 'X-Fan · просушування', 'switch'],
    ['air_lights_entity', 'Підсвічування', 'switch'],
    ['air_health_entity', 'Іонізація · Health', 'switch'],
    ['air_power_save_entity', 'Енергоощадження', 'switch'],
    ['air_8deg_heat_entity', 'Підтримання +8 °C', 'switch'],
    ['air_sleep_entity', 'Сон', 'switch'],
    ['air_valve_entity', 'Клапан повітря', 'switch'],
    ['air_anti_direct_blow_entity', 'Захист від прямого потоку', 'switch'],
    ['air_light_sensor_entity', 'Датчик освітлення', 'switch'],
    ['air_auto_x_fan_entity', 'Автоматичний X-Fan', 'switch'],
    ['air_auto_light_entity', 'Автоматичне підсвічування', 'switch'],
    ['air_beeper_entity', 'Звуковий сигнал', 'switch'],
  ],
  room: [
    ['room_temperature_entity', 'Температура кімнати', 'sensor'],
    ['humidity_entity', 'Вологість кімнати', 'sensor'],
    ['room_temperature_label', 'Назва температури', 'text'],
    ['humidity_label', 'Назва вологості', 'text'],
    ['battery_entity', 'Заряд батареї датчика', 'sensor'],
  ],
  socket: [
    ['switch_entity', 'Керування розеткою', 'switch'],
    ['power_entity', 'Поточна потужність', 'sensor'],
    ['voltage_entity', 'Напруга', 'sensor'],
    ['current_entity', 'Струм', 'sensor'],
    ['energy_daily_entity', 'Споживання', 'sensor'],
    ['energy_label', 'Підпис енергії', 'text'],
  ],
  river: [
    ['river_status', 'Статус станції', 'sensor'],
    ['river_battery', 'Заряд станції', 'sensor'],
    ['river_input', 'Вхідна потужність', 'sensor'],
    ['river_output', 'Вихідна потужність', 'sensor'],
    ['river_runtime', 'Залишок часу', 'sensor'],
    ['river_ac_output', 'Вихід AC', 'sensor'],
    ['river_dc_output', 'Вихід DC', 'sensor'],
    ['river_usb_c_output', 'Вихід USB-C', 'sensor'],
    ['river_usb_1_output', 'Вихід USB 1', 'sensor'],
    ['river_usb_2_output', 'Вихід USB 2', 'sensor'],
    ['river_usb_3_output', 'Вихід USB 3', 'sensor'],
    ...[
      ['main_level_entity', 'Заряд основної батареї'], ['main_full_entity', 'Повна ємність основної'],
      ['main_remain_entity', 'Залишкова ємність основної'], ['main_volts_entity', 'Напруга основної батареї'],
      ['main_current_entity', 'Струм основної батареї'], ['main_min_cells_entity', 'Мінімальна напруга комірки основної'],
      ['main_max_cells_entity', 'Максимальна напруга комірки основної'], ['main_cycles_entity', 'Цикли основної батареї'],
      ['slave_level_entity', 'Заряд додаткової батареї'], ['slave_full_entity', 'Повна ємність додаткової'],
      ['slave_remain_entity', 'Залишкова ємність додаткової'], ['slave_volts_entity', 'Напруга додаткової батареї'],
      ['slave_current_entity', 'Струм додаткової батареї'], ['slave_min_cells_entity', 'Мінімальна напруга комірки додаткової'],
      ['slave_max_cells_entity', 'Максимальна напруга комірки додаткової'], ['slave_cycles_entity', 'Цикли додаткової батареї'],
    ].map(([name, label]) => [name, label, 'sensor']),
    ['main_temperature_entity', 'Температура основної батареї', 'sensor'],
    ['slave_temperature_entity', 'Температура додаткової батареї', 'sensor'],
  ],
  energy: [
    ['power_entity', 'Потужність', 'sensor'],
    ['voltage_entity', 'Напруга', 'sensor'],
    ['current_entity', 'Струм', 'sensor'],
    ['energy_daily', 'Енергія сьогодні', 'sensor'],
    ['energy_monthly', 'Енергія за місяць', 'sensor'],
    ['energy_total', 'Енергія від початку обліку', 'sensor'],
    ['energy_path', 'Шлях до деталей енергії', 'text'],
  ],
  energy_details: [
    ['power_entity', 'Потужність', 'sensor'],
    ['voltage_entity', 'Напруга', 'sensor'],
    ['current_entity', 'Струм', 'sensor'],
    ['energy_daily', 'Енергія сьогодні', 'sensor'],
    ['energy_monthly', 'Енергія за місяць', 'sensor'],
    ['energy_total', 'Енергія від початку обліку', 'sensor'],
    ['energy_path', 'Шлях до деталей енергії', 'text'],
  ],
  battery: [
    ['river_status', 'Статус станції', 'sensor'],
    ...[
      ['main_level_entity', 'Заряд основної батареї'], ['main_full_entity', 'Повна ємність основної'],
      ['main_remain_entity', 'Залишкова ємність основної'], ['main_volts_entity', 'Напруга основної батареї'],
      ['main_current_entity', 'Струм основної батареї'], ['main_min_cells_entity', 'Мінімальна напруга комірки основної'],
      ['main_max_cells_entity', 'Максимальна напруга комірки основної'], ['main_min_temperature_entity', 'Мінімальна температура основної'],
      ['main_max_temperature_entity', 'Максимальна температура основної'], ['main_cycles_entity', 'Цикли основної батареї'],
      ['slave_level_entity', 'Заряд додаткової батареї'], ['slave_full_entity', 'Повна ємність додаткової'],
      ['slave_remain_entity', 'Залишкова ємність додаткової'], ['slave_volts_entity', 'Напруга додаткової батареї'],
      ['slave_current_entity', 'Струм додаткової батареї'], ['slave_min_cells_entity', 'Мінімальна напруга комірки додаткової'],
      ['slave_max_cells_entity', 'Максимальна напруга комірки додаткової'], ['slave_min_temperature_entity', 'Мінімальна температура додаткової'],
      ['slave_max_temperature_entity', 'Максимальна температура додаткової'], ['slave_cycles_entity', 'Цикли додаткової батареї'],
    ].map(([name, label]) => [name, label, 'sensor']),
    ['battery_path', 'Шлях до подробиць батарей', 'text'],
  ],
};

const HOME_DEVICE_CARD_META = {
  boiler: ['home-boiler-card', 'Бойлер', 'Картка керування бойлером Midea.'],
  air: ['home-air-card', 'Кондиціонер', 'Картка керування кондиціонером.'],
  room: ['home-room-card', 'Кімната', 'Температура та вологість датчика.'],
  socket: ['home-socket-card', 'Розетка', 'Керування та електричні показники розетки.'],
  river: ['home-river-card', 'EcoFlow RIVER Max', 'Заряд, батареї та потужність кожного виходу.'],
  energy: ['home-energy-card', 'Енергія бойлера', 'Лічильники й графік потужності.'],
  energy_details: ['home-energy-details-card', 'Енергія · докладно', 'Показники розетки та графік потужності.'],
  battery: ['home-battery-card', 'Батареї EcoFlow', 'Ємності, струми, комірки й температури.'],
};

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
class HomeBoilerCard extends HomeDeviceStandaloneCard {
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
    let html = super._boiler();
    html = html.replace(
      '<div class="water-large">',
      '<div class="water-large"><span class="secondary boiler-current-label">Температура води</span>',
    );
    html = html.replace(this._icon("water-boiler"), this._lucideIcon("heater"));
    for (const [action, icon] of [
      ["boiler-minus", "minus"],
      ["boiler-plus", "plus"],
      ["boiler-power", "power"],
    ]) {
      const pattern = new RegExp(
        `(<button[^>]*data-action="${action}"[^>]*>)[\\s\\S]*?(<\\/button>)`,
      );
      html = html.replace(
        pattern,
        (_, open, close) => `${open}${this._lucideIcon(icon)}${close}`,
      );
    }
    html = html.replace(
      '<small class="degree">°C</small>',
      '<small class="degree" data-live="boiler-current-unit">°C</small>',
    );
    html = html.replace(
      /(<span data-live="boiler-target">[^<]*<\/span>)°/,
      '$1<small data-live="boiler-target-unit">°C</small>',
    );
    html = html.replace(/<div class="features"[^>]*>[\s\S]*?<\/div>/, () =>
      this._boilerFeatures(),
    );
    return html;
  }

  _boilerFeatures() {
    const definitions = [
      ["memo_entity", "Memo U", "house"],
      ["mega_entity", "Mega Water", "droplets"],
      ["sterilization_entity", "Стерилізація", "shield-check"],
    ];
    const buttons = definitions
      .map(([key, label, icon]) => {
        const entity = this._config[key],
          feature = this._state(entity);
        if (!entity) return "";
        const unavailable = feature && !this._available(entity);
        const title = unavailable ? `${label}: тимчасово недоступно` : label;
        return `<button class="feature" data-action="feature" data-entity="${this._escape(entity)}" title="${this._escape(title)}" aria-label="${this._escape(title)}" aria-pressed="${feature?.state === "on"}" ${feature ? this._disabled(!this._available(entity), entity) : "hidden disabled"}><span class="boiler-feature-icon">${this._lucideIcon(icon)}</span><span>${label}</span></button>`;
      })
      .join("");
    return `<div class="features" role="group" aria-label="Режими бойлера">${buttons}</div>`;
  }

  _updateBoiler() {
    super._updateBoiler();
    const panel = this.shadowRoot.querySelector('[data-live-panel="boiler"]');
    if (!panel) return;
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
    for (const [key, label] of [
      ["memo_entity", "Memo U"],
      ["mega_entity", "Mega Water"],
      ["sterilization_entity", "Стерилізація"],
    ]) {
      const entity = this._config[key];
      const button =
        entity &&
        panel.querySelector(
          `[data-action="feature"][data-entity="${this._escape(entity)}"]`,
        );
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
    }
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
      this._config.memo_entity,
      this._config.mega_entity,
      this._config.sterilization_entity,
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
class HomeAirCard extends HomeDeviceStandaloneCard {
  static get cardType() {
    return "air";
  }
  static get cardTitle() {
    return ["air_entity", "Кондиціонер"];
  }
  _content() {
    return `<div class="desktop-board"><div class="desktop-air">${this._air()}</div></div>`;
  }
  _temperature(entity, delta) {
    if (this._busy(entity) || !this._available(entity)) return;
    this._temperatureAction = `air-${delta > 0 ? "plus" : "minus"}`;
    super._temperature(entity, delta);
  }

  _air() {
    let html = super._air();
    html = html.replace(
      this._icon("air-conditioner"),
      this._lucideIcon("air-vent"),
    );
    const id = this._airId(),
      state = this._state(id),
      a = state?.attributes || {},
      available = this._available(id);
    html = html.replace(/<span data-live="air-room">[\s\S]*?<\/span>/, "");
    const room = this._number(a.current_temperature);
    html = html.replace(
      '<span class="secondary">Задана температура</span>',
      `<span class="secondary" data-live="air-room-caption">У кімнаті ${available ? this._format(room) : "—"} °C</span>`,
    );
    html = html.replace(
      /<div class="modes"[^>]*>[\s\S]*?<\/div>/,
      `<div class="modes" role="group" aria-label="Режим кондиціонера">${this._airModeButtons(a.hvac_modes, state?.state, available, this._busy(id))}</div>`,
    );
    html = html.replace(
      /(<button class="round" data-action="air-minus"[^>]*>)[\s\S]*?(<\/button>)/,
      (_, open, close) => `${open}${this._lucideIcon("minus")}${close}`,
    );
    html = html.replace(
      /(<button class="round" data-action="air-plus"[^>]*>)[\s\S]*?(<\/button>)/,
      (_, open, close) => `${open}${this._lucideIcon("plus")}${close}`,
    );
    html = html.replace(
      /(<button class="icon-button[^>]*data-action="air-power"[^>]*>)[\s\S]*?(<\/button>)/,
      (_, open, close) => `${open}${this._lucideIcon("power")}${close}`,
    );
    html = html.replace(
      /<div class="fan">[\s\S]*?<\/div>/,
      `<div class="air-fan"><div class="air-fan-heading"><span>Швидкість вентилятора</span><span class="air-fan-speed" data-live="air-fan-speed">${this._escape(this._fanLabel(a.fan_mode) || "—")}</span></div><div class="air-fan-speeds" data-air-fan-speeds role="group" aria-label="Швидкість вентилятора кондиціонера">${this._airFanButtons(a.fan_modes, a.fan_mode, available, this._busy(id))}</div></div>`,
    );
    const fullMode = this._swingOption(a.swing_modes, "swing_full"),
      defaultMode = this._swingOption(a.swing_modes, "default");
    const moving = String(a.swing_mode || "")
      .toLowerCase()
      .startsWith("swing");
    const fixed = String(a.swing_mode || "")
      .toLowerCase()
      .startsWith("fixed");
    const fixedPosition = fixed ? this._fixedSwingPosition(a.swing_mode) : 2;
    const fixedModes = this._fixedSwingModes(a.swing_modes);
    const swing = `<div class="air-swing-main" role="group" aria-label="Вертикальні жалюзі"><button class="air-swing-main-button" data-action="air-swing-toggle" title="Вгору-вниз" aria-label="Вгору-вниз" aria-pressed="${moving}" ${this._disabled(!available || !fullMode || !defaultMode, id)}><span class="air-swing-main-icon">${this._swingMainIcon("up-down")}</span><span>Вгору-вниз</span></button><button class="air-swing-main-button" data-action="air-swing-palette" title="Фіксований кут" aria-label="Фіксований кут" aria-pressed="${fixed || !!this._airFixedPaletteOpen}" aria-expanded="${!!this._airFixedPaletteOpen}" aria-controls="air-fixed-palette" ${this._disabled(!available || !fixedModes.length, id)}><span class="air-swing-main-icon" data-position="${fixedPosition}">${this._fixedAngleIcon(fixedPosition)}</span><span>Фіксований кут</span></button></div><div class="air-fixed-palette" id="air-fixed-palette" data-air-fixed-palette ${this._airFixedPaletteOpen ? "" : "hidden"}>${this._fixedSwingButtons(fixedModes, a.swing_mode, available, this._busy(id))}</div>`;
    const firstKeys = [
      "air_lights_entity",
      "air_x_fan_entity",
      "air_sleep_entity",
    ];
    const first = this._airSwitches(firstKeys);
    const second = this._airSwitches([
      "air_health_entity",
      "air_8deg_heat_entity",
      "air_power_save_entity",
      "air_beeper_entity",
    ]);
    const swingButtons = swing
      .slice(swing.indexOf(">") + 1, swing.indexOf("</div>"))
      .replace("<span>Вгору-вниз</span>", "<span>Рух</span>")
      .replace("<span>Фіксований кут</span>", "<span>Кут</span>");
    const palette = swing.slice(
      swing.indexOf('<div class="air-fixed-palette"'),
    );
    const controls = `<div class="air-unified"><div class="air-unified-first">${swingButtons}${first}</div><div class="air-unified-second" ${this._airFixedPaletteOpen ? "hidden" : ""}>${second}</div>${palette}</div>`;
    return html.replace("</article>", `${controls}</article>`);
  }

  _airModeButtons(modes, current, available, busy) {
    const definitions = [
      ["cool", "snowflake", "Охолодження"],
      ["heat", "sun", "Обігрів"],
      ["fan_only", "fan", "Вентиляція"],
      ["dry", "droplet", "Осушення"],
      ["auto", "circle-a", "Автоматичний режим"],
    ];
    return definitions
      .filter(([mode]) => (modes || []).includes(mode))
      .map(
        ([mode, icon, label]) =>
          `<button class="mode" data-action="air-mode" data-mode="${mode}" title="${label}" aria-label="${label}" aria-pressed="${current === mode}" ${this._disabled(!available || busy, this._airId())}>${this._lucideIcon(icon)}</button>`,
      )
      .join("");
  }

  /*
   * Lucide ISC License
   * Copyright (c) 2026 Lucide Icons and Contributors
   * Permission to use, copy, modify, and/or distribute this software for any
   * purpose with or without fee is hereby granted, provided that the above
   * copyright notice and this permission notice appear in all copies.
   * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
   * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
   * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
   * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
   * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
   * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * Feather-derived Lucide icons (circle, headphones, moon, minus, plus):
   * MIT License, Copyright (c) 2013-present Cole Bemis
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   */

  _airFanButtons(modes, current, available, busy) {
    const order = [
      "auto",
      "quiet",
      "low",
      "medium_low",
      "medium",
      "medium_high",
      "high",
      "turbo",
    ];
    const names = {
      auto: "Авто",
      quiet: "Тихий",
      low: "Низька",
      medium_low: "Нижче середньої",
      medium: "Середня",
      medium_high: "Вище середньої",
      high: "Висока",
      turbo: "Турбо",
    };
    const blades = {
      low: 2,
      medium_low: 3,
      medium: 4,
      medium_high: 5,
      high: 6,
    };
    return order
      .filter((mode) => (modes || []).includes(mode))
      .map((mode) => {
        const icon =
          mode === "auto"
            ? this._lucideIcon("gauge")
            : mode === "quiet"
              ? this._lucideIcon("headphones")
              : mode === "turbo"
                ? this._lucideIcon("zap")
                : this._fanBladeIcon(blades[mode]);
        return `<button data-action="air-fan-mode" data-mode="${mode}" aria-label="${names[mode]}" title="${names[mode]}" aria-pressed="${current === mode}" ${this._disabled(!available || busy, this._airId())}>${icon}</button>`;
      })
      .join("");
  }

  _fanBladeIcon(bladeCount) {
    const blades = Array.from(
      { length: bladeCount },
      (_, index) =>
        `<path d="M21 16C23 10 29 5 31 10c3 6-4 9-8 9" transform="rotate(${(index * 360) / bladeCount} 20 20)"/>`,
    ).join("");
    return `<svg class="air-fan-blades" viewBox="0 0 40 40" aria-hidden="true">${blades}<circle cx="20" cy="20" r="2"/></svg>`;
  }

  _airSwitches(keys) {
    const definitions = [
      ["air_x_fan_entity", "X-Fan · просушування", "X-Fan", "x-fan"],
      ["air_lights_entity", "Підсвічування", "Світло", "light"],
      ["air_health_entity", "Іонізація · Health", "Health", "health"],
      ["air_power_save_entity", "Енергоощадження", "Економія", "save"],
      ["air_8deg_heat_entity", "Підтримання +8 °C", "+8 °C", "eight"],
      ["air_sleep_entity", "Сон", "Сон", "sleep"],
      ["air_valve_entity", "Клапан повітря", "Клапан", "valve"],
      [
        "air_anti_direct_blow_entity",
        "Захист від прямого потоку",
        "Захист потоку",
        "airflow",
      ],
      [
        "air_light_sensor_entity",
        "Датчик освітлення",
        "Датчик світла",
        "sensor",
      ],
      ["air_auto_x_fan_entity", "Автоматичний X-Fan", "Авто X-Fan", "x-fan"],
      [
        "air_auto_light_entity",
        "Автоматичне підсвічування",
        "Авто світло",
        "light",
      ],
      ["air_beeper_entity", "Звуковий сигнал", "Звук", "beeper"],
    ];
    return keys
      .map((key) => definitions.find((definition) => definition[0] === key))
      .filter(Boolean)
      .map(([key, label, short, icon]) => {
        const entity = this._config[key],
          feature = this._state(entity);
        if (!entity) return "";
        const unavailable = feature && !this._available(entity),
          title = unavailable ? `${label}: тимчасово недоступно` : label;
        return `<button class="air-switch" data-action="feature" data-entity="${this._escape(entity)}" title="${this._escape(title)}" aria-label="${this._escape(title)}" aria-pressed="${feature?.state === "on"}" ${feature ? this._disabled(!this._available(entity), entity) : "hidden disabled"}><span class="air-control-icon">${this._airOptionIcon(icon)}</span><span>${this._escape(short)}</span></button>`;
      })
      .join("");
  }

  _airOptionIcon(icon) {
    const icons = {
      "x-fan": "wind",
      light: "lightbulb",
      health: "trees",
      save: "leaf",
      eight: "house",
      sleep: "moon",
      valve: "air-vent",
      airflow: "wind",
      sensor: "sun",
      beeper: "volume-2",
    };
    return this._lucideIcon(icons[icon] || "wind");
  }

  _swingLabel(mode) {
    const key = String(mode)
      .toLowerCase()
      .replace(/[\s_-]/g, "");
    return (
      {
        default: "Стандартне",
        swingfull: "Повне хитання",
        fixedupmost: "Верхнє положення",
        fixedmiddleup: "Вище середини",
        fixedmiddle: "Середнє положення",
        fixedmiddlelow: "Нижче середини",
        fixedlowest: "Нижнє положення",
        swingdownmost: "Нижній діапазон",
        swingmiddlelow: "Середньо-нижній діапазон",
        swingmiddle: "Середній діапазон",
        swingmiddleup: "Середньо-верхній діапазон",
        swingupmost: "Верхній діапазон",
      }[key] || mode
    );
  }

  _swingOption(options, value) {
    const key = String(value)
      .toLowerCase()
      .replace(/[\s_-]/g, "");
    return (
      (options || []).find(
        (option) =>
          String(option)
            .toLowerCase()
            .replace(/[\s_-]/g, "") === key,
      ) || null
    );
  }

  _fixedSwingModes(modes) {
    return [
      "fixed_upmost",
      "fixed_middle_up",
      "fixed_middle",
      "fixed_middle_low",
      "fixed_lowest",
    ]
      .map((mode) => this._swingOption(modes, mode))
      .filter(Boolean);
  }

  _fixedSwingPosition(mode) {
    return [
      "fixed_upmost",
      "fixed_middle_up",
      "fixed_middle",
      "fixed_middle_low",
      "fixed_lowest",
    ].findIndex((value) => this._swingOption([mode], value));
  }

  _swingMainIcon(kind) {
    return kind === "fixed"
      ? HOME_AIR_SWING_ASSETS[2]
      : HOME_AIR_SWING_ASSETS[5];
  }

  _fixedAngleIcon(position = -1) {
    return (
      HOME_AIR_SWING_ASSETS[position < 0 ? 2 : position] ||
      HOME_AIR_SWING_ASSETS[2]
    );
  }

  _fixedSwingButtons(modes, current, available, busy) {
    return modes
      .map((mode) => {
        const position = this._fixedSwingPosition(mode);
        const label = this._swingLabel(mode),
          caption = `Положення ${position + 1}: ${label}`;
        return `<button class="air-fixed-position" data-action="air-fixed-position" data-mode="${this._escape(mode)}" title="${this._escape(caption)}" aria-label="${this._escape(caption)}" aria-pressed="${current === mode}" ${this._disabled(!available || busy, this._airId())}><span class="air-fixed-position-icon">${this._fixedAngleIcon(position)}</span><span>${position + 1}</span></button>`;
      })
      .join("");
  }

  _fanLabel(mode) {
    return (
      {
        auto: "Авто",
        low: "Низька",
        medium_low: "Нижче середньої",
        medium: "Середня",
        medium_high: "Вище середньої",
        high: "Висока",
        turbo: "Турбо",
        quiet: "Тихий",
      }[mode] || mode
    );
  }

  _updateAir() {
    super._updateAir();
    const panel = this.shadowRoot.querySelector('[data-live-panel="air"]');
    if (!panel) return;
    const id = this._airId(),
      state = this._state(id),
      a = state?.attributes || {},
      available = this._available(id);
    const roomTemperature = available
      ? this._number(a.current_temperature)
      : null;
    this._setText(
      '[data-live="air-room-caption"]',
      roomTemperature === null
        ? "Температура в кімнаті недоступна"
        : `У кімнаті ${this._format(roomTemperature)} °C`,
      panel,
    );
    const targetValue = available ? this._number(a.temperature) : null,
      targetNode = panel.querySelector(".air-value");
    if (!available) this._setText('[data-live="air-target"]', "—", panel);
    targetNode?.classList.toggle("temperature-missing", targetValue === null);
    this._setHidden(".air-degree", targetValue === null, panel);
    const modeGroup = panel.querySelector(".modes"),
      supportedModes = ["cool", "heat", "fan_only", "dry", "auto"].filter(
        (mode) => (a.hvac_modes || []).includes(mode),
      );
    if (modeGroup) {
      const currentModes = Array.from(
        modeGroup.querySelectorAll('[data-action="air-mode"]'),
      ).map((button) => button.dataset.mode);
      if (supportedModes.join("|") !== currentModes.join("|"))
        modeGroup.innerHTML = this._airModeButtons(
          supportedModes,
          state?.state,
          available,
          this._busy(id),
        );
      modeGroup.hidden = supportedModes.length === 0;
      for (const button of modeGroup.querySelectorAll(
        '[data-action="air-mode"]',
      )) {
        button.disabled = !available || this._busy(id);
        button.title = available
          ? button.getAttribute("aria-label")
          : "Режим тимчасово недоступний";
        button.setAttribute(
          "aria-pressed",
          String(state?.state === button.dataset.mode),
        );
      }
    }
    const fanGroup = panel.querySelector("[data-air-fan-speeds]"),
      fanModes = a.fan_modes || [];
    if (fanGroup) {
      const currentModes = Array.from(
        fanGroup.querySelectorAll('[data-action="air-fan-mode"]'),
      ).map((button) => button.dataset.mode);
      const orderedModes = [
        "auto",
        "quiet",
        "low",
        "medium_low",
        "medium",
        "medium_high",
        "high",
        "turbo",
      ].filter((mode) => fanModes.includes(mode));
      if (orderedModes.join("|") !== currentModes.join("|"))
        fanGroup.innerHTML = this._airFanButtons(
          fanModes,
          a.fan_mode,
          available,
          this._busy(id),
        );
      fanGroup.hidden = orderedModes.length === 0;
      for (const button of fanGroup.querySelectorAll(
        '[data-action="air-fan-mode"]',
      )) {
        button.disabled = !available || this._busy(id);
        button.title = available
          ? button.getAttribute("aria-label")
          : "Вентилятор тимчасово недоступний";
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.mode === a.fan_mode),
        );
      }
    }
    this._setText(
      '[data-live="air-fan-speed"]',
      this._fanLabel(a.fan_mode) || "—",
      panel,
    );
    this._updateAirSwing(panel, a, available);
    for (const [key] of HOME_DEVICE_CARD_FIELDS.air) {
      if (key === "air_entity") continue;
      const entity = this._config[key];
      const button =
        entity &&
        panel.querySelector(
          `[data-action="feature"][data-entity="${this._escape(entity)}"]`,
        );
      if (!button) continue;
      const feature = this._state(entity);
      const label =
        HOME_DEVICE_CARD_FIELDS.air.find((field) => field[0] === key)?.[1] ||
        key;
      button.hidden = !feature;
      button.disabled = !this._available(entity) || this._busy(entity);
      button.title =
        feature && !this._available(entity)
          ? `${label}: тимчасово недоступно`
          : label;
      button.setAttribute("aria-pressed", String(feature?.state === "on"));
      button.setAttribute("aria-label", button.title);
    }
  }

  _updateAirSwing(panel, attributes, available) {
    const modes = attributes.swing_modes || [],
      fixedModes = this._fixedSwingModes(modes),
      current = attributes.swing_mode;
    const fullMode = this._swingOption(modes, "swing_full"),
      defaultMode = this._swingOption(modes, "default");
    const toggle = panel.querySelector('[data-action="air-swing-toggle"]'),
      paletteButton = panel.querySelector('[data-action="air-swing-palette"]');
    const palette = panel.querySelector("[data-air-fixed-palette]"),
      busy = this._busy(this._airId());
    if (toggle) {
      toggle.hidden = !fullMode || !defaultMode;
      toggle.disabled = !available || !fullMode || !defaultMode || busy;
      toggle.title = available ? "Рух жалюзі" : "Жалюзі тимчасово недоступні";
      toggle.setAttribute(
        "aria-pressed",
        String(
          String(current || "")
            .toLowerCase()
            .startsWith("swing"),
        ),
      );
    }
    if (paletteButton) {
      paletteButton.hidden = !fixedModes.length;
      paletteButton.disabled = !available || !fixedModes.length || busy;
      paletteButton.title = available
        ? "Фіксований кут жалюзі"
        : "Жалюзі тимчасово недоступні";
      paletteButton.setAttribute(
        "aria-pressed",
        String(
          String(current || "")
            .toLowerCase()
            .startsWith("fixed") || this._airFixedPaletteOpen,
        ),
      );
      paletteButton.setAttribute(
        "aria-expanded",
        String(!!this._airFixedPaletteOpen),
      );
      const position = String(current || "")
        .toLowerCase()
        .startsWith("fixed")
        ? this._fixedSwingPosition(current)
        : 2;
      const icon = paletteButton.querySelector(".air-swing-main-icon");
      if (icon && icon.dataset.position !== String(position)) {
        icon.dataset.position = String(position);
        icon.innerHTML = this._fixedAngleIcon(position);
      }
    }
    if (!palette) return;
    const currentModes = Array.from(
      palette.querySelectorAll('[data-action="air-fixed-position"]'),
    ).map((button) => button.dataset.mode);
    if (fixedModes.join("|") !== currentModes.join("|"))
      palette.innerHTML = this._fixedSwingButtons(
        fixedModes,
        current,
        available,
        busy,
      );
    palette.hidden = !this._airFixedPaletteOpen || !fixedModes.length;
    const secondRow = panel.querySelector(".air-unified-second");
    if (secondRow) secondRow.hidden = !palette.hidden;
    const swingGroup = panel.querySelector(".air-swing-main");
    if (swingGroup)
      swingGroup.hidden =
        (!toggle || toggle.hidden) && (!paletteButton || paletteButton.hidden);
    for (const button of palette.querySelectorAll(
      '[data-action="air-fixed-position"]',
    )) {
      button.disabled = !available || busy;
      if (!available) button.title = "Положення жалюзі тимчасово недоступне";
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.mode === current),
      );
    }
  }

  _updateTemperatureFeedback() {
    const entity = this._airId();
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
      this._airId(),
      ...HOME_DEVICE_CARD_FIELDS.air
        .filter((field) => field[0] !== "air_entity")
        .map(([name]) => this._config[name]),
    ];
    if (
      all ||
      sources.some(has) ||
      (serviceEntity && sources.includes(serviceEntity))
    )
      this._updateAir();
    return { temperatureFeedback: true };
  }
  _handleCardClick(button) {
    if (button?.dataset.action === "air-fan-mode") {
      const entity = this._airId(),
        state = this._state(entity),
        mode = button.dataset.mode;
      if (
        !button.disabled &&
        this._available(entity) &&
        (state?.attributes?.fan_modes || []).includes(mode) &&
        !this._busy(entity)
      )
        this._service("climate", "set_fan_mode", {
          entity_id: entity,
          fan_mode: mode,
        });
      return true;
    }
    if (button?.dataset.action === "air-swing-palette") {
      this._airFixedPaletteOpen = !this._airFixedPaletteOpen;
      const state = this._state(this._airId());
      this._updateAirSwing(
        this.shadowRoot.querySelector('[data-live-panel="air"]'),
        state?.attributes || {},
        this._available(this._airId()),
      );
      return true;
    }
    if (
      ["air-swing-toggle", "air-fixed-position"].includes(
        button?.dataset.action,
      )
    ) {
      const entity = this._airId(),
        state = this._state(entity),
        modes = state?.attributes?.swing_modes || [];
      if (!button.disabled && this._available(entity) && !this._busy(entity)) {
        const mode =
          button.dataset.action === "air-swing-toggle"
            ? this._swingOption(
                modes,
                String(state?.attributes?.swing_mode || "")
                  .toLowerCase()
                  .startsWith("swing")
                  ? "default"
                  : "swing_full",
              )
            : this._swingOption(modes, button.dataset.mode);
        if (mode) {
          if (button.dataset.action === "air-fixed-position") {
            this._airFixedPaletteOpen = false;
            this._updateAirSwing(
              this.shadowRoot.querySelector('[data-live-panel="air"]'),
              state?.attributes || {},
              true,
            );
          }
          this._service("climate", "set_swing_mode", {
            entity_id: entity,
            swing_mode: mode,
          });
        }
      }
      return true;
    }
    return false;
  }
  _click(event) {
    if (this._handleCardClick(event.target.closest("button[data-action]")))
      return;
    super._click(event);
  }
}
if (!customElements.get("home-air-card"))
  customElements.define("home-air-card", HomeAirCard);
class HomeRoomCard extends HomeDeviceStandaloneCard {
  static get cardType() {
    return "room";
  }
  static get cardTitle() {
    return ["room_temperature_entity", "Спальня"];
  }
  _content() {
    return this._room();
  }
  _roomValue(entityKey, digits) {
    const id = this._config[entityKey];
    return this._available(id) ? this._format(this._value(id), digits) : "—";
  }

  _room() {
    const c = this._config,
      batteryId = c.battery_entity,
      battery = this._state(batteryId);
    const batteryAvailable = this._available(batteryId);
    const batteryValue = batteryAvailable ? this._number(battery.state) : null;
    const icon = (name) => this._lucideIcon(name);
    const batteryHtml = batteryId
      ? '<span class="room-battery" data-live="room-battery" ' +
        (batteryAvailable ? "" : "hidden") +
        ">" +
        icon("battery-medium") +
        "<span>" +
        (batteryValue === null ? "—" : this._format(batteryValue, 0) + "%") +
        "</span></span>"
      : "";
    return (
      '<article class="room-sensor-card" data-live-panel="room" aria-label="Температура та вологість">' +
      '<header class="room-header"><span class="room-icon">' +
      icon("thermometer") +
      '</span><div class="room-heading"><h2>' +
      this._escape(c.title || "Спальня") +
      '</h2><span class="secondary">Температура та вологість</span></div>' +
      batteryHtml +
      "</header>" +
      '<div class="room-readings"><div class="room-reading"><span class="secondary">' +
      icon("thermometer") +
      this._escape(c.room_temperature_label || "Температура") +
      '</span><div class="metric-value"><span data-live="room-temperature">' +
      this._roomValue("room_temperature_entity", 1) +
      "</span><small>°C</small></div></div>" +
      '<div class="room-reading"><span class="secondary">' +
      icon("droplets") +
      this._escape(c.humidity_label || "Вологість") +
      '</span><div class="metric-value"><span data-live="room-humidity">' +
      this._roomValue("humidity_entity", 0) +
      "</span><small>%</small></div></div></div>" +
      "</article>"
    );
  }

  _updateRoom() {
    for (const key of ["room-temperature", "room-humidity"]) {
      const value = this._roomValue(
        key === "room-temperature"
          ? "room_temperature_entity"
          : "humidity_entity",
        1,
      );
      this.shadowRoot
        .querySelector(`[data-live="${key}"]`)
        ?.parentElement?.classList.toggle("room-missing", value === "—");
    }
    this._setText(
      '[data-live="room-temperature"]',
      this._roomValue("room_temperature_entity", 1),
    );
    this._setText(
      '[data-live="room-humidity"]',
      this._roomValue("humidity_entity", 0),
    );
    const batteryId = this._config.battery_entity,
      battery = this._state(batteryId);
    const available = this._available(batteryId),
      value = available ? this._number(battery.state) : null;
    this._setHidden('[data-live="room-battery"]', !batteryId || !available);
    this._setText(
      '[data-live="room-battery"] span',
      value === null ? "—" : this._format(value, 0) + "%",
    );
  }
  _updateCardDynamic({ all, has }) {
    const sources = [
      this._config.room_temperature_entity,
      this._config.humidity_entity,
      this._config.battery_entity,
    ];
    if (all || sources.some(has)) this._updateRoom();
  }
}
if (!customElements.get("home-room-card"))
  customElements.define("home-room-card", HomeRoomCard);
class HomeSocketCard extends HomeDeviceStandaloneCard {
  static get cardType() {
    return "socket";
  }
  static get cardTitle() {
    return ["switch_entity", "Розетка"];
  }
  _content() {
    return this._socket();
  }
  _socketReading(key, digits = 1, conversion = null) {
    const id = this._config[key],
      state = this._state(id);
    let value = this._available(id) ? this._number(state.state) : null;
    const unit = String(state?.attributes?.unit_of_measurement || "")
      .trim()
      .toLowerCase();
    if (
      value !== null &&
      conversion === "power" &&
      ["kw", "kilowatt", "kilowatts"].includes(unit)
    )
      value *= 1000;
    if (
      value !== null &&
      conversion === "voltage" &&
      ["mv", "millivolt", "millivolts"].includes(unit)
    )
      value /= 1000;
    if (
      value !== null &&
      conversion === "current" &&
      ["ma", "milliamp", "milliamps"].includes(unit)
    )
      value /= 1000;
    if (
      value !== null &&
      conversion === "energy" &&
      ["wh", "watt-hour", "watt hours"].includes(unit)
    )
      value /= 1000;
    return value === null ? "—" : this._format(value, digits);
  }

  _socket() {
    const c = this._config,
      state = this._state(c.switch_entity);
    const available = this._available(c.switch_entity),
      on = available && state.state === "on";
    const pending = !!this._socketPending,
      icon = (name) => this._lucideIcon(name);
    return (
      '<article class="socket-card" data-live-panel="socket" aria-label="Розетка">' +
      '<header class="socket-header"><span class="socket-icon">' +
      icon("plug") +
      '</span><div class="socket-heading"><h2>' +
      this._escape(c.title || "Розетка") +
      '</h2><span class="secondary" data-live="socket-status">' +
      (pending
        ? "Очікує підтвердження"
        : on
          ? "Увімкнено"
          : available
            ? "Вимкнено"
            : "Недоступна") +
      '</span></div><button class="socket-power-button" data-action="socket-toggle" data-pending="' +
      pending +
      '" aria-label="' +
      (on ? "Вимкнути" : "Увімкнути") +
      ' розетку" aria-pressed="' +
      on +
      '" aria-busy="' +
      pending +
      '" ' +
      this._disabled(!available || pending, c.switch_entity) +
      '><span class="socket-spinner" aria-hidden="true"></span>' +
      icon("power") +
      "</button></header>" +
      '<div class="socket-reading"><div class="metric-value"><span data-live="socket-power">' +
      this._socketReading("power_entity", 0, "power") +
      '</span><small data-live="socket-power-unit">Вт</small></div><span class="secondary">Поточне споживання</span></div>' +
      '<div class="socket-metrics"><div><span class="secondary">' +
      icon("zap") +
      'Напруга</span><strong><span data-live="socket-voltage">' +
      this._socketReading("voltage_entity", 1, "voltage") +
      '</span><small data-live="socket-voltage-unit">В</small></strong></div>' +
      '<div><span class="secondary">' +
      icon("activity") +
      'Струм</span><strong><span data-live="socket-current">' +
      this._socketReading("current_entity", 2, "current") +
      "</span><small>А</small></strong></div>" +
      '<div><span class="secondary">' +
      icon("chart-no-axes-column") +
      this._escape(c.energy_label || "Енергія") +
      '</span><strong><span data-live="socket-energy">' +
      this._socketReading("energy_daily_entity", 2, "energy") +
      "</span><small>кВт·год</small></strong></div></div></article>"
    );
  }

  _updateSocket() {
    const entity = this._config.switch_entity,
      state = this._state(entity);
    const available = this._available(entity),
      on = available && state.state === "on";
    if (
      this._socketPending &&
      this._socketPending.entity === entity &&
      available &&
      on === this._socketPending.on
    ) {
      clearTimeout(this._socketPending.timer);
      this._socketPending = null;
    }
    const pending = !!this._socketPending;
    const button = this.shadowRoot.querySelector(
      '[data-action="socket-toggle"]',
    );
    this._setText(
      '[data-live="socket-status"]',
      pending
        ? "Очікує підтвердження"
        : on
          ? "Увімкнено"
          : available
            ? "Вимкнено"
            : "Недоступна",
    );
    if (button) {
      button.disabled = !available || pending || this._busy(entity);
      button.setAttribute("aria-pressed", String(on));
      button.setAttribute("aria-busy", String(pending));
      button.setAttribute(
        "aria-label",
        (on ? "Вимкнути" : "Увімкнути") + " розетку",
      );
      button.dataset.pending = String(pending);
    }
    const values = [
      [
        '[data-live="socket-power"]',
        this._socketReading("power_entity", 0, "power"),
        ".socket-reading .metric-value",
      ],
      [
        '[data-live="socket-voltage"]',
        this._socketReading("voltage_entity", 1, "voltage"),
        ".socket-metrics>div:nth-child(1) strong",
      ],
      [
        '[data-live="socket-current"]',
        this._socketReading("current_entity", 2, "current"),
        ".socket-metrics>div:nth-child(2) strong",
      ],
      [
        '[data-live="socket-energy"]',
        this._socketReading("energy_daily_entity", 2, "energy"),
        ".socket-metrics>div:nth-child(3) strong",
      ],
    ];
    for (const [selector, value, parent] of values) {
      this._setText(selector, value);
      const reading = this.shadowRoot.querySelector(parent);
      reading?.classList.toggle("socket-missing", value === "—");
      reading?.querySelector("small")?.toggleAttribute("hidden", value === "—");
    }
  }

  async _toggleSocket() {
    const entity = this._config.switch_entity;
    if (!this._available(entity) || this._busy(entity) || this._socketPending)
      return;
    const generation = this._generation;
    const on = this._state(entity).state !== "on";
    this._error = "";
    this._setHidden('[data-live="error"]', true);
    const pending = { entity, on, timer: null };
    this._socketPending = pending;
    this._updateSocket();
    pending.timer = setTimeout(() => {
      if (this._socketPending !== pending) return;
      this._socketPending = null;
      this._error =
        (this._state(entity)?.attributes?.friendly_name || entity) +
        " не підтвердив зміну стану за 15 секунд.";
      this._updateSocket();
      this._setText('[data-live="error"]', this._error);
      this._setHidden('[data-live="error"]', false);
    }, 15000);
    try {
      await this._hass.callService("switch", on ? "turn_on" : "turn_off", {
        entity_id: entity,
      });
      if (generation === this._generation) this._updateSocket();
    } catch (error) {
      if (generation !== this._generation) return;
      if (this._socketPending === pending) {
        clearTimeout(pending.timer);
        this._socketPending = null;
      }
      this._error = error?.message || "Не вдалося змінити стан розетки.";
      this._updateSocket();
      this._setText('[data-live="error"]', this._error);
      this._setHidden('[data-live="error"]', false);
    }
  }
  _updateCardDynamic({ all, has }) {
    const sources = HOME_DEVICE_CARD_FIELDS.socket.map(
      ([name]) => this._config[name],
    );
    if (all || sources.some(has)) this._updateSocket();
  }
  _handleCardClick(button) {
    if (button?.dataset.action !== "socket-toggle") return false;
    this._toggleSocket();
    return true;
  }
  _click(event) {
    if (this._handleCardClick(event.target.closest("button[data-action]")))
      return;
    super._click(event);
  }
}
if (!customElements.get("home-socket-card"))
  customElements.define("home-socket-card", HomeSocketCard);
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
class HomeBatteryCard extends HomeDeviceStandaloneCard {
  static get cardType() {
    return "battery";
  }
  _content() {
    return this._batteryDetails();
  }
  _batteryDetails() {
    const online = this._state(this._config.river_status)?.state === "online";
    const read = (entity, unit, digits = 1, positive = false) => {
      const value = this._value(this._config[entity]);
      return online && value !== null && (!positive || value > 0)
        ? this._format(value, digits) + (unit ? ` ${unit}` : "")
        : "—";
    };
    const sections = [
      [
        "Основна батарея",
        "main",
        [
          ["Заряд", "level_entity", "%", 1],
          ["Повна ємність", "full_entity", "мА·год", 0, true],
          ["Залишкова ємність", "remain_entity", "мА·год", 0],
          ["Напруга батареї", "volts_entity", "В", 3, true],
          ["Струм батареї", "current_entity", "мА", 0],
          [
            "Комірки · мін. / макс.",
            ["min_cells_entity", "max_cells_entity"],
            "В",
            3,
            true,
          ],
          [
            "Температури · мін. / макс.",
            ["min_temperature_entity", "max_temperature_entity"],
            "°C",
            1,
          ],
          ["Цикли", "cycles_entity", "", 0],
        ],
      ],
      [
        "Додаткова батарея",
        "slave",
        [
          ["Заряд", "level_entity", "%", 1],
          ["Повна ємність", "full_entity", "мА·год", 0, true],
          ["Залишкова ємність", "remain_entity", "мА·год", 0],
          ["Напруга батареї", "volts_entity", "В", 3, true],
          ["Струм батареї", "current_entity", "мА", 0],
          [
            "Комірки · мін. / макс.",
            ["min_cells_entity", "max_cells_entity"],
            "В",
            3,
            true,
          ],
          [
            "Температури · мін. / макс.",
            ["min_temperature_entity", "max_temperature_entity"],
            "°C",
            1,
          ],
          ["Цикли", "cycles_entity", "", 0],
        ],
      ],
    ];
    const rows = sections
      .map(
        ([title, prefix, fields]) =>
          `<article class="panel"><h2>${title}</h2>${fields
            .map(([label, field, unit, digits, positive]) => {
              const entity = (name) => `${prefix}_${name}`;
              const value = Array.isArray(field)
                ? field
                    .map((name) => read(entity(name), unit, digits, positive))
                    .join(" / ")
                : read(entity(field), unit, digits, positive);
              const key = `battery-${prefix}-${label === "Заряд" ? "level" : label === "Повна ємність" ? "full" : label === "Залишкова ємність" ? "remain" : label === "Напруга батареї" ? "volts" : label === "Струм батареї" ? "current" : label.startsWith("Комірки") ? "cells" : label.startsWith("Температури") ? "temps" : "cycles"}`;
              return this._row(label, value, key);
            })
            .join("")}</article>`,
      )
      .join("");
    return `<article class="panel" data-live="river-offline-note" ${online ? "hidden" : ""}><p class="notice">Станція офлайн. Поточні вимірювання приховані; попередні записи доступні на графіках.</p></article>${rows}<div class="graph-slot" data-graph="river-current"></div><div class="graph-slot" data-graph="river-cells"></div>`;
  }

  _updateBattery() {
    const online = this._state(this._config.river_status)?.state === "online";
    const read = (entity, unit, digits = 1, positive = false) => {
      const value = this._value(this._config[entity]);
      return online && value !== null && (!positive || value > 0)
        ? this._format(value, digits) + (unit ? ` ${unit}` : "")
        : "—";
    };
    const values = {};
    for (const prefix of ["main", "slave"]) {
      values[`battery-${prefix}-level`] = read(`${prefix}_level_entity`, "%");
      values[`battery-${prefix}-full`] = read(
        `${prefix}_full_entity`,
        "мА·год",
        0,
        true,
      );
      values[`battery-${prefix}-remain`] = read(
        `${prefix}_remain_entity`,
        "мА·год",
        0,
      );
      values[`battery-${prefix}-volts`] = read(
        `${prefix}_volts_entity`,
        "В",
        3,
        true,
      );
      values[`battery-${prefix}-current`] = read(
        `${prefix}_current_entity`,
        "мА",
        0,
      );
      values[`battery-${prefix}-cells`] =
        `${read(`${prefix}_min_cells_entity`, "В", 3, true)} / ${read(`${prefix}_max_cells_entity`, "В", 3, true)}`;
      values[`battery-${prefix}-temps`] =
        `${read(`${prefix}_min_temperature_entity`, "°C")} / ${read(`${prefix}_max_temperature_entity`, "°C")}`;
      values[`battery-${prefix}-cycles`] = read(
        `${prefix}_cycles_entity`,
        "",
        0,
      );
    }
    for (const [key, value] of Object.entries(values))
      this._setText(`[data-live="${key}"]`, value);
    this._setHidden('[data-live="river-offline-note"]', online);
  }
  _updateCardDynamic({ all, has }) {
    const sources = [
      this._config.river_status,
      ...HOME_DEVICE_CARD_FIELDS.battery
        .filter((field) => field[2] === "sensor")
        .map(([id]) => this._config[id]),
    ];
    if (all || sources.some(has)) this._updateBattery();
  }
}
if (!customElements.get("home-battery-card"))
  customElements.define("home-battery-card", HomeBatteryCard);
window.customCards = window.customCards || [];
for (const [type, name, description] of Object.values(HOME_DEVICE_CARD_META)) {
  if (!window.customCards.some(card => card.type === type)) window.customCards.push({ type, name, description });
}

});
