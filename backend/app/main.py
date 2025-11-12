from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import jobs, repos, pr, health
from app.models.base import Base, engine

app = FastAPI(title="CodeMentor.AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/healthz", tags=["health"])
app.include_router(repos.router, prefix="/repos", tags=["repos"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
app.include_router(pr.router, prefix="/prs", tags=["prs"])


@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)

