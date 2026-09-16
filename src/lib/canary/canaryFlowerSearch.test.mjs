import assert from "node:assert/strict";
import test from "node:test";
import { createCanaryFlowerSearch } from "./canaryFlowerSearch.js";

test("searches vary between one glance and looking in both directions", () => {
  const shortSearch = createCanaryFlowerSearch(() => 1);
  const fullSearch = createCanaryFlowerSearch(() => 0);

  assert.equal(shortSearch.looks.length, 1);
  assert.equal(fullSearch.looks.length, 2);
  assert.equal(fullSearch.looks[1].facing, -fullSearch.looks[0].facing);
  assert.notEqual(shortSearch.looks[0].facing, fullSearch.looks[0].facing);
});

test("search stays brief and uses stationary gestures before approaching", () => {
  for (let i = 0; i <= 100; i += 1) {
    const plan = createCanaryFlowerSearch(() => i / 100);
    assert(plan.approachDelay >= 450 && plan.approachDelay <= 1400);
    for (const look of plan.looks) {
      assert(["curious", "blink"].includes(look.action));
      assert([-1, 1].includes(look.facing));
      assert(look.delay >= 250 && look.delay <= 800);
    }
    // Even the longest search leaves time to travel during the flower's life.
    const searchDuration = plan.looks.reduce(
      (total, look) => total + look.delay + (look.action === "curious" ? 760 : 450),
      plan.approachDelay
    );
    assert(searchDuration + 1650 < 7600);
  }
});
