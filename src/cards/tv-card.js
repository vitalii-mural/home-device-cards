class HomeTvCard extends HomeDeviceStandaloneCard {
  static get cardType() {
    return "tv";
  }

  static get cardTitle() {
    return ["remote_entity", "Телевізор"];
  }

  setConfig(config) {
    if (this._tvPending) clearTimeout(this._tvPending.timer);
    this._tvPending = null;
    super.setConfig(config);
  }

  disconnectedCallback() {
    if (this._tvPending) clearTimeout(this._tvPending.timer);
    this._tvPending = null;
    super.disconnectedCallback();
  }

  _content() {
    const command = (key, label, icon, extra = "") =>
      `<button type="button" data-action="tv-send" data-command="${key}" aria-label="${label}" title="${label}" ${extra}>${Array.isArray(icon) ? icon.map(name => this._lucideIcon(name)).join("") : icon ? this._lucideIcon(icon) : "OK"}<span class="tv-pending" aria-hidden="true"></span></button>`;
    const remote = this._state(this._config.remote_entity),
      available = this._available(this._config.remote_entity),
      isOn = available && remote.state !== "off",
      app = this._tvAppName();
    const appText = isOn && app ? ` · ${this._escape(app)}` : "";
    const status = !available
      ? "Пульт недоступний"
      : isOn
        ? `Увімкнено${appText}`
        : "Вимкнено";
    return `<style>${HOME_TV_CARD_STYLE}</style>
      <article class="tv-card" data-live-panel="tv" aria-label="Пульт Android TV">
        <header class="tv-header">
          <span class="tv-symbol">${this._lucideIcon("tv")}</span>
          <div class="tv-heading"><h2 data-live="tv-name">${this._escape(this._displayName("remote_entity", this._config.title, "Телевізор"))}</h2><span class="tv-status" data-live="tv-status" title="${this._escape(status)}">${status}</span></div>
          ${command("POWER", "Живлення", "power", `class="tv-power" aria-pressed="${isOn}"`)}
        </header>
        <div class="tv-main">
          ${command("ASSIST", "Відкрити асистента", "mic", 'class="tv-assist"')}
          <div class="tv-dpad" role="group" aria-label="Навігація">
            ${command("DPAD_UP", "Вгору", "chevron-up", 'class="tv-up"')}
            ${command("DPAD_LEFT", "Ліворуч", "chevron-left", 'class="tv-left"')}
            ${command("DPAD_CENTER", "Підтвердити", null, 'class="tv-ok"')}
            ${command("DPAD_RIGHT", "Праворуч", "chevron-right", 'class="tv-right"')}
            ${command("DPAD_DOWN", "Вниз", "chevron-down", 'class="tv-down"')}
          </div>
          <div class="tv-volume" role="group" aria-label="Гучність">
            ${command("VOLUME_UP", "Гучніше", "plus")}
            ${command("VOLUME_MUTE", "Без звуку", "volume-2")}
            ${command("VOLUME_DOWN", "Тихіше", "minus")}
          </div>
        </div>
        <div class="tv-system" role="group" aria-label="Системні кнопки">
          ${command("BACK", "Назад", "arrow-left")}
          ${command("HOME", "Додому", "circle")}
        </div>
        <div class="tv-media" role="group" aria-label="Керування відтворенням">
          ${command("MEDIA_PREVIOUS", "Попереднє", "skip-back")}
          ${command("MEDIA_PLAY_PAUSE", "Відтворення або пауза", ["play", "pause"])}
          ${command("MEDIA_NEXT", "Наступне", "skip-forward")}
        </div>
      </article>`;
  }

  _tvAppName() {
    const player = this._state(this._config.media_player_entity),
      remote = this._state(this._config.remote_entity),
      playerApp = player?.attributes?.app_name,
      activity = remote?.attributes?.current_activity;
    return typeof playerApp === "string" && playerApp.trim()
      ? playerApp.trim()
      : typeof activity === "string" && activity.trim()
        ? activity.trim()
        : "";
  }

  _updateTV() {
    const entity = this._config.remote_entity,
      remote = this._state(entity),
      available = this._available(entity),
      isOn = available && remote.state !== "off",
      pending = this._tvPending,
      app = this._tvAppName();
    const status = !available
      ? "Пульт недоступний"
      : isOn
        ? `Увімкнено${app ? ` · ${app}` : ""}`
        : "Вимкнено";
    if (!available && this._tvPending) {
      clearTimeout(this._tvPending.timer);
      this._tvPending = null;
    }
    this._setText('[data-live="tv-name"]', this._displayName("remote_entity", this._config.title, "Телевізор"));
    this._setText('[data-live="tv-status"]', status);
    const statusNode = this.shadowRoot.querySelector('[data-live="tv-status"]');
    statusNode?.setAttribute("title", status);
    for (const button of this.shadowRoot.querySelectorAll('[data-action="tv-send"]')) {
      const power = button.dataset.command === "POWER";
      button.disabled = !available || (!isOn && !power) || !!pending;
      if (power) button.setAttribute("aria-pressed", String(isOn));
      button.dataset.pending = String(pending?.command === button.dataset.command);
      button.setAttribute("aria-busy", String(pending?.command === button.dataset.command));
    }
    this._setText('[data-live="error"]', this._error);
    this._setHidden('[data-live="error"]', !this._error);
  }

  async _sendRemoteCommand(command) {
    const entity = this._config.remote_entity,
      remote = this._state(entity),
      available = this._available(entity);
    if (
      !available ||
      (remote.state === "off" && command !== "POWER") ||
      this._tvPending
    )
      return;
    this._error = "";
    const generation = this._generation,
      pending = { command, timer: null };
    this._tvPending = pending;
    this._updateTV();
    pending.timer = setTimeout(() => {
      if (this._tvPending !== pending) return;
      this._tvPending = null;
      this._error = "Home Assistant не відповів на команду за 15 секунд.";
      this._updateTV();
    }, 15000);
    try {
      await this._hass.callService("remote", "send_command", {
        entity_id: entity,
        command,
      });
      if (generation !== this._generation || this._tvPending !== pending) return;
      clearTimeout(pending.timer);
      this._tvPending = null;
      this._updateTV();
    } catch (error) {
      if (generation !== this._generation || this._tvPending !== pending) return;
      clearTimeout(pending.timer);
      this._tvPending = null;
      this._error = error?.message || "Не вдалося надіслати команду телевізору.";
      this._updateTV();
    }
  }

  _updateCardDynamic({ all, has }) {
    const entities = HOME_DEVICE_CARD_FIELDS.tv.map(([name]) => this._config[name]);
    if (all || entities.some(has)) this._updateTV();
  }

  _handleCardClick(button) {
    if (button?.dataset.action !== "tv-send") return false;
    this._sendRemoteCommand(button.dataset.command);
    return true;
  }

  _click(event) {
    if (this._handleCardClick(event.target.closest('button[data-action="tv-send"]')))
      return;
    super._click(event);
  }
}

if (!customElements.get("home-tv-card"))
  customElements.define("home-tv-card", HomeTvCard);
