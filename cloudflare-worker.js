// Cloudflare Worker — Agro-Weld
// Zakres: stare adresy filtrów /maszyny/?cat=… oraz normalizacja protokołu i domeny.
// Pozostałe przekierowania (produkty po ID, realizacje, linie, PDF) obsługuje Render — patrz render.yaml.
// Trasy (Routes): agro-weld.pl/* oraz www.agro-weld.pl/*
// Wymaga: SSL/TLS = Full (strict), "Always Use HTTPS" WYŁĄCZONE (Worker sam robi http -> https jednym skokiem).

const BASE = 'https://www.agro-weld.pl';

// Dopasowanie po początku wartości — łapie warianty zapisu i kodowania.
// Kolejność ma znaczenie: "przyj" przed "przen" nie koliduje, ale "wa" musi być po "przyj".
const CATS = [
  ['oczyszcz', '/maszyny/oczyszczanie/'],
  ['przyj', '/maszyny/przyjecie-i-buforowanie/'],
  ['przen', '/maszyny/przenosniki/'],
  ['selekc', '/maszyny/selekcja/'],
  ['sortow', '/maszyny/sortowanie/'],
  ['rozl', '/maszyny/rozladunek-skrzyn/'],
  ['roz', '/maszyny/rozladunek-skrzyn/'],
  ['pakow', '/maszyny/pakowanie/'],
  ['palet', '/maszyny/paletyzacja/'],
  ['piel', '/maszyny/pielenie/'],
  ['waz', '/maszyny/wazenie-i-liczenie/'],
  ['wa', '/maszyny/wazenie-i-liczenie/'],
];

// "Ważenie", "wa%C5%BCenie", "WAŻENIE" -> "wazenie"
const plain = s => s
  .replace(/ł/g, 'l').replace(/Ł/g, 'L')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().trim();

const r301 = location => new Response(null, { status: 301, headers: { Location: location } });

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // 1. Stare adresy filtrów kategorii: /maszyny?cat=… i /maszyny/?cat=…
    if (/^\/maszyny\/?$/.test(url.pathname) && url.searchParams.has('cat')) {
      const value = plain(url.searchParams.get('cat') || '');
      const hit = CATS.find(([prefix]) => value.startsWith(prefix));
      return r301(BASE + (hit ? hit[1] : '/maszyny/'));
    }

    // 2. Protokół i domena — jednym skokiem, przed przekazaniem do Render
    if (url.hostname !== 'www.agro-weld.pl' || url.protocol !== 'https:') {
      return r301(BASE + url.pathname + url.search);
    }

    // 3. Wszystko pozostałe idzie do Render (tam działają reguły produktowe po ID)
    return fetch(request);
  },
};
