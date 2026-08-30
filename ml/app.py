import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.search import router
from services.embedding_service import is_model_loading, is_model_ready, preload_model

_start_time = time.time()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    preload_model()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/")
def home():
    return {"message": "hello"}


@app.get("/health")
def health():
    return {
        "ok": True,
        "uptime": round(time.time() - _start_time, 2),
        "modelReady": is_model_ready(),
        "modelLoading": is_model_loading(),
    }


app.include_router(router)
