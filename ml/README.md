# Artive ML Service

FastAPI service for semantic search and text embeddings.

## Local development

```powershell
.\venv\Scripts\Activate.ps1
uvicorn app:app --reload
```

## Render (required dashboard settings)

Those `Shutting down` / `Finished server process` lines are Render sending SIGTERM after idle time. On the free plan that is normal — **unless** a Health Check Path is set. Then Render marks the sleeping service unhealthy and it **will not wake** until you manually deploy again.

In the Render service settings:

| Setting | Value |
|---|---|
| Root directory | `ml` |
| Health Check Path | **leave empty** (do not use `/health`) |
| Build command | `pip install -r requirements.txt && python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"` |
| Start command | `uvicorn app:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 120` |

Environment variables:

- `MONGO_URI` — required
- `ML_PUBLIC_URL` — your public ML URL, e.g. `https://artive-ml.onrender.com` (Render also sets `RENDER_EXTERNAL_URL` automatically; set this if keep-alive logs say it is disabled)

After changing Health Check Path, **Manual Deploy → Deploy latest commit** so the new keep-alive code is running.

The service pings its own public `/health` every 8 minutes. That inbound request is what stops Render from spinning the process down.
