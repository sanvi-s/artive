import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
from bson import ObjectId
from config import db

# FORK_ID  = "6a33c9737c1629f913073697"
# SEED_ID  = "6a33c9687c1629f9130734f7"

FORK_ID = "6a33c9737c1629f91307368b"
SEED_ID  = "6a33c9697c1629f91307350d"


fork = db["forks"].find_one({"_id": ObjectId(FORK_ID)}, {"embedding": 1, "summary": 1})
seed = db["seeds"].find_one({"_id": ObjectId(SEED_ID)}, {"embedding": 1, "title": 1})

if not fork:
    print(f"Fork {FORK_ID} not found")
    sys.exit(1)
if not seed:
    print(f"Seed {SEED_ID} not found")
    sys.exit(1)

if "embedding" not in fork:
    print(f"Fork has no embedding — run generate_fork_embeddings.py first")
    sys.exit(1)
if "embedding" not in seed:
    print(f"Seed has no embedding — run generate_seed_embeddings.py first")
    sys.exit(1)

a = np.array(fork["embedding"])
b = np.array(seed["embedding"])
cosine_sim = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

print(f"Seed  : {seed['title']}")
print(f"Fork  : {fork.get('summary', '(no summary)')}")
print(f"Cosine similarity: {cosine_sim:.4f}")
