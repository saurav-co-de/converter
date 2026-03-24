# Capability Matrix

## Launch-ready scaffold

- Marketing site and SEO-friendly tool pages
- Shared tool metadata and usage policies
- API route skeletons for uploads, jobs, downloads, workflows, billing, and 2FA
- Worker runtime with adapter registry
- Prisma schema for users, jobs, files, subscriptions, workflows, cloud connections, and audit events
- Local Postgres, Redis, and MinIO stack

## Planned tool adapter expansion

- `qpdf` / `pdfcpu`: merge, split, remove, extract, rotate, protect, unlock, organize
- `Ghostscript`: compress, repair, normalize, PDF/A
- `ImageMagick`: JPG <-> PDF, watermark raster flows
- `LibreOffice`: Office conversions
- `Tesseract`: OCR
- AI provider abstraction: summarize and translate
