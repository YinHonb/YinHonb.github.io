(() => {
  "use strict";
  const section = document.getElementById("-Publications");
  const list = section && section.querySelector(":scope > ul");
  const controls = section && section.querySelector(".publication-tools");
  if (!list || !controls) return;
  const papers = Array.from(list.children).filter(item => item.tagName === "LI");
  const input = controls.querySelector('input[type="search"]');
  const filters = controls.querySelector(".publication-filters");
  const counter = section.querySelector(".publication-count");
  const emptyState = section.querySelector(".publication-empty");
  let activeYear = "all";

  for (const paper of papers) {
    const text = paper.textContent;
    const matches = [...text.matchAll(/,\s*((?:19|20)\d{2})\./g)];
    paper.dataset.year = matches.length ? matches[matches.length - 1][1] : "";
    paper.dataset.search = text.toLocaleLowerCase();
  }

  const years = [...new Set(papers.map(paper => paper.dataset.year).filter(Boolean))]
    .sort((a, b) => Number(b) - Number(a));
  for (const year of ["all", ...years]) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "year-filter";
    button.dataset.year = year;
    button.textContent = year === "all" ? "All years" : year;
    button.setAttribute("aria-pressed", String(year === "all"));
    button.addEventListener("click", () => {
      activeYear = year;
      for (const sibling of filters.children) {
        sibling.setAttribute("aria-pressed", String(sibling === button));
      }
      applyFilters();
    });
    filters.append(button);
  }

  function applyFilters() {
    const terms = input.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const paper of papers) {
      const matchesYear = activeYear === "all" || paper.dataset.year === activeYear;
      const matchesSearch = terms.every(term => paper.dataset.search.includes(term));
      paper.hidden = !(matchesYear && matchesSearch);
      if (!paper.hidden) visible += 1;
    }
    counter.textContent = visible === papers.length
      ? papers.length + " publications · " + years[years.length - 1] + "–" + years[0]
      : visible + " of " + papers.length + " publications";
    emptyState.hidden = visible > 0;
  }

  input.addEventListener("input", applyFilters);
  input.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      input.value = "";
      applyFilters();
    }
  });
  controls.hidden = false;
  counter.hidden = false;
  applyFilters();

  const navigation = [...document.querySelectorAll(".site-nav a")];
  const targets = navigation.map(link => ({
    link,
    section: document.getElementById(new URL(link.href).hash.slice(1))
  })).filter(target => target.section);
  function updateNavigation() {
    let active = targets[0];
    const threshold = Math.max(170, window.innerHeight * 0.4);
    for (const target of targets) {
      if (target.section.getBoundingClientRect().top <= threshold) active = target;
    }
    const requested = targets.find(target => "#" + target.section.id === window.location.hash);
    if (requested) {
      const top = requested.section.getBoundingClientRect().top;
      if (top >= 0 && top < window.innerHeight * 0.65) active = requested;
    }
    for (const target of targets) {
      if (target === active) target.link.setAttribute("aria-current", "location");
      else target.link.removeAttribute("aria-current");
    }
  }
  let scheduled = false;
  window.addEventListener("scroll", () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      updateNavigation();
      scheduled = false;
    });
  }, { passive: true });
  updateNavigation();
})();
