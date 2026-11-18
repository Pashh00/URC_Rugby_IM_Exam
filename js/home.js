import { cachedFetch, FIXTURES_TTL, STANDINGS_TTL } from "./api.js";
import { SA_TEAMS, isSaMatch, formatBadge, formatDate, crestHtml, showLoading, showEmpty, showError } from "./utilities.js";
import { TEAMS } from "./teams-data.js";
import { animateNextMatch, animateStandingsRows } from "./motion.js";

const nextMatchBox = document.querySelector("#next-match");
const snapshotBox = document.querySelector("#standings-snapshot");
const linksBox = document.querySelector("#quick-links");
const resultsBox = document.querySelector("#recent-results");

function findNextMatch(matches) {
  const now = Date.now();
  return matches
    .filter(m => m.state.description === "Not started")
    .filter(m => new Date(m.date).getTime() > now)
    .filter(isSaMatch)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
}

function findRecentResults(matches) {
  return matches
    .filter(m => m.state.description === "Finished")
    .filter(isSaMatch)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);
}

function showNextMatch(match) {
  nextMatchBox.innerHTML = `
    <div class="next-card">
          <svg class="next__arc" viewBox="0 0 400 64" aria-hidden="true" focusable="false">
           <path id="ball-path" d="M 40 58 Q 200 -30 360 58" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2" stroke-dasharray="4 8"/>
           <g id="ball" opacity="0">
          <ellipse rx="13" ry="8" fill="#b5651d"/>
          <path d="M-6 0h12M-3 -2v4M0 -2v4M3 -2v4" stroke="#ffffff" stroke-width="1.2" fill="none"/>
        </g>
      </svg>
      <div class="next__team">${crestHtml(match.homeTeam)}<span class="next__name">${match.homeTeam.name}</span></div>
      <div class="next__middle">
        <span class="next__vs">VS</span>
        <time class="next__kickoff" datetime="${match.date}">${formatBadge(match.date)}</time>
        <span class="next__label">Kickoff · SAST</span>
      </div>
      <div class="next__team">${crestHtml(match.awayTeam)}<span class="next__name">${match.awayTeam.name}</span></div>
    </div>
  `;
  animateNextMatch();
}

function resultHtml(match) {
  const [homeScore, awayScore] = match.state.score.split(" - ");
  return `
    <li class="rcard">
      <div class="rcard__head">
        <span class="rcard__date">${formatDate(match.date)}</span>
        <span class="chip chip--ft">Full time</span>
      </div>
      <div class="rcard__row">${crestHtml(match.homeTeam)}<span class="rcard__name">${match.homeTeam.name}</span><span class="rcard__score">${homeScore}</span></div>
      <div class="rcard__row">${crestHtml(match.awayTeam)}<span class="rcard__name">${match.awayTeam.name}</span><span class="rcard__score">${awayScore}</span></div>
    </li>
  `;
}

function showResults(results) {
  resultsBox.innerHTML = `<ul class="results-grid">${results.map(resultHtml).join("")}</ul>`;
}

function snapshotRowHtml(row) {
  return `
    <tr>
      <td>${row.position}</td>
      <th scope="row"><span class="team-cell">${crestHtml(row.team)}<span>${row.team.name}</span></span></th>
      <td>${row.gamesPlayed}</td>
      <td><strong>${row.points}</strong></td>
    </tr>
  `;
}

function showSnapshot(rows) {
  snapshotBox.innerHTML = `
    <div class="table-wrap">
      <table class="table table--snap" aria-label="Top South African teams in the URC standings">
        <thead>
          <tr>
            <th scope="col">Pos</th>
            <th scope="col">Team</th>
            <th scope="col">P</th>
            <th scope="col">Pts</th>
          </tr>
        </thead>
        <tbody>${rows.map(snapshotRowHtml).join("")}</tbody>
      </table>
    </div>
    <p class="table-key">Pos is league position, P is matches played and Pts is league points. <a href="standings.html">See the full standings</a>.</p>
  `;
  animateStandingsRows();
}

const QUICK_ORDER = ["lions", "sharks", "bulls", "stormers"];

function showQuickLinks() {
  linksBox.innerHTML = QUICK_ORDER.map(slug => {
    const team = TEAMS[slug];
    return `
      <li>
        <a class="qcard qcard--${slug}" href="team.html?team=${slug}">
          <span class="qcard__banner" aria-hidden="true"></span>
          ${crestHtml(team)}
          <span class="qcard__name">${team.name}</span>
          <span class="qcard__cta">Visit team page</span>
        </a>
      </li>
    `;
  }).join("");
}

async function loadHome() {
  showLoading(nextMatchBox, "Loading next match…");
  showLoading(resultsBox, "Loading recent results…");
  try {
    const data = await cachedFetch("/matches?leagueId=65460&season=2026", FIXTURES_TTL);
    const next = findNextMatch(data.data);
    if (next) {
      showNextMatch(next);
    } else {
      showEmpty(nextMatchBox, "No upcoming matches to show yet.");
    }
    const results = findRecentResults(data.data);
    if (results.length > 0) {
      showResults(results);
    } else {
      showEmpty(resultsBox, "No results to show yet.");
    }
  } catch (err) {
    showError(nextMatchBox, err, loadHome);
    showError(resultsBox, err);
  }
}

async function loadStandings() {
  showLoading(snapshotBox, "Loading standings…");
  try {
    const data = await cachedFetch("/standings?leagueId=65460&season=2026", STANDINGS_TTL);
    const rows = data.groups[0].standings.filter(row => SA_TEAMS[row.team.id]).slice(0, 3);
    if (rows.length > 0) {
      showSnapshot(rows);
    } else {
      showEmpty(snapshotBox, "The standings aren't available yet.");
    }
  } catch (err) {
    showError(snapshotBox, err, loadStandings);
  }
}

showQuickLinks();
loadHome();
loadStandings();