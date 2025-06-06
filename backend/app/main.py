from fastapi import FastAPI, APIRouter
from app.api.v1.routes import auth as auth_router, cases as cases_router, incident_reports as reports_router, victims as victims_router, analytics as analytics_router, files as files_router
from app.database import init_db
from app.core.middleware import add_middleware
from app.models.case_status_history import CaseStatusHistory
from app.models.user import User
from app.models.case import Case
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Human Rights Monitor MIS")

@app.on_event("startup")
async def startup_event():
    try:
        # Initialize MongoDB connection
        client = AsyncIOMotorClient("mongodb+srv://mujaheddev:M1234567m@cluster0.v2uny.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        await init_beanie(database=client["human_rights_mis"], document_models=[User, Case, CaseStatusHistory])
        logger.info("MongoDB connection initialized with Beanie")

        # Call additional database initialization
        await init_db()
        logger.info("Additional database initialization completed")
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")
        raise

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
api_v1_router.include_router(files_router.router)  # Add files router

# Mount the versioned router to the main app
app.include_router(api_v1_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Human Rights Monitor MIS API"}