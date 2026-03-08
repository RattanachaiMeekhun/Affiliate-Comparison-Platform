"""
eBay Browse API Service
=======================
Handles OAuth2 Client Credentials authentication and product search
via the eBay Browse API v1.

Reference: https://developer.ebay.com/api-docs/buy/browse/overview.html
"""

import base64
import time
from typing import Optional
import httpx
from app.config import settings, MAX_RETRIES

# ──────────────────────────────────────────────
# Token Cache (module-level singleton)
# ──────────────────────────────────────────────
_token_cache: dict = {"access_token": None, "expires_at": 0}


class EbayService:
    """
    Stateless eBay Browse API client.
    Uses a module-level token cache so the OAuth token is reused across calls.
    """

    # ── Environment toggling ──
    SANDBOX_AUTH_URL = "https://api.sandbox.ebay.com/identity/v1/oauth2/token"
    PRODUCTION_AUTH_URL = "https://api.ebay.com/identity/v1/oauth2/token"

    SANDBOX_API_BASE = "https://api.sandbox.ebay.com"
    PRODUCTION_API_BASE = "https://api.ebay.com"

    BROWSE_SEARCH_PATH = "/buy/browse/v1/item_summary/search"
    BROWSE_ITEM_PATH = "/buy/browse/v1/item/{item_id}"

    # ──────────────────────────────────────────
    # Construction
    # ──────────────────────────────────────────
    def __init__(self):
        self.client_id = settings.EBAY_CLIENT_ID
        self.client_secret = settings.EBAY_CLIENT_SECRET
        self.use_sandbox = settings.EBAY_SANDBOX

        if self.use_sandbox:
            self.auth_url = self.SANDBOX_AUTH_URL
            self.api_base = self.SANDBOX_API_BASE
        else:
            self.auth_url = self.PRODUCTION_AUTH_URL
            self.api_base = self.PRODUCTION_API_BASE

    # ──────────────────────────────────────────
    # OAuth2 – Client Credentials
    # ──────────────────────────────────────────
    async def _get_access_token(self) -> str:
        """
        Obtain or reuse an eBay Application access token.
        Tokens are cached until 60 s before expiry.
        """
        global _token_cache

        if _token_cache["access_token"] and time.time() < _token_cache["expires_at"]:
            return _token_cache["access_token"]

        credentials = base64.b64encode(
            f"{self.client_id}:{self.client_secret}".encode()
        ).decode()

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                self.auth_url,
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": f"Basic {credentials}",
                },
                data={
                    "grant_type": "client_credentials",
                    "scope": "https://api.ebay.com/oauth/api_scope",
                },
            )
            resp.raise_for_status()
            data = resp.json()

        _token_cache["access_token"] = data["access_token"]
        _token_cache["expires_at"] = time.time() + data.get("expires_in", 7200) - 60

        return _token_cache["access_token"]

    # ──────────────────────────────────────────
    # Internal helpers
    # ──────────────────────────────────────────
    async def _request(self, method: str, path: str, **kwargs) -> dict:
        """Fire an authenticated request against the Browse API."""
        token = await self._get_access_token()
        url = f"{self.api_base}{path}"

        for attempt in range(MAX_RETRIES):
            try:
                async with httpx.AsyncClient(timeout=20) as client:
                    resp = await client.request(
                        method,
                        url,
                        headers={
                            "Authorization": f"Bearer {token}",
                            "Content-Type": "application/json",
                            "X-EBAY-C-MARKETPLACE-ID": settings.EBAY_MARKETPLACE_ID,
                        },
                        **kwargs,
                    )
                    resp.raise_for_status()
                    return resp.json()
            except httpx.HTTPStatusError as exc:
                # Token expired mid-flight – refresh once
                if exc.response.status_code == 401 and attempt == 0:
                    _token_cache["access_token"] = None
                    token = await self._get_access_token()
                    continue
                raise
            except httpx.RequestError:
                if attempt >= MAX_RETRIES - 1:
                    raise

    # ──────────────────────────────────────────
    # Public API: Search
    # ──────────────────────────────────────────
    async def search_products(
        self,
        query: str,
        *,
        category_ids: Optional[str] = None,
        limit: int = 10,
        offset: int = 0,
        sort: str = "BEST_MATCH",
        price_min: Optional[float] = None,
        price_max: Optional[float] = None,
    ) -> dict:
        """
        Search eBay items via Browse API ``item_summary/search``.

        Returns the raw Browse API response which contains:
        - ``itemSummaries`` list
        - ``total``  / ``limit`` / ``offset`` for pagination
        """
        params: dict = {
            "q": query,
            "limit": min(limit, 200),  # API max is 200
            "offset": offset,
            "sort": sort,
        }

        if category_ids:
            params["category_ids"] = category_ids

        # Price filter uses eBay's ``filter`` syntax
        filters = []
        if price_min is not None:
            filters.append(f"price:[{price_min}..],priceCurrency:USD")
        if price_max is not None:
            filters.append(f"price:[..{price_max}],priceCurrency:USD")
        if filters:
            params["filter"] = ",".join(filters)

        return await self._request("GET", self.BROWSE_SEARCH_PATH, params=params)

    # ──────────────────────────────────────────
    # Public API: Item Details
    # ──────────────────────────────────────────
    async def get_item(self, item_id: str) -> dict:
        """
        Get full item details by eBay ``item_id`` (e.g. ``v1|123456789|0``).
        """
        path = self.BROWSE_ITEM_PATH.format(item_id=item_id)
        return await self._request("GET", path)

    # ──────────────────────────────────────────
    # Normalisation helpers (for DB ingestion)
    # ──────────────────────────────────────────
    @staticmethod
    def normalize_item_summary(item: dict) -> dict:
        """
        Flatten an eBay ``itemSummary`` into the shape expected by
        ``AffiliateProductCreate`` + extra raw_data for the matching engine.
        """
        price_info = item.get("price", {})
        image = item.get("image", {})
        seller = item.get("seller", {})

        return {
            "source_name": "eBay",
            "source_product_id": item.get("itemId", ""),
            "source_url": item.get("itemWebUrl", item.get("itemHref", "")),
            "price": float(price_info.get("value", 0)),
            "currency": price_info.get("currency", "USD"),
            "raw_data": {
                "title": item.get("title", ""),
                "condition": item.get("condition", ""),
                "image_url": image.get("imageUrl", ""),
                "seller_username": seller.get("username", ""),
                "seller_feedback_percentage": seller.get("feedbackPercentage", ""),
                "seller_feedback_score": seller.get("feedbackScore", 0),
                "item_location": item.get("itemLocation", {}),
                "categories": [
                    c.get("categoryName", "") for c in item.get("categories", [])
                ],
                "buying_options": item.get("buyingOptions", []),
                "shipping_cost": (
                    item.get("shippingOptions", [{}])[0]
                    .get("shippingCost", {})
                    .get("value")
                    if item.get("shippingOptions")
                    else None
                ),
            },
        }

    def normalize_search_results(self, response: dict) -> list[dict]:
        """Normalize the full search response into a list of product dicts."""
        items = response.get("itemSummaries", [])
        return [self.normalize_item_summary(item) for item in items]
