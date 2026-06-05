export interface NvidiaModel {
  family: string; // 'RTX' | 'GTX' | 'MX' | ''
  model: string;  // '3050', '1650 Ti', 'MX550', etc.
}

/**
 * Parses a raw GPU string and extracts the NVIDIA GeForce family and model number.
 * Returns null if the value is not an NVIDIA GPU.
 */
export function parseNvidiaModel(value: string): NvidiaModel | null {
  if (!value || !/nvidia|geforce|rtx|gtx/i.test(value)) return null;

  // Normalize: remove trademark symbols, VRAM suffixes, chip codes, brand prefix
  const cleaned = value
    .replace(/™|®/g, '')
    .replace(/\s+de\s+\d+\s*GB\b.*/i, '')
    .replace(/\s*\([\w\W]*?\)/g, '')
    .replace(/\s*-?\d+\s*GB\b.*/i, '')
    .replace(/laptop\s*gpu/i, '')
    .trim();

  // Detect family
  const familyMatch = cleaned.match(/\b(RTX|GTX|MX)\b/i);
  const family = familyMatch ? familyMatch[1].toUpperCase() : '';

  // Extract model number — everything after the family keyword
  let model = '';
  if (family) {
    const afterFamily = cleaned.replace(/.*\b(RTX|GTX|MX)\s*/i, '').trim();
    // For MX series, keep "MX" prefix in model (e.g. "MX550")
    model = family === 'MX' ? `MX${afterFamily}` : afterFamily;
  } else {
    // Fallback: strip known prefixes and return remainder
    model = cleaned
      .replace(/nvidia\s*/i, '')
      .replace(/geforce\s*/i, '')
      .trim();
  }

  return { family, model };
}
