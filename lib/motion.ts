export type MotionProfile = "full" | "lite" | "reduced";

export type MotionCapabilities = {
  reducedMotion: boolean;
  coarsePointer: boolean;
  saveData?: boolean;
  cores?: number;
  memory?: number;
};

/** Optional hardware hints only reduce effects; missing APIs never block navigation. */
export function chooseMotionProfile(capabilities: MotionCapabilities): MotionProfile {
  if (capabilities.reducedMotion) return "reduced";
  const limited = (value: number | undefined) => typeof value === "number" && value > 0 && value <= 4;
  return capabilities.coarsePointer || capabilities.saveData || limited(capabilities.cores) || limited(capabilities.memory)
    ? "lite" : "full";
}
