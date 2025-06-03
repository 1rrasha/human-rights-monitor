from fastapi import FastAPI
from app.api.routes import cases as cases_router, users as users_router
from app.database import init_db
from app.core.middleware import add_middleware

app = FastAPI(title="Human Rights Monitor MIS")

add_middleware(app)

app.include_router(cases_router.router)
app.include_router(users_router.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Human Rights Monitor MIS API"}

@app.on_event("startup")
async def startup():
    await init_db()