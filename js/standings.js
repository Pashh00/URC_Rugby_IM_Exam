import { cachedFetch, STANDINGS_TTL } from "./api.js";
import { SA_TEAMS, crestHtml, showLoading, showEmpty, showError } from "./utilities.js";
import { animateStandingsRows } from "./motion.js";

const tableBox = document.querySelector("#standings-table");

function rowHtml(row) {
  const diff = row.scoredPoints - row.receivedPoints;
  const diffText = diff > 0 ? "+" + diff : String(diff);
  return `
    <tr>
      <td>${row.position}</td>
      <th scope="row"><span class="team-cell">${crestHtml(row.team)}<span>${row.team.name}</span></span></th>
      <td>${row.gamesPlayed}</td>
      <td>${row.wins}</td>
      <td>${row.draws}</td>
      <td>${row.loses}</td>
      <td>${row.scoredPoints}</td>
      <td>${row.receivedPoints}</td>
      <td>${diffText}</td>
      <td><strong>${row.points}</strong></td>
    </tr>
  `;
}

function showTable(rows) {
  tableBox.innerHTML = `
    <div class="table-wrap" tabindex="0" role="region" aria-label="Standings table, scrolls sideways on small screens">
      <table class="table table--wide">
        <thead>
          <tr>
            <th scope="col">Pos</th>
            <th scope="col">Team</th>
            <th scope="col">P</th>
            <th scope="col">W</th>
            <th scope="col">D</th>
            <th scope="col">L</th>
            <th scope="col">PF</th>
            <th scope="col">PA</th>
            <th scope="col">PD</th>
            <th scope="col">Pts</th>
          </tr>
        </thead>
        <tbody>${rows.map(rowHtml).join("")}</tbody>
      </table>
    </div>
  `;
}

async function loadStandings() {
  showLoading(tableBox, "Loading standings…");
  try {
    const data = await cachedFetch("/standings?leagueId=65460&season=2026", STANDINGS_TTL);
    const rows = data.groups[0].standings.filter(row => SA_TEAMS[row.team.id]);
    if (rows.length > 0) {
      showTable(rows);
    } else {
      showEmpty(tableBox, "The standings aren't available yet.");
    }
  } catch (err) {
    showError(tableBox, err, loadStandings);
  }
}
     
      loadStandings();
       showTable(rows);
      animateStandingsRows(); 