from config import db

def search_seeds(query_embedding):
    results = db["seeds"].aggregate([
        {
            "$vectorSearch": {
                "index": "vector_index_seed",
                "path": "embedding",
                "queryVector": query_embedding.tolist(),
                "numCandidates": 200,
                "limit": 50
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "author",
                "foreignField": "_id",
                "as": "author",
                "pipeline": [{"$project": {"_id": 1, "username": 1, "displayName": 1, "avatarUrl": 1}}]
            }
        },
        {"$unwind": {"path": "$author", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": {"$toString": "$_id"},
                "title": 1,
                "type": 1,
                "contentSnippet": 1,
                "contentFull": 1,
                "thumbnailUrl": 1,
                "tags": 1,
                "forkCount": 1,
                "createdAt": 1,
                "author": {
                    "_id": {"$toString": "$author._id"},
                    "username": "$author.username",
                    "displayName": "$author.displayName",
                    "avatarUrl": "$author.avatarUrl"
                },
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ])
    return list(results)

def search_forks(query_embedding):
    results = db["forks"].aggregate([
        {
            "$vectorSearch": {
                "index": "vector_index_fork",
                "path": "embedding",
                "queryVector": query_embedding.tolist(),
                "numCandidates": 200,
                "limit": 50
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "author",
                "foreignField": "_id",
                "as": "author",
                "pipeline": [{"$project": {"_id": 1, "username": 1, "displayName": 1, "avatarUrl": 1}}]
            }
        },
        {"$unwind": {"path": "$author", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": {"$toString": "$_id"},
                "title": "$summary",
                "type": {"$cond": [{"$gt": ["$imageUrl", None]}, "visual", "text"]},
                "contentSnippet": "$summary",
                "contentFull": "$contentDelta",
                "thumbnailUrl": 1,
                "forkCount": 1,
                "createdAt": 1,
                "author": {
                    "_id": {"$toString": "$author._id"},
                    "username": "$author.username",
                    "displayName": "$author.displayName",
                    "avatarUrl": "$author.avatarUrl"
                },
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ])
    return list(results)

def get_similar(post_id: str, post_type: str):
    from bson import ObjectId
    collection = "seeds" if post_type == "seed" else "forks"
    doc = db[collection].find_one({"_id": ObjectId(post_id)}, {"embedding": 1})
    if not doc or "embedding" not in doc:
        print(f"no embedding for {post_type} {post_id} (doc found: {doc is not None})")
        return []

    embedding = doc["embedding"]

    try:
        seed_results = search_seeds_by_vector(embedding, exclude_id=post_id)
    except Exception as e:
        print(f"seed vector search failed: {e}")
        seed_results = []

    try:
        fork_results = search_forks_by_vector(embedding, exclude_id=post_id)
    except Exception as e:
        print(f"fork vector search failed: {e}")
        fork_results = []

    combined = seed_results + fork_results
    combined.sort(key=lambda x: x["score"], reverse=True)
    return combined

SIMILAR_SCORE_THRESHOLD = 0.2

def search_seeds_by_vector(embedding, exclude_id=None):
    results = db["seeds"].aggregate([
        {
            "$vectorSearch": {
                "index": "vector_index_seed",
                "path": "embedding",
                "queryVector": embedding,
                "numCandidates": 200,
                "limit": 50
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "author",
                "foreignField": "_id",
                "as": "author",
                "pipeline": [{"$project": {"_id": 1, "username": 1, "displayName": 1, "avatarUrl": 1}}]
            }
        },
        {"$unwind": {"path": "$author", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": {"$toString": "$_id"},
                "title": 1,
                "type": 1,
                "contentSnippet": 1,
                "contentFull": 1,
                "thumbnailUrl": 1,
                "tags": 1,
                "forkCount": 1,
                "createdAt": 1,
                "author": {
                    "_id": {"$toString": "$author._id"},
                    "username": "$author.username",
                    "displayName": "$author.displayName",
                    "avatarUrl": "$author.avatarUrl"
                },
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ])
    items = list(results)
    if exclude_id:
        items = [r for r in items if r["_id"] != exclude_id]
    return [r for r in items if r["score"] >= SIMILAR_SCORE_THRESHOLD]

def search_forks_by_vector(embedding, exclude_id=None):
    results = db["forks"].aggregate([
        {
            "$vectorSearch": {
                "index": "vector_index_fork",
                "path": "embedding",
                "queryVector": embedding,
                "numCandidates": 200,
                "limit": 50
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "author",
                "foreignField": "_id",
                "as": "author",
                "pipeline": [{"$project": {"_id": 1, "username": 1, "displayName": 1, "avatarUrl": 1}}]
            }
        },
        {"$unwind": {"path": "$author", "preserveNullAndEmptyArrays": True}},
        {
            "$project": {
                "_id": {"$toString": "$_id"},
                "title": "$summary",
                "type": {"$cond": [{"$gt": ["$imageUrl", None]}, "visual", "text"]},
                "contentSnippet": "$summary",
                "contentFull": "$contentDelta",
                "thumbnailUrl": 1,
                "forkCount": 1,
                "createdAt": 1,
                "author": {
                    "_id": {"$toString": "$author._id"},
                    "username": "$author.username",
                    "displayName": "$author.displayName",
                    "avatarUrl": "$author.avatarUrl"
                },
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ])
    items = list(results)
    if exclude_id:
        items = [r for r in items if r["_id"] != exclude_id]
    return [r for r in items if r["score"] >= SIMILAR_SCORE_THRESHOLD]
