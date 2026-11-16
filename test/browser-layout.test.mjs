import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { chromium } from "playwright";

let server;
let browser;
let previewUrl;

test.before(async () => {
  const files = new Map([
    ["/", ["./preview-frame.html", "text/html"]],
    ["/preview-frame.html", ["./preview-frame.html", "text/html"]],
    ["/dist/home-device-cards.js", ["../dist/home-device-cards.js", "text/javascript"]],
  ]);
  server = createServer(async (request, response) => {
    const file = files.get(new URL(request.url, "http://localhost").pathname);
    if (!file || request.method !== "GET") {
      response.writeHead(404).end();
      return;
    }
    try {
      const body = await readFile(new URL(file[0], import.meta.url));
      response.writeHead(200, {
        "Content-Type": `${file[1]}; charset=utf-8`,
        "Cache-Control": "no-store",
      }).end(body);
    } catch (error) {
      response.writeHead(500).end(String(error));
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  previewUrl = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
});

test.after(async () => {
  await browser?.close();
  if (server?.listening) await new Promise((resolve) => server.close(resolve));
});

async function openFixture(width, height = 1500, options = {}) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
    ...options,
  });
  await page.goto(`${previewUrl}/preview-frame.html`);
  await page.waitForFunction(() => window.fixture?.cards?.length === 8);
  return page;
}

function intersects(left, right) {
  return (
    Math.min(left.right, right.right) > Math.max(left.left, right.left) &&
    Math.min(left.bottom, right.bottom) > Math.max(left.top, right.top)
  );
}

test("sensor cards reflect leak, door, vibration, battery and unavailable states", async () => {
  const page = await openFixture(360);
  try {
    const leak = page.locator("home-leak-card"), door = page.locator("home-door-card");
    const text = (card, selector) => card.locator(selector).innerText();
    assert.equal(await text(leak, ".sensor-status"), "Сухо");
    assert.equal(await text(leak, "h2"), "Туалет");
    assert.equal(await text(door, ".sensor-status"), "Зачинено");
    assert.equal(await text(door, '[data-live="vibration-value"]'), "Без вібрації");
    assert.equal(await text(leak, '[data-live="sensor-battery-value"]'), "65");
    assert.equal(await text(leak, '[data-live="sensor-lqi-value"]'), "142");
    assert.equal(await door.locator('[data-live="sensor-lqi"]').count(), 0);
    assert.ok(await leak.locator(".sensor-status-card").textContent().then(value => value.includes("Туалет")));
    await page.evaluate(() => {
      const { hass, refresh } = window.fixture;
      hass.states["binary_sensor.example_51"].state = "on";
      hass.states["binary_sensor.example_53"].state = "on";
      hass.states["binary_sensor.example_54"].state = "on";
      hass.states["sensor.example_linkquality"].state = "0";
      refresh();
    });
    assert.equal(await text(leak, ".sensor-status"), "Виявлено воду");
    assert.equal(await text(leak, "h2"), "Туалет");
    assert.equal(await text(door, ".sensor-status"), "Відчинено");
    assert.equal(await text(door, '[data-live="vibration-value"]'), "Вібрація");
    assert.equal(await text(leak, '[data-live="sensor-lqi-value"]'), "0");
    assert.ok(await leak.locator('[data-live="sensor-lqi"]').isVisible());
    const leakActiveBackground = await leak.locator(".sensor-icon").evaluate(el => getComputedStyle(el).backgroundColor);
    assert.notEqual(leakActiveBackground, "rgba(0, 0, 0, 0)");
    await page.evaluate(() => {
      const { hass, refresh } = window.fixture;
      hass.states["binary_sensor.example_51"].state = "unavailable";
      hass.states["binary_sensor.example_54"].state = "unknown";
      hass.states["sensor.example_linkquality"].state = "unavailable";
      hass.themes = { darkMode: true };
      refresh();
    });
    assert.equal(await text(leak, ".sensor-status"), "Немає зв’язку");
    assert.equal(await text(door, '[data-live="vibration-value"]'), "Стан невідомий");
    assert.equal(await leak.locator('[data-live="sensor-battery"]').evaluate(el => el.hidden), false);
    assert.equal(await leak.locator('[data-live="sensor-lqi"]').isVisible(), false);
    assert.equal(await leak.evaluate(el => el.hasAttribute("dark")), true);
    const darkAppearance = await leak.locator(".sensor-status-card").evaluate(el => ({ background: getComputedStyle(el).backgroundColor, padding: getComputedStyle(el).padding }));
    assert.equal(darkAppearance.background, "rgb(36, 40, 43)");
    assert.equal(darkAppearance.padding, "14px");
    await page.evaluate(() => {
      const { hass, refresh } = window.fixture;
      hass.states["binary_sensor.example_54"].state = "unavailable";
      hass.states["sensor.example_linkquality"].state = "255";
      refresh();
    });
    assert.equal(await door.locator('[data-live="vibration-missing"]').innerText(), "Вібрація: немає зв’язку");
    assert.equal(await text(leak, '[data-live="sensor-lqi-value"]'), "255");
    await page.evaluate(() => {
      const { hass, refresh } = window.fixture;
      hass.states["binary_sensor.example_51"].state = "unknown";
      refresh();
    });
    assert.equal(await text(leak, ".sensor-status"), "Стан невідомий");
    await page.evaluate(() => {
      const main = document.querySelector("main");
      const grid = document.createElement("div");
      grid.style.cssText = "display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px";
      main.prepend(grid);
      grid.append(main.querySelector("home-leak-card"), main.querySelector("home-door-card"));
    });
    for (const width of [320, 360, 900]) {
      await page.setViewportSize({ width, height: 1500 });
      const bounds = await page.evaluate(() => [...document.querySelectorAll("home-leak-card,home-door-card")].map(card => {
        const panel = card.shadowRoot.querySelector(".sensor-status-card");
        const { left, right, top } = panel.getBoundingClientRect();
        const heading = panel.querySelector(".sensor-heading");
        return { left, right, top, scroll: panel.scrollWidth, client: panel.clientWidth, headingFits: heading.scrollWidth <= heading.clientWidth };
      }));
      assert.equal(bounds[0].top, bounds[1].top);
      assert.ok(bounds[0].right <= bounds[1].left && bounds[1].right <= width);
      assert.ok(bounds.every(item => item.scroll <= item.client && item.headingFits));
    }
  } finally { await page.close(); }
});

test("two room cards align without overflow on a phone", async () => {
  const page = await openFixture(320);
  try {
    await page.evaluate(() => {
      const main = document.querySelector("main");
      const kitchen = main.querySelector("home-room-card");
      const balcony = document.createElement("home-room-card");
      const grid = document.createElement("div");
      grid.style.cssText = "display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px";
      kitchen.setConfig({ ...kitchen._config, title: "Кухня" });
      balcony.setConfig({ ...kitchen._config, title: "Балкон" });
      balcony.hass = window.fixture.hass;
      main.prepend(grid);
      grid.append(kitchen, balcony);
    });
    for (const width of [320, 360, 390, 430]) {
      await page.setViewportSize({ width, height: 1500 });
      const cards = await page.locator("home-room-card").evaluateAll(elements => elements.map(card => {
        const panel = card.shadowRoot.querySelector(".room-sensor-card");
        const bounds = panel.getBoundingClientRect();
        const rect = selector => panel.querySelector(selector).getBoundingClientRect();
        const title = panel.querySelector("h2");
        const temperature = rect('[data-room-more="temperature"]');
        const humidity = rect('[data-room-more="humidity"]');
        return {
          top: bounds.top, left: bounds.left, right: bounds.right, height: bounds.height,
          fits: panel.scrollWidth <= panel.clientWidth && title.scrollWidth <= title.clientWidth,
          columnsAlign: rect(".room-battery").left === humidity.left &&
            rect(".room-icon").left === temperature.left && temperature.top === humidity.top,
          graphsHidden: getComputedStyle(panel.querySelector(".room-history")).display === "none",
        };
      }));
      const [left, right] = cards;
      assert.equal(left.top, right.top);
      assert.equal(left.height, right.height);
      assert.ok(left.right <= right.left && right.right <= width);
      assert.ok(cards.every(card => card.fits && card.columnsAlign && card.graphsHidden), JSON.stringify({ width, cards }));
    }
    const humidity = page.locator("home-room-card").first().locator('[data-room-more="humidity"]');
    await humidity.evaluate(button => {
      button.getRootNode().host.addEventListener("hass-more-info", event => {
        window.moreInfoEvent = event.detail.entityId;
      }, { once: true });
    });
    await humidity.click();
    assert.equal(await page.evaluate(() => window.moreInfoEvent), "sensor.example_13");
  } finally {
    await page.close();
  }
});

test("rooms list uses Home Assistant's repeatable editor and opens each reading", async () => {
  const page = await openFixture(320);
  try {
    const config = await page.evaluate(() => {
      const RoomList = customElements.get("home-rooms-card");
      const selector = RoomList.getConfigForm().schema.find(field => field.name === "rooms").selector.object;
      const card = document.createElement("home-rooms-card");
      const { hass } = window.fixture;
      const bedroom = { name: "Спальня", icon: "mdi:bed", temperature_entity: "sensor.example_12", humidity_entity: "sensor.example_13" };
      const rooms = [bedroom, ...Array.from({ length: 12 }, (_, index) => ({
        name: `Кімната ${index + 2}`,
        temperature_entity: `sensor.room_${index + 2}_temperature`,
      }))];
      card.setConfig({ ...RoomList.getStubConfig(), rooms });
      card.hass = hass;
      card.addEventListener("hass-more-info", event => {
        (window.roomHistoryEvents ??= []).push(event.detail.entityId);
      });
      document.querySelector("main").prepend(card);
      return { multiple: selector.multiple, fields: Object.keys(selector.fields), grid: card.getGridOptions() };
    });
    assert.deepEqual(config, {
      multiple: true,
      fields: ["name", "icon", "temperature_entity", "humidity_entity"],
      grid: { columns: 12, rows: "auto", min_columns: 6 },
    });
    const card = page.locator("home-rooms-card");
    assert.equal(await card.getByRole("heading").innerText(), "Мікроклімат");
    const rows = card.getByRole("listitem");
    assert.equal(await rows.count(), 13);
    const bedroom = rows.first();
    const temperature = bedroom.getByRole("button", {name: /^Температура/});
    const humidity = bedroom.getByRole("button", {name: /^Вологість/});
    assert.ok(await temperature.isEnabled());
    assert.ok(await humidity.isEnabled());
    assert.equal(await rows.last().getByRole("button", {name: /^Вологість/}).innerText(), "—");
    assert.equal(await rows.last().getByRole("button", {name: /^Вологість/}).isEnabled(), false);
    assert.equal(await card.locator(".sensor-list").evaluate(panel => panel.scrollWidth <= panel.clientWidth), true);
    await temperature.click();
    await humidity.click();
    assert.deepEqual(await page.evaluate(() => window.roomHistoryEvents), ["sensor.example_12", "sensor.example_13"]);
    await card.evaluate(element => {
      const { hass } = window.fixture;
      hass.states["sensor.example_12"] = { state: "18.4", attributes: { unit_of_measurement: "°C" } };
      hass.states["sensor.example_13"].state = "unavailable";
      element.hass = { ...hass };
    });
    assert.equal(await temperature.innerText(), "18,4 °C");
    assert.equal(await humidity.innerText(), "—");
    assert.ok(await humidity.isEnabled(), "history remains available for an unavailable reading");
  } finally {
    await page.close();
  }
});
test("leak list renders dynamic statuses and opens the selected sensor history", async () => {
  const page = await openFixture(320);
  try {
    const options = await page.evaluate(() => {
      const Card = customElements.get("home-leak-list-card");
      const card = document.createElement("home-leak-list-card");
      const { hass } = window.fixture;
      const ids = ["binary_sensor.example_51", "binary_sensor.test_wet", "binary_sensor.test_unavailable", "binary_sensor.test_unknown"];
      hass.states[ids[1]] = { state: "on" };
      hass.states[ids[2]] = { state: "unavailable" };
      hass.states[ids[3]] = { state: "unknown" };
      const sensors = ["Туалет", "Біля пральної машини", "Ванна", "Комора"].map((name, index) => ({ name, entity: ids[index] }));
      card.setConfig({ ...Card.getStubConfig(), sensors });
      card.hass = hass;
      card.addEventListener("hass-more-info", event => { window.leakHistoryEntity = event.detail.entityId; });
      document.querySelector("main").prepend(card);
      const selector = Card.getConfigForm().schema.find(field => field.name === "sensors").selector.object;
      return { multiple: selector.multiple, fields: Object.keys(selector.fields), filter: selector.fields.entity.selector.entity.filter };
    });
    assert.deepEqual(options, { multiple: true, fields: ["name", "entity"], filter: { domain: "binary_sensor", device_class: "moisture" } });
    const card = page.locator("home-leak-list-card");
    const rows = card.getByRole("listitem");
    assert.equal(await card.getByRole("heading").innerText(), "Протікання води");
    assert.deepEqual(await rows.getByRole("button").allInnerTexts(),
      ["Сухо", "Виявлено воду", "Немає зв’язку", "Стан невідомий"]);
    assert.equal(await card.locator(".sensor-list").evaluate(panel => panel.scrollWidth <= panel.clientWidth), true);
    const water = card.getByRole("button", { name: /^Біля пральної машини/ });
    assert.equal(await water.getAttribute("data-state"), "active");
    await water.click();
    assert.equal(await page.evaluate(() => window.leakHistoryEntity), "binary_sensor.test_wet");
    await card.evaluate(element => {
      const { hass } = window.fixture;
      hass.states["binary_sensor.test_wet"].state = "off";
      element.hass = { ...hass };
    });
    assert.equal(await water.innerText(), "Сухо");
    assert.equal(await water.getAttribute("data-state"), "normal");
  } finally {
    await page.close();
  }
});

test("sensor list headers align and separate from the first row at phone widths", async () => {
  const page = await openFixture(320);
  try {
    await page.evaluate(() => {
      const climate = document.createElement("home-rooms-card");
      climate.setConfig({ rooms: [{ name: "Спальня", temperature_entity: "sensor.example_12", humidity_entity: "sensor.example_13" }] });
      const leaks = document.createElement("home-leak-list-card");
      leaks.setConfig({ sensors: [{ name: "Біля пралки", entity: "binary_sensor.example_51" }] });
      climate.hass = leaks.hass = window.fixture.hass;
      document.querySelector("main").prepend(climate, leaks);
    });
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 1500 });
      const bounds = await page.locator("home-rooms-card .sensor-list, home-leak-list-card .sensor-list").evaluateAll(panels =>
        panels.map(panel => {
          const header = panel.querySelector(".sensor-list-heading");
          const title = header.querySelector(".sensor-list-title");
          const row = panel.querySelector("[role=listitem]");
          const rect = element => element.getBoundingClientRect();
          const headerBox = rect(header);
          return {
            height: headerBox.height,
            border: getComputedStyle(header).borderBottomWidth,
            titleLeft: rect(title).left - headerBox.left,
            nameLeft: rect(row.firstElementChild).left - headerBox.left,
            rowHeight: rect(row).height,
            headerIconHeight: rect(title.firstElementChild).height,
            columnLabelsAligned: [...header.querySelectorAll(":scope > span")].every((label, index) =>
              rect(label).right === rect(row.querySelectorAll("button")[index]).right &&
              rect(label).top >= headerBox.top && rect(label).bottom <= headerBox.bottom),
            fits: panel.scrollWidth <= panel.clientWidth,
          };
        }));
      assert.equal(bounds.length, 2);
      assert.deepEqual(bounds[0], bounds[1]);
      assert.equal(bounds[0].border, "1px");
      assert.equal(bounds[0].titleLeft, bounds[0].nameLeft);
      assert.ok(bounds[0].columnLabelsAligned && bounds[0].fits);
    }
  } finally {
    await page.close();
  }
});


test("room temperature and humidity graphs open their native entity details", async () => {
  const page = await openFixture(900);
  try {
    const room = page.locator("home-room-card");
    const temperatureHistory = room.locator('[data-room-more="history-temperature"]');
    const humidityHistory = room.locator('[data-room-more="history-humidity"]');
    await temperatureHistory.waitFor({ state: "visible" });
    await humidityHistory.waitFor({ state: "visible" });
    assert.match(await temperatureHistory.locator("path").getAttribute("d"), /M.*M/);
    assert.match(await humidityHistory.locator("path").getAttribute("d"), /M.*M/);
    assert.deepEqual(await room.locator(".room-history-chart").evaluateAll((charts) =>
      charts.map((chart) => getComputedStyle(chart).height)), ["21px", "21px"]);
    const temperature = room.locator('[data-room-more="temperature"]');
    assert.equal(await temperature.getAttribute("data-entity"), "sensor.example_12");
    const humidity = room.locator('[data-room-more="humidity"]');
    assert.equal(await humidity.getAttribute("data-entity"), "sensor.example_13");
    assert.equal(await temperatureHistory.getAttribute("data-entity"), "sensor.example_12");
    assert.equal(await humidityHistory.getAttribute("data-entity"), "sensor.example_13");
    await temperature.evaluate((button) => {
      button.getRootNode().host.addEventListener("hass-more-info", (event) => {
        window.moreInfoEvent = { entityId: event.detail.entityId, bubbles: event.bubbles, composed: event.composed };
      }, { once: true });
    });
    await temperature.click();
    assert.deepEqual(await page.evaluate(() => window.moreInfoEvent), {
      entityId: "sensor.example_12", bubbles: true, composed: true,
    });
    await humidityHistory.evaluate((button) => {
      button.getRootNode().host.addEventListener("hass-more-info", (event) => {
        window.moreInfoEvent = { entityId: event.detail.entityId, bubbles: event.bubbles, composed: event.composed };
      }, { once: true });
    });
    await humidityHistory.click();
    assert.deepEqual(await page.evaluate(() => window.moreInfoEvent), {
      entityId: "sensor.example_13", bubbles: true, composed: true,
    });
    await room.evaluate((card) => {
      delete card._hass.states["sensor.example_12"];
      card.hass = { ...card._hass };
    });
    assert.equal(await temperature.isEnabled(), false);
    await room.evaluate((card) => {
      card._hass.states["sensor.example_12"] = { state: "unavailable", attributes: {} };
      card.hass = { ...card._hass };
    });
    assert.equal(await temperature.isEnabled(), true);
  } finally {
    await page.close();
  }
});

test("socket energy history leads three clickable readings at phone and desktop widths", async () => {
  for (const width of [360, 500]) {
    const page = await openFixture(width, 1200, {
      isMobile: width === 360,
      hasTouch: width === 360,
    });
    try {
      const socket = page.locator("home-socket-card");
      const energy = socket.locator(".socket-energy");
      const readings = socket.locator(".socket-reading");
      assert.equal(await energy.count(), 1);
      assert.equal(await readings.count(), 3);
      const chart = socket.locator(".socket-energy-chart");
      await chart.waitFor({ state: "visible" });
      assert.equal(await chart.evaluate((svg) => getComputedStyle(svg).height), "38px");
      assert.equal(await socket.locator("svg.socket-energy-chart").count(), 1);
      assert.equal(await chart.locator("path").getAttribute("d").then((path) => path.match(/M/g)?.length), 24);
      const layout = await readings.evaluateAll((items) => {
        const panel = items[0].parentElement;
        return {
          scroll: panel.scrollWidth,
          client: panel.clientWidth,
          items: items.map((item) => {
            const { left, right, top, bottom } = item.getBoundingClientRect();
            return { left, right, top, bottom };
          }),
        };
      });
      assert.ok(layout.scroll <= layout.client, "reading strip fits at " + width + "px");
      for (let i = 0; i < layout.items.length; i++) {
        for (let j = i + 1; j < layout.items.length; j++)
          assert.equal(intersects(layout.items[i], layout.items[j]), false, "readings do not overlap at " + width + "px");
      }
      if (width === 500 && process.env.SOCKET_PREVIEW_PATH)
        await socket.screenshot({ path: process.env.SOCKET_PREVIEW_PATH });
      if (width === 360 && process.env.SOCKET_PREVIEW_MOBILE_PATH)
        await socket.screenshot({ path: process.env.SOCKET_PREVIEW_MOBILE_PATH });

      for (const button of [energy, ...await readings.all()]) {
        const entity = await button.getAttribute("data-entity");
        await button.evaluate((element) => {
          element.getRootNode().host.addEventListener("hass-more-info", (event) => {
            window.moreInfoEvent = event.detail.entityId;
          }, { once: true });
        });
        await button.click();
        assert.equal(await page.evaluate(() => window.moreInfoEvent), entity);
      }
      assert.equal(await page.evaluate(() => window.fixture.serviceCalls), 0, "metric clicks do not toggle the socket");
      assert.equal(await socket.locator('[data-action="socket-toggle"]').count(), 1);
    } finally {
      await page.close();
    }
  }
});
test("360px touch layout keeps controls and readings separated", async () => {
  const page = await openFixture(360, 1500, { isMobile: true, hasTouch: true });
  try {
    const layout = await page.evaluate(() => {
      const air = document.querySelector("home-air-card");
      const boiler = document.querySelector("home-boiler-card");
      const root = air.shadowRoot;
      const temperature = root.querySelector(".air-temperature");
      const tempItems = Array.from(temperature.children).map((element) => {
        const { left, right, top, bottom } = element.getBoundingClientRect();
        return { left, right, top, bottom };
      });
      const fanButtons = Array.from(
        root.querySelectorAll("[data-air-fan-speeds] > button"),
      ).map((element) => {
        const { left, right, top, bottom } = element.getBoundingClientRect();
        return { left, right, top, bottom };
      });
      const boilerRoot = boiler.shadowRoot,
        current = boilerRoot.querySelector(".water-large>.current"),
        adjust = boilerRoot.querySelector(".water-large .adjust"),
        adjustItems = Array.from(adjust.children).map((element) => {
          const { left, right, top, bottom } = element.getBoundingClientRect();
          return { left, right, top, bottom };
        });
      const currentRect = current.getBoundingClientRect().toJSON();
      return {
        viewportWidth: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        temperatureWidth: temperature.scrollWidth,
        temperatureClientWidth: temperature.clientWidth,
        tempItems,
        fanButtons,
        fanWidth: root.querySelector("[data-air-fan-speeds]").scrollWidth,
        fanClientWidth: root.querySelector("[data-air-fan-speeds]").clientWidth,
        boiler: {
          current: currentRect,
          adjustItems,
          scrollWidth: boilerRoot.querySelector(".water-large").scrollWidth,
          clientWidth: boilerRoot.querySelector(".water-large").clientWidth,
        },
      };
    });
    assert.ok(layout.documentWidth <= layout.viewportWidth, "no page overflow");
    assert.ok(layout.temperatureWidth <= layout.temperatureClientWidth);
    assert.ok(layout.fanWidth <= layout.fanClientWidth);
    for (let i = 0; i < layout.tempItems.length; i++)
      for (let j = i + 1; j < layout.tempItems.length; j++)
        assert.equal(intersects(layout.tempItems[i], layout.tempItems[j]), false);
    for (let i = 0; i < layout.fanButtons.length; i++)
      for (let j = i + 1; j < layout.fanButtons.length; j++)
        assert.equal(intersects(layout.fanButtons[i], layout.fanButtons[j]), false);
    assert.ok(layout.boiler.scrollWidth <= layout.boiler.clientWidth);
    for (const item of layout.boiler.adjustItems)
      assert.equal(intersects(layout.boiler.current, item), false);
    for (let i = 0; i < layout.boiler.adjustItems.length; i++)
      for (let j = i + 1; j < layout.boiler.adjustItems.length; j++)
        assert.equal(intersects(layout.boiler.adjustItems[i], layout.boiler.adjustItems[j]), false);
  } finally {
    await page.close();
  }
});

test("desktop and narrow cards follow their own container width", async () => {
  const page = await openFixture(1280);
  try {
    const air = page.locator("home-air-card");
    const panel = air.locator(".panel");
    const desktopMinHeight = await panel.evaluate(
      (element) => getComputedStyle(element).minHeight,
    );
    assert.equal(desktopMinHeight, "300px");

    await air.evaluate((element) => (element.style.width = "360px"));
    const narrowMinHeight = await panel.evaluate(
      (element) => getComputedStyle(element).minHeight,
    );
    assert.notEqual(narrowMinHeight, "300px");
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      "narrow card does not cause desktop viewport overflow",
    );
  } finally {
    await page.close();
  }
});

test("standalone boiler uses natural panel height at phone and desktop widths", async () => {
  for (const width of [360, 480, 900]) {
    const page = await openFixture(width, 1500, {
      isMobile: width === 360,
      hasTouch: width === 360,
    });
    try {
      const boiler = page.locator("home-boiler-card");
      const panel = boiler.locator('[data-live-panel="boiler"]');
      const initial = await panel.evaluate((element) => ({
        minHeight: getComputedStyle(element).minHeight,
        timeHidden: element.querySelector('[data-live="boiler-time"]').hidden,
        bottomGap: element.getBoundingClientRect().bottom -
          element.querySelector(".features").getBoundingClientRect().bottom,
        paddingBottom: parseFloat(getComputedStyle(element).paddingBottom),
      }));
      assert.equal(initial.minHeight, "0px", `boiler min-height at ${width}px`);
      assert.equal(initial.timeHidden, false, `heating time visible at ${width}px`);
      assert.ok(
        Math.abs(initial.bottomGap - initial.paddingBottom) <= 1,
        `no excess bottom space at ${width}px`,
      );

      await page.evaluate(() => {
        const { hass, refresh } = window.fixture;
        hass.states = {
          ...hass.states,
          "water_heater.example_1": {
            ...hass.states["water_heater.example_1"],
            attributes: {
              ...hass.states["water_heater.example_1"].attributes,
              heating: false,
              hvac_action: "idle",
            },
          },
        };
        refresh();
      });
      assert.equal(
        await panel.locator('[data-live="boiler-time"]').isHidden(),
        true,
        `heating time hidden when not heating at ${width}px`,
      );
    } finally {
      await page.close();
    }
  }
});

test("TV remote follows the approved compact layout at 360px and desktop widths", async () => {
  for (const width of [360, 900]) {
    const page = await openFixture(width, 1500, {
      isMobile: width === 360,
      hasTouch: width === 360,
    });
    try {
      const tv = page.locator("home-tv-card"),
        geometry = await tv.evaluate((element) => {
          const root = element.shadowRoot,
            card = root.querySelector('[data-live-panel="tv"]'),
            dpad = root.querySelector(".tv-dpad"),
            system = root.querySelector(".tv-system"),
            media = root.querySelector(".tv-media"),
            buttons = Array.from(root.querySelectorAll("button[data-action]"));
          return {
            viewport: innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            cardWidth: card.getBoundingClientRect().width,
            hostWidth: element.getBoundingClientRect().width,
            dpadWidth: dpad.getBoundingClientRect().width,
            gap: system.getBoundingClientRect().top - dpad.getBoundingClientRect().bottom,
            systemWidth: system.getBoundingClientRect().width,
            mediaWidth: media.getBoundingClientRect().width,
            buttons: buttons.map((button) => {
              const rect = button.getBoundingClientRect();
              return { width: rect.width, height: rect.height, label: button.getAttribute("aria-label") };
            }),
            hasMiButton: buttons.some((button) => button.getAttribute("aria-label")?.includes("PatchWall")),
          };
        });
      assert.ok(geometry.documentWidth <= geometry.viewport);
      assert.equal(geometry.cardWidth, geometry.hostWidth);
      assert.equal(geometry.dpadWidth, 140);
      assert.equal(geometry.gap, 24);
      assert.equal(geometry.systemWidth, 232);
      assert.equal(geometry.mediaWidth, 232);
      assert.ok(geometry.buttons.every((button) => button.width >= 44 && button.height >= 44));
      assert.ok(geometry.buttons.every((button) => button.label));
      assert.equal(geometry.hasMiButton, false);
      const status = tv.locator('[data-live="tv-status"]');
      assert.equal(await status.textContent(), "Увімкнено · Jellyfin");
      const preserved = await page.evaluate(() => {
        const { hass, refresh } = window.fixture;
        const tvCard = document.querySelector("home-tv-card"),
          article = tvCard.shadowRoot.querySelector('[data-live-panel="tv"]');
        hass.states = {
          ...hass.states,
          "media_player.example_50": {
            state: "paused",
            attributes: { app_name: "Netflix", volume_level: 0.55 },
          },
        };
        refresh();
        return article === tvCard.shadowRoot.querySelector('[data-live-panel="tv"]');
      });
      assert.equal(await status.textContent(), "Увімкнено · Netflix");
      assert.equal(preserved, true);

      await tv.locator('[data-command="POWER"]').focus();
      await page.keyboard.press("Tab");
      assert.equal(
        await tv.evaluate((element) => element.shadowRoot.activeElement?.getAttribute("aria-label")),
        "Відкрити асистента",
      );
      await page.evaluate(() => document.querySelector("#dark").click());
      assert.equal(await tv.evaluate((element) => element.hasAttribute("dark")), true);
      await page.evaluate(() => document.querySelector("#offline").click());
      assert.equal(await tv.locator('[data-action="tv-send"]').count(), 15);
      assert.ok(await tv.locator('[data-action="tv-send"]').evaluateAll((buttons) => buttons.every((button) => button.disabled)));
      assert.equal(await page.evaluate(() => window.fixture.serviceCalls), 0);
    } finally {
      await page.close();
    }
  }
});
test("powered-off AC settings stay disabled and resume when powered on", async () => {
  const page = await openFixture(360);
  try {
    const air = page.locator("home-air-card");
    await page.evaluate(() => {
      const { hass, cards, refresh } = window.fixture;
      const entity = cards[1]._config.air_entity;
      hass.states[entity] = { ...hass.states[entity], state: "off" };
      refresh();
    });
    const settings = air.locator('button[data-action]:not([data-action="air-power"])');
    assert.ok(await settings.evaluateAll((buttons) => buttons.every((button) => button.disabled)));
    assert.equal(await air.locator('[data-action="air-power"]').isEnabled(), true);
    assert.equal(await air.locator('.mode[aria-pressed="true"]').count(), 0);
    await air.evaluate((card) => {
      for (const action of ["air-mode", "air-plus", "air-fan-mode", "feature", "air-swing-palette"])
        card._click({ target: { closest: () => ({ dataset: { action, mode: "cool" }, disabled: false }) } });
    });
    assert.equal(await page.evaluate(() => window.fixture.serviceCalls), 0);
    await page.evaluate(() => {
      const { hass, cards, refresh } = window.fixture;
      const entity = cards[1]._config.air_entity;
      hass.states[entity] = { ...hass.states[entity], state: "heat" };
      refresh();
    });
    assert.equal(await air.locator('[data-action="air-plus"]').isEnabled(), true);
    assert.equal(await air.locator('[data-action="air-mode"][data-mode="heat"]').isEnabled(), true);
    assert.equal(await air.locator('[data-action="air-mode"][data-mode="heat"]').getAttribute("aria-pressed"), "true");
  } finally {
    await page.close();
  }
});

test("powered-off boiler settings stay disabled and resume when powered on", async () => {
  const page = await openFixture(900);
  try {
    const boiler = page.locator("home-boiler-card");
    for (const state of ["off", "heat"]) {
      await page.evaluate((state) => {
        const { hass, cards, refresh } = window.fixture;
        const entity = cards[0]._config.boiler_entity;
        hass.states[entity] = { ...hass.states[entity], state };
        refresh();
      }, state);
      assert.equal(await boiler.locator('[data-action="boiler-power"]').isEnabled(), true);
      assert.equal(await boiler.locator('[data-action="boiler-plus"]').isEnabled(), state !== "off");
      const settings = boiler.locator('button[data-action]:not([data-action="boiler-power"])');
      if (state === "off") {
        assert.ok(await settings.evaluateAll((buttons) => buttons.every((button) => button.disabled)));
        await boiler.evaluate((card) => {
          for (const action of ["boiler-plus", "boiler-minus", "feature"])
            card._click({ target: { closest: () => ({ dataset: { action }, disabled: false }) } });
        });
      }
    }
    assert.equal(await page.evaluate(() => window.fixture.serviceCalls), 0);
  } finally {
    await page.close();
  }
});

test("dark mode, offline recovery, and controls stay synthetic", async () => {
  const page = await openFixture(900);
  try {
    const air = page.locator("home-air-card");
    const river = page.locator("home-river-card");
    const textColor = await air.evaluate((element) =>
      getComputedStyle(element).getPropertyValue("--k-text").trim(),
    );
    await page.locator("#dark").click();
    assert.notEqual(
      await air.evaluate((element) =>
        getComputedStyle(element).getPropertyValue("--k-text").trim(),
      ),
      textColor,
    );

    await page.locator("#offline").click();
    assert.equal(await river.locator(".river-card").getAttribute("data-offline"), "true");
    assert.equal(await river.locator('[data-live="river-offline-note"]').isVisible(), true);
    await page.locator("#online").click();
    assert.equal(await river.locator(".river-card").getAttribute("data-offline"), "false");
    assert.equal(await river.locator('[data-live="river-offline-note"]').isVisible(), false);

    const airControls = await air.evaluate((element) => ({
      modes: element.shadowRoot.querySelectorAll('[data-action="air-mode"]').length,
      fan: element.shadowRoot.querySelectorAll('[data-air-fan-speeds] > button').length,
      temperature: !!element.shadowRoot.querySelector('[data-action="air-plus"]'),
    }));
    assert.ok(airControls.modes > 0);
    assert.ok(airControls.fan > 0);
    assert.equal(airControls.temperature, true);
    await air.locator('[data-action="air-plus"]').click();
    assert.equal(await page.evaluate(() => window.fixture.serviceCalls), 1);
  } finally {
    await page.close();
  }
});
