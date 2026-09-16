import assert from "node:assert/strict";
import test from "node:test";
import { getCanaryRestDelay, pickCanaryAmbientAction } from "./canaryAmbient.js";

test("rest delays cover five to eleven seconds", () => {
  assert.equal(getCanaryRestDelay(() => 0), 5000);
  assert.equal(getCanaryRestDelay(() => 0.5), 8000);
  assert.equal(getCanaryRestDelay(() => 1), 11000);
});

test("quiet choices include curiosity and rest, with fewer hops and no glitch", () => {
  const counts = new Map();
  for (let i = 0; i < 100; i += 1) {
    const action = pickCanaryAmbientAction(null, () => (i + 0.5) / 100);
    counts.set(action, (counts.get(action) || 0) + 1);
  }
  assert.deepEqual(new Set(counts.keys()), new Set(["blink", "curious", "hop", null]));
  assert(counts.get("blink") > counts.get("hop"));
  assert(counts.get("curious") > counts.get("hop"));
  assert(counts.get(null) > counts.get("hop"));
});

test("each previous gesture is excluded without removing the quiet option", () => {
  for (const previous of ["blink", "curious", "hop"]) {
    const choices = Array.from({ length: 100 }, (_, i) =>
      pickCanaryAmbientAction(previous, () => (i + 0.5) / 100)
    );
    assert(!choices.includes(previous));
    assert(choices.includes(null));
    assert.equal(new Set(choices).size, 3);
  }
});
