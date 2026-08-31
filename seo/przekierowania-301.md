# Przekierowania 301 — mapa i implementacja (Express)

Zgodnie ze specyfikacją SEO (Sekcja A.3 pkt 8 oraz B.3 pkt 14).

## 1. Kategorie: /maszyny/?cat=... → /maszyny/{slug}/

```js
// machines.routes.js — PRZED trasą /maszyny/:categorySlug
const CATEGORY_SLUGS = {
  "Rozładunek skrzyń": "rozladunek-skrzyn",
  "Przyjęcie i buforowanie": "przyjecie-i-buforowanie",
  "Oczyszczanie": "oczyszczanie",
  "Sortowanie": "sortowanie",
  "Selekcja": "selekcja",
  "Ważenie": "wazenie",
  "Pakowanie": "pakowanie",
  "Paletyzacja": "paletyzacja",
  "Przenośniki taśmowe": "przenosniki-tasmowe",
  "Pielenie": "pielenie",
};

router.get("/maszyny", (req, res, next) => {
  const cat = req.query.cat;
  if (cat && CATEGORY_SLUGS[cat]) {
    return res.redirect(301, "/maszyny/" + CATEGORY_SLUGS[cat] + "/");
  }
  if (cat) return res.redirect(301, "/maszyny/"); // nieznana kategoria — na hub
  next(); // brak parametru — statyczny hub /maszyny/
});
```

## 2. Produkty: /maszyny/:machineName/:machineId → /maszyny/{slug}/

> **Do weryfikacji z bazą:** wartości `:machineName` w starych adresach należy porównać
> z kolumną w bazie — poniższa mapa używa identyfikatorów wewnętrznych katalogu.

```js
const PRODUCT_SLUGS = {
  "wywrotnica": "wywrotnica-skrzyniopalet",
  "kosz": "kosz-przyjeciowy",
  "zasobnik": "zasobnik-buforowy",
  "separator": "separator-ziemi-i-kamieni",
  "czyszczarka": "czyszczarka-szczotkowa",
  "czyszczarka-imbir": "czyszczarka-do-imbiru-i-chrzanu",
  "wanna": "wanna-do-plukania",
  "kalibrownik": "kalibrownik-rozsuwany",
  "sortownik-sod": "sortownik-do-owocow-drobnych",
  "sortownik-2b": "dwubebnowy-sortownik",
  "stol-tasmowy": "stol-selekcyjny-tasmowy",
  "stol-rolkowy": "stol-selekcyjny-rolkowy",
  "liczarka": "liczarka-do-owocow",
  "waga": "waga-kontrolna",
  "wagoworkownica": "wagoworkownica",
  "raszlownica": "raszlownica",
  "napelniacz": "napelniacz-kaskadowy",
  "stol-obrotowy": "stol-obrotowy",
  "bufor": "bufor-do-pakowania",
  "paletyzator": "paletyzatory-verbruggen",
  "formator": "formator-palet",
  "przenosnik": "przenosniki-tasmowe-i-rolkowe",
  "przenosnik-poprzeczny": "przenosnik-poprzeczny",
  "pielnik": "pielnik-do-obrobki-redlin",
};

router.get("/maszyny/:machineName/:machineId([0-9a-f]{24})", (req, res) => {
  const slug = PRODUCT_SLUGS[req.params.machineName];
  if (slug) return res.redirect(301, "/maszyny/" + slug + "/");
  return res.status(404).render("404"); // prawdziwe 404, nie soft-404
});
```

## 3. Nieistniejące adresy → prawdziwe 404

```js
router.get("/maszyny/:slug", (req, res) => {
  const page = STATIC_PAGES[req.params.slug]; // kategoria LUB produkt
  if (!page) return res.status(404).render("404");
  res.status(200).sendFile(page);
});
```

## 4. Po wdrożeniu
- Przesłać zaktualizowany `sitemap.xml` w Google Search Console.
- Test: `curl -I "https://www.agro-weld.pl/maszyny/?cat=Oczyszczanie"` → `301 → /maszyny/oczyszczanie/`.
