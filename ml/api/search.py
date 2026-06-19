from fastapi import APIRouter
from models.schemas import EmbedRequest, SearchRequest, SimilarRequest
from services.embedding_service import model
from services.search_service import search_seeds, search_forks, get_similar

router = APIRouter()

@router.post("/embed")
def embed(request: EmbedRequest):
    return {"embedding": model.encode(request.text).tolist()}

@router.post("/search")
def search(request: SearchRequest):
    query_embedding = model.encode(request.query)

    seed_results = search_seeds(query_embedding)

    fork_results = search_forks(query_embedding)

    combined_results = (
        seed_results +
        fork_results
    )

    combined_results.sort(
    key=lambda x: x["score"],
    reverse=True
    )
    return combined_results

@router.post("/similar")
def similar(request: SimilarRequest):
    return get_similar(request.id, request.type)
