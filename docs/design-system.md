# Ali Babaei Design System

Status: active contract

Scope: `index.html`, `services.html`, `about.html`, `book.html`, `fa/` and future pages in this site

Source of truth: `src/design-tokens.css` for primitives and semantic tokens; `src/styles.css` for implementation rules.

## 1. Purpose

This system keeps the website recognisable as one personal brand while allowing new pages and content to be added without inventing a new visual language each time.

The visual position is intentionally restrained: editorial, monochrome, spacious, typographic, and direct. Blue is reserved for action, emphasis, active states, and the small navigational signal that connects the system to the brand.

## 2. Foundations

### 2.1 Color

| Token | Value | Role | Allowed use |
| --- | --- | --- | --- |
| `--ds-color-canvas` | `#f8f9fa` | Page canvas | Main light page background |
| `--ds-color-surface` | `#fff` | Elevated light surface | Cards, article surfaces, form controls when needed |
| `--ds-color-surface-soft` | `#f1f2f4` | Soft contrast surface | Hover, portrait backing, teaching band |
| `--ds-color-surface-muted` | `#e9ebee` | Secondary surface | Low-emphasis panels and background contrast |
| `--ds-color-ink` | `#0a0a0b` | Primary ink | Headings, body text, dark panels |
| `--ds-color-ink-panel` | `#1a1a1b` | Secondary dark panel | Dark engagement card; do not use for all dark sections |
| `--ds-color-accent` | `#1620f5` | Action blue | Links, active numbers, selected pills, CTA, focus ring |
| `--ds-color-accent-hover` | `var(--ds-color-accent)` | Action hover | The same brand blue; hover feedback comes from motion, not a second blue |
| `--ds-color-on-accent` | `#fff` | Action text | Text and icons inside solid blue controls |
| `--ds-color-feedback-error` | `#ff6b6b` | Validation feedback | Invalid field borders and form-level error feedback only |
| `--ds-color-border` | `#cfd1d5` | Default rule | Grid rules, section borders, card borders |
| `--ds-color-border-light` | `#e2e4e9` | Light rule | Header and low-contrast separators |
| `--ds-color-text-secondary` | `rgba(10,10,11,.7)` | Supporting copy | Intro paragraphs, explanatory copy |
| `--ds-color-text-muted` | `rgba(10,10,11,.6)` | Metadata copy | Role labels, service tags, secondary descriptions |
| `--ds-color-text-subtle` | `rgba(10,10,11,.4)` | Quiet metadata | Eyebrows, footer labels, inactive numbers |
| `--ds-color-text-on-dark-secondary` | `rgba(248,249,250,.7)` | Dark supporting copy | Contact and dark-card descriptions |
| `--ds-color-border-on-dark` | `rgba(248,249,250,.2)` | Dark rule | Contact form and dark footer separators |
| `--ds-color-text-error` | `var(--ds-color-feedback-error)` | Error message text | Inline validation copy beneath an invalid required input |

Rules:

- Never add a new grey by eye. Choose the closest semantic text or border token.
- Blue communicates action or state, not decoration. One primary action should be visually dominant in a region.
- `#1620f5` is the only blue value in the system. Hover, glow, pale surfaces and success feedback may only use transparency or `color-mix()` derived from this token; do not introduce blue shades as separate values.
- Dark panels use `--ds-color-ink-panel` when they are a card and `--ds-color-ink` when they are a full section or overlay.
- Text opacity is part of the hierarchy. Do not use a lighter colour to compensate for an incorrect font size.
- Contrast must remain readable in both light and dark surfaces; use the `on-dark` tokens rather than reusing light-page tokens.
- Solid blue controls always use `--ds-color-on-accent`; on dark surfaces they also receive a subtle white inset rule so their boundary and label remain clear without adding a second blue.

### 2.1.1 System dark mode

The site follows the visitor's operating-system preference through `prefers-color-scheme`. There is no manual theme switch in version 1.

| Theme layer | Light mode | Dark mode | Rule |
| --- | --- | --- | --- |
| Canvas | `#f8f9fa` | `#0a0a0b` | The full page surface follows the system preference. |
| Raised surface | `#ffffff` | `#151619` | Cards, forms and static-page panels retain a small but visible lift from the canvas. |
| Soft surface | `#f1f2f4` | `#1b1c20` | Hover and low-emphasis bands keep the same hierarchy. |
| Primary reading ink | `#0a0a0b` | `#f8f9fa` | Body and heading contrast changes semantically, not by filter inversion. |
| Rules | `#cfd1d5` | `#44464d` | The editorial 1px grid remains quieter than content. |
| Inverse surface | `#0a0a0b` | `#0a0a0b` | Menu, contact and shared footer remain deliberately dark in both modes. |

Dark-mode rules:

- Do not invert images, the portrait brand mark, or the accent blue.
- Keep the blue accent for action, selected state and focus. It is never used to compensate for weak dark-surface contrast.
- Use `--ds-color-surface-inverse` for intentionally dark regions. Do not use `--ds-color-ink` as a background, because `ink` is the current page-reading colour and changes with the active theme.
- All supporting copy switches to the matching semantic text token. Raw light-page `rgba(10, 10, 11, ...)` values are not permitted in new work.
- Validate both themes at wide desktop and `390px`, including keyboard focus, form validation, menu overlay, direct-route loading and shared-footer parity.

### 2.2 Typography

| Role | Family | Desktop | Mobile | Weight / leading |
| --- | --- | --- | --- | --- |
| Display XL | Space Grotesk | `clamp(56px, 7vw, 100px)` | `48px` or page-specific | 600 / `.9–1.05` |
| Display L | Space Grotesk | `72px` | `36–45px` | 600 / `1` |
| Section heading | Space Grotesk | `40–60px` | `36–40px` | 600 / `1` |
| Card heading | Space Grotesk | `30px` | `24–27px` | 600 / `1.1–1.3` |
| Body large | Inter | `18px` | `16px` | 400 / `1.5–1.56` |
| Body medium | Inter | `16px` | `14–16px` | 400 / `1.5` |
| Label / metadata | Space Grotesk | `10–12px` | `9–12px` | 400–500 / uppercase, tracked |
| Mono-like utility | Space Grotesk | `10–12px` | `9–11px` | 400–500 / tracked |

Rules:

- `Space Grotesk` is for display, headings, numbers, navigation labels, metadata, and utility text.
- `Inter` is for paragraphs, descriptions, form input, and long reading text.
- Use one `h1` per page. Major page regions use `h2`; cards and individual records use `h3`.
- Eyebrows are structural labels, not replacement headings: `01 / Engagements`, `02 / Track record`, etc.
- Uppercase is reserved for navigation and metadata. Sentence case is used for explanatory copy.
- Never use letter spacing to fix a wrong font size or line height. Tracking is part of the role token.
- For Persian pages, keep the same hierarchy but use Persian line-height overrides and validate every wrap at mobile width.

### 2.3 Spacing

The base unit is `4px`. Use the named scale in `src/design-tokens.css`:

`1=4`, `2=8`, `3=12`, `4=16`, `5=20`, `6=24`, `7=28`, `8=32`, `10=40`, `12=48`, `14=56`, `16=64`, `18=72`, `20=80`, `24=96`, `32=128`.

Contract:

- Component internals normally use `8 / 12 / 16 / 24 / 32px`.
- Card and row padding is normally `24 / 32 / 40 / 48px` depending on density.
- Section breathing room is normally `72 / 96 / 128px` on desktop and `48 / 64 / 80px` on mobile.
- The statistics section begins after a deliberate `64px` desktop or `48px` mobile gap from the hero; it remains a separate editorial section rather than an extension of the hero.
- The global mobile gutter is `24px`; the desktop page gutter is `48px`; the inner section gutter is `40px`.
- A `1px` rule is structural and should be used instead of a shadow to separate editorial regions.
- The value `404px` is not a design token and must not be introduced. It was removed as an old footer-spacing workaround.

### 2.4 Grid and layout

| Layout primitive | Contract |
| --- | --- |
| Container | Maximum `1200px`, centered |
| Wide content | Maximum `1360px` only for the contact section when required by the source geometry |
| Desktop grid | 12-column thinking; implement two-column and three-column slices with explicit ratios |
| Main two-column split | `1fr 1fr`, or source-defined `1.05fr .95fr` / `1.2fr .9fr` |
| Editorial row list | Two equal columns with a `1px` rule gap |
| Process grid | Three equal columns on desktop; one column below `768px` |
| Mobile | Single-column flow below `900px`; mobile spacing and type tuning below `767px` |
| Full-bleed sections | Section background may span the viewport; content remains inside the container |

Layout rules:

- Borders and background panels define grouping; avoid rounded cards and decorative shadows.
- Use alignment and whitespace to create hierarchy before adding visual ornament.
- Every responsive layout must be checked at `390px` and at a wide desktop viewport.
- A section may break the container only when its visual role is explicitly full-bleed: marquee, contact, dark overlay, or footer.

### 2.5 Shared footer

Every route ends with the same identity-and-channels footer. It is a full-bleed dark region, not a compact metadata bar.

| Part | Content contract | Visual contract |
| --- | --- | --- |
| Brand block | `Ali Babaei` plus `Design coaching · UX consulting · Tehran & remote` | Left-aligned display name; supporting line below it |
| Channels block | Email, LinkedIn, Dribbble, Behance, Medium, copyright | Right-aligned on desktop; follows the brand block on mobile |
| Desktop | Two columns | `64px 48px` padding, `28px` minimum inter-block gap |
| Mobile | One column | `48px 24px` padding, `36px` block gap |

The React routes use `SiteFooter`; the static English booking page and Persian entry point use the same DOM order and values. The text stays in English on both routes so the footer is literally consistent across language entry points. React values are governed by `--ds-footer-*` and `--ds-type-footer-*`; `public/css/style.css` mirrors them through `--footer-*` adapter variables because static pages do not bundle the React token file. Do not add a page-specific footer variant without first changing this contract.

### 2.6 Shape, borders, and effects

- Radius is `0` for cards, inputs, sections, and article surfaces.
- Pill radius (`999px`) is reserved for selectable focus-area chips and similar compact controls.
- Default border is `1px solid var(--ds-color-border)`.
- Hover elevation is limited to `var(--ds-shadow-hover)` and only for article cards.
- Grain is a restrained `4px` radial pattern; it is atmosphere, not content, and must never reduce text legibility.
- Blur is reserved for the scroll-aware header and scroll transition; do not add blur to cards or body copy.
- The blue radial glow is reserved for the contact section and must remain behind content and pointer-inert.

### 2.7 Brand mark

- The canonical portrait mark is `public/assets/ali-babaei-logo-v2.png`.
- The main header renders it as a circular `30px` mark on desktop and `26px` on mobile, followed by the wordmark and role label.
- The legacy `book.html` and `fa/` headers use the same asset so the brand remains consistent across entry points.
- The same asset is the PNG favicon and Apple touch icon. Do not substitute the old logo mark or crop the image into a different shape without updating this contract.

## 3. Motion and interaction contract

| Interaction | Behaviour |
| --- | --- |
| Header scroll state | Transparent at top; translucent border/blur after scroll |
| Menu open | Full-screen dark overlay, clip-path reveal, staggered links |
| Menu close | Reverse clip-path; body scroll unlocks after exit |
| Section reveal | `translateY(40px)` to `0`, opacity reveal, one-time IntersectionObserver |
| Hero | Letter entrance, scroll fade/blur/parallax, reduced-motion fallback |
| Hover | Blue accent, soft surface change, underline or small lift only where the content is actionable |
| Cursor | Desktop-only contrast dot; never required to understand the page |
| Reduced motion | All nonessential animation becomes near-instant and scroll smoothing is disabled |

Motion must communicate state or hierarchy. Do not animate layout dimensions, text reflow, or form values.

## 4. Component and module contracts

The UI is implemented in the `App` module, but each named surface below is a visual module with a small interface and a clear seam for change:

| Module | Interface | Uses |
| --- | --- | --- |
| `Header` | `homeHref`, `scrolled`, `onOpen`, `onClose` | Header tokens, navigation, scroll state; English routes show `Menu` followed by the `FA` language entry, while Persian keeps the single `EN` entry and no menu trigger |
| `MenuOverlay` | `onClose`, `closing`, `onExited` | Navigation item model, menu motion tokens |
| `Hero` | Page intro content and primary/secondary actions | Display type, canvas, action blue |
| `Stats` | Value/label pairs | Number type, rule grid, uniform default surfaces; value is top-anchored independently of label wrapping; accent line on hover only |
| `Engagements` | Two service-outcome cards | Light/dark surfaces, outcome hierarchy |
| `Teaching` | Track-record row items | Editorial grid, hover accent |
| `Process` | Ordered step items | Number state, three-column grid |
| `Contact` | Contact promise, required fields, optional focus areas, validation and submit state | Dark surface, inline feedback and locked success state, direct-access CTA |
| `SiteFooter` | Identity, contact channel, social channels, copyright | Shared footer tokens and dark-surface hierarchy |
| `ServicesPage` | Four service-track records | Service taxonomy and decision CTA |
| `AboutPage` | Proof records, articles, social channels | Credibility taxonomy and editorial rows |

When a module needs a new visual state, add the state to its data/interface first, then add the smallest token-backed style needed to render it.

## 5. Accessibility and content rules

- Maintain heading order and use real buttons for state changes.
- Every external link opens in a new tab only when it leaves the site; internal page links remain relative.
- Focus outlines use the accent token and must remain visible against both surfaces.
- Decorative cursor, grain, glow, and scroll cue are `aria-hidden` or pointer-inert.
- Form labels remain visible; placeholder text is not a label.
- Required contact fields show one concise inline error directly below their own input. Focus area is optional and never receives an error state.
- A successfully submitted request replaces the form with a confirmation state for the current visit; do not offer a reset or second request in that state.
- Long copy must be tested for wrapping at `390px`; never fix overflow with clipping.

## 6. Change contract

1. Identify the content role and visual module in `docs/site-content-model.md`.
2. Reuse an existing semantic token before creating a new one.
3. If a new decision is genuinely needed, add a `--ds-*` token with a role-based name and document its allowed use here.
4. Implement at the module seam, not by adding a page-specific override to an unrelated module.
5. Check desktop, mobile, keyboard focus, reduced motion, hover, direct-route loading, and shared footer parity.
6. Run `npm run build` and `npm run test:sites`.
7. Update `design-qa.md` when geometry, interaction, or source fidelity changes.

## 7. Current exceptions and migration notes

The current faithful recreation still contains source-matching legacy literals in `src/styles.css` for a few historical gray values, exact section heights, and one-off source geometry. They are preserved to protect visual fidelity. New work must use `--ds-*` tokens; existing literals should be migrated only when the resulting geometry is rechecked against the source.
