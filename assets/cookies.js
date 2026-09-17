/* Agro-Weld — zgoda na pliki cookies. Bez zewnętrznych bibliotek. */
(function () {
  var KEY = 'aw-cookie-consent-v1';
  var C = { ink: '#14160E', cream: '#ECE7D7', lime: '#B7D44B', sage: '#A7AE92', olive: '#7E8A63', line: 'rgba(236,231,215,.16)', red: '#8C3A43' };
  var FS = "'Hanken Grotesk',Arial,sans-serif";
  var FM = "'Space Mono',ui-monospace,monospace";

  function read() {
    try { var v = JSON.parse(localStorage.getItem(KEY)); return v && typeof v === 'object' ? v : null; } catch (e) { return null; }
  }
  function save(v) {
    v.necessary = true; v.ts = new Date().toISOString(); v.v = 1;
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
    apply(v);
  }
  function apply(v) { if (v && v.external) unlockEmbeds(); }

  /* ---------- osadzone treści zewnętrzne (mapa Google) ---------- */
  var parked = [];
  function parkEmbeds() {
    var frames = document.querySelectorAll('iframe[src]');
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i], src = f.getAttribute('src') || '';
      if (!/google\.[a-z.]+\/maps|youtube|player\.vimeo/i.test(src)) continue;
      var isMap = /google\.[a-z.]+\/maps/i.test(src);
      var ph = document.createElement('div');
      ph.setAttribute('data-aw-embed-placeholder', '');
      ph.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:28px;background:#1E2113;background-image:linear-gradient(rgba(236,231,215,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(236,231,215,.05) 1px,transparent 1px);background-size:34px 34px';
      var label = document.createElement('div');
      label.style.cssText = 'font-family:' + FM + ';font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:' + C.lime;
      label.textContent = isMap ? '/ Mapa Google' : '/ Film zewnętrzny';
      var p = document.createElement('p');
      p.style.cssText = 'font-family:' + FS + ';font-size:14.5px;line-height:1.6;color:' + C.sage + ';max-width:360px;margin:0';
      p.textContent = isMap
        ? 'Mapa Google ładuje się z serwerów Google i zapisuje własne pliki cookies. Pokażemy ją po Twojej zgodzie.'
        : 'Film ładuje się z serwerów YouTube, które zapisują własne pliki cookies. Odtworzymy go po Twojej zgodzie.';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = 'font-family:' + FS + ';font-size:13.5px;font-weight:700;padding:11px 18px;border:0;border-radius:8px;background:' + C.lime + ';color:' + C.ink + ';cursor:pointer';
      btn.textContent = isMap ? 'Pokaż mapę' : 'Załaduj film';
      btn.addEventListener('click', function () {
        var v = read() || {}; v.external = true; if (typeof v.analytics !== 'boolean') v.analytics = false; save(v); hideBanner();
      });
      ph.appendChild(label); ph.appendChild(p); ph.appendChild(btn);
      var host = f.parentNode;
      if (host && getComputedStyle(host).position === 'static') host.style.position = 'relative';
      f.setAttribute('data-aw-src', src);
      f.removeAttribute('src');
      f.style.display = 'none';
      host.appendChild(ph);
      parked.push(f);
    }
  }
  function unlockEmbeds() {
    var phs = document.querySelectorAll('[data-aw-embed-placeholder]');
    for (var i = 0; i < phs.length; i++) phs[i].parentNode.removeChild(phs[i]);
    for (var j = 0; j < parked.length; j++) {
      var f = parked[j], s = f.getAttribute('data-aw-src');
      if (s) { f.setAttribute('src', s); f.removeAttribute('data-aw-src'); f.style.display = ''; }
    }
    parked = [];
  }

  /* ---------- banner ---------- */
  var box = null;
  function hideBanner() { if (box) { box.remove(); box = null; } }

  function btnStyle(kind) {
    var base = 'font-family:' + FS + ';font-size:13.5px;font-weight:700;padding:12px 18px;border-radius:9px;cursor:pointer;line-height:1.1;transition:background .2s,color .2s,border-color .2s;';
    if (kind === 'primary') return base + 'border:0;background:' + C.lime + ';color:' + C.ink;
    return base + 'border:1px solid ' + C.line + ';background:transparent;color:' + C.cream;
  }

  function row(id, name, desc, checked, locked) {
    var wrap = document.createElement('label');
    wrap.style.cssText = 'display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:start;padding:12px 0;border-top:1px solid ' + C.line + ';cursor:' + (locked ? 'default' : 'pointer');
    var cb = document.createElement('input');
    cb.type = 'checkbox'; cb.id = id; cb.checked = checked; cb.disabled = !!locked;
    cb.style.cssText = 'width:18px;height:18px;margin-top:2px;accent-color:' + C.lime;
    var t = document.createElement('div');
    t.innerHTML = '<div style="font-family:' + FS + ';font-size:14px;font-weight:700;color:' + C.cream + '">' + name + (locked ? ' <span style="font-family:' + FM + ';font-size:10px;letter-spacing:.1em;color:' + C.olive + '">ZAWSZE AKTYWNE</span>' : '') + '</div><div style="font-family:' + FS + ';font-size:13px;line-height:1.55;color:' + C.sage + '">' + desc + '</div>';
    wrap.appendChild(cb); wrap.appendChild(t);
    return wrap;
  }

  function render(mode) {
    hideBanner();
    var cur = read() || { analytics: false, external: false };
    box = document.createElement('div');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Zgoda na pliki cookies');
    box.style.cssText = 'position:fixed;z-index:9999;left:20px;bottom:20px;width:min(440px,calc(100vw - 40px));max-height:calc(100vh - 40px);overflow:auto;background:' + C.ink + ';color:' + C.cream + ';border:1px solid ' + C.line + ';border-radius:16px;box-shadow:0 40px 80px -30px rgba(0,0,0,.75);padding:24px 24px 22px';

    var head = document.createElement('div');
    head.style.cssText = 'font-family:' + FM + ';font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:' + C.lime + ';margin-bottom:12px';
    head.textContent = '/ Pliki cookies';
    box.appendChild(head);

    var h = document.createElement('div');
    h.style.cssText = "font-family:'Chakra Petch'," + FS + ';font-size:22px;font-weight:700;line-height:1.15;letter-spacing:-.015em;margin-bottom:10px';
    h.textContent = mode === 'settings' ? 'Ustawienia cookies' : 'Ustawiamy tylko to, co potrzebne';
    box.appendChild(h);

    var p = document.createElement('p');
    p.style.cssText = 'font-family:' + FS + ';font-size:14px;line-height:1.6;color:' + C.sage + ';margin:0 0 16px';
    p.innerHTML = 'Pliki niezbędne utrzymują działanie strony i wysyłkę formularzy zapytań. Statystyki oraz treści zewnętrzne (mapa Google, filmy YouTube) włączamy tylko za Twoją zgodą. Szczegóły w <a href="/polityka-prywatnosci/" style="color:' + C.lime + ';font-weight:600">polityce prywatności</a>.';
    box.appendChild(p);

    var rows = null;
    if (mode === 'settings') {
      rows = document.createElement('div');
      rows.style.cssText = 'margin:0 0 18px';
      rows.appendChild(row('awcNec', 'Niezbędne', 'Wysyłka formularza zapytania (operator Resend), zapamiętanie tej zgody, bezpieczeństwo.', true, true));
      rows.appendChild(row('awcAna', 'Statystyki', 'Anonimowe dane o ruchu — ile osób odwiedza podstrony maszyn i realizacji.', !!cur.analytics, false));
      rows.appendChild(row('awcExt', 'Treści zewnętrzne', 'Mapa dojazdu Google i filmy YouTube z maszynami. Bez zgody wyświetlamy zastępczy kafel.', !!cur.external, false));
      box.appendChild(rows);
    }

    var acts = document.createElement('div');
    acts.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;align-items:center';

    var all = document.createElement('button');
    all.type = 'button'; all.style.cssText = btnStyle('primary');
    all.textContent = mode === 'settings' ? 'Zapisz wybór' : 'Akceptuję wszystkie';
    all.addEventListener('click', function () {
      if (mode === 'settings') {
        save({ analytics: document.getElementById('awcAna').checked, external: document.getElementById('awcExt').checked });
      } else {
        save({ analytics: true, external: true });
      }
      hideBanner();
    });

    var min = document.createElement('button');
    min.type = 'button'; min.style.cssText = btnStyle('ghost');
    min.textContent = 'Tylko niezbędne';
    min.addEventListener('click', function () { save({ analytics: false, external: false }); hideBanner(); });

    acts.appendChild(all); acts.appendChild(min);

    if (mode !== 'settings') {
      var more = document.createElement('button');
      more.type = 'button';
      more.style.cssText = 'font-family:' + FM + ';font-size:12px;letter-spacing:.04em;background:none;border:0;color:' + C.olive + ';cursor:pointer;padding:6px 2px;text-decoration:underline;text-underline-offset:3px';
      more.textContent = 'Ustawienia';
      more.addEventListener('click', function () { render('settings'); });
      acts.appendChild(more);
    }

    box.appendChild(acts);
    document.body.appendChild(box);
  }

  function init() {
    var v = read();
    if (!v || !v.external) parkEmbeds();
    if (v) { apply(v); } else { render('banner'); }
    var links = document.querySelectorAll('[data-aw-cookie-settings]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) { e.preventDefault(); render('settings'); });
    }
  }

  window.awCookies = { open: function () { render('settings'); }, get: read };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
