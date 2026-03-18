from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.security.api_key import APIKeyHeader
from app.database import engine, Base
from app.routers import categories, products, affiliate, serper, currencies, setbuilder
from app.config import settings
from app.security.hmac_auth import verify_hmac_signature
import httpx
import ipaddress
from contextlib import asynccontextmanager
from app.core.scheduler import setup_scheduler
import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

if engine:
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        # Supabase may deny schema-level DDL (e.g. vault schema).
        # Tables are managed via Supabase migrations, so this is safe to skip.
        print(f"⚠ create_all skipped: {e}")
else:
    print("❌ Database engine not initialized. Skipping create_all.")

API_KEY_NAME = "access_token"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

# เก็บรายการ IP ของ Cloudflare ไว้ในหน่วยความจำ
CLOUDFLARE_NETWORKS = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    scheduler = setup_scheduler()
    
    # ดึง IP ล่าสุดจาก Cloudflare เมื่อ Start Server
    global CLOUDFLARE_NETWORKS
    try:
        async with httpx.AsyncClient() as client:
            resp_v4 = await client.get("https://www.cloudflare.com/ips-v4")
            resp_v6 = await client.get("https://www.cloudflare.com/ips-v6")
            ips = resp_v4.text.splitlines() + resp_v6.text.splitlines()
            CLOUDFLARE_NETWORKS = [ipaddress.ip_network(ip) for ip in ips if ip]
    except Exception as e:
        print(f"Failed to fetch CF IPs: {e}")
        
    yield
    # Shutdown
    scheduler.shutdown()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

@app.middleware("http")
async def cloudflare_ip_whitelist(request: Request, call_next):
    # 1. ดึง IP จริงจาก Header ที่ Cloudflare ส่งมา
    # หมายเหตุ: Cloudflare จะส่ง 'cf-connecting-ip' มาให้เสมอ
    client_ip_str = request.headers.get("cf-connecting-ip")
    
    if not client_ip_str:
        raise HTTPException(status_code=403, detail="Direct access prohibited")

    client_ip = ipaddress.ip_address(client_ip_str)

    # 2. ตรวจสอบว่า IP อยู่ในวงของ Cloudflare หรือไม่
    is_valid = any(client_ip in network for network in CLOUDFLARE_NETWORKS)

    if not is_valid:
        raise HTTPException(status_code=403, detail="IP not in whitelist")

    # 3. ผ่านด่าน IP แล้ว ส่งต่อไปยังขั้นตอนตรวจ Signature Key ของคุณ
    response = await call_next(request)
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router,dependencies=[Depends(verify_hmac_signature)])
app.include_router(products.router,dependencies=[Depends(verify_hmac_signature)])
app.include_router(affiliate.router,dependencies=[Depends(verify_hmac_signature)])
app.include_router(serper.router,dependencies=[Depends(verify_hmac_signature)])
app.include_router(currencies.router,dependencies=[Depends(verify_hmac_signature)])
app.include_router(setbuilder.router,dependencies=[Depends(verify_hmac_signature)])



@app.get("/")
async def root():
    return RedirectResponse(url="/docs")
