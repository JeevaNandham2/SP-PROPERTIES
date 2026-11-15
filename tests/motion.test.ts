import assert from "node:assert/strict";
import test from "node:test";
import { chooseMotionProfile } from "../lib/motion";

test("reduced motion takes precedence over every device hint", () => {
  assert.equal(chooseMotionProfile({ reducedMotion: true, coarsePointer: false, cores: 16, memory: 16 }), "reduced");
  assert.equal(chooseMotionProfile({ reducedMotion: true, coarsePointer: true, saveData: true, cores: 2 }), "reduced");
});

test("touch, low hardware and data saving independently select lighter effects", () => {
  const desktop = { reducedMotion: false, coarsePointer: false, cores: 8, memory: 8 };
  for (const hint of [{ coarsePointer: true }, { cores: 2 }, { memory: 4 }, { saveData: true }]) {
    assert.equal(chooseMotionProfile({ ...desktop, ...hint }), "lite");
  }
});

test("missing or invalid optional device hints leave native capabilities usable", () => {
  assert.equal(chooseMotionProfile({ reducedMotion: false, coarsePointer: false }), "full");
  assert.equal(chooseMotionProfile({ reducedMotion: false, coarsePointer: true }), "lite");
  assert.equal(chooseMotionProfile({ reducedMotion: false, coarsePointer: false, memory: 0, cores: NaN }), "full");
});
