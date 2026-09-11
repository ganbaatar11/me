/* ---------- Scroll reveal ---------- */

const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => revealObserver.observe(el));

/* ---------- Skills filter chips (animated) ---------- */

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const chips = document.querySelectorAll(".chip");
const skillPills = Array.from(document.querySelectorAll(".pill"));
const FADE_MS = 180;

function applyFilterInstantly(filter) {
  skillPills.forEach((pill) => {
    const show = filter === "all" || pill.getAttribute("data-category") === filter;
    pill.classList.toggle("is-hidden", !show);
  });
}

function applyFilterAnimated(filter) {
  const willShow = (pill) =>
    filter === "all" || pill.getAttribute("data-category") === filter;

  const toHide = skillPills.filter(
    (p) => !willShow(p) && !p.classList.contains("is-hidden")
  );
  const toReveal = skillPills.filter(
    (p) => willShow(p) && p.classList.contains("is-hidden")
  );
  const staying = skillPills.filter(
    (p) => willShow(p) && !p.classList.contains("is-hidden")
  );

  if (!toHide.length && !toReveal.length) return;

  // First: capture current positions of everything that will remain visible.
  const firstRects = new Map();
  staying.concat(toReveal).forEach((p) => firstRects.set(p, p.getBoundingClientRect()));

  toHide.forEach((p) => p.classList.add("pill-fade-out"));

  window.setTimeout(() => {
    toHide.forEach((p) => {
      p.classList.remove("pill-fade-out");
      p.classList.add("is-hidden");
    });
    toReveal.forEach((p) => p.classList.remove("is-hidden"));

    // Last: measure the new layout and invert the delta (FLIP).
    staying.concat(toReveal).forEach((p) => {
      const first = firstRects.get(p);
      const last = p.getBoundingClientRect();
      const dx = first.left - last.left;
      const dy = first.top - last.top;
      const isRevealing = toReveal.includes(p);

      p.style.transition = "none";
      p.style.transform = isRevealing
        ? `translate(${dx}px, ${dy}px) scale(0.5)`
        : `translate(${dx}px, ${dy}px)`;
      p.style.opacity = isRevealing ? "0" : "1";
    });

    requestAnimationFrame(() => {
      staying.concat(toReveal).forEach((p) => {
        p.style.transition = "";
        p.style.transform = "";
        p.style.opacity = "";
      });
    });
  }, FADE_MS);
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    if (chip.classList.contains("is-active")) return;

    chips.forEach((c) => {
      c.classList.remove("is-active");
      c.setAttribute("aria-pressed", "false");
    });
    chip.classList.add("is-active");
    chip.setAttribute("aria-pressed", "true");

    const filter = chip.getAttribute("data-filter");
    if (prefersReducedMotion) {
      applyFilterInstantly(filter);
    } else {
      applyFilterAnimated(filter);
    }
  });
});
