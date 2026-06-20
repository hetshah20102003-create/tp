"""FastAPI application entrypoint for the Unified Business Suite.

Run:
    python -m business_suite.seed          # create db + demo data
    uvicorn business_suite.main:app --reload
Then open http://localhost:8000/ for the dashboard, /docs for the API.
"""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import __version__
from .database import init_db
from .routers import auth, finance, hr, reports

STATIC_DIR = Path(__file__).parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Unified Business Suite",
    description="HR + Finance core with RBAC, audit logging, and reporting.",
    version=__version__,
    lifespan=lifespan,
)


app.include_router(auth.router)
app.include_router(hr.router)
app.include_router(finance.router)
app.include_router(reports.router)


@app.get("/health", tags=["system"])
def health():
    return {"status": "ok", "version": __version__}


@app.get("/", include_in_schema=False)
def dashboard():
    return FileResponse(STATIC_DIR / "index.html")


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
