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
    var th = 'font-family:\'Space Mono\',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#8FA862;padding:12px 14px;font-weight:700;text-align:left;white-space:nowrap';
    var td = 'font-size:14.5px;color:#C3C8AF;padding:12px 14px;line-height:1.45;vertical-align:top';
    var head = multi ? '<thead><tr style="background:#181B10;border-bottom:1px solid rgba(236,231,215,.14)"><th scope="col" style="' + th + '">Parametr</th>' + p.models.map(function (m) { return '<th scope="col" style="' + th + ';color:#B7D44B">' + esc(m) + '</th>'; }).join('') + '</tr></thead>' : '';
    var rows = p.specs.map(function (r, i) {
      var last = i === p.specs.length - 1;
      return '<tr style="' + (last ? '' : 'border-bottom:1px solid rgba(236,231,215,.1)') + '"><th scope="row" style="font-size:14.5px;color:#8E9678;font-weight:400;text-align:left;padding:12px 14px;vertical-align:top">' + esc(r[0]) + '</th>' +
        r.slice(1).map(function (c) { return '<td style="' + td + (multi ? '' : ';font-weight:700;color:#ECE7D7;text-align:right') + '">' + esc(c) + '</td>'; }).join('') + '</tr>';
    }).join('\n');
    var common = (p.common || []).map(function (r, i) {
      return '<tr style="border-bottom:1px solid rgba(236,231,215,.1)"><th scope="row" style="font-size:14.5px;color:#8E9678;font-weight:400;text-align:left;padding:12px 14px;vertical-align:top">' + esc(r[0]) + '</th><td colspan="' + Math.max(1, p.models.length) + '" style="' + td + ';color:#ECE7D7">' + esc(r[1]) + '</td></tr>';
    }).join('\n');
    return '<div style="overflow-x:auto;border:1px solid rgba(236,231,215,.14)"><table style="width:100%;border-collapse:collapse;min-width:' + (multi ? 520 : 0) + 'px">' + head + '<tbody>' + rows + (common ? '\n<tr><td colspan="' + (p.models.length + 1) + '" style="padding:0;border-top:2px solid rgba(236,231,215,.3)"></td></tr>\n' + common : '') + '</tbody></table></div>' +
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
        '        <span class="relimg" style="width:96px;height:74px;border-radius:10px;background:#1B2011;border:1px solid rgba(236,231,215,.12);display:flex;align-items:center;justify-content:center;overflow:hidden"><img src="' + escA(img) + '" alt="' + escA(x.name) + '" loading="lazy" style="' + (x.imgPhoto ? 'width:100%;height:100%;object-fit:cover' : 'max-width:82%;max-height:90%;object-fit:contain') + '"></span>\n' +
        '        <span style="min-width:0"><span style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px"><span class="mono" style="font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#8FA862">' + pad2(ci + 1) + ' · ' + esc(CATS[ci][1]) + '</span><span class="rel2a" style="font-size:15px;color:#8C3A43;font-weight:700">↗</span></span>\n' +
        '        <span style="font-size:18px;font-weight:700;color:#ECE7D7;display:block;line-height:1.15">' + esc(x.name) + '</span></span>\n      </a></li>';
    }).join('\n      ');
  }
  function stages(cat) {
    return CATS.map(function (c, i) {
      var cur = c[0] === cat;
      return '<li style="display:flex;align-items:center;gap:9px;white-space:nowrap;color:' + (cur ? '#B7D44B' : '#8E9678') + '"><span style="width:9px;height:9px;border-radius:50%;background:' + (cur ? '#B7D44B' : '#3E4630') + ';display:inline-block"></span>' + (cur ? pad2(i + 1) + ' ' + esc(c[1]) : '<a class="awlink" href="/maszyny/' + c[0] + '/" style="color:inherit">' + pad2(i + 1) + ' ' + esc(c[1]) + '</a>') + (i < CATS.length - 1 ? ' <span aria-hidden="true" style="color:#3E4630;margin-left:4px">→</span>' : '') + '</li>';
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
      { '@type': 'Product', name: p.name, description: p.metaDesc || p.lead, url: url, image: p.img ? 'https://www.agro-weld.pl/assets/' + p.img : undefined,
        brand: { '@type': 'Brand', name: 'Agro-Weld' }, manufacturer: { '@type': 'Organization', name: 'Agro-Weld Spółka z ograniczoną odpowiedzialnością' },
        model: single ? undefined : p.models.join(', '), category: catName }
    ] });
    var img = p.img ? '../../../assets/' + p.img : '../../../assets/maszyna-placeholder.png';
    var fill = {
      META_TITLE: esc(p.metaTitle || p.name + ' – Agro-Weld'), META_DESC: escA(p.metaDesc || p.lead), URL: url, JSONLD: jsonld,
      CAT: p.cat, CATNAME: esc(catName), CATNUM: pad2(ci + 1), NAME: esc(p.name), LEAD: esc(p.lead), DESC: esc(p.desc || ''),
      MODELS_LABEL: single ? 'Wykonanie na zamówienie' : (p.models.length + (p.models.length === 1 ? ' model' : p.models.length < 5 ? ' modele' : ' modeli')),
      MODEL_CHIPS: single ? '' : '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px">' + p.models.map(function (m) { return '<span class="mono" style="font-size:12px;font-weight:700;letter-spacing:.04em;color:#B7D44B;border:1px solid rgba(183,212,75,.4);padding:8px 13px;border-radius:6px">' + esc(m) + '</span>'; }).join('') + '</div>',
      IMG: escA(img), IMG_ALT: escA(p.name + (single ? '' : ' ' + p.models.join(' / ')) + ' — maszyna Agro-Weld'),
      IMG_STYLE: p.imgPhoto ? 'width:100%;height:100%;object-fit:cover;display:block' : 'width:100%;max-width:460px;height:auto;display:block;filter:drop-shadow(0 24px 30px rgba(0,0,0,.28))',
      IMG_WRAP: p.imgPhoto ? 'padding:0;aspect-ratio:4/3' : 'padding:52px 38px 44px',
      FEATURES: (p.features || []).map(function (f, i) {
        return '<li style="background:#181B10;padding:24px 22px"><span style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(183,212,75,.36);color:#B7D44B;margin-bottom:16px">' + svg(i) + '</span><h3 style="font-size:18px;color:#ECE7D7;margin-bottom:8px">' + esc(f[0]) + '</h3><p style="font-size:14px;line-height:1.55;color:#8E9678;text-wrap:pretty">' + esc(f[1]) + '</p></li>';
      }).join('\n'),
      SPECS: specTable(p), STANDARD: list(p.standard, false), OPTIONS: list(p.options, false), USES: esc(p.uses || ''),
      STAGES: stages(p.cat), RELATED: related(p, all, machines)
    };
    var html = tpl;
    Object.keys(fill).forEach(function (k) { html = html.split('{{' + k + '}}').join(fill[k] == null ? '' : fill[k]); });
    return html;
  }
  var api = { render: render, CATS: CATS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ProduktRender = api;
})(typeof window !== 'undefined' ? window : this);
