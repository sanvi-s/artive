import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import db
from services.embedding_service import get_model

db["forks"].update_many(
    {},
    {"$unset": {"embedding": ""}}
)

forks = db["forks"].find({
    "embedding": {"$exists": False}
})

for fork in forks:
    parent_seed = db["seeds"].find_one(
        {"_id": fork["parentSeed"]},
        {"title": 1}
    )
    parent_title = parent_seed.get("title", "") if parent_seed else ""

    content_delta = fork.get("contentDelta", "")
    content_words = " ".join(content_delta.split()[:500])

    text = (
        parent_title
        + " "
        + content_words
    )

    embedding = get_model().encode(text)

    db["forks"].update_one(
        {"_id": fork["_id"]},
        {
            "$set": {
                "embedding": embedding.tolist()
            }
        }
    )

    print(f"Embedded fork: {fork['_id']} (parent: {parent_title})")
