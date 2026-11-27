class HomeLightCard extends HomeDeviceStandaloneCard {
  static get cardType() { return 'light'; }
  static get cardTitle() { return ['switch_entity', 'Підсвітка']; }

  _content() {
    return `<style>
      .light-card{position:relative;display:grid;grid-template-columns:42px minmax(0,1fr) 48px;align-items:center;gap:10px;padding:12px 14px;border:1px solid var(--k-line);border-radius:18px;background:var(--k-card)}
      .light-card .device-icon{width:42px;height:42px;border-radius:13px}
      .light-card .device-icon svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .light-card[data-on="true"] .device-icon{background:var(--k-warm-bg);color:var(--k-warm)}
      .light-card h2{font-weight:650;overflow-wrap:anywhere}
      .light-card .secondary{font-size:13px}
      .light-history{position:absolute;inset:0;width:100%;height:100%;background:transparent;border-radius:18px}.light-history:focus-visible{outline-offset:-3px}
      .light-toggle{position:relative;z-index:1;display:grid;place-items:center;min-height:44px;background:transparent;padding:0}
      .light-toggle span{display:flex;align-items:center;width:38px;height:22px;padding:2px 3px;border:1px solid var(--k-line);border-radius:99px;background:var(--k-soft)}
      .light-toggle span::before{content:"";width:16px;height:16px;border-radius:50%;background:var(--k-muted)}
      .light-toggle[aria-checked="true"] span{justify-content:flex-end;background:var(--k-warm-bg);border-color:var(--k-warm)}
      .light-toggle[aria-checked="true"] span::before{background:var(--k-warm)}
    </style><article class="light-card">
      <button type="button" class="light-history" data-action="more" data-entity="${this._escape(this._config.switch_entity || '')}" aria-label="Історія підсвітки" disabled></button>
      <span class="device-icon neutral">${this._lucideIcon('lightbulb')}</span>
      <div><h2></h2><span class="secondary" data-live="light-status" aria-live="polite"></span></div>
      <button type="button" class="light-toggle" data-action="light-toggle" role="switch" aria-checked="false" aria-label="Підсвітка" disabled><span aria-hidden="true"></span></button>
    </article>`;
  }

  _updateCardDynamic({ all, has, serviceEntity }) {
    const entity = this._config.switch_entity;
    if (!all && !has(entity) && serviceEntity !== entity) return;
    const state = this._state(entity)?.state;
    const on = state === 'on';
    const available = on || state === 'off';
    const status = available ? (on ? 'Увімкнено' : 'Вимкнено')
      : (state === 'unknown' ? 'Стан невідомий' : 'Немає зв’язку');
    const card = this.shadowRoot.querySelector('.light-card');
    const button = this.shadowRoot.querySelector('.light-toggle');
    if (!card || !button) return;
    card.setAttribute('data-on', String(on));
    button.setAttribute('aria-checked', String(on));
    button.setAttribute('aria-label', this._displayName('switch_entity', this._config.title, 'Підсвітка'));
    button.disabled = !available || this._busy(entity);
    const history = this.shadowRoot.querySelector('.light-history');
    if (history) {
      history.disabled = !this._state(entity);
      history.setAttribute('aria-label', `Історія підсвітки: ${this._displayName('switch_entity', this._config.title, 'Підсвітка')}`);
    }
    this._setText('[data-live="light-status"]', status);
  }

  _click(event) {
    if (!event.target.closest('button[data-action="light-toggle"]')) return super._click(event);
    const entity = this._config.switch_entity;
    const state = this._state(entity)?.state;
    if (state === 'on' || state === 'off') {
      return this._service('switch', state === 'on' ? 'turn_off' : 'turn_on', { entity_id: entity });
    }
  }
}

if (!customElements.get('home-light-card'))
  customElements.define('home-light-card', HomeLightCard);
