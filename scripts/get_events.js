const https = require('https');

const API_KEY = process.env.THESPORTSDB_KEY || '123';
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

// Common League IDs (TheSportsDB IDs)
const LEAGUES = {
    'epl': '4328', 'premier league': '4328',
    'nba': '4387',
    'nfl': '4391',
    'mlb': '4424',
    'nhl': '4380',
    'la liga': '4335',
    'bundesliga': '4331',
    'serie a': '4332',
    'ligue 1': '4334'
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// CLI Argument Handling
const args = process.argv.slice(2);
const leagueArgIndex = args.indexOf('--league');
const leagueInput = leagueArgIndex !== -1 ? args[leagueArgIndex + 1] : null;

if (!leagueInput) {
    console.log("Usage: node get_events.js --league \"League Name\"");
    console.log("Available shortcuts: epl, nba, nfl, mlb, nhl, la liga, bundesliga, serie a, ligue 1");
    process.exit(1);
}

const leagueId = LEAGUES[leagueInput.toLowerCase()] || leagueInput; // Try lookup, else assume ID

(async () => {
    // 1. Get recent events (Past 15)
    const pastUrl = `${BASE_URL}/eventspastleague.php?id=${leagueId}`;
    // 2. Get next events (Next 15)
    const nextUrl = `${BASE_URL}/eventsnextleague.php?id=${leagueId}`;

    try {
        const [past, next] = await Promise.all([
            fetchJson(pastUrl),
            fetchJson(nextUrl)
        ]);

        console.log(`\n=== Schedule: ${leagueInput.toUpperCase()} ===\n`);

        if (past.events) {
            console.log("--- Recent Results ---");
            past.events.slice(0, 5).forEach(e => {
                console.log(`[${e.dateEvent}] ${e.strHomeTeam} ${e.intHomeScore} - ${e.intAwayScore} ${e.strAwayTeam}`);
            });
        }

        if (next.events) {
            console.log("\n--- Upcoming ---");
            next.events.slice(0, 5).forEach(e => {
                console.log(`[${e.dateEvent} ${e.strTime}] ${e.strEvent}`);
            });
        }
        
        if (!past.events && !next.events) {
            console.log("No recent or upcoming events found. (Is the league in season?)");
        }

    } catch (error) {
        console.error("Error fetching events:", error.message);
    }
})();
