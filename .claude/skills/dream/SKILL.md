---
name: dream
description: Run a full memory consolidation (dream session)
---

Run a full memory consolidation (dream session):

1. Read MEMORY.md and list all memory files currently indexed
2. For each memory file:
   - Read it and verify if the information is still accurate against the current project state
   - Check git log, file structure, package.json, and code patterns to validate
   - Flag anything outdated (old dates, deleted features, resolved issues)
3. Prune/consolidate:
   - Remove or compress items that are no longer actionable
   - Update outdated information
   - Keep MEMORY.md under 200 lines total (index only)
   - Individual memory files should be concise (<200 lines each)
   - Convert relative dates ("yesterday", "2 weeks ago") to absolute dates, or remove them
4. Update MEMORY.md index if any files were added/removed/renamed
5. Report a summary of what was changed, pruned, or preserved
