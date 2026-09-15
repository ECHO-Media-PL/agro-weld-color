repo: ECHO-Media-PL/agro-weld-color
branch: main

## Last sync
date: 2026-09-15T17:03:47Z
### Updated in this project
- Brak zmian do pobrania — repo `main` odpowiada stanowi projektu (migracja builda do `dist/` jest już w repo: `build.js` z `OUT = 'dist'`, `GENERATED_SUBTREES`, `render.yaml` ze `staticPublishPath: dist`)
- Zweryfikowano, że wygenerowane katalogi HTML (`maszyny/<kat>/`, `maszyny/<kat>/<produkt>/`, `blog/<slug>/`, `realizacje/<slug>/`) nadal są commitowane w repo — build ich nie kopiuje, więc są już tylko martwymi artefaktami do usunięcia
- Otwarta kwestia: `/maszyny/paletyzacja/` ma w repo ręczne bloki (hero CTA, „Modele Verbruggen", „Zabezpieczanie ładunku"), których nie ma w `content/kategorie.json` ani w `templates/kategoria.html` — build wygeneruje wersję uboższą

## Screen map
| Ekran w projekcie | Pliki w repo |
|---|---|
| index.html (strona główna) | index.html, content/strona-glowna.json, content/seo.json |
| maszyny/index.html (listing) | maszyny/index.html, content/maszyny.json, templates/listing.render.js |
| maszyny/<kategoria>/ | content/kategorie.json, templates/kategoria.html, templates/kategoria.render.js |
| maszyny/<kategoria>/<produkt>/ | content/produkty.json, templates/produkt.html, templates/produkt.render.js, templates/_produkt-body.html |
| blog/ + blog/<slug>/ | blog/index.html, content/blog/*.json, templates/blog-post.html |
| realizacje/ + realizacje/<slug>/ | content/realizacje.json, templates/strony.render.js |
| Strony statyczne (kontakt, o-firmie, do-pobrania, linie-produkcyjne, rozwiazania-specjalne, polityka-prywatnosci) | odpowiednie `<katalog>/index.html` + content/seo.json |
| Panel CMS.dc.html | cms/server.js, cms/public/index.html |
| Kosz-przyjeciowy.dc.html | Kosz-przyjeciowy.dc.html |
| Generator / publikacja | build.js, render.yaml, robots.txt, sitemap.xml |

## Sync history
### 2026-08-31T13:07:13Z
- Zbudowano system CMS: markery data-cms w HTML, content/*.json, build.js (buildCommand na Render), szablon wpisu blogowego
- Panel CMS: cms/server.js + cms/public/index.html (osobna usługa Render, commity przez GitHub API)
- render.yaml: dodano usługę agro-weld-cms i buildCommand
- Repo było w tyle za projektem — wymagało pushu aktualnych plików (instrukcja: cms/WDROZENIE.md)
