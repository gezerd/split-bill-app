---
name: sync-designs
description: Refreshes the designs/ folder from the latest handoff export and updates CLAUDE.md to match the new structure. Use when the user says "sync designs", "update designs", "new design handoff", or wants to pull in a fresh export from ~/Downloads/design_handoff_split_bill/.
---

# Skill: sync-designs

Refreshes the `designs/` folder from the latest handoff export and updates the design reference section in `CLAUDE.md` to match the new folder structure.

## Steps

1. **Replace the designs folder**
   - Delete `designs/` entirely
   - Copy `~/Downloads/design_handoff_split_bill/` into `designs/`

2. **Inspect the new structure**
   - List all files under `designs/` recursively
   - Read `designs/README.md`

3. **Update CLAUDE.md**
   - Locate the "Design reference files" section inside "UI Verification Rule"
   - Rewrite it to accurately reflect the actual folder names, file names, file types, and any notes from the new README (e.g. which accent the screens render with, whether files are HTML or PNG, whether there's a contact sheet)
   - Update the design token table if the default accent or any token values changed
   - Do not touch any other sections of CLAUDE.md
