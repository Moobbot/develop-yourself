/**
 * Pure detection logic – no chrome.* APIs so it can be unit-tested with Node.
 */

/** Known search engines / sites and the URL params that hold the query. */
export const ENGINES = [
  { name: 'Google', host: /(^|\.)google\.[a-z.]{2,8}$/, params: ['q', 'as_q', 'oq', 'as_epq'] },
  { name: 'Bing', host: /(^|\.)bing\.com$/, params: ['q'] },
  { name: 'Yahoo', host: /(^|\.)yahoo\.[a-z.]{2,8}$/, params: ['p', 'q'] },
  { name: 'DuckDuckGo', host: /(^|\.)duckduckgo\.com$/, params: ['q'] },
  { name: 'Cốc Cốc', host: /(^|\.)coccoc\.com$/, params: ['query', 'q'] },
  { name: 'Yandex', host: /(^|\.)(yandex\.[a-z.]{2,8}|ya\.ru)$/, params: ['text'] },
  { name: 'Baidu', host: /(^|\.)baidu\.com$/, params: ['wd', 'word'] },
  { name: 'Brave Search', host: /^search\.brave\.com$/, params: ['q'] },
  { name: 'Ecosia', host: /(^|\.)ecosia\.org$/, params: ['q'] },
  { name: 'Startpage', host: /(^|\.)startpage\.com$/, params: ['query', 'q'] },
  { name: 'Qwant', host: /(^|\.)qwant\.com$/, params: ['q'] },
  { name: 'Naver', host: /(^|\.)naver\.com$/, params: ['query'] },
  { name: 'Ask', host: /(^|\.)ask\.com$/, params: ['q'] },
  { name: 'AOL', host: /(^|\.)aol\.com$/, params: ['q'] },
  { name: 'Sogou', host: /(^|\.)sogou\.com$/, params: ['query'] },
  { name: 'Seznam', host: /(^|\.)seznam\.cz$/, params: ['q'] },
  { name: 'Perplexity', host: /(^|\.)perplexity\.ai$/, params: ['q'] },
  { name: 'YouTube', host: /(^|\.)youtube\.com$/, params: ['search_query', 'q'] },
  { name: 'TikTok', host: /(^|\.)tiktok\.com$/, params: ['q'] },
  { name: 'Facebook', host: /(^|\.)facebook\.com$/, params: ['q'] },
  { name: 'X / Twitter', host: /(^|\.)(twitter|x)\.com$/, params: ['q'] },
  { name: 'Reddit', host: /(^|\.)reddit\.com$/, params: ['q'] },
  { name: 'Pinterest', host: /(^|\.)pinterest\.[a-z.]{2,8}$/, params: ['q'] },
  { name: 'Tumblr', host: /(^|\.)tumblr\.com$/, params: ['q'] },
  { name: 'Twitch', host: /(^|\.)twitch\.tv$/, params: ['term'] }
];

/** Params checked on every other website when settings.genericSearch is on. */
export const GENERIC_PARAMS = ['q', 'query', 'search', 'search_query', 'keyword', 'keywords', 'term', 'text', 's', 'k'];

/** Paths like tumblr.com/search/<term> or tiktok.com/tag/<term> */
const PATH_SEARCH = /\/(?:search|tag|tags|hashtag|explore\/tags)\/([^/?#]+)/i;

/* ------------------------------------------------------------------ normalisation */

export function stripDiacritics(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

/** ASCII-folded, lowercase, only [a-z0-9+] tokens separated by single spaces. */
export function normAscii(s) {
  return stripDiacritics(String(s).toLowerCase()).replace(/[^a-z0-9+]+/g, ' ').trim();
}

/** Lowercase Unicode (keeps diacritics / CJK), punctuation collapsed to spaces. */
export function normUnicode(s) {
  return String(s).toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}+]+/gu, ' ').trim();
}

function safeDecode(s) {
  try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch { return s; }
}

/* ------------------------------------------------------------------ compiling rules */

export function compileKeyword(raw) {
  let k = String(raw || '').trim();
  if (!k || k.startsWith('#')) return null;
  let mode = 'word';
  if (k.startsWith('*')) { mode = 'sub'; k = k.slice(1).trim(); }
  else if (k.startsWith('=')) { mode = 'exact'; k = k.slice(1).trim(); }
  if (!k) return null;
  const ascii = normAscii(k);
  const uni = normUnicode(k);
  return {
    raw: String(raw).trim(),
    mode,
    ascii,
    uni,
    asciiCompact: ascii.replace(/ /g, ''),
    uniCompact: uni.replace(/ /g, '')
  };
}

export function compileRules({ keywords = [], allowlist = [], domains = [] }) {
  return {
    keywords: keywords.map(compileKeyword).filter(Boolean),
    allowlist: allowlist.map(compileKeyword).filter(Boolean),
    domains: domains.map((d) => String(d || '').trim().toLowerCase()).filter((d) => d && !d.startsWith('#'))
  };
}

/* ------------------------------------------------------------------ matching */

function prepareText(text) {
  const ascii = normAscii(text);
  const uni = normUnicode(text);
  return {
    ascii: ` ${ascii} `,
    uni: ` ${uni} `,
    asciiCompact: ascii.replace(/ /g, ''),
    uniCompact: uni.replace(/ /g, '')
  };
}

function hit(t, k) {
  switch (k.mode) {
    case 'exact':
      return !!k.uni && t.uni.includes(` ${k.uni} `);
    case 'sub':
      return (!!k.asciiCompact && t.asciiCompact.includes(k.asciiCompact)) ||
             (!!k.uniCompact && t.uniCompact.includes(k.uniCompact));
    default:
      return (!!k.ascii && t.ascii.includes(` ${k.ascii} `)) ||
             (!!k.uni && t.uni.includes(` ${k.uni} `)) ||
             // "phimsex" written without spaces should still match "phim sex"
             (k.ascii.includes(' ') && k.asciiCompact.length >= 6 && t.asciiCompact.includes(k.asciiCompact)) ||
             // CJK keywords have no word boundaries
             (!k.ascii && !!k.uniCompact && t.uniCompact.includes(k.uniCompact));
  }
}

/**
 * Returns the first matching keyword (raw form) or null.
 * Allowlisted phrases (education, health, recovery…) always win.
 */
export function matchText(text, rules) {
  if (!text || !String(text).trim()) return null;
  const t = prepareText(text);
  if (rules.allowlist.some((k) => hit(t, k))) return null;
  const k = rules.keywords.find((kw) => hit(t, kw));
  return k ? k.raw : null;
}

export function matchDomain(host, rules) {
  host = String(host || '').toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
  if (!host) return null;
  for (const d of rules.domains) {
    if (d.startsWith('*')) {
      const sub = d.slice(1);
      if (sub && host.includes(sub)) return d;
    } else {
      const dom = d.replace(/^\./, '').replace(/^www\./, '');
      if (dom && (host === dom || host.endsWith('.' + dom))) return d;
    }
  }
  return null;
}

function collectQueries(u, params) {
  const out = [];
  const add = (v) => { if (v && v.trim()) out.push(v.trim()); };
  for (const p of params) u.searchParams.getAll(p).forEach(add);
  if (u.hash.length > 1 && u.hash.includes('=')) {
    try {
      const hp = new URLSearchParams(u.hash.slice(1));
      for (const p of params) hp.getAll(p).forEach(add);
    } catch { /* ignore */ }
  }
  return out;
}

/**
 * Analyse a URL.
 * @returns {null | {kind:'domain'|'search', engine:string, query:string, matched:string, signature:string}}
 */
export function analyzeUrl(url, rules, settings = {}) {
  let u;
  try { u = new URL(url); } catch { return null; }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname.toLowerCase().replace(/^www\./, '');

  if (settings.monitorDomains !== false) {
    const d = matchDomain(host, rules);
    if (d) return { kind: 'domain', engine: host, query: '', matched: d, signature: `domain:${host}` };
  }

  const engine = ENGINES.find((e) => e.host.test(host));
  let params = engine ? engine.params : settings.genericSearch !== false ? GENERIC_PARAMS : [];
  const queries = collectQueries(u, params);

  if (engine || settings.genericSearch !== false) {
    const pm = u.pathname.match(PATH_SEARCH);
    if (pm) queries.push(safeDecode(pm[1]).replace(/[-_]+/g, ' '));
  }

  for (const q of queries) {
    const m = matchText(q, rules);
    if (m) {
      return {
        kind: 'search',
        engine: engine ? engine.name : host,
        query: q,
        matched: m,
        signature: `search:${normAscii(q) || normUnicode(q)}`
      };
    }
  }
  return null;
}
