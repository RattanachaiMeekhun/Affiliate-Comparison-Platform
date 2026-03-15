import hmac
import hashlib
import time
from fastapi import Request, HTTPException, Header
from app.config import settings

# Adjust the acceptable time window in seconds (e.g., 5 minutes)
HMAC_TIMESTAMP_TOLERANCE_SECONDS = 300

async def verify_hmac_signature(
    request: Request,
    x_timestamp: str = Header(..., description="UNIX timestamp of the request in seconds"),
    x_signature: str = Header(..., description="HMAC-SHA256 signature calculated over the request body and timestamp")
):
    """
    Dependency to verify the HMAC signature of incoming requests.
    Validates that the request was signed by a party holding the HMAC_SECRET_KEY,
    and checks that the signature hasn't expired.
    """
    if not settings.HMAC_SECRET_KEY:
        # If the key is not set, we can either bypass verification (in dev) or fail securely.
        # For production readiness, it's safer to fail if the HMAC feature is expected but unconfigured.
        raise HTTPException(status_code=500, detail="HMAC_SECRET_KEY is not configured on the server")

    # 1. Validate the timestamp
    try:
        request_time = int(x_timestamp)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid timestamp format")

    current_time = int(time.time())
    
    # Check if request is too old (to prevent replay attacks), or too far in the future
    if abs(current_time - request_time) > HMAC_TIMESTAMP_TOLERANCE_SECONDS:
        raise HTTPException(status_code=401, detail="Request signature expired or timestamp invalid")

    # 2. Read the request body
    # We must await the body here. FastAPI dependencies reading the body can sometimes
    # interfere with later parsing if not careful, but reading `request.body()` is safe.
    body_bytes = await request.body()
    body_str = body_bytes.decode('utf-8') if body_bytes else ""
    
    # 3. Reconstruct the message payload
    # Payload format: timestamp + "." + request_body
    payload_to_sign = f"{x_timestamp}.{body_str}"

    # 4. Generate the expected signature
    secret_key_bytes = settings.HMAC_SECRET_KEY.encode('utf-8')
    payload_bytes = payload_to_sign.encode('utf-8')
    
    expected_signature = hmac.new(
        key=secret_key_bytes,
        msg=payload_bytes,
        digestmod=hashlib.sha256
    ).hexdigest()

    # 5. Securely compare signatures
    if not hmac.compare_digest(expected_signature, x_signature):
        raise HTTPException(status_code=401, detail="Invalid request signature")

    return True
