import logging
import signal
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.search import router
from services.embedding_service import is_model_loading, is_model_ready, preload_model
from services.keep_alive import start_keep_alive

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml")

_start_time = time.time()


def _log_signal(signum, _frame):
    logger.warning("Received signal %s — host is stopping this process", signum)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        signal.signal(signal.SIGTERM, _log_signal)
    except Exception:
        pass
    start_keep_alive()
    # Delay model load so the process is healthy before using memory/CPU.
    preload_model(delay_sec=20)
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/")
def home():
    return {"ok": True, "service": "artive-ml"}


@app.get("/health")
def health():
    return {
        "ok": True,
        "uptime": round(time.time() - _start_time, 2),
        "modelReady": is_model_ready(),
        "modelLoading": is_model_loading(),
    }


app.include_router(router)
