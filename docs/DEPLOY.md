# Veröffentlichen (GitHub, Docker, Link)

## Was automatisch passiert (GitHub Actions, nach dem Hochladen)
| Workflow | Wirkung |
|---|---|
| `ci.yml` | Jeder Push: Typprüfung, Build mit Schema-/Link-/SEO-Prüfung, Template-Tests |
| `pages.yml` | Push auf `main`: baut die Seite und veröffentlicht sie auf **GitHub Pages** → öffentlicher Link `https://<benutzer>.github.io/<repo>/` (Test-Link, **nicht indexierbar**) |
| `docker.yml` | Push auf `main`: baut das Docker-Image und legt es in der GitHub Container Registry ab: `ghcr.io/<benutzer>/<repo>:latest` |

Einmalig im Repo: **Settings → Pages → Source: „GitHub Actions“** wählen.

## Docker lokal oder auf einem Server
```bash
docker run -p 8080:8080 ghcr.io/<benutzer>/<repo>:latest     # dann http://localhost:8080
docker build -t industrialpump-de .                            # selbst bauen (Test-Build, noindex)
docker build -t industrialpump-de --build-arg PUBLIC_STAGING=0 --build-arg PUBLIC_SITE_URL=https://industrialpumpgroup.de .   # Produktion
```
Das Image ist ein schlanker nginx (Port 8080, ohne Root-Rechte) mit sauberen URLs, deutscher 404-Seite und Caching.

## Test-Link vs. echte Domain
Alle öffentlichen Test-Builds setzen `PUBLIC_STAGING=1`: `noindex` auf jeder Seite und `Disallow: /` in der robots.txt. Für die echte Domain: `PUBLIC_STAGING=0`, `PUBLIC_SITE_URL=https://industrialpumpgroup.de`, kein `PUBLIC_BASE_PATH`.

## Nicht im Repository (bewusst)
`assets-src/` (Originalbilder von industrialpumps.nl) und `inputs/` (Produkt-Arbeitsmappen mit Preisen). Die fertigen Seiten-Inhalte (`storyblok/content/`) und optimierten Bilder (`public/img/`) sind enthalten. `npm run content:generate` und `npm run images` brauchen die ausgeschlossenen Dateien und laufen daher nur lokal.

## Vor dem öffentlichen Link bedenken
- Die Seite enthält sichtbare Platzhalter ([[PLATZHALTER: …]]) und Rechtstext-Entwürfe: nur als Test, nicht als Livegang.
- Produktfotos und Markenlogos der Hersteller und die Fotos von industrialpumps.nl: Nutzungsrechte klären (`docs/IMAGES.md`).
