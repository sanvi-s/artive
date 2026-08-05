import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
from bson import ObjectId
from config import db
from services.embedding_service import model

def cosine(a, b):
    a, b = np.array(a), np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def get_post(collection, post_id):
    doc = db[collection].find_one({"_id": ObjectId(post_id)}, {"embedding": 1, "title": 1, "summary": 1})
    if not doc:
        print(f"{collection[:-1].capitalize()} {post_id} not found")
        sys.exit(1)
    if "embedding" not in doc:
        print(f"{collection[:-1].capitalize()} has no embedding")
        sys.exit(1)
    return doc

def label(doc):
    return doc.get("title") or doc.get("summary") or str(doc["_id"])

# ─── Mode 1: two posts ────────────────────────────────────────────────────────
# Uncomment and fill in IDs to compare two posts directly

FORK_ID = "6a33c96c7c1629f913073581"
SEED_ID = "6a33c96b7c1629f913073567"
fork = get_post("forks", FORK_ID)
seed = get_post("forks", SEED_ID)
sim = cosine(fork["embedding"], seed["embedding"])
print(f"Seed : {label(seed)}")
print(f"Fork : {label(fork)}")
print(f"Cosine similarity: {sim:.4f}")

# ─── Mode 2: keyword vs post ──────────────────────────────────────────────────

# KEYWORD = "melancholy"
# POST_ID = "6a358e63ec80f9ef632db112"
# COLLECTION = "seeds"  # "seeds" or "forks"

# post = get_post(COLLECTION, POST_ID)
# keyword_embedding = model.encode(KEYWORD)
# sim = cosine(keyword_embedding, post["embedding"])

# print(f"Keyword : {KEYWORD!r}")
# print(f"Post    : {label(post)}")
# print(f"Cosine similarity: {sim:.4f}")
