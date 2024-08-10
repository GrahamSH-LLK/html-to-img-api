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
RUN  groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    #&& mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /node_modules \
    && chown -R pptruser:pptruser /package.json \
    && chown -R pptruser:pptruser /package-lock.json
USER pptruser

CMD ["bun", "src/index.ts"]

