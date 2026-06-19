from fastapi import FastAPI
from api.search import router

app = FastAPI()

@app.get("/")
def home():
    return {"message":"hello"}

app.include_router(router)
