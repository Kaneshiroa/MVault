import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import Base, engine
from .routes import media, metadata


Base.metadata.create_all(bind=engine)

frontend_url = os.getenv("FRONTEND_URL")

allowed_origins = [
    "http://localhost:3000",
]

if frontend_url:
    allowed_origins.append(frontend_url.rstrip("/"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(media.router)
app.include_router(metadata.router)


@app.get("/start")
def start_check():
    return {"status": "ok"}