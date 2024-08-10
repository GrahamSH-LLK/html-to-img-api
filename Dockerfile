FROM oven/bun:alpine

WORKDIR /app

COPY package.json .
COPY bun.lockb .
RUN apk add chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser
RUN bun install --production

COPY src src
COPY tsconfig.json .
# COPY public public

ENV NODE_ENV production
USER pptruser

CMD ["bun", "src/index.ts"]

