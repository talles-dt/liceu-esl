const BRT = "America/Sao_Paulo";

const MON_OFFSET: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

function addCalendarDaysUtc(
  y: number,
  m: number,
  d: number,
  delta: number
): { y: number; m: number; d: number } {
  const dt = new Date(Date.UTC(y, m - 1, d + delta, 12, 0, 0));
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

function brtYmdWeekday(now: Date): { y: number; m: number; d: number; wd: string } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: BRT,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
  const parts = fmt.formatToParts(now);
  const y = Number(parts.find((p) => p.type === "year")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "month")?.value ?? "0");
  const d = Number(parts.find((p) => p.type === "day")?.value ?? "0");
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  return { y, m, d, wd };
}

/** ISO instant for Monday 00:00 America/Sao_Paulo in the week containing `now`. */
export function brtMondayStartUtcIso(now: Date = new Date()): string {
  const { y, m, d, wd } = brtYmdWeekday(now);
  const offset = MON_OFFSET[wd] ?? 0;
  const mon = addCalendarDaysUtc(y, m, d, -offset);
  const monStr = `${String(mon.y).padStart(4, "0")}-${String(mon.m).padStart(2, "0")}-${String(mon.d).padStart(2, "0")}`;
  return new Date(`${monStr}T00:00:00-03:00`).toISOString();
}

/** ISO instant for the following Monday 00:00 (week window end, exclusive). */
export function brtNextMondayStartUtcIso(now: Date = new Date()): string {
  const start = brtMondayStartUtcIso(now);
  const d = new Date(start);
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString();
}
