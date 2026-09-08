// Listing /maszyny/ — grupy kategorii z content/maszyny.json
(function (root) {
  var CATS = [["rozladunek-skrzyn","Rozładunek skrzyń"],["przyjecie-i-buforowanie","Przyjęcie i buforowanie"],["oczyszczanie","Oczyszczanie"],["sortowanie","Sortowanie"],["selekcja","Selekcja"],["wazenie-i-liczenie","Ważenie i liczenie"],["pakowanie","Pakowanie"],["paletyzacja","Paletyzacja"],["przenosniki","Przenośniki"],["pielenie","Pielenie"]];
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
  var escA = function (s) { return esc(s).replace(/"/g,'&quot;'); };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  function render(machines) {
    return CATS.map(function (c, i) {
      var list = machines.filter(function (m) { return m.cat === c[0]; });
      var rows = list.map(function (m) {
        var card = m.url && m.url.split('/').length > 4;
        var img = m.img ? '../assets/' + m.img : '../assets/maszyna-placeholder.png';
        var fit = m.imgType === 'photo' ? 'width:100%;height:100%;object-fit:cover' : 'max-width:100%;max-height:100%;object-fit:contain';
        return '        <a class="prow" id="' + escA(m.id) + '" href="' + escA(m.url || '/maszyny/' + c[0] + '/') + '" style="scroll-margin-top:96px">\n' +
          '          <span class="pimg" style="height:210px;border-right:1px solid #14160E;background-color:#F1ECDF;background-image:linear-gradient(rgba(20,22,14,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(20,22,14,.05) 1px,transparent 1px);background-size:24px 24px;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:' + (m.imgType === 'photo' ? '0' : '20px') + '">' +
          '<img class="rowimg" src="' + escA(img) + '" alt="' + escA(m.name + ' — maszyna Agro-Weld') + '" loading="lazy" style="' + fit + ';display:block"></span>\n' +
          '          <span style="padding:24px 30px;display:flex;flex-direction:column;justify-content:center">\n' +
          '            <span class="mono" style="display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:10px;font-size:11.5px;letter-spacing:.05em"><span style="color:#8C3A43;font-weight:700">' + esc(m.models || '') + '</span><span class="rowarrow" style="font-size:19px;color:#8C3A43;font-weight:700">↗</span></span>\n' +
          '            <span style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px"><h3 style="font-size:25px;letter-spacing:-.01em;line-height:1.1">' + esc(m.name) + '</h3>' +
          (card ? '<span class="mono" style="font-size:10px;font-weight:700;color:#14160E;background:#B7D44B;padding:4px 9px;border-radius:4px;letter-spacing:.03em">Karta produktu →</span>' : '<span class="mono" style="font-size:10px;font-weight:700;color:#ECE7D7;background:#8C3A43;padding:4px 9px;border-radius:4px;letter-spacing:.03em">Dystrybucja</span>') + '</span>\n' +
          '            <p style="font-size:15px;line-height:1.6;color:#56603F;max-width:620px;text-wrap:pretty">' + esc(m.short || '') + '</p>\n          </span>\n        </a>';
      }).join('\n');
      return '    <div id="' + c[0] + '" style="scroll-margin-top:96px">\n' +
        '      <div data-reveal style="display:flex;align-items:center;gap:16px;margin-bottom:20px"><span class="mono" style="font-size:12px;font-weight:700;letter-spacing:.1em;color:#8C3A43">' + pad2(i + 1) + '</span>' +
        '<h2 style="font-size:28px;letter-spacing:-.01em"><a href="/maszyny/' + c[0] + '/" style="color:#14160E">' + esc(c[1]) + '</a></h2><span style="flex:1;height:1px;background:rgba(20,22,14,.2)"></span>' +
        '<a class="mono linkd" href="/maszyny/' + c[0] + '/" style="font-size:11px;font-weight:700;letter-spacing:.06em;white-space:nowrap">Strona kategorii ↗</a></div>\n' +
        '      <div data-reveal style="border:1px solid #14160E;background:#14160E;display:grid;gap:1px">\n' + rows + '\n      </div>\n    </div>';
    }).join('\n');
  }
  var api = { render: render };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.ListingRender = api;
})(typeof window !== 'undefined' ? window : this);
