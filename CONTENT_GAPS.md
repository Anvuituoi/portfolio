# Content gaps

Everything below is shown on the site with a visible `[TO CONFIRM]`, `[PLACEHOLDER]` or `[DRAFT FOR OWNER REVIEW]` tag while `reviewMode` is `true` in `src/content/site.ts`. Run `npm run gaps` for the live list with file and line numbers.

## Resolved by the owner (4 Nov 2026)

| Item | Decision |
|---|---|
| Public name | **Lâm Vũ An**, English name **Chadd Lam** (shown beside it) |
| Braille project | **Braille Music Library**. Role: **Co-founder and Project Coordinator** |
| Braille project date | **2022** |
| NCCU International Summer School date | **2024** (also shown on the Global Engagement Summer Study Grants fix) |
| Employer name on the public site | **Sun PhuQuoc Airways** confirmed |
| DH Lab "more than 20 activities" | Confirmed |
| LinkedIn, GitHub, CV | Links taken from the owner's previous site; no CV on the site |

Case-study link changed from `#case/braille-music-access` to `#case/braille-music-library`.

## Suggested wording, approved by the owner (4 Nov 2026)

Written only from facts already on the site and approved as final copy.

| Where | File | Suggested text |
|---|---|---|
| Boarding pass: personal statement | `src/content/profile.ts` | I work on the systems behind an airline's sales network, and outside it on projects that open culture and knowledge to more people: a digital humanities lab and a Braille music library. Both ask the same question: who can reach this, and what stands in the way? I bring that question, and the data to answer it, to every team I join. |
| Aviation Commercial Operations: Outcome | `src/content/projects.ts` | Field sales teams across regions work from one set of processes, channel policies and playbooks, and management receives regular KPI reporting on Revenue, Pax, Yield and channel effectiveness. |
| Aviation Commercial Operations: What I learned | `src/content/projects.ts` | A policy is finished only when a sales team in the field can apply it without calling headquarters. Clear rules, shared data and early agreement with Revenue, Legal and Marketing matter more than the document itself. |
| Braille Music Library: Outcome | `src/content/projects.ts` | A digital Braille music library, built together with more than 20 schools and organizations serving blind and visually impaired communities. |
| Braille Music Library: What I learned | `src/content/projects.ts` | Accessibility work starts with the people who will use it. The schools and organizations we worked with decided what the library needed to be; coordination was mostly listening, then turning what we heard into a plan. |
| Fulbright Digital Humanities Lab: Outcome | `src/content/projects.ts` | Seven projects, three workshops with more than 400 participants and more than 20 activities, supported by over 15 partner institutions and over $15,000 in funding. |
| Fulbright Digital Humanities Lab: What I learned | `src/content/projects.ts` | A student-led lab runs on partnerships. Institutions said yes to clear, small first projects, and each finished project made the next partnership easier to build. |
| Research & Innovation: What I learned | `src/content/projects.ts` | The same questions run through my aviation, archive and accessibility work: who the data leaves out, and how technology can close that gap. |

## Added from the owner's previous site (github.com/Anvuituoi/portfolio, 4 Nov 2026)

| Item | Where on the site |
|---|---|
| LinkedIn: linkedin.com/in/anvuituoi | Contact |
| GitHub: github.com/anvuituoi | Contact (account that hosts the previous site) |
| Braille Music Library platform: braille-music-library.web.app | Waypoint 2 and its case study |
| Braille: database of thousands of scores; funding pitched to IDP and Temasek | Waypoint 2 facts and case study |
| Published paper "Vân Tiên Spoken Poetry: Something to Feel" (in *Truyện thơ nôm Lục Vân Tiên Song Ngữ Việt – Hàn*) | Waypoint 4 outputs and case study |
| Presentation "Developing a Centralized Digital Humanities Platform for Vietnam: Opportunities and Challenges", Engaging with Vietnam International Conference 2023 | Waypoint 4 outputs and case study |
| Second Prize, Film Essay "Negotiating with Modernity", with Dartmouth College | Cruise (no year given) |
| Press: Báo Thanh Niên; two Fulbright University Vietnam articles | Cruise, "In the media" |

Not taken from the previous site: the phone number and GPA (both public there), the "Vietnam's first student-led Digital Humanities NGO" claim, personal photos.

## Decisions

- **Current title:** Sales Policy & Market Management Specialist, Headquarters (HDQ) (owner correction, 4 Nov 2026).
- **Market Development Executive detail:** the 150+ travel agencies and the GSA evaluation (Taiwan, Korea, Singapore, China) are now listed under this role in the journey. Owner to confirm the attribution.

- **No CV on the website** (owner decision). The CV button and its configuration were removed.
- **Review mode is off.** Nothing on the site is waiting for confirmation.

## Still open (optional)

- Primary audience and whether a Vietnamese version is wanted.
- A licensed aircraft GLB, if a photoreal aircraft is wanted later.
- The year of the Film Essay prize, if it should be shown.

## Editorial choices to review

- **Waypoint 1, "Earlier roles":** the 150+ agencies, SAP S/4HANA coordination and GSA evaluation are grouped as "Earlier roles" without naming which role each belongs to. The journey states that SAP S/4HANA coordination happened while Accountant.
- **Project summaries:** one line each, written from the supplied facts (for example "Making Braille music scores easier to find and read.").
- **Thinking & Interests:** topic titles only, linked to related facts. No opinions written.
- **Lounge greeting:** greets once in each language and stops on the last one (Khmer).
- **Braille:** the lounge score and Waypoint 2 show "music" in literary Braille (uncontracted UEB, ⠍⠥⠎⠊⠉), not Braille music notation. Any music notation must be validated by a Braille music reader first.
- **Fictional flight code:** `ALT·0001`, always labelled "fictional".
- **Illustrative data:** both charts use invented index values (OTA, GDS, Wholesale, Corporate, Agent; North vs South), labelled "Illustrative data — not real figures".

## Privacy

The phone number and GPA from the CV are not in the code or on the page. `npm run check` scans the rendered page for both.
