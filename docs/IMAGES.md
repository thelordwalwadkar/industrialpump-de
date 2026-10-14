# Bilder und Gestaltung (14. Oktober 2026)

## Herkunft der Bilder
Alle Bilder stammen von **industrialpumps.nl** (Schwesterseite). Die Seite war am 14.10. erreichbar; die Dateien wurden im Original geladen (`assets-src/ipg-nl/`, nicht im Build) und mit `npm run images` zu WebP optimiert (`public/img/`, 46 Dateien, 0,8 MB).

Der Screaming-Frog-Crawl `IPG 25-03-25 custom search for the pages.dbseospider` enthält **keine Bild-URLs** (Bilder wurden nicht mitgecrawlt; die Custom-Search-Spalten sind nur Zähler). Er liefert aber die vollständige Liste der 1.239 Seiten-URLs; damit wurden die Serien-, Marken- und Pumpentyp-Seiten abgerufen und deren Bilder gefunden.

| Verwendung | Datei(en) |
|---|---|
| Hero und Seitenkopf | `hero.webp` (Raffinerie unter blauem Himmel), `curve.webp` (dunkelblaue Kurve für dunkle Abschnitte) |
| Logo | `logo-navy.webp` (IPG; per CSS weiß eingefärbt auf blauem Grund) |
| Serien- und Produktfotos | `products/*.webp` (aus `ProductImageLarge` des Shop-Feeds, 21 Serien) |
| Markenlogos | `brands/lowara|saer|ebara|flygt.webp` |
| Leistungs-Kacheln | `services/verkauf|revision|ersatzteile.webp` |
| Pumpentypen auf der Startseite | `types/*.webp` |

## Bewusst nicht übernommen
- **Kundenlogos** (aeb, Waternet, HVC, AkzoNobel …): ohne Freigabe der Kunden keine Referenzen behaupten.
- **VCA-/ISO-Siegel, „+30 Jahre Erfahrung“, „Officieel dealer“**: Aussagen der niederländischen Firma, für die deutsche Seite nicht belegt.
- **Foto einer Person** (Robert de Brouwer) und Chat-Widget.
- Vergleichsgrafik „Fabrikanten / Andere leveranciers“ (niederländisch, Wettbewerbsaussage).

## Rechte (bitte klären)
Produktfotos und Markenlogos gehören den Herstellern (Lowara/Xylem, SAER, Ebara, Flygt). Die Nutzung auf einer Händlerseite sollte vom Kunden bzw. den Herstellern freigegeben sein. Die Hero- und Leistungsfotos gehören IPG oder dem Bildlieferanten; Lizenz prüfen.

## Gestaltung
Nach dem Vorbild von industrialpumps.nl: Barlow (800 für Überschriften, GROSSBUCHSTABEN), Himmelblau-Hero mit weißer Schrift, gelbe Akzentlinien und gelbe Pill-Buttons mit Pfeil (`#FCC137`, Text in Marineblau statt Weiß, weil Weiß auf Gelb nur 1,6:1 erreicht), weiße Abschnitte mit Text in `#21234E`, dunkelblaue Abschnitte mit der Kurve. Alle Farben aus `src/styles/palette.json` (Hintergrund, Primär, Gelb, Himmelblau); 14 Kontrastpaare geprüft.
