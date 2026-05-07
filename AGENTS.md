# AGENTS.md — SkillForge AI

## Project Overview

SkillForge AI is a futuristic AI-powered developer intelligence platform that combines:
- coding analytics
- behavioral intelligence
- GitHub intelligence
- skill evolution tracking
- AI-assisted recommendations
- futuristic 3D UI systems

The project follows a scalable SaaS-style architecture with premium dual-theme UI, advanced analytics pipelines, and modular backend services.

---

# Core Architecture

## Frontend

Location:
```txt
/frontend
````

Stack:

* Next.js App Router
* React
* Tailwind CSS
* Framer Motion
* React Three Fiber
* Drei
* Zustand

---

## Backend

Location:

```txt
/backend
```

Stack:

* Node.js
* Express.js
* MongoDB
* Redis
* BullMQ

---

# Frontend Rules

## UI Philosophy

The application should feel like:

* futuristic AI operating system
* premium developer intelligence platform
* cinematic SaaS product

NOT:

* gaming UI
* crypto dashboard
* generic admin panel

---

## Styling Rules

Always:

* use Tailwind CSS
* use reusable UI components
* maintain dual-theme compatibility
* use design tokens from globals.css
* preserve futuristic glassmorphism aesthetic

Avoid:

* inline CSS
* random hardcoded colors
* inconsistent spacing
* unstyled HTML elements

---

# Theme Rules

The application supports:

* Light Mode
* Dark Mode

## Light Mode

Use:

* white/light backgrounds
* cyan/lavender gradients
* soft glass effects
* holographic highlights

## Dark Mode

Use:

* deep navy backgrounds
* indigo surfaces
* cyan/purple glow
* premium neon accents

Avoid:

* pure black backgrounds
* excessive glow saturation

---

# Component Rules

Reusable UI components must live inside:

```txt
/frontend/src/components/ui
```

Always reuse:

* Button
* Card
* Field
* Modal
* SectionHeader

Do not create duplicate variants unnecessarily.

---

# Layout Rules

Use:

```txt
/frontend/src/components/Layout.jsx
```

Dashboard pages must:

* use shared sidebar
* use shared top navigation
* remain responsive

---

# Animation Rules

Use:

* Framer Motion
* subtle transitions
* soft hover motion
* smooth page transitions

Avoid:

* excessive motion
* flashy animations
* distracting effects

---

# 3D Rules

Use only:

* React Three Fiber
* Drei

All 3D scenes must:

* be optimized
* support lazy loading
* avoid heavy GPU usage

Use:

* InstancedMesh for repeated objects
* selective rendering
* react-intersection-observer when needed

Avoid:

* unoptimized particle systems
* extremely high polygon counts
* unnecessary postprocessing

---

# Branding Rules

The animated logo is a core identity element.

Files:

```txt
/frontend/src/components/brand
```

The logo should feel:

* intelligent
* futuristic
* holographic
* cinematic

Do not replace branding direction with:

* flat corporate logos
* cartoon AI icons
* gaming-style logos

---

# Backend Rules

Backend structure:

```txt
/backend/src
```

Use:

```txt
controllers/
services/
routes/
middleware/
models/
queues/
analytics/
scrapers/
```

Keep:

* routes thin
* logic inside services
* analytics modular

Avoid:

* massive route files
* duplicated logic
* mixing analytics with route handlers

---

# Authentication Rules

Authentication system must:

* use JWT
* use HTTP-only cookies
* hash passwords using bcrypt
* validate inputs using Zod

Never:

* store auth tokens in localStorage
* expose sensitive credentials
* bypass middleware protection

---

# Database Rules

Primary database:

* MongoDB

Optional:

* Neo4j for skill graph

Schema rules:

* avoid deeply nested documents
* normalize analytics structures
* use indexes for performance-critical queries

Collections:

* users
* sessions
* settings
* coding_profiles
* submissions
* topic_stats
* github_activity
* analytics_snapshots
* skill_decay
* sync_jobs

---

# Scraping & Queue Rules

Use:

* BullMQ
* Redis
* Puppeteer
* Cheerio

All scraping must:

* use queues
* use retries
* support delayed execution
* implement caching

Workers should:

* use randomized user agents
* implement rotating delays
* avoid aggressive scraping

Fallbacks:

* manual logging
* cached analytics
* partial sync recovery

---

# Unified Difficulty Index (UDI)

All analytics must use:

* Unified Difficulty Index normalization

Do not directly compare:

* LeetCode difficulty
* CodeChef ratings
* HackerRank levels

Use internal normalized scoring.

---

# Analytics Rules

Analytics should remain:

* explainable
* modular
* scalable

Avoid:

* black-box scoring
* hidden calculations
* overly complex heuristics

Core metrics:

* accuracy
* consistency
* topic mastery
* growth trends
* activity tracking
* retention scores

---

# Skill Decay Rules

Use:

```txt
R = e^(-t/S)
```

Store:

* topic stability values

Trigger revision alerts when:

```txt
R < 0.6
```

---

# AI & Intelligence Rules

The system uses:

* explainable logic
* ML-assisted analysis
* optional LLM reasoning

Do not:

* generate fake intelligence
* use random AI summaries
* create unverifiable scoring

All insights should include:

* reasoning
* evidence
* confidence indicators

---

# GitHub Intelligence Rules

Use:

* GitHub GraphQL API

Track:

* commit consistency
* repository activity
* language usage
* project continuity

Combine GitHub behavior with:

* coding analytics
* topic mastery
* confidence scoring

---

# Admin System Rules

Admin panels are intelligence-focused.

Admin systems should manage:

* UDI mappings
* queue monitoring
* analytics quality
* recommendation weighting
* ingestion health
* AI insight review

Avoid:

* generic CRUD-only admin panels

---

# Performance Rules

Always optimize:

* API calls
* database queries
* rendering
* animations
* 3D scenes

Use:

* lazy loading
* memoization
* Redis caching
* pagination
* async processing

Target:

* smooth experience on mid-range laptops

---

# File & Folder Rules

Do NOT:

* create duplicate pages
* duplicate components
* mix frontend/backend logic
* place business logic inside UI components

---

# Documentation Rules

Keep updated:

* README.md
* ARCHITECTURE.md
* API docs
* setup guides

Document:

* major architecture decisions
* analytics formulas
* queue flow
* normalization logic

---

# Coding Philosophy

SkillForge AI should feel:

* engineered
* intelligent
* premium
* scalable
* futuristic

Every feature should prioritize:

1. clarity
2. scalability
3. explainability
4. performance
5. visual consistency

---

# Important Final Rule

When adding new features:

* preserve the futuristic AI identity
* maintain design consistency
* avoid feature bloat
* optimize before adding complexity

The platform should always feel like:
"a next-generation developer intelligence ecosystem"

not:
"a collection of random features."

```
```
