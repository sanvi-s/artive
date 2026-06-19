from pydantic import BaseModel

class EmbedRequest(BaseModel):
    text: str

class SearchRequest(BaseModel):
    query: str

class SimilarRequest(BaseModel):
    id: str
    type: str  # "seed" or "fork"
