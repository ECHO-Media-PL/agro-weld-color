// Agro-Weld CMS — serwer panelu. Node stdlib, zero zależności.
// Env: ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET, GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH, ANTHROPIC_API_KEY (opc.)
const http = require('http'), https = require('https'), crypto = require('crypto'), fs = require('fs'), path = require('path');
const ENV = process.env;
const REPO = ENV.GITHUB_REPO || 'ECHO-Media-PL/agro-weld-color';
const BRANCH = ENV.GITHUB_BRANCH || 'main';
const PORT = ENV.PORT || 10000;
const SECRET = ENV.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// ---------- pomocnicze ----------
const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(obj)); };
const timingEq = (a, b) => { a = Buffer.from(String(a)); b = Buffer.from(String(b)); return a.length === b.length && crypto.timingSafeEqual(a, b); };
const sign = s => crypto.createHmac('sha256', SECRET).update(s).digest('hex');
const readBody = req => new Promise((ok, err) => { let d = []; let n = 0; req.on('data', c => { n += c.length; if (n > 30e6) { err(new Error('too big')); req.destroy(); } d.push(c); }); req.on('end', () => ok(Buffer.concat(d).toString('utf8'))); req.on('error', err); });

function request(host, method, p, headers, body) {
  return new Promise((ok, err) => {
    const r = https.request({ host, method, path: p, headers }, res => {
      let d = []; res.on('data', c => d.push(c)); res.on('end', () => ok({ status: res.statusCode, body: Buffer.concat(d).toString('utf8') }));
    });
    r.on('error', err); if (body) r.write(body); r.end();
  });
}
async function gh(method, p, obj) {
  const body = obj ? JSON.stringify(obj) : null;
  const r = await request('api.github.com', method, p, {
    'Authorization': 'Bearer ' + ENV.GITHUB_TOKEN, 'User-Agent': 'agro-weld-cms',
    'Accept': 'application/vnd.github+json', ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {}),
  }, body);
  let parsed = null; try { parsed = JSON.parse(r.body); } catch (e) {}
  if (r.status >= 400) throw new Error('GitHub ' + r.status + ': ' + (parsed && parsed.message || r.body.slice(0, 200)));
  return parsed;
}
const R = '/repos/' + REPO;

// Jeden atomowy commit wielu plików (Git Data API) → jeden deploy na publikację.
// Kolejka: równoległe publikacje wykonują się jedna po drugiej (bez wyścigu o ref),
// a konflikt refa (ktoś pchnął w międzyczasie) jest ponawiany raz na świeżym stanie.
let commitChain = Promise.resolve();
function commitFiles(files, message, author) {
  const run = async () => {
    try { return await commitOnce(files, message, author); }
    catch (e) {
      if (/fast forward|does not match|409|422/i.test(String(e.message))) { await new Promise(r => setTimeout(r, 1200)); return commitOnce(files, message, author); }
      throw e;
    }
  };
  const p = commitChain.then(run, run);
  commitChain = p.catch(() => {});
  return p;
}
async function commitOnce(files, message, author) {
  const ref = await gh('GET', R + '/git/ref/heads/' + BRANCH);
  const parent = ref.object.sha;
  const base = (await gh('GET', R + '/git/commits/' + parent)).tree.sha;
  const tree = [];
  for (const f of files) {
    if (f.delete) { tree.push({ path: f.path, mode: '100644', type: 'blob', sha: null }); continue; }
    const blob = await gh('POST', R + '/git/blobs', f.base64 ? { content: f.base64, encoding: 'base64' } : { content: f.text, encoding: 'utf-8' });
    tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  const newTree = await gh('POST', R + '/git/trees', { base_tree: base, tree });
  const commit = await gh('POST', R + '/git/commits', { message, tree: newTree.sha, parents: [parent], author: { name: 'Agro-Weld CMS', email: author || 'cms@agro-weld.pl', date: new Date().toISOString() } });
  await gh('PATCH', R + '/git/refs/heads/' + BRANCH, { sha: commit.sha });
  return commit.sha;
}

// ---------- twarde limity (idioto-odporność) ----------
const LIMITS = { title: 60, description: 160, alt: 125, metaTitle: 60, metaDesc: 160 };
function validate(files) {
  const errs = [];
  for (const f of files) {
    if (f.delete) continue;
    if (f.base64) { if (f.base64.length > 9e6) errs.push(f.path + ': zdjęcie za duże po kompresji (max ~6 MB)'); continue; }
    if (!f.text) continue;
    let data; try { data = JSON.parse(f.text); } catch (e) { if (f.path.endsWith('.json')) errs.push(f.path + ': niepoprawny JSON'); continue; }
    if (f.path === 'content/seo.json') {
      for (const [page, p] of Object.entries(data.pages || {})) {
        if ((p.title || '').length > LIMITS.title) errs.push(page + ': meta title > ' + LIMITS.title + ' znaków');
        if ((p.description || '').length > LIMITS.description) errs.push(page + ': meta description > ' + LIMITS.description + ' znaków');
        for (const [src, alt] of Object.entries(p.alts || {})) if ((alt || '').length > LIMITS.alt) errs.push(page + ' / ' + src + ': alt > ' + LIMITS.alt + ' znaków');
      }
    }
    if (f.path.startsWith('content/blog/')) {
      if ((data.metaTitle || '').length > LIMITS.metaTitle) errs.push(f.path + ': meta title > ' + LIMITS.metaTitle);
      if ((data.metaDesc || '').length > LIMITS.metaDesc) errs.push(f.path + ': meta description > ' + LIMITS.metaDesc);
      if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug)) errs.push(f.path + ': niepoprawny adres (slug)');
      if ((data.coverAlt || '').length > LIMITS.alt) errs.push(f.path + ': opis zdjęcia (alt) > ' + LIMITS.alt + ' znaków');
      if (/<script|<iframe|<object|<embed|\son\w+\s*=|javascript:/i.test(data.bodyHtml || '')) errs.push(f.path + ': niedozwolony kod HTML we wpisie');
      if (/src="data:/i.test(data.bodyHtml || '')) errs.push(f.path + ': wpis zawiera niezapisane zdjęcie — wgraj je ponownie');
    }
    if (f.path.startsWith('content/') && !f.path.startsWith('content/blog/') && f.path !== 'content/seo.json') {
      // teksty i maszyny: bez limitów twardych, ale bez HTML w polach tekstowych
    }
  }
  const badPath = files.find(f => !/^(content\/|assets\/|uploads\/blog\/)[\w\-. \/ąćęłńóśźżĄĆĘŁŃÓŚŹŻ()]+$/.test(f.path) || f.path.includes('..'));
  if (badPath) errs.push('Niedozwolona ścieżka: ' + badPath.path);
  return errs;
}

// ---------- sesje ----------
function makeSession(email) { const exp = Date.now() + 12 * 3600e3; const p = email + '|' + exp; return Buffer.from(p).toString('base64') + '.' + sign(p); }
function checkSession(req) {
  const m = /(?:^|;\s*)awcms=([^;]+)/.exec(req.headers.cookie || ''); if (!m) return null;
  const [b64, sig] = m[1].split('.'); if (!b64 || !sig) return null;
  const p = Buffer.from(b64, 'base64').toString('utf8');
  if (!timingEq(sign(p), sig)) return null;
  const [email, exp] = p.split('|'); if (Date.now() > +exp) return null; return email;
}
const attempts = {}; // IP -> {n, t}

// ---------- serwer ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    // logowanie
    if (req.method === 'POST' && url.pathname === '/api/login') {
      const ip = req.socket.remoteAddress; const a = attempts[ip] || { n: 0, t: 0 };
      if (a.n >= 8 && Date.now() - a.t < 15 * 60e3) return json(res, 429, { error: 'Za dużo prób. Spróbuj za 15 minut.' });
      const { email, password } = JSON.parse(await readBody(req));
      // Konta: ADMIN_USERS="email:hasło,email2:hasło2" (+ opcjonalnie ADMIN_EMAIL/ADMIN_PASSWORD jako dodatkowe konto)
      const users = (ENV.ADMIN_USERS || '').split(',').map(s => s.trim()).filter(Boolean)
        .map(s => { const i = s.indexOf(':'); return [s.slice(0, i), s.slice(i + 1)]; });
      if (ENV.ADMIN_EMAIL && ENV.ADMIN_PASSWORD) users.push([ENV.ADMIN_EMAIL, ENV.ADMIN_PASSWORD]);
      const ok = users.some(([e, p]) => timingEq(email, e) && timingEq(password, p));
      if (ok) {
        delete attempts[ip];
        res.writeHead(200, { 'Set-Cookie': 'awcms=' + makeSession(email) + '; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=43200', 'Content-Type': 'application/json' });
        return res.end('{"ok":true}');
      }
      attempts[ip] = { n: a.n + 1, t: Date.now() };
      return json(res, 401, { error: 'Błędny e-mail lub hasło.' });
    }
    if (url.pathname === '/api/logout') { res.writeHead(200, { 'Set-Cookie': 'awcms=; Path=/; Max-Age=0', 'Content-Type': 'application/json' }); return res.end('{"ok":true}'); }

    if (url.pathname.startsWith('/api/')) {
      const user = checkSession(req);
      if (!user) return json(res, 401, { error: 'auth' });

      if (req.method === 'GET' && url.pathname === '/api/file') {
        const p = url.searchParams.get('path') || '';
        if (p.includes('..')) return json(res, 400, { error: 'path' });
        const r = await gh('GET', R + '/contents/' + encodeURIComponent(p).replace(/%2F/g, '/') + '?ref=' + BRANCH);
        return json(res, 200, { path: p, sha: r.sha, text: Buffer.from(r.content, 'base64').toString('utf8') });
      }
      if (req.method === 'GET' && url.pathname === '/api/list') {
        const p = url.searchParams.get('path') || '';
        if (p.includes('..')) return json(res, 400, { error: 'path' });
        const r = await gh('GET', R + '/contents/' + p + '?ref=' + BRANCH);
        return json(res, 200, r.map(x => ({ name: x.name, path: x.path, type: x.type, size: x.size })));
      }
      if (req.method === 'POST' && url.pathname === '/api/publish') {
        const { files, message } = JSON.parse(await readBody(req));
        if (!Array.isArray(files) || !files.length) return json(res, 400, { error: 'Brak plików do publikacji.' });
        const errs = validate(files);
        if (errs.length) return json(res, 422, { error: 'Nie opublikowano — popraw:', details: errs });
        const sha = await commitFiles(files, (message || 'Aktualizacja treści') + '\n\n[cms] ' + user, user);
        return json(res, 200, { ok: true, commit: sha });
      }
      if (req.method === 'POST' && url.pathname === '/api/translate') {
        const { texts, langs } = JSON.parse(await readBody(req));
        // DeepL (darmowy do 500k znaków/mies.) ma pierwszeństwo, potem Anthropic
        if (ENV.DEEPL_API_KEY) {
          const host = ENV.DEEPL_API_KEY.endsWith(':fx') ? 'api-free.deepl.com' : 'api.deepl.com';
          const out = {};
          for (const lang of langs) {
            const body = JSON.stringify({ text: texts, source_lang: 'PL', target_lang: lang.toUpperCase() === 'EN' ? 'EN-GB' : lang.toUpperCase() });
            const r = await request(host, 'POST', '/v2/translate', { 'Authorization': 'DeepL-Auth-Key ' + ENV.DEEPL_API_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }, body);
            const data = JSON.parse(r.body);
            if (r.status >= 400) return json(res, 502, { error: 'DeepL: ' + (data.message || r.status) });
            out[lang] = data.translations.map(t => t.text);
          }
          return json(res, 200, { translations: out });
        }
        if (!ENV.ANTHROPIC_API_KEY) return json(res, 501, { error: 'Tłumaczenia nie są jeszcze skonfigurowane (brak klucza DEEPL_API_KEY lub ANTHROPIC_API_KEY).' });
        const prompt = 'Przetłumacz poniższe teksty ze strony producenta maszyn rolniczych z polskiego na języki: ' + langs.join(', ') +
          '. Zachowaj ton techniczno-handlowy. Odpowiedz WYŁĄCZNIE JSON-em w formacie {"<lang>": ["tekst1", ...]} bez komentarzy.\n\nTeksty:\n' + JSON.stringify(texts);
        const body = JSON.stringify({ model: ENV.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest', max_tokens: 4000, messages: [{ role: 'user', content: prompt }] });
        const r = await request('api.anthropic.com', 'POST', '/v1/messages', { 'x-api-key': ENV.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }, body);
        const data = JSON.parse(r.body);
        if (r.status >= 400) return json(res, 502, { error: data.error && data.error.message || 'Błąd API tłumaczeń' });
        let text = data.content[0].text.trim().replace(/^```json?\s*|```$/g, '');
        return json(res, 200, { translations: JSON.parse(text) });
      }
      return json(res, 404, { error: 'not found' });
    }

    // statyczne pliki panelu
    let f = url.pathname === '/' ? '/index.html' : url.pathname;
    f = path.normalize(f).replace(/^([.\\/])+/, '');
    const fp = path.join(__dirname, 'public', f);
    if (fp.startsWith(path.join(__dirname, 'public')) && fs.existsSync(fp) && fs.statSync(fp).isFile()) {
      res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
      return res.end(fs.readFileSync(fp));
    }
    res.writeHead(404); res.end('404');
  } catch (e) {
    console.error(e); json(res, 500, { error: String(e.message || e) });
  }
}).listen(PORT, () => console.log('CMS na porcie ' + PORT + ', repo ' + REPO + '@' + BRANCH));
