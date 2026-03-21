"""
Batch embed all products that don't yet have an embedding vector.

Usage:
    uv run python -m app.jobs.embed_products
"""

import time
from app.database import SessionLocal
from app.models import Product
from app.services.vector_service import VectorService
from sqlalchemy import text


def build_product_text(product: Product) -> str:
    """Build a rich text representation of a product for embedding."""
    parts = [product.name or ""]

    if product.description:
        parts.append(product.description)

    if product.specs:
        if isinstance(product.specs, dict):
            specs_str = ", ".join(
                f"{k}: {v}" for k, v in product.specs.items()
            )
        else:
            specs_str = str(product.specs)
        parts.append(f"Specs: {specs_str}")

    if product.ai_insight:
        parts.append(product.ai_insight)
    
    if product.id:
        parts.append(f"ID: {product.id}")

    return ". ".join(parts)


def embed_products(batch_size: int = 50, sleep_seconds: float = 0.5):
    """Embed all products that are missing embeddings."""
    print("Initializing embedding job...")
    db = SessionLocal()
    vs = VectorService()

    try:
        # Diagnostic: Check search path and tables
        print("Checking database context...")
        db.execute(text("SET search_path TO public"))
        db.commit()
        
        db_context = db.execute(text("SHOW search_path")).fetchone()
        print(f"Database search_path set to: {db_context[0]}")
        
        tables = db.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")).fetchall()
        print(f"Visible tables in 'public': {[t[0] for t in tables]}")

        print("Querying products missing embeddings...")
        products = (
            db.query(Product)
            .filter(Product.embedding.is_(None))
            .all()
        )


        total = len(products)
        if total == 0:
            print("✅ All products already have embeddings.")
            return

        print(f"📦 Found {total} products without embeddings. Starting...")

        embedded_count = 0
        failed_count = 0

        for i in range(0, total, batch_size):
            batch = products[i : i + batch_size]

            for product in batch:
                try:
                    product_text = build_product_text(product)
                    embedding = vs.embed_text(product_text)

                    # Update via raw SQL to set the vector directly
                    db.execute(
                        text(
                            "UPDATE products SET embedding = :emb WHERE id = :pid"
                        ),
                        {"emb": str(embedding), "pid": str(product.id)},
                    )

                    embedded_count += 1
                    print(
                        f"  [{embedded_count}/{total}] ✅ {product.name[:60]}"
                    )

                except Exception as e:
                    failed_count += 1
                    print(
                        f"  [{embedded_count + failed_count}/{total}] ❌ {product.name[:60]}: {e}"
                    )

            # Commit batch
            db.commit()
            print(f"  💾 Committed batch {i // batch_size + 1}")

            # Rate limit
            if i + batch_size < total:
                time.sleep(sleep_seconds)

        print(f"\n🏁 Done! Embedded: {embedded_count}, Failed: {failed_count}")

    finally:
        db.close()


if __name__ == "__main__":
    embed_products()
