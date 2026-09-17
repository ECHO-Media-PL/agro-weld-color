// Wysyłka formularzy zapytań (#awForm) do endpointu serwisu CMS.
// Endpoint można nadpisać przed wczytaniem skryptu: window.AW_FORM_ENDPOINT = '...'
(function () {
  var ENDPOINT = window.AW_FORM_ENDPOINT || 'https://agro-weld-cms.onrender.com/api/form';
  function init(form) {
    if (!form || form.dataset.awBound) return;
    form.dataset.awBound = '1';
    form.removeAttribute('action');
    form.removeAttribute('enctype');
    // pole-pułapka na boty
    var hp = document.createElement('input');
    hp.type = 'text'; hp.name = '_hp'; hp.tabIndex = -1; hp.autocomplete = 'off';
    hp.setAttribute('aria-hidden', 'true');
    hp.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
    form.appendChild(hp);

    var btn = form.querySelector('[type=submit],button:not([type])');
    var note = document.createElement('p');
    note.style.cssText = 'font-size:14px;line-height:1.5;color:#E0A0A6;margin:0';
    note.hidden = true;
    form.appendChild(note);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (hp.value) return;
      var data = {};
      new FormData(form).forEach(function (v, k) { if (k !== '_hp') data[k] = v; });
      data.page = location.pathname;
      note.hidden = true;
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Wysyłanie…'; }
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.j && res.j.error || 'Nie udało się wysłać zapytania.');
          var sent = document.getElementById('awSent');
          form.style.display = 'none';
          if (sent) sent.style.display = 'flex';
          if (window.dataLayer) window.dataLayer.push({ event: 'form_submit', form_page: data.page });
        })
        .catch(function (err) {
          note.textContent = err.message + ' Napisz na biuro@agro-weld.pl lub zadzwoń: +48 725 140 257.';
          note.hidden = false;
        })
        .then(function () { if (btn) { btn.disabled = false; btn.textContent = label; } });
    });
  }
  function boot() { Array.prototype.forEach.call(document.querySelectorAll('form#awForm, form[data-aw-form]'), init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
