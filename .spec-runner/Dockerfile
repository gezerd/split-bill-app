# The Agent image for building split-bill-app: Node for the frontend and the
# root scripts, uv (and through it Python 3.12) for the backend, Playwright's
# Chromium for the e2e suite, git, and the Claude Code CLI.
FROM node:24-bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:0.12 /uv /uvx /usr/local/bin/

# Chromium and its system libraries go in a shared folder, so `setup` finds
# them already installed. Keep the version in step with @playwright/test in
# frontend/package-lock.json.
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx -y playwright@1.63.0 install --with-deps chromium \
 && chmod -R a+rX /ms-playwright

RUN npm install -g @anthropic-ai/claude-code

# Claude refuses to skip permission prompts as root, so the agent runs as the
# image's `node` user, which needs to own the folder the repo is cloned into.
RUN mkdir /work && chown node:node /work
USER node

# Fetched once here rather than by every container's `uv sync`.
RUN uv python install 3.12
