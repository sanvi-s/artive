import { config } from '../config/index';



export async function semanticSearch(query: string) {
  const response = await fetch(`${config.mlServerUrl}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) throw new Error(`ML search failed: ${response.status}`);
  return response.json();
}

export async function embedText(text: string): Promise<number[]> {
  const response = await fetch(`${config.mlServerUrl}/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error(`ML embed failed: ${response.status}`);
  const data = await response.json();
  return data.embedding;
}

export async function getSimilar(id: string, type: 'seed' | 'fork') {
  const response = await fetch(`${config.mlServerUrl}/similar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, type }),
  });

  if (!response.ok) throw new Error(`ML similar failed: ${response.status}`);
  return response.json();
}