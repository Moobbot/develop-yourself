import {
  getAll, get, set, updateSettings, resetKey, computeStats, formatDuration,
  putFile, deleteFile, resolveMediaUrl, youtubeId, uid, escapeHtml, DEFAULT_FACTORIES
} from '../src/storage.js';
import { compileRules, analyzeUrl, matchText } from '../src/detector.js';
import { LOCK_PHRASE } from '../src/defaults.js';

const $ = (id) => document.getElementById(id);
const toast = (msg) => {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2400);
};
const fmtTime = (t) => new Date(t).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
const linesOf = (txt) => [...new Set(txt.split('\n').map((s) => s.trim()).filter(Boolean))];

let data;

/* ================================================================== routing */

const SECTIONS = ['dashboard', 'journal', 'goals', 'quotes', 'images', 'videos', 'questions', 'actions', 'keywords', 'domains', 'settings', 'backup'];

function route() {
  let h = location.hash.slice(1) || 'dashboard';
  if (h === 'welcome') { $('welcome').classList.remove('hidden'); h = 'dashboard'; }
  if (!SECTIONS.includes(h)) h = 'dashboard';
  document.querySelectorAll('.sec').forEach((s) => s.classList.toggle('active', s.id === `sec-${h}`));
  document.querySelectorAll('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.sec === h));
  window.scrollTo({ top: 0 });
}
window.addEventListener('hashchange', route);

/* ================================================================== lock */

function requireLock() {
  if (!data.settings.lockDisable) return Promise.resolve(true);
  return new Promise((resolve) => {
    const m = $('lock-modal'), inp = $('lock-input'), ok = $('lock-ok');
    $('lock-phrase').textContent = LOCK_PHRASE;
    inp.value = '';
    ok.disabled = true;
    m.classList.remove('hidden');
    inp.focus();
    inp.oninput = () => { ok.disabled = inp.value.trim().toLowerCase() !== LOCK_PHRASE.toLowerCase(); };
    inp.onpaste = (e) => e.preventDefault(); // type it, don't paste it
    const done = (v) => { m.classList.add('hidden'); resolve(v); };
    ok.onclick = () => done(true);
    $('lock-cancel').onclick = () => done(false);
  });
}

/* ================================================================== dashboard */

const ACTION_META = {
  back: { ic: '🏆', label: 'Chiến thắng – đã quay lại' },
  continue: { ic: '⚠️', label: 'Đã chọn tiếp tục' },
  pending: { ic: '⏳', label: 'Đóng tab / chưa chọn' }
};

function eventHtml(e) {
  const meta = ACTION_META[e.action] || ACTION_META.pending;
  const what = e.kind === 'domain' ? `Mở trang ${e.engine}` : `“${e.query}”`;
  const tags = [e.kind === 'domain' ? 'Trang web' : e.engine, `khớp: ${e.matched}`, ...(e.moods || [])];
  return `<div class="event ${e.action}">
    <div class="ic">${meta.ic}</div>
    <div>
      <div class="q">${escapeHtml(what)}</div>
      <div class="meta">${fmtTime(e.t)} · ${meta.label}</div>
      <div class="tags">${tags.map((t) => `<span>${escapeHtml(t)}</span>`).join('')}</div>
      ${e.reason ? `<div class="why">${escapeHtml(e.reason)}</div>` : ''}
    </div>
    <button class="btn btn-sm btn-ghost del-ev" data-id="${e.id}" title="Xóa">✕</button>
  </div>`;
}

function renderDashboard() {
  const s = computeStats(data.events, data.settings);
  $('s-streak').textContent = formatDuration(s.streakMs);
  $('s-streak-sub').textContent = s.relapses ? 'kể từ lần cuối chọn tiếp tục' : 'kể từ khi cài đặt';
  $('s-wins').textContent = s.wins;
  $('s-rate').textContent = `${s.winRate}%`;
  $('s-best').textContent = s.bestDays;

  const max = Math.max(1, ...s.days.map((d) => d.total));
  $('chart').innerHTML = s.days.map((d) => {
    const h = (d.total / max) * 100;
    const pend = d.total - d.wins - d.relapses;
    const seg = (n, cls) => (n ? `<i class="${cls}" style="height:${(n / d.total) * 100}%"></i>` : '');
    return `<div class="bar" title="${d.key}: ${d.wins} thắng, ${d.relapses} tiếp tục, ${pend} khác">
      <span class="n">${d.total || ''}</span>
      <div class="stack" style="height:${d.total ? Math.max(h, 6) : 2}%">${seg(d.wins, 'w')}${seg(d.relapses, 'r')}${seg(pend, 'p')}</div>
      <small>${d.label}</small>
    </div>`;
  }).join('');

  const recent = [...data.events].reverse().slice(0, 6);
  $('recent').innerHTML = recent.length ? recent.map(eventHtml).join('') : '<div class="empty">Chưa có sự kiện nào. Tuyệt vời! 🌱</div>';
}

function renderJournal() {
  const f = $('j-filter').value;
  const list = [...data.events].reverse().filter((e) => f === 'all' || e.action === f);
  $('journal-list').innerHTML = list.length ? list.map(eventHtml).join('') : '<div class="empty">Không có mục nào.</div>';
}

async function deleteEvent(id) {
  data.events = data.events.filter((e) => e.id !== id);
  await set('events', data.events);
}

/* ================================================================== string lists (goals / questions / actions) */

function renderStringList(host) {
  const key = host.dataset.list;
  const items = data[key];
  host.innerHTML = `
    <div class="add-row">
      <input class="input" placeholder="${escapeHtml(host.dataset.placeholder || '')}" />
      <button class="btn btn-primary">+ Thêm</button>
    </div>
    <div class="toolbar"><span class="mute">${items.length} mục · nhấp vào nội dung để sửa</span><button class="btn btn-sm btn-ghost" data-reset="${key}">↺ Khôi phục mặc định</button></div>
    <div class="list">${items.map((t, i) => `
      <div class="item"><div class="txt" contenteditable="true" data-i="${i}">${escapeHtml(t)}</div>
      <button class="btn btn-sm btn-ghost del" data-i="${i}">✕</button></div>`).join('') || '<div class="empty">Danh sách trống</div>'}
    </div>`;
  const input = host.querySelector('.add-row input');
  const add = async () => {
    const v = input.value.trim();
    if (!v) return;
    data[key].unshift(v);
    await set(key, data[key]);
    renderStringList(host);
    toast('Đã thêm ✓');
  };
  host.querySelector('.add-row button').onclick = add;
  input.onkeydown = (e) => { if (e.key === 'Enter') add(); };
  host.querySelectorAll('.del').forEach((b) => (b.onclick = async () => {
    data[key].splice(Number(b.dataset.i), 1);
    await set(key, data[key]);
    renderStringList(host);
  }));
  host.querySelectorAll('.txt').forEach((el) => {
    el.onblur = async () => {
      const v = el.textContent.trim();
      const i = Number(el.dataset.i);
      if (!v) { data[key].splice(i, 1); } else if (v !== data[key][i]) { data[key][i] = v; } else return;
      await set(key, data[key]);
      renderStringList(host);
      toast('Đã lưu ✓');
    };
    el.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.blur(); } };
  });
}

/* ================================================================== quotes */

function renderQuotes() {
  $('quote-count').textContent = `${data.quotes.length} câu nói`;
  $('quote-list').innerHTML = data.quotes.map((q) => `
    <div class="item">
      <div style="flex:1">
        <div class="txt" contenteditable="true" data-id="${q.id}" data-f="text">${escapeHtml(q.text)}</div>
        <div class="by txt" contenteditable="true" data-id="${q.id}" data-f="author" data-ph="Tác giả">${escapeHtml(q.author || '')}</div>
      </div>
      ${q.builtin ? '<span class="badge">Mặc định</span>' : ''}
      <button class="btn btn-sm btn-ghost del" data-id="${q.id}">✕</button>
    </div>`).join('') || '<div class="empty">Chưa có câu nói nào</div>';
}

async function addQuotes(arr) {
  data.quotes.unshift(...arr.map((q) => ({ id: uid(), builtin: false, ...q })));
  await set('quotes', data.quotes);
  renderQuotes();
  toast(`Đã thêm ${arr.length} câu nói ✓`);
}

function initQuotes() {
  $('quote-add').onclick = () => {
    const text = $('quote-text').value.trim();
    if (!text) return toast('Hãy nhập nội dung câu nói');
    addQuotes([{ text, author: $('quote-author').value.trim() }]);
    $('quote-text').value = ''; $('quote-author').value = '';
  };
  $('quote-bulk-add').onclick = () => {
    const arr = linesOf($('quote-bulk').value).map((line) => {
      const m = line.match(/^(.*?)\s+[—–-]\s+([^—–-]+)$/);
      return m ? { text: m[1].trim().replace(/^["“]|["”]$/g, ''), author: m[2].trim() } : { text: line, author: '' };
    });
    if (arr.length) { addQuotes(arr); $('quote-bulk').value = ''; }
  };
  $('quote-list').addEventListener('click', async (e) => {
    const b = e.target.closest('.del');
    if (!b) return;
    data.quotes = data.quotes.filter((q) => q.id !== b.dataset.id);
    await set('quotes', data.quotes);
    renderQuotes();
  });
  $('quote-list').addEventListener('focusout', async (e) => {
    const el = e.target.closest('.txt');
    if (!el) return;
    const q = data.quotes.find((x) => x.id === el.dataset.id);
    if (!q) return;
    const v = el.textContent.trim();
    if (el.dataset.f === 'text' && !v) return renderQuotes();
    if (q[el.dataset.f] === v) return;
    q[el.dataset.f] = v;
    await set('quotes', data.quotes);
    toast('Đã lưu ✓');
  });
}

/* ================================================================== images & videos */

const tileUrls = [];

async function renderMedia(kind) {
  const list = data[kind];
  const grid = $(kind === 'images' ? 'img-grid' : 'vid-grid');
  $(kind === 'images' ? 'img-count' : 'vid-count').textContent = `${list.length} ${kind === 'images' ? 'hình ảnh' : 'video'}`;
  if (!list.length) { grid.innerHTML = '<div class="empty">Chưa có mục nào</div>'; return; }
  grid.innerHTML = '';
  for (const it of list) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    const label = kind === 'images' ? it.caption : it.title;
    const typeLabel = { builtin: 'Mặc định', youtube: 'YouTube', url: 'Liên kết', file: 'Tệp' }[it.type] || it.type;
    tile.innerHTML = `<div class="thumb"></div>
      <div class="cap"><span class="txt" contenteditable="true" title="Nhấp để sửa">${escapeHtml(label || '(không có chú thích)')}</span><span class="badge">${typeLabel}</span></div>
      <button class="x" title="Xóa">✕</button>`;
    const thumb = tile.querySelector('.thumb');
    if (kind === 'images') {
      const src = await resolveMediaUrl(it);
      if (it.type === 'file') tileUrls.push(src);
      thumb.style.backgroundImage = `url("${src}")`;
    } else if (it.type === 'youtube') {
      const id = youtubeId(it.src);
      thumb.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`;
      thumb.textContent = '▶';
    } else {
      const src = await resolveMediaUrl(it);
      if (it.type === 'file') tileUrls.push(src);
      thumb.innerHTML = src ? `<video src="${src}#t=1" muted preload="metadata"></video>` : '🎬';
    }
    tile.querySelector('.x').onclick = async () => {
      if (it.type === 'file') await deleteFile(it.src).catch(() => {});
      data[kind] = data[kind].filter((x) => x.id !== it.id);
      await set(kind, data[kind]);
      renderMedia(kind);
    };
    const cap = tile.querySelector('.txt');
    cap.onfocus = () => { if (!label) cap.textContent = ''; };
    cap.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); cap.blur(); } };
    cap.onblur = async () => {
      const v = cap.textContent.trim();
      it[kind === 'images' ? 'caption' : 'title'] = v;
      await set(kind, data[kind]);
      if (!v) cap.textContent = '(không có chú thích)';
    };
    grid.appendChild(tile);
  }
}

async function addFiles(kind, files) {
  const accept = kind === 'images' ? /^image\// : /^video\//;
  let n = 0;
  for (const f of files) {
    if (!accept.test(f.type)) continue;
    const id = uid();
    await putFile(id, f);
    const name = f.name.replace(/\.[^.]+$/, '');
    data[kind].unshift(kind === 'images'
      ? { id: uid(), type: 'file', src: id, caption: name, builtin: false }
      : { id: uid(), type: 'file', src: id, title: name, builtin: false });
    n++;
  }
  if (!n) return toast('Không có tệp hợp lệ');
  await set(kind, data[kind]);
  renderMedia(kind);
  toast(`Đã thêm ${n} tệp ✓`);
}

function setupDrop(labelId, inputId, kind) {
  const drop = $(labelId);
  $(inputId).onchange = (e) => { addFiles(kind, [...e.target.files]); e.target.value = ''; };
  drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = (e) => { e.preventDefault(); drop.classList.remove('over'); addFiles(kind, [...e.dataTransfer.files]); };
}

function initMedia() {
  $('img-add').onclick = async () => {
    const src = $('img-url').value.trim();
    if (!/^(https?:|data:image\/)/i.test(src)) return toast('Đường dẫn ảnh không hợp lệ');
    data.images.unshift({ id: uid(), type: 'url', src, caption: $('img-caption').value.trim(), builtin: false });
    await set('images', data.images);
    $('img-url').value = ''; $('img-caption').value = '';
    renderMedia('images');
    toast('Đã thêm ảnh ✓');
  };
  $('vid-add').onclick = async () => {
    const src = $('vid-url').value.trim();
    const yt = youtubeId(src);
    if (!yt && !/^https?:/i.test(src)) return toast('Link video không hợp lệ');
    let title = $('vid-title').value.trim();
    if (yt && !title) {
      try {
        const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + yt)}&format=json`);
        if (r.ok) title = (await r.json()).title;
      } catch { /* offline */ }
    }
    data.videos.unshift({ id: uid(), type: yt ? 'youtube' : 'url', src: yt ? `https://www.youtube.com/watch?v=${yt}` : src, title, builtin: false });
    await set('videos', data.videos);
    $('vid-url').value = ''; $('vid-title').value = '';
    renderMedia('videos');
    toast('Đã thêm video ✓');
  };
  setupDrop('img-drop', 'img-file', 'images');
  setupDrop('vid-drop', 'vid-file', 'videos');
}

/* ================================================================== keywords & domains */

function renderKeywords() {
  $('kw-text').value = data.keywords.join('\n');
  $('al-text').value = data.allowlist.join('\n');
  $('kw-count').textContent = `(${data.keywords.length})`;
  $('al-count').textContent = `(${data.allowlist.length})`;
}
function renderDomains() {
  $('dm-text').value = data.domains.join('\n');
  $('dm-count').textContent = `(${data.domains.length})`;
}

function initKeywords() {
  $('kw-save').onclick = async () => {
    const kw = linesOf($('kw-text').value), al = linesOf($('al-text').value);
    if (kw.length < data.keywords.length && !(await requireLock())) return renderKeywords();
    data.keywords = kw; data.allowlist = al;
    await chrome.storage.local.set({ keywords: kw, allowlist: al });
    renderKeywords();
    toast('Đã lưu từ khóa ✓');
  };
  $('dm-save').onclick = async () => {
    const dm = linesOf($('dm-text').value);
    if (dm.length < data.domains.length && !(await requireLock())) return renderDomains();
    data.domains = dm;
    await set('domains', dm);
    renderDomains();
    toast('Đã lưu danh sách ✓');
  };
  const test = () => {
    const v = $('test-input').value.trim();
    const out = $('test-result');
    if (!v) { out.textContent = ''; return; }
    const rules = compileRules({ keywords: linesOf($('kw-text').value), allowlist: linesOf($('al-text').value), domains: data.domains });
    let res;
    if (/^https?:\/\//i.test(v)) {
      const r = analyzeUrl(v, rules, data.settings);
      res = r ? `${r.kind === 'domain' ? 'Trang web bị chặn' : `Tìm kiếm trên ${r.engine}`} – khớp "${r.matched}"` : null;
    } else {
      const m = matchText(v, rules);
      res = m ? `Khớp từ khóa "${m}"` : null;
    }
    out.className = 'test-result ' + (res ? 'hit' : 'ok');
    out.textContent = res ? `🚨 Sẽ hiện nhắc nhở: ${res}` : '✅ Không bị phát hiện';
  };
  $('test-btn').onclick = test;
  $('test-input').onkeydown = (e) => { if (e.key === 'Enter') test(); };
}

/* ================================================================== settings */

const PROTECTIVE = ['enabled', 'strictMode', 'lockDisable', 'monitorDomains', 'requireReason'];

function renderSettings() {
  document.querySelectorAll('[data-set]').forEach((el) => {
    const v = data.settings[el.dataset.set];
    if (el.type === 'checkbox') el.checked = !!v; else el.value = v ?? '';
  });
}

function initSettings() {
  document.querySelectorAll('[data-set]').forEach((el) => {
    el.addEventListener('change', async () => {
      const key = el.dataset.set;
      let val = el.type === 'checkbox' ? el.checked : el.type === 'number' ? Number(el.value) : el.value.trim();
      const weakening =
        (PROTECTIVE.includes(key) && val === false) ||
        (key === 'continueDelaySec' && val < data.settings.continueDelaySec) ||
        (key === 'minReasonLength' && val < data.settings.minReasonLength);
      if (weakening && !(await requireLock())) { renderSettings(); return; }
      if (key === 'enabled' && val) await updateSettings({ pausedUntil: 0 });
      data.settings = await updateSettings({ [key]: val });
      toast('Đã lưu cài đặt ✓');
    });
  });
}

/* ================================================================== backup */

function initBackup() {
  $('export').onclick = async () => {
    const all = await getAll();
    const blob = new Blob([JSON.stringify({ app: 'mindful-shield', version: 1, exportedAt: new Date().toISOString(), ...all }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mindful-shield-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  $('import').onchange = async (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const json = JSON.parse(await f.text());
      if (json.app !== 'mindful-shield') throw new Error('Tệp không đúng định dạng');
      const patch = {};
      for (const k of Object.keys(DEFAULT_FACTORIES)) if (Array.isArray(json[k])) patch[k] = json[k];
      for (const k of ['images', 'videos']) if (patch[k]) patch[k] = patch[k].filter((x) => x.type !== 'file');
      if (json.settings) patch.settings = { ...data.settings, ...json.settings };
      await chrome.storage.local.set(patch);
      await reload();
      toast('Đã nhập dữ liệu ✓');
    } catch (err) {
      toast('Lỗi: ' + err.message);
    }
  };
  $('reset-all').onclick = async () => {
    if (!confirm('Khôi phục toàn bộ nội dung mặc định? Nội dung bạn tự thêm sẽ bị xóa (nhật ký được giữ lại).')) return;
    if (!(await requireLock())) return;
    for (const k of Object.keys(DEFAULT_FACTORIES)) if (k !== 'events') await resetKey(k);
    await reload();
    toast('Đã khôi phục mặc định ✓');
  };
}

/* ================================================================== global handlers */

document.addEventListener('click', async (e) => {
  const r = e.target.closest('[data-reset]');
  if (r) {
    const key = r.dataset.reset;
    if (!confirm('Khôi phục danh sách này về mặc định?')) return;
    await resetKey(key);
    await reload();
    toast('Đã khôi phục ✓');
    return;
  }
  const d = e.target.closest('.del-ev');
  if (d) { await deleteEvent(d.dataset.id); renderDashboard(); renderJournal(); }
});

$('j-filter').onchange = renderJournal;
$('j-clear').onclick = async () => {
  if (!confirm('Xóa toàn bộ nhật ký? Thống kê chuỗi ngày cũng sẽ được tính lại.')) return;
  if (!(await requireLock())) return;
  data.events = [];
  await set('events', []);
  renderDashboard(); renderJournal();
};

async function reload() {
  data = await getAll();
  tileUrls.splice(0).forEach((u) => URL.revokeObjectURL(u));
  renderDashboard();
  renderJournal();
  document.querySelectorAll('[data-list]').forEach(renderStringList);
  renderQuotes();
  renderMedia('images');
  renderMedia('videos');
  renderKeywords();
  renderDomains();
  renderSettings();
}

// Live-refresh stats when an intervention happens in another tab.
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'local' && changes.events) {
    data.events = await get('events');
    renderDashboard();
    renderJournal();
  }
});

(async function boot() {
  route();
  await reload();
  initQuotes();
  initMedia();
  initKeywords();
  initSettings();
  initBackup();
})();
