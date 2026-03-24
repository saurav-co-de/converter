# PDF Platform

A greenfield monorepo for an iLovePDF-style platform with:

- `apps/web`: Next.js marketing site and application shell
- `apps/worker`: queue-driven document processing worker
- `packages/ui`: shared React UI components
- `packages/types`: shared contracts and product metadata
- `packages/config`: environment validation and Prisma schema
- `packages/pdf-core`: processing adapter contracts
- `infra`: local infrastructure and container definitions

## Quick start

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env`
3. Start local infrastructure: `docker compose -f infra/docker-compose.yml up -d`
4. Generate Prisma client: `npm run db:generate`
5. Run the web app: `npm run dev:web`
6. Run the worker: `npm run dev:worker`

## Current scope

This repository implements the foundational platform:

- marketing site and SEO-ready tool pages
- dashboard and account route shells
- API contract stubs for uploads, jobs, billing, workflows, and downloads
- shared job contracts and tool metadata
- worker scaffolding with adapter registry
- Prisma schema for users, jobs, files, subscriptions, workflows, and audit events
- Docker-based local stack for Postgres, Redis, and MinIO
