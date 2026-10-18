from fastapi import FastAPI
from .database import Base, engine
from . import models
from .routes import media
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(media.router)

@app.get("/start")
def start_check():
    return {"status": "ok"}