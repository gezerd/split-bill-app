# spec-runner

[gezerd/spec-runner](https://github.com/gezerd/spec-runner) builds every Ticket of a Spec (an issue labelled `ready-for-agent` with sub-issues) with Claude in Docker, one Ticket PR per Ticket into a Feature branch. Run it from this repo with Docker running, `gh` logged in and `CLAUDE_CODE_OAUTH_TOKEN` set:

```sh
npx github:gezerd/spec-runner [spec-number]
```

## This repo's setup

`.spec-runner/` holds the Agent image and the Gate:

- `Dockerfile`: Node 24, uv with Python 3.12, Playwright's Chromium (at `/ms-playwright`) and the Claude CLI. When `@playwright/test` is bumped in `frontend/package-lock.json`, bump the `playwright@<version>` in the Dockerfile to match, or `setup` has no matching browser.
- `config.json`: `setup` mirrors `npm run setup` from lockfiles (`npm ci`, `uv sync --locked`); the Gate is `npm test && npm run test:e2e`.

Containers get no `ANTHROPIC_API_KEY`, so everything runs on mock OCR; `npm run dev` (live OCR) doesn't work inside one.

## Writing Tickets for it

Each Ticket needs a `## Acceptance criteria` checkbox list or it is never built. Phrase what can be checked as Vitest, pytest or Playwright tests, and put "looks like the design" under `(human)` criteria, which the agent never sees and which you check while reviewing the Feature PR.
