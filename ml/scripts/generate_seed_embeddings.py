import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import db
from services.embedding_service import get_model

seeds = db["seeds"].find({
    "embedding": {"$exists": False}
})

for seed in seeds:

    text = (
        seed.get("title", "")
        + " "
        + " ".join(seed.get("tags", []))
        + " "
        + seed.get("contentSnippet", "")
    )

    embedding = get_model().encode(text)

    db["seeds"].update_one(
        {"_id": seed["_id"]},
        {
            "$set": {
                "embedding": embedding.tolist()
            }
        }
    )

    print(f"Embedded: {seed['title']}")
