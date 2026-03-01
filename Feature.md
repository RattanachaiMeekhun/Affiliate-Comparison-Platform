# Project Documentation: Intelligent Tech-Affiliate Aggregator

## 1. Project Vision

To build a high-conversion, data-driven affiliate platform for **Tech Products** (Micro-Niche). Unlike traditional blog-based affiliate sites, this platform functions as a **Product-Led Tool** that uses automation and AI to help users make informed purchase decisions based on data, not just opinion.

[Image of cloud-based web application architecture]

## 2. Core Value Proposition

- **Precision:** Focus on high-intent categories (e.g., trading hardware, developer productivity gear).
- **AI-Driven Insights:** Automated summaries of technical specs and value-for-money analysis.
- **Utility-First:** Built-in tools like "Setup Builders" and "Real-time Price Comparison" that solve actual user problems.

## 3. Pages & Features List

### Core Pages

- **Homepage:** Featured AI-curated deals and navigation to specific niches.
- **Category/Niche Page:** Interactive filterable lists (e.g., "Trading Monitors by resolution/refresh rate").
- **Product Detail Page (PDP):**
  - Smart Comparison Table (Cross-market price comparison).
  - AI-generated Pros/Cons.
  - Price History Charts.
- **Tool/Utility Page:** "Setup Builder" logic for hardware recommendations based on user budget.
- **About/Expertise Page:** Essential for E-E-A-T (Expertise, Experience, Authoritativeness, Trustworthiness) to improve SEO.

### Key Features

- **Frontend:** Responsive design with dynamic filtering, dark mode, and SEO-optimized Schema markup (Product, AggregateOffer).
- **Backend:** Automated Scraper engine (Playwright/Scrapy), asynchronous task queues for updates.
- **AI Engine:** Semantic matching for identical products across different marketplaces using Embeddings and PGVector.
- **Ops:** Admin dashboard to override AI results, monitor scraper health, and track affiliate click-through-rates (CTR).

## 4. Technical Architecture & Database Schema

The foundation relies on a relational database design capable of handling diverse technical specifications.

[Image of relational database schema design]

### Recommended Schema Design Principles:

- **Products Table:** Store core product identity (UUID, Name, Category).
- **Prices Table:** Relational table storing timestamps and prices from various stores.
- **Specs Table (JSONB):** Use PostgreSQL `JSONB` to store varying technical specifications (CPU, RAM, Refresh Rate, etc.) without rigid schema constraints.
- **Affiliate Links Table:** Dedicated store for generated deep-links and tracking codes.

## 5. Development Roadmap (MVP)

| Phase       | Focus            | Key Tasks                                           |
| :---------- | :--------------- | :-------------------------------------------------- |
| **Phase 1** | Research & Setup | Keyword analysis, Affiliate API integration.        |
| **Phase 2** | MVP Backend      | Scraper engine, PostgreSQL Schema, Matching logic.  |
| **Phase 3** | Frontend & SEO   | Next.js deployment, Structured data implementation. |
| **Phase 4** | Optimization     | AI-driven insights, Price history, Analytics.       |

## 6. Senior Dev Strategy Notes

- **Focus on the "Matching Engine" first:** This is your competitive moat. Use AI to normalize data across different marketplace formats.
- **Prioritize Technical SEO:** Use Server-Side Rendering (SSR) to ensure Google can parse your comparison data effectively.
- **Infrastructure:** Start with Cloud Run/Kubernetes to handle the asynchronous nature of your web crawlers.
