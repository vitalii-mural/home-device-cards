import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const dashboardSource = await readFile(new URL('../home-dashboard.js', import.meta.url), 'utf8');
const deviceCardsSource = await readFile(new URL('../home-device-cards.js', import.meta.url), 'utf8');

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
    attachShadow() { return this.shadowRoot; }
    toggleAttribute() {}
  }
  class ResizeObserver {
    constructor(callback) { this.callback = callback; }
    observe() {}
    disconnect() {}
  }
  const customElements = {
    define(name, constructor) { registry.set(name, constructor); },
    get(name) { return registry.get(name); },
    whenDefined() { return Promise.resolve(); },
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

async function loadCards() {
  const env = createEnvironment();
  vm.runInContext(dashboardSource, env.context);
  vm.runInContext(deviceCardsSource, env.context);
  await Promise.resolve();
  await Promise.resolve();
  return env;
}

test('registers the dashboard and standalone card types', async () => {
  const { registry } = await loadCards();
  for (const name of ['home-dashboard', 'home-boiler-card', 'home-air-card', 'home-room-card', 'home-socket-card', 'home-river-card', 'home-energy-card', 'home-energy-details-card', 'home-battery-card']) {
    assert.equal(typeof registry.get(name), 'function', `${name} is registered`);
  }
});

test('empty editor stubs are safe and invalid configuration types report the option', async () => {
  const { registry } = await loadCards();
  const Dashboard = registry.get('home-dashboard');
  const dashboard = new Dashboard();
  dashboard._render = () => {};
  dashboard._updateDynamic = () => {};
  assert.doesNotThrow(() => dashboard.setConfig(Dashboard.getStubConfig()));
  dashboard._hass = { states: {} };
  assert.doesNotThrow(() => dashboard._boiler());
  assert.throws(() => dashboard.setConfig({ boiler_entity: 17 }), /boiler_entity/);
  assert.throws(() => dashboard.setConfig([]), /object/);

  const Socket = registry.get('home-socket-card');
  const socket = new Socket();
  socket._render = () => {};
  assert.doesNotThrow(() => socket.setConfig(Socket.getStubConfig()));
  assert.throws(() => socket.setConfig({ switch_entity: {} }), /switch_entity/);
  assert.throws(() => socket.setConfig({ energy_label: 2 }), /energy_label/);
  assert.doesNotThrow(() => socket.setConfig({ title: { type: 'device', device_id: 'device-1' } }));
  socket.setConfig({ switch_entity: 'switch.plug' });
  socket._updateDynamic = () => {};
  socket._rendered = true;
  socket.hass = { states: { 'switch.plug': { state: 'off' }, 'switch.other': { state: 'on' } } };
  assert.deepEqual([...socket._entitySignatures.keys()], ['switch.plug']);
});

test('the dashboard tracks only configured entities and never guesses an air entity', async () => {
  const { registry } = await loadCards();
  const Dashboard = registry.get('home-dashboard');
  const dashboard = new Dashboard();
  dashboard._render = () => {};
  dashboard._updateDynamic = () => {};
  dashboard.setConfig({ air_entity: 'climate.office', boiler_entity: 'water_heater.tank' });
  dashboard._rendered = true;
  dashboard.hass = { states: {
    'climate.office': { state: 'off' },
    'climate.living_room': { state: 'cool' },
    'water_heater.tank': { state: 'off' },
  } };
  assert.equal(dashboard._airId(), 'climate.office');
  assert.deepEqual([...dashboard._entitySignatures.keys()].sort(), ['climate.office', 'water_heater.tank']);

  dashboard.setConfig({ boiler_entity: 'water_heater.tank' });
  dashboard.hass = { states: { 'climate.living_room': { state: 'cool' } } };
  assert.equal(dashboard._airId(), null);
});

test('disconnect clears pending temperature and socket timers and reconnect renders again', async () => {
  const { registry, timers, clearedTimers, window } = await loadCards();
  const Dashboard = registry.get('home-dashboard');
  const dashboard = new Dashboard();
  let renders = 0;
  dashboard._render = () => { renders++; dashboard._rendered = true; };
  dashboard.setConfig({ boiler_entity: 'climate.boiler' });
  dashboard._pendingTargets.set('climate.boiler', { timer: 11 });
  dashboard.disconnectedCallback();
  assert.equal(dashboard._pendingTargets.size, 0);
  assert.ok(clearedTimers.includes(11));
  const disconnectedGeneration = dashboard._generation;
  dashboard._hass = { states: {} };
  dashboard.connectedCallback();
  assert.ok(dashboard._generation >= disconnectedGeneration);
  assert.equal(renders, 2);

  const Socket = registry.get('home-socket-card');
  const socket = new Socket();
  socket._render = () => { socket._rendered = true; };
  socket.setConfig({ switch_entity: 'switch.plug' });
  socket._hass = {
    states: { 'switch.plug': { state: 'off', attributes: {} } },
    callService: () => new Promise(resolve => { socket.resolveService = resolve; }),
  };
  socket._available = () => true;
  socket._state = () => ({ state: 'off', attributes: {} });
  socket._updateSocket = () => {};
  socket._setHidden = () => {};
  socket._setText = () => {};
  let updates = 0;
  socket._updateSocket = () => { updates++; };
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
  graphDashboard.setConfig({ power_entity: 'sensor.power' });
  const slot = { dataset: { graph: 'boiler' }, replaceChildren() {} };
  graphDashboard.shadowRoot.querySelectorAll = () => [slot];
  let resolveHelpers;
  let createdCards = 0;
  window.loadCardHelpers = () => new Promise(resolve => { resolveHelpers = resolve; });
  const graphMount = graphDashboard._mountGraphs(graphDashboard._generation);
  graphDashboard.disconnectedCallback();
  resolveHelpers({ createCardElement() { createdCards++; return {}; } });
  await graphMount;
  assert.equal(createdCards, 0);
});

test('an older service completion does not clear a newer request busy state', async () => {
  const { registry } = await loadCards();
  const Dashboard = registry.get('home-dashboard');
  const dashboard = new Dashboard();
  dashboard._render = () => {};
  dashboard._updateDynamic = () => {};
  dashboard.setConfig({ boiler_entity: 'climate.boiler' });
  const resolvers = [];
  dashboard._hass = { callService: () => new Promise(resolve => resolvers.push(resolve)) };

  const previous = dashboard._service('climate', 'turn_on', { entity_id: 'climate.boiler' });
  dashboard.setConfig({ boiler_entity: 'climate.boiler' });
  const current = dashboard._service('climate', 'turn_off', { entity_id: 'climate.boiler' });
  resolvers[0]();
  await previous;
  assert.equal(dashboard._busy('climate.boiler'), true);
  resolvers[1]();
  await current;
  assert.equal(dashboard._busy('climate.boiler'), false);
});

