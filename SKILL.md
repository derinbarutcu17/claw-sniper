---
name: claw-job-sniper
description: Autonomous job discovery and semantic portfolio matching. Finds jobs, ranks them against local project documentation, and drafts personalized outreach.
---

# Claw Job Sniper 🎯

This skill allows the agent to find jobs and match them against the user's local portfolio.

## Commands

- `!sniper run`: Scans job feeds (Berlin Startup Jobs), calculates "Vibe-Match" scores using QMD, and updates the local dashboard.
- `!sniper draft <job-id>`: Generates a personalized outreach pitch for a specific job from the database.

## Workflow

1.  **Scout:** Fetches latest jobs from configured RSS/JSON feeds.
2.  **Match:** Uses QMD to query the `job-sniper-knowledge` collection.
3.  **Report:** Categorizes matches into Good/Mid/Low tiers.
4.  **Draft:** Spawns a high-fidelity writing turn for specific roles.

## Integration

The skill uses a local SQLite database at `data/sniper.db` and a Bun-based dashboard at `localhost:3000`.
