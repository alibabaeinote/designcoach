import { useEffect, useRef, useState } from "react";
import { companies, consultingSelection, focusAreas, processSteps, productExperience, serviceTracks, speakingPanels, stats, teachingMentoring, teachingRows, writingArticles } from "./content/siteContent.js";
const logoUrl = "/assets/ali-babaei-logo-v2.png?rev=20260821";
const formspreeEndpoint = "https://formspree.io/f/xbgrwqyy";

function validateContactField(field, value) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return {
      name: "Please enter your full name.",
      email: "Please enter your work email.",
      organisation: "Please enter your organisation.",
      challenge: "Please tell me what this session should cover.",
    }[field];
  }
  if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) return "Please enter a valid work email.";
  return "";
}

function usePageMotion() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollTop = window.scrollY || 0;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const hero = document.querySelector(".hero");
      const heroProgress = hero ? Math.min(1, scrollTop / Math.max(1, hero.offsetHeight)) : 0;
      const pageProgress = Math.min(1, scrollTop / maxScroll);
      root.style.setProperty("--page-progress", pageProgress.toFixed(4));
      root.style.setProperty("--hero-opacity", Math.max(0, 1 - heroProgress / 0.8).toFixed(4));
      root.style.setProperty("--hero-shift", `${(heroProgress * 40).toFixed(2)}%`);
      root.style.setProperty("--hero-blur", `${(heroProgress * 12).toFixed(2)}px`);
      setScrolled(scrollTop > 20);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return scrolled;
}

function CustomCursor() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return undefined;

    const pointer = { x: -100, y: -100 };
    const current = { x: -100, y: -100 };
    let cursorType = "default";
    let cursorLabel = "";
    let frameId;

    const sizes = { default: 10, text: 6, view: 84, link: 40 };
    const render = () => {
      current.x += (pointer.x - current.x) * 0.22;
      current.y += (pointer.y - current.y) * 0.22;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
        cursorRef.current.classList.add("is-visible");
      }
      if (dotRef.current) {
        const size = sizes[cursorType] || sizes.default;
        dotRef.current.style.width = `${size}px`;
        dotRef.current.style.height = `${size}px`;
        dotRef.current.textContent = cursorType === "view" ? cursorLabel : "";
      }
      frameId = requestAnimationFrame(render);
    };
    const move = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      const target = event.target instanceof Element ? event.target.closest("[data-cursor]") : null;
      cursorType = target?.dataset.cursor || "default";
      cursorLabel = target?.dataset.cursorLabel || "";
    };

    window.addEventListener("mousemove", move);
    frameId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor" aria-hidden="true"><div ref={dotRef} className="custom-cursor-dot" /></div>;
}

function Icon({ children, size = 18, className = "" }) {
  return <svg className={`icon ${className}`.trim()} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}

function MailIcon() {
  return <Icon size={32} className="contact-icon"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></Icon>;
}

function CloseIcon() {
  return <Icon size={18}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Icon>;
}

function ArrowUpRightIcon() {
  return <Icon size={28} className="email-arrow"><path d="M7 7h10v10" /><path d="M7 17 17 7" /></Icon>;
}

function ArrowRightIcon({ size = 18 }) {
  return <Icon size={size}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></Icon>;
}

function SparklesIcon() {
  return <Icon size={22} className="concept-icon"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" /><path d="M5 3v4" /><path d="M3 5h4" /><path d="M19 17v4" /><path d="M17 19h4" /></Icon>;
}

function CompassIcon() {
  return <Icon size={22} className="concept-icon"><circle cx="12" cy="12" r="10" /><path d="m16.24 7.76-1.82 5.46-5.46 1.82 1.82-5.46z" /></Icon>;
}

function SiteFooter() {
  return <footer className="unified-footer"><div className="unified-footer-brand"><strong>Ali Babaei</strong><span>Design coaching · UX consulting · Tehran &amp; remote</span></div><div className="unified-footer-meta"><a href="mailto:alibabaeinote@gmail.com">alibabaeinote@gmail.com</a><nav><a href="https://www.linkedin.com/in/alibabaei" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://dribbble.com/alibabaei" target="_blank" rel="noreferrer">Dribbble</a><a href="https://www.behance.net/alibabaei" target="_blank" rel="noreferrer">Behance</a><a href="https://alibabaei.medium.com" target="_blank" rel="noreferrer">Medium</a></nav><small>© 2026 · All rights reserved</small></div></footer>;
}

function Header({ onOpen, onClose, scrolled, homeHref, services }) {
  return <header className={`site-header ${services ? "services-site-header" : ""} ${scrolled ? "is-scrolled" : ""}`}>
    <a className="brand" href={homeHref} onClick={onClose}><img className="brand-logo" src={logoUrl} alt="Ali Babaei" /><span className="brand-name">Ali Babaei</span><span className="brand-dot">•</span><span className="brand-role">Design Coach / Consultant</span></a>
    <div className="header-actions"><button className="menu-button" type="button" onClick={onOpen}><span className="menu-lines"><span /><span /></span>Menu</button><a className="header-language-switch" href="fa/" lang="fa" hreflang="fa" aria-label="Switch to Persian">FA</a></div>
    <div className={`scroll-progress ${scrolled ? "is-visible" : ""}`} aria-hidden="true" />
  </header>;
}

function MenuOverlay({ onClose, closing, onExited }) {
  const links = [["Home", "index.html"], ["Services", "services.html"], ["About", "about.html"], ["Book a session", "book.html"], ["فا · Persian", "fa/"]];
  return <div className={`menu-overlay ${closing ? "menu-overlay-closing" : ""}`} role="dialog" aria-modal="true" aria-label="Index" onAnimationEnd={(event) => { if (closing && event.animationName === "menu-overlay-out") onExited(); }}>
    <div className="menu-overlay-top"><span>Index</span><button type="button" onClick={onClose}>Close <CloseIcon /></button></div>
    <nav className="overlay-nav">{links.map(([label, href], index) => <a key={label} href={href} onClick={onClose} style={{ "--menu-delay": `${0.2 + index * 0.05}s` }}>{label}</a>)}</nav>
    <div className="overlay-footer"><span>Tehran · Remote worldwide</span><span>2005 — 2026</span><a href="mailto:alibabaeinote@gmail.com">alibabaeinote@gmail.com</a></div>
  </div>;
}

function Hero() {
  return <section className="hero grain" id="top"><div className="hero-scroll-layer" aria-hidden="true" /><div className="hero-center"><span className="eyebrow">Tehran · Remote worldwide</span><h1><span>A</span><span>L</span><span>I</span><span className="hero-gap" aria-hidden="true" /><span>B</span><span>A</span><span>B</span><span>A</span><span>E</span><span>I</span></h1><p>I coach in-house design teams and advise product organisations on usability, research practice and design process. 20+ years designing digital products; eight years building the designers who do.</p><div className="hero-actions"><a className="button-primary" href="book.html">Request a consultation</a><a className="text-link" href="#engagements">See engagements</a></div></div><span className="scroll-cue">Scroll ↓</span></section>;
}

function Stats() {
  return <section className="stats-section"><div className="stats-grid">{stats.map(({ value, label }, index) => <div className="stat" data-reveal key={label} style={{ "--reveal-delay": `${index * 0.1}s` }}><span className="stat-index">0{index + 1}</span><strong>{value}</strong><span>{label}</span><i className="stat-accent-line" aria-hidden="true" /></div>)}</div></section>;
}

function Marquee() {
  const row = [...companies, ...companies];
  return <section className="marquee" aria-label="Selected clients"><div className="marquee-track">{row.map((company, index) => <span key={`${company}-${index}`}><b>{company}</b><SparklesIcon /></span>)}</div></section>;
}

function Engagements() {
  return <section className="content-section engagements" id="engagements"><div className="section-heading split-heading"><div><span className="eyebrow">01 / Engagements</span><h2>Two ways I work with you</h2></div><p>Consulting solves a defined problem quickly. Coaching builds your team's own capability over time. Most engagements blend both.</p></div><div className="engagement-cards"><article className="engagement-card card-light" data-reveal><span className="card-kicker">A · Product outcomes <b>•</b></span><h3>Moving business metrics through the user journey</h3><div className="mini-list"><div><span>01</span><p><strong>Conversion rate improvement</strong><small>Funnel and checkout audits grounded in real user behaviour.</small></p></div><div><span>02</span><p><strong>Retention improvement</strong><small>Finding where the experience quietly loses people, and fixing it.</small></p></div></div><span className="card-footer">Usability audits · heuristic evaluation · journey mapping · research practice</span></article><article className="engagement-card card-dark" data-reveal style={{ "--reveal-delay": "0.1s" }}><span className="card-kicker">B · Design team coaching <b>•</b></span><h3>Making your design team stronger from the inside</h3><p>A recurring practice, worked on with your team in place — not in a workshop vacuum.</p><a className="underlined-link" href="services.html">See all four areas <ArrowRightIcon /></a></article></div></section>;
}

function Teaching() {
  return <section className="content-section teaching" id="teaching"><div className="section-heading"><span className="eyebrow">02 / Track record</span><h2>Teaching &amp; mentoring</h2></div><div className="teaching-list">{teachingRows.map(({ date, title, role, detail }, index) => <article className="teaching-row" data-cursor="text" data-reveal key={title} style={{ "--reveal-delay": `${index * 0.1}s` }}><span className="date">{date}</span><div><h3>{title}</h3><span className="role">{role}</span></div><p>{detail}</p></article>)}</div></section>;
}

function Process() {
  return <section className="content-section process" id="process"><div className="section-heading"><span className="eyebrow">03 / Process</span><h2>How an engagement starts</h2></div><div className="process-grid">{processSteps.map(({ title, description }, index) => <article className="process-card" data-cursor="text" data-reveal key={title} style={{ "--reveal-delay": `${index * 0.08}s` }}><div className="process-top"><strong>0{index + 1}</strong><span>Step</span></div><h3>{title}</h3><p>{description}</p></article>)}</div><div className="section-rule-label"><span />Book a design consultation · First session free</div></section>;
}

function Contact() {
  const [selectedArea, setSelectedArea] = useState("");
  const [values, setValues] = useState({ name: "", email: "", organisation: "", challenge: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => current[field] ? { ...current, [field]: validateContactField(field, value) } : current);
  };
  const validateField = (field) => setErrors((current) => ({ ...current, [field]: validateContactField(field, values[field]) }));
  const submitContact = async (event) => {
    event.preventDefault();
    if (isSubmitting || submitted) return;
    const nextErrors = Object.fromEntries(Object.entries(values).map(([field, value]) => [field, validateContactField(field, value)]));
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors).find((field) => nextErrors[field]);
    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    const form = event.currentTarget;
    try {
      const response = await fetch(formspreeEndpoint, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.errors?.at(0)?.message || "Formspree could not accept this request. Please try again or email me directly.");
      }
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong sending this — please email alibabaeinote@gmail.com directly instead.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <section className="contact" id="contact"><div className="contact-glow" /><div className="contact-inner"><div className="contact-header" data-reveal><span className="eyebrow">04 / Direct access</span><h2>Start with a free 45-minute planning call</h2><p>Tell me the one specific thing you want covered — a funnel, a review, a team habit — and where a preferred window sits in your week. I reply within two working days to confirm a time and what to expect.</p></div><div className="contact-grid"><div className="contact-copy" data-reveal><div className="contact-points"><div><span>01</span>First session is free — a scoped, no-obligation planning call.</div><div><span>02</span>No slide deck — notes you can circulate the same day.</div><div><span>03</span>Remote, or in person in Tehran.</div></div><a className="email-link" href="mailto:alibabaeinote@gmail.com"><MailIcon /> alibabaeinote@gmail.com<ArrowUpRightIcon /></a></div><div className="contact-form-slot" data-reveal>{submitted ? <div className="contact-form-success" role="status" aria-live="polite"><span className="eyebrow">Request received</span><h3>Thank you — I’ll be in touch</h3><p>Your details are safely with me. I’ll reply at the address you provided within two working days.</p></div> : <form className="contact-form" action={formspreeEndpoint} method="POST" noValidate onSubmit={submitContact}><input type="hidden" name="_subject" value="New design consultation request" /><div className="contact-field"><label htmlFor="contact-name">Full name</label><input id="contact-name" name="name" type="text" value={values.name} onChange={(event) => updateField("name", event.target.value)} onBlur={() => validateField("name")} aria-invalid={Boolean(errors.name)} aria-describedby="contact-name-error" disabled={isSubmitting} /><span className="contact-field-error" id="contact-name-error" aria-live="polite">{errors.name}</span></div><div className="contact-field"><label htmlFor="contact-email">Work email</label><input id="contact-email" name="email" type="email" value={values.email} onChange={(event) => updateField("email", event.target.value)} onBlur={() => validateField("email")} aria-invalid={Boolean(errors.email)} aria-describedby="contact-email-error" disabled={isSubmitting} /><span className="contact-field-error" id="contact-email-error" aria-live="polite">{errors.email}</span></div><div className="contact-field"><label htmlFor="contact-organisation">Organisation</label><input id="contact-organisation" name="organisation" type="text" value={values.organisation} onChange={(event) => updateField("organisation", event.target.value)} onBlur={() => validateField("organisation")} aria-invalid={Boolean(errors.organisation)} aria-describedby="contact-organisation-error" disabled={isSubmitting} /><span className="contact-field-error" id="contact-organisation-error" aria-live="polite">{errors.organisation}</span></div><fieldset disabled={isSubmitting}><legend><CompassIcon /> <span>What do you need help with?</span></legend><div className="area-options">{focusAreas.map((area) => <button className={selectedArea === area ? "selected" : ""} type="button" key={area} onClick={() => setSelectedArea(area)}>{area}</button>)}</div><input type="hidden" name="topics" value={selectedArea} /></fieldset><div className="contact-field"><label htmlFor="contact-challenge">What specifically should this session cover?</label><textarea id="contact-challenge" name="challenge" rows="3" value={values.challenge} onChange={(event) => updateField("challenge", event.target.value)} onBlur={() => validateField("challenge")} aria-invalid={Boolean(errors.challenge)} aria-describedby="contact-challenge-error" disabled={isSubmitting} /><span className="contact-field-error" id="contact-challenge-error" aria-live="polite">{errors.challenge}</span></div>{submitError && <p className="contact-form-error" role="alert">{submitError}</p>}<button className="button-primary form-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending request…" : "Send request"}</button><span className="reply-note">Reply within 2 working days</span></form>}</div></div><SiteFooter /></div></section>;
}

function ServicesPage() {
  return <main className="services-page" id="top"><section className="services-hero" data-reveal><h1>Engagements</h1><p>Every engagement starts with a diagnostic: where the product loses users, or where the design team loses momentum. Scope follows from that — not from a package list. Consulting solves a defined problem quickly; coaching builds your team's own capability over time — most engagements blend both.</p></section><section className="services-areas" data-reveal><div className="services-section-head"><h2>Four areas of work</h2><span>Scope drawn from these</span></div><div className="services-grid">{serviceTracks.map(({ number, title, tag, items }, index) => <article className="service-card" data-cursor="text" data-reveal key={title} style={{ "--reveal-delay": `${index * 0.08}s` }}><span className="service-number">{number}</span><h3>{title}</h3><span className="service-tag">{tag}</span><ul>{items.map((item) => <li key={item}>· {item}</li>)}</ul></article>)}</div></section><section className="services-cta"><div className="services-cta-inner"><h2>Not sure which track fits? That is the first conversation.</h2><a className="services-cta-link" href="book.html">Book a session</a></div></section><SiteFooter /></main>;
}

function AboutRowSection({ title, meta, children, className = "" }) {
  return <section className={`about-row-section section-border about-reveal ${className}`} data-reveal><div className="about-section-head"><h2>{title}</h2><span className="about-meta">{meta}</span></div>{children}</section>;
}

function AboutPage() {
  return <main className="about-page" id="top">
    <section className="about-intro about-reveal" data-reveal>
      <div className="about-copy">
        <img className="about-logo" src={logoUrl} alt="Ali Babaei" />
        <span className="eyebrow">About</span>
        <h1>Ali Babaei</h1>
        <p>Design mentor and UX consultant with 20+ years in digital product design and eight years spent building designers and design practices. Architect and lead instructor of 40+ product design cohorts across academies, six universities and startup accelerators, and advisor to 20+ product teams on usability, research practice and design process.</p>
        <p>Experience spans streaming, fintech, e-commerce, healthtech, edtech and enterprise software. My coaching style is contextual rather than generic: reframing the brief by asking the root question, then turning design principles into decisions teams can ship.</p>
        <div className="about-tools"><span className="eyebrow">Tools</span><span>Figma · FigJam · Clarity · Maze · Framer · Linear · Loom · Miro · Notion · Jira</span></div>
      </div>
    </section>

    <AboutRowSection title="Teaching & mentoring" meta="2017 — Present">
      <div className="about-cells">{teachingMentoring.map(({ name, years, detail }) => <article className="about-cell" data-cursor="text" key={name}><div className="about-client-line"><h3>{name}</h3><span>{years}</span></div><p>{detail}</p></article>)}</div>
    </AboutRowSection>

    <AboutRowSection title="Consulting selection" meta="2017 — Present">
      <div className="about-cells">{consultingSelection.map(({ name, sector, detail }) => <article className="about-cell" data-cursor="text" key={name}><div className="about-client-line"><h3>{name}</h3><span>{sector}</span></div><p>{detail}</p></article>)}</div>
    </AboutRowSection>

    <AboutRowSection title="Product design experience" meta="2005 — 2021">
      <div className="about-cells">{productExperience.map(({ name, years, detail }) => <article className="about-cell" data-cursor="text" key={name}><div className="about-client-line"><h3>{name}</h3><span>{years}</span></div><p>{detail}</p></article>)}</div>
    </AboutRowSection>

    <AboutRowSection title="Speaking & recognition" meta="2016 — 2025">
      <div className="about-cells">{speakingPanels.map(({ year, detail }) => <article className="about-cell" data-cursor="text" key={`${year}-${detail}`}><span className="about-sector">{year}</span><p>{detail}</p></article>)}</div>
    </AboutRowSection>

    <AboutRowSection title="Writing" meta={<a href="https://alibabaei.medium.com" target="_blank" rel="noreferrer">On Medium <ArrowRightIcon /></a>} className="about-writing">
      <div className="writing-grid">{writingArticles.map(({ year, title, detail, href }) => <a className="article-card" data-cursor="view" data-cursor-label="read" href={href} target="_blank" rel="noreferrer" key={title}><span className="eyebrow">{year}</span><h3>{title}</h3><p>{detail}</p><span className="read-more">Read on Medium <ArrowRightIcon /></span></a>)}</div>
    </AboutRowSection>

    <SiteFooter />
  </main>;
}

export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const scrolled = usePageMotion();
  const isServicesPage = window.location.pathname.endsWith("/services.html");
  const isAboutPage = window.location.pathname.endsWith("/about.html");

  useEffect(() => {
    document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((link) => { link.href = logoUrl; });
  }, []);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-revealed"));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -80px 0px", threshold: 0.08 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuClosing) return undefined;
    const timer = window.setTimeout(() => {
      setMenuOpen(false);
      setMenuClosing(false);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [menuClosing]);

  const openMenu = () => { setMenuClosing(false); setMenuOpen(true); };
  const closeMenu = () => setMenuClosing(true);
  const finishMenuClose = () => { setMenuOpen(false); setMenuClosing(false); };

  return <><CustomCursor /><Header onOpen={openMenu} onClose={closeMenu} scrolled={scrolled} homeHref={isServicesPage || isAboutPage ? "index.html" : "#top"} services={isServicesPage || isAboutPage} />{menuOpen && <MenuOverlay closing={menuClosing} onClose={closeMenu} onExited={finishMenuClose} />}{isServicesPage ? <ServicesPage /> : isAboutPage ? <AboutPage /> : <main><Hero /><Stats /><Marquee /><Engagements /><Teaching /><Process /><Contact /></main>}</>;
}
