import models
from database import engine
from routers import categories, products, affiliate
from fastapi import FastAPI
from fastapi.responses import RedirectResponse

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Affiliate Comparison Platform API")

app.include_router(categories.router)
app.include_router(products.router)
app.include_router(affiliate.router)


@app.get("/")
async def root():
    return RedirectResponse(url="/docs")
