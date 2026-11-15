import assert from "node:assert/strict";
import test from "node:test";
import { trackProgress, fanTransform } from "../components/landing/math";

test("scroll scenes reach both ends on mobile, landscape and desktop", () => {
  for (const viewport of [320, 667, 844, 1080]) {
    const height = viewport * 4;
    assert.equal(trackProgress(100, height, viewport), 0);
    assert.equal(trackProgress(0, height, viewport), 0);
    assert.equal(trackProgress(-(height - viewport) / 2, height, viewport), 0.5);
    assert.equal(trackProgress(-(height - viewport), height, viewport), 1);
    assert.equal(trackProgress(-height, height, viewport), 1);
  }
});

test("short scroll scenes never divide by zero", () => {
  assert.equal(trackProgress(0, 667, 667), 1);
  assert.equal(trackProgress(1, 500, 667), 0);
});

test("the active location remains centred and readable in both deck layouts", () => {
  for (const compact of [true, false]) {
    for (const active of [0, 5, 10]) {
      const current = fanTransform(active, active, 1, compact);
      assert.equal(current.x, 0);
      assert.equal(current.rotate, 0);
      assert.equal(current.scale, 1);
      assert.equal(current.hidden, false);
      assert.ok(current.zIndex > fanTransform(active + 1, active, 1, compact).zIndex);
      assert.equal(fanTransform(active + 4, active, 1, compact).hidden, true);
    }
  }
});
