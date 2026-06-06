import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.base import Base, engine
from app.routes import health, jobs, pr, repos


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="CodeMentor.AI API", version="1.0.0", lifespan=lifespan)

# Comma-separated list of allowed origins; defaults to the local frontend.
cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/healthz", tags=["health"])
app.include_router(repos.router, prefix="/repos", tags=["repos"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
app.include_router(pr.router, prefix="/prs", tags=["prs"])

