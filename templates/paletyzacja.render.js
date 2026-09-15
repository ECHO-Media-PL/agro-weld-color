// Renderer dedykowanej strony kategorii Paletyzacja (content/paletyzacja.json + templates/paletyzacja.html).
// Treść redakcyjna (intro, sections, faq, meta) pochodzi z content/kategorie.json — tu tylko dane designu.
(function (root) {
  var KR = (typeof module !== 'undefined' && module.exports) ? require('./kategoria.render.js') : root.KategoriaRender;
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var escA = function (s) { return esc(s).replace(/"/g, '&quot;'); };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  var stripTags = function (s) { return String(s).replace(/<[^>]+>/g, ''); };

  var BTN = {
    dark: { cls: 'btn btnd', style: 'background:#14160E;color:#ECE7D7;padding:15px 26px;border-radius:7px;font-weight:700;font-size:15px' },
    darkSm: { cls: 'btn btnd', style: 'background:#14160E;color:#ECE7D7;padding:14px 24px;border-radius:7px;font-weight:700;font-size:15px' },
    outline: { cls: 'btn btnb', style: 'background:transparent;color:#14160E;border:1.5px solid rgba(20,22,14,.38);padding:14px 24px;border-radius:7px;font-weight:600;font-size:15px' },
    outlineSm: { cls: 'btn btnb', style: 'background:transparent;color:#14160E;border:1.5px solid rgba(20,22,14,.38);padding:13px 22px;border-radius:7px;font-weight:600;font-size:15px' },
    light: { cls: 'btn btnc', style: 'background:#ECE7D7;color:#14160E;padding:16px 28px;font-weight:700;font-size:15.5px' },
    ghost: { cls: 'btn btno', style: 'background:transparent;color:#ECE7D7;border:1.5px solid rgba(236,231,215,.34);padding:15px 26px;font-weight:600;font-size:15.5px' }
  };
  var ARROW = { down: '<span class="ard">↓</span>', up: '<span class="aru">↗</span>' };

  function href(b, data) {
    return b.href === '$catalogPdf' ? data.catalogPdf.href : b.href;
  }
  function renderButtons(list, data, indent) {
    var pad = indent || '          ';
    return (list || []).map(function (b) {
      var v = BTN[b.variant] || BTN.outline;
      return '<a class="' + v.cls + '" href="' + escA(href(b, data)) + '"' +
        (b.newTab ? ' target="_blank" rel="noopener"' : '') +
        ' style="' + v.style + '">' + esc(b.label) + (b.arrow && ARROW[b.arrow] ? ' ' + ARROW[b.arrow] : '') + '</a>';
    }).join('\n' + pad);
  }

  function renderTiles(items, noteTile) {
    var tiles = items.map(function (m) {
      var rows = m.specs.map(function (s, i) {
        var last = i === m.specs.length - 1;
        return '          <div style="display:flex;justify-content:space-between;gap:12px;padding:8px 0' + (last ? '' : ';border-bottom:1px solid rgba(20,22,14,.12)') + '"><dt style="color:#8A8163">' + esc(s[0]) + '</dt><dd style="font-weight:700;color:#14160E">' + esc(s[1]) + '</dd></div>';
      }).join('\n');
      return '<li style="background:#ECE7D7;padding:26px 24px">\n' +
        '        <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:12px"><h3 style="font-size:25px;font-weight:700;letter-spacing:-.02em;color:#14160E">' + esc(m.code) + '</h3><span class="mono" style="font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8C3A43">' + esc(m.badge) + '</span></div>\n' +
        '        <p style="font-size:14.5px;line-height:1.55;color:#4C543B;margin-bottom:16px;text-wrap:pretty">' + esc(m.desc) + '</p>\n' +
        '        <dl style="display:grid;gap:0;border-top:1px solid rgba(20,22,14,.16);font-size:13.5px">\n' + rows + '\n        </dl>\n      </li>';
    });
    if (noteTile) {
      tiles.push('<li style="background:#F4EFE2;padding:26px 24px;display:flex;flex-direction:column;justify-content:center;gap:14px">\n' +
        '        <div class="mono" style="font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#8C3A43">' + esc(noteTile.label) + '</div>\n' +
        '        <p style="font-size:15px;line-height:1.6;color:#3B4230;text-wrap:pretty">' + esc(noteTile.text) + '</p>\n' +
        (noteTile.link ? '        <a href="' + escA(noteTile.link.href) + '" style="font-family:\'Space Mono\',monospace;font-size:12px;font-weight:700;letter-spacing:.04em;color:#41571F;text-decoration:none">' + esc(noteTile.link.label) + '</a>\n' : '') +
        '      </li>');
    }
    return tiles.join('\n      ');
  }

  function renderFamilyList(list) {
    return list.map(function (it) {
      return '<li style="display:flex;gap:12px;font-size:15.5px;line-height:1.55;color:#3B4230"><span style="width:7px;height:7px;background:#8C3A43;flex-shrink:0;margin-top:8px"></span><span><strong>' + esc(it.strong) + '</strong> ' + esc(it.text) + '</span></li>';
    }).join('\n          ');
  }

  // cat — wpis z content/kategorie.json, data — content/paletyzacja.json
  function render(cat, data, machines, tpl) {
    var name = cat.name, url = data.seo.canonical;
    var jsonld = JSON.stringify({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Start', item: 'https://www.agro-weld.pl/' },
        { '@type': 'ListItem', position: 2, name: 'Maszyny', item: 'https://www.agro-weld.pl/maszyny/' },
        { '@type': 'ListItem', position: 3, name: name, item: url }] },
      { '@type': 'ItemList', name: 'Paletyzatory Verbruggen — Agro-Weld',
        itemListElement: data.models.bags.items.concat(data.models.boxes.items).map(function (m, i) {
          return { '@type': 'ListItem', position: i + 1, name: 'Paletyzator Verbruggen ' + m.code, url: url + '#maszyny' };
        }) },
      { '@type': 'FAQPage', mainEntity: cat.faq.map(function (f) { return { '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: stripTags(f.a) } }; }) }
    ] });

    var fill = {
      META_TITLE: esc(cat.metaTitle || cat.h1), META_DESC: escA(cat.metaDesc || ''), JSONLD: jsonld,
      OGIMAGE: 'https://www.agro-weld.pl/' + (data.seo.ogImage || cat.ogImage || 'assets/logo.webp'),
      EYEBROW: esc(data.hero.eyebrow), CRUMB: esc(data.hero.crumb),
      H1: esc(cat.h1 || name), LEAD: cat.intro[0] || '',
      HERO_CTA: renderButtons(data.hero.cta, data),
      STAGES: KR.renderStages(cat.slug),
      MODELS_LABEL: esc(data.models.label), MODELS_COUNT: esc(data.models.count),
      IMG_SRC: escA(data.models.image.src), IMG_ALT: escA(data.models.image.alt),
      FAMILIES_H2: esc(data.models.families.h2), FAMILIES_P: esc(data.models.families.p),
      FAMILIES_LIST: renderFamilyList(data.models.families.list),
      FAMILIES_CTA: renderButtons(data.models.families.cta, data),
      BAGS_LABEL: esc(data.models.bags.label), BAGS_NOTE: esc(data.models.bags.note),
      BAG_TILES: renderTiles(data.models.bags.items, data.models.bags.noteTile),
      BOXES_LABEL: esc(data.models.boxes.label), BOXES_NOTE: esc(data.models.boxes.note),
      BOX_TILES: renderTiles(data.models.boxes.items, data.models.boxes.noteTile),
      SECURE_LABEL: esc(data.secure.label), SECURE_P: esc(data.secure.text),
      FOOTNOTE: '↳ ' + data.footnote,
      TOC: KR.renderToc(cat.sections, cat.faq.length > 0),
      CONTENT: KR.renderSections(cat.sections),
      FAQ: KR.renderFaq(cat.faq),
      CTA_KICKER: esc(data.cta.kicker), CTA_P: esc(data.cta.text),
      CTA_BUTTONS: renderButtons(data.cta.buttons, data, '        ')
    };
    var html = tpl;
    Object.keys(fill).forEach(function (k) { html = html.split('{{' + k + '}}').join(fill[k]); });
    return html;
  }

  var api = { render: render };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PaletyzacjaRender = api;
})(typeof window !== 'undefined' ? window : this);
