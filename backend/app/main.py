from fastapi import FastAPI, APIRouter
from app.api.v1.routes import auth as auth_router, cases as cases_router, incident_reports as reports_router, victims as victims_router, analytics as analytics_router
from app.database import init_db
from app.core.middleware import add_middleware

app = FastAPI(title="Human Rights Monitor MIS")

# Versioned API router with /api/v1 prefix
api_v1_router = APIRouter(prefix="/api/v1")

# Add middleware
add_middleware(app)

# Include routers under /api/v1
api_v1_router.include_router(auth_router.router)
api_v1_router.include_router(cases_router.router)
api_v1_router.include_router(reports_router.router)
api_v1_router.include_router(victims_router.router)
api_v1_router.include_router(analytics_router.router)

# Mount the versioned router to the main app
app.include_router(api_v1_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Human Rights Monitor MIS API"}

@app.on_event("startup")
async def startup():
    await init_db()