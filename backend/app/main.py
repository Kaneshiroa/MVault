from fastapi import FastAPI

app = FastAPI()

@app.get("/start")
def start_check():
    return {"status": "ok"}