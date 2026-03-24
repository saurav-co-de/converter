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
COPY apps/worker/package.json apps/worker/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/pdf-core/package.json packages/pdf-core/package.json

RUN npm ci

COPY . .

ENV NODE_ENV=production

CMD ["npm", "run", "dev", "--workspace", "@pdf-platform/worker"]
