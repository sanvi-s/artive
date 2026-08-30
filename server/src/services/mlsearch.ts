import { config } from '../config/index';

const COLD_START_TIMEOUT_MS = 120_000;
const RETRY_DELAY_MS = 8_000;
const MAX_RETRIES = 2;

async function fetchMl(path: string, body: object) {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${config.mlServerUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(COLD_START_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`ML request failed: ${response.status}`);
      }

      return response.json();
    } catch (err) {
      lastError = err as Error;
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  throw lastError ?? new Error('ML request failed');
}

export async function semanticSearch(query: string) {
  return fetchMl('/search', { query });
}

export async function embedText(text: string): Promise<number[]> {
  const data = await fetchMl('/embed', { text });
  return data.embedding;
}

export async function getSimilar(id: string, type: 'seed' | 'fork') {
  return fetchMl('/similar', { id, type });
}
