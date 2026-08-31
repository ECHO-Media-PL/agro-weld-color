# Wdrożenie CMS — instrukcja krok po kroku (~20 min)

Wszystko klikasz raz. Potem agencja loguje się na stały adres panelu i publikuje sama.

## Krok 1 — wypchnij aktualne pliki do repo (WAŻNE: repo jest w tyle)
Repo `ECHO-Media-PL/agro-weld-color` nie ma aktualnych plików strony.
1. Pobierz z tego projektu paczkę ZIP (poproszę o to na koniec / przycisk pobierania w czacie).
2. Rozpakuj i podmień zawartość lokalnego klona repo (bez katalogu `screenshots/` — niepotrzebny na produkcji).
3. `git add -A && git commit -m "Aktualne pliki strony + CMS" && git push origin main`

Nie masz gita? Wejdź na github.com → repo → "Add file → Upload files" i przeciągnij pliki.

## Krok 2 — token GitHub dla CMS
1. github.com → Settings (Twój profil) → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
2. Nazwa: `agro-weld-cms`; Repository access: **Only select repositories** → `agro-weld-color`.
3. Permissions → Repository permissions → **Contents: Read and write**. Reszta bez zmian.
4. Wygeneruj i SKOPIUJ token (pokazuje się raz).

## Krok 3 — klucz Anthropic (tłumaczenia AI — opcjonalnie, można dodać później)
1. console.anthropic.com → utwórz konto → API Keys → Create key.
2. Doładuj minimalnie 5 USD (tłumaczenia kosztują grosze — model Haiku).
Bez klucza panel działa normalnie, tylko przycisk tłumaczeń zwróci komunikat o braku konfiguracji.

## Krok 4 — usługa CMS na Render
`render.yaml` w repo definiuje już obie usługi. Po pushu z kroku 1:
1. dashboard.render.com → New → **Blueprint** → wybierz repo `agro-weld-color` → Apply.
   (Jeśli strona już istnieje jako usługa, Render doda tylko brakującą usługę `agro-weld-cms`.)
2. Render poprosi o wartości env — wpisz:
   - `ADMIN_EMAIL` — login agencji, np. `agencja@echo-media.pl`
   - `ADMIN_PASSWORD` — silne hasło agencji (przekaż osobnym kanałem)
   - `ADMIN_USERS` — dodatkowe konta, np. Twoje konto admina:
     `twoj@mail.pl:TwojeSilneHaslo` (kilka kont oddzielasz przecinkiem:
     `a@x.pl:haslo1,b@y.pl:haslo2`). Hasło nie może zawierać przecinka.
   - `GITHUB_TOKEN` — token z kroku 2
   - `ANTHROPIC_API_KEY` — klucz z kroku 3 (albo zostaw puste)
3. Po deployu panel działa pod adresem `https://agro-weld-cms.onrender.com`.

## Krok 5 — sprawdź obieg
1. Zaloguj się do panelu → SEO podstron → zmień coś drobnego → „Opublikuj zmiany".
2. W repo pojawia się commit „CMS: aktualizacja treści…", Render przebudowuje stronę (`node build.js`).
3. Po ~2 minutach zmiana jest na agro-weld.pl. Gotowe.

## Jak to działa (w skrócie)
Panel zapisuje TYLKO pliki `content/*.json` i zdjęcia (`uploads/blog/`) — commitem do repo.
Przy każdym deployu `build.js` wstrzykuje treści w statyczny HTML (markery `data-cms`),
generuje strony nowych wpisów blogowych, aktualizuje listing bloga i sitemap.
Google zawsze dostaje pełny, statyczny HTML. Szczegóły: `cms/ARCHITEKTURA.md`.

## Koszty
- Usługa CMS (Render, plan Starter): ~7 USD/mies. (~28 zł)
- Strona statyczna: bez zmian (darmowa)
- Tłumaczenia AI: grosze (Haiku, płatność za użycie)
