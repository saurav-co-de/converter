FROM node:24-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    imagemagick \
    libreoffice \
    mupdf-tools \
    qpdf \
    zip \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/pdf-core/package.json packages/pdf-core/package.json

RUN npm ci

COPY . .

RUN npm run build --workspace @pdf-platform/web

ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

CMD ["npm", "run", "start", "--workspace", "@pdf-platform/web", "--", "--hostname", "0.0.0.0", "--port", "10000"]
