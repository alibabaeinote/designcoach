# Site Content Model

Status: active information architecture contract

Audience: organisations, product leaders, design leaders, and in-house design teams looking for UX consulting or design coaching.

## 1. Site promise

Ali Babaei helps product organisations improve user experience and helps design teams build stronger practice from inside the organisation. The site must make three things clear:

1. what problem can be solved;
2. why Ali is credible to solve it;
3. how an organisation can start a scoped conversation.

## 2. Page roles

| Route | Page role | Primary user question | Primary action |
| --- | --- | --- | --- |
| `index.html` | Conversion narrative | Can Ali help my product or team? | Request a consultation / see engagements |
| `services.html` | Service decision aid | Which area of work fits my situation? | Book a session |
| `about.html` | Credibility and proof | What experience and point of view does Ali bring? | Read / contact / book |
| `book.html` | Qualification and conversion | How do I start a scoped conversation? | Submit booking/request |
| `fa/` | Localised entry point | Can I understand and contact Ali in Persian? | Continue to the matching local action |

## 3. Home content architecture

```text
Home
├── Hero: promise + primary action
├── Stats: credibility at a glance
├── Client marquee: social proof / context
├── Engagements: two ways of working
├── Teaching & mentoring: track record
├── Process: what happens first
└── Direct access: low-friction contact
    └── Footer: identity + channels
```

The home page is a narrative, not a catalogue. It moves from promise → proof → offer → process → action.

## 3.1 Source of truth

English editorial content is stored in `src/content/siteContent.js`. UI components consume named entities from this module; they should not own client lists, service tracks, process steps, or biography records. When a content shape changes, update the module and its contract test. Visual decisions remain in `src/design-tokens.css` and `src/styles.css`.

## 4. Services content architecture

`services.html` is a decision aid. It uses one shared service-track shape:

```text
ServiceTrack
├── number
├── title
├── framing question / tag
└── outcomes or activities[]
```

Current service tracks:

| Track | Meaning | Evidence / outcome language |
| --- | --- | --- |
| User Experience Optimization | Understand and improve the user journey | Passive research, active research, market segmentation |
| Team Effectiveness | Improve how designers work together and communicate | Briefs, presenting, documentation, design ops, hiring |
| Design Culture & Advocacy | Make design legible and valuable inside the organisation | Shared principles, language, business connection |
| Design Strategy | Connect product decisions to user and business movement | Conversion, retention, engagement |

The service page must not become a generic list of capabilities. Each track needs a situation, a practice, and an observable outcome.

## 5. About content architecture

`about.html` is evidence organised by proof type, not a chronological CV dump:

```text
About
├── Intro: point of view + scope of experience
├── Tools: working vocabulary, not a skills-bar rating
├── Teaching & mentoring: institution / period / contribution
├── Consulting selection: client / sector / result
├── Product design experience: organisation / period / role
├── Speaking & recognition: year / contribution or distinction
├── Writing: year / title / thesis / external article
└── Footer: identity + channels
```

Content entity shapes:

```text
ProofItem = {
  title: string,
  meta: string,
  description: string,
  category?: string,
  href?: string
}

Article = {
  year: string,
  title: string,
  thesis: string,
  href: string
}

ContactChannel = {
  label: string,
  href: string,
  kind: email | social | booking
}
```

## 6. Booking content architecture

`book.html` qualifies a request without turning the visitor into a lead-form record. It has one job: capture enough context to schedule a useful first conversation.

```text
Booking
├── Intent: free 45-minute planning call
├── Contact details: name, work email, organisation
├── Context: optional focus area + required concrete challenge
├── Validation: name, work email, organisation and concrete challenge; one inline message per invalid field
├── Submit state: requested / received (receipt replaces the form for the current visit)
└── Footer: shared identity + channels
```

## 7. Shared footer content contract

Every route, including `fa/`, carries the same English footer content in the same order:

```text
Footer
├── Brand: Ali Babaei
├── Positioning: Design coaching · UX consulting · Tehran & remote
├── Direct channel: alibabaeinote@gmail.com
├── Social channels: LinkedIn, Dribbble, Behance, Medium
└── Legal: © 2026 · All rights reserved
```

The footer is a brand-and-channel module, not a second CTA or a place for page-specific content. A page may introduce a new contact channel only after it is added to `SiteFooter`, the static footer adapters, and the design-system footer contract together.

## 8. Shared semantic vocabulary

Use these names in content, code, and design discussions:

- `promise`: what the visitor can expect;
- `proof`: evidence that supports the promise;
- `service track`: a defined area of help;
- `outcome`: the change the organisation is trying to create;
- `practice`: the method or behaviour used to create the outcome;
- `process step`: an ordered stage in starting an engagement;
- `direct access`: the lowest-friction contact path;
- `metadata`: date, sector, role, number, or category that frames content;
- `editorial row`: two-column proof or experience record;
- `decision CTA`: the action that helps the visitor choose or start.

Avoid vague labels such as `misc`, `content block`, `feature`, `stuff`, or `other` in new content models.

## 9. Design-system mapping

| Content meaning | Visual module | Primary tokens |
| --- | --- | --- |
| Promise | Hero | Display XL, canvas, accent action |
| Proof at a glance | Stats / marquee | Number type, rule grid, dark marquee |
| Service choice | Engagements / ServicesPage | Light-dark contrast, card heading, accent state |
| Credibility record | Teaching / About row lists | Editorial grid, metadata, subtle borders |
| Ordered start | Process | Number scale, three-column grid, hover state |
| Low-friction action | Contact / CTA | Dark surface, on-dark text, form and button tokens |
| External reading | Article card | Surface, border hover, article type scale |
| Identity and channels | Footer | Shared dark footer, display identity, channel metadata |

When content changes, preserve the meaning of the region before preserving its current words. If a new item does not fit one of these roles, define the new role before styling it.

## 10. Content writing rules

- Use direct, specific language: product problem, team capability, user journey, outcome.
- Avoid generic consultancy claims such as “innovative solutions” without a concrete practice or result.
- Headings describe the visitor’s decision or problem; supporting text explains context.
- Service bullets start with an observable activity or outcome, not an abstract noun.
- Proof descriptions should state what changed, for whom, and in what product or practice context.
- One page has one primary action. Secondary actions support navigation or evidence.
- Keep current source language in English unless a Persian page is explicitly being authored; do not mix languages inside one content entity.

## 11. Change contract

Before adding a page or section, answer:

1. Which user question does it answer?
2. Is it promise, proof, service choice, process, direct access, or editorial evidence?
3. Which existing entity shape does its content follow?
4. Which visual module and design tokens render it?
5. What is the primary action, and where does it lead?

If these answers are unclear, the content model is not ready to implement.
