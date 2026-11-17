import { cachedFetch, FIXTURES_TTL } from "./api.js";
import { formatDate, formatClock, crestHtml, isSaMatch, statusOf, showLoading, showEmpty, showError } from "./utilities.js";
import { animateLivePulse } from "./motion.js";

const listBox = document.querySelector("#match-list");
const teamSelect = document.querySelector("#team-filter");
const viewButtons = document.querySelectorAll(".segmented button");

let allMatches = [];
let view = "upcoming";

function rowHtml(match) {
  const status = statusOf(match);
  let middle;
  let statusText;
  if (status === "upcoming") {
    middle = formatClock(match.date);
    statusText = "Not started";
  } else {
    middle = match.state.score ? match.state.score.replace(" - ", "-") : "–";
    statusText = status === "live" ? `<span class="chip chip--live">LIVE</span>` : "Full time";
  }
  return `
    <tr>
      <td>${String(match.week).padStart(2, "0")}</td>
      <td>${formatDate(match.date)}</td>
      <td class="fx__home"><span class="fx__team">${match.homeTeam.name}${crestHtml(match.homeTeam)}</span></td>
      <td><span class="score-box">${middle}</span></td>
      <td class="fx__away"><span class="fx__team">${crestHtml(match.awayTeam)}${match.awayTeam.name}</span></td>
      <td>${statusText}</td>
    </tr>
  `;
}

function render() {
  const wanted = view === "upcoming" ? ["upcoming", "live"] : ["finished"];
  let matches = allMatches.filter(m => wanted.includes(statusOf(m)));

  const team = teamSelect.value;
  if (team !== "all") {
    matches = matches.filter(m => String(m.homeTeam.id) === team || String(m.awayTeam.id) === team);
  }

  matches.sort((a, b) => view === "upcoming"
    ? new Date(a.date) - new Date(b.date)
    : new Date(b.date) - new Date(a.date));

  if (matches.length === 0) {
    const who = team === "all" ? "South African teams" : teamSelect.selectedOptions[0].text;
    const what = view === "upcoming" ? "upcoming matches" : "results";
    showEmpty(listBox, `No ${what} to show for ${who}.`);
    return;
  }

  listBox.innerHTML = `
    <div class="table-wrap" tabindex="0" role="region" aria-label="Matches table, scrolls sideways on small screens">
      <table class="table fx-table">
        <thead>
          <tr>
            <th scope="col">Wk</th>
            <th scope="col">Date</th>
            <th scope="col">Home</th>
            <th scope="col">Score / Kickoff (SAST)</th>
            <th scope="col">Away</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>${matches.map(rowHtml).join("")}</tbody>
      </table>
    </div>
  `;
    animateLivePulse();
}

async function loadFixtures() {
  showLoading(listBox, "Loading matches…");
  try {
    const data = await cachedFetch("/matches?leagueId=65460&season=2026", FIXTURES_TTL);
    allMatches = data.data.filter(isSaMatch);
    render();
  } catch (err) {
    showError(listBox, err, loadFixtures);
  }
}

viewButtons.forEach(button => {
  button.addEventListener("click", () => {
    view = button.dataset.view;
    viewButtons.forEach(b => b.setAttribute("aria-pressed", String(b === button)));
    render();
  });
});

teamSelect.addEventListener("change", render);

loadFixtures();