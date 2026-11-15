"use client";

import { useSyncExternalStore } from "react";
import { chooseMotionProfile, type MotionProfile } from "@/lib/motion";

type Connection = EventTarget & { saveData?: boolean };
type DeviceNavigator = Navigator & { deviceMemory?: number; connection?: Connection };
const listeners = new Set<() => void>();
let profile: MotionProfile = "lite";
let disconnect: (() => void) | undefined;

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const touch = matchMedia("(pointer: coarse)");
    const device = navigator as DeviceNavigator;
    const update = () => {
      const next = chooseMotionProfile({ reducedMotion: reduced.matches, coarsePointer: touch.matches,
        saveData: device.connection?.saveData, cores: device.hardwareConcurrency, memory: device.deviceMemory });
      if (profile !== next) { profile = next; listeners.forEach((notify) => notify()); }
    };
    reduced.addEventListener("change", update);
    touch.addEventListener("change", update);
    device.connection?.addEventListener("change", update);
    disconnect = () => {
      reduced.removeEventListener("change", update);
      touch.removeEventListener("change", update);
      device.connection?.removeEventListener("change", update);
    };
    update();
  }
  return () => { listeners.delete(listener); if (!listeners.size) { disconnect?.(); disconnect = undefined; } };
}

const getSnapshot = () => profile;
const getServerSnapshot = (): MotionProfile => "lite";

/** One shared policy for scrolling, reveals and decorative effects. */
export function useMotionProfile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
