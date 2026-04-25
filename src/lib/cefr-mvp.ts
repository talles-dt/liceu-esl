import type { CefrLevel } from "@/types/database";

/** CLAUDE.md MVP scope: A2–C1 only (no A1 beginner track; C2 clamped to C1). */
export function clampToMvpCefr(level: CefrLevel | string | null | undefined): CefrLevel {
  if (!level) return "B1";
  const key = String(level).toUpperCase();
  const map: Record<string, CefrLevel> = {
    A1: "A2",
    A2: "A2",
    B1: "B1",
    B2: "B2",
    C1: "C1",
    C2: "C1",
  };
  return map[key] ?? "B1";
}
