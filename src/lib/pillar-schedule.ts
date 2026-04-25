const BRT = "America/Sao_Paulo";

export type PillarKey = "grammar" | "logic" | "communication";

/**
 * CLAUDE.md rotating pillar (BRT calendar weekday):
 * Grammar Mon/Wed, Logic Thu/Sat, Communication Tue/Fri/Sun.
 */
export function pillarForBrtDate(now: Date = new Date()): PillarKey {
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: BRT,
    weekday: "short",
  }).format(now);

  switch (wd) {
    case "Mon":
    case "Wed":
      return "grammar";
    case "Thu":
    case "Sat":
      return "logic";
    case "Tue":
    case "Fri":
    case "Sun":
      return "communication";
    default:
      return "grammar";
  }
}
