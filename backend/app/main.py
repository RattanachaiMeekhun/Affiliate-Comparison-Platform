from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.security.api_key import APIKeyHeader
from app.database import engine, Base
from app.routers import categories, products, affiliate, serper, currencies, setbuilder
from app.config import settings
from app.security.hmac_auth import verify_hmac_signature
from fastapi import Depends

from contextlib import asynccontextmanager
from app.core.scheduler import setup_scheduler
import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    # Supabase may deny schema-level DDL (e.g. vault schema).
    # Tables are managed via Supabase migrations, so this is safe to skip.
    print(f"⚠ create_all skipped: {e}")
API_KEY_NAME = "access_token"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    scheduler = setup_scheduler()
    yield
    # Shutdown
    scheduler.shutdown()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router)
app.include_router(products.router)
app.include_router(affiliate.router)
app.include_router(serper.router)
app.include_router(currencies.router)
app.include_router(setbuilder.router)



@app.get("/")
async def root():
    return RedirectResponse(url="/docs")
