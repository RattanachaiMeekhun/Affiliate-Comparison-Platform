import hmac
import hashlib
import time
import argparse
import sys
import os

# Add the backend directory to sys.path so we can import app.config if needed
# But for simplicity, we'll just load .env directly here or use pydantic-settings
try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ImportError:
    print("pydantic-settings not found. Please run 'pip install pydantic-settings'")
    sys.exit(1)

class Settings(BaseSettings):
    HMAC_SECRET_KEY: str | None = None
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Make sure we are in the backend directory to load .env correctly
if not os.path.exists(".env") and os.path.exists("../.env"):
    os.chdir("..")

settings = Settings()

def generate_hmac(body: str):
    if not settings.HMAC_SECRET_KEY:
        print("Error: HMAC_SECRET_KEY is not set in .env")
        sys.exit(1)
        
    timestamp = str(int(time.time()))
    payload = f"{timestamp}.{body}"
    
    signature = hmac.new(
        key=settings.HMAC_SECRET_KEY.encode('utf-8'),
        msg=payload.encode('utf-8'),
        digestmod=hashlib.sha256
    ).hexdigest()
    
    return timestamp, signature

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate HMAC signature and timestamp for API testing")
    parser.add_argument("--body", type=str, default="", help="The request body (as a string)")
    args = parser.parse_args()
    
    timestamp, signature = generate_hmac(args.body)
    
    print("\n--- HMAC Headers (Use these in Swagger UI) ---")
    print(f"X-Timestamp: {timestamp}")
    print(f"X-Signature: {signature}")
    print("----------------------------------------------\n")
