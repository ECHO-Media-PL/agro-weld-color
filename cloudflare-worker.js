// Cloudflare Worker — Agro-Weld
// Każdy stary / niekanoniczny adres dostaje JEDNO 301 prosto do docelowego URL:
//  - /maszyny/?cat=…            → strona kategorii (tu, bo Render nie widzi query stringów)
//  - http / bez www             → https://www
//  - /…/index.html              → /…/
//  - brak końcowego ukośnika    → z ukośnikiem
//  - reguły z render.yaml (produkty po ID, realizacje, PDF…) — Worker pyta Render
//    o przekierowanie i zwraca od razu jego cel, więc powyższe normalizacje nie dokładają skoku.
// Trasy (Routes): agro-weld.pl/* oraz www.agro-weld.pl/*, Failure mode: Fail open.
// Wymaga: SSL/TLS = Full (strict), "Always Use HTTPS" WYŁĄCZONE.

const HOST = 'www.agro-weld.pl';
const BASE = 'https://' + HOST;

const CATS = [
  ['oczyszcz', '/maszyny/oczyszczanie/'],
  ['przyj', '/maszyny/przyjecie-i-buforowanie/'],
  ['przen', '/maszyny/przenosniki/'],
  ['selekc', '/maszyny/selekcja/'],
  ['sortow', '/maszyny/sortowanie/'],
  ['roz', '/maszyny/rozladunek-skrzyn/'],
  ['pakow', '/maszyny/pakowanie/'],
  ['palet', '/maszyny/paletyzacja/'],
  ['piel', '/maszyny/pielenie/'],
  ['wa', '/maszyny/wazenie-i-liczenie/'],
];

const plain = s => s
  .replace(/ł/g, 'l').replace(/Ł/g, 'L')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().trim();

const r301 = location => new Response(null, { status: 301, headers: { Location: location, 'Cache-Control': 'public, max-age=3600' } });

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method !== 'GET' && request.method !== 'HEAD') return fetch(request);

    // 1. Filtry kategorii
    if (/^\/maszyny\/?$/.test(url.pathname) && url.searchParams.has('cat')) {
      const value = plain(url.searchParams.get('cat') || '');
      const hit = CATS.find(([prefix]) => value.startsWith(prefix));
      return r301(BASE + (hit ? hit[1] : '/maszyny/'));
    }

    // 2. Adres kanoniczny: https + www + bez index.html
    let path = url.pathname.replace(/\/index\.html$/i, '/');
    const changed = url.protocol !== 'https:' || url.hostname !== HOST || path !== url.pathname;
    const canonical = BASE + path + url.search;

    // 3. Czy Render ma dla tej ścieżki regułę przekierowania? Jeśli tak — od razu do celu.
    const originReq = new Request(canonical, { method: request.method, headers: request.headers, redirect: 'manual' });
    const res = await fetch(originReq);
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      const target = new URL(res.headers.get('location'), canonical);
      return r301(BASE + target.pathname + target.search);
    }

    // 4. Brak końcowego ukośnika na stronie (bez rozszerzenia pliku)
    const last = path.split('/').pop();
    if (res.status === 200 && last && !last.includes('.')) {
      return r301(BASE + path + '/' + url.search);
    }

    // 5. Normalizacja protokołu / domeny / index.html
    if (changed) return r301(canonical);

    return res;
  },
};
