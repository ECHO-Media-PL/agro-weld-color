# Mapowanie URL-i: stary → nowy serwis

Domena bez zmian (`agro-weld.pl`). Źródło: `uploads/Agro-Weld_mapa-serwisu-20027393.xlsx` — mapa starego serwisu, 86 adresów.
Źródło prawdy w formie danych: `content/przekierowania.json`. Gotowe reguły dla Render: `content/przekierowania.render.yaml.txt`.

Przekierowania jako **301** (trwałe). Wiersze z `—` w kolumnie „Nowy adres" nie mają odpowiednika w nowym serwisie — do decyzji pozycjonerów.

## Strony główne i informacyjne

| Stary adres | Nowy adres | Typ | Uwagi |
|---|---|---|---|
| `/` | `/` | — | Strona główna — bez zmian |
| `/finansowanie` | — | — | Brak odpowiednika w nowym serwisie — do ustalenia przez pozycjonerów |
| `/katalog` | `/do-pobrania/` | 301 | Katalogi i materiały PDF są teraz w „Do pobrania” |
| `/kontakt` | `/kontakt/` | 301 | Tylko dodany ukośnik |
| `/o-firmie` | `/o-firmie/` | 301 | Tylko dodany ukośnik |
| `/polityka-prywatnosci` | `/polityka-prywatnosci/` | 301 | Tylko dodany ukośnik |

## Maszyny — listing

| Stary adres | Nowy adres | Typ | Uwagi |
|---|---|---|---|
| `/maszyny/` | `/maszyny/` | — | Listing maszyn — bez zmian |
| `/maszyny` | `/maszyny/` | 301 | Już przekierowane na starym serwisie |

## Maszyny — karty produktów

| Stary adres | Nowy adres | Typ | Uwagi |
|---|---|---|---|
| `/maszyny/bufor-do-sortowania/67cdeb15799068ebb64efde8/` | `/maszyny/pakowanie/bufor-do-pakowania/` | 301 | PRZYBLIŻENIE: nowa nazwa „Bufor do pakowania” |
| `/maszyny/czyszczarka-do-imbiru-lub-chrzanu/697c788bfd4fc91bf9d751b9/` | `/maszyny/oczyszczanie/czyszczarka-do-imbiru-i-chrzanu/` | 301 |  |
| `/maszyny/czyszczarka-szczotkowa/67cde010799068ebb64efde2/` | `/maszyny/oczyszczanie/czyszczarka-szczotkowa/` | 301 |  |
| `/maszyny/dwubębnowy-sortownik-do-owoców-drobnych/67d05050a60f9ebfefd3a472/` | `/maszyny/sortowanie/dwubebnowy-sortownik-do-owocow-drobnych/` | 301 | Nowy slug bez polskich znaków |
| `/maszyny/formatory-palet/697b8b67b218f4072882f3fd/` | `/maszyny/pakowanie/formatory-palet/` | 301 | Przeniesione z paletyzacji do kategorii Pakowanie |
| `/maszyny/kalibrownik-rozsuwany/67cde69c799068ebb64efde4/` | `/maszyny/sortowanie/kalibrownik-rozsuwany/` | 301 |  |
| `/maszyny/kosz-przyjęciowy-kp1000/67cf16f2593631ce8409a954/` | `/maszyny/przyjecie-i-buforowanie/kosze-przyjeciowe/#kp1000` | 301 | Modele KP to teraz sekcje jednej karty |
| `/maszyny/kosz-przyjęciowy-kp1500/67cf195f593631ce8409a956/` | `/maszyny/przyjecie-i-buforowanie/kosze-przyjeciowe/#kp1500` | 301 | Sekcja karty koszy |
| `/maszyny/kosz-przyjęciowy-kp2000/67cf1cd8593631ce8409a958/` | `/maszyny/przyjecie-i-buforowanie/kosze-przyjeciowe/#kp2000` | 301 | Sekcja karty koszy |
| `/maszyny/kosz-przyjęciowy-kp3000/67cf1eea593631ce8409a95a/` | `/maszyny/przyjecie-i-buforowanie/kosze-przyjeciowe/#kp3000` | 301 | Sekcja karty koszy |
| `/maszyny/kosz-przyjęciowy-kp5000g/67cf24b6593631ce8409a95e/` | `/maszyny/przyjecie-i-buforowanie/kosze-przyjeciowe/#kp5000g` | 301 | Sekcja karty koszy |
| `/maszyny/kosz-przyjęciowy-kps3000g/67cf2193593631ce8409a95c/` | `/maszyny/przyjecie-i-buforowanie/kosze-przyjeciowe/#kps3000g` | 301 | Sekcja karty koszy |
| `/maszyny/liczarka/67cf27a9593631ce8409a960/` | `/maszyny/wazenie-i-liczenie/liczarka/` | 301 |  |
| `/maszyny/napełniacz-kaskadowy/67ce00bcfbceb1c67efb671c/` | `/maszyny/pakowanie/napelniacz-kaskadowy/` | 301 |  |
| `/maszyny/paletyzatory/696fb7e82abe02495323d54f/` | `/maszyny/paletyzacja/` | 301 | Paletyzatory Verbruggen — strona kategorii |
| `/maszyny/pielnik-do-obróbki-redlin/696a59794da81bc256722bba/` | `/maszyny/pielenie/pielnik-do-obrobki-redlin/` | 301 |  |
| `/maszyny/przenośnik-do-materiałów-sypkich/6672c526a12ee4f19ab16310/` | `/maszyny/przenosniki/przenosnik-do-materialow-sypkich/` | 301 |  |
| `/maszyny/przenośnik-odpadowy/6672c2a4a12ee4f19ab16309/` | `/maszyny/przenosniki/przenosnik-odpadowy/` | 301 |  |
| `/maszyny/przenośnik-taśmowy-poprzeczny/697c8638fd4fc91bf9d751e5/` | `/maszyny/pakowanie/przenosnik-poprzeczny-do-raszlownicy/` | 301 | W nowym serwisie w kategorii Pakowanie |
| `/maszyny/przenośnik-taśmowy-poziomy/6671d5e3ad3ebbf4a1bdb8fa/` | `/maszyny/przenosniki/przenosniki-tasmowe-poziome/` | 301 |  |
| `/maszyny/przenośnik-taśmowy-wznoszący/6672d8b4a12ee4f19ab1632f/` | `/maszyny/przenosniki/przenosniki-tasmowe-wznoszace/` | 301 |  |
| `/maszyny/przenośnik-taśmowy-z-przegrodami/666c1dd97db89265d45932c9/` | `/maszyny/przenosniki/przenosniki-tasmowe-wznoszace/` | 301 | PRZYBLIŻENIE: wersja z przegrodami opisana w karcie przenośników wznoszących |
| `/maszyny/przenośniki-rolkowe/67d055ce56741f12cc290d54/` | `/maszyny/przenosniki/przenosniki-rolkowe/` | 301 |  |
| `/maszyny/przenośniki-z-taśmą-modularną/67d05b4e56741f12cc290d56/` | `/maszyny/przenosniki/przenosniki-tasmowe-poziome/` | 301 | PRZYBLIŻENIE: taśma modularna to wariant przenośnika poziomego |
| `/maszyny/raszlownica/67cdfef9fbceb1c67efb671a/` | `/maszyny/pakowanie/raszlownica/` | 301 |  |
| `/maszyny/separator-ziemii-i-kamienii/67cddcf7799068ebb64efde0/` | `/maszyny/oczyszczanie/separator-ziemi-i-kamieni/` | 301 | Poprawiona pisownia sluga |
| `/maszyny/sortownik-do-owoców-drobnych/67cde8d0799068ebb64efde6/` | `/maszyny/sortowanie/sortownik-do-owocow-drobnych/` | 301 |  |
| `/maszyny/stoły-obrotowe/697c804dfd4fc91bf9d751ce/` | `/maszyny/pakowanie/stoly-obrotowe/` | 301 |  |
| `/maszyny/stoły-selekcyjne-rolkowe/67cdf2cf799068ebb64efdec/` | `/maszyny/selekcja/stoly-selekcyjne-rolkowe/` | 301 |  |
| `/maszyny/stoły-selekcyjne-taśmowe/67cded6b799068ebb64efdea/` | `/maszyny/selekcja/stoly-selekcyjne-tasmowe/` | 301 |  |
| `/maszyny/waga-kontrolna/67cf2b2e593631ce8409a962/` | `/maszyny/wazenie-i-liczenie/waga-kontrolna/` | 301 |  |
| `/maszyny/wagoworkownica/67cdfd50fbceb1c67efb6718/` | `/maszyny/pakowanie/wagoworkownica/` | 301 |  |
| `/maszyny/wanna-do-płukania/697c7cc3fd4fc91bf9d751c0/` | `/maszyny/oczyszczanie/wanna-do-plukania/` | 301 |  |
| `/maszyny/wywrotnica-skrzyniopalet/67cdd634799068ebb64efddc/` | `/maszyny/rozladunek-skrzyn/wywrotnica-skrzyniopalet/` | 301 |  |
| `/maszyny/zasobnik-buforowy/67cdd9c4799068ebb64efdde/` | `/maszyny/przyjecie-i-buforowanie/zasobnik-buforowy/` | 301 |  |

## Maszyny — filtry kategorii `?cat=`

| Stary adres | Nowy adres | Typ | Uwagi |
|---|---|---|---|
| `/maszyny/?cat=Rozładunek+skrzyń` | `/maszyny/rozladunek-skrzyn/` | 301 | Filtr → strona kategorii |
| `/maszyny/?cat=rozładunek skrzyń` | `/maszyny/rozladunek-skrzyn/` | 301 | Wariant zapisu |
| `/maszyny/?cat=Przyjęcie+i+buforowanie` | `/maszyny/przyjecie-i-buforowanie/` | 301 | Filtr → strona kategorii |
| `/maszyny/?cat=przyjęcie i buforowanie` | `/maszyny/przyjecie-i-buforowanie/` | 301 | Wariant zapisu |
| `/maszyny/?cat=Oczyszczanie` | `/maszyny/oczyszczanie/` | 301 | Filtr → strona kategorii |
| `/maszyny/?cat=oczyszczanie` | `/maszyny/oczyszczanie/` | 301 | Wariant zapisu |
| `/maszyny/?cat=Sortowanie` | `/maszyny/sortowanie/` | 301 | Filtr → strona kategorii |
| `/maszyny/?cat=sortowanie` | `/maszyny/sortowanie/` | 301 | Wariant zapisu |
| `/maszyny/?cat=Selekcja` | `/maszyny/selekcja/` | 301 | Filtr → strona kategorii |
| `/maszyny/?cat=selekcja` | `/maszyny/selekcja/` | 301 | Wariant zapisu |
| `/maszyny/?cat=Ważenie` | `/maszyny/wazenie-i-liczenie/` | 301 | Filtr → strona kategorii |
| `/maszyny/?cat=ważenie` | `/maszyny/wazenie-i-liczenie/` | 301 | Wariant zapisu |
| `/maszyny/?cat=Pakowanie` | `/maszyny/pakowanie/` | 301 | Filtr → strona kategorii |
| `/maszyny/?cat=pakowanie` | `/maszyny/pakowanie/` | 301 | Wariant zapisu |
| `/maszyny?cat=pakowanie` | `/maszyny/pakowanie/` | 301 | Wariant bez ukośnika |
| `/maszyny/?cat=Paletyzacja` | `/maszyny/paletyzacja/` | 301 | Filtr → strona kategorii |
| `/maszyny/?cat=Przenośniki+taśmowe` | `/maszyny/przenosniki/` | 301 | Filtr → strona kategorii |
| `/maszyny/?cat=Pielenie` | `/maszyny/pielenie/` | 301 | Filtr → strona kategorii |

## Realizacje

| Stary adres | Nowy adres | Typ | Uwagi |
|---|---|---|---|
| `/realizacje` | `/realizacje/` | 301 | Tylko dodany ukośnik |
| `/realizacje/linia-do-cytrusow` | `/realizacje/linia-do-cytrusow/` | 301 | Istnieje w nowym serwisie |
| `/realizacje/sortownik-do-borowek` | `/realizacje/linia-do-sortowania-borowki/` | 301 | Zmieniony slug |
| `/realizacje/stol-selekcyjny-inox` | `/realizacje/stol-selekcyjny-inox/` | 301 | Istnieje w nowym serwisie |
| `/realizacje/raszlownica` | `/realizacje/raszlownica-z-modulem-pakujacym/` | 301 | Zmieniony slug |
| `/realizacje/czyszczarka-z-szuflada` | — | — | Brak odpowiednika — do ustalenia przez pozycjonerów |
| `/realizacje/kosz-przyjeciowy-5m` | — | — | Brak odpowiednika — do ustalenia przez pozycjonerów |
| `/realizacje/kosz-przyjeciowy-separator` | — | — | Brak odpowiednika — do ustalenia przez pozycjonerów |
| `/realizacje/linia-do-pakowania-warzyw` | — | — | Brak odpowiednika — do ustalenia przez pozycjonerów |
| `/realizacje/linia-do-sortowania-pakowania-oczyszczania` | — | — | Brak odpowiednika — do ustalenia przez pozycjonerów |
| `/realizacje/przenosniki-rolkowe` | — | — | Brak odpowiednika — do ustalenia przez pozycjonerów |
| `/realizacje/przenosniki-tasmowe-z-tasma-modularna` | — | — | Brak odpowiednika — do ustalenia przez pozycjonerów |
| `/realizacje/wagoworkownica` | — | — | Brak odpowiednika — do ustalenia przez pozycjonerów |
| `/realizacje/zasobnik-buforowy-kwasoodrporny` | — | — | Brak odpowiednika — do ustalenia przez pozycjonerów |

## Linie produkcyjne

| Stary adres | Nowy adres | Typ | Uwagi |
|---|---|---|---|
| `/linie-produkcyjne` | `/linie-produkcyjne/` | 301 | Tylko dodany ukośnik |
| `/linie-produkcyjne/zaawansowana-linia-do-liczenia-i-pakowania-cytrusow-inox` | `/realizacje/linia-do-cytrusow/` | 301 | Ta linia ma w nowym serwisie własną realizację |
| `/linie-produkcyjne/linia-do-buforowania-i-recznej-selekcji-cebuli` | `/linie-produkcyjne/` | 301 | Brak osobnych podstron linii — strona zbiorcza |
| `/linie-produkcyjne/linia-do-oczyszczania-mycia-i-pakowania-warzyw` | `/linie-produkcyjne/` | 301 | Brak osobnych podstron linii — strona zbiorcza |
| `/linie-produkcyjne/linia-do-selekcji-i-recznego-pakowania-batatow` | `/linie-produkcyjne/` | 301 | Brak osobnych podstron linii — strona zbiorcza |
| `/linie-produkcyjne/propozycja-linii-do-czyszczenia-i-pakowania` | `/linie-produkcyjne/` | 301 | Brak osobnych podstron linii — strona zbiorcza |
| `/linie-produkcyjne/propozycja-linii-do-kalibracji-i-wazenia` | `/linie-produkcyjne/` | 301 | Brak osobnych podstron linii — strona zbiorcza |
| `/linie-produkcyjne/propozycja-linii-do-kalibrowania-i-pakowania` | `/linie-produkcyjne/` | 301 | Brak osobnych podstron linii — strona zbiorcza |

## Pliki PDF

| Stary adres | Nowy adres | Typ | Uwagi |
|---|---|---|---|
| `/images/AgroWeldKatalog2026.pdf` | `/uploads/agro-weld-katalog-2026.pdf` | 301 | Katalog Agro-Weld 2026 |
| `/images/Katalog Verbruggen 1 PL v5.pdf` | `/uploads/verbruggen-katalog-paletyzatorow.pdf` | 301 | Katalog paletyzatorów Verbruggen |
| `/images/AgroWeldENG.pdf` | `/do-pobrania/` | 301 | Decyzja 16.09.2026: brak katalogu EN, kierujemy na Do pobrania |
| `/images/AgroWeldKatalog2025.pdf` | `/uploads/agro-weld-katalog-2026.pdf` | 301 | Stary katalog 2025 |

## Bez odpowiednika — do ustalenia przez pozycjonerów (11)

- `/finansowanie`
- `/realizacje/czyszczarka-z-szuflada`
- `/realizacje/kosz-przyjeciowy-5m`
- `/realizacje/kosz-przyjeciowy-separator`
- `/realizacje/linia-do-pakowania-warzyw`
- `/realizacje/linia-do-sortowania-pakowania-oczyszczania`
- `/realizacje/przenosniki-rolkowe`
- `/realizacje/przenosniki-tasmowe-z-tasma-modularna`
- `/realizacje/wagoworkownica`
- `/realizacje/zasobnik-buforowy-kwasoodrporny`
- `/images/AgroWeldENG.pdf`

## Mapowania przybliżone

Trzy karty maszyn nie mają dokładnego odpowiednika 1:1 — oznaczone w tabeli jako PRZYBLIŻENIE:

- „Bufor do sortowania” → `/maszyny/pakowanie/bufor-do-pakowania/`
- „Przenośnik taśmowy z przegrodami” → `/maszyny/przenosniki/przenosniki-tasmowe-wznoszace/`
- „Przenośniki z taśmą modularną” → `/maszyny/przenosniki/przenosniki-tasmowe-poziome/`

## Uwaga techniczna: adresy z `?cat=`

Przekierowania w `render.yaml` dopasowują tylko ścieżkę — **nie** parametry zapytania. Adresy `/maszyny/?cat=…` trafią więc na `/maszyny/`, co jest poprawne (listing zawiera wszystkie kategorie), ale nie na konkretną kategorię.
Żeby filtry prowadziły na strony kategorii, potrzebny jest na `/maszyny/` krótki skrypt czytający `?cat=` i wykonujący `location.replace()`. Mapowanie nazw filtrów na slugi jest w tabeli powyżej.

## Decyzje klienta z 16.09.2026

Patrz `DECYZJE-SEO.md`. Najważniejsze: `/finansowanie` → `/kontakt/`, `/en` → `/`, przenośnik z przegrodami → przenośniki taśmowe poziome, adresy `?cat=` obsługuje skrypt na `/maszyny/` (Render nie dopasowuje query stringów).
