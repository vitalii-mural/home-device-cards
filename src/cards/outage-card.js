class HomeOutageCard extends HomeDeviceStandaloneCard {
  constructor() {
    super();
    this._outageDay = "today";
    this._outageTimer = null;
  }

  static get cardType() {
    return "outage";
  }

  static get cardTitle() {
    return ["outage_entity", "Графік відключень"];
  }

  getCardSize() {
    return 5;
  }

  _content() {
    return `<article class="panel outage-card" aria-label="Графік відключень">
      <header class="outage-header"><h2>Графік відключень</h2><span class="outage-group" data-live="outage-group">—</span></header>
      <div class="outage-status" data-live="outage-status" data-status="unknown" aria-live="polite">Виберіть сутність графіка</div>
      <p class="secondary outage-countdown" data-live="outage-countdown" hidden></p>
      <div class="outage-change" data-live="outage-change" aria-live="polite" hidden><strong data-live="change-title">Графік змінився</strong><span class="outage-change-date" data-live="change-date"></span><div class="outage-comparison" data-live="change-comparison"></div></div>
      <div class="outage-source-warning" data-live="source-warning" role="status" hidden>Джерело графіка зараз не відповідає. Показано останній відомий графік.</div>
      <div class="outage-tabs" role="group" aria-label="День графіка"><button type="button" aria-pressed="true" data-action="outage-day" data-day="today">Сьогодні</button><button type="button" aria-pressed="false" data-action="outage-day" data-day="tomorrow">Завтра</button></div>
      <p class="outage-date" data-live="outage-date"></p>
      <div class="outage-ticks" aria-hidden="true"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div><div class="outage-track" data-live="outage-track" role="img" aria-label="Графік ще не завантажено"></div>
      <div class="outage-legend"><span><i class="outage-key outage-key-off"></i>За графіком без світла</span><span><i class="outage-key outage-key-possible"></i>Можливе відключення</span><span><i class="outage-key outage-key-changed"></i>Зміни</span></div>
      <div class="outage-intervals" data-live="outage-intervals" aria-live="polite"></div>
      <footer class="outage-footer"><span data-live="outage-updated"></span></footer>
    </article>`;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this._hass && !this._outageTimer) {
      this._outageTimer = setInterval(() => this._tickOutageClock(), 30000);
    }
  }

  disconnectedCallback() {
    if (this._outageTimer) clearInterval(this._outageTimer);
    this._outageTimer = null;
    super.disconnectedCallback?.();
  }

  setConfig(config) {
    if (this._config) {
      const keys = HOME_DEVICE_CARD_FIELDS.outage.map(([name]) => name);
      if (keys.some((name) => config?.[name] !== this._config[name])) {
        const eventId = config?.schedule_event;
        const eventState = eventId ? this._hass?.states?.[eventId] : null;
        this._ignoredScheduleEvent = `${eventId || ""}|${JSON.stringify(eventState)}`;
      }
      if (config?.outage_entity !== this._config.outage_entity) this._outageDay = "today";
    }
    super.setConfig(config);
  }

  _scheduleEventState() {
    const eventId = this._config?.schedule_event;
    const eventState = this._state(eventId);
    const signature = `${eventId || ""}|${JSON.stringify(eventState)}`;
    if (this._ignoredScheduleEvent === signature) return null;
    this._ignoredScheduleEvent = null;
    return eventState;
  }

  _click(event) {
    const button = event.target.closest('button[data-action="outage-day"]');
    if (button) {
      this._outageDay = button.dataset.day === "tomorrow" ? "tomorrow" : "today";
      this._updateOutageView();
      return;
    }
    super._click(event);
  }

  _updateCardDynamic() {
    this._updateOutageView();
    if (this.isConnected && !this._outageTimer) {
      this._outageTimer = setInterval(() => this._tickOutageClock(), 30000);
    }
  }

  _kyivDate(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Kyiv",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${value.year}-${value.month}-${value.day}`;
  }

  _dayOffset(date, offset) {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day + offset)).toISOString().slice(0, 10);
  }

  _intervals(value) {
    return Array.isArray(value) ? value.filter((item) => typeof item === "string" && /^\d{2}:\d{2}–\d{2}:\d{2}$/.test(item)) : null;
  }

  _formatDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return "";
    const [year, month, day] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
  }

  _renderIntervals(intervals, possible, changed, previous, previousPossible, published = true) {
    const regular = intervals || [];
    const uncertain = possible || [];
    const changedSet = new Set(changed || []);
    const all = [...regular.map((value) => ({ value, possible: false })), ...uncertain.map((value) => ({ value, possible: true }))];
    const list = this.shadowRoot.querySelector('[data-live="outage-intervals"]');
    const track = this.shadowRoot.querySelector('[data-live="outage-track"]');
    if (!list || !track) return;
    list.replaceChildren();
    const slots = Array.from({ length: 48 }, () => ({ current: "none", previous: "none" }));
    const fill = (values, kind, key) => {
      for (const value of values || []) {
        const [from, to] = value.split("–").map((time) => {
          const [hours, minutes] = time.split(":").map(Number);
          return hours * 60 + minutes;
        });
        const start = Math.max(0, Math.min(48, Math.floor(from / 30)));
        const end = Math.max(start, Math.min(48, Math.ceil(to / 30)));
        for (let i = start; i < end; i++) {
          if (slots[i][key] === "none" || kind === "off") slots[i][key] = kind;
        }
      }
    };
    fill(regular, "off", "current");
    fill(uncertain, "possible", "current");
    fill(previous, "off", "previous");
    fill(previousPossible, "possible", "previous");
    if (!published) slots.forEach((slot) => { slot.current = "unknown"; slot.previous = "unknown"; });
    for (const { value, possible: maybe } of all) {
      const row = document.createElement("span");
      row.className = `outage-interval${maybe ? " is-possible" : ""}${changedSet.has(value) ? " is-changed" : ""}`;
      row.textContent = `${maybe ? "Можливе · " : ""}${value}${changedSet.has(value) ? " · зміна" : ""}`;
      list.append(row);
    }
    if (track.children.length !== 48) {
      track.replaceChildren(...Array.from({ length: 48 }, () => {
        const cell = document.createElement("span");
        cell.className = "outage-cell";
        cell.setAttribute("aria-hidden", "true");
        return cell;
      }));
    }
    for (const [index, slot] of slots.entries()) {
      const cell = track.children[index];
      const changed = slot.current !== slot.previous;
      cell.className = `outage-cell${slot.current === "none" ? "" : ` is-${slot.current}`}${changed ? " is-changed" : ""}`;
    }
    const summary = all.length ? all.map(({ value, possible: maybe }) => `${maybe ? "можливе відключення" : "відключення"} ${value}`).join(", ") : "За графіком відключень немає";
    track.setAttribute("aria-label", summary);
  }

  _renderChange(eventState, date, today) {
    const panel = this.shadowRoot.querySelector('[data-live="outage-change"]');
    if (!panel) return;
    const attrs = eventState?.attributes || {};
    const type = attrs.event_type;
    const eventDate = attrs.date;
    const relevantDate = eventDate === date;
    const fresh = eventDate === today || eventDate === this._dayOffset(today, 1);
    const previous = this._intervals(attrs.previous);
    const current = this._intervals(attrs.outages);
    const previousPossible = this._intervals(attrs.previous_possible);
    const currentPossible = this._intervals(attrs.possible);
    const changedForGroup = type === "schedule_changed" && (
      (previous && current && JSON.stringify(previous) !== JSON.stringify(current)) ||
      (previousPossible && currentPossible && JSON.stringify(previousPossible) !== JSON.stringify(currentPossible))
    );
    panel.hidden = !relevantDate || !fresh || !changedForGroup;
    if (panel.hidden) return;
    this._setText('[data-live="change-title"]', "Графік змінився для цієї групи");
    this._setText('[data-live="change-date"]', this._formatDate(eventDate));
    const comparison = this.shadowRoot.querySelector('[data-live="change-comparison"]');
    comparison.replaceChildren();
    const regularChanged = previous && current && JSON.stringify(previous) !== JSON.stringify(current);
    const possibleChanged = previousPossible && currentPossible && JSON.stringify(previousPossible) !== JSON.stringify(currentPossible);
    const rows = [
      ...(regularChanged ? [{ label: "Було", values: previous }, { label: "Стало", values: current }] : []),
      ...(possibleChanged ? [{ label: "Можливі · було", values: previousPossible }, { label: "Можливі · стало", values: currentPossible }] : []),
    ];
    for (const row of rows) {
      const label = document.createElement("span"); label.className = "outage-change-label"; label.textContent = row.label;
      const values = document.createElement("strong"); values.className = "outage-change-values"; values.textContent = row.values.length ? row.values.join(", ") : "Немає";
      comparison.append(label, values);
    }
  }

  _updateOutageView() {
    if (!this.shadowRoot || !this._config) return;
    const today = this._kyivDate();
    this._outageRenderedDate = today;
    const date = this._outageDay === "tomorrow" ? this._dayOffset(today, 1) : today;
    const state = this._state(this._config.outage_entity);
    const attrs = state?.attributes || {};
    const schedule = this._intervals(attrs[this._outageDay]);
    const possible = this._intervals(attrs[`${this._outageDay}_possible`]) || [];
    const group = attrs.group;
    this._setText('[data-live="outage-group"]', group ? `Група ${group}` : "Група —");
    const todaySchedule = this._intervals(attrs.today);
    const outageStatus = !state || ["unknown", "unavailable"].includes(state.state) || !["on", "off"].includes(state.state) || todaySchedule === null
      ? "unknown" : state.state === "on" ? "outage" : "available";
    this.shadowRoot.querySelector('[data-live="outage-status"]')?.setAttribute("data-status", outageStatus);
    this._setText('[data-live="outage-status"]', outageStatus === "unknown"
      ? "Немає даних про графік"
      : outageStatus === "outage" ? "За графіком зараз відключення" : "За графіком зараз світло має бути");
    this._setText('[data-live="outage-date"]', this._formatDate(date));
    for (const button of this.shadowRoot.querySelectorAll('[data-action="outage-day"]')) {
      const selected = button.dataset.day === this._outageDay;
      button.setAttribute("aria-selected", String(selected));
      button.setAttribute("aria-pressed", String(selected));
    }
    const intervals = schedule || [];
    const eventState = this._scheduleEventState();
    const eventMatchesDay = eventState?.attributes?.date === date;
    const validChange = eventMatchesDay && eventState.attributes.event_type === "schedule_changed";
    const previousRegular = validChange ? this._intervals(eventState.attributes.previous) : null;
    const previousPossible = validChange ? this._intervals(eventState.attributes.previous_possible) : null;
    const currentRegular = this._intervals(eventState?.attributes?.outages);
    const currentPossible = this._intervals(eventState?.attributes?.possible);
    const changedRegular = validChange && previousRegular && currentRegular && JSON.stringify(previousRegular) !== JSON.stringify(currentRegular)
      ? currentRegular : [];
    const changedPossible = validChange && previousPossible && currentPossible && JSON.stringify(previousPossible) !== JSON.stringify(currentPossible)
      ? currentPossible : [];
    const changed = [...changedRegular, ...changedPossible];
    const outageUpdated = this._state(this._config.outage_entity)?.last_reported || this._state(this._config.outage_entity)?.last_updated;
    const outageUpdatedDate = outageUpdated ? this._kyivDate(new Date(outageUpdated)) : today;
    const staleSchedule = !!state && outageUpdatedDate !== today;
    const scheduleForView = staleSchedule ? null : schedule;
    const displayedIntervals = scheduleForView || [];
    const displayedPossible = staleSchedule || scheduleForView === null ? [] : possible;
    this._renderIntervals(displayedIntervals, displayedPossible, changed, previousRegular || displayedIntervals, previousPossible || displayedPossible, scheduleForView !== null && !staleSchedule);
    const intervalList = this.shadowRoot.querySelector('[data-live="outage-intervals"]');
    if (intervalList && scheduleForView === null) {
      intervalList.textContent = staleSchedule ? "Графік на сьогодні ще не оновився" : "Графік на цей день ще не опубліковано";
      this.shadowRoot.querySelector('[data-live="outage-track"]')?.setAttribute("aria-label", staleSchedule ? "Графік на сьогодні ще не оновився" : "Графік ще не опубліковано");
    } else if (intervalList && !intervals.length && !possible.length) {
      intervalList.textContent = "За графіком відключень немає";
    }
    this._renderChange(eventState, date, today);
    const source = this._state(this._config.source_entity);
    const sourceUnavailable = !!this._config.source_entity && (!source || source.state !== "on" || ["unknown", "unavailable"].includes(source.state));
    this._setHidden('[data-live="source-warning"]', !sourceUnavailable);
    const updated = this._state(this._config.updated_entity)?.state;
    const updatedDate = updated && updated !== "unknown" && updated !== "unavailable" ? new Date(updated) : null;
    this._setText('[data-live="outage-updated"]', updatedDate && Number.isFinite(updatedDate.getTime())
      ? `Графік оновлено · ${new Intl.DateTimeFormat("uk-UA", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Kyiv" }).format(updatedDate)}`
      : "Оновлення графіка невідоме");
    this._updateOutageCountdown();
  }

  _updateOutageCountdown() {
    if (!this._config || !this.shadowRoot) return;
    const countdown = this.shadowRoot.querySelector('[data-live="outage-countdown"]');
    if (!countdown) return;
    const outage = this._state(this._config.outage_entity);
    const status = outage?.state;
    if (!outage || ["unknown", "unavailable"].includes(status) || !["on", "off"].includes(status) || this._intervals(outage.attributes?.today) === null) { countdown.hidden = true; return; }
    const targetId = status === "on" ? this._config.power_back_entity : this._config.next_outage_entity;
    const target = this._state(targetId)?.state;
    const timestamp = target && !["unknown", "unavailable"].includes(target) ? Date.parse(target) : NaN;
    if (!Number.isFinite(timestamp)) { countdown.hidden = true; return; }
    const minutes = Math.max(0, Math.ceil((timestamp - Date.now()) / 60000));
    if (minutes === 0) { countdown.hidden = true; return; }
    const hours = Math.floor(minutes / 60), remainder = minutes % 60;
    const label = status === "on" ? "До повернення світла за графіком" : "До відключення за графіком";
    const time = new Intl.DateTimeFormat("uk-UA", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Kyiv" }).format(timestamp);
    countdown.textContent = `${label} · ${hours ? `${hours} год ` : ""}${remainder} хв · о ${time}`;
    countdown.hidden = false;
  }

  _tickOutageClock() {
    if (!this.isConnected) return;
    if (this._outageRenderedDate !== this._kyivDate()) this._updateOutageView();
    else this._updateOutageCountdown();
  }
}

if (!customElements.get("home-outage-card")) customElements.define("home-outage-card", HomeOutageCard);
