const SIGNUP_URL = "https://mpago.la/2AVjcMM";

document.querySelectorAll(".signup-link").forEach((link) => {
  link.href = SIGNUP_URL;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
});

if (window.lucide) {
  window.lucide.createIcons({ strokeWidth: 1.7 });
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("in-view"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const hero = document.querySelector(".hero");
const mobileCta = document.querySelector(".mobile-cta");
const mobileCtaLink = mobileCta.querySelector("a");

if ("IntersectionObserver" in window) {
  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      const shouldShow = !entry.isIntersecting;
      mobileCta.classList.toggle("visible", shouldShow);
      mobileCta.setAttribute("aria-hidden", String(!shouldShow));
      mobileCtaLink.tabIndex = shouldShow ? 0 : -1;
    },
    { threshold: 0.08 }
  );
  heroObserver.observe(hero);
}
