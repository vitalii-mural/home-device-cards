import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const dashboardSource = await readFile(
  new URL("../home-dashboard.js", import.meta.url),
  "utf8",
);
const deviceCardsSource = await readFile(
  new URL("../home-device-cards.js", import.meta.url),
  "utf8",
);

function createEnvironment() {
  const registry = new Map();
  const timers = new Map();
  const clearedTimers = [];
  let nextTimer = 1;
  class ShadowRoot {
    addEventListener() {}
  }
  class HTMLElement {
    constructor() {
      this.shadowRoot = new ShadowRoot();
    }
    attachShadow() {
      return this.shadowRoot;
    }
    toggleAttribute() {}
    dispatchEvent(event) {
      this.lastDispatchedEvent = event;
      return true;
    }
  }
  class CustomEvent {
    constructor(type, options = {}) {
      this.type = type;
      Object.assign(this, options);
    }
  }
  class ResizeObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    disconnect() {}
  }
  const customElements = {
    define(name, constructor) {
      registry.set(name, constructor);
    },
    get(name) {
      return registry.get(name);
    },
    whenDefined() {
      return Promise.resolve();
    },
  };
  const window = { customCards: [] };
  const visibilityListeners = new Set();
  const document = {
    visibilityState: "visible",
    addEventListener(name, listener) { if (name === "visibilitychange") visibilityListeners.add(listener); },
    removeEventListener(name, listener) { if (name === "visibilitychange") visibilityListeners.delete(listener); },
  };
  const context = vm.createContext({
    HTMLElement,
    CustomEvent,
    ResizeObserver,
    customElements,
    window,
    document,
    console,
    Intl,
    Number,
    Object,
    String,
    Array,
    Map,
    Set,
    JSON,
    Math,
    Error,
    Promise,
    setTimeout(callback, delay) {
      const id = nextTimer++;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout(id) {
      clearedTimers.push(id);
      timers.delete(id);
    },
  });
  return { context, registry, timers, clearedTimers, window, document, visibilityListeners };
}

async function loadCards(bundled = false) {
  const env = createEnvironment();
  if (bundled) {
    vm.runInContext(
      await readFile(
        new URL("../dist/home-device-cards.js", import.meta.url),
        "utf8",
      ),
      env.context,
    );
  } else {
    vm.runInContext(dashboardSource, env.context);
    vm.runInContext(deviceCardsSource, env.context);
  }
  await Promise.resolve();
  await Promise.resolve();
  return env;
}

test("HACS bundle registers the same card contracts as the two manual resources", async () => {
  const manual = await loadCards();
  const bundled = await loadCards(true);
  assert.deepEqual([...bundled.registry.keys()], [...manual.registry.keys()]);
  for (const [name, Card] of manual.registry) {
    const BundledCard = bundled.registry.get(name);
    if (Card.getStubConfig) {
      assert.equal(
        JSON.stringify(BundledCard.getStubConfig()),
        JSON.stringify(Card.getStubConfig()),
        name,
      );
    }
  }
  assert.equal(
    JSON.stringify(bundled.window.customCards),
    JSON.stringify(manual.window.customCards),
  );
});

test("room card renders independent, compact 24-hour histories and caches results", async () => {
  const { registry } = await loadCards();
  const card = new (registry.get("home-room-card"))();
  const graphs = new Map();
  for (const key of ["temperature", "humidity"]) {
    const path = { value: "", setAttribute(_name, value) { this.value = value; } };
    const button = { hidden: true, setAttribute() {}, querySelector: () => path };
    graphs.set(key, { path, button });
  }
  card.shadowRoot = { querySelector: (selector) => selector.includes("temperature")
    ? graphs.get("temperature").button
    : selector.includes("humidity") ? graphs.get("humidity").button : null };
  card._config = { room_temperature_entity: "sensor.bedroom", humidity_entity: "sensor.bedroom_humidity" };
  card.isConnected = true;
  const now = Date.now();
  let calls = 0;
  card._hass = {
    callApi: async (method, request) => {
      calls++;
      assert.equal(method, "GET");
      const humidity = request.includes("sensor.bedroom_humidity");
      assert.match(request, new RegExp(humidity ? "sensor.bedroom_humidity" : "sensor.bedroom"));
      assert.match(request, /minimal_response&no_attributes/);
      return [[
        { state: "21.7", last_changed: new Date(now - 20_000).toISOString() },
        { state: "unavailable", last_changed: new Date(now - 15_000).toISOString() },
        { state: humidity ? "63" : "23.5", last_changed: new Date(now - 10_000).toISOString() },
      ]];
    },
  };

  await card._loadRoomHistory();
  assert.equal(calls, 2);
  for (const key of ["temperature", "humidity"]) {
    const graph = graphs.get(key);
    assert.equal(graph.button.hidden, false);
    assert.equal((graph.path.value.match(/M/g) || []).length, 2, "unavailable samples break the line");
  }
  await card._loadRoomHistory();
  assert.equal(calls, 2, "cached histories are reused");
  const flat = Array.from({ length: 120 }, (_, i) => ({ time: now - 120_000 + i * 1_000, value: 22 }));
  const reduced = card._downsampleRoomHistory(flat, 60);
  assert.ok(reduced.length <= 120, "dense histories are reduced to at most two samples per time bucket");
  const bucketStartGap = card._downsampleRoomHistory([
    { time: now - 86_000_000, value: null },
    ...Array.from({ length: 61 }, (_, i) => ({ time: now - 86_000_000 + 1_000 + i * 1_000, value: 20 + i / 60 })),
    { time: now, value: 21 },
  ], 60);
  assert.equal(bucketStartGap[0].value, null, "a gap at the bucket start stays before its readings");
  assert.ok(bucketStartGap.every((point, i) => i === 0 || point.time >= bucketStartGap[i - 1].time));
  const bucketEndGap = card._downsampleRoomHistory([
    ...Array.from({ length: 61 }, (_, i) => ({ time: now - 86_000_000 + i * 1_000, value: 20 + i / 60 })),
    { time: now - 86_000_000 + 61_000, value: null },
    { time: now, value: 21 },
  ], 60);
  assert.equal(bucketEndGap[1].value, null, "a gap at the bucket end stays after its readings");
  card._roomHistories.set("temperature", { points: flat.slice(0, 2), start: now - 86400000, end: now });
  card._renderRoomHistory("temperature");
  assert.doesNotMatch(graphs.get("temperature").path.value, /NaN|Infinity/, "flat temperatures render finite coordinates");

  const emptyCard = new (registry.get("home-room-card"))();
  emptyCard.shadowRoot = card.shadowRoot;
  emptyCard._config = { room_temperature_entity: "sensor.bedroom" };
  emptyCard.isConnected = true;
  let emptyCalls = 0;
  emptyCard._hass = { callApi: async () => { emptyCalls++; throw Error("offline"); } };
  await emptyCard._loadRoomHistory();
  await emptyCard._loadRoomHistory();
  assert.equal(emptyCalls, 1, "failed history loads are cached for five minutes");
  assert.equal(graphs.get("temperature").button.hidden, true);
});

test("room history ignores a response after disconnect", async () => {
  const { registry } = await loadCards();
  const card = new (registry.get("home-room-card"))();
  const button = { hidden: true, querySelector: () => ({ setAttribute() {} }), setAttribute() {} };
  card.shadowRoot = { querySelector: () => button };
  card._config = { room_temperature_entity: "sensor.bedroom" };
  card.isConnected = true;
  let resolveHistory;
  card._hass = { callApi: () => new Promise((resolve) => { resolveHistory = resolve; }) };
  const pending = card._loadRoomHistory();
  card.disconnectedCallback();
  resolveHistory([[{ state: "22", last_changed: new Date().toISOString() }, { state: "23", last_changed: new Date().toISOString() }]]);
  await pending;
  assert.equal(card._roomHistories.get("temperature"), undefined);
  assert.equal(button.hidden, true);
});

test("room history clears and ignores the old entity after configuration changes", async () => {
  const { registry } = await loadCards();
  const card = new (registry.get("home-room-card"))();
  card._config = { room_temperature_entity: "sensor.old" };
  card._roomHistories.set("temperature", { points: [{ time: Date.now(), value: 22 }] });
  card._hass = { states: {}, callApi: () => new Promise((resolve) => { card.resolveOldHistory = resolve; }) };
  card.isConnected = true;
  const pending = card._loadRoomHistory();
  card.isConnected = false;
  card._render = function () {
    assert.equal(this._roomHistories.get("temperature"), undefined, "old data is cleared before the new config renders");
    this._rendered = true;
  };

  card.setConfig({ room_temperature_entity: "sensor.new" });
  card.resolveOldHistory([[{ state: "23", last_changed: new Date().toISOString() }]]);
  await pending;
  assert.equal(card._roomHistories.get("temperature"), undefined);
});

test("room reading and graph commands use native Home Assistant more info", async () => {
  const { registry } = await loadCards();
  const card = new (registry.get("home-room-card"))();
  card._config = { room_temperature_entity: "sensor.bedroom", humidity_entity: "sensor.bedroom_humidity" };
  let event;
  card.dispatchEvent = (value) => { event = value; };
  for (const entity of ["sensor.bedroom", "sensor.bedroom_humidity"]) {
    card._click({ target: { closest: () => ({ dataset: { action: "more", entity }, disabled: false }) } });
    assert.equal(event.type, "hass-more-info");
    assert.equal(event.detail.entityId, entity);
    assert.equal(event.bubbles, true);
    assert.equal(event.composed, true);
  }
  const markup = card._content();
  assert.match(markup, /data-room-more="temperature" data-action="more" data-entity="sensor\.bedroom"/);
  assert.match(markup, /data-room-more="humidity" data-action="more" data-entity="sensor\.bedroom_humidity"/);
});

test("socket metrics preserve unit conversions and open native entity details", async () => {
  const { registry } = await loadCards();
  const card = new (registry.get("home-socket-card"))();
  card._config = {
    switch_entity: "switch.plug",
    power_entity: "sensor.power",
    voltage_entity: "sensor.voltage",
    current_entity: "sensor.current",
    energy_daily_entity: "sensor.energy",
  };
  card._hass = { states: {
    "switch.plug": { state: "on", attributes: {} },
    "sensor.power": { state: "1.374", attributes: { unit_of_measurement: "kW" } },
    "sensor.voltage": { state: "223900", attributes: { unit_of_measurement: "mV" } },
    "sensor.current": { state: "6180", attributes: { unit_of_measurement: "mA" } },
    "sensor.energy": { state: "3390", attributes: { unit_of_measurement: "Wh" } },
  } };
  assert.equal(card._socketReading("power_entity", 0, "power").replace(/\D/g, ""), "1374");
  assert.equal(card._socketReading("voltage_entity", 1, "voltage"), "223,9");
  assert.equal(card._socketReading("current_entity", 2, "current"), "6,18");
  assert.equal(card._socketReading("energy_daily_entity", 2, "energy"), "3,39");

  const markup = card._content();
  const actions = [...markup.matchAll(/data-socket-metric="(power|voltage|current|energy)" data-entity="([^"]+)"/g)];
  assert.deepEqual(actions.map(([, key, entity]) => [key, entity]), [
    ["power", "sensor.power"],
    ["voltage", "sensor.voltage"],
    ["current", "sensor.current"],
    ["energy", "sensor.energy"],
  ]);
  let event;
  card.dispatchEvent = (value) => { event = value; };
  for (const [, , entity] of actions) {
    card._click({ target: { closest: () => ({ dataset: { action: "more", entity }, disabled: false }) } });
    assert.equal(event.type, "hass-more-info");
    assert.equal(event.detail.entityId, entity);
    assert.equal(event.bubbles, true);
    assert.equal(event.composed, true);
  }
});

test("socket recorder chart groups hourly changes by Home Assistant timezone", async () => {
  const { registry } = await loadCards();
  const card = new (registry.get("home-socket-card"))();
  const path = { value: "", setAttribute(_name, value) { this.value = value; } };
  const chart = {
    hidden: true,
    toggleAttribute(_name, hidden) { this.hidden = hidden; },
    querySelector: () => path,
  };
  card.shadowRoot = { querySelector: (selector) => selector.includes("energy") ? chart : null };
  card._config = { energy_daily_entity: "sensor.energy_today" };
  card.isConnected = true;
  const now = Date.now();
  const timeZone = "America/Los_Angeles";
  const thisHour = card._socketLocalDateParts(now, timeZone).hour;
  const previousDay = now - 30 * 60 * 60 * 1000;
  const hourStart = Math.floor(now / 3600000) * 3600000;
  let request, calls = 0;
  card._hass = {
    config: { time_zone: timeZone },
    callWS: async (value) => {
      request = value;
      calls++;
      return { "sensor.energy_today": [
        { start: previousDay, change: 9 },
        { start: hourStart, change: 0 },
        { start: hourStart, change: 1.25 },
        { start: hourStart, change: -4 },
        { start: hourStart, change: null },
        { start: hourStart + 60 * 60 * 1000, change: 8 },
      ] };
    },
  };
  await card._loadSocketEnergy();
  assert.equal(request.statistic_ids.length, 1);
  assert.equal(request.statistic_ids[0], "sensor.energy_today");
  assert.equal(request.period, "hour");
  assert.equal(request.units.energy, "kWh");
  assert.equal(request.types.length, 1);
  assert.equal(request.types[0], "change");
  assert.ok(Date.parse(request.start_time) <= now - 26 * 60 * 60 * 1000 + 1000);
  assert.equal(chart.hidden, false);
  assert.equal(card._socketHistories.get("energy").values[thisHour], 1.25);
  assert.equal(card._socketHistories.get("energy").values[(thisHour + 23) % 24], null);
  assert.equal(path.value.match(/M/g)?.length, 24, "today has one observed bar and baseline marks for missing and future hours");
  assert.equal(card._socketHistories.get("energy").values.filter((value) => value === null).length, 23);
  await card._loadSocketEnergy();
  assert.equal(calls, 1, "hourly statistics are cached");
});

test("socket power and current step while short gaps bridge and long gaps stay open", async () => {
  const { registry } = await loadCards();
  const card = new (registry.get("home-socket-card"))();
  const paths = new Map(["power", "voltage", "current"].map((key) => [
    key,
    {
      line: { value: "", setAttribute(_name, value) { this.value = value; } },
      gap: { value: "", setAttribute(_name, value) { this.value = value; } },
    },
  ]));
  card.shadowRoot = { querySelector: (selector) => {
    const key = selector.match(/data-socket-chart="([^"]+)"/)?.[1];
    return key ? { toggleAttribute() {}, querySelector: (part) =>
      part.includes("gap") ? paths.get(key).gap : paths.get(key).line } : null;
  } };
  const start = Date.now() - 24 * 60 * 60 * 1000;
  const points = [
    { time: start, value: 10 },
    { time: start + 10 * 60 * 1000, value: null },
    { time: start + 30 * 60 * 1000, value: 20 },
    { time: start + 40 * 60 * 1000, value: 15 },
  ];
  for (const key of ["power", "current"]) {
    card._socketHistories.set(key, { type: "line", points, start, end: start + 60 * 60 * 1000 });
    card._renderSocketHistory(key);
    assert.match(paths.get(key).line.value, /H.*V/);
    assert.match(paths.get(key).gap.value, /^M.*L/);
    card._socketHistories.set(key, {
      type: "line",
      points: [points[0], points[1], { time: start + 30 * 60 * 1000 + 1, value: 20 }],
      start,
      end: start + 60 * 60 * 1000,
    });
    card._renderSocketHistory(key);
    assert.equal(paths.get(key).gap.value, "", "gaps over 30 minutes stay open");
  }
  card._socketHistories.set("voltage", {
    type: "line",
    points: [{ time: start, value: 220 }, { time: start + 60 * 60 * 1000, value: 224 }],
    start,
    end: start + 60 * 60 * 1000,
  });
  card._renderSocketHistory("voltage");
  assert.match(paths.get("voltage").line.value, /L/);
  assert.doesNotMatch(paths.get("voltage").line.value, /H.*V/);
  assert.equal(paths.get("voltage").line.value, "M1.0 25.8 L199.0 2.2 ", "voltage extrema with five percent padding");
  card._config = { voltage_entity: "sensor.voltage" };
  card._hass = { states: { "sensor.voltage": { state: "224000", attributes: { unit_of_measurement: "mV" } } } };
  card._socketHistories.get("voltage").points = [{ time: start, value: 220000 }, { time: start + 3600000, value: 224000 }];
  card._renderSocketHistory("voltage");
  assert.equal(paths.get("voltage").line.value, "M1.0 25.8 L199.0 2.2 ", "equivalent millivolt scale");
  card._socketHistories.get("voltage").points = [{ time: start, value: 180000 }, { time: start + 3600000, value: 280000 }];
  card._renderSocketHistory("voltage");
  assert.equal(paths.get("voltage").line.value, "M1.0 25.8 L199.0 2.2 ", "range follows all observed extrema");
});

test("voltage downsampling preserves observed extrema, order and gaps", async () => {
  const { registry } = await loadCards();
  const card = new (registry.get("home-socket-card"))();
  const points = Array.from({ length: 1200 }, (_, i) => ({ time: i * 60000, value: 230 }));
  points[7].value = 211;
  points[9].value = 249;
  points[10].value = null;
  points[11].value = 225;
  const reduced = card._downsampleSocketHistory(points, 60, true);
  assert.ok(reduced.length < 300);
  assert.equal(Math.min(...reduced.filter(p => p.value !== null).map(p => p.value)), 211);
  assert.equal(Math.max(...reduced.filter(p => p.value !== null).map(p => p.value)), 249);
  assert.ok(reduced.every((p, i) => !i || p.time >= reduced[i - 1].time));
  assert.ok(reduced.every(p => points.includes(p)), "uses actual samples, not averages");
  assert.ok(reduced.includes(points[10]), "unavailable interval retained");
  assert.ok(reduced.includes(points[9]) && reduced.includes(points[11]), "gap endpoints retained");
});

test("socket history hides missing statistics and invalidates per entity", async () => {
  const { registry } = await loadCards();
  const card = new (registry.get("home-socket-card"))();
  const charts = new Map(["power", "voltage", "current", "energy"].map((key) => [
    key,
    { hidden: true, toggleAttribute(_name, hidden) { this.hidden = hidden; }, querySelector: () => ({ setAttribute() {} }) },
  ]));
  card.shadowRoot = { querySelector: (selector) => charts.get(selector.match(/"([^"]+)"/)?.[1]) };
  card._config = { switch_entity: "switch.plug", power_entity: "sensor.power", voltage_entity: "sensor.voltage", current_entity: "sensor.current", energy_daily_entity: "sensor.energy" };
  card.isConnected = true;
  card._hass = {
    config: { time_zone: "UTC" },
    callApi: async () => [[{ state: "unavailable", last_changed: new Date().toISOString() }]],
    callWS: async () => ({ "sensor.energy": [{ start: Date.now(), change: null }, { start: Date.now() + 1, change: -1 }] }),
  };
  await card._loadSocketHistories();
  assert.ok([...charts.values()].every((chart) => chart.hidden), "missing or invalid history stays hidden");
  for (const key of ["power", "voltage", "current", "energy"]) {
    card._socketHistories.set(key, { type: "line", points: [] });
    card._socketHistoryLoadedAt.set(key, Date.now());
  }
  card._render = () => {};
  card.isConnected = false;
  card.setConfig({ ...card._config, power_entity: "sensor.new_power", energy_daily_entity: "sensor.new_energy" });
  assert.equal(card._socketHistories.has("power"), false);
  assert.equal(card._socketHistories.has("energy"), false);
  assert.equal(card._socketHistories.has("voltage"), true);
  assert.equal(card._socketHistories.has("current"), true);
});

test("registers the dashboard and standalone card types", async () => {
  const { registry } = await loadCards();
  for (const name of [
    "home-dashboard",
    "home-boiler-card",
    "home-air-card",
    "home-room-card",
    "home-leak-card",
    "home-door-card",
    "home-socket-card",
    "home-river-card",
    "home-energy-card",
    "home-battery-card",
    "home-tv-card",
  ]) {
    assert.equal(
      typeof registry.get(name),
      "function",
      `${name} is registered`,
    );
  }
});

test("sensor cards expose only explicit state, battery, location, and vibration bindings", async () => {
  const { registry } = await loadCards();
  const Leak = registry.get("home-leak-card"), Door = registry.get("home-door-card");
  assert.deepEqual(JSON.parse(JSON.stringify(Leak.getStubConfig())), {
    type: "custom:home-leak-card", leak_entity: null, battery_entity: null, location: "",
  });
  assert.deepEqual(JSON.parse(JSON.stringify(Door.getStubConfig())), {
    type: "custom:home-door-card", door_entity: null, vibration_entity: null,
    battery_entity: null, location: "",
  });
  const doorFields = Door.getConfigForm().schema;
  assert.deepEqual(Array.from(doorFields.filter(field => field.name !== "title"), field => field.name),
    ["door_entity", "vibration_entity", "battery_entity", "location"]);
  assert.equal(doorFields.find(field => field.name === "door_entity").required, false);
  assert.equal(doorFields.find(field => field.name === "vibration_entity").required, false);
  assert.equal(new Leak().getCardSize(), 3);
  assert.equal(new Door().getGridOptions().rows, 3);
  for (const [Card, key] of [[Leak, "leak_entity"], [Door, "door_entity"]]) {
    const card = new Card();
    assert.throws(() => card.setConfig({ [key]: 42 }), /entity ID or empty/);
    assert.throws(() => card.setConfig({ location: 42 }), /must be text/);
  }
});

test("boiler editor keeps the Midea water heater primary and manual bindings advanced", async () => {
  const { registry } = await loadCards();
  const schema = registry.get("home-boiler-card").getConfigForm().schema;
  assert.equal(schema.find((field) => field.name === "boiler_entity").required, true);
  const advanced = schema.find((field) => field.type === "expandable");
  assert.equal(advanced.name, "advanced");
  assert.equal(advanced.flatten, true);
  assert.equal(advanced.expanded, false);
  assert.deepEqual(
    Array.from(advanced.schema, (field) => field.name),
    ["memo_entity", "mega_entity", "sterilization_entity", "boiler_hours", "boiler_minutes"],
  );
});

test("Midea Local features resolve by exact registry identity and explicit bindings win", async () => {
  const { registry } = await loadCards();
  const card = new (registry.get("home-boiler-card"))();
  card._render = () => {
    card._rendered = true;
  };
  card._updateDynamic = () => {};
  card.connectedCallback();
  const primary = {
    entity_id: "water_heater.tank",
    unique_id: "midea_ac_lan.DEVICE_water_heater",
    platform: "midea_ac_lan",
    device_id: "device-1",
    config_entry_id: "entry-1",
    disabled_by: null,
  };
  const entry = (entity_id, suffix, overrides = {}) => ({
    entity_id,
    unique_id: `midea_ac_lan.DEVICE${suffix}`,
    platform: "midea_ac_lan",
    device_id: "device-1",
    config_entry_id: "entry-1",
    disabled_by: null,
    ...overrides,
  });
  const entries = [
    primary,
    entry("switch.memo", "_memory"),
    entry("switch.sterilization", "_sterilization"),
    entry("sensor.heating_time", "_heating_time_remaining"),
    entry("switch.other_device", "_memory", { device_id: "device-2" }),
    entry("switch.other_entry", "_sterilization", { config_entry_id: "entry-2" }),
    entry("switch.disabled", "_memory", { disabled_by: "user" }),
    entry("switch.other_platform", "_memory", { platform: "tuya" }),
  ];
  const listeners = new Map();
  const connectionListeners = new Map();
  const connection = {
    subscribeEvents(callback, eventType) {
      listeners.set(eventType, callback);
      return () => listeners.delete(eventType);
    },
    addEventListener(eventType, callback) {
      connectionListeners.set(eventType, callback);
    },
    removeEventListener(eventType) {
      connectionListeners.delete(eventType);
    },
  };
  let registryCalls = 0;
  card.setConfig({ boiler_entity: "water_heater.tank", memo_entity: "switch.manual" });
  card.hass = {
    states: { "water_heater.tank": { state: "heat", attributes: {} } },
    connection,
    callWS: async ({ type }) => {
      assert.equal(type, "config/entity_registry/list");
      registryCalls++;
      return entries;
    },
  };
  await new Promise(setImmediate);
  assert.equal(registryCalls, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(card._autoEntities)), {
    sterilization_entity: "switch.sterilization",
  });
  assert.equal(card._autoHeatingTimeSensor, "sensor.heating_time");
  assert.equal(card._featureEntity("memo_entity"), "switch.manual");
  assert.ok(card._entityIds().includes("sensor.heating_time"));

  const renamed = entries.map((item) =>
    item.entity_id === "switch.sterilization"
      ? { ...item, entity_id: "switch.uv_sterilization" }
      : item,
  );
  card._hass.callWS = async () => {
    registryCalls++;
    return renamed;
  };
  listeners.get("entity_registry_updated")();
  await new Promise(setImmediate);
  assert.equal(card._featureEntity("sterilization_entity"), "switch.uv_sterilization");
  connectionListeners.get("disconnected")();
  assert.equal(registryCalls, 2);
  connectionListeners.get("ready")();
  await new Promise(setImmediate);
  assert.equal(registryCalls, 3);
  assert.equal(card._featureEntity("sterilization_entity"), "switch.uv_sterilization");
  const replacementConnection = { subscribeEvents: () => () => {} };
  card.hass = {
    states: card._hass.states,
    connection: replacementConnection,
    callWS: async () =>
      renamed.map((item) =>
        item.entity_id === "switch.uv_sterilization"
          ? { ...item, entity_id: "switch.replaced_sterilization" }
          : item,
      ),
  };
  await new Promise(setImmediate);
  assert.equal(
    card._featureEntity("sterilization_entity"),
    "switch.replaced_sterilization",
  );
});

test("boiler discovery ignores stale responses and API errors", async () => {
  const { registry } = await loadCards();
  const card = new (registry.get("home-boiler-card"))();
  card._render = () => {
    card._rendered = true;
  };
  card._updateDynamic = () => {};
  card.connectedCallback();
  let resolveRegistry;
  const connection = { subscribeEvents: () => () => {} };
  card.setConfig({ boiler_entity: "water_heater.first" });
  card.hass = {
    states: {},
    connection,
    callWS: () => new Promise((resolve) => (resolveRegistry = resolve)),
  };
  await new Promise(setImmediate);
  await new Promise(setImmediate);
  card.setConfig({ boiler_entity: "climate.not_midea" });
  resolveRegistry([
    {
      entity_id: "water_heater.first",
      unique_id: "midea_ac_lan.DEVICE_water_heater",
      platform: "midea_ac_lan",
      device_id: "device-1",
      config_entry_id: "entry-1",
      disabled_by: null,
    },
    {
      entity_id: "switch.memo",
      unique_id: "midea_ac_lan.DEVICE_memory",
      platform: "midea_ac_lan",
      device_id: "device-1",
      config_entry_id: "entry-1",
      disabled_by: null,
    },
  ]);
  await new Promise(setImmediate);
  assert.deepEqual(JSON.parse(JSON.stringify(card._autoEntities)), {});

  const failing = new (registry.get("home-boiler-card"))();
  failing._render = () => {
    failing._rendered = true;
  };
  failing._updateDynamic = () => {};
  failing.connectedCallback();
  failing.setConfig({ boiler_entity: "water_heater.explicit" });
  const retryListeners = new Map();
  let failingCalls = 0;
  const retryConnection = {
    subscribeEvents(callback, eventType) {
      retryListeners.set(eventType, callback);
      return () => retryListeners.delete(eventType);
    },
  };
  failing.hass = {
    states: {},
    connection: retryConnection,
    callWS: async () => {
      failingCalls++;
      if (failingCalls > 1)
        return [
          {
            entity_id: "water_heater.explicit",
            unique_id: "midea_ac_lan.DEVICE_water_heater",
            platform: "midea_ac_lan",
            device_id: "device-1",
            config_entry_id: "entry-1",
          },
          {
            entity_id: "switch.memo",
            unique_id: "midea_ac_lan.DEVICE_memory",
            platform: "midea_ac_lan",
            device_id: "device-1",
            config_entry_id: "entry-1",
          },
        ];
      throw new Error("registry unavailable");
    },
  };
  await new Promise(setImmediate);
  assert.equal(failing._featureEntity("memo_entity"), null);
  retryListeners.get("entity_registry_updated")();
  await new Promise(setImmediate);
  assert.equal(failingCalls, 2);
  assert.equal(failing._featureEntity("memo_entity"), "switch.memo");
});

test("boiler remaining time prefers its attribute and converts sensor units", async () => {
  const { registry } = await loadCards();
  const card = new (registry.get("home-boiler-card"))();
  card._config = {
    boiler_entity: "water_heater.tank",
    boiler_hours: null,
    boiler_minutes: null,
  };
  card._autoHeatingTimeSensor = "sensor.remaining";
  card._hass = {
    states: {
      "sensor.remaining": {
        state: "90",
        attributes: { unit_of_measurement: "s" },
      },
    },
  };
  assert.equal(card._heatingMinutes({}), 1.5);
  assert.equal(card._heatingMinutes({ heating_time_remaining: 12 }), 12);
  assert.equal(card._formatHeatingTime(card._heatingMinutes({})), "2 хв");
  card._hass.states["sensor.remaining"] = {
    state: "1.5",
    attributes: { unit_of_measurement: "h" },
  };
  assert.equal(card._heatingMinutes({}), 90);
});
test("EcoFlow online state supports sensor and binary_sensor entities", async () => {
  const { registry } = await loadCards();
  const RiverCard = registry.get("home-river-card");
  const card = new RiverCard();

  card._config = { river_status: "sensor.river_status" };
  card._hass = { states: { "sensor.river_status": { state: "online" } } };
  assert.equal(card._riverOnline(), true);
  card._hass.states["sensor.river_status"].state = "unavailable";
  assert.equal(card._riverOnline(), false);

  card._config.river_status = "binary_sensor.river_status";
  card._hass.states["binary_sensor.river_status"] = { state: "on" };
  assert.equal(card._riverOnline(), true);
  card._hass.states["binary_sensor.river_status"].state = "off";
  assert.equal(card._riverOnline(), false);

  const fields = RiverCard.getConfigForm().schema;
  assert.deepEqual(
    Array.from(fields.find((field) => field.name === "river_status").selector.entity.domain),
    ["sensor", "binary_sensor"],
  );
});

test("standalone card markup and sizing match pre-refactor characterization", async () => {
  const { registry } = await loadCards();
  const contracts = [
    [
      "home-boiler-card",
      "2c1a5554af9d78cfe4b9e249b8772fe71f2ca75e8ead43ee106b120c884e5dca",
      5,
      { columns: 6, rows: 5, min_columns: 3, min_rows: 2 },
    ],
    [
      "home-air-card",
      "d4b5d9a30816972f074103c73c9373af8366b72c0f4e9c4c96b9ad2647c67019",
      8,
      { columns: 6, rows: 8, min_columns: 3, min_rows: 2 },
    ],
    [
      "home-room-card",
      "723a8da4382e6a03106c03260c1ccc3558fdae7c8b298f52e3c4b7aed4b5fd5f",
      3,
      { columns: 6, rows: 3, min_columns: 3, min_rows: 2 },
    ],
    [
      "home-socket-card",
      "35a15269f13b6a6a7301535569f1163b64408618808c439e92d0000448bc28d6",
      4,
      { columns: 6, rows: 4, min_columns: 3, min_rows: 2 },
    ],
    [
      "home-river-card",
      "59f8456eebf88035f3d8ef9dc9fd820091622cc6b5f2fa2a4f79e80a6fc04ce0",
      8,
      { columns: 12, rows: 8, min_columns: 6, min_rows: 5 },
    ],
    [
      "home-energy-card",
      "cb92c06c9bdd5ece9a6b1649d66c93428f2085676266a55763532506323d9d6f",
      8,
      { columns: 12, rows: 5, min_columns: 6, min_rows: 4 },
    ],
    [
      "home-battery-card",
      "016c8b1138c5bbe6af21cc90b26987fea518694ccb6eb8c2ae1acfe0fd7b5d9c",
      8,
      { columns: 6, rows: 5, min_columns: 3, min_rows: 2 },
    ],
  ];

  for (const [
    tag,
    expectedMarkupHash,
    expectedSize,
    expectedGridOptions,
  ] of contracts) {
    const Card = registry.get(tag);
    const card = new Card();
    card._hass = { states: {} };
    card._config = { ...Card.getStubConfig(), title: "Test" };
    delete card._config.type;
    assert.equal(
      createHash("sha256").update(card._content()).digest("hex"),
      expectedMarkupHash,
      tag,
    );
    assert.equal(card.getCardSize(), expectedSize, tag);
    assert.equal(
      JSON.stringify(card.getGridOptions()),
      JSON.stringify(expectedGridOptions),
      tag,
    );
  }
});

test("configured live-card markup matches pre-refactor characterization", async () => {
  const { registry } = await loadCards();
  const contracts = [
    ["home-boiler-card", "2382d7793a7e0793725711ae31e086d9508dfd6fe49c4b7125c34dd7f93e380a"],
    ["home-air-card", "2fddd0611caac77f3aee08432b90daa4d25c58104de9b01f9041be3351a82315"],
    ["home-room-card", "26cf1a038b7fcf7a8f53377ced22c86bcbebd4be5c72ed1e04db85ad173550f3"],
    ["home-socket-card", "10813a9a6d8b4feff78c4d30082b87f4838d13d5be64600df85ed07f95de27e0"],
    ["home-river-card", "e5643629beb69ba09093c07d76a6821b5c2c938545b5a4811e11eab69fd97a6c"],
    ["home-energy-card", "55a435ec8720739986a6eabbc50fb02554e54619c59e68029762b1fc012bf0c3"],
    ["home-battery-card", "016c8b1138c5bbe6af21cc90b26987fea518694ccb6eb8c2ae1acfe0fd7b5d9c"],
  ];

  for (const [tag, expectedMarkupHash] of contracts) {
    const Card = registry.get(tag);
    const card = new Card();
    const config = { ...Card.getStubConfig(), title: "Fixture" };
    const states = {};
    const formFields = Card.getConfigForm().schema.flatMap((field) =>
      field.type === "expandable" ? field.schema : [field],
    );
    for (const field of formFields) {
      if (tag === "home-boiler-card" && ["boiler_hours", "boiler_minutes"].includes(field.name)) continue;
      const domain = field.selector?.entity?.domain?.[0];
      if (!domain) continue;
      const id = `${domain}.${field.name}`;
      config[field.name] = id;
      const attributes = {
        unit_of_measurement: field.name.includes("temperature")
          ? "°C"
          : field.name.includes("humidity")
            ? "%"
            : field.name.includes("voltage")
              ? "V"
              : field.name.includes("current")
                ? "A"
                : "",
      };
      if (domain === "climate")
        Object.assign(attributes, {
          hvac_modes: ["cool", "heat", "fan_only", "dry", "auto"],
          current_temperature: 24,
          temperature: 23,
          fan_modes: ["low", "medium", "high", "auto"],
          fan_mode: "medium",
          swing_modes: ["swing", "fixed", "default"],
          swing_mode: "swing",
        });
      if (domain === "water_heater")
        Object.assign(attributes, {
          hvac_modes: ["off", "heat"],
          current_temperature: 48,
          temperature: 55,
          hvac_action: "heating",
        });
      states[id] = {
        state:
          domain === "switch" || domain === "binary_sensor"
            ? "on"
            : domain === "water_heater"
              ? "heat"
              : domain === "climate"
                ? "cool"
                : "47",
        attributes,
      };
    }
    delete config.type;
    card._hass = { states };
    card._config = config;
    assert.equal(
      createHash("sha256").update(card._content()).digest("hex"),
      expectedMarkupHash,
      tag,
    );
  }
});

test("card-specific controls dispatch through their owning card classes", async () => {
  const { registry } = await loadCards();
  const air = new (registry.get("home-air-card"))();
  air._config = { air_entity: "climate.office" };
  air._hass = {
    states: { "climate.office": { attributes: { fan_modes: ["low"] } } },
  };
  air._available = () => true;
  air._busy = () => false;
  let airCall;
  air._service = (...args) => {
    airCall = args;
  };
  air._click({
    target: {
      closest: () => ({
        dataset: { action: "air-fan-mode", mode: "low" },
        disabled: false,
      }),
    },
  });
  assert.equal(
    JSON.stringify(airCall),
    JSON.stringify([
      "climate",
      "set_fan_mode",
      { entity_id: "climate.office", fan_mode: "low" },
    ]),
  );

  const socket = new (registry.get("home-socket-card"))();
  let socketToggleCount = 0;
  socket._toggleSocket = () => {
    socketToggleCount++;
  };
  socket._click({
    target: { closest: () => ({ dataset: { action: "socket-toggle" } }) },
  });
  assert.equal(socketToggleCount, 1);
});

test("air refresh runs every ten seconds only while powered on and visible", async () => {
  const { registry, timers, document, visibilityListeners } = await loadCards();
  const card = new (registry.get("home-air-card"))();
  card._render = () => {};
  card._config = { air_entity: "climate.office" };
  const state = { state: "off", attributes: {} };
  const calls = [];
  let finish;
  card._hass = {
    states: { "climate.office": state },
    callService: (...args) => { calls.push(args); return new Promise((resolve) => { finish = resolve; }); },
  };
  card.connectedCallback();
  assert.equal(timers.size, 0);
  state.state = "heat";
  card._syncAirRefresh();
  const fire = () => {
    const id = card._airRefreshTimer, timer = timers.get(id);
    assert.equal(timer.delay, 10000);
    timers.delete(id);
    return timer.callback();
  };
  const first = fire();
  assert.equal(JSON.stringify(calls), JSON.stringify([
    ["homeassistant", "update_entity", { entity_id: "climate.office" }],
  ]));
  card._syncAirRefresh();
  assert.equal(timers.size, 0, "no overlapping requests");
  finish();
  await first;
  assert.equal(timers.size, 1);
  document.visibilityState = "hidden";
  for (const listener of visibilityListeners) listener();
  assert.equal(timers.size, 0);
  document.visibilityState = "visible";
  for (const listener of visibilityListeners) listener();
  assert.equal(timers.size, 1);
  state.state = "off";
  card._syncAirRefresh();
  assert.equal(timers.size, 0);
  state.state = "unavailable";
  card._syncAirRefresh();
  assert.equal(timers.size, 0);
  state.state = "cool";
  card._syncAirRefresh();
  const pending = fire();
  card.disconnectedCallback();
  finish();
  await pending;
  assert.equal(timers.size, 0, "late requests do not restart polling");
  assert.equal(visibilityListeners.size, 0);
  card.connectedCallback();
  assert.equal(timers.size, 1);
  card._hass.callService = async () => { throw new Error("device offline"); };
  await fire();
  assert.equal(timers.size, 1, "failed refresh waits for the next interval");
  card.disconnectedCallback();
  assert.equal(timers.size, 0);
});

test("air power preserves the device mode instead of selecting cooling", async () => {
  const { registry } = await loadCards();
  for (const tag of ["home-dashboard", "home-air-card"]) {
    const card = new (registry.get(tag))();
    card._config = { air_entity: "climate.office" };
    const state = {
      state: "off",
      attributes: { hvac_modes: ["off", "cool", "heat", "dry", "fan_only", "auto"] },
    };
    card._hass = { states: { "climate.office": state } };
    const calls = [];
    card._service = (...args) => calls.push(args);
    const click = () => card._click({
      target: { closest: () => ({ dataset: { action: "air-power" } }) },
    });

    click();
    for (const mode of ["heat", "cool", "dry", "fan_only", "auto"]) {
      state.state = mode;
      click();
    }
    assert.equal(JSON.stringify(calls), JSON.stringify([
      ["climate", "turn_on", { entity_id: "climate.office" }],
      ...Array.from({ length: 5 }, () =>
        ["climate", "turn_off", { entity_id: "climate.office" }]),
    ]), tag);

    state.state = "unavailable";
    click();
    assert.equal(calls.length, 6, tag);
  }
});

test("configured energy and battery paths are navigated by standalone cards", async () => {
  const { registry } = await loadCards();
  const card = new (registry.get("home-energy-card"))();
  card.shadowRoot.querySelector = () => null;
  card._config = { energy_path: "/custom/energy", battery_path: "/custom/battery" };
  const navigated = [];
  card._hass = { navigate: (path) => navigated.push(path) };
  const click = (action) =>
    card._click({ target: { closest: () => ({ dataset: { action } }) } });

  click("view-energy");
  click("view-battery");
  assert.deepEqual(navigated, ["/custom/energy", "/custom/battery"]);
  assert.equal(card._view, "home");

  let renders = 0;
  card._config.energy_path = null;
  card._render = () => { renders++; };
  click("view-energy");
  assert.equal(card._view, "home");
  assert.equal(renders, 0);
});

test("empty editor stubs are safe and invalid configuration types report the option", async () => {
  const { registry } = await loadCards();
  const Dashboard = registry.get("home-dashboard");
  const dashboard = new Dashboard();
  dashboard._render = () => {};
  dashboard._updateDynamic = () => {};
  assert.doesNotThrow(() => dashboard.setConfig(Dashboard.getStubConfig()));
  dashboard._hass = { states: {} };
  assert.doesNotThrow(() => dashboard._boiler());
  assert.throws(
    () => dashboard.setConfig({ boiler_entity: 17 }),
    /boiler_entity/,
  );
  assert.throws(() => dashboard.setConfig([]), /object/);

  const Socket = registry.get("home-socket-card");
  const socket = new Socket();
  socket._render = () => {};
  assert.doesNotThrow(() => socket.setConfig(Socket.getStubConfig()));
  assert.throws(() => socket.setConfig({ switch_entity: {} }), /switch_entity/);
  assert.throws(() => socket.setConfig({ energy_label: 2 }), /energy_label/);
  assert.doesNotThrow(() =>
    socket.setConfig({ title: { type: "device", device_id: "device-1" } }),
  );
  socket.setConfig({ switch_entity: "switch.plug" });
  socket._updateDynamic = () => {};
  socket._rendered = true;
  socket.hass = {
    states: {
      "switch.plug": { state: "off" },
      "switch.other": { state: "on" },
    },
  };
  assert.deepEqual([...socket._entitySignatures.keys()], ["switch.plug"]);
});

test("the dashboard tracks only configured entities and never guesses an air entity", async () => {
  const { registry } = await loadCards();
  const Dashboard = registry.get("home-dashboard");
  const dashboard = new Dashboard();
  dashboard._render = () => {};
  dashboard._updateDynamic = () => {};
  dashboard.setConfig({
    air_entity: "climate.office",
    boiler_entity: "water_heater.tank",
  });
  dashboard._rendered = true;
  dashboard.hass = {
    states: {
      "climate.office": { state: "off" },
      "climate.living_room": { state: "cool" },
      "water_heater.tank": { state: "off" },
    },
  };
  assert.equal(dashboard._airId(), "climate.office");
  assert.deepEqual([...dashboard._entitySignatures.keys()].sort(), [
    "climate.office",
    "water_heater.tank",
  ]);

  dashboard.setConfig({ boiler_entity: "water_heater.tank" });
  dashboard.hass = { states: { "climate.living_room": { state: "cool" } } };
  assert.equal(dashboard._airId(), null);
});

test("disconnect clears pending temperature and socket timers and reconnect renders again", async () => {
  const { registry, timers, clearedTimers, window } = await loadCards();
  const Dashboard = registry.get("home-dashboard");
  const dashboard = new Dashboard();
  let renders = 0;
  dashboard._render = () => {
    renders++;
    dashboard._rendered = true;
  };
  dashboard.setConfig({ boiler_entity: "climate.boiler" });
  dashboard._pendingTargets.set("climate.boiler", { timer: 11 });
  dashboard.disconnectedCallback();
  assert.equal(dashboard._pendingTargets.size, 0);
  assert.ok(clearedTimers.includes(11));
  const disconnectedGeneration = dashboard._generation;
  dashboard._hass = { states: {} };
  dashboard.connectedCallback();
  assert.ok(dashboard._generation >= disconnectedGeneration);
  assert.equal(renders, 2);

  const Socket = registry.get("home-socket-card");
  const socket = new Socket();
  socket._render = () => {
    socket._rendered = true;
  };
  socket.setConfig({ switch_entity: "switch.plug" });
  socket._hass = {
    states: { "switch.plug": { state: "off", attributes: {} } },
    callService: () =>
      new Promise((resolve) => {
        socket.resolveService = resolve;
      }),
  };
  socket._available = () => true;
  socket._state = () => ({ state: "off", attributes: {} });
  socket._updateSocket = () => {};
  socket._setHidden = () => {};
  socket._setText = () => {};
  let updates = 0;
  socket._updateSocket = () => {
    updates++;
  };
  const service = socket._toggleSocket();
  const socketTimer = socket._socketPending.timer;
  assert.ok(timers.has(socketTimer));
  socket.disconnectedCallback();
  assert.equal(socket._socketPending, null);
  assert.ok(clearedTimers.includes(socketTimer));
  socket.resolveService();
  await service;
  assert.equal(updates, 1);
  socket.connectedCallback();
  assert.equal(socket._rendered, true);

  const graphDashboard = new Dashboard();
  graphDashboard._render = () => {};
  graphDashboard.setConfig({ power_entity: "sensor.power" });
  const slot = { dataset: { graph: "boiler" }, replaceChildren() {} };
  graphDashboard.shadowRoot.querySelectorAll = () => [slot];
  let resolveHelpers;
  let createdCards = 0;
  window.loadCardHelpers = () =>
    new Promise((resolve) => {
      resolveHelpers = resolve;
    });
  const graphMount = graphDashboard._mountGraphs(graphDashboard._generation);
  graphDashboard.disconnectedCallback();
  resolveHelpers({
    createCardElement() {
      createdCards++;
      return {};
    },
  });
  await graphMount;
  assert.equal(createdCards, 0);
});

test("an older service completion does not clear a newer request busy state", async () => {
  const { registry } = await loadCards();
  const Dashboard = registry.get("home-dashboard");
  const dashboard = new Dashboard();
  dashboard._render = () => {};
  dashboard._updateDynamic = () => {};
  dashboard.setConfig({ boiler_entity: "climate.boiler" });
  const resolvers = [];
  dashboard._hass = {
    callService: () => new Promise((resolve) => resolvers.push(resolve)),
  };

  const previous = dashboard._service("climate", "turn_on", {
    entity_id: "climate.boiler",
  });
  dashboard.setConfig({ boiler_entity: "climate.boiler" });
  const current = dashboard._service("climate", "turn_off", {
    entity_id: "climate.boiler",
  });
  resolvers[0]();
  await previous;
  assert.equal(dashboard._busy("climate.boiler"), true);
  resolvers[1]();
  await current;
  assert.equal(dashboard._busy("climate.boiler"), false);
});

test("TV remote editor and rendered controls use the generic entity and key map", async () => {
  const { registry } = await loadCards();
  const Tv = registry.get("home-tv-card"),
    schema = Tv.getConfigForm().schema,
    remote = schema.find((field) => field.name === "remote_entity"),
    player = schema.find((field) => field.name === "media_player_entity");
  assert.equal(remote.required, true);
  assert.equal(remote.selector.entity.domain[0], "remote");
  assert.equal(player.required, false);
  assert.equal(player.selector.entity.domain[0], "media_player");
  const card = new Tv();
  card._render = () => {};
  card.setConfig({ remote_entity: "remote.example_tv" });
  assert.deepEqual(JSON.parse(JSON.stringify(card._entityIds())), ["remote.example_tv"]);
  const content = card._content();
  for (const command of [
    "POWER", "ASSIST", "DPAD_UP", "DPAD_LEFT", "DPAD_CENTER", "DPAD_RIGHT",
    "DPAD_DOWN", "VOLUME_UP", "VOLUME_MUTE", "VOLUME_DOWN", "BACK", "HOME",
    "MEDIA_PREVIOUS", "MEDIA_PLAY_PAUSE", "MEDIA_NEXT",
  ])
    assert.match(content, new RegExp(`data-command="${command}"`));
  assert.doesNotMatch(content, /PatchWall|data-command="MI"/);
  assert.match(content, /aria-label="Відкрити асистента"/);
  assert.match(content, /class="tv-ok"[^>]*>OK</);
  for (const icon of ["chevron-up", "chevron-left", "chevron-right", "circle"])
    assert.notEqual(card._lucideIcon(icon), card._lucideIcon("fan"));
  assert.match(content, /\.tv-main[^}]*grid-template-columns:44px 140px 44px/s);
});

test("TV commands are sent once, unavailable controls stay inert, and service errors clear busy state", async () => {
  const { registry, timers, clearedTimers } = await loadCards();
  const Tv = registry.get("home-tv-card"),
    card = new Tv(),
    remote = { state: "on", attributes: {} },
    calls = [];
  card._render = () => {};
  card._updateTV = () => {};
  card.setConfig({ remote_entity: "remote.example_tv" });
  card._hass = {
    states: { "remote.example_tv": remote },
    callService: async (...args) => calls.push(args),
  };
  card._sendRemoteCommand("DPAD_UP");
  assert.equal(card._tvPending.command, "DPAD_UP");
  const timer = card._tvPending.timer;
  await card._sendRemoteCommand("HOME");
  assert.equal(calls.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0])), [
    "remote", "send_command", { entity_id: "remote.example_tv", command: "DPAD_UP" },
  ]);
  assert.equal(card._tvPending, null);
  assert.ok(clearedTimers.includes(timer));
  assert.equal(timers.has(timer), false);

  remote.state = "off";
  await card._sendRemoteCommand("HOME");
  assert.equal(calls.length, 1);
  await card._sendRemoteCommand("POWER");
  assert.equal(calls.length, 2);
  remote.state = "unavailable";
  await card._sendRemoteCommand("POWER");
  assert.equal(calls.length, 2);

  remote.state = "on";
  card._hass.callService = async () => {
    throw Error("mock failure");
  };
  await card._sendRemoteCommand("BACK");
  assert.equal(card._tvPending, null);
  assert.equal(card._error, "mock failure");
});

test("disconnect cancels a pending TV request and ignores its late result", async () => {
  const { registry, clearedTimers } = await loadCards();
  const card = new (registry.get("home-tv-card"))();
  let rejectService;
  card._render = () => {};
  card._updateTV = () => {};
  card.setConfig({ remote_entity: "remote.example_tv" });
  card._hass = {
    states: { "remote.example_tv": { state: "on", attributes: {} } },
    callService: () => new Promise((resolve, reject) => { rejectService = reject; }),
  };
  const request = card._sendRemoteCommand("HOME"),
    timer = card._tvPending.timer;
  card.disconnectedCallback();
  assert.equal(card._tvPending, null);
  assert.ok(clearedTimers.includes(timer));
  rejectService(Error("late failure"));
  await request;
  assert.equal(card._error, "");
});
