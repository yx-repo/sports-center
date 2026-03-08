const https = require('https');

const API_KEY = process.env.THESPORTSDB_KEY || '123'; // Default test key
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

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

async function searchTeam(teamName) {
  const url = `${BASE_URL}/searchteams.php?t=${encodeURIComponent(teamName)}`;
  try {
    const data = await fetchJson(url);
    if (!data.teams) return null;
    return data.teams[0];
  } catch (error) {
    console.error("Error fetching team:", error.message);
    return null;
  }
}

async function getLastGames(teamId) {
    const url = `${BASE_URL}/eventslast.php?id=${teamId}`;
    try {
        const data = await fetchJson(url);
        return data.results || [];
    } catch (error) {
        return [];
    }
}

async function getNextGames(teamId) {
    const url = `${BASE_URL}/eventsnext.php?id=${teamId}`;
    try {
        const data = await fetchJson(url);
        return data.events || [];
    } catch (error) {
        return [];
    }
}

// CLI Argument Handling
const args = process.argv.slice(2);
const teamNameArgIndex = args.indexOf('--team');
const teamName = teamNameArgIndex !== -1 ? args[teamNameArgIndex + 1] : null;

if (!teamName) {
  console.log("Usage: node get_team.js --team \"Team Name\"");
  process.exit(1);
}

(async () => {
  const team = await searchTeam(teamName);
  if (!team) {
    console.log(`Team "${teamName}" not found.`);
    return;
  }

  const lastGames = await getLastGames(team.idTeam);
  const nextGames = await getNextGames(team.idTeam);

  console.log(`\n=== ${team.strTeam} ===`);
  console.log(`League: ${team.strLeague}`);
  console.log(`Stadium: ${team.strStadium} (${team.strStadiumLocation})`);
  console.log(`Description: ${team.strDescriptionEN ? team.strDescriptionEN.substring(0, 150) + "..." : "N/A"}\n`);

  console.log("--- Recent Results ---");
  lastGames.slice(0, 5).forEach(g => {
      console.log(`${g.dateEvent}: ${g.strHomeTeam} ${g.intHomeScore} - ${g.intAwayScore} ${g.strAwayTeam}`);
  });

  console.log("\n--- Upcoming Games ---");
  nextGames.slice(0, 5).forEach(g => {
      console.log(`${g.dateEvent} ${g.strTime}: vs ${g.strEvent.replace(team.strTeam, '').replace('vs', '').trim()}`);
  });
})();
