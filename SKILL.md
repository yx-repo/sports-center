---
name: sports-center
description: Sports information aggregator. Use for retrieving latest scores, match schedules, team standings, and sports news. Supports drill-down into specific games or teams.
---

# Sports Center

Use this skill when the user asks for sports information, game scores, schedules, or team updates. It mimics a "sports dashboard" by aggregating data.

## Capabilities

1.  **Dashboard**: Lists active leagues and current/upcoming games.
2.  **Standings**: Shows team rankings and stats.
3.  **Team Details**: Comprehensive info (stadium, manager, description) + recent results.
4.  **News**: Synthesizes latest news from web search.

## Data Sources
- **TheSportsDB**: Primary source for teams, leagues, and schedule/results.
- **Web Search**: For latest news narratives and rumors.

## Usage

### 1. Dashboard (General View)
When asked for "Sports info" or "scores":
1.  Identify the sport/league (e.g., "NBA", "Premier League"). If none, list popular ones.
2.  Call `get_events.js` to fetch recent/upcoming games.
3.  Display a summary table or list.

### 2. Drill-Down (Team/Game)
When asked about a specific team ("How are the Lakers doing?"):
1.  Call `get_team.js` for details.
2.  Call `get_standings.js` for their rank.
3.  Run a `web_search` for "Lakers latest news" to add context.

## Scripts

### `get_events.js`
Fetches events for a league.
Usage: `node scripts/get_events.js --league "English Premier League"`

### `get_standings.js`
Fetches standings table.
Usage: `node scripts/get_standings.js --league "NBA" --season "2025-2026"`

### `get_team.js`
Fetches team details.
Usage: `node scripts/get_team.js --team "Arsenal"`
