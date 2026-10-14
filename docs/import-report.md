# Product import report

Mode: **dry run (nothing written)** · rows checked: **975** · batch size: 50

- Blocking errors: **0**
- Warnings (value omitted from page, never written as 0): **896** on 356 rows
- Slug collisions resolved by appending the product number: **1**

## Result per series

| Series | Rows | With flow + head + power | Rows with warnings |
|---|---|---|---|
| Lowara SV | 239 | 132 | 107 |
| Lowara HM | 208 | 135 | 73 |
| Lowara ESH | 168 | 113 | 55 |
| Lowara CEA | 45 | 28 | 17 |
| Lowara BG | 7 | 2 | 5 |
| Lowara DOC | 4 | 4 | 0 |
| Lowara DOMO | 20 | 20 | 0 |
| Lowara DIWA | 13 | 13 | 0 |
| SAER IR | 60 | 60 | 30 |
| SAER IR-M | 62 | 62 | 30 |
| SAER IRX | 62 | 62 | 26 |
| SAER M | 7 | 7 | 0 |
| SAER TR | 3 | 1 | 2 |
| Flygt Ready | 6 | 0 | 6 |
| Ebara Optima | 3 | 3 | 0 |
| Ebara Best One | 5 | 5 | 1 |
| Ebara DW | 22 | 22 | 0 |
| Ebara CDX | 12 | 11 | 1 |
| Ebara DWO | 6 | 6 | 0 |
| Ebara JEX/JESX | 14 | 12 | 3 |
| Ebara AGA/AGC | 9 | 9 | 0 |

## Warning types

- 268 × no head
- 262 × no flow range
- 255 × no motor power
- 55 × head conflict
- 53 × dimensions given as drawing letters (JSON) - omitted, see datasheet
- 2 × untranslated value [Shaft material]
- 1 × degree of protection incomplete

## Untranslated values (kept verbatim; add to scripts/lib/de-vocab.ts)

- untranslated value [Shaft material]: "AISI 303 (wet extension)" (2×)

## Slug collisions

- slug collision in lowara-domo: "DOMO 20VXT/B" (26-107670190R) vs "DOMO 20VXT/B (26-107670190)" → "domo-20vxt-b-26-107670190r"

## Blocking errors

- none

## Not imported by design

- **Prices** (`ProductPrice` in the NL shop feed): validity, currency basis and VAT for the German market are unknown. No `offers` schema is produced until a real price is supplied.
- **Marketing USPs** of the old shop (e.g. "Trustworthy", "Fast delivery"): unverifiable, not imported.
- **HS code, country of origin, related-product ids**: not technical data; available in `inputs/` if needed later.
- **Images**: only the old shop image path is stored in `image_source`; the files must be uploaded to Storyblok assets.
