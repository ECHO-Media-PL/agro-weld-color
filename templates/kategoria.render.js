// Renderer strony kategorii (współdzielony: Node/build.js oraz podgląd). Bez zależności.
(function (root) {
  var CATS = [
    ['rozladunek-skrzyn', 'Rozładunek skrzyń'], ['przyjecie-i-buforowanie', 'Przyjęcie i buforowanie'], ['oczyszczanie', 'Oczyszczanie'],
    ['sortowanie', 'Sortowanie'], ['selekcja', 'Selekcja'], ['wazenie-i-liczenie', 'Ważenie i liczenie'], ['pakowanie', 'Pakowanie'],
    ['paletyzacja', 'Paletyzacja'], ['przenosniki', 'Przenośniki'], ['pielenie', 'Pielenie']
  ];
  // aliasy pola "cat" w maszyny.json → slug kategorii
  var CATALIAS = {};
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var escA = function (s) { return esc(s).replace(/"/g, '&quot;'); };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var slugify = function (s) { return String(s).toLowerCase().replace(/[ąćęłńóśźż]/g, function (c) { return ({ 'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z' })[c]; }).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var stripTags = function (s) { return String(s).replace(/<[^>]+>/g, ''); };

  function machinesFor(slug, machines) {
    return machines.filter(function (m) { return m.listing !== false && (CATALIAS[m.cat] || m.cat) === slug; });
  }

  function renderStages(slug) {
    return CATS.map(function (c, i) {
      var cur = c[0] === slug, last = i === CATS.length - 1;
      return '<li style="display:flex;align-items:center;gap:12px;padding:8px 0' + (last ? '' : ';border-bottom:1px solid rgba(20,22,14,.1)') + '">' +
        (cur ? '<span style="width:8px;height:8px;background:#8C3A43;flex-shrink:0;border-radius:50%;animation:awPulse 2.6s infinite"></span>' : '<span style="width:8px;height:8px;border:1px solid #B0A98C;flex-shrink:0"></span>') +
        '<span class="mono" style="font-size:11px;font-weight:700;color:' + (cur ? '#8C3A43' : '#A29A7C') + ';width:16px">' + pad2(i + 1) + '</span>' +
        (cur ? '<span style="font-size:14.5px;font-weight:700;color:#14160E">' + esc(c[1]) + '</span>'
             : '<a href="/maszyny/' + c[0] + '/" style="font-size:14.5px;font-weight:500;color:#8A8163;text-decoration:none">' + esc(c[1]) + '</a>') +
        '</li>';
    }).join('\n          ');
  }

  function renderMachines(list) {
    if (!list.length) return '<p style="font-size:15px;color:#56603F">Maszyny tej kategorii konfigurujemy indywidualnie — <a href="/kontakt/">zapytaj o ofertę</a>.</p>';
    return '<div data-reveal style="border:1px solid #14160E;background:#14160E;display:grid;gap:1px">\n' + list.map(function (m) {
      var href = m.url || '/kontakt/', label = (m.url && m.url.split('/').length > 4) ? 'Karta produktu' : 'Zapytaj o wycenę';
      var img = m.img ? '../../assets/' + m.img : '../../assets/maszyna-placeholder.png';
      return '      <a class="prow" id="' + escA(m.id) + '" href="' + escA(href) + '" style="display:grid;grid-template-columns:150px 1fr auto;gap:26px;align-items:center;padding:20px 24px;background:#ECE7D7;text-decoration:none;color:#14160E;scroll-margin-top:96px">\n' +
        '        <span style="width:150px;height:100px;flex-shrink:0;background-color:#F1ECDF;background-image:linear-gradient(rgba(20,22,14,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(20,22,14,.05) 1px,transparent 1px);background-size:20px 20px;border:1px solid rgba(20,22,14,.14);display:flex;align-items:center;justify-content:center;overflow:hidden">' +
        '<img class="prowimg" src="' + escA(img) + '" alt="' + escA(m.name + (m.models ? ' ' + m.models : '')) + '" loading="lazy" style="max-width:86%;max-height:86%;object-fit:contain;display:block"></span>\n' +
        '        <div style="min-width:0"><div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin-bottom:6px"><h3 style="font-size:23px;font-weight:700;letter-spacing:-.01em;line-height:1.1">' + esc(m.name) + '</h3>' +
        (m.models ? '<span class="mono" style="font-size:11px;font-weight:700;color:#8C3A43;letter-spacing:.03em">' + esc(m.models) + '</span>' : '') + '</div>\n' +
        '          <p style="font-size:14px;line-height:1.5;color:#56603F;text-wrap:pretty">' + esc(m.short || '') + '</p></div>\n' +
        '        <span style="display:flex;align-items:center;gap:8px;font-family:\'Space Mono\',monospace;font-size:11.5px;font-weight:700;letter-spacing:.04em;color:#8C3A43;white-space:nowrap">' + label + ' <span class="prowarr" style="font-size:17px">↗</span></span>\n      </a>';
    }).join('\n') + '\n    </div>';
  }

  function renderTable(t) {
    var head = '<tr>' + t.head.map(function (h, i) { return '<th style="text-align:left;padding:12px 14px;font-family:\'Space Mono\',monospace;font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#ECE7D7;background:#14160E' + (i ? '' : ';color:#B7D44B') + '">' + esc(h) + '</th>'; }).join('') + '</tr>';
    var rows = t.rows.map(function (r, ri) {
      return '<tr>' + r.map(function (cell, i) {
        return '<td style="padding:11px 14px;font-size:14px;line-height:1.45;vertical-align:top;border-bottom:1px solid rgba(20,22,14,.12);background:' + (ri % 2 ? '#F4EFE2' : '#ECE7D7') + (i ? ';color:#3B4230' : ';font-weight:700;color:#14160E') + '">' + cell + '</td>';
      }).join('') + '</tr>';
    }).join('\n');
    return '<div style="margin:22px 0 26px;border:1px solid #14160E"><table style="width:100%;border-collapse:collapse"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table></div>';
  }

  function renderSections(sections) {
    return sections.map(function (s, i) {
      var id = 's-' + slugify(s.h2).slice(0, 48);
      var body = s.items.map(function (it) {
        if (it.p) return '<p style="font-size:16.5px;line-height:1.7;color:#3B4230;margin:0 0 16px;text-wrap:pretty">' + it.p + '</p>';
        if (it.ul) return '<ul style="display:flex;flex-direction:column;gap:0;margin:6px 0 22px;border-top:1px solid rgba(20,22,14,.16)">' + it.ul.map(function (li) { return '<li style="display:flex;gap:14px;padding:13px 0;border-bottom:1px solid rgba(20,22,14,.16);font-size:15.5px;line-height:1.6;color:#3B4230"><span style="width:7px;height:7px;background:#8C3A43;flex-shrink:0;margin-top:9px"></span><span>' + li + '</span></li>'; }).join('') + '</ul>';
        if (it.table) return renderTable(it.table);
        return '';
      }).join('\n');
      return '<section id="' + id + '" data-reveal style="scroll-margin-top:96px;padding:34px 0 10px;border-top:1px solid rgba(20,22,14,.18)">\n' +
        '        <div class="mono" style="font-size:11px;font-weight:700;letter-spacing:.14em;color:#8C3A43;margin-bottom:12px">' + pad2(i + 1) + '</div>\n' +
        '        <h2 style="font-size:30px;font-weight:700;line-height:1.1;margin-bottom:18px;text-wrap:balance;color:#14160E">' + esc(s.h2) + '</h2>\n' + body + '\n      </section>';
    }).join('\n      ');
  }

  function renderToc(sections, hasFaq) {
    var items = sections.map(function (s, i) { return ['#s-' + slugify(s.h2).slice(0, 48), s.h2, pad2(i + 1)]; });
    if (hasFaq) items.push(['#faq', 'Najczęściej zadawane pytania', 'FAQ']);
    return items.map(function (it) {
      return '<li><a class="toclink" href="' + it[0] + '" style="display:flex;gap:12px;align-items:baseline;padding:10px 0;border-bottom:1px solid rgba(20,22,14,.12);font-size:13.5px;font-weight:600;color:#3B4230;text-decoration:none"><span class="mono" style="font-size:10px;color:#8C3A43;width:26px;flex-shrink:0">' + it[2] + '</span><span>' + esc(it[1]) + '</span></a></li>';
    }).join('\n          ');
  }

  function renderFaq(faq) {
    return faq.map(function (f, i) {
      return '<details class="faq" style="border-top:1px solid rgba(236,231,215,.16)"' + (i === 0 ? ' open' : '') + '>\n' +
        '          <summary style="display:flex;gap:18px;align-items:baseline;padding:20px 0;cursor:pointer;list-style:none;font-family:\'Chakra Petch\',sans-serif;font-size:19px;font-weight:700;line-height:1.25;color:#ECE7D7"><span class="mono" style="font-size:11px;color:#8C3A43;flex-shrink:0;width:26px">' + pad2(i + 1) + '</span><span style="flex:1">' + esc(f.q) + '</span><span class="faqmark" style="color:#B7D44B;font-size:20px;flex-shrink:0">+</span></summary>\n' +
        '          <p style="padding:0 0 22px 44px;font-size:15.5px;line-height:1.65;color:#A7AE92;text-wrap:pretty">' + f.a + '</p>\n        </details>';
    }).join('\n        ');
  }

  function render(cat, machines, tpl) {
    var idx = CATS.findIndex(function (c) { return c[0] === cat.slug; });
    var num = pad2(idx + 1), name = (CATS[idx] || [cat.slug, cat.name])[1];
    var list = machinesFor(cat.slug, machines);
    var url = 'https://www.agro-weld.pl/maszyny/' + cat.slug + '/';
    var jsonld = JSON.stringify({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Start', item: 'https://www.agro-weld.pl/' },
        { '@type': 'ListItem', position: 2, name: 'Maszyny', item: 'https://www.agro-weld.pl/maszyny/' },
        { '@type': 'ListItem', position: 3, name: name, item: url }] },
      { '@type': 'ItemList', name: name + ' — maszyny Agro-Weld', itemListElement: list.map(function (m, i) { return { '@type': 'ListItem', position: i + 1, name: m.name, url: m.url ? 'https://www.agro-weld.pl' + m.url : url + '#' + m.id }; }) },
      { '@type': 'FAQPage', mainEntity: cat.faq.map(function (f) { return { '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: stripTags(f.a) } }; }) }
    ] });
    var lead = cat.intro[0] || '', rest = cat.intro.slice(1);
    var fill = {
      META_TITLE: esc(cat.metaTitle || cat.h1), META_DESC: escA(cat.metaDesc || ''), SLUG: cat.slug, NAME: esc(name), NUM: num,
      JSONLD: jsonld, H1: esc(cat.h1 || name), LEAD: lead,
      OGIMAGE: 'https://www.agro-weld.pl/' + (cat.ogImage || (list[0] && list[0].img ? 'assets/' + list[0].img : 'assets/logo.webp')),
      INTRO_REST: rest.map(function (p) { return '<p style="font-size:16.5px;line-height:1.7;color:#3B4230;margin:0 0 16px;text-wrap:pretty">' + p + '</p>'; }).join('\n'),
      STAGES: renderStages(cat.slug), MACHINES: renderMachines(list), MCOUNT: pad2(list.length),
      TOC: renderToc(cat.sections, cat.faq.length > 0), CONTENT: renderSections(cat.sections),
      FAQ: renderFaq(cat.faq), CTA: cat.cta || 'Opisz nam surowiec i skalę produkcji — dobierzemy maszyny pod Twoją linię.'
    };
    var html = tpl;
    Object.keys(fill).forEach(function (k) { html = html.split('{{' + k + '}}').join(fill[k]); });
    return html;
  }

  var api = { render: render, CATS: CATS, machinesFor: machinesFor,
    renderStages: renderStages, renderMachines: renderMachines, renderSections: renderSections,
    renderToc: renderToc, renderFaq: renderFaq, renderTable: renderTable };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.KategoriaRender = api;
})(typeof window !== 'undefined' ? window : this);
