from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.case import Case
from app.models.user import User
from app.models.incident_report import IncidentReport,ReportEvidenceDocument
from app.core.config import settings
from app.models.victim import Victim, VictimRiskAssessment
import ssl

async def init_db():
    # Create SSL context that doesn't verify certificates (for development only)
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    # Alternative: Use tlsAllowInvalidCertificates parameter
    client = AsyncIOMotorClient(
        settings.MONGO_URI,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=30000,
        socketTimeoutMS=30000
    )
    
    try:
        # Test the connection
        await client.admin.command('ping')
        print("Successfully connected to MongoDB!")
        
        await init_beanie(
            database=client[settings.DATABASE_NAME],
            document_models=[Case, User, IncidentReport, ReportEvidenceDocument,Victim, VictimRiskAssessment]
        )

    except Exception as e:
        print(f"Failed to initialize MongoDB: {str(e)}")
        raise