/** Capitaliza la primera letra de cada palabra del nombre (nombres compuestos).
 * "fernando alonso" / "FERNANDO ALONSO" → "Fernando Alonso". */
export function titleCaseName(name?: string | null): string | undefined {
  if (!name) return undefined;
  const t = name.trim();
  if (!t) return undefined;
  return t.toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (m) => m.toUpperCase());
}
