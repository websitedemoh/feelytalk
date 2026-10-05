const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const feelyPlayStoreUrl = "https://play.google.com/store/apps/details?id=net.itthinkzone.feely&hl=en_IN";

let feelyDownloadLeadTracked = false;
document.querySelectorAll(`a[href="${feelyPlayStoreUrl}"]`).forEach((link) => {
  link.addEventListener("click", () => {
    if (feelyDownloadLeadTracked || typeof window.fbq !== "function") return;
    feelyDownloadLeadTracked = true;

    window.fbq("track", "Lead", {
      content_name: "FeelyTalk App Download",
      content_category: "App Download",
      source: "Direct Play Store Link"
    });
  });
});

// =============================
// Reveal on viewport entry (faster than scroll loop)
// =============================
const reveals = document.querySelectorAll(".reveal");

if (reveals.length) {
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    reveals.forEach((el) => revealObserver.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("active"));
  }
}

// =============================
// Sticky navbar with RAF-throttled scroll
// =============================
const navbar = document.querySelector(".navbar");
if (navbar) {
  let ticking = false;

  const updateNavbar = () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    },
    { passive: true }
  );
  updateNavbar();
}

// =============================
// Cursor spotlight (disabled for reduced motion)
// =============================
const spot = document.querySelector(".spotlight");
if (spot && !prefersReducedMotion) {
  window.addEventListener(
    "mousemove",
    (e) => {
      spot.style.left = `${e.clientX}px`;
      spot.style.top = `${e.clientY}px`;
    },
    { passive: true }
  );
}

// =============================
// Fade-up elements
// =============================
const fadeUpEls = document.querySelectorAll(".fade-up");
if (fadeUpEls.length) {
  fadeUpEls.forEach((el) => {
    if (prefersReducedMotion) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  });

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const fadeObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    fadeUpEls.forEach((el) => fadeObserver.observe(el));
  } else {
    fadeUpEls.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }
}
