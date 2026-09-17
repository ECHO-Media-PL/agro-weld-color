# Decyzje po audycie SEO (16.09.2026)

Audyt: `uploads/Agro-Weld_audyt_SEO_migracja_dane_v2.xlsx`. Numeracja wg listy ustaleń z klientem.

| # | Sprawa | Decyzja | Status wdrożenia |
|---|---|---|---|
| 1 | Wersja kanoniczna domeny | `https://www.agro-weld.pl` (zgodnie z buildem) | Render sam przekierowuje: dodanie domeny `www` tworzy regułę z domeny głównej na `www`, a HTTP na HTTPS działa automatycznie. Do wykonania w panelu Render + DNS. |
| 2 | `/finansowanie` | 301 na `/kontakt/` | Wdrożone (`render.yaml`) |
| 3 | Wersja EN | W planie; do czasu wdrożenia `/en` → `/`, `/images/AgroWeldENG.pdf` → `/do-pobrania/` | Wdrożone (`render.yaml`) |
| 4 | Realizacje i układy linii | Odtworzymy realizacje; materiały od klienta | Wdrożone 17.09.2026: 9 realizacji z treścią, zdjęciami (43 pliki w `assets/realizacje/`) i filmami YouTube od klienta. Łącznie 13 realizacji. Przekierowania starych adresów uzupełnione (`render.yaml`, `content/przekierowania.json`), sitemap zaktualizowana |
| 5 | Title / H1 / description | Wg propozycji SEO (kolumny „Propozycja…" w arkuszu On-page) | Wdrożone: 54 title, 10 description, H1 produktów z modelami, „borówka" w H1 i leadzie sortownika dwubębnowego |
| 6 | Schema Product | Bez ceny, tylko dostępność („na zamówienie") | Wdrożone (`offers` z `availability: InStock`, `priceCurrency: PLN`, bez wartości) |
| 7 | Formularze | Realna wysyłka serwerowa | Wdrożone: endpoint `POST /api/form` w serwisie CMS + `assets/form.js`. Wymaga ustawienia `RESEND_API_KEY` i `FORM_FROM` w Render. |
| 8 | Formator palet | Zostaje w `/maszyny/pakowanie/formatory-palet/` (wytyczna klienta) | Bez zmian; wytyczne copy do aktualizacji |
| 9 | Przenośnik z przegrodami | 301 na przenośniki taśmowe poziome | Wdrożone (`render.yaml`) |
| 10 | Przekierowania na Render | Reguły w `render.yaml`; `?cat=` obsłużone skryptem na `/maszyny/` | Wdrożone: 60 reguł + skrypt |
| 11 | Treści produktowe | Wg plików wytycznych od klienta | Komplet — część 2 wdrożona 17.09.2026 (10 produktów: Selekcja, Ważenie i liczenie, Pakowanie). Szczegóły niżej. |

### Uwagi do części 2 (do potwierdzenia przez Agro-Weld)

Źródło: `uploads/Agro-weld_opisy katalog_sierpień 2026.docx` (tekst: `uploads/opisy-katalog.txt`). Wdrożone dla każdego z 10 produktów: meta title/desc, H1, lead, 6 sekcji „O maszynie", 5 FAQ, CTA z linkowaniem wewnętrznym.

- Znaczniki `[DO UZUPEŁNIENIA PRZEZ AGRO-WELD]` z dokumentu usunięte, zdania dokończone neutralnie: liczba stanowisk przy stole SST, tolerancja ważenia wagoworkownicy, wymagania wentylacyjne raszlownicy, lista modeli kompatybilnych z RA-PP-00. Po otrzymaniu danych warto uzupełnić konkretami.
- Rozbieżności danych technicznych między dokumentem SEO a kartami katalogowymi — **zostawiono wartości z katalogu**: liczarka pobór mocy (katalog 1,5 kW / dokument 0,55 i 1,1 kW), napełniacz NK-2 (katalog 0,75 kW / dokument 1,5 kW), przenośnik RA-PP-00 (dokument podaje 0,55 kW, karta nie podaje). Do decyzji, która wersja jest prawidłowa.

## Czego Render nie zrobi (ustalenia techniczne)

- Reguły przekierowań dopasowują wyłącznie ścieżkę — query string (`?cat=`) jest ignorowany, niezależnie od planu. Dlatego stare adresy kategorii obsługuje skrypt w `<head>` na `/maszyny/`, który podmienia adres na nowy (`location.replace`).
- Render nie stosuje reguły, jeśli pod danym adresem istnieje plik. Dlatego warianty bez końcowego ukośnika (`/kontakt`) i `/index.html` nadal zwracają 200 — zabezpiecza je tag canonical. Twardy 301 wymagałby warstwy przed serwisem (np. Cloudflare) albo serwisu Node.
- `http → https` oraz domena główna → `www` działają po stronie Render automatycznie po dodaniu domeny `www.agro-weld.pl` w panelu.

## Konfiguracja wysyłki formularzy

Serwis `agro-weld-cms` (Render), zmienne środowiskowe:

- `RESEND_API_KEY` — klucz API dostawcy wysyłki (resend.com),
- `FORM_FROM` — adres nadawcy zweryfikowanej domeny, np. `Formularz Agro-Weld <formularz@agro-weld.pl>`,
- `FORM_TO` — odbiorca zapytań (domyślnie `biuro@agro-weld.pl`).

Endpoint: `POST https://agro-weld-cms.onrender.com/api/form`. Zabezpieczenia: CORS tylko dla domen Agro-Weld, pole-pułapka na boty, limit 10 zapytań na godzinę z jednego IP. Bez klucza API endpoint zwraca błąd i loguje treść zapytania — przed migracją trzeba go ustawić i przetestować.
