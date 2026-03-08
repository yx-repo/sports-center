const https = require('https');

const API_KEY = process.env.THESPORTSDB_KEY || '123';
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

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

const args = process.argv.slice(2);
const leagueArgIndex = args.indexOf('--league');
const leagueInput = leagueArgIndex !== -1 ? args[leagueArgIndex + 1] : null;
// Optional season arg, defaults to current/recent
const seasonArgIndex = args.indexOf('--season');
const season = seasonArgIndex !== -1 ? args[seasonArgIndex + 1] : '2025-2026'; 

if (!leagueInput) {
    console.log("Usage: node get_standings.js --league \"League Name\" [--season \"2025-2026\"]");
    process.exit(1);
}

const leagueId = LEAGUES[leagueInput.toLowerCase()] || leagueInput;

(async () => {
    const url = `${BASE_URL}/lookuptable.php?l=${leagueId}&s=${season}`;
    
    try {
        const data = await fetchJson(url);
        if (!data.table) {
            console.log(`No standings found for ${leagueInput} season ${season}. Try a different season?`);
            // Fallback to previous season logic could go here
            return;
        }

        console.log(`\n=== Standings: ${leagueInput.toUpperCase()} (${season}) ===\n`);
        console.log("| # | Team | Played | W | D | L | GF | GA | Pts |");
        console.log("|---|---|---|---|---|---|---|---|---|");
        
        data.table.forEach(t => {
            console.log(`| ${t.intRank} | ${t.strTeam} | ${t.intPlayed} | ${t.intWin} | ${t.intDraw} | ${t.intLoss} | ${t.intGoalsFor} | ${t.intGoalsAgainst} | ${t.intPoints} |`);
        });

    } catch (error) {
        console.error("Error fetching standings:", error.message);
    }
})();
