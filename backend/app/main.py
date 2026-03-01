from fastapi import FastAPI, Depends
from fastapi.responses import RedirectResponse
from app.database import engine, Base
from app.routers import categories, products, affiliate
from app.auth import verify_token

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Affiliate Comparison Platform API")

app.include_router(categories.router)
app.include_router(products.router)
app.include_router(affiliate.router)


@app.get("/")
async def root():
    return RedirectResponse(url="/docs")


@app.get("/api/me")
async def get_current_user_info(user=Depends(verify_token)):
    """
    Test endpoint for verifying Supabase JWT tokens.
    """
    return {"status": "success", "user_id": user.id, "email": user.email}
