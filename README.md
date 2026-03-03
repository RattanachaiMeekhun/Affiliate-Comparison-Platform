# stacknodes.net

**The Intelligent Tech-Affiliate Aggregator**

stacknodes.net is a data-driven platform built to bridge the gap between complex technical product data and consumer purchasing decisions. By combining automated web-scraping pipelines, semantic AI matching, and SEO-optimized architecture, stacknodes provides tech enthusiasts with high-fidelity product comparisons across multiple categories (Tech, Gaming, Services, and Finance).

## 🚀 Vision

To move beyond traditional "blog-style" affiliate sites by providing a **Product-Led Platform** that helps users compare specs, track price history, and make informed choices through AI-orchestrated insights.

## 🛠 Tech Stack

- **Language & Framework:** Python 3.12+ (FastAPI), TypeScript (Next.js 14+)
- **Database:** PostgreSQL (with `PGVector` for semantic product matching)
- **AI Orchestration:** Gemini API, LangGraph
- **Infrastructure:** Cloud-native (Google Cloud Run / Kubernetes)
- **Data Pipelines:** Playwright, Scrapy

## 🏗 Key Features

- **Smart Aggregator:** Real-time synchronization of product feeds from global marketplaces (Shopee, Lazada, Amazon, and niche partners).
- **Semantic Matching Engine:** Uses Vector Embeddings to normalize product identities across disparate platforms, ensuring accurate price comparisons.
- **Interactive Comparison:** SEO-optimized, filterable tables designed for high-intent tech buyers.
- **Value-Driven AI:** Automated analysis of product specifications and historical pricing to highlight "Best Value" choices.

## 📁 Repository Structure

```text
/
├── docs/            # Technical specifications & documentation
├── src/
│   ├── scraper/     # Asynchronous ingestion services
│   ├── matching/    # AI-driven normalization & matching engine
│   ├── api/         # FastAPI backend
│   └── web/         # Next.js frontend
└── scripts/         # Automation & deployment utilities
```
