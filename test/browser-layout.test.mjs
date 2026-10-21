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
  await page.waitForFunction(() => window.fixture?.cards?.length === 6);
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
