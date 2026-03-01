# Project Documentation: PixelStack.io

## Intelligent Tech-Affiliate Aggregator

### 1. Vision

PixelStack.io serves as a high-performance, data-driven hub that bridges the gap between raw e-commerce data and informed purchasing decisions. By leveraging AI-automated scraping and semantic matching, we provide tech enthusiasts with the most accurate, real-time comparisons across multi-category markets (Retail, Gaming, Services, and Finance).

### 2. Core Modules & Architecture

The system is built on a modular micro-services architecture to ensure high availability and data integrity.

- **Ingestion Layer:** Asynchronous crawlers (Playwright/Scrapy) managing multi-source data ingestion.
- **Intelligence Layer:** Gemini-based matching engine utilizing vector embeddings (PGVector) to normalize product identities.
- **Distribution Layer:** SEO-optimized frontend (Next.js) serving server-side rendered (SSR) content.
- **Operations Layer:** Admin dashboard for manual data overrides and scraper health monitoring.

### 3. Feature Specifications

| Feature                | Description                                                     | Implementation Priority |
| :--------------------- | :-------------------------------------------------------------- | :---------------------- |
| **Smart Aggregator**   | Centralizes data from Shopee, Lazada, and partner programs.     | P0                      |
| **Semantic Matching**  | AI-driven product normalization (e.g., "iPhone 15" vs "iP 15"). | P0                      |
| **Interactive Tables** | Filterable, sortable, and responsive comparison grids.          | P0                      |
| **Price History API**  | Tracks price fluctuations for historical value analysis.        | P1                      |
| **AI Insights Panel**  | Automated Pros/Cons and value scores for each product.          | P1                      |
| **Setup Builder**      | User-input tool to generate hardware recommendations.           | P2                      |

### 4. Page Hierarchy

#### A. Core Pages

- **Homepage:** Landing page featuring trending AI-curated deals across all categories.
- **Comparison Hubs:** Dedicated pages for Niche categories (e.g., `/gaming-gear`, `/quant-hardware`).
- **Product Detail Page (PDP):** Deep dive page including cross-market pricing, specs, and price trends.
- **Setup Builder Tool:** Interactive wizard for custom hardware configurations.

#### B. Support & Authority Pages

- **Methodology Page:** Transparency page explaining how PixelStack data is sourced and analyzed (Essential for E-E-A-T).
- **About/Contact:** Corporate information and developer contact channels.
- **Legal:** Affiliate Disclosure, Privacy Policy, and Terms of Service.

### 5. Technical Stack

- **Backend:** Python 3.12+ (FastAPI).
- **Database:** Supabase PostgreSQL (with `PGVector` extension).
- **Frontend:** Next.js 16 (App Router) with antd modernCSS Redux toolkit axios(create instance).
- **Infrastructure:** Backend Google Cloud Run (Containerized Services), Frontend Vercel.
- **AI Integration:** LangGraph for agent orchestration, Gemini API for data analysis.

### 6. Development Strategy (Next Steps)

1.  **Environment Setup:** Initialize the GitHub repository and CI/CD pipeline.
2.  **Schema Design:** Finalize the normalized PostgreSQL schema for multi-category products.
3.  **MVP Ingestion:** Deploy the first scraper for a specific sub-niche (e.g., Mechanical Keyboards) to validate the Matching Engine.
4.  **SEO Foundation:** Implement Structured Data (Schema.org) immediately upon the first page deployment.

### 7.Cosmetic

- **Frontend:** Add stylish modernCSS to the frontend.With smooth animations and transitions. Use antd modernCSS for components.
