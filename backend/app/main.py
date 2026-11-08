"""
KUKU STORYPULSE — FastAPI Application Entrypoint.
Provides production CORS middleware, API routing, and server lifecycle.
"""

import sys
import os

# Ensure backend directory is in sys.path so 'app' can always be imported
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router

app = FastAPI(
    title="KUKU STORYPULSE API",
    description="AI-Powered Microdrama Promo Discovery & Ranking Platform",
    version="1.0.0",
)

# Enable CORS for local Next.js frontend or any deployment origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {
        "platform": "KUKU STORYPULSE",
        "tagline": "Turn Every Story Into Its Next Viral Hook",
        "version": "1.0.0",
        "docs": "/docs",
        "api": "/api",
    }


if __name__ == "__main__":
    import uvicorn
    # Pass app instance directly so execution works from any working directory
    uvicorn.run(app, host="0.0.0.0", port=8000)
