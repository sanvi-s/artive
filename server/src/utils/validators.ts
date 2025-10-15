export function clampString(input: unknown, maxLen: number): string | undefined {
  if (typeof input !== 'string') return undefined;
  return input.length > maxLen ? input.slice(0, maxLen) : input;
}

export function toPositiveInt(input: unknown, defaultValue: number, max = 100): number {
  const n = Number(input);
  if (!Number.isFinite(n) || n <= 0) return defaultValue;
  return Math.min(Math.floor(n), max);
}

export function sanitizeSearch(input: unknown): string | undefined {
  if (typeof input !== 'string') return undefined;
  return input.replace(/[\$]/g, '');
}



