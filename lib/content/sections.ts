import type { SectionKey } from "./schema";

export interface H2Part {
  heading: string;
  content: string;
}

// Splits markdown on level-2 headings, ignoring "## " inside fenced code blocks.
export function splitH2(body: string): { preamble: string; parts: H2Part[] } {
  const parts: H2Part[] = [];
  const preamble: string[] = [];
  let current: { heading: string; lines: string[] } | null = null;
  let inFence = false;

  for (const line of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    const match = !inFence && /^## (.+?)\s*#*\s*$/.exec(line);
    if (match) {
      if (current) parts.push({ heading: current.heading, content: current.lines.join("\n").trim() });
      current = { heading: match[1], lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      preamble.push(line);
    }
  }
  if (current) parts.push({ heading: current.heading, content: current.lines.join("\n").trim() });
  return { preamble: preamble.join("\n").trim(), parts };
}

// Maps h2 parts onto section keys by position (meta.yaml `sections`).
// A key with one part gets just its content (the page supplies the section title);
// a key with several parts keeps each original h2 text as an h3 so nothing is lost.
export function toSections(body: string, keys: SectionKey[]): Partial<Record<SectionKey, string>> {
  const { parts } = splitH2(body);
  const grouped = new Map<SectionKey, H2Part[]>();
  parts.forEach((part, i) => {
    const key = keys[i];
    if (!key) return;
    grouped.set(key, [...(grouped.get(key) ?? []), part]);
  });

  const out: Partial<Record<SectionKey, string>> = {};
  for (const [key, group] of grouped) {
    out[key] =
      group.length === 1
        ? group[0].content
        : group.map((p) => `### ${p.heading}\n\n${p.content}`).join("\n\n");
  }
  return out;
}
