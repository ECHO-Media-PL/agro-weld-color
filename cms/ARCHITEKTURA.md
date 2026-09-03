# CMS Agro-Weld — architektura

Decyzje z briefu: edytuje agencja (osobny login/hasło, bez GitHuba), publikacja od razu,
twarde limity SEO, edycja po polsku + tłumaczenie AI (najtańsza opcja), zdjęcia w repo,
budżet ≤100 zł/mies., treści muszą być w statycznym HTML (czytelne dla botów).

## Przepływ
1. Agencja edytuje w panelu (cms/ — osobna usługa web na Render, Node, ~7 USD/mies.).
2. Panel zapisuje pliki `content/*.json` (+ zdjęcia do `assets/` lub `uploads/blog/`) commitem
   do repo ECHO-Media-PL/agro-weld-color przez GitHub API (token w env).
3. Render wykrywa push → buduje statyczną stronę: `node build.js` (render.yaml: buildCommand).
4. build.js wstrzykuje treści w HTML → boty Google dostają zawsze pełny statyczny HTML.

## Źródła prawdy (content/)
- `strona-glowna.json` — teksty strony głównej; klucze = markery `data-cms="klucz"` w index.html.
- `maszyny.json` — katalog maszyn (id/slug/nazwa/opis/modele/zdjęcie); klucze `m:<id>.*`
  wstrzykiwane wszędzie, gdzie maszyna występuje (karty na stronie głównej itd.).
  build.js synchronizuje z tego legacy `seo/data-products.json`.
- `seo.json` — per strona: meta title, description, og:*, alty obrazków ({src: alt}).
- `blog/<slug>.json` — wpis: title, category, catSlug, date, read, cover(+Alt/Pad), excerpt,
  metaTitle, metaDesc, lead, bodyHtml, managed.
  `managed:true` → build generuje `blog/<slug>/index.html` z templates/blog-post.html
  (spis treści auto z `<h2 id>`), wstawia kartę w regionie `<!--CMS:POSTS-->` w blog/index.html
  i URL w regionie `<!--CMS:BLOG-->` w sitemap.xml. `draft:true` → wpis pomijany (szkic).
  Usunięcie wpisu = usunięcie JSON-a commitem (panel wysyła {path, delete:true}).
  `managed:false` → strona wpisu ręczna, build podmienia tylko meta/alty.

## Zasady
- Markery `data-cms` zostają w HTML na stałe — build podmienia innerHTML oznaczonych elementów.
- Wartości w JSON to czysty tekst (build robi escaping). bodyHtml wpisu to zaufany HTML z edytora panelu.
- Panel waliduje twarde limity: meta title ≤60, description ≤160, alt ≤125 znaków; bodyHtml
  jest czyszczony w panelu (bez script/on*/javascript:) i odrzucany serwerowo, gdy zawiera taki kod.
- Publikacje są kolejkowane serwerowo (jeden commit na raz, retry przy konflikcie refa) —
  kilka „Opublikuj" pod rząd = kolejne commity, Render sam łączy/kolejkuje deploye.
- Tłumaczenia (EN/DE/RU/FR) — pola per język w JSON, wypełniane przez AI w panelu; strona
  publikuje na razie tylko PL (wersje językowe nie są jeszcze wdrożone na żywej stronie).

## Do zrobienia (kolejne etapy)
- cms/ — serwer panelu (Express: auth, edycja JSON, upload zdjęć z kompresją, commit przez
  GitHub API, tłumaczenia przez Anthropic API), UI wg makiety `Panel CMS.dc.html`.
- Markery data-cms w maszyny/index.html (karty katalogu) — dziś maszyny wstrzykiwane tylko
  na stronie głównej.
- Liczniki na chipach kategorii bloga są statyczne — build ich nie aktualizuje (v2).
