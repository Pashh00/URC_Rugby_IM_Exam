
import { TEAMS } from "./teams-data.js";
import { crestHtml } from "./utilities.js";


const grid = document.querySelector("#team-grid");

grid.innerHTML = Object.entries(TEAMS).map(([slug, team]) => `
  <li>
    <a class="team-card" href="team.html?team=${slug}">
      ${crestHtml(team)}
      <h2 class="team-card__name">${team.name}</h2>
      <p class="team-card__meta">${team.city} · ${team.ground}</p>
      <p class="team-card__text">${team.blurb}</p>
      <span class="team-card__cta">View ${team.name} page</span>
    </a>
  </li>
`).join("");