# Migration status: industrialpumps.nl → industrialpumpgroup.de (updated 30 Oct 2026, end of day)

## State in one paragraph
All 172 German pages exist (every page type of industrialpumps.nl except the webshop checkout). Content is translated, images are local, JSON-LD is generated per template, and **all 41 components and 216 stories are live in the Storyblok space IPG-DE** (published). The static build (218 pages) passes schema validation, site QA, fixtures and `astro check` with 0 errors. Verified: build from live Storyblok data (same result). Not yet done: real company/legal data, client sign-off on the Dutch claims, hreflang/og:image/lastmod, Lighthouse.

## Client decisions (30 Oct 2026)
1. Domain **https://industrialpumpgroup.de** (no www).
2. Copy the Dutch claims (ISO 9001, VCA, official dealer, customers…): yes, flagged for sign-off → `docs/NL-CLAIMS-TO-VERIFY.md` (663 lines, generated from the translators' notes).
3. German only.
4. 42 webshop-derived pages (21 series + 21 sample products, `docs/WEBSHOP-DERIVED-PAGES.md`): no decision yet → kept.
5. Storyblok space IPG-DE (ID 296235349341806, EU), token in git-ignored `.env`. **Token was pasted in chat → rotate it.**
6. Company data (imprint, phone, address): not available → placeholders `[[PLATZHALTER: …]]` (skipped in JSON-LD).

## Pipeline (all done)
| Step | Command / file | Result |
|---|---|---|
| Extract 174 pages | `scripts/nl/extract.ts` → `content-src/nl/` | 125k words, 497 images |
| URL plan | `scripts/nl/slug-map.ts` → `content-src/slug-map.json` | 172 German pages, 2 duplicates skipped, 26 noindex (NL-specific) |
| Translate | `content-src/TRANSLATION-BRIEF.md` → `content-src/de/` | 172 files, `validate-de.ts` 0 errors |
| Images | `scripts/nl/images.ts` → `public/img/nl/` (22 MB webp) + `content-src/image-map.json` | 497/497 |
| Stories | `scripts/lib/nl-stories.ts`, called from `scripts/generate-seed.ts` | 161 new stories + 7 appended onto hand-built pages (home, `/pumpen`, `/pumpen/marken`, 4 brands) |
| Reports | written by `generate-seed.ts` | `docs/MIGRATION-REPORT.md`, `NL-CLAIMS-TO-VERIFY.md`, `NL-SPECIFIC.md` |
| Storyblok | `node --env-file=.env node_modules/tsx/dist/cli.mjs scripts/push-components.ts --apply`, then `…/seed-content.ts --apply` | 41 components, 216 stories + 39 folders, all published |

Re-run after content changes: `npx tsx scripts/generate-seed.ts` → `npm run build` → seed-content `--apply` (idempotent; retry on 504).

## Mapping rules worth knowing
- Every translated block becomes a blok in `body`: rich_text (h/p/list), image_block, data_table, faq (≤ 8 items per blok, longer lists are split), button_row. H1 blocks are dropped (the template renders the H1 field). Blog/knowledge: first text run → `article`.
- Dutch internal links are remapped through the slug map; links to webshop/dead/mailto targets are removed (text stays) → listed in `MIGRATION-REPORT.md`.
- Hand-built pages keep their structure; NL text is appended to `body`. Legal and form pages (`/agb`, `/datenschutz`, `/kontakt`, `/angebot`) keep the German skeletons: Dutch legal text is **not** reused.
- Assumptions in code: pump type of the 15 migrated series pages (`SERIES_PUMP_TYPE` in `nl-stories.ts`, borehole pumps filed as submersible); generic `revision_text` on migrated brand pages; brand names from a slug map.
- Site-side changes: new templates Job/About/FAQ, schema builders `job.ts`, `about.ts`, `faq-page.ts`, Topic = CollectionPage + ItemList + Service + FAQPage, FAQPage collected from FAQ bloks of every page type; default quote CTA on Hub/Topic/Listing; service pages list their sub-pages; footer links to Ersatzpumpe, Rückruf, FAQ; check-site false positives fixed (`grindex`, "Plug-and-play", English proper names).

## Open items / next steps
1. ~~Storyblok read token~~ **done 30 Oct**: token received, stored as `STORYBLOK_TOKEN` in the git-ignored `.env`; a build from live Storyblok data gives the same 218 pages with 0 errors. The token also serves draft content (preview-capable): for the production build use a *public* token and keep the preview one for the editor only. Still untested: visual-editor bridge.
2. Client sign-off: `NL-CLAIMS-TO-VERIFY.md`; `NL-SPECIFIC.md` (Dutch addresses, customers, people); decide on the 42 webshop-derived pages; delete/replace NL-only pages (26 are noindex).
3. Source problems found by translators (flagged in notes): `saer__ncbk-serie` is a copy of CM/CMP; garbled specs on Lowara Scuba/SVI, SAER MBSH/FS-98; Goulds heading names SAER; KRW post breaks off mid-sentence (translator completed it minimally); cavitation vapour-pressure wording corrected; "Schottenpompen"/"deppompen"/"expansiepompen" renderings to confirm.
4. SEO layer still open: hreflang (nl/en/de), og:image, sitemap lastmod, German keyword mapping (keyword workbooks only have English terms), Lighthouse run on the full site.
5. Company data and legal texts (Impressum, Datenschutz, AGB) from the client; legal review.
6. Push local commits via GitHub Desktop; rotate the Storyblok token.

## Gotchas
- Git Bash heredocs mangle backslashes in regexes: use the Edit/Write tools for code with regexes.
- Node scripts need a `package.json` nearby: keep helper scripts under the project (`.reports/`).
- Storyblok enforces model limits the local build does not: required fields, intro ≤ 320 chars, FAQ ≤ 8 items per blok.
