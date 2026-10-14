# Fortschritt und Gates (14. Oktober 2026)

| Phase | Gate | Ergebnis | Versuche |
|---|---|---|---|
| 0 Vorbereitung | Inventar eingelesen, jede Zeile einem Template zugeordnet | **Teilweise**: Es gibt kein Inventar (Excel fehlt). Standard-IA aus dem Prompt, alle Seiten T1–T14 zugeordnet. Siehe ASSUMPTIONS.md | 1 |
| 1 Gerüst | `npm run build` auf leerer Seite | **Bestanden** (nach Korrektur des Storyblok-Imports) | 3 |
| 2 Storyblok-Modell | Pflichtfelder je Template, Filterfelder numerisch/Optionsliste | **Bestanden**: `npm run verify:model` (35 Komponenten, 15 Inhaltstypen) | 1 |
| 3 Templates, Schema | jedes Template aus Fixture, Validator ohne Fehler | **Bestanden**: 16 Fixture-Stories, 72 Seiten, 0 Schema-Fehler. Der Validator fand dabei 3 echte Fehler (fehlende Zeitstempel, doppelte Meta-Beschreibung auf Seite 2 einer Liste, Revision-Akzent nur pfadabhängig) | 3 |
| 4 Inhalte | Rubrik an 20 % der Seiten | **Bestanden mit Abweichungen**: Stichprobe (Marke, Serien, Produkte, Hubs, Kontakt) gelesen; Wortzahlen unter Ziel bei 2 Hubs und Flygt (A-17) | 2 |
| 5 Produkte | Muster-Produkte, URL-Muster, Dry-run | **Bestanden**: 21 Muster-Produkte, URLs `/pumpen/marken/{marke}/{serie}/{artikel}`, Dry-run über alle 975 Zeilen: **0 blockierende Fehler**, 896 Warnungen (fehlende Werte, werden weggelassen). `--apply` **nicht** ausgeführt | 1 |
| 6 Integration, QA | Erfolgskriterien §2 | **Bestanden außer Punkten unten** (nach Farbwechsel erneut gebaut und validiert; dabei Button-Kontrast im Header korrigiert) | 2 |

## Messwerte

- `npm run build`: 55 Seiten, 0 Fehler. `astro check`: 0 Fehler, 0 Warnungen (strict, inkl. schema-dts-Typen).
- Nach jedem Build laufen automatisch (`postbuild`): JSON-LD-Validator (54 Seiten, 0 Fehler) und Site-Prüfung (Titel ≤ 60, Beschreibung ≤ 155, genau ein H1, eindeutige Titel/Beschreibungen, 0 defekte interne Links, 0 verwaiste Seiten, Elternlink, Konversionslink, kein englischer Text).
- Kontrast: 13 Paare, alle ≥ AA (`.reports/contrast.json`).
- Lighthouse mobil nach dem Redesign mit Fotos (lokal, schwacher Rechner): Startseite, Marke, Serie und Produkt je **99 / 100 / 100 / 100** (Performance / Barrierefreiheit / Best Practices / SEO). Werte schwanken um wenige Punkte.
- 360 px: kein seitliches Scrollen (geprüft auf Produkt-, Marken-, Serien-, Angebots- und Datenschutzseite). Tabellen scrollen im eigenen Container.

## Seiten je Template

T1 Startseite 1 · T2 Hub 2 · T3 Thema 0 · T4 Marke 4 · T5 Serie 21 · T6 Produkt 21 · T7–T12 0 (nur Fixtures) · T13 Kontakt/Angebot 2 · T14 Recht 3 = **54** (+ 404).

## Nicht erfüllt / nicht verifiziert (ehrlich)

1. **Kein echter Storyblok-Space getestet.** `sb:push`, `sb:seed`, `import:apply` und der Vorschau-Build mit Visual Editor sind ungetestet.
2. **Farben** stammen aus Screenshots von industrialpumps.nl (Marineblau, Gelb, Weiß), nicht aus einer Freigabe des Kunden; Zuordnung Gelb = Revision ist unsere Wahl.
3. **Wortzahlen** unter dem Ziel: `/pumpen` (≈ 250), `/pumpen/marken`, Marke Flygt (1 Serie).
4. **Kein Seiten-Inventar (Excel)**: Konflikte können erst geprüft werden, wenn es vorliegt.
5. **Texte nicht von Muttersprachlern geprüft**; Aussagen zur Fachlichkeit siehe `docs/CLAIMS-TO-VERIFY.md`.
6. **Bilder, Datenblätter und Kennlinien fehlen** (keine Dateien); die Seiten zeigen Platzhalter bzw. blenden Downloads aus.
7. **Formular sendet nichts** (`PUBLIC_FORM_ENDPOINT` leer, Stub); die Seite sagt das ehrlich.
8. **Lighthouse nur auf einem Rechner** mit schwacher CPU gemessen; `content-visibility: auto` für Abschnitte unterhalb des sichtbaren Bereichs wurde zur Performance genutzt (Google indexiert solche Inhalte; reine `innerText`-Auszüge im Browser lassen sie aus).

## Offene Kundenangaben

Vollständige, automatisch erzeugte Liste: [`PLACEHOLDERS.md`](PLACEHOLDERS.md). Kurzfassung: juristischer Firmenname, Rechtsform, Anschrift, Telefon, E-Mail, Öffnungszeiten, USt-IdNr., Handelsregister, Geschäftsführer, Datenschutz-Angaben (Verantwortlicher, Hoster, Speicherdauer, Aufsichtsbehörde), AGB-Texte, Lieferzeiten je Marke/Serie, Bestätigung der Farben, Seiten-Inventar, Bestätigung des Anzeigenamens „Industrial Pump Group“.
