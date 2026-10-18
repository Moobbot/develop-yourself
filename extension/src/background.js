import { ensureDefaults, getAll, addEvent, uid } from './storage.js';
import { analyzeUrl, compileRules } from './detector.js';

const INTERVENTION = chrome.runtime.getURL('pages/intervention.html');

/* ------------------------------------------------------------------ config cache */

let cache = null;
async function config() {
  if (!cache) {
    const data = await getAll();
    cache = { settings: data.settings, rules: compileRules(data) };
  }
  return cache;
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes.settings || changes.keywords || changes.allowlist || changes.domains) {
    cache = null;
    updateBadge();
  }
});

/* ------------------------------------------------------------------ lifecycle */

chrome.runtime.onInstalled.addListener(async (details) => {
  await ensureDefaults();
  cache = null;
  updateBadge();
  if (details.reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('pages/options.html#welcome') });
  }
});

chrome.runtime.onStartup.addListener(async () => {
  await ensureDefaults();
  updateBadge();
});

/* ------------------------------------------------------------------ temporary allow list (after "continue anyway") */

async function isAllowed(signature) {
  const { allow = {} } = await chrome.storage.session.get('allow');
  const exp = allow[signature];
  return !!exp && exp > Date.now();
}

async function allowSignature(signature, minutes) {
  const { allow = {} } = await chrome.storage.session.get('allow');
  const now = Date.now();
  for (const k of Object.keys(allow)) if (allow[k] < now) delete allow[k];
  allow[signature] = now + Math.max(1, minutes) * 60000;
  await chrome.storage.session.set({ allow });
}

/* ------------------------------------------------------------------ core */

const recent = new Map(); // tabId -> {url, t}  (dedupe the several events fired per navigation)

async function inspect(tabId, url, frameId = 0) {
  if (frameId !== 0 || tabId < 0 || !url || !/^https?:/i.test(url)) return;

  const { settings, rules } = await config();
  if (!settings.enabled) return;
  if (settings.pausedUntil && settings.pausedUntil > Date.now()) return;

  const result = analyzeUrl(url, rules, settings);
  if (!result) return;

  const last = recent.get(tabId);
  if (last && last.sig === result.signature && Date.now() - last.t < 4000) return;
  recent.set(tabId, { sig: result.signature, t: Date.now() });

  if (await isAllowed(result.signature)) return;

  const id = uid();
  const target = `${INTERVENTION}?${new URLSearchParams({
    id,
    u: url,
    k: result.kind,
    e: result.engine,
    q: result.query,
    m: result.matched,
    s: result.signature
  })}`;

  await addEvent({
    id,
    t: Date.now(),
    kind: result.kind,
    engine: result.engine,
    query: result.query,
    matched: result.matched,
    url,
    action: 'pending',
    reason: ''
  });

  try {
    await chrome.tabs.update(tabId, { url: target });
  } catch (err) {
    console.warn('[Mindful Shield] cannot redirect tab', tabId, err);
  }
}

chrome.webNavigation.onBeforeNavigate.addListener((d) => inspect(d.tabId, d.url, d.frameId));
chrome.webNavigation.onHistoryStateUpdated.addListener((d) => inspect(d.tabId, d.url, d.frameId));
chrome.webNavigation.onReferenceFragmentUpdated.addListener((d) => inspect(d.tabId, d.url, d.frameId));
// Safety net: pre-rendered omnibox results / tab swaps don't always fire onBeforeNavigate.
chrome.tabs.onUpdated.addListener((tabId, info) => { if (info.url) inspect(tabId, info.url, 0); });
chrome.tabs.onReplaced.addListener(async (addedTabId) => {
  try { const tab = await chrome.tabs.get(addedTabId); inspect(addedTabId, tab.url, 0); } catch { /* gone */ }
});
chrome.tabs.onRemoved.addListener((tabId) => recent.delete(tabId));

/* ------------------------------------------------------------------ messages from pages */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    switch (msg?.type) {
      case 'allow': {
        const { settings } = await config();
        await allowSignature(msg.signature, msg.minutes ?? settings.allowMinutes);
        sendResponse({ ok: true });
        break;
      }
      case 'test-url': {
        const { settings, rules } = await config();
        sendResponse({ ok: true, result: analyzeUrl(msg.url, rules, settings) });
        break;
      }
      default:
        sendResponse({ ok: false });
    }
  })();
  return true; // async response
});

/* ------------------------------------------------------------------ badge + pause timer */

async function updateBadge() {
  const { settings } = await config();
  const paused = settings.pausedUntil && settings.pausedUntil > Date.now();
  const off = !settings.enabled || paused;
  await chrome.action.setBadgeText({ text: off ? (paused ? 'II' : 'OFF') : '' });
  await chrome.action.setBadgeBackgroundColor({ color: paused ? '#f59e0b' : '#ef4444' });
  await chrome.alarms.clear('unpause');
  if (paused) chrome.alarms.create('unpause', { when: settings.pausedUntil + 500 });
}

chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === 'unpause') { cache = null; updateBadge(); }
});

updateBadge();
