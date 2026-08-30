import logging
import threading
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

_model = None
_model_lock = threading.Lock()
_model_loading = False


def is_model_ready() -> bool:
    return _model is not None


def is_model_loading() -> bool:
    return _model_loading


def get_model() -> SentenceTransformer:
    global _model, _model_loading

    if _model is not None:
        return _model

    with _model_lock:
        if _model is not None:
            return _model

        _model_loading = True
        try:
            logger.info("Loading SentenceTransformer model...")
            loaded = SentenceTransformer("all-MiniLM-L6-v2")
            _model = loaded
            logger.info("SentenceTransformer model loaded")
            return loaded
        except Exception:
            logger.exception("Failed to load SentenceTransformer model")
            raise
        finally:
            _model_loading = False


def preload_model(delay_sec: float = 20) -> None:
    def _load() -> None:
        if delay_sec > 0:
            threading.Event().wait(delay_sec)
        try:
            get_model()
        except Exception:
            pass

    threading.Thread(target=_load, daemon=True, name="model-preload").start()
