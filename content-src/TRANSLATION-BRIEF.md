# Translation brief: industrialpumps.nl → industrialpumpgroup.de (Dutch → German)

You translate pages of a Dutch B2B pump dealer's website into German for the German twin site **industrialpumpgroup.de**. The client wants **every page, copied and translated**, but written as a native German engineer would write it, and **very SEO-friendly**.

## Input and output
- Input: `content-src/nl/<id>.json` (ordered blocks extracted from the live page: `h`, `p`, `list`, `table`, `img`, `faq`, `cta`, `form`). Inline markup: `**bold**` and `[link text](href)`.
- Output: `content-src/de/<id>.json` with exactly this shape (valid JSON, UTF-8, no comments, no trailing commas):

```json
{
  "id": "<same id as the file name>",
  "seo_title": "German <title>, 15–60 characters, main German keyword first",
  "seo_description": "German meta description, 60–155 characters: keyword + concrete benefit + action verb",
  "h1": "One H1 with the main topic (source may have none: derive it from the title)",
  "intro": "1–2 sentences that answer 'what is this and for whom' (quotable by AI answer engines)",
  "blocks": [ ...same block types, same order, translated... ],
  "notes": { "dropped": ["what you removed and why"], "claims": ["German sentence containing a claim that needs the client's sign-off"], "nl_specific": ["German sentence that only makes sense for the Netherlands"] }
}
```

## Rules for `blocks`
1. **Keep the structure**: same block types in the same order. Do not invent blocks, do not merge or split lists/FAQ. The `intro` is *additional* (it is not a block); do not delete the first paragraph because of it.
2. **Links**: keep every `href` exactly as in the source (the build remaps internal links); translate only the link text. External links unchanged.
3. **Images** (`img`): keep `src`; translate `alt` or write a short descriptive German alt text when the image is meaningful (empty string only for decorative images).
4. **Tables**: translate cells, keep numbers.
5. **FAQ**: keep every question/answer pair; make the question a natural German question.
6. **CTA** blocks: say exactly what happens ("Angebot anfordern", "Mehr zur Funktionsweise von Kreiselpumpen lesen"); never "Hier klicken" and never "Mehr erfahren" alone.
7. **Contact data**: replace Dutch phone numbers with `{{TELEFON}}`, e-mail addresses with `{{EMAIL}}`, street/postcode/city/KvK/VAT numbers with `{{ADRESSE}}`. These are the only allowed tokens.
8. **Drop and declare** (`notes.dropped`): customer-review widget text ("Onze klanten zeggen 8,6 … 136 reviews"), cookie texts, repeated navigation labels. Everything else stays.
9. **Claims** (ISO 9001, VCA, "officiële dealer", years of experience, customer names, awards, certificates): the client approved copying them. Translate faithfully and list the German sentence in `notes.claims`.
10. **Netherlands-specific facts** (locations, "in heel Nederland", Dutch laws/standards, Dutch events/customers, KvK): translate faithfully (do **not** delete or localise them) and list the German sentence in `notes.nl_specific`.
11. **Never invent** facts, numbers, dates, certifications or product data. If something is unclear, keep the meaning and stay general.

## Language and style
- German (de-DE), **Sie**-form, **sachlich, präzise, ruhig**: an engineer's quiet statement of fact. No marketing superlatives ("der beste", "marktführend", "Nr. 1", "ideal"); if the Dutch says "de beste", write a neutral, checkable statement instead and note it in `notes.claims` only if it is a factual claim.
- Headings in sentence case with normal German noun capitalisation. First paragraph answers what/for whom.
- Numbers: German format in visible text (`1.250 m³/h`, `7,5 kW`, `16 bar`), SI units. Norms precisely: DIN EN 733, ISO 5199, ISO 2858, API 610, ATEX (2014/34/EU).
- Brand and product names stay unchanged (Lowara, SAER, Flygt, Grundfos, Seepex …). "IPG" and "Industrial Pump Group" stay.
- Use the glossary below consistently.

## Glossary (Dutch/English → German)
centrifugaalpomp → Kreiselpumpe · meertrapspomp → mehrstufige Pumpe · dompelpomp → Tauchmotorpumpe · wormpomp → Exzenterschneckenpumpe · waternormpomp → Normpumpe nach DIN EN 733 · chemienormpomp → Chemienormpumpe nach ISO 5199 · canned motor pump → Spaltrohrmotorpumpe · slurrypomp → Feststoff-/Schlammpumpe · hydrofoor (unit) → Druckerhöhungsanlage · splitcase pomp → axial geteilte Pumpe · mixed flow pomp → Halbaxialpumpe · lobbenpomp → Drehkolbenpumpe · bronpomp → Brunnenpumpe / Unterwassermotorpumpe · mixers en voortstuwers → Rührwerke und Strömungserzeuger · blokpomp → Blockpumpe · inline pomp → Inlinepumpe · insteekpomp → Eintauchpumpe · membraanpomp → Membranpumpe · kunststofpomp → Kunststoffpumpe · total pump unit → Komplettaggregat · verticale turbinepomp → vertikale Turbinenpumpe · revisie → Revision / Instandsetzung · asafdichting / mechanical seal → Gleitringdichtung · kleppen en afsluiters → Armaturen und Ventile · boiler feed → Kesselspeisung · brandblus → Löschwasserversorgung · afvalwater → Abwasser · drainage → Entwässerung · koelwater → Kühlwasser · proceswater → Prozesswasser · desalinatie → Meerwasserentsalzung · bagger → Nassbaggerei · cavitatie → Kavitation · pompkromme → Pumpenkennlinie · waaier → Laufrad · behuizing → Gehäuse · opvoerhoogte → Förderhöhe · debiet → Förderstrom · rendement → Wirkungsgrad · inspectie op locatie → Inspektion vor Ort · preventief onderhoud → vorbeugende Wartung · onderdelen → Ersatzteile · offerte → Angebot · segment(en) → Branche(n) · toepassing(en) → Anwendung(en) · pompschool → Pumpenschule · kenniscentrum → Pumpenwissen · vacature → Stellenanzeige.

## SEO fields (write fresh, do not translate the Dutch ones)
- `seo_title` ≤ 60 characters, unique, main German search term first (e.g. "Kreiselpumpen: Funktion, Typen und Einsatzbereiche"). No ALL-CAPS, no brand suffix unless it fits.
- `seo_description` ≤ 155 characters, concrete, with an action ("Jetzt Angebot anfordern", "Auslegung prüfen lassen"). No quotation marks.
- Think of what a German buyer (Instandhaltungsleiter, Einkäufer, Planer) would type into Google.

## Self-check (required)
After writing your files run `npx tsx scripts/nl/validate-de.ts <id> <id> …` for your ids and fix every error until it reports `0 errors`. Warnings about word counts mean something may be missing: check them.
