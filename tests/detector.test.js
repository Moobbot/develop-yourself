import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compileRules, analyzeUrl, matchText, matchDomain } from '../extension/src/detector.js';
import { DEFAULT_KEYWORDS, DEFAULT_ALLOWLIST, DEFAULT_DOMAINS, DEFAULT_SETTINGS } from '../extension/src/defaults.js';

const rules = compileRules({ keywords: DEFAULT_KEYWORDS, allowlist: DEFAULT_ALLOWLIST, domains: DEFAULT_DOMAINS });
const S = DEFAULT_SETTINGS;
const g = (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}&oq=x`;

test('detects common adult searches (vi / en / jp)', () => {
  for (const q of [
    'phim sex', 'Phim Sex Việt Nam', 'phimsex', 'phim-sex hay', 'PHIM HEO', 'hentai manga', 'hentaiz',
    'xem jav mới', 'porn', 'pornhub', 'p o r n', 'video 18+', 'ảnh nóng hot girl', 'anh nong',
    'khoả thân', 'khoa than', 'clip nóng', 'onlyfans leak', 'rule34 genshin', 'truyện người lớn',
    'xxx', 's3x', 'nsfw art', 'エロ動画', 'xvideos', 'nhentai', 'chịch nhau', 'manhwa 18+'
  ]) {
    assert.ok(matchText(q, rules), `should match: ${q}`);
  }
});

test('does not flag innocent searches', () => {
  for (const q of [
    'java tutorial', 'javascript', 'Sussex university', 'unisex shoes', 'lon bia 330ml', 'con gái gọi điện cho mẹ',
    'chích ngừa covid', 'nude lipstick', 'thời tiết hà nội', 'essex county', 'sextant navigation',
    'giáo dục giới tính cho trẻ', 'sex education netflix', 'cách bỏ xem phim sex', 'quit porn tips',
    'nhiễm sắc thể giới tính', 'c++ học lập trình', 'top 18 phim hay', 'expert advice'
  ]) {
    assert.equal(matchText(q, rules), null, `should NOT match: ${q}`);
  }
});

test('exact (=) keywords need diacritics', () => {
  assert.ok(matchText('lồn', rules));
  assert.equal(matchText('lon', rules), null);
  assert.ok(matchText('nứng quá', rules));
  assert.equal(matchText('nung gốm', rules), null);
});

test('search engines', () => {
  const cases = [
    [g('phim sex'), 'Google'],
    ['https://www.google.com.vn/search?q=hentai', 'Google'],
    ['https://www.bing.com/search?q=porn&form=QBLH', 'Bing'],
    ['https://coccoc.com/search?query=phim+heo', 'Cốc Cốc'],
    ['https://duckduckgo.com/?q=xxx&ia=web', 'DuckDuckGo'],
    ['https://search.yahoo.com/search?p=jav', 'Yahoo'],
    ['https://www.youtube.com/results?search_query=18%2B', 'YouTube'],
    ['https://yandex.ru/search/?text=hentai', 'Yandex'],
    ['https://www.tiktok.com/search?q=sex', 'TikTok'],
    ['https://www.google.com/#q=porn', 'Google'],
    ['https://www.reddit.com/search/?q=nsfw', 'Reddit']
  ];
  for (const [url, engine] of cases) {
    const r = analyzeUrl(url, rules, S);
    assert.ok(r, `should detect ${url}`);
    assert.equal(r.kind, 'search');
    assert.equal(r.engine, engine);
  }
});

test('generic search param on other sites', () => {
  const r = analyzeUrl('https://some-forum.vn/tim-kiem?keyword=phim%20sex', rules, S);
  assert.ok(r);
  assert.equal(analyzeUrl('https://some-forum.vn/tim-kiem?keyword=phim%20sex', rules, { ...S, genericSearch: false }), null);
  assert.ok(analyzeUrl('https://www.tumblr.com/search/hentai', rules, S));
});

test('domains', () => {
  assert.ok(matchDomain('www.pornhub.com', rules));
  assert.ok(matchDomain('vn.xhamster.com', rules));
  assert.ok(matchDomain('anything.xxx', rules));
  assert.ok(matchDomain('freeporn-videos.net', rules));
  assert.equal(matchDomain('google.com', rules), null);
  assert.equal(matchDomain('sussex.ac.uk', rules), null);
  const r = analyzeUrl('https://nhentai.net/g/123', rules, S);
  assert.equal(r.kind, 'domain');
  assert.equal(analyzeUrl('https://nhentai.net/g/123', rules, { ...S, monitorDomains: false }), null);
});

test('ignores normal browsing and non-http', () => {
  for (const u of [
    'https://www.google.com/search?q=th%E1%BB%9Di+ti%E1%BA%BFt',
    'https://github.com/search?q=react',
    'https://vnexpress.net/',
    'chrome://extensions',
    'chrome-extension://abc/pages/intervention.html?q=sex',
    'not a url'
  ]) {
    assert.equal(analyzeUrl(u, rules, S), null, u);
  }
});

test('signature stable for same query', () => {
  const a = analyzeUrl(g('Phim  SEX'), rules, S);
  const b = analyzeUrl('https://www.bing.com/search?q=phim+sex', rules, S);
  assert.equal(a.signature, b.signature);
});
