// Powłoka stron statycznych (head/header/footer z templates/kategoria.html) + generatory: realizacje, strony proste.
(function (root) {
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
  var escA = function (s) { return esc(s).replace(/"/g,'&quot;'); };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var NAV = { oferta: '/maszyny/', linie: '/linie-produkcyjne/', realizacje: '/realizacje/', ofirmie: '/o-firmie/', blog: '/blog/', kontakt: '/kontakt/' };

  // shell z szablonu kategorii: depth = liczba segmentów katalogu (1 → ../assets/)
  function shell(tpl, o) {
    var head = tpl.slice(0, tpl.indexOf('<!-- HERO -->'));
    var footer = tpl.slice(tpl.indexOf('<footer'));
    footer = footer.slice(0, footer.indexOf('<script>'));
    var rel = new Array(o.depth + 1).join('../') + 'assets/';
    var h = head.replace(/https:\/\/www\.agro-weld\.pl\/maszyny\/\{\{SLUG\}\}\//g, o.url)
      .replace('<title>{{META_TITLE}}</title>', '<title>' + esc(o.title) + '</title>')
      .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + escA(o.desc) + '">')
      .replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + escA(o.title) + '">')
      .replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + escA(o.desc) + '">')
      .replace('{{JSONLD}}', o.jsonld || JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', name: o.title, url: o.url, description: o.desc }))
      .replace(/\.\.\/\.\.\/assets\//g, rel)
      .replace(/\{\{OGIMAGE\}\}/g, 'https://www.agro-weld.pl/' + (o.ogImage || 'assets/logo.webp'))
      .replace(/\s*\{\{MOBSUB\}\}/g, '')
      .replace(/(<a class="navlink" href="\/maszyny\/") style="color:#ECE7D7"/, '$1 style="color:#ECE7D7"');
    if (o.active && NAV[o.active]) {
      var href = NAV[o.active];
      h = h.replace(new RegExp('(<a class="navlink" href="' + href.replace(/\//g, '\\/') + '")(?: style="color:#[0-9A-F]+")?>'), '$1 style="color:#B7D44B">');
    }
    if (o.css) h = h.replace('</style>', o.css + '\n</style>');
    footer = footer.replace(/\.\.\/\.\.\/assets\//g, rel);
    var script = '<script>\n(function(){\n  function check(){var h=window.innerHeight||800;document.querySelectorAll(\'[data-reveal]:not([data-in])\').forEach(function(el){if(el.getBoundingClientRect().top<h*0.92)el.setAttribute(\'data-in\',\'\');});}\n  window.addEventListener(\'scroll\',check,{passive:true});window.addEventListener(\'resize\',check,{passive:true});check();\n})();\n</script>\n<script src=\"../../assets/form.js\" defer></script>\n<script>addEventListener(\"load\",function(){var f=document.getElementById(\"awForm\");if(!f||f.dataset.awBound)return;f.addEventListener(\"submit\",function(e){e.preventDefault();var p=document.createElement(\"p\");p.style.cssText=\"font-size:14px;line-height:1.5;color:#E0A0A6;margin:0\";p.textContent=\"Wysyłka formularza jest chwilowo niedostępna. Napisz na biuro@agro-weld.pl lub zadzwoń: +48 725 140 257.\";f.appendChild(p);});});</script>\n</body>\n</html>\n';
    return h + o.body + '\n' + footer + script.replace(/\.\.\/\.\.\/assets\//g, rel);
  }

  function crumbs(items) {
    return '<nav aria-label="breadcrumb" class="mono" data-reveal style="font-size:12px;color:#8A8163;padding:22px 0 0">' +
      items.map(function (it, i) { return i < items.length - 1 ? '<a href="' + it[1] + '" style="color:#41571F;text-decoration:none">' + esc(it[0]) + '</a> <span style="color:#8C3A43">/</span> ' : '<span style="color:#14160E;font-weight:700">' + esc(it[0]) + '</span>'; }).join('') + '</nav>';
  }
  function kicker(left, right, dark) {
    return '<div data-reveal style="display:flex;align-items:center;justify-content:space-between;gap:20px;border-top:1px solid ' + (dark ? 'rgba(236,231,215,.16)' : 'rgba(20,22,14,.18)') + ';border-bottom:1px solid ' + (dark ? 'rgba(236,231,215,.16)' : 'rgba(20,22,14,.18)') + ';padding:13px 0;margin-top:20px;font-family:\'Space Mono\',monospace;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase"><span style="color:#8C3A43">/ ' + esc(left) + '</span><span style="color:' + (dark ? '#B7D44B' : '#41571F') + '">' + esc(right) + '</span></div>';
  }
  function heroLight(o) {
    return '<section style="position:relative;background:#ECE7D7;overflow:hidden">\n' +
      '  <div aria-hidden="true" style="position:absolute;inset:0;background-image:linear-gradient(rgba(20,22,14,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(20,22,14,.06) 1px,transparent 1px);background-size:66px 66px;mask-image:radial-gradient(circle at 74% 46%,#000 0%,transparent 66%);-webkit-mask-image:radial-gradient(circle at 74% 46%,#000 0%,transparent 66%)"></div>\n' +
      '  <div class="pad" style="max-width:1280px;margin:0 auto;padding:0 32px;position:relative">\n' + crumbs(o.crumbs) + kicker(o.k1, o.k2) +
      '    <div style="max-width:820px;padding:44px 0 ' + (o.tight ? '40px' : '56px') + '">\n' +
      '      <h1 data-reveal style="font-size:clamp(40px,5vw,64px);line-height:1;font-weight:700;letter-spacing:-.03em;margin-bottom:22px;text-wrap:balance;color:#14160E">' + o.h1 + '</h1>\n' +
      '      <p data-reveal style="font-size:18px;line-height:1.62;color:#4C543B;max-width:640px;text-wrap:pretty">' + esc(o.lead) + '</p>\n' + (o.extra || '') +
      '    </div>\n  </div>\n</section>';
  }
  function cta(h, p, label, href) {
    return '<section style="background:#ECE7D7;padding:72px 0"><div class="pad" style="max-width:1280px;margin:0 auto;padding:0 32px">' +
      '<div data-reveal style="background:linear-gradient(165deg,#243015,#1A2110);padding:46px 44px;display:flex;align-items:center;justify-content:space-between;gap:28px;flex-wrap:wrap"><div>' +
      '<h2 style="font-size:28px;font-weight:700;color:#fff;margin-bottom:10px;text-wrap:balance">' + esc(h) + '</h2><p style="font-size:15.5px;line-height:1.6;color:#A7AE92;max-width:560px;text-wrap:pretty">' + esc(p) + '</p></div>' +
      '<a class="btn btnc" href="' + (href || '/kontakt/') + '" style="background:#ECE7D7;color:#14160E;border:1.5px solid #ECE7D7;padding:16px 28px;font-weight:700;font-size:15.5px">' + esc(label || 'Zapytaj o ofertę') + ' <span class="aru">↗</span></a></div></div></section>';
  }

  // ---------- realizacje ----------
  function realCard(r, rel) {
    return '<a class="rz" href="/realizacje/' + r.slug + '/" style="background:#ECE7D7;display:flex;flex-direction:column;color:#14160E;text-decoration:none">' +
      '<span style="height:240px;overflow:hidden;border-bottom:1px solid #14160E;display:block"><img class="rzimg" src="' + rel + 'assets/' + r.img + '" alt="' + escA(r.title + ' — realizacja Agro-Weld') + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block"></span>' +
      '<span style="padding:20px 22px 24px;flex:1;display:flex;flex-direction:column"><span class="mono" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:11px;font-size:11px;letter-spacing:.05em"><span style="color:#8C3A43;font-weight:700">REF. ' + esc(r.ref) + '</span><span style="color:#8A8163;text-transform:uppercase;letter-spacing:.1em">' + esc(r.cat) + '</span></span>' +
      '<h3 style="font-size:23px;letter-spacing:-.01em;line-height:1.12;margin-bottom:10px;text-wrap:balance">' + esc(r.title) + '</h3><p style="font-size:14.5px;line-height:1.55;color:#56603F;text-wrap:pretty;margin-bottom:16px">' + esc(r.lead) + '</p>' +
      '<span class="mono" style="margin-top:auto;font-size:11px;font-weight:700;color:#41571F">Zobacz realizację <span class="rzarr">↗</span></span></span></a>';
  }
  function renderRealizacje(list, tpl) {
    var body = heroLight({ crumbs: [['Start', '/'], ['Realizacje']], k1: 'Realizacje', k2: '', h1: 'Wdrożone linie <span style="color:#3B5115">i maszyny u klientów</span>', lead: 'Każda realizacja zaczyna się od surowca, skali produkcji i układu hali klienta. Poniżej wybrane wdrożenia — od pojedynczych stanowisk po kompletne linie pod klucz.' }) +
      '<main><section style="background:#ECE7D7;padding:0 0 84px"><div class="pad" style="max-width:1280px;margin:0 auto;padding:0 32px">' +
      '<div data-reveal class="rzgrid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:#14160E;border:1px solid #14160E">' + list.map(function (r) { return realCard(r, '../'); }).join('') + '</div></div></section>' +
      cta('Twoja realizacja może być następna.', 'Opisz surowiec, skalę produkcji i halę — zaprojektujemy linię lub dobierzemy maszynę i przygotujemy wycenę.', 'Porozmawiajmy') + '</main>';
    return shell(tpl, { depth: 1, url: 'https://www.agro-weld.pl/realizacje/', ogImage: (list[0] && list[0].img ? 'assets/' + list[0].img : ''), title: 'Realizacje - wdrożone linie i maszyny Agro-Weld | Agro-Weld', desc: 'Case studies wdrożeń Agro-Weld: linia do sortowania borówki, linia licząco-pakująca do cytrusów INOX, stół selekcyjny INOX, stanowisko pakowania z raszlownicą.', active: 'realizacje', body: body,
      css: '.rz{transition:background .3s}.rz:hover{background:#F4EFE2}.rz:hover .rzimg{transform:scale(1.05)}.rzimg{transition:transform .6s cubic-bezier(.2,.7,.2,1)}.rzarr{display:inline-block;transition:transform .3s}.rz:hover .rzarr{transform:translate(3px,-3px)}@media(max-width:900px){.rzgrid{grid-template-columns:1fr!important}}' });
  }
  function caseGallery(r) {
    var g = (r.gallery || []).slice(1);
    if (!g.length) return '';
    return '<div class="cgal" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:26px">' + g.map(function (src) {
      return '<figure style="margin:0;background:#14160E;padding:4px"><div style="overflow:hidden;aspect-ratio:4/3"><img src="../../assets/' + escA(src) + '" alt="' + escA(r.title + ' - realizacja Agro-Weld') + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block"></div></figure>';
    }).join('') + '</div>';
  }
  function caseVideo(r) {
    if (!r.video) return '';
    return '<section style="background:#1E2113;color:#ECE7D7;padding:72px 0"><div class="pad" style="max-width:1280px;margin:0 auto;padding:0 32px">' +
      '<div class="mono" data-reveal style="font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#B7D44B;margin-bottom:18px">/ Maszyna w pracy</div>' +
      '<div data-reveal style="max-width:900px;background:#14160E;padding:6px"><div style="position:relative;aspect-ratio:16/9"><iframe data-aw-src="https://www.youtube-nocookie.com/embed/' + escA(r.video) + '" title="' + escA(r.title + ' - film') + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0;display:block"></iframe></div></div>' +
      '</div></section>';
  }
  function renderCase(r, list, machines, tpl) {
    var ms = r.machines.map(function (id) { return machines.find(function (m) { return m.id === id; }); }).filter(Boolean);
    var body = '<section style="position:relative;background:#14160E;color:#ECE7D7;overflow:hidden"><div class="pad" style="max-width:1280px;margin:0 auto;padding:0 32px;position:relative">' +
      '<nav aria-label="breadcrumb" class="mono" data-reveal style="font-size:12.5px;color:#7E8A63;letter-spacing:.03em;display:flex;gap:8px;flex-wrap:wrap;padding:24px 0 0"><a class="awlink" href="/" style="color:#8FA862">Start</a><span style="color:#3E4630">/</span><a class="awlink" href="/realizacje/" style="color:#8FA862">Realizacje</a><span style="color:#3E4630">/</span><span style="color:#B7D44B">' + esc(r.title) + '</span></nav>' +
      kicker('Realizacja · REF. ' + r.ref, r.cat, true) +
      '<div class="hero2" style="display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;padding:46px 0 60px"><div>' +
      '<h1 data-reveal style="font-size:clamp(38px,4.6vw,58px);line-height:1;letter-spacing:-.03em;margin-bottom:22px;text-wrap:balance;color:#ECE7D7">' + esc(r.title) + '</h1>' +
      '<p data-reveal style="font-size:18px;line-height:1.6;color:#A7AE92;max-width:540px;text-wrap:pretty;margin-bottom:30px">' + esc(r.lead) + '</p>' +
      '<dl data-reveal style="display:grid;grid-template-columns:auto 1fr;gap:10px 22px;font-size:14.5px;border-top:1px solid rgba(236,231,215,.16);padding-top:16px">' + r.facts.map(function (f) { return '<dt class="mono" style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7E8A63;padding-top:3px">' + esc(f[0]) + '</dt><dd style="color:#ECE7D7;font-weight:600">' + esc(f[1]) + '</dd>'; }).join('') + '</dl></div>' +
      '<figure data-reveal style="position:relative;background:#1E2113;padding:6px;box-shadow:0 2px 4px rgba(0,0,0,.3),0 28px 60px -20px rgba(0,0,0,.8)"><div style="overflow:hidden;aspect-ratio:4/3;outline:1px solid rgba(140,58,67,.7);outline-offset:-1px"><img src="../../assets/' + r.img + '" alt="' + escA(r.title + ' — realizacja Agro-Weld') + '" style="width:100%;height:100%;object-fit:cover;display:block"></div></figure></div></div></section>' +
      '<main><section style="background:#ECE7D7;color:#14160E;padding:80px 0"><div class="pad" style="max-width:1280px;margin:0 auto;padding:0 32px"><div class="art2" style="display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:64px;align-items:start">' +
      '<div data-reveal><div class="mono" style="font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#8C3A43;margin-bottom:18px">/ Zadanie i rozwiązanie</div>' + r.body.map(function (p) { return '<p style="font-size:17px;line-height:1.7;color:#3B4230;margin-bottom:18px;text-wrap:pretty">' + esc(p) + '</p>'; }).join('') + caseGallery(r) + '</div>' +
      '<aside data-reveal><div class="mono" style="font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#8C3A43;margin-bottom:14px">/ Maszyny w realizacji</div><div style="display:flex;flex-direction:column;border-top:1px solid rgba(20,22,14,.18)">' +
      ms.map(function (m) { return '<a class="relm" href="' + escA(m.url || '/maszyny/') + '" style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid rgba(20,22,14,.16);text-decoration:none;color:#14160E"><span style="width:60px;height:46px;flex:none;background:#F4EFE2;border:1px solid rgba(20,22,14,.14);display:flex;align-items:center;justify-content:center;overflow:hidden"><img src="../../assets/' + (m.img || 'maszyna-placeholder.png') + '" alt="' + escA(m.name) + '" loading="lazy" style="' + (m.imgType === 'photo' ? 'width:100%;height:100%;object-fit:cover' : 'max-width:86%;max-height:86%;object-fit:contain') + '"></span><span style="flex:1;font-size:15px;font-weight:700">' + esc(m.name) + '<br><span class="mono" style="font-size:10px;font-weight:400;color:#8A8163">' + esc(m.models || '') + '</span></span><span class="rarr" style="color:#8C3A43;font-weight:700">↗</span></a>'; }).join('') + '</div></aside></div></div></section>' +
      caseVideo(r) +
      '<section style="background:#F4EFE2;padding:64px 0;border-top:1px solid rgba(20,22,14,.12)"><div class="pad" style="max-width:1280px;margin:0 auto;padding:0 32px"><div data-reveal style="display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:26px;font-family:\'Space Mono\',monospace;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase"><span style="color:#8C3A43">/ Inne realizacje</span><a href="/realizacje/" style="color:#41571F;text-decoration:none">Wszystkie →</a></div>' +
      '<div data-reveal class="rzgrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#14160E;border:1px solid #14160E">' + list.filter(function (x) { return x.slug !== r.slug; }).map(function (x) { return realCard(x, '../../'); }).join('') + '</div></div></section>' +
      cta('Podobne zadanie w Twoim zakładzie?', 'Opisz surowiec i skalę produkcji — zaproponujemy maszyny lub linię dopasowaną do Twojej hali.', 'Porozmawiajmy') + '</main>';
    return shell(tpl, { depth: 2, url: 'https://www.agro-weld.pl/realizacje/' + r.slug + '/', ogImage: (r.img ? 'assets/' + r.img : ''), title: r.metaTitle || (r.title + ' - realizacja | Agro-Weld'), desc: r.metaDesc || r.lead, active: 'realizacje', body: body,
      css: '.rz{transition:background .3s}.rz:hover{background:#F4EFE2}.rz:hover .rzimg{transform:scale(1.05)}.rzimg{transition:transform .6s cubic-bezier(.2,.7,.2,1)}.rzarr{display:inline-block;transition:transform .3s}.rz:hover .rzarr{transform:translate(3px,-3px)}.relm{transition:background .25s}.relm:hover{background:#F4EFE2}.relm:hover .rarr{transform:translate(3px,-3px)}.rarr{display:inline-block;transition:transform .3s}@media(max-width:900px){.rzgrid{grid-template-columns:1fr!important}.cgal{grid-template-columns:repeat(2,1fr)!important}}' });
  }

  var api = { shell: shell, heroLight: heroLight, kicker: kicker, crumbs: crumbs, cta: cta, renderRealizacje: renderRealizacje, renderCase: renderCase, esc: esc, escA: escA };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PageRender = api;
})(typeof window !== 'undefined' ? window : this);
