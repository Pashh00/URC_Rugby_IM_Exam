export function animateNextMatch() {
  if (!window.gsap) return;

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const tl = gsap.timeline();

    tl.from(".next__team", {
      x: (i) => (i === 0 ? -60 : 60),
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.15
    })
    .from(".next__kickoff", {
      scale: 0.8,
      duration: 0.5,
      ease: "back.out(1.7)"
    }, 0.3);
  });
}

export function animateStandingsRows() {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.from(".table tbody tr", {
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: "power1.out",
      stagger: 0.08,
      scrollTrigger: { trigger: ".table", start: "top 85%", once: true }
    });
  });
}

let liveTween = null;

export function animateLivePulse() {
  if (liveTween) {
    liveTween.kill();
    liveTween = null;
  }
  if (!window.gsap) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const chips = document.querySelectorAll(".chip--live");
  if (chips.length === 0) return;
  liveTween = gsap.to(chips, { scale: 1.1, duration: 1, ease: "sine.inOut", repeat: -1, yoyo: true });
}
export function animateTabIndicator() {
  const nav = document.querySelector(".nav-bottom");
  if (!nav) return;
  const links = Array.from(nav.querySelectorAll("a"));
  const current = links.findIndex(a => a.getAttribute("aria-current") === "page");
  if (current === -1) return;

  let indicator = nav.querySelector(".nav-bottom__indicator");
  if (!indicator) {
    indicator = document.createElement("span");
    indicator.className = "nav-bottom__indicator";
    indicator.setAttribute("aria-hidden", "true");
    nav.appendChild(indicator);
  }
  indicator.style.width = (100 / links.length) + "%";

  let previous = current;
  try {
    const saved = sessionStorage.getItem("urc:tab");
    if (saved !== null) previous = Number(saved);
    sessionStorage.setItem("urc:tab", String(current));
  } catch (err) {
    
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap || reduce || previous === current) {
    indicator.style.transform = `translateX(${current * 100}%)`;
    return;
  }
  gsap.fromTo(indicator, { xPercent: previous * 100 }, { xPercent: current * 100, duration: 0.3, ease: "power2.out" });
}

animateTabIndicator();
