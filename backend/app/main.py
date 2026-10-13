from fastapi import FastAPI
from .database import Base, engine
from . import models
from .routes import media

Base.metadata.create_all(bind=engine)
app = FastAPI()
app.include_router(media.router)

@app.get("/start")
def start_check():
    return {"status": "ok"}