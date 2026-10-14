# Annahmen, Eingaben und Grundprinzipien

Stand: 14. Oktober 2026 · Astro 7.3.8 · @storyblok/astro 10.3.2 · Node 24 · TypeScript 5.9.3 (strict)

## Fehlende Eingaben

| Erwartet | Gefunden | Folge |
|---|---|---|
| Seiten-Inventar (`inputs/*.xlsx`) | **nicht vorhanden** | Es gilt die Standard-IA aus dem Prompt (§5). Die Excel-Spaltenzuordnung (URL, Seitentyp, Eltern, Titel, Priorität, Status) kann erst festgehalten werden, wenn die Datei vorliegt. Konflikte zwischen Excel und IA sind dann hier zu protokollieren. |
| Architektur-Bild | nicht vorhanden | IA aus §5. |
| Farbpalette (Hintergrund, Primär, Overhaul) | nicht als Datei vorhanden; am 14.10. per Screenshots von industrialpumps.nl geliefert | Werte aus den Screenshots abgetastet (siehe A-08). |
| Referenzseite industrialpumps.nl | liefert von diesem Rechner HTTP 403 (festgestellt in der Vorsitzung, nicht umgangen) | Inhalte stammen aus den zwei Produkt-Arbeitsmappen in `inputs/` (siehe A-03). |
| Produktblatt für den Import | vorhanden: `IPG-Products.xlsx` (Shop-Feed, 975 Zeilen, 22 Spalten) und `Schemas Eng - CLaude.xlsx` (Spezifikationen, 975 Zeilen, 98 Spalten) | Beide werden über `ProductNumber` verbunden (975/975 Treffer, keine Namensabweichung). |

## Annahmen (A-xx)

- **A-01 Scope.** Auftrag: Infrastruktur, Inhaltsmodell, Inhaltsfluss und Schema vorbereiten; *keine* Massenseiten, *keine* Produkt-Massenanlage; **ein Vorlagen-Produkt je Serie**. Umgesetzt: Startseite, 2 Hubs (`/pumpen`, `/pumpen/marken`), 4 Markenseiten, 21 Serienseiten, 21 Vorlagen-Produkte, `/angebot`, `/kontakt` (Ziel jeder Konversion) und 3 Rechtstext-Gerüste (gesetzlich vor dem Livegang nötig, nur Platzhalter). Die Templates T3, T7–T12 sind gebaut und mit Fixtures getestet, es gibt dafür noch **keine** Inhaltsseiten.
- **A-02 Marken.** Nur die vier Marken mit Produktdaten haben Seiten (Lowara, SAER, Ebara, Flygt). Die übrigen 16 Marken aus dem Prompt (Netzsch, Grindex, Vogel, Grundfos, Wilo, Düchting, Sulzer, HOMA, Goulds, Varisco, Metso, Sterling SIHI, Fybroc, Xylem, Safco, Seepex) haben keine Daten und wurden nicht angelegt.
- **A-03 Inhaltsquelle.** Auf Anweisung („bestehende Inhalte übersetzen“) wurden die englischen Produkttexte der alten Seite übersetzt. Das hebt die Regel des Prompts „Referenzseite nie übersetzen“ für diese Texte auf. Die Texte wurden **sachlich umgeschrieben**, Superlative und Widersprüche zu den Produktdaten entfernt (Liste: `docs/CLAIMS-TO-VERIFY.md`).
- **A-04 Serien.** Serie = Produktgruppe (`PrimaryGroup`) des Shops: 21 Gruppen. SAER „M“ (7 Artikel) enthält im Feed auch die Druckerhöhungsanlagen „TR“; diese sind als eigene Serie `tr-serie` abgetrennt. Serien-Slug: `{name}-serie` (z. B. `jex-jesx-serie`).
- **A-05 Artikelnummer.** URL, SKU und MPN = Modellbezeichnung des Herstellers (`ProductName`, z. B. `DIWA 07/B` → `diwa-07-b`), wie im Muster-Beispiel. Die interne Shop-Nummer steht im Feld `internal_item_number` und wird nicht ausgespielt. Eine echte Kollision (`DOMO 20VXT/B`, zwei Artikel) löst die Shop-Nummer als Zusatz auf; protokolliert im Importbericht.
- **A-06 Preise.** `ProductPrice` stammt aus dem niederländischen Shop (Währungsbasis, MwSt., Gültigkeit unbekannt): nicht importiert, kein `offers`-Schema.
- **A-07 Seitenname.** „Industrial Pump Group“ als Anzeigename (Schwestermarke). Juristischer Name, Anschrift usw. sind Platzhalter. **Bitte bestätigen.**
- **A-08 Farben.** Aus zwei Screenshots der niederländischen Seite pixelgenau abgetastet: Hintergrund Weiß `#FFFFFF`, **Primär Marineblau `#21234E`** (Logo, Überschriften), **Overhaul Gelb `#FCC137`** (Buttons, Akzentlinien). Die Zuordnung Gelb = Revision ist unsere Wahl (hebt den Bereich klar ab); ebenfalls zur Wahl stünde Hellblau `#A0D3EE` (Suchbutton) oder Himmelblau `#0984C2` (Foto-Hintergrund, kein flacher Farbwert). Abgeleitete Töne und Text-auf-Farbe-Paare werden in `scripts/build-tokens.ts` berechnet und gegen WCAG AA geprüft (13 Paare, 0 Fehler). Ändern: `src/styles/palette.json`, dann `npm run tokens`. **Bitte vom Kunden bestätigen lassen.**
- **A-09 Hosting.** Statisches Hosting (Netlify, Cloudflare Pages oder Vercel), kein Adapter. Der Editor-Vorschau-Build (`npm run build:preview`) nutzt `@astrojs/node`. `build.format = 'file'`, `trailingSlash = 'never'`: kanonische URLs ohne Schrägstrich.
- **A-10 Storyblok live ungetestet.** Es gibt keinen Space und kein Token. Ohne Token liest die Seite die Seed-Stories aus `storyblok/content/` (gleiche Struktur wie die CDN-API). `sb:push`, `sb:seed` und `import:apply` sind geschrieben, aber nie gegen einen echten Space gelaufen.
- **A-11 Umrechnungen.** Erlaubt und dokumentiert: l/s → m³/h (×3,6), kPa → bar (÷100), Dezimalkomma, Einheitenschreibweise. Nichts wird geschätzt; leere Zellen bleiben leer.
- **A-12 Spannungs-Filter.** `230/400 V` wird gesetzt, wenn die Daten „230/400“ nennen oder Variante 1 = 22x V und Variante 2 = 38x–415 V; sonst `230 V` oder `400 V` aus dem Feld „Voltage“.
- **A-13 TypeScript 5.9.3** statt 7.x, damit `astro check` sicher läuft.
- **A-14 Händlerstatus.** Wird nirgends behauptet (`authorised_dealer_brands` in der Config ist leer).
- **A-15 Datumsangaben im Schema.** `datePublished`/`dateModified` stammen aus den Storyblok-Zeitstempeln. In den lokalen Seeds gibt es keine, daher keine Daten (statt erfundener).
- **A-16 Ausgeblendete Ziele.** Karten, Teaser und Links auf noch nicht vorhandene Seiten (Pumpentypen, Branchen, Anwendungen, Referenzen, Pumpenschule) werden automatisch ausgeblendet und erscheinen, sobald die Seite existiert. Der Revision-Teaser verweist bis zur Seite `/revision` auf `/angebot?anliegen=revision`.
- **A-17 Wortzahlen.** Marken-Seiten mit wenigen Serien (Flygt: 1 Serie) und die zwei Hubs liegen unter den Zielwerten (§8). Auffüllen wäre nur mit erfundenen Fakten möglich. Siehe `docs/PAGE-INVENTORY.md`.
- **A-18 Bilder.** Originale von industrialpumps.nl, optimiert unter `public/img/` (lokal gehostet, nicht in Storyblok-Assets); der alte Pfad steht zusätzlich in `image_source`. Siehe `docs/IMAGES.md` (Herkunft, Ausschlüsse, offene Rechtefragen).
- **A-19 Cookie-Hinweis.** Speichert die Wahl in `localStorage`; es werden aktuell keine optionalen Inhalte geladen.

## Grundprinzipien (Schritt zurück)

1. **Eine Quelle für URL, Ordner und Brotkrumen:** der `full_slug`. Nichts davon wird von Hand geschrieben; fehlt eine Zwischenebene, bricht der Build.
2. **Ein Template kennt keine Marke, Serie oder Seite.** Unterschiede kommen nur aus Inhaltsfeldern.
3. **Nur bekannte Werte werden ausgegeben.** Unbekanntes wird weggelassen, nie als 0 oder leer.
4. **Behauptungen brauchen einen Beleg** (Produktdaten, Kundenangabe) oder bleiben Platzhalter; Platzhalter erscheinen sichtbar und nie im Schema.
5. **Schema wird aus denselben Daten wie der sichtbare Text gebaut** und gegen ihn geprüft (Brotkrumen, Artikelnummer, FAQ).
6. **Interne Links werden abgeleitet** (Ordnerbaum + gemeinsame Taxonomie), nicht gepflegt. Links auf nicht vorhandene Seiten gibt es nicht.
7. **Produktdaten laufen durch eine Pipeline** (Mapper → Seed/Import → Seite), die für Muster und Vollimport identisch ist.
8. **Jede Regel ist ein Build-Gate:** Kontrast, Titel/Beschreibung-Länge, Eindeutigkeit, Schema, Links, Verwaiste Seiten.
9. **Farben nur aus drei Kundenwerten**, alles andere abgeleitet und kontrastgeprüft.
10. **Ohne Zugangsdaten baubar:** Der Build braucht weder Storyblok noch Netz.

## Klarheits-Check (§15)

Ein Entwickler könnte den Auftrag **nicht** ohne Rückfrage identisch bauen. Stellen mit mehr als einer sinnvollen Lesart und die gewählte Lesart:

| Punkt | Gewählt |
|---|---|
| „Do not make web pages“ vs. Phase 4 (alle Nicht-Produktseiten) | Nur Struktur, Marken, Serien, 1 Muster-Produkt je Serie, Konversion, Rechtsgerüste (A-01) |
| „Referenzseite nie übersetzen“ vs. „bestehende Inhalte übersetzen“ | Anweisung des Nutzers gewinnt, Texte werden umgeschrieben (A-03) |
| „Artikelnummer“ = Modellname oder Shop-Nummer | Modellname (A-05) |
| Serie ohne Excel-Definition | Produktgruppe des Shops (A-04) |
| Organization/WebSite auf jeder Seite „als Referenz“ | Volle Knoten nur auf der Startseite, sonst `@id`-Verweise; die Prüfung löst `@id` auch seitenübergreifend auf |
| `hasOfferCatalog`, `CourseInstance`, `variesBy` | Nicht ausgegeben, solange keine strukturierten Echtdaten existieren |
| Pagination für Listen | Umgesetzt als `{slug}/seite/{n}`, getestet nur mit Fixtures |
| Markenseiten für 16 Marken ohne Daten | Nicht angelegt (A-02) |
