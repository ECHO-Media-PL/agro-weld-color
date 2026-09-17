// Renderer karty produktu — templates/produkt.html + content/produkty.json
(function (root) {
  var CATS = [['rozladunek-skrzyn','Rozładunek skrzyń'],['przyjecie-i-buforowanie','Przyjęcie i buforowanie'],['oczyszczanie','Oczyszczanie'],['sortowanie','Sortowanie'],['selekcja','Selekcja'],['wazenie-i-liczenie','Ważenie i liczenie'],['pakowanie','Pakowanie'],['paletyzacja','Paletyzacja'],['przenosniki','Przenośniki'],['pielenie','Pielenie']];
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
  var escA = function (s) { return esc(s).replace(/"/g,'&quot;'); };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var ICONS = [
    '<path d="M3 12h4l2-3 3 9 2-6h4"></path>',
    '<path d="M12 3l7 4v5c0 4-3 7-7 9-4-2-7-5-7-9V7z"></path>',
    '<path d="M4 8l8-4 8 4v8l-8 4-8-4z M4 8l8 4 8-4 M12 12v8"></path>'
  ];
  var svg = function (i) { return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + ICONS[i % ICONS.length] + '</svg>'; };

  function specTable(p) {
    var multi = p.models.length > 1 && p.specs.length && p.specs[0].length > 2;
    var th = 'font-family:\'Space Mono\',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#8FA862;padding:12px 14px;font-weight:700;text-align:left';
    var dense = p.models.length >= 5;
    var td = 'font-size:' + (dense ? '13px' : '14.5px') + ';color:#C3C8AF;padding:' + (dense ? '10px 10px' : '12px 14px') + ';line-height:1.45;vertical-align:top';
    var head = multi ? '<thead><tr style="background:#181B10;border-bottom:1px solid rgba(236,231,215,.14)"><th scope="col" style="' + th + '">Parametr</th>' + p.models.map(function (m) { return '<th scope="col" style="' + th + ';color:#B7D44B">' + esc(m) + '</th>'; }).join('') + '</tr></thead>' : '';
    var rows = p.specs.map(function (r, i) {
      var last = i === p.specs.length - 1;
      return '<tr style="' + (last ? '' : 'border-bottom:1px solid rgba(236,231,215,.1)') + '"><th scope="row" style="font-size:14.5px;color:#8E9678;font-weight:400;text-align:left;padding:12px 14px;vertical-align:top">' + esc(r[0]) + '</th>' +
        r.slice(1).map(function (c) { return '<td style="' + td + (multi ? '' : ';font-weight:700;color:#ECE7D7;text-align:right') + '">' + esc(c) + '</td>'; }).join('') + '</tr>';
    }).join('\n');
    var common = (p.common || []).map(function (r, i) {
      return '<tr style="' + (i === p.common.length - 1 ? '' : 'border-bottom:1px solid rgba(236,231,215,.1)') + '"><th scope="row" style="font-size:14.5px;color:#8E9678;font-weight:400;text-align:left;padding:12px 14px;vertical-align:top">' + esc(r[0]) + '</th><td colspan="' + Math.max(1, p.models.length) + '" style="' + td + ';color:#ECE7D7">' + esc(r[1]) + '</td></tr>';
    }).join('\n');
    var thr = 'font-size:' + (dense ? '13px' : '14.5px') + ';color:#8E9678;font-weight:400;text-align:left;padding:' + (dense ? '10px 10px' : '12px 14px') + ';vertical-align:top';
    // wyposażenie: pozycja = "tekst" (wszystkie modele) lub ["tekst", ["MODEL", ...]] (tylko wskazane modele)
    var cols = Math.max(1, p.models.length);
    var mark = function (kind) {
      if (kind === 'std') return '<span role="img" aria-label="w standardzie" style="display:inline-flex;width:18px;height:18px;border-radius:4px;background:#B7D44B;color:#14160E;align-items:center;justify-content:center;font-size:12px;font-weight:700;line-height:1">✓</span>';
      if (kind === 'opt') return '<span role="img" aria-label="opcja" style="display:inline-flex;width:18px;height:18px;border-radius:4px;border:1.5px solid #8FA862;color:#8FA862;align-items:center;justify-content:center;font-size:12px;font-weight:700;line-height:1">✓</span>';
      return '<span aria-label="niedostępne" style="color:#5E6A47">—</span>';
    };
    var eqRows = function (items, kind) {
      return (items || []).map(function (it) {
        var label = Array.isArray(it) ? it[0] : it, only = Array.isArray(it) ? it[1] : null;
        var cells = multi ? p.models.map(function (m) { return '<td style="' + td + '">' + mark(!only || only.indexOf(m) >= 0 ? kind : 'no') + '</td>'; }).join('') : '<td colspan="' + cols + '" style="' + td + ';text-align:right">' + mark(kind) + '</td>';
        return '<tr style="border-bottom:1px solid rgba(236,231,215,.1)"><th scope="row" style="' + thr + '">' + esc(label) + '</th>' + cells + '</tr>';
      }).join('\n');
    };
    var eqHead = function (label) { return '<tr><th scope="colgroup" colspan="' + (cols + 1) + '" style="font-family:\'Space Mono\',monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#8C3A43;font-weight:700;text-align:left;padding:18px 14px 8px;background:#181B10">/ ' + label + '</th></tr>'; };
    var std = eqRows(p.standard, 'std'), opt = eqRows(p.options, 'opt');
    var equip = (std || opt) ? '\n<tr><td colspan="' + (cols + 1) + '" style="padding:0;border-top:2px solid rgba(236,231,215,.3)"></td></tr>\n' +
      (std ? eqHead('Wyposażenie podstawowe') + '\n' + std + '\n' : '') + (opt ? eqHead('Opcje dodatkowe') + '\n' + opt : '') : '';
    var legend = (std || opt) ? '<p class="mono" style="display:flex;flex-wrap:wrap;gap:8px 20px;align-items:center;font-size:11px;color:#7E8A63;margin-top:14px">' + (std ? '<span style="display:inline-flex;align-items:center;gap:8px">' + mark('std') + ' w standardzie</span>' : '') + (opt ? '<span style="display:inline-flex;align-items:center;gap:8px">' + mark('opt') + ' opcja dodatkowa</span>' : '') + (multi ? '<span style="display:inline-flex;align-items:center;gap:8px">' + mark('no') + ' niedostępne w tym modelu</span>' : '') + '</p>' : '';
    return '<div style="border:1px solid rgba(236,231,215,.14)"><table style="width:100%;border-collapse:collapse">' + head + '<tbody>' + rows + (common ? '\n<tr><td colspan="' + (cols + 1) + '" style="padding:0;border-top:2px solid rgba(236,231,215,.3)"></td></tr>\n' + common : '') + equip + '</tbody></table></div>' + legend +
      (p.note ? '<p class="mono" style="font-size:11.5px;line-height:1.55;color:#7E8A63;margin-top:14px">' + esc(p.note) + '</p>' : '');
  }
  function list(items, dark) {
    if (!items || !items.length) return '<p style="font-size:14.5px;color:' + (dark ? '#7E8A63' : '#8A8163') + '">Konfiguracja indywidualna — zapytaj.</p>';
    return '<ol style="border-top:1px solid ' + (dark ? 'rgba(236,231,215,.16)' : 'rgba(20,22,14,.18)') + '">' + items.map(function (t, i) {
      return '<li style="display:flex;align-items:baseline;gap:16px;padding:14px 2px;border-bottom:1px solid ' + (dark ? 'rgba(236,231,215,.12)' : 'rgba(20,22,14,.14)') + '"><span class="mono" style="font-size:11px;font-weight:700;color:#8C3A43">' + pad2(i + 1) + '</span><span style="font-size:15.5px;font-weight:600;color:' + (dark ? '#E4E6D6' : '#14160E') + '">' + esc(t) + '</span></li>';
    }).join('') + '</ol>';
  }
  function related(p, all, machines) {
    var same = all.filter(function (x) { return x.cat === p.cat && x.slug !== p.slug; });
    var others = all.filter(function (x) { return x.cat !== p.cat; });
    var idx = CATS.findIndex(function (c) { return c[0] === p.cat; });
    others.sort(function (a, b) { var ia = CATS.findIndex(function (c) { return c[0] === a.cat; }), ib = CATS.findIndex(function (c) { return c[0] === b.cat; }); return Math.abs(ia - idx) - Math.abs(ib - idx); });
    var pick = same.slice(0, 1).concat(others.filter(function (x, i, arr) { return arr.findIndex(function (y) { return y.cat === x.cat; }) === i; })).slice(0, 3);
    return pick.map(function (x) {
      var ci = CATS.findIndex(function (c) { return c[0] === x.cat; });
      var img = x.img ? '../../../assets/' + x.img : '../../../assets/maszyna-placeholder.png';
      return '<li style="display:contents"><a class="rel2" href="/maszyny/' + x.cat + '/' + x.slug + '/">\n' +
        '        <span class="relimg" style="width:96px;height:74px;border-radius:10px;background:#ECE7D7;border:1px solid rgba(236,231,215,.12);display:flex;align-items:center;justify-content:center;overflow:hidden"><img src="' + escA(img) + '" alt="' + escA(x.name) + '" loading="lazy" style="' + (x.imgPhoto ? 'width:100%;height:100%;object-fit:cover' : 'max-width:82%;max-height:90%;object-fit:contain') + '"></span>\n' +
        '        <span style="min-width:0"><span style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px"><span class="mono" style="font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#8FA862">' + pad2(ci + 1) + ' · ' + esc(CATS[ci][1]) + '</span><span class="rel2a" style="font-size:15px;color:#8C3A43;font-weight:700">↗</span></span>\n' +
        '        <span style="font-size:18px;font-weight:700;color:#ECE7D7;display:block;line-height:1.15">' + esc(x.name) + '</span></span>\n      </a></li>';
    }).join('\n      ');
  }
  var slugify = function (s) { return String(s).toLowerCase().replace(/[ąćęłńóśźż]/g, function (c) { return ({ 'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z' })[c]; }).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var stripTags = function (s) { return String(s).replace(/<[^>]+>/g, ''); };
  function gallery(p) {
    var g = p.gallery || []; if (g.length < 2) return '';
    return '<div class="gal" style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px">' + g.map(function (it, i) {
      return '<button type="button" class="gthumb" data-src="../../../assets/' + escA(it[0]) + '" data-alt="' + escA(it[1]) + '" aria-label="' + escA(it[1]) + '"' + (i === 0 ? ' aria-current="true"' : '') + ' style="width:88px;height:66px;padding:6px;background:#ECE7D7;border:2px solid ' + (i === 0 ? '#B7D44B' : 'rgba(236,231,215,.18)') + ';border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center"><img src="../../../assets/' + escA(it[0]) + '" alt="" loading="lazy" style="max-width:100%;max-height:100%;object-fit:contain;display:block"></button>';
    }).join('') + '</div>';
  }
  function sectionsBlock(p) {
    var s = p.sections || []; if (!s.length) return '';
    var toc = s.map(function (x, i) { return '<li><a class="toclink" href="#s-' + slugify(x.h2).slice(0, 48) + '" style="display:flex;gap:12px;align-items:baseline;padding:10px 0;border-bottom:1px solid rgba(20,22,14,.12);font-size:13.5px;font-weight:600;color:#3B4230;text-decoration:none"><span class="mono" style="font-size:10px;color:#8C3A43;width:26px;flex-shrink:0">' + pad2(i + 1) + '</span><span>' + esc(x.h2) + '</span></a></li>'; }).join('\n          ');
    var body = s.map(function (x, i) {
      return '<section id="s-' + slugify(x.h2).slice(0, 48) + '" data-reveal style="scroll-margin-top:96px;padding:' + (i ? '30px' : '0') + ' 0 12px;' + (i ? 'border-top:1px solid rgba(20,22,14,.18)' : '') + '">\n' +
        '          <div class="mono" style="font-size:11px;font-weight:700;letter-spacing:.14em;color:#8C3A43;margin-bottom:10px">' + pad2(i + 1) + '</div>\n' +
        '          <h2 style="font-size:28px;font-weight:700;line-height:1.12;margin-bottom:14px;text-wrap:balance;color:#14160E">' + esc(x.h2) + '</h2>\n' +
        '          <p style="font-size:16.5px;line-height:1.7;color:#3B4230;text-wrap:pretty">' + x.p + '</p>\n        </section>';
    }).join('\n        ');
    return '<section id="o-maszynie" style="background:#ECE7D7;color:#14160E;padding:0 0 88px;scroll-margin-top:80px">\n' +
      '  <div class="pad" style="max-width:1280px;margin:0 auto;padding:0 32px">\n' +
      '    <div class="art2" style="display:grid;grid-template-columns:300px minmax(0,1fr);gap:64px;align-items:start;border-top:1px solid rgba(20,22,14,.18);padding-top:64px">\n' +
      '      <aside class="toc" data-reveal style="position:sticky;top:110px">\n' +
      '        <div class="mono" style="font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#8C3A43;margin-bottom:14px">/ O maszynie</div>\n' +
      '        <ul>\n          ' + toc + '\n        </ul>\n      </aside>\n' +
      '      <div class="article" style="max-width:760px">\n        ' + body + '\n      </div>\n    </div>\n  </div>\n</section>';
  }
  function faqBlock(p) {
    var f = p.faq || []; if (!f.length) return '';
    var items = f.map(function (x, i) {
      return '<details class="faq" style="border-top:1px solid rgba(236,231,215,.16)"' + (i === 0 ? ' open' : '') + '>\n' +
        '          <summary style="display:flex;gap:18px;align-items:baseline;padding:20px 0;cursor:pointer;list-style:none;font-family:\'Chakra Petch\',sans-serif;font-size:19px;font-weight:700;line-height:1.25;color:#ECE7D7"><span class="mono" style="font-size:11px;color:#8C3A43;flex-shrink:0;width:26px">' + pad2(i + 1) + '</span><span style="flex:1">' + esc(x.q) + '</span><span class="faqmark" style="color:#B7D44B;font-size:20px;flex-shrink:0">+</span></summary>\n' +
        '          <p class="faqa" style="padding:0 0 22px 44px;font-size:15.5px;line-height:1.65;color:#A7AE92;text-wrap:pretty">' + x.a + '</p>\n        </details>';
    }).join('\n        ');
    return '<section id="faq" style="background:#1E2113;color:#ECE7D7;padding:88px 0;scroll-margin-top:80px">\n' +
      '  <div class="pad" style="max-width:1280px;margin:0 auto;padding:0 32px">\n' +
      '    <div class="specgrid" style="display:grid;grid-template-columns:.9fr 1.1fr;gap:64px;align-items:start">\n' +
      '      <div class="sticky" data-reveal style="position:sticky;top:110px">\n' +
      '        <div class="mono" style="font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#B7D44B;margin-bottom:14px">/ FAQ</div>\n' +
      '        <h2 style="font-size:34px;line-height:1.06;color:#ECE7D7;margin-bottom:16px;text-wrap:balance">Najczęściej zadawane pytania</h2>\n' +
      '        <p style="font-size:15.5px;line-height:1.62;color:#A7AE92;max-width:340px;text-wrap:pretty">Nie znalazłeś odpowiedzi? <a class="awlink" href="#zapytanie" style="color:#B7D44B">Napisz do nas</a> — odpowiadamy zwykle w ciągu jednego dnia roboczego.</p>\n' +
      '      </div>\n      <div data-reveal style="border-bottom:1px solid rgba(236,231,215,.16)">\n        ' + items + '\n      </div>\n    </div>\n  </div>\n</section>';
  }
  // wyposażenie i opcje są częścią tabeli danych technicznych (specTable) — osobna sekcja nie jest już renderowana
  function equipBlock() { return ''; }
  function variantsBlock(p) {
    var v = p.variants || []; if (!v.length) return '';
    var cards = v.map(function (x) {
      return '<li id="' + escA(x.id) + '" style="background:#ECE7D7;display:flex;flex-direction:column;scroll-margin-top:96px">' +
        '<span style="height:210px;background-color:#F1ECDF;background-image:linear-gradient(rgba(20,22,14,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(20,22,14,.05) 1px,transparent 1px);background-size:24px 24px;display:flex;align-items:center;justify-content:center;padding:18px;border-bottom:1px solid #14160E"><img src="../../../assets/' + escA(x.img) + '" alt="' + escA((p.singular || p.name) + ' ' + x.model + ' — ' + x.capacity) + '" loading="lazy" style="max-width:100%;max-height:100%;object-fit:contain;display:block"></span>' +
        '<span style="padding:22px 24px 24px;display:flex;flex-direction:column;flex:1">' +
        '<span class="mono" style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;font-size:11.5px;letter-spacing:.05em;font-weight:700"><span style="color:#8C3A43">' + esc(x.model) + '</span><span style="color:#41571F">' + esc(x.capacity) + '</span></span>' +
        '<h3 style="font-size:24px;line-height:1.1;letter-spacing:-.01em;margin-bottom:10px;color:#14160E">Kosz przyjęciowy ' + esc(x.model) + '</h3>' +
        '<p style="font-size:14.5px;line-height:1.6;color:#56603F;text-wrap:pretty;margin-bottom:18px">' + esc(x.desc) + '</p>' +
        '<dl style="display:grid;grid-template-columns:auto 1fr;gap:6px 14px;font-size:13px;border-top:1px solid rgba(20,22,14,.18);padding-top:14px;margin-top:auto">' + (x.facts || []).map(function (f) { return '<dt class="mono" style="font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#8A8163;padding-top:2px">' + esc(f[0]) + '</dt><dd style="font-weight:600;color:#14160E">' + esc(f[1]) + '</dd>'; }).join('') + '</dl>' +
        '<a class="awlink mono" href="#dane" style="margin-top:14px;font-size:10.5px;font-weight:700;letter-spacing:.1em;color:#41571F">Wyposażenie i opcje ↓</a>' +
        '</span></li>';
    }).join('\n      ');
    return '<section id="modele" style="background:#ECE7D7;color:#14160E;padding:88px 0;scroll-margin-top:80px">\n' +
      '  <div class="pad" style="max-width:1280px;margin:0 auto;padding:0 32px">\n' +
      '    <div data-reveal style="display:flex;align-items:flex-end;justify-content:space-between;gap:28px;flex-wrap:wrap;margin-bottom:30px">\n' +
      '      <div style="max-width:620px"><div class="mono" style="font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#8C3A43;margin-bottom:14px">/ Modele według pojemności</div>\n' +
      '      <h2 style="font-size:34px;line-height:1.06;text-wrap:balance">Od ' + esc(v[0].capacity) + ' do ' + esc(v[v.length - 1].capacity) + ' — ' + v.length + ' wariantów kosza</h2></div>\n' +
      '      <a class="awlink mono" href="#dane" style="font-size:11px;font-weight:700;letter-spacing:.1em;color:#41571F">Pełna tabela parametrów ↓</a>\n    </div>\n' +
      '    <ul data-reveal class="tilegrid vgrid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#14160E;border:1px solid #14160E">\n      ' + cards + '\n    </ul>\n  </div>\n</section>';
  }
  function stages(cat) {
    var idx = CATS.findIndex(function (c) { return c[0] === cat; });
    return CATS.map(function (c, i) {
      var cur = i === idx, done = i < idx, last = i === CATS.length - 1;
      var lineCol = done ? 'rgba(183,212,75,.55)' : 'rgba(236,231,215,.14)';
      var line = '<span class="stline" aria-hidden="true" style="position:absolute;top:9px;height:2px;background:' + lineCol + ';left:' + (i === 0 ? '10px' : '0') + ';right:' + (last ? 'calc(100% - 10px)' : '0') + '"></span>';
      var dot = cur
        ? '<span class="stdot" style="position:relative;z-index:1;width:20px;height:20px;border-radius:50%;background:#B7D44B;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(183,212,75,.18);animation:awPulse 2.6s infinite"><span style="width:6px;height:6px;border-radius:50%;background:#14160E;display:block"></span></span>'
        : '<span class="stdot" style="position:relative;z-index:1;width:20px;height:20px;border-radius:50%;background:' + (done ? 'rgba(183,212,75,.35)' : '#2A2F1E') + ';border:2px solid ' + (done ? 'rgba(183,212,75,.55)' : '#3E4630') + ';display:block;transition:border-color .2s;background-clip:content-box;padding:0"></span>';
      var label = '<span class="mono stlabel" style="display:block;margin-top:12px;font-size:10.5px;line-height:1.35;letter-spacing:.04em;padding-right:10px">' +
        '<span style="display:block;font-weight:700;color:' + (cur ? '#B7D44B' : done ? '#8FA862' : '#5E6A47') + '">' + pad2(i + 1) + '</span>' +
        '<span style="display:block;margin-top:3px;font-weight:' + (cur ? '700' : '400') + ';color:' + (cur ? '#ECE7D7' : done ? '#8E9678' : '#7E8A63') + '">' + esc(c[1]) + '</span></span>';
      var inner = line + dot + label;
      return '<li style="position:relative;min-width:0">' + (cur ? '<span aria-current="step" style="display:block">' + inner + '</span>' : '<a class="stlink" href="/maszyny/' + c[0] + '/" style="display:block;text-decoration:none;color:inherit">' + inner + '</a>') + '</li>';
    }).join('\n      ');
  }

  function render(p, all, machines, tpl) {
    var ci = CATS.findIndex(function (c) { return c[0] === p.cat; }), catName = CATS[ci][1];
    var url = 'https://www.agro-weld.pl/maszyny/' + p.cat + '/' + p.slug + '/';
    var single = p.models.length === 1 && /indywidual/i.test(p.models[0]);
    var jsonld = JSON.stringify({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Start', item: 'https://www.agro-weld.pl/' },
        { '@type': 'ListItem', position: 2, name: 'Maszyny', item: 'https://www.agro-weld.pl/maszyny/' },
        { '@type': 'ListItem', position: 3, name: catName, item: 'https://www.agro-weld.pl/maszyny/' + p.cat + '/' },
        { '@type': 'ListItem', position: 4, name: p.name, item: url }] },
      { '@type': 'Product', name: p.name, description: p.metaDesc || p.lead, url: url,
        image: (p.gallery && p.gallery.length) ? p.gallery.map(function (g) { return 'https://www.agro-weld.pl/assets/' + g[0]; }) : (p.img ? 'https://www.agro-weld.pl/assets/' + p.img : undefined),
        brand: { '@type': 'Brand', name: 'Agro-Weld' }, manufacturer: { '@type': 'Organization', name: 'Agro-Weld Spółka z ograniczoną odpowiedzialnością' },
        model: single ? undefined : p.models.join(', '), category: catName,
        offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition', priceSpecification: { '@type': 'PriceSpecification', priceCurrency: 'PLN', valueAddedTaxIncluded: false }, url: url, seller: { '@type': 'Organization', name: 'Agro-Weld Spółka z ograniczoną odpowiedzialnością', url: 'https://www.agro-weld.pl/' } } }
    ].concat((p.faq && p.faq.length) ? [{ '@type': 'FAQPage', mainEntity: p.faq.map(function (f) { return { '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: stripTags(f.a) } }; }) }] : []) });
    var img = (p.variants && p.variants.length) ? '../../../assets/' + p.variants[0].img : (p.img ? '../../../assets/' + p.img : '../../../assets/maszyna-placeholder.png');
    var fill = {
      META_TITLE: esc(p.metaTitle || p.name + ' – Agro-Weld'), META_DESC: escA(p.metaDesc || p.lead), URL: url, JSONLD: jsonld,
      CAT: p.cat, CATNAME: esc(catName), CATNUM: pad2(ci + 1), CATNUMINT: String(ci + 1), NAME: esc(p.name), H1: esc(p.h1 || p.name), LEAD: esc(p.lead), DESC: esc(p.desc || ''),
      MODELS_LABEL: single ? 'Wykonanie na zamówienie' : (p.models.length + (p.models.length === 1 ? ' model' : p.models.length < 5 ? ' modele' : ' modeli')),
      MODEL_CHIPS: single ? '' : '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px">' + p.models.map(function (m, i) {
        var v = (p.variants || []).find(function (x) { return x.model === m; });
        if (!v) return '<span class="mono" style="font-size:12px;font-weight:700;letter-spacing:.04em;color:#B7D44B;border:1px solid rgba(183,212,75,.4);padding:8px 13px;border-radius:6px">' + esc(m) + '</span>';
        var on = i === 0;
        return '<button type="button" class="mono mchip" data-src="../../../assets/' + escA(v.img) + '" data-alt="' + escA((p.singular || p.name) + ' ' + v.model + ' — ' + v.capacity) + '" data-cap="' + escA(v.model + ' · ' + v.capacity) + '" data-target="#' + escA(v.id) + '"' + (on ? ' aria-pressed="true"' : ' aria-pressed="false"') + ' style="font-size:12px;font-weight:700;letter-spacing:.04em;cursor:pointer;color:' + (on ? '#14160E' : '#B7D44B') + ';background:' + (on ? '#B7D44B' : 'transparent') + ';border:1px solid rgba(183,212,75,' + (on ? '1' : '.4') + ');padding:8px 13px;border-radius:6px;font-family:inherit">' + esc(m) + '</button>';
      }).join('') + '</div>',
      IMG: escA(img), IMG_ALT: escA((p.variants && p.variants.length) ? ((p.singular || p.name) + ' ' + p.variants[0].model + ' — ' + p.variants[0].capacity) : (p.gallery && p.gallery.length) ? p.gallery[0][1] : (p.name + (single ? '' : ' ' + p.models.join(' / ')) + ' — maszyna Agro-Weld')),
      IMG_CAP: (p.variants && p.variants.length) ? '<div id="awImgCap" class="mono" style="position:absolute;left:18px;bottom:16px;z-index:4;font-size:11px;font-weight:700;letter-spacing:.08em;color:#14160E;background:rgba(236,231,215,.92);border:1px solid rgba(20,22,14,.25);padding:6px 10px;border-radius:5px">' + esc(p.variants[0].model + ' · ' + p.variants[0].capacity) + '</div>' : '',
      GALLERY: gallery(p), VARIANTS_BLOCK: variantsBlock(p), EQUIP_BLOCK: equipBlock(p), SECTIONS_BLOCK: sectionsBlock(p), FAQ_BLOCK: faqBlock(p),
      CTA: p.cta || 'Opisz surowiec, skalę produkcji i posiadane maszyny — skonfigurujemy maszynę pod Twoją linię i przygotujemy wycenę.',
      IMG_STYLE: p.imgPhoto ? 'width:100%;height:100%;object-fit:cover;display:block' : 'width:100%;max-width:460px;height:auto;display:block;filter:drop-shadow(0 24px 30px rgba(0,0,0,.28))',
      IMG_WRAP: p.imgPhoto ? 'padding:0;aspect-ratio:4/3' : 'padding:52px 38px 44px',
      FEATURES: (p.features || []).map(function (f, i) {
        return '<li style="background:#181B10;padding:24px 22px"><span style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(183,212,75,.36);color:#B7D44B;margin-bottom:16px">' + svg(i) + '</span><h3 style="font-size:18px;color:#ECE7D7;margin-bottom:8px">' + esc(f[0]) + '</h3><p style="font-size:14px;line-height:1.55;color:#8E9678;text-wrap:pretty">' + esc(f[1]) + '</p></li>';
      }).join('\n'),
      SPECS: specTable(p), STANDARD: '', OPTIONS: '', USES: esc(p.uses || ''),
      STAGES: stages(p.cat), RELATED: related(p, all, machines)
    };
    var html = tpl;
    Object.keys(fill).forEach(function (k) { html = html.split('{{' + k + '}}').join(fill[k] == null ? '' : fill[k]); });
    return html;
  }
  var api = { render: render, CATS: CATS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ProduktRender = api;
})(typeof window !== 'undefined' ? window : this);
