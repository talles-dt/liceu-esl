export interface PillarLesson {
  grammar: string;
  logic: string;
  communication: string;
  mnemonic: string;
}

export const FALLBACK_LESSON: PillarLesson = {
  grammar:
    "PT-BR: resistência a artigos. Em inglês, contáveis no singular precisam de *a/an*. Ex.: *a meeting*, não *meeting* sozinho no sentido de 'uma reunião'.",
  logic:
    "Artigos sinalizam se o ouvinte já identifica o referente. Primeira menção → *a/an*; referente compartilhado → *the*.",
  communication:
    "No trabalho remoto: *Can we schedule a quick call?* soa natural; *Can we schedule quick call?* soa incompleto.",
  mnemonic: "OFFICE→GLASS WALL→STICKY NOTE→LEMBRETE NO MONITOR",
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function isValidPillarLesson(v: unknown): v is PillarLesson {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    isNonEmptyString(o.grammar) &&
    isNonEmptyString(o.logic) &&
    isNonEmptyString(o.communication) &&
    isNonEmptyString(o.mnemonic)
  );
}

/** Strip optional ```json fences and parse the first JSON object in the string */
export function extractJsonObject(raw: string): unknown {
  let s = raw.replace(/```(?:json)?\s*/gi, "").replace(/```\s*$/g, "").trim();
  const start = s.indexOf("{");
  if (start === -1) throw new SyntaxError("no_json_object");
  s = s.slice(start);
  const end = s.lastIndexOf("}");
  if (end !== -1 && end >= start) s = s.slice(0, end + 1);
  return JSON.parse(s);
}

export function coerceLessonOutput(parsed: unknown): PillarLesson {
  if (isValidPillarLesson(parsed)) return parsed;
  return FALLBACK_LESSON;
}
