import threading
import logging
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

_model = None
_model_lock = threading.Lock()
_model_loading = False
_model_error: Exception | None = None


def is_model_ready() -> bool:
    return _model is not None


def is_model_loading() -> bool:
    return _model_loading


def get_model() -> SentenceTransformer:
    global _model, _model_loading, _model_error

    if _model is not None:
        return _model

    with _model_lock:
        if _model is not None:
            return _model
        if _model_error is not None:
            raise _model_error

        _model_loading = True
        try:
            logger.info("Loading SentenceTransformer model...")
            _model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("SentenceTransformer model loaded")
            return _model
        except Exception as exc:
            _model_error = exc
            logger.exception("Failed to load SentenceTransformer model")
            raise
        finally:
            _model_loading = False


def preload_model() -> None:
    def _load() -> None:
        try:
            get_model()
        except Exception:
            pass

    threading.Thread(target=_load, daemon=True, name="model-preload").start()
