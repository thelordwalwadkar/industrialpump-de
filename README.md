# industrialpumpgroup.de · Astro + Storyblok

Deutsche B2B-Pumpenseite: Marke → Serie → Artikel, ein Template je Seitentyp, JSON-LD auf jeder Seite, interne Links aus Ordnerbaum und Taxonomie abgeleitet.

**Start:** `docs/PROGRESS.md` (Stand und Gates), `docs/ASSUMPTIONS.md` (Annahmen, Prinzipien), `docs/PLACEHOLDERS.md` (offene Kundenangaben).

```bash
npm install
npm run dev              # lokal (baut Tokens, liest storyblok/content/*.json)
npm run build            # Build + automatische Prüfungen (Schema, Links, SEO)
npm run check            # TypeScript/Astro-Check (strict, schema-dts)
npm run validate         # JSON-LD-Validator über dist/
npm run check:site       # Titel, Meta, H1, Links, Waisen, Englisch-Scan; schreibt docs/PAGE-INVENTORY.md + LINKING-MAP.md
npm run test:fixtures    # alle 14 Templates aus Fixtures bauen und prüfen
npm run verify:model     # Gate 2: Storyblok-Modell
npm run sb:components    # storyblok/components/*.json neu schreiben
npm run sb:push          # Plan; mit -- --apply Komponenten in den Space schreiben
npm run sb:seed          # Plan; mit -- --apply Stories anlegen/aktualisieren (idempotent)
npm run content:generate # storyblok/content/*.json aus Arbeitsmappen + content-src/copy.ts erzeugen
npm run import:dry       # Produktimport prüfen (975 Zeilen), schreibt docs/import-report.md
npm run import:apply     # Produkte als Entwürfe anlegen (braucht Token)
npm run build:preview    # SSR-Build für den Visual Editor (PREVIEW=1, braucht STORYBLOK_PREVIEW_TOKEN)
```

## Aufbau

- `src/lib/` Quelle der Wahrheit: `storyblok.ts` (Laden, lokal oder live), `routing.ts`, `breadcrumbs.ts`, `seo.ts`, `linking.ts` (interne Links), `taxonomy.ts`, `schema/` (ein Builder je Template).
- `src/templates/` T1–T14, `src/storyblok/` Bloks, `src/components/` UI.
- `scripts/lib/` Produkt-Pipeline (`catalogue.ts`, `spec-map.ts`, `de-vocab.ts`, `stories.ts`).
- `content-src/copy.ts` deutsche Marken- und Serientexte.
- Farben: nur `src/styles/palette.json` (3 Werte) → `npm run tokens`.

## Ohne Storyblok-Token

Ohne `STORYBLOK_TOKEN` baut die Seite aus den lokalen Seeds. Mit Token liest sie live (EU-Region). Beides liefert dieselbe Story-Struktur.

## Veröffentlichen
Siehe `docs/DEPLOY.md`: GitHub Actions bauen die Seite, veröffentlichen sie auf GitHub Pages (Test-Link, noindex) und legen ein Docker-Image in der GitHub Container Registry ab. `Dockerfile` und `nginx.conf` liegen im Projektordner.
