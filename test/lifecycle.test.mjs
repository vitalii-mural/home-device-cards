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
  const context = vm.createContext({
    HTMLElement,
    ResizeObserver,
    customElements,
    window,
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
  return { context, registry, timers, clearedTimers, window };
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

test("registers the dashboard and standalone card types", async () => {
  const { registry } = await loadCards();
  for (const name of [
    "home-dashboard",
    "home-boiler-card",
    "home-air-card",
    "home-room-card",
    "home-socket-card",
    "home-river-card",
    "home-energy-card",
    "home-battery-card",
  ]) {
    assert.equal(
      typeof registry.get(name),
      "function",
      `${name} is registered`,
    );
  }
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
      "e34180c056584b375c2253885b93a752ba2bbae6a301234d912420325b00e5d8",
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
      "254ba45249759a748364d16db9803c413fed25c9c8065c397436ba4cf7188465",
      3,
      { columns: 6, rows: 3, min_columns: 3, min_rows: 2 },
    ],
    [
      "home-socket-card",
      "0fa64060e79c71755879a7455e70b1d6348899c67d788dde555ea6acc8c9342e",
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
    ["home-boiler-card", "42ff7512528982cef742597bbac1e395db2e4461b007e0d7f8dc36dcf2df11b9"],
    ["home-air-card", "2fddd0611caac77f3aee08432b90daa4d25c58104de9b01f9041be3351a82315"],
    ["home-room-card", "b34b70a51dc259ddb5ca3ae0c8bf88e543fdc7b807dff504f99effcb4dff0f44"],
    ["home-socket-card", "ae9b16f9795e98d009e2fa75409ae256d26e14182f4babfc3bee5eb19200fade"],
    ["home-river-card", "e5643629beb69ba09093c07d76a6821b5c2c938545b5a4811e11eab69fd97a6c"],
    ["home-energy-card", "55a435ec8720739986a6eabbc50fb02554e54619c59e68029762b1fc012bf0c3"],
    ["home-battery-card", "016c8b1138c5bbe6af21cc90b26987fea518694ccb6eb8c2ae1acfe0fd7b5d9c"],
  ];

  for (const [tag, expectedMarkupHash] of contracts) {
    const Card = registry.get(tag);
    const card = new Card();
    const config = { ...Card.getStubConfig(), title: "Fixture" };
    const states = {};
    for (const field of Card.getConfigForm().schema) {
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
