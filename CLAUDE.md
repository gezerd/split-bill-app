# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Root `package.json` scripts drive everything, the same on Windows and macOS. Prerequisites: Node 18+ and [uv](https://docs.astral.sh/uv/). Start with `npm run setup`, then `npm run dev:mock` (no Anthropic API calls) or `npm run dev` (live OCR, needs `ANTHROPIC_API_KEY` in root `.env`). `npm test` needs no servers; `npm run test:e2e` starts its own servers on :8001/:5174. Pass extra args after `--` (e.g. `npm run test:backend -- -k breakdown`).

The backend is uv-managed: run tools with `uv run --directory backend <cmd>` and add deps with `uv add`. Lockfiles (`uv.lock`, both `package-lock.json`) are committed.

## Architecture

- **All data lives in memory** (`backend/app/services/data_store.py`). Postgres in `docker-compose.yml` is infrastructure only in v1; nothing reads or writes it.
- **Frontend state lives in one hook**: every API call and piece of React state goes in `frontend/src/hooks/useBillData.js`. Components stay presentational, receiving data and handlers as props from `App.jsx`.
- **Splitting rules**: read `CONTEXT.md` for the domain language and `docs/adr/` for decisions. ADR 0001 (shares are weights) supersedes the units-based math still in `calculation_service.py`.

## UI Verification Rule

**Trigger:** after any UI change; when asked to verify the frontend or match the design; and when the user shares a claude.ai artifact link (`claude.ai/artifact/...` or `claude.ai/code/artifact/...`), which is a design update to import first.

### Importing design updates

`designs/` mirrors a claude.ai Design artifact. Pull it directly rather than asking the user to export anything:

1. `Artifact` tool, `action: "list"`, `scope: "files"`, `url: <link>`.
2. `Artifact` tool, `action: "read"`, `paths: [<every published file>]`, `url: <link>`, `out_dir: "designs"`, overwriting in place.
3. Continue into the verification loop with the fresh files.

### Verification loop

The handoff is **high-fidelity**: recreate it pixel-for-pixel. `designs/README.md` maps each screen/state to its HTML file and states the quantity-aware assignment rule; `designs/styles.css` holds every token, size, radius and animation. Open the HTML in a browser to inspect exact values.

1. Run `npm run dev:mock` and open `http://localhost:5173` on the affected step.
2. Screenshot the live UI and the matching `designs/*.html`.
3. Compare colors, spacing, typography, radius, layout and interactive states. Dynamic data (names, prices, amounts) may differ; structure, formatting and visuals must match.
4. Fix and repeat from step 2 until the screenshots match. Every deviation found is fixed before reporting done.
5. Stop the dev server.

If no design file covers the changed area, say so and skip.

**Token gotcha:** `frontend/tailwind.config.js` approximates the design tokens but drifts in places: its `on-accent` is navy, while the design puts `#111` on accent fills (`text-[#111]`). When they disagree, `designs/styles.css` wins.

## Agent skills

- **Issue tracker**: GitHub Issues (gezerd/split-bill-app) via `gh`. See `docs/agents/issue-tracker.md`.
- **Triage labels**: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.
- **Domain docs**: single-context `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.
- **spec-runner**: `.spec-runner/` configures builds of Specs by gezerd/spec-runner. See `docs/agents/spec-runner.md`.
