// Test przekierowań 301 z tabeli agro-weld_redirects.csv
// Użycie (Node 18+, bez instalacji):  node seo/test-przekierowan.js
// Opcje:  --ua=google  (User-Agent Googlebota; domyślnie zwykła przeglądarka)
//         --csv=ścieżka (domyślnie seo/agro-weld_redirects.csv)
const fs = require('fs'), path = require('path');
const arg = n => (process.argv.find(a => a.startsWith('--' + n + '=')) || '').split('=').slice(1).join('=');
const UA = arg('ua') === 'google'
  ? 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
  : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const csvPath = arg('csv') || path.join(__dirname, 'agro-weld_redirects.csv');
const rows = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/).slice(1).map(l => {
  const c = l.split(',');
  return { type: c[0], from: c[c.length - 2], to: c[c.length - 1] };
}).filter(r => r.from && r.to);
const norm = u => { const x = new URL(u, 'https://www.agro-weld.pl'); return x.origin + x.pathname + x.search; };

(async () => {
  console.log('User-Agent: ' + (arg('ua') === 'google' ? 'Googlebot' : 'przeglądarka') + ' | adresów: ' + rows.length + '\n');
  let ok = 0; const bad = [];
  for (const r of rows) {
    let res1, loc = '', res2, note = '';
    try {
      res1 = await fetch(r.from, { redirect: 'manual', headers: { 'User-Agent': UA } });
      loc = res1.headers.get('location') || '';
      if (res1.status !== 301) note = 'status ' + res1.status + ' (oczekiwano 301)';
      else if (norm(loc) !== norm(r.to)) note = 'cel ' + norm(loc) + ' (oczekiwano ' + norm(r.to) + ')';
      else {
        res2 = await fetch(norm(loc), { redirect: 'manual', headers: { 'User-Agent': UA } });
        if (res2.status !== 200) note = 'cel zwraca ' + res2.status + ' (oczekiwano 200, jeden skok)';
      }
    } catch (e) { note = 'błąd połączenia: ' + e.message; }
    if (note) { bad.push({ ...r, note }); console.log('BŁĄD  ' + r.from + '\n      ' + note); }
    else { ok++; console.log('OK    ' + r.from); }
  }
  console.log('\nWynik: ' + ok + '/' + rows.length + ' OK, błędów: ' + bad.length);
  const out = path.join(process.cwd(), 'wynik-przekierowan-' + (arg('ua') === 'google' ? 'googlebot' : 'przegladarka') + '.csv');
  fs.writeFileSync(out, 'typ,stary_url,oczekiwany_cel,uwagi\n' +
    rows.map(r => { const b = bad.find(x => x.from === r.from); return [r.type, r.from, r.to, b ? b.note.replace(/,/g, ';') : 'OK'].join(','); }).join('\n'));
  console.log('Raport: ' + out);
  process.exit(bad.length ? 1 : 0);
})();
