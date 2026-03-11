import asyncio
import boto3
import httpx
import uuid
import mimetypes
from botocore.config import Config
from app.config import settings


class StorageService:
    def __init__(self):
        self.account_id = settings.R2_ACCOUNT_ID
        self.access_key = settings.R2_ACCESS_KEY_ID
        self.secret_key = settings.R2_SECRET_ACCESS_KEY
        self.bucket = settings.R2_BUCKET_NAME
        self.public_url = settings.R2_PUBLIC_URL

        # Check if R2 is configured
        self.is_configured = all(
            [
                self.account_id,
                self.access_key,
                self.secret_key,
                self.bucket,
                self.public_url,
            ]
        )

        if self.is_configured:
            self.s3_client = boto3.client(
                service_name="s3",
                endpoint_url=f"https://{self.account_id}.r2.cloudflarestorage.com",
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name="auto",
                config=Config(signature_version="s3v4"),
            )

    async def upload_image_from_url(self, image_url: str, product_slug: str) -> str:
        """
        Downloads an image from a given URL and uploads it to Cloudflare R2.
        Returns the new public URL of the uploaded image.
        If R2 is not configured or an error occurs, returns the original URL.
        """
        if not self.is_configured or not image_url or not image_url.startswith("http"):
            return image_url

        try:
            # 1. Download image
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(image_url)
                response.raise_for_status()
                image_data = response.content
                content_type = response.headers.get("content-type", "image/jpeg")

            # 2. Determine extension
            ext = mimetypes.guess_extension(content_type) or ".jpg"
            # Fallback extension from URL if mimetypes failed
            if ext == ".jpe":
                ext = ".jpg"

            # 3. Create unique path: products/{slug}-{uuid}{ext}
            unique_id = str(uuid.uuid4())[:8]
            object_name = f"products/{product_slug}-{unique_id}{ext}"

            # 4. Upload to R2 in a thread to not block event loop
            await asyncio.to_thread(
                self.s3_client.put_object,
                Bucket=self.bucket,
                Key=object_name,
                Body=image_data,
                ContentType=content_type,
            )

            # 5. Return new public URL
            public_base = self.public_url.rstrip("/")
            return f"{public_base}/{object_name}"

        except Exception as e:
            print(f"Error uploading image {image_url} to R2: {e}")
            return image_url
