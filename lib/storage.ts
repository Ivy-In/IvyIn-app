// Storage plan and alert thresholds. Pure values, safe to import anywhere.
// GB here means 1024^3 bytes, which is the conservative reading of "50 GB".
export const GB = 1024 ** 3;
export const PLAN_BYTES = 50 * GB;
export const WARN_BYTES = 40 * GB;
export const CRITICAL_BYTES = 45 * GB;

export type Level = "ok" | "warn" | "critical";

export function levelFor(bytes: number): Level {
  if (bytes >= CRITICAL_BYTES) return "critical";
  if (bytes >= WARN_BYTES) return "warn";
  return "ok";
}
