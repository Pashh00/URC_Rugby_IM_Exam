import { cachedFetch, FIXTURES_TTL, STANDINGS_TTL } from "./api.js";
import { TEAMS } from "./teams-data.js";
import { crestHtml, matchHtml, statusOf, formatDay, showLoading, showEmpty, showError } from "./utilities.js";
import { animateLivePulse } from "./motion.js";

const slug = new URLSearchParams(window.location.search).get("team");
const team = TEAMS[slug];

const nameEl = document.querySelector("#team-name");
const subEl = document.querySelector("#team-sub");
const infoBox = document.querySelector("#team-info");
const liveBox = document.querySelector("#team-live");
const standingBox = document.querySelector("#team-standing");
const upcomingBox = document.querySelector("#team-upcoming");
const resultsBox = document.querySelector("#team-results");
const bannerEl = document.querySelector("#team-banner");
const crestEl = document.querySelector("#team-crest");

function showInfo() {
  nameEl.textContent = team.name;
   subEl.textContent = team.tagline;
  bannerEl.classList.add(`team-banner--${slug}`);
  crestEl.innerHTML = crestHtml(team);
  document.title = `${team.name} · URC Rugby Hub`;
  infoBox.innerHTML = `
    <div class="team-head">
      ${crestHtml(team)}
      <p class="team-intro">${team.intro}</p>
    </div>
    <dl class="key">
      <dt>City</dt><dd>${team.city}</dd>
      <dt>Home ground</dt><dd>${team.ground}</dd>
      <dt>Colours</dt><dd>${team.colours}</dd>
      <dt>Run by</dt><dd>${team.union}</dd>
    </dl>
    <h3 class="facts-title">Quick facts</h3>
    <ul class="facts">${team.facts.map(fact => `<li>${fact}</li>`).join("")}</ul>
  `;
}

function showNotFound() {
  nameEl.textContent = "Team not found";
  subEl.textContent = "";
  liveBox.hidden = true;
  infoBox.innerHTML = `<p class="state">We couldn't find that team. <a href="teams.html">Go back to all teams</a>.</p>`;
}

function showStanding(row) {
  standingBox.innerHTML = `
    <dl class="stats">
      <div class="stat"><dt>Position</dt><dd>${row.position}</dd></div>
      <div class="stat"><dt>Played</dt><dd>${row.gamesPlayed}</dd></div>
      <div class="stat"><dt>Won</dt><dd>${row.wins}</dd></div>
      <div class="stat"><dt>Drawn</dt><dd>${row.draws}</dd></div>
      <div class="stat"><dt>Lost</dt><dd>${row.loses}</dd></div>
      <div class="stat"><dt>Points</dt><dd>${row.points}</dd></div>
    </dl>
    <p class="table-key">Position is the team's place in the full United Rugby Championship table.</p>
  `;
}

function groupedHtml(matches) {
  const days = new Map();
  matches.forEach(m => {
    const day = formatDay(m.date);
    if (!days.has(day)) days.set(day, []);
    days.get(day).push(m);
  });
  return [...days].map(([day, list]) => `
    <section class="day">
      <h3 class="day__title">${day}</h3>
      <ul class="matches">${list.map(matchHtml).join("")}</ul>
    </section>
  `).join("");
}

async function loadStanding() {
  showLoading(standingBox, "Loading this team's standing…");
  try {
    const data = await cachedFetch("/standings?leagueId=65460&season=2026", STANDINGS_TTL);
    const row = data.groups[0].standings.find(r => r.team.id === team.id);
    if (row) {
      showStanding(row);
    } else {
      showEmpty(standingBox, "No standing available for this team yet.");
    }
  } catch (err) {
    showError(standingBox, err, loadStanding);
  }
}

async function loadMatches() {
  showLoading(upcomingBox, "Loading upcoming matches…");
  showLoading(resultsBox, "Loading recent results…");
  try {
    const data = await cachedFetch("/matches?leagueId=65460&season=2026", FIXTURES_TTL);
    const mine = data.data.filter(m => m.homeTeam.id === team.id || m.awayTeam.id === team.id);

    const upcoming = mine
      .filter(m => statusOf(m) !== "finished")
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
    const results = mine
      .filter(m => statusOf(m) === "finished")
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);

    if (upcoming.length > 0) {
      upcomingBox.innerHTML = groupedHtml(upcoming);
    } else {
      showEmpty(upcomingBox, `No upcoming matches for the ${team.name} yet.`);
    }
    if (results.length > 0) {
      resultsBox.innerHTML = groupedHtml(results);
    } else {
      showEmpty(resultsBox, `No results for the ${team.name} yet.`);
    }
  } catch (err) {
    showError(upcomingBox, err, loadMatches);
    showError(resultsBox, err);
  }
    animateLivePulse();
}

if (team) {
  showInfo();
  loadStanding();
  loadMatches();
} else {
  showNotFound();
}