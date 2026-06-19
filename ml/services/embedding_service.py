from sentence_transformers import SentenceTransformer

_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

class _LazyModel:
    def encode(self, *args, **kwargs):
        return get_model().encode(*args, **kwargs)

model = _LazyModel()
