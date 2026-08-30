"use strict";

/**
 * Each booking <form> posts to its own `action` URL — the Formspree
 * endpoint at https://formspree.io/f/xbgrwqyy (set on the <form> in
 * index.html and book.html). Server-side Formspree errors are surfaced
 * to the visitor when a request cannot be accepted.
 *
 * Lenis (loaded via CDN in each HTML file, before this script) gives
 * the whole site smoother, weighted scrolling instead of the browser
 * default. initSmoothScroll() no-ops if the CDN script fails to load
 * or hasn't loaded yet — native scrolling just applies as the fallback.
 *
 * This file is shared verbatim by every page, English and Persian
 * (fa/*.html) alike — never fork a language-specific copy. All
 * user-facing validator/error text is sourced from data attributes on
 * the markup (data-required-message, data-invalid-message, and the
 * topics group's own data-required-message on [data-topics-group],
 * plus data-network-error-message on [data-booking-form]), each with
 * an English literal fallback so the fa/ pages just need the
 * attribute added with Persian text — no JS changes.
 */

function initScrollReveal() {
  const targets = document.querySelectorAll("main > section");
  if (!targets.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  targets.forEach((el) => el.classList.add("reveal"));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  targets.forEach((el) => observer.observe(el));
}

function initSmoothScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (typeof Lenis === "undefined") return;

  const lenis = new Lenis({ duration: 1.1 });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Same-page anchor links (e.g. the fa/ landing page's in-page nav) route
  // through Lenis's own scrollTo() instead of the native instant jump, so
  // the two don't fight. No-ops on pages with no `#`-hash links.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href").slice(1);
      const target = id ? document.getElementById(id) : document.body;
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target);
    });
  });
}

function initHeroTextCycle() {
  const el = document.querySelector("[data-cycle-words]");
  if (!el) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let words;
  try {
    words = JSON.parse(el.dataset.cycleWords);
  } catch (e) {
    return;
  }
  if (!Array.isArray(words) || words.length < 2) return;

  let index = 0;
  const outDuration = 750;

  setInterval(() => {
    el.classList.add("cycle-out");
    setTimeout(() => {
      index = (index + 1) % words.length;
      el.style.transition = "none";
      el.textContent = words[index];
      el.classList.remove("cycle-out");
      el.classList.add("cycle-in");
      void el.offsetWidth;
      el.style.transition = "";
      requestAnimationFrame(() => el.classList.remove("cycle-in"));
    }, outDuration);
  }, 3200);
}

function initSiteMenu() {
  const trigger = document.querySelector(".menu-trigger");
  const menu = document.querySelector(".site-menu");
  const closeBtn = document.querySelector(".site-menu-close");
  if (!trigger || !menu) return;

  function open() {
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    trigger.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("menu-open");
    document.body.classList.add("menu-open");
  }

  function close() {
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    trigger.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("menu-open");
    document.body.classList.remove("menu-open");
  }

  trigger.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  menu.querySelectorAll(".site-menu-links a").forEach((a) => {
    a.addEventListener("click", close);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) close();
  });
}

function showValidatorError(v) {
  if (v.wrapper) v.wrapper.classList.add("has-error");
  if (v.errorEl) {
    v.errorEl.textContent = v.message();
    v.errorEl.classList.add("is-visible");
  }
}

function clearValidatorError(v) {
  if (v.wrapper) v.wrapper.classList.remove("has-error");
  if (v.errorEl) v.errorEl.classList.remove("is-visible");
}

function buildValidators(form, topicsHidden) {
  const validators = [];

  form.querySelectorAll("[required]").forEach((field) => {
    validators.push({
      focusEl: field,
      wrapper: field.closest(".field"),
      errorEl: field.closest(".field") && field.closest(".field").querySelector(".field-error"),
      isValid: () => field.validity.valid,
      message: () => {
        if (field.validity.typeMismatch) {
          return field.dataset.invalidMessage || "Please enter a valid value.";
        }
        return field.dataset.requiredMessage || "This field is required.";
      },
    });
  });

  const topicsGroup = form.querySelector("[data-topics-group]");
  if (topicsGroup && topicsGroup.dataset.requiredMessage) {
    const wrapper = topicsGroup.closest(".field");
    validators.push({
      focusEl: topicsGroup.querySelector(".topic-chip"),
      wrapper,
      errorEl: wrapper && wrapper.querySelector(".field-error"),
      isValid: () => !!(topicsHidden && topicsHidden.value.trim()),
      message: () => topicsGroup.dataset.requiredMessage || "Please select at least one topic.",
    });
  }

  // Keep validators in document order so "first invalid" matches reading order.
  validators.sort((a, b) => {
    const posA = a.focusEl.compareDocumentPosition(b.focusEl);
    return posA & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });

  return validators;
}

function initBookingForms() {
  document.querySelectorAll("[data-booking-form]").forEach((wrapper) => {
    const form = wrapper.querySelector("form");
    const success = wrapper.querySelector(".booking-success");
    const errorBox = wrapper.querySelector(".form-error");
    const topicsHidden = form.querySelector('input[name="topics"]');
    const chips = wrapper.querySelectorAll(".topic-chip");
    const submitBtn = form.querySelector('button[type="submit"]');
    const validators = buildValidators(form, topicsHidden);
    const topicsValidator = validators.find((v) => v.focusEl && v.focusEl.classList && v.focusEl.classList.contains("topic-chip"));

    const selected = new Set();

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const label = chip.dataset.topic;
        if (selected.has(label)) {
          selected.delete(label);
          chip.classList.remove("is-selected");
        } else {
          selected.add(label);
          chip.classList.add("is-selected");
        }
        if (topicsHidden) topicsHidden.value = Array.from(selected).join(", ");
        if (topicsValidator && topicsValidator.isValid()) clearValidatorError(topicsValidator);
      });
    });

    validators.forEach((v) => {
      if (v === topicsValidator) return;
      v.focusEl.addEventListener("blur", () => {
        if (v.isValid()) clearValidatorError(v);
        else showValidatorError(v);
      });
      v.focusEl.addEventListener("input", () => {
        if (v.wrapper && v.wrapper.classList.contains("has-error") && v.isValid()) clearValidatorError(v);
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      errorBox.classList.remove("is-visible");
      validators.forEach(clearValidatorError);

      const firstInvalid = validators.find((v) => !v.isValid());
      if (firstInvalid) {
        showValidatorError(firstInvalid);
        firstInvalid.focusEl.focus();
        firstInvalid.wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      submitBtn.disabled = true;

      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      })
        .then(async (res) => {
          if (res.ok) {
            form.hidden = true;
            success.classList.add("is-visible");
          } else {
            const payload = await res.json().catch(() => null);
            throw new Error(payload?.errors?.at(0)?.message || "Request failed");
          }
        })
        .catch((error) => {
          errorBox.textContent = error instanceof Error && error.message !== "Request failed"
            ? error.message
            : wrapper.dataset.networkErrorMessage ||
            "Something went wrong sending this — please email alibabaeinote@gmail.com directly instead.";
          errorBox.classList.add("is-visible");
        })
        .finally(() => {
          submitBtn.disabled = false;
        });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initSiteMenu();
  initBookingForms();
  initScrollReveal();
  initSmoothScroll();
  initHeroTextCycle();
});
