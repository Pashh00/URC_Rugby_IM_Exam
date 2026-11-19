export const SA_TEAMS = {
  250978: { name: "Bulls", slug: "bulls" },
  257786: { name: "Sharks", slug: "sharks" },
  253531: { name: "Lions", slug: "lions" },
  529255: { name: "Stormers", slug: "stormers" }
};

export function formatKickoff(isoDate){
    return new Intl.DateTimeFormat("en-ZA", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Africa/Johannesburg"

    }).format(new Date(isoDate)) + " SAST";
}

export function crestHtml(team){
    const sa= SA_TEAMS[team.id];
    if(sa){
        return `<img class="crest" src="assets/crests/${sa.slug}.png"alt="" width="64" height = "64">`;

    }
    const initials = team.name.split(" ").map(word => word[0]). join("").slice(0,3).toUpperCase();
    return `<span class="crest crest--initials" aria-hidden="true">${initials}</span>`;
}

export function formatDate(isoDate){
    return new Intl.DateTimeFormat("en-ZA", {
        day: "numeric",
        month: "short",
        timeZone: "Africa/Johannesburg"
}). format(new Date(isoDate));
}
export function formatBadge(isoDate) {
  const parts = new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Johannesburg"
  }).formatToParts(new Date(isoDate));
  const get = type => parts.find(p => p.type === type).value;
  return `${get("day")}.${get("month")} - ${get("hour")}:${get("minute")}`;
}

export function formatClock(isoDate) {
  return new Intl.DateTimeFormat("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Johannesburg"
  }).format(new Date(isoDate));
}

export function showLoading(box, text){
    box.innerHTML = `<p class= "state">${text}</p>`;
}

export function showEmpty(box, text){
    box.innerHTML = `<p class="state">${text}</p>`;
}

export function showError(box, err, onRetry){
    const message= err.kind ? err.message : "Something went wrong. Try again.";
    const canRetry = err.kind !== "quota" && err.kind !== "key";
    box.innerHTML = `<div class ="state state--error"><p>${message}</p></div>`;
    if(onRetry && canRetry){
        const button = document.createElement("button");
        button.type = "button";
        button.className = "retry-button";
        button.textContent = "Try again";
        button.addEventListener("click", onRetry);
        box.querySelector(".state").appendChild(button);
    }
}

export function formatDay(isoDate){
    return new Intl.DateTimeFormat("en-ZA", {
        weekday:"long",
        day: "numeric",
        month:"long",
        timeZone: "Africa/Johannesburg"
    }).format(new Date(isoDate));
}

export function formatTime(isoDate){
    return new Intl.DateTimeFormat("en-ZA", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone:"Africa/Johannesburg"
    }).format(new Date(isoDate)) + " SAST";
}

export function isSaMatch(match){
    return SA_TEAMS[match.homeTeam.id] || 
    SA_TEAMS[match.awayTeam.id];
}

export function statusOf(match){
    const text = (match.state.description || "").toLowerCase().trim();
    if (text === "finished") return "finished";
    if(text === "not started" || new Date(match.date) > new Date()) return "upcoming";
    return "live";
}
export function matchHtml(match) {
  const status = statusOf(match);
  let middle;
  let label;
  if (status === "upcoming") {
    middle = `<span class="match__time">${formatTime(match.date)}</span>`;
    label = `<span class="chip">Upcoming</span>`;
  } else {
    const score = match.state.score ? match.state.score.replace(" - ", " – ") : "–";
    middle = `<span class="match__score">${score}</span>`;
    label = status === "live"
      ? `<span class="chip chip--live">LIVE</span>`
      : `<span class="chip chip--ft">Full time</span>`;
  }
  return `
    <li class="match">
      <div class="match__team">${crestHtml(match.homeTeam)}<span>${match.homeTeam.name}</span></div>
      <div class="match__centre">${middle}${label}</div>
      <div class="match__team match__team--away"><span>${match.awayTeam.name}</span>${crestHtml(match.awayTeam)}</div>
    </li>
  `;
}

