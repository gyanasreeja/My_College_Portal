from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routers import admin, auth, campus, inbox, public, registration, staff, sttudents

Base.metadata.create_all(bind=engine)  # swap for Alembic migrations later

app = FastAPI(title="Student Management Portal")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (public.router, inbox.router, registration.router, campus.router, auth.router, sttudents.router, staff.router, admin.router):
    app.include_router(r)


@app.get("/")
def root():
    return {"status": "ok", "docs": "/docs"}