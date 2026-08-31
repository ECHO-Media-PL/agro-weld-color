# Wdrożenie SEO — pokrycie kryteriów akceptacji

Źródło wymagań: „Wytyczne techniczne SEO — renderowanie stron sekcji Maszyny" (09.07.2026).

## Zawartość pakietu (statyczne pliki, 1:1 pod SSR)

- Hub katalogu — `maszyny/index.html` (A.2)
- 10 stron kategorii — `maszyny/{slug}/index.html` (A.2, A.4)
- 24 strony produktowe — `maszyny/{slug-produktu}/index.html` (B.2, B.4)
- Sitemapa — `sitemap.xml` (A.3 pkt 10, B.3 pkt 15)
- Mapa 301 + kod Express — `seo/przekierowania-301.md` (A.3 pkt 8, B.3 pkt 14)

## Kryteria akceptacji — status

- [x] Pełna treść w HTML bez JavaScript: title, meta description, H1, opisy, listy maszyn — wpisane statycznie w każdy plik
- [x] Unikalny `<title>` i `<meta name="description">` na każdej z 35 stron
- [x] Czyste adresy `/maszyny/{slug}/` — bez `?cat=` i bez hash ID (struktura katalogów = docelowe URL-e)
- [x] `<link rel="canonical">` na każdej stronie
- [x] Zdjęcie w `<img>` z atrybutem `alt` na każdej stronie produktowej (nie tło CSS)
- [x] JSON-LD: `Product` + `BreadcrumbList` (produkty), `ItemList` + `BreadcrumbList` (kategorie)
- [x] Linki wewnętrzne (kafle strony głównej, katalog, chipy filtrów) wskazują nowe adresy bez przekierowań pośrednich
- [x] `sitemap.xml` z kompletem 36 adresów
- [ ] **Serwer (Echo Media):** serwowanie plików pod czystymi URL-ami, przekierowania 301, prawdziwe 404, przesłanie sitemapy w GSC
- [ ] **Content:** rozszerzone opisy kategorii 400–600 słów — miejsca oznaczone komentarzem `[SEO]` w plikach

## Weryfikacja (Część III spec)
1. `curl -A "Mozilla/5.0" {url}` — treść widoczna bez JS (pliki w pełni statyczne)
2. GSC → Kontrola adresu URL: „Kod HTML" = „Wyświetlona strona"
3. Screaming Frog z wyłączonym JS — pełna treść na wszystkich adresach
