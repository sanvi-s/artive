# Artive ML Service

FastAPI service for semantic search and text embeddings.

## Local development

```powershell
.\venv\Scripts\Activate.ps1
uvicorn app:app --reload
```

## Production (Render / Railway)

Use the included `render.yaml` or `Procfile`. The service must:

1. Bind to `0.0.0.0` and the platform `$PORT`
2. Use `/health` as the health check path (responds instantly; model loads in background)
3. Pre-download the model during **build**, not on cold start:

```bash
pip install -r requirements.txt && python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
```

Start command:

```bash
uvicorn app:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 120
```

### Render settings (manual)

| Setting | Value |
|---|---|
| Root directory | `ml` |
| Build command | See above |
| Start command | See above |
| Health check path | `/health` |

Set `MONGO_URI` in the service environment variables.

The backend pings `/health` every 10 minutes to prevent idle spin-down when the backend is running.
