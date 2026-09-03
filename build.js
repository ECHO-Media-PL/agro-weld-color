#!/usr/bin/env node
// Agro-Weld — build treści CMS. Uruchamiany przez Render przy każdym deployu (render.yaml: buildCommand).
// Wstrzykuje content/*.json w statyczne HTML-e (markery data-cms), podmienia meta/alty (content/seo.json),
// generuje strony wpisów blogowych z templates/blog-post.html oraz aktualizuje listing bloga i sitemap.
const fs = require('fs'), path = require('path');
const read = f => fs.readFileSync(f, 'utf8');
const write = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
const J = f => JSON.parse(read(f));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escA = s => esc(s).replace(/"/g, '&quot;');
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const fmtDate = iso => { const [y, m, d] = iso.split('-'); return d + '.' + m + '.' + y; };

// ---------- dane ----------
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
  for (const [src, alt] of Object.entries(p.alts || {})) {
    const s = reEsc(src), a = escA(alt);
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

// ---------- blog: generowanie wpisów ----------
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
    BODY: p.bodyHtml || '', RELATED: relatedCards(p),
  };
  let html = tpl;
  for (const [k, v] of Object.entries(fill)) html = html.split('{{' + k + '}}').join(v);
  write('blog/' + p.slug + '/index.html', html);
  generated++;
}

// ---------- blog: listing + sitemap ----------
const managed = posts.filter(p => p.managed && !p.draft);
if (fs.existsSync('blog/index.html')) {
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
  write('blog/index.html', region(read('blog/index.html'), 'POSTS', '      ' + cards));
}
if (fs.existsSync('sitemap.xml')) {
  const urls = managed.map(p =>
    '  <url><loc>https://www.agro-weld.pl/blog/' + p.slug + '/</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>').join('\n');
  write('sitemap.xml', region(read('sitemap.xml'), 'BLOG', urls));
}

// ---------- strony z markerami / SEO ----------
for (const page of Object.keys(seo.pages)) {
  if (!fs.existsSync(page)) { console.warn('brak strony ' + page); continue; }
  write(page, injectSeo(injectCms(read(page)), page));
}
// legacy sync — katalog produktów używany przez generatory
write('seo/data-products.json', JSON.stringify(machines, null, 1));
console.log('Build OK: ' + Object.keys(seo.pages).length + ' stron, ' + generated + ' wygenerowanych wpisów, ' + managed.length + ' wpisów CMS na listingu.');
