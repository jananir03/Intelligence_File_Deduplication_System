from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    audit_logs,
    auth,
    dashboard,
    duplicate_groups,
    file_management,
    files,
)


app = FastAPI(
    title="Intelligent File Deduplication System",
    description=(
        "File management, duplicate detection, "
        "storage optimization and safe deletion API."
    ),
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(
    "/",
    tags=["Health"],
)
def root():
    return {
        "status": "success",
        "message": (
            "Intelligent File Deduplication System is running."
        ),
    }



app.include_router(
    auth.router
)

app.include_router(
    audit_logs.router
)

app.include_router(
    files.router
)

app.include_router(
    duplicate_groups.router
)

app.include_router(
    dashboard.router
)

app.include_router(
    file_management.router
)


@app.get(
    "/health",
    tags=["Health"],
)
def health_check():
    return {
        "status": "healthy",
    }
