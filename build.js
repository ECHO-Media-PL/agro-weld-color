#!/usr/bin/env node
// Agro-Weld — generator statycznej witryny. Uruchamiany przez Render (render.yaml: buildCommand).
//
// ZASADA: repozytorium NIE jest nigdy modyfikowane przez build.
//   content/   → dane redakcyjne (źródło prawdy, edytowane przez CMS)
//   templates/ → szablony stron generowanych z danych
//   *.html     → strony statyczne (źródło layoutu; build wstrzykuje w nie treść z content/)
//   dist/      → JEDYNY artefakt publikacji; usuwany i budowany od zera przy każdym buildzie
//
// Dzięki temu strony osierocone (usunięty wpis blogowy, zmieniony slug, usunięta kategoria
// lub produkt) przestają istnieć na produkcji, a wygenerowany HTML nigdy nie jest maskowany
// przez stary plik z repozytorium.
const fs = require('fs'), path = require('path');

const OUT = 'dist';
const read = f => fs.readFileSync(f, 'utf8');
const J = f => JSON.parse(read(f));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escA = s => esc(s).replace(/"/g, '&quot;');
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const fmtDate = iso => { const [y, m, d] = iso.split('-'); return d + '.' + m + '.' + y; };

// pliki wygenerowane w tym buildzie (ścieżki względne, bez prefiksu dist/)
const built = new Set();
function write(rel, s) {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, s);
  built.add(rel.replace(/\\/g, '/'));
}
// źródło strony: jeśli została już wygenerowana w tym buildzie, czytamy wersję z dist/
const src = rel => read(built.has(rel) ? path.join(OUT, rel) : rel);
const hasSrc = rel => built.has(rel) || fs.existsSync(rel);

// ---------- 1. czysty katalog wyjściowy ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// ---------- 2. kopiowanie plików publikowanych bez generowania ----------
// Wykluczone: dane, szablony, kod CMS, pliki robocze projektu i katalogi deweloperskie.
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', 'dist', 'cms', 'content', 'templates', 'screenshots', 'seo']);
const SKIP_FILES = new Set(['build.js', 'render.yaml', 'github.md', 'package.json', 'package-lock.json', '.gitignore', 'support.js', 'aw-data.js', 'CLAUDE.md']);
const skipFile = f => SKIP_FILES.has(f) || f.endsWith('.dc.html') || f.startsWith('.');
// katalogi, których zawartość HTML jest w całości generowana z danych — kopiujemy tylko
// pliki spoza tej roli (np. maszyny/index.html), podkatalogi powstają od zera niżej
const GENERATED_SUBTREES = ['maszyny', 'blog', 'realizacje'];

let copied = 0;
function copyTree(from, rel) {
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const childRel = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) {
      if (!rel && SKIP_DIRS.has(e.name)) continue;
      // podkatalogi generowanych sekcji (blog/<slug>/, maszyny/<kat>/…) — pomijamy, build je odtworzy
      if (GENERATED_SUBTREES.includes(rel || '')) continue;
      copyTree(path.join(from, e.name), childRel);
    } else if (e.isFile() && !skipFile(e.name)) {
      fs.mkdirSync(path.join(OUT, rel), { recursive: true });
      fs.copyFileSync(path.join(from, e.name), path.join(OUT, childRel));
      copied++;
    }
  }
}
copyTree('.', '');

// ---------- 3. dane ----------
const site = J('content/strona-glowna.json');
const machines = J('content/maszyny.json');
const seo = J('content/seo.json');
const posts = fs.readdirSync('content/blog').filter(f => f.endsWith('.json'))
  .map(f => J('content/blog/' + f)).sort((a, b) => b.date.localeCompare(a.date));

const vals = { ...site };
for (const m of machines) { vals['m:' + m.id + '.name'] = m.name; vals['m:' + m.id + '.short'] = m.short; vals['m:' + m.id + '.models'] = m.models; }

// ---------- wstrzykiwanie ----------
function injectCms(html) {
  return html.replace(/(<(\w+)\b[^>]*\bdata-cms="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/g,
    (w, open, tag, key, inner, close) => key in vals ? open + esc(vals[key]) + close : w);
}
function injectSeo(html, page) {
  const p = seo.pages[page]; if (!p) return html;
  if (p.title) {
    html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>' + esc(p.title) + '</title>');
    html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, '$1' + escA(p.title) + '$2');
  }
  if (p.description) {
    html = html.replace(/(<meta name="description" content=")[^"]*(")/, '$1' + escA(p.description) + '$2');
    html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, '$1' + escA(p.description) + '$2');
  }
  for (const [s0, alt] of Object.entries(p.alts || {})) {
    const s = reEsc(s0), a = escA(alt);
    html = html.replace(new RegExp('(<img[^>]*src="' + s + '"[^>]*alt=")[^"]*(")', 'g'), '$1' + a + '$2');
    html = html.replace(new RegExp('(<img[^>]*alt=")[^"]*("[^>]*src="' + s + '")', 'g'), '$1' + a + '$2');
  }
  return html;
}
function region(html, name, inner) {
  const a = '<!--CMS:' + name + '-->', b = '<!--/CMS:' + name + '-->';
  const i = html.indexOf(a), j = html.indexOf(b);
  if (i < 0 || j < 0) { console.warn('brak regionu ' + name); return html; }
  return html.slice(0, i + a.length) + '\n' + inner + '\n' + html.slice(j);
}

// ---------- 4. blog: wpisy ----------
const MCATS = { 'rozladunek-skrzyn':'Rozładunek skrzyń', 'przyjecie-i-buforowanie':'Przyjęcie i buforowanie', 'oczyszczanie':'Oczyszczanie', 'sortowanie':'Sortowanie', 'selekcja':'Selekcja', 'wazenie-i-liczenie':'Ważenie i liczenie', 'pakowanie':'Pakowanie', 'paletyzacja':'Paletyzacja', 'przenosniki':'Przenośniki', 'pielenie':'Pielenie' };
const ICON = '<span style="width:56px;height:44px;display:flex;align-items:center;justify-content:center;color:#8C3A43;flex:none"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 13h11a3 3 0 0 1 0 6h-11a3 3 0 0 1 0-6z M9 5h6v4H9z"></path></svg></span>';
function relMachines(p) {
  const items = (p.machines || []).map(key => {
    const [t, id] = key.split(':');
    if (t === 'cat') { const n = MCATS[id]; return n ? { href: '/maszyny/' + id + '/', img: null, name: n, sub: 'Kategoria maszyn' } : null; }
    const m = machines.find(x => x.id === id); if (!m) return null;
    return { href: m.url || '/maszyny/#' + m.id, img: m.img ? '../../assets/' + m.img : null, name: m.name, sub: m.models || '' };
  }).filter(Boolean);
  if (!items.length) return '';
  return '<div data-reveal style="margin-top:20px;border:1px solid rgba(20,22,14,.2);padding:20px 22px">\n' +
    '        <div class="mono" style="font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#41571F;margin-bottom:14px">Maszyny z artykułu</div>\n' +
    '        <div style="display:flex;flex-direction:column;gap:10px">\n' +
    items.map(it => '          <a class="relm" href="' + escA(it.href) + '">' +
      (it.img ? '<img src="' + escA(it.img) + '" alt="' + escA(it.name) + '" style="width:56px;height:44px;object-fit:contain;flex:none">' : ICON) +
      '<span style="flex:1;font-size:14px;font-weight:700">' + esc(it.name) + '<br><span class="mono" style="font-size:10px;font-weight:400;color:#8A8163">' + esc(it.sub) + '</span></span><span class="rarr" style="color:#8C3A43;font-weight:700">↗</span></a>').join('\n') +
    '\n        </div>\n      </div>';
}
const tpl = fs.existsSync('templates/blog-post.html') ? read('templates/blog-post.html') : null;
function tocFromBody(body) {
  const items = []; const re = /<h2[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g; let m;
  while ((m = re.exec(body))) items.push([m[1], m[2].replace(/<[^>]+>/g, '').replace(/^\s*\d+\s*·\s*/, '').trim()]);
  return items.map(([id, t], i) =>
    '<li><a class="toclink" href="#' + id + '"' + (i === items.length - 1 ? ' style="border-bottom:0"' : '') +
    '><span class="mono">' + String(i + 1).padStart(2, '0') + '</span>' + esc(t) + '</a></li>').join('\n          ');
}
function relatedCards(self) {
  return posts.filter(p => p.slug !== self.slug).slice(0, 2).map(p =>
    '<a class="relpost" href="/blog/' + p.slug + '/">\n' +
    '        <span class="mono" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase"><span style="color:#8FA862">' + esc(p.category) + '</span><span class="rarr" style="color:#8C3A43;font-size:15px">↗</span></span>\n' +
    '        <span style="font-family:\'Chakra Petch\',sans-serif;font-size:21px;font-weight:700;line-height:1.15;color:#ECE7D7;margin-bottom:8px;display:block;text-wrap:balance">' + esc(p.title) + '</span>\n' +
    '        <span style="font-size:14px;line-height:1.55;color:#8E9678;text-wrap:pretty">' + esc(p.excerpt || '') + '</span>\n' +
    '      </a>').join('\n      ');
}
let generated = 0;
for (const p of posts) {
  if (!p.managed || p.draft || !tpl) continue;
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: p.title, description: p.metaDesc, datePublished: p.date,
    url: 'https://www.agro-weld.pl/blog/' + p.slug + '/',
    publisher: { '@type': 'Organization', name: 'Agro-Weld Spółka z ograniczoną odpowiedzialnością', url: 'https://www.agro-weld.pl/' },
  });
  const fill = {
    META_TITLE: esc(p.metaTitle || p.title), META_DESC: escA(p.metaDesc || ''), SLUG: p.slug,
    JSONLD: jsonld, CRUMB: esc(p.title.length > 44 ? p.title.slice(0, 42).trim() + '…' : p.title),
    CATEGORY: esc(p.category), DATE: fmtDate(p.date), READ: p.read || 5,
    TITLE: esc(p.title), LEAD: esc(p.lead || ''), TOC: tocFromBody(p.bodyHtml || ''),
    BODY: p.bodyHtml || '', RELATED: relatedCards(p), RELM: relMachines(p),
  };
  let html = tpl;
  for (const [k, v] of Object.entries(fill)) html = html.split('{{' + k + '}}').join(v);
  write('blog/' + p.slug + '/index.html', html);
  generated++;
}

// ---------- 5. blog: listing ----------
const managed = posts.filter(p => p.managed && !p.draft);
if (hasSrc('blog/index.html')) {
  const cards = managed.map(p => {
    const cover = p.cover ? '../' + p.cover : '../assets/maszyna-placeholder.png';
    return '<article style="display:contents" data-cat="' + escA(p.catSlug || 'dobor') + '"><a class="bcard" href="/blog/' + p.slug + '/">\n' +
      '        <span class="bthumb' + (p.coverPad ? ' pad' : '') + '"><img src="' + escA(cover) + '" alt="' + escA(p.coverAlt || p.title) + '" loading="lazy"></span>\n' +
      '        <span class="mono" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase"><span class="bkicker">' + esc(p.category) + '</span><span style="color:#8A8163">' + fmtDate(p.date) + '</span></span>\n' +
      '        <h2 class="btitle" style="font-size:24px;line-height:1.14;color:#14160E;margin-bottom:11px;text-wrap:balance">' + esc(p.title) + '</h2>\n' +
      '        <p style="font-size:14.5px;line-height:1.6;color:#56603F;text-wrap:pretty;margin-bottom:20px">' + esc(p.excerpt || '') + '</p>\n' +
      '        <span class="mono bmore" style="margin-top:auto;font-size:11px;font-weight:700;color:#41571F">Czytaj artykuł<span>→</span><span style="color:#A8A084;font-weight:400;margin-left:4px">· ' + (p.read || 5) + ' min</span></span>\n' +
      '      </a></article>';
  }).join('\n      ');
  write('blog/index.html', region(src('blog/index.html'), 'POSTS', '      ' + cards));
}

// ---------- 6. strona główna: wyróżniony wpis + najnowszy ----------
const visible = posts.filter(p => !p.draft);
const feat = visible.find(p => p.featured) || visible[0];
const mini = visible.find(p => p !== feat);
if (feat && hasSrc('index.html') && src('index.html').includes('<!--CMS:HOMEBLOG-->')) {
  const cover = p => p.cover || 'assets/maszyna-placeholder.png';
  const featHtml = '<a class="bfeat" href="/blog/' + feat.slug + '/" style="background:#ECE7D7;display:grid;grid-template-columns:1fr 1fr">\n' +
    '        <span class="bfimg" style="overflow:hidden;display:block;background:#E3DCC8;min-height:300px"><img src="' + escA(cover(feat)) + '" alt="' + escA(feat.coverAlt || feat.title) + '" loading="lazy" style="width:100%;height:100%;object-fit:' + (feat.coverPad ? 'contain;padding:26px' : 'cover') + ';display:block"></span>\n' +
    '        <span style="padding:32px 34px;display:flex;flex-direction:column;justify-content:center">\n' +
    '          <span class="mono" style="display:flex;align-items:center;gap:12px;margin-bottom:16px;font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase"><span style="color:#8C3A43">Wyróżniony</span><span style="color:#C6BEA4">·</span><span style="color:#8A8163">' + esc(feat.category) + '</span></span>\n' +
    '          <h3 class="btitle" style="font-size:28px;line-height:1.1;margin-bottom:12px;text-wrap:balance">' + esc(feat.title) + '</h3>\n' +
    '          <p style="font-size:15px;line-height:1.6;color:#56603F;text-wrap:pretty;margin-bottom:22px">' + esc(feat.excerpt || '') + '</p>\n' +
    '          <span class="mono bmore" style="font-size:11px;font-weight:700;color:#41571F;display:inline-flex;align-items:center;gap:8px">Czytaj artykuł<span>→</span><span style="color:#A8A084;font-weight:400;margin-left:4px">· ' + (feat.read || 5) + ' min</span></span>\n' +
    '        </span>\n      </a>';
  const miniHtml = mini ? '<a class="bmini" href="/blog/' + mini.slug + '/" style="background:#ECE7D7;padding:26px 28px;display:flex;flex-direction:column;justify-content:center">\n' +
    '          <span class="mono" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase"><span style="color:#8C3A43">' + esc(mini.category) + '</span><span style="color:#8A8163">' + fmtDate(mini.date) + '</span></span>\n' +
    '          <h3 class="btitle" style="font-size:21px;line-height:1.14;margin-bottom:9px;text-wrap:balance">' + esc(mini.title) + '</h3>\n' +
    '          <p style="font-size:14px;line-height:1.55;color:#56603F;text-wrap:pretty">' + esc(mini.excerpt || '') + '</p>\n        </a>' : '';
  let home = region(src('index.html'), 'HOMEBLOG', '      ' + featHtml);
  if (home.includes('<!--CMS:HOMEMINI-->')) home = region(home, 'HOMEMINI', '        ' + miniHtml);
  write('index.html', home);
}

// ---------- 7. sitemap ----------
if (hasSrc('sitemap.xml')) {
  const urls = managed.map(p =>
    '  <url><loc>https://www.agro-weld.pl/blog/' + p.slug + '/</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>').join('\n');
  write('sitemap.xml', region(src('sitemap.xml'), 'BLOG', urls));
}

// ---------- 8. kategorie maszyn (content/kategorie.json + templates/kategoria.html) ----------
let catsBuilt = 0, prodsBuilt = 0;
if (fs.existsSync('content/kategorie.json') && fs.existsSync('templates/kategoria.html')) {
  const KR = require('./templates/kategoria.render.js');
  const ktpl = read('templates/kategoria.html');
  // kategorie z własnym szablonem: cat.template === "<nazwa>" → templates/<nazwa>.html
  // + templates/<nazwa>.render.js + content/<nazwa>.json. Standardowy renderer ich nie dotyka.
  const CUSTOM = {};
  for (const cat of J('content/kategorie.json')) {
    const t = cat.template;
    if (t) {
      const tf = 'templates/' + t + '.html', rf = './templates/' + t + '.render.js', df = 'content/' + t + '.json';
      if (fs.existsSync(tf) && fs.existsSync('templates/' + t + '.render.js') && fs.existsSync(df)) {
        const CR = CUSTOM[t] || (CUSTOM[t] = require(rf));
        write('maszyny/' + cat.slug + '/index.html', CR.render(cat, J(df), machines, read(tf)));
        catsBuilt++;
        continue;
      }
      console.warn('kategoria ' + cat.slug + ': brak kompletu plików szablonu "' + t + '" — użyto szablonu standardowego');
    }
    write('maszyny/' + cat.slug + '/index.html', KR.render(cat, machines, ktpl));
    catsBuilt++;
  }
}
// ---------- 9. karty produktów (content/produkty.json + templates/produkt.html) ----------
if (fs.existsSync('content/produkty.json') && fs.existsSync('templates/produkt.html')) {
  const PR = require('./templates/produkt.render.js');
  const ptpl = read('templates/produkt.html');
  const prods = J('content/produkty.json');
  for (const p of prods) { write('maszyny/' + p.cat + '/' + p.slug + '/index.html', PR.render(p, prods, machines, ptpl)); prodsBuilt++; }
}
// ---------- 10. listing /maszyny/ ----------
if (hasSrc('maszyny/index.html') && src('maszyny/index.html').includes('<!--CMS:GROUPS-->')) {
  const LR = require('./templates/listing.render.js');
  write('maszyny/index.html', region(src('maszyny/index.html'), 'GROUPS', LR.render(machines)));
}

// ---------- 11. realizacje (content/realizacje.json) ----------
if (fs.existsSync('content/realizacje.json') && fs.existsSync('templates/strony.render.js')) {
  const SR = require('./templates/strony.render.js');
  const ktpl2 = read('templates/kategoria.html');
  const reals = J('content/realizacje.json');
  write('realizacje/index.html', SR.renderRealizacje(reals, ktpl2));
  for (const r of reals) write('realizacje/' + r.slug + '/index.html', SR.renderCase(r, reals, machines, ktpl2));
}

// ---------- 12. meta/SEO + markery data-cms ----------
// Uwaga na kolejność: strony wygenerowane wyżej czytamy z dist/, więc SEO nakłada się
// na świeży HTML, a nie na starą kopię z repozytorium.
let seoPages = 0, seoMissing = [];
for (const page of Object.keys(seo.pages)) {
  if (!hasSrc(page)) { seoMissing.push(page); console.warn('brak strony ' + page); continue; }
  write(page, injectSeo(injectCms(src(page)), page));
  seoPages++;
}
// pozostałe skopiowane strony statyczne — wstrzyknięcie markerów data-cms
(function cmsRest(dir) {
  for (const e of fs.readdirSync(path.join(OUT, dir || '.'), { withFileTypes: true })) {
    const rel = dir ? dir + '/' + e.name : e.name;
    if (e.isDirectory()) cmsRest(rel);
    else if (e.name === 'index.html' && !seo.pages[rel]) write(rel, injectCms(read(path.join(OUT, rel))));
  }
})('');

// legacy katalog produktów (używany przez generatory pomocnicze)
write('seo/data-products.json', JSON.stringify(machines, null, 1));

console.log('Build OK → ' + OUT + '/: ' + copied + ' plików skopiowanych, ' + catsBuilt + ' kategorii, ' +
  prodsBuilt + ' kart produktów, ' + generated + ' wpisów bloga, ' + managed.length + ' na listingu, ' +
  seoPages + ' stron z meta SEO' + (seoMissing.length ? ' (brakujące źródła: ' + seoMissing.join(', ') + ')' : '') + '.');
