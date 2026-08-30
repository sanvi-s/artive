"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.semanticSearch = semanticSearch;
exports.embedText = embedText;
exports.getSimilar = getSimilar;
const index_1 = require("../config/index");
const COLD_START_TIMEOUT_MS = 120000;
const RETRY_DELAY_MS = 8000;
const MAX_RETRIES = 2;
async function fetchMl(path, body) {
    let lastError;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(`${index_1.config.mlServerUrl}${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(COLD_START_TIMEOUT_MS),
            });
            if (!response.ok) {
                throw new Error(`ML request failed: ${response.status}`);
            }
            return response.json();
        }
        catch (err) {
            lastError = err;
            if (attempt < MAX_RETRIES) {
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
            }
        }
    }
    throw lastError ?? new Error('ML request failed');
}
async function semanticSearch(query) {
    return fetchMl('/search', { query });
}
async function embedText(text) {
    const data = await fetchMl('/embed', { text });
    return data.embedding;
}
async function getSimilar(id, type) {
    return fetchMl('/similar', { id, type });
}
