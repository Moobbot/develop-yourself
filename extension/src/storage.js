import {
  DEFAULT_KEYWORDS, DEFAULT_ALLOWLIST, DEFAULT_DOMAINS, DEFAULT_QUESTIONS, DEFAULT_GOALS,
  DEFAULT_ACTIONS, DEFAULT_QUOTES, DEFAULT_IMAGES, DEFAULT_VIDEOS, DEFAULT_SETTINGS
} from './defaults.js';

export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

const withIds = (arr) => arr.map((x) => ({ id: uid(), builtin: true, ...x }));

/** Factory for every list-type key stored in chrome.storage.local. */
export const DEFAULT_FACTORIES = {
  keywords: () => [...DEFAULT_KEYWORDS],
  allowlist: () => [...DEFAULT_ALLOWLIST],
  domains: () => [...DEFAULT_DOMAINS],
  questions: () => [...DEFAULT_QUESTIONS],
  goals: () => [...DEFAULT_GOALS],
  actions: () => [...DEFAULT_ACTIONS],
  quotes: () => withIds(DEFAULT_QUOTES),
  images: () => withIds(DEFAULT_IMAGES),
  videos: () => withIds(DEFAULT_VIDEOS),
  events: () => []
};

export const MAX_EVENTS = 3000;

/** Fill in any missing keys (first install or after an update adds new keys). */
export async function ensureDefaults() {
  const cur = await chrome.storage.local.get(null);
  const patch = {};
  for (const [key, make] of Object.entries(DEFAULT_FACTORIES)) {
    if (!Array.isArray(cur[key])) patch[key] = make();
  }
  const settings = { ...DEFAULT_SETTINGS, ...(cur.settings || {}) };
  if (!settings.installedAt) settings.installedAt = Date.now();
  patch.settings = settings;
  await chrome.storage.local.set(patch);
}

export async function getAll() {
  const data = await chrome.storage.local.get(null);
  data.settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
  for (const [key, make] of Object.entries(DEFAULT_FACTORIES)) {
    if (!Array.isArray(data[key])) data[key] = make();
  }
  return data;
}

export async function get(key) {
  const r = await chrome.storage.local.get(key);
  if (key === 'settings') return { ...DEFAULT_SETTINGS, ...(r.settings || {}) };
  return r[key] ?? (DEFAULT_FACTORIES[key] ? DEFAULT_FACTORIES[key]() : undefined);
}

export const set = (key, value) => chrome.storage.local.set({ [key]: value });

export async function updateSettings(patch) {
  const s = await get('settings');
  const next = { ...s, ...patch };
  await set('settings', next);
  return next;
}

export async function resetKey(key) {
  if (!DEFAULT_FACTORIES[key]) return;
  await set(key, DEFAULT_FACTORIES[key]());
}

/* ------------------------------------------------------------------ events */

export async function addEvent(ev) {
  const events = await get('events');
  events.push(ev);
  if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
  await set('events', events);
}

export async function updateEvent(id, patch) {
  const events = await get('events');
  const e = events.find((x) => x.id === id);
  if (!e) return null;
  Object.assign(e, patch);
  await set('events', events);
  return e;
}

/* ------------------------------------------------------------------ stats */

const DAY = 86400000;
const dayKey = (t) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function computeStats(events, settings) {
  const now = Date.now();
  const wins = events.filter((e) => e.action === 'back').length;
  const relapses = events.filter((e) => e.action === 'continue');
  const lastRelapse = relapses.length ? relapses[relapses.length - 1].t : 0;
  const streakStart = Math.max(lastRelapse, settings.installedAt || now);
  const streakMs = Math.max(0, now - streakStart);
  const today = dayKey(now);
  const todayCount = events.filter((e) => dayKey(e.t) === today).length;

  // Best streak: longest gap between consecutive relapses (including install and now).
  const marks = [settings.installedAt || now, ...relapses.map((r) => r.t), now].sort((a, b) => a - b);
  let best = 0;
  for (let i = 1; i < marks.length; i++) best = Math.max(best, marks[i] - marks[i - 1]);

  // Last 14 days histogram
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const t = now - i * DAY;
    const k = dayKey(t);
    const evs = events.filter((e) => dayKey(e.t) === k);
    days.push({
      key: k,
      label: new Date(t).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit' }),
      total: evs.length,
      wins: evs.filter((e) => e.action === 'back').length,
      relapses: evs.filter((e) => e.action === 'continue').length
    });
  }

  const resolved = events.filter((e) => e.action === 'back' || e.action === 'continue').length;
  return {
    wins,
    relapses: relapses.length,
    total: events.length,
    todayCount,
    streakMs,
    streakDays: Math.floor(streakMs / DAY),
    bestDays: Math.floor(best / DAY),
    winRate: resolved ? Math.round((wins / resolved) * 100) : 100,
    days
  };
}

export function formatDuration(ms) {
  const d = Math.floor(ms / DAY);
  const h = Math.floor((ms % DAY) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (d > 0) return `${d} ngày ${h} giờ`;
  if (h > 0) return `${h} giờ ${m} phút`;
  return `${m} phút`;
}

/* ------------------------------------------------------------------ media (IndexedDB) */

const DB_NAME = 'mindful-shield-media';
const STORE = 'files';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    const res = fn(store);
    t.oncomplete = () => { db.close(); resolve(res instanceof IDBRequest ? res.result : res); };
    t.onerror = () => { db.close(); reject(t.error); };
  });
}

export const putFile = (id, blob) => tx('readwrite', (s) => s.put(blob, id));
export const getFile = (id) => tx('readonly', (s) => s.get(id));
export const deleteFile = (id) => tx('readwrite', (s) => s.delete(id));

/** Resolve a media item ({type, src}) into a URL usable by <img>/<video>. */
export async function resolveMediaUrl(item) {
  if (item.type === 'file') {
    const blob = await getFile(item.src);
    return blob ? URL.createObjectURL(blob) : '';
  }
  return item.src;
}

/* ------------------------------------------------------------------ helpers */

export function youtubeId(url) {
  if (!url) return '';
  const m = String(url).match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/
  );
  if (m) return m[1];
  return /^[\w-]{11}$/.test(url) ? url : '';
}

export const pick = (arr) => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined);

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
