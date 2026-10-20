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
  await page.waitForFunction(() => window.fixture?.cards?.length === 5);
  return page;
}

function intersects(left, right) {
  return (
    Math.min(left.right, right.right) > Math.max(left.left, right.left) &&
    Math.min(left.bottom, right.bottom) > Math.max(left.top, right.top)
  );
}

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
