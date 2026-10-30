# Migration status: industrialpumps.nl → industrialpumpgroup.de (updated 30 Oct 2026)

## Client decisions (30 Oct 2026)
1. Domain: **https://industrialpumpgroup.de** (no www). Code defaults switched.
2. Copy the Dutch claims (ISO 9001, VCA, official dealer, customers…): **yes**, flagged for sign-off (`notes.claims` in every translated page).
3. Language: **German only**.
4. The 42 webshop-derived pages (21 series + 21 sample products) are listed in `docs/WEBSHOP-DERIVED-PAGES.md`. **No decision yet** → keep them for now.
5. Storyblok space **IPG-DE** (ID 296235349341806, EU). Token is in the git-ignored `.env` (`STORYBLOK_SPACE_ID`, `STORYBLOK_OAUTH_TOKEN`). **Never commit `.env`; the token was pasted in chat → rotate it when done.** Read-only test passed (space has 4 default components + a `home` story).
6. Company data (imprint, phone, address): not available yet → placeholders.

## Pipeline (all scripts under `scripts/nl/`)
| Step | Command | State |
|---|---|---|
| Extract 174 live pages → `content-src/nl/*.json` (125k words, 497 images, FAQ, tables, CTAs) | `npx tsx scripts/nl/extract.ts` | **done** |
| German URL plan `content-src/slug-map.json` (172 pages; 2 duplicates skipped; 26 NL-specific → noindex) | `npx tsx scripts/nl/slug-map.ts` | **done** |
| News dates `content-src/news-dates.json` (28 posts dated) | (one-off script) | **done** |
| Translation batches `content-src/batches.json` (15 batches, ~117k words) | `npx tsx scripts/nl/make-batches.ts` | **done** |
| Translate → `content-src/de/<id>.json` per `content-src/TRANSLATION-BRIEF.md` (Sonnet workers, ≤3 at a time) | validator: `npx tsx scripts/nl/validate-de.ts [ids]` | **batch 4 done (pilot, 0 errors, quality good)**; batches 1–3, 5–15 pending: check `ls content-src/de` vs `batches.json` |
| Download + optimise the 497 page images → `public/img/nl/` + `content-src/image-map.json` | `scripts/nl/images.ts` | **TODO** |
| Generate stories from translated pages (blocks → bloks, link remap via slug-map, noindex, dates, nav titles, tags) and merge with existing seeds | `scripts/nl/build-stories.ts` (+ hook into `generate-seed.ts`) | **TODO** |
| Push components + seed to Storyblok | `npm run sb:push -- --apply`, `npm run sb:seed -- --apply` (use `node --env-file=.env`) | **TODO** (never run live yet) |
| Build/validate all pages, fixtures for new templates, Lighthouse, docs | `npm run build`, `npm run test:fixtures` | **TODO after generation** |

## Site-side changes already made (30 Oct)
- New bloks: `image_block`, `data_table`, `button_row`; new content types: `page_job` (JobPosting), `page_about` (AboutPage), `page_faq` (FAQPage); fields `publication_date`, `service_type`, `default_anliegen`; callback form kind `rueckruf`. Components JSON regenerated (41).
- New templates `JobTemplate`, `AboutTemplate`, `FaqTemplate`; schema builders `job.ts`, `about.ts`, `faq-page.ts`; Topic builder now **CollectionPage + ItemList + Service + FAQPage** (client schema map); FAQPage is collected from FAQ bloks of **every** page type; dates from `publication_date`.
- `astro check`: 0 errors. **Not yet done:** fixtures for the 3 new templates, `npm run build` run after these changes, validator JobPosting test, default QuoteCta on Topic/Hub/Listing templates (check-site requires a conversion link in every page body).

## Gotchas
- Git Bash on Windows: no regex via heredoc; use the Write tool for scripts; `MSYS_NO_PATHCONV=1` for paths starting with `/`.
- Node scripts need a `package.json` in the folder: put them under the project (`.reports/`), not in `/tmp`.
- Dutch customer-review widget text is dropped; Dutch phone/e-mail/address → `{{TELEFON}}`, `{{EMAIL}}`, `{{ADRESSE}}` tokens that the build maps to config placeholders.
- The GitHub repo `thelordwalwadkar/industrialpump-de` is published; Pages link is live (noindex). Local commits after `7d335a6` are not pushed (use the GitHub app).
