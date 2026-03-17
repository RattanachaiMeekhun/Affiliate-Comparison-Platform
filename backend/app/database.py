from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

SQLALCHEMY_DATABASE_URL = settings.URL_DATABASE

if not SQLALCHEMY_DATABASE_URL:
    # We allow engine to be None to avoid crashing at import time
    # This happens if env vars are missing during build or startup
    engine = None
    SessionLocal = None
    print("❌ URL_DATABASE is not set in environment variables.")
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
