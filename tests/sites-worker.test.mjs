import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";

test("serves existing static assets without a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: {
      fetch: async (request) => {
        calls.push(new URL(request.url).pathname);
        return new Response("asset", { status: 200 });
      },
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/assets/app.js"]);
});

test("falls back to index.html for an unknown app route", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/flow/step-two?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname + url.search);
          return new Response(url.pathname === "/index.html" ? "app" : "missing", {
            status: url.pathname === "/index.html" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/flow/step-two?source=share", "/index.html"]);
});

test("does not turn missing API or write requests into the app shell", async () => {
  for (const request of [
    new Request("https://example.test/api/missing", { headers: { accept: "application/json" } }),
    new Request("https://example.test/flow", { method: "POST", headers: { accept: "text/html" } }),
  ]) {
    let calls = 0;
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async () => {
          calls += 1;
          return new Response("missing", { status: 404 });
        },
      },
    });

    assert.equal(response.status, 404);
    assert.equal(calls, 1);
  }
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
});

test("keeps the brand logo on a stable public asset URL", async () => {
  const assetNames = await readdir(new URL("../dist/client/assets/", import.meta.url));
  const scripts = assetNames.filter((name) => name.endsWith(".js"));
  const bundles = await Promise.all(scripts.map((name) => readFile(new URL(`../dist/client/assets/${name}`, import.meta.url), "utf8")));
  const logo = await readFile(new URL("../dist/client/assets/ali-babaei-mark.png", import.meta.url));

  assert.ok(bundles.some((bundle) => bundle.includes("/assets/ali-babaei-mark.png")));
  assert.ok(bundles.every((bundle) => !bundle.includes("ali-babaei-logo-fj5Ez689.png")));
  assert.deepEqual(logo.subarray(1, 4).toString("ascii"), "PNG");
});

test("keeps the English About logo prominent above the intro", async () => {
  const stylesheet = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.match(stylesheet, /\.about-logo\{width:180px;height:180px/);
  assert.match(stylesheet, /\.about-logo\{width:120px;height:120px/);
});

test("keeps the Persian landing title readable and highlighted", async () => {
  const stylesheet = await readFile(new URL("../public/css/style.css", import.meta.url), "utf8");

  assert.match(stylesheet, /\.mark-yellow\s*\{[\s\S]*background:\s*color-mix\(in srgb, var\(--accent\) 22%, transparent\)/);
  assert.match(stylesheet, /html\[lang="fa"\] \.landing-hero \.hero-h1\s*\{[\s\S]*line-height:\s*1\.55/);
  assert.match(stylesheet, /html\[lang="fa"\] \.landing-hero \.hero-h1\s*\{[\s\S]*line-height:\s*1\.6/);
});

test("keeps all statistics visually identical by default", async () => {
  const stylesheet = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.match(stylesheet, /\.stats-section\{padding:96px 48px;background:var\(--background\)\}/);
  assert.doesNotMatch(stylesheet, /\.stats-section\{[^}]*border-top/);
  assert.match(stylesheet, /\.stat:last-child\{border-right:0\}/);
  assert.doesNotMatch(stylesheet, /\.stat:last-child\{[^}]*background/);
  assert.match(stylesheet, /\.stats-grid \.stat\{justify-content:flex-start;padding-top:104px\}/);
  assert.match(stylesheet, /@media\(max-width:767px\)\{\.stats-grid \.stat\{padding-top:80px\}\}/);
});

test("keeps booking form submission controls free of a duplicate separator", async () => {
  const stylesheet = await readFile(new URL("../public/css/style.css", import.meta.url), "utf8");

  assert.doesNotMatch(stylesheet, /(^|\n)\.form-footer\s*\{[^}]*border-top/);
});

test("uses Formspree with inline field validation and a locked success state", async () => {
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const stylesheet = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const bookingPage = await readFile(new URL("../public/book.html", import.meta.url), "utf8");
  const persianBookingPage = await readFile(new URL("../public/fa/index.html", import.meta.url), "utf8");
  const bookingScript = await readFile(new URL("../public/js/main.js", import.meta.url), "utf8");

  assert.match(app, /const formspreeEndpoint = "https:\/\/formspree\.io\/f\/xbgrwqyy"/);
  assert.match(app, /fetch\(formspreeEndpoint, \{ method: "POST"/);
  assert.match(app, /className="contact-field-error"/);
  assert.match(app, /className="contact-form-success"/);
  assert.match(app, /disabled=\{isSubmitting\}/);
  assert.match(stylesheet, /\.contact-field-error\{/);
  assert.match(stylesheet, /\.contact-form-success\{/);
  for (const page of [bookingPage, persianBookingPage]) {
    assert.doesNotMatch(page, /btn-reset/);
    assert.doesNotMatch(page, /data-required-message="لطفاً حداقل یه مورد رو انتخاب کنید\."/);
    assert.match(page, /name="org" type="text" required/);
  }
  assert.match(bookingScript, /if \(topicsGroup && topicsGroup\.dataset\.requiredMessage\)/);
  assert.match(bookingScript, /invalidValidators\.forEach\(showValidatorError\)/);
  assert.match(bookingScript, /setAttribute\("aria-invalid", "true"\)/);
  assert.match(bookingScript, /payload\?\.errors\?\.at\(0\)\?\.message/);
  assert.doesNotMatch(bookingScript, /const resetBtn = wrapper\.querySelector\("\.btn-reset"\)/);
});

test("keeps the shared footer governed by documented design tokens", async () => {
  const tokens = await readFile(new URL("../src/design-tokens.css", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const staticStyles = await readFile(new URL("../public/css/style.css", import.meta.url), "utf8");
  const designSystem = await readFile(new URL("../docs/design-system.md", import.meta.url), "utf8");
  const contentModel = await readFile(new URL("../docs/site-content-model.md", import.meta.url), "utf8");

  assert.match(tokens, /--ds-footer-padding-block: 64px/);
  assert.match(tokens, /--ds-type-footer-name-size: clamp\(42px, 4vw, 80px\)/);
  assert.match(styles, /\.unified-footer\{[^}]*var\(--ds-footer-padding-block\)/);
  assert.match(styles, /\.card-dark \.underlined-link\{color:var\(--ds-color-text-on-dark\)\}/);
  assert.match(styles, /\.menu-overlay\{[^}]*color:var\(--ds-color-text-on-dark\)/);
  assert.match(styles, /\.email-link\{[^}]*color:var\(--ds-color-text-on-dark\)/);
  assert.match(styles, /\.contact-form input,\.contact-form textarea\{color:var\(--ds-color-text-on-dark\)/);
  assert.match(styles, /\.contact-form-success\{color:var\(--ds-color-text-on-dark\)/);
  assert.match(styles, /\.overlay-nav a\{color:var\(--ds-color-text-on-dark\)\}/);
  assert.match(staticStyles, /\.site-menu-links a\s*\{[\s\S]*color: var\(--dark-muted-1\)/);
  assert.match(staticStyles, /--footer-padding-block: 64px/);
  assert.match(staticStyles, /\.site-footer\s*\{[^}]*var\(--footer-padding-block\)/);
  assert.match(designSystem, /### 2\.5 Shared footer/);
  assert.match(designSystem, /ali-babaei-mark\.png/);
  assert.match(contentModel, /## 7\. Shared footer content contract/);
});

test("uses one documented brand blue across dynamic and static pages", async () => {
  const tokens = await readFile(new URL("../src/design-tokens.css", import.meta.url), "utf8");
  const staticStyles = await readFile(new URL("../public/css/style.css", import.meta.url), "utf8");
  const loop = await readFile(new URL("../public/js/system-loop.js", import.meta.url), "utf8");
  const designSystem = await readFile(new URL("../docs/design-system.md", import.meta.url), "utf8");

  assert.match(tokens, /--ds-color-accent: #1620f5/);
  assert.match(tokens, /--ds-color-accent-hover: var\(--ds-color-accent\)/);
  assert.match(staticStyles, /--accent: #1620F5/);
  assert.match(staticStyles, /--accent-hover: var\(--accent\)/);
  assert.match(staticStyles, /--accent-active: var\(--accent\)/);
  assert.match(loop, /accent: '#1620F5'/);
  assert.match(designSystem, /#1620f5` is the only blue value in the system/);
  assert.doesNotMatch(staticStyles, /#2E5BFF|#1E4AB8|#1538A0|#E7ECFF|rgba\(46,\s*91,\s*255/);
});

test("ships a focused Persian header and one shared footer system", async () => {
  const persianPage = await readFile(new URL("../dist/client/fa/index.html", import.meta.url), "utf8");
  const bookingPage = await readFile(new URL("../dist/client/book.html", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const stylesheet = await readFile(new URL("../dist/client/css/style.css", import.meta.url), "utf8");

  assert.match(persianPage, /class="language-switch back-switch" href="\.\.\/index\.html"[^>]*>.*بازگشت<\/a>/);
  assert.match(stylesheet, /\.back-switch\s*\{[\s\S]*direction:\s*rtl/);
  assert.doesNotMatch(persianPage, /class="menu-trigger"/);
  assert.doesNotMatch(persianPage, /class="site-menu"/);
  assert.match(persianPage, /<h1 class="hero-h1">تصمیم‌های طراحی که<br>\s*تیم‌تون می‌تونه <span class="mark-yellow">واقعاً بسازه<\/span><\/h1>/);
  assert.doesNotMatch(persianPage, /data-cycle-words/);
  assert.match(stylesheet, /html\[lang="fa"\] \.landing-hero \.hero-h1/);
  assert.match(stylesheet, /font-size:\s*clamp\(40px, 5vw, 60px\)/);
  assert.match(stylesheet, /font-size:\s*clamp\(32px, 8\.2vw, 40px\)/);
  assert.match(stylesheet, /html\[lang="fa"\] \.landing-hero \.hero-h1[\s\S]*font-size:\s*clamp\(40px, 5vw, 60px\);\s*line-height:\s*1\.55/);
  assert.match(stylesheet, /html\[lang="fa"\] \.landing-hero \.hero-h1 \+ \.intro-copy\s*\{\s*margin-top:\s*16px/);
  assert.match(stylesheet, /html\[lang="fa"\] \.landing-hero \.hero-h1[\s\S]*font-size:\s*clamp\(32px, 8\.2vw, 40px\);\s*line-height:\s*1\.6/);
  assert.match(stylesheet, /--accent-pale:\s*color-mix\(in srgb, var\(--accent\) 34%, var\(--cream\)\)/);
  assert.match(stylesheet, /html\[lang="fa"\] \.btn-secondary,[\s\S]*\.back-switch[\s\S]*font-size:\s*var\(--fa-type-control-size\)/);
  assert.match(stylesheet, /html\[lang="fa"\] \.meta-right\s*\{[\s\S]*font-size:\s*var\(--fa-type-meta-size\)/);
  assert.match(stylesheet, /html\[lang="fa"\] \.form-footer\s*\{\s*border-top:\s*0/);
  assert.match(app, /function SiteFooter\(\)/);
  assert.equal((app.match(/<SiteFooter \/>/g) || []).length, 3);
  for (const page of [persianPage, bookingPage]) {
    assert.match(page, /<footer class="site-footer">[\s\S]*Ali Babaei[\s\S]*alibabaeinote@gmail\.com[\s\S]*LinkedIn[\s\S]*© 2026 · All rights reserved[\s\S]*<\/footer>/);
    assert.doesNotMatch(page, /site-footer--bar|footer-mark/);
  }
  assert.match(stylesheet, /\.site-footer\s*\{/);
});

test("adds the loader sweep only to the homepage name", async () => {
  const stylesheet = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.match(stylesheet, /\.hero h1::after\{content:\"\"[\s\S]*animation:hero-name-loader/);
  assert.match(stylesheet, /@keyframes hero-name-loader\{from\{transform:translateX\(-105%\)\}to\{transform:translateX\(105%\)\}\}/);
  assert.doesNotMatch(stylesheet, /\.hero-center p::after|\.hero-actions::after/);
});

test("temporarily serves the light theme while retaining the dark logo asset", async () => {
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const stylesheet = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

  assert.match(app, /const heroLogoDarkUrl = "\/assets\/hero-design-aware-dark\.png\?rev=20260831"/);
  assert.match(app, /const darkModeEnabled = false/);
  assert.match(app, /const darkModeMedia = darkModeEnabled \? "\(prefers-color-scheme: dark\)" : "not all"/);
  assert.match(app, /<source media=\{darkModeMedia\} srcSet=\{heroLogoDarkUrl\} \/><img className="hero-logo" src=\{heroLogoUrl\}/);
  assert.match(stylesheet, /\.hero-logo-lockup picture,\.hero-logo\{display:block;width:100%\}/);
  assert.match(stylesheet, /@media not all \{\.hero-logo\{transform:scale\(1\.2\)\}\}/);
});

test("puts the Persian entry beside Menu on every English header", async () => {
  const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");
  const bookingPage = await readFile(new URL("../public/book.html", import.meta.url), "utf8");
  const bookingStyles = await readFile(new URL("../public/css/style.css", import.meta.url), "utf8");

  assert.match(app, /className="header-actions"[\s\S]*className="menu-button"[\s\S]*className="header-language-switch" href="fa\/"/);
  assert.match(styles, /\.header-language-switch\{/);
  assert.match(bookingPage, /class="header-actions"[\s\S]*class="menu-trigger"[\s\S]*class="language-switch" href="fa\/"/);
  assert.match(bookingStyles, /\.header-actions\s*\{/);
});

test("ships route-specific crawl metadata for the React entry points", async () => {
  const home = await readFile(new URL("../dist/client/index.html", import.meta.url), "utf8");
  const about = await readFile(new URL("../dist/client/about.html", import.meta.url), "utf8");
  const services = await readFile(new URL("../dist/client/services.html", import.meta.url), "utf8");

  assert.match(home, /<link rel="canonical" href="https:\/\/alibabaei\.info\/" \/>/);
  assert.match(about, /<link rel="canonical" href="https:\/\/alibabaei\.info\/about\.html" \/>/);
  assert.match(about, /<meta property="og:url" content="https:\/\/alibabaei\.info\/about\.html" \/>/);
  assert.match(services, /<link rel="canonical" href="https:\/\/alibabaei\.info\/services\.html" \/>/);
  assert.match(services, /<title>Engagements — Ali Babaei<\/title>/);
});

test("installs Microsoft Clarity on every public entry point", async () => {
  const home = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const booking = await readFile(new URL("../public/book.html", import.meta.url), "utf8");
  const persian = await readFile(new URL("../public/fa/index.html", import.meta.url), "utf8");

  for (const page of [home, booking, persian]) {
    assert.match(page, /https:\/\/www\.clarity\.ms\/tag\/"\+i/);
    assert.match(page, /"yazkgjr1mm"/);
  }
});
