FROM alpine:3.20

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787
ENV CODEX_HOME=/root/.codex
ENV CC_SWITCH_HOME=/root/.cc-switch

RUN apk add --no-cache nodejs npm bash git \
  && npm install -g @openai/codex@0.130.0

COPY package.json ./
COPY server.mjs ./
COPY public ./public
COPY README.md ./

RUN mkdir -p /app/projects /root/.codex /root/.cc-switch

EXPOSE 8787

CMD ["node", "server.mjs"]
