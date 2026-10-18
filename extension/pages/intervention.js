import {
  getAll, updateEvent, computeStats, formatDuration, resolveMediaUrl,
  youtubeId, pick, shuffle, escapeHtml
} from '../src/storage.js';

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const ctx = {
  id: params.get('id') || '',
  url: params.get('u') || '',
  kind: params.get('k') || 'search',
  engine: params.get('e') || '',
  query: params.get('q') || '',
  matched: params.get('m') || '',
  signature: params.get('s') || '',
  preview: !params.get('id')
};

let data, settings;
let moods = new Set();
let resolved = false;

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ------------------------------------------------------------------ hero */

function renderHero() {
  const sub = $('hero-sub');
  if (ctx.preview) {
    sub.innerHTML = 'Đây là <b>bản xem trước</b> màn hình nhắc nhở. Nó sẽ xuất hiện khi bạn tìm kiếm nội dung 18+.';
    return;
  }
  if (ctx.kind === 'domain') {
    sub.innerHTML = settings.hideQuery
      ? 'Bạn vừa định mở một trang web nằm trong danh sách cần tránh.'
      : `Bạn vừa định mở <span class="q">${escapeHtml(ctx.engine)}</span>. Hãy dành 1 phút cho chính mình trước đã.`;
  } else {
    sub.innerHTML = settings.hideQuery
      ? `Bạn vừa tìm kiếm một nội dung nhạy cảm trên <b>${escapeHtml(ctx.engine)}</b>.`
      : `Bạn vừa tìm <span class="q">${escapeHtml(ctx.query)}</span> trên <b>${escapeHtml(ctx.engine)}</b>. Trước khi tiếp tục, hãy thành thật trả lời vài câu hỏi.`;
  }
  const h = new Date().getHours();
  if (h >= 23 || h < 5) $('eyebrow').textContent = 'Đã khuya rồi – cơ thể bạn cần nghỉ ngơi';
}

/* ------------------------------------------------------------------ stats */

function renderStats() {
  const s = computeStats(data.events, settings);
  $('streak').textContent = formatDuration(s.streakMs);
  $('wins').textContent = s.wins;
  return s;
}

/* ------------------------------------------------------------------ questions */

let qList = [], qi = 0;
function renderQuestion() {
  const el = $('question');
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  el.textContent = qList[qi] || 'Bạn xem nội dung này để làm gì?';
  $('q-index').textContent = `${qi + 1}/${qList.length || 1}`;
  $('q-dots').innerHTML = qList.map((_, i) => `<span class="${i === qi ? 'on' : ''}"></span>`).join('');
}
function initQuestions() {
  qList = shuffle(data.questions).slice(0, 4);
  qi = 0;
  renderQuestion();
  $('q-prev').onclick = () => { qi = (qi - 1 + qList.length) % qList.length; renderQuestion(); };
  $('q-next').onclick = () => { qi = (qi + 1) % qList.length; renderQuestion(); };
}

/* ------------------------------------------------------------------ goals / actions / moods */

function initGoals() {
  if (!data.goals.length) { $('goals-card').classList.add('hidden'); return; }
  $('goals').innerHTML = data.goals.map((g) => `<li>${escapeHtml(g)}</li>`).join('');
}

function initActions() {
  const list = shuffle(data.actions).slice(0, 6);
  $('actions').innerHTML = list.map((a, i) => `<button class="action" data-i="${i}">${escapeHtml(a)}</button>`).join('');
  $('actions').onclick = (e) => {
    const b = e.target.closest('.action');
    if (!b) return;
    b.classList.toggle('done');
    if (b.classList.contains('done')) toast('Tuyệt vời! Mỗi hành động nhỏ đều có giá trị 💪');
  };
}

function initMoods() {
  $('moods').onclick = (e) => {
    const b = e.target.closest('.mood');
    if (!b) return;
    const m = b.dataset.mood;
    b.classList.toggle('on');
    moods.has(m) ? moods.delete(m) : moods.add(m);
  };
}

/* ------------------------------------------------------------------ quote */

let quotePool = [];
function nextQuote() {
  if (!quotePool.length) quotePool = shuffle(data.quotes);
  const q = quotePool.pop();
  const bq = $('quote');
  bq.style.animation = 'none'; void bq.offsetWidth; bq.style.animation = '';
  bq.textContent = q ? q.text : 'Mỗi lần bạn nói "không" với cám dỗ, bạn đang nói "có" với tương lai của mình.';
  $('quote-author').textContent = q?.author || '';
}

/* ------------------------------------------------------------------ media */

let mediaTab = 'video', mi = 0, videos = [], images = [];
const objectUrls = [];

async function renderMedia() {
  const list = mediaTab === 'video' ? videos : images;
  const stage = $('media-stage');
  const cap = $('media-caption');
  const open = $('media-open');
  objectUrls.splice(0).forEach((u) => URL.revokeObjectURL(u));
  stage.innerHTML = '';
  open.textContent = '';
  open.removeAttribute('href');
  $('media-index').textContent = list.length ? `${mi + 1}/${list.length}` : '0/0';

  if (!list.length) {
    stage.innerHTML = `<div class="media-empty">Chưa có ${mediaTab === 'video' ? 'video' : 'hình ảnh'} nào.<br/><a href="options.html#${mediaTab === 'video' ? 'videos' : 'images'}" target="_blank">+ Thêm trong Cài đặt</a></div>`;
    cap.textContent = '';
    return;
  }
  const item = list[mi];

  if (mediaTab === 'image') {
    const src = await resolveMediaUrl(item);
    if (item.type === 'file') objectUrls.push(src);
    const img = new Image();
    img.alt = item.caption || 'Hình ảnh truyền cảm hứng';
    img.src = src;
    img.onerror = () => { stage.innerHTML = '<div class="media-empty">Không tải được hình ảnh này.</div>'; };
    stage.appendChild(img);
    cap.textContent = item.caption || '';
    return;
  }

  cap.textContent = item.title || '';
  const yt = item.type === 'youtube' ? youtubeId(item.src) : '';
  if (yt) {
    open.href = `https://www.youtube.com/watch?v=${yt}`;
    open.textContent = 'Mở trên YouTube ↗';
    const cover = document.createElement('div');
    cover.className = 'yt-cover';
    cover.style.backgroundImage = `url(https://i.ytimg.com/vi/${yt}/hqdefault.jpg)`;
    cover.innerHTML = '<div class="play"></div>';
    const play = () => {
      stage.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1"
        title="${escapeHtml(item.title || 'YouTube video')}" referrerpolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    };
    cover.onclick = play;
    stage.appendChild(cover);
    if (settings.autoPlayVideo) play();
    return;
  }

  const src = await resolveMediaUrl(item);
  if (item.type === 'file') objectUrls.push(src);
  if (!src) { stage.innerHTML = '<div class="media-empty">Không tìm thấy tệp video.</div>'; return; }
  const v = document.createElement('video');
  v.src = src;
  v.controls = true;
  v.playsInline = true;
  v.autoplay = !!settings.autoPlayVideo;
  stage.appendChild(v);
  if (item.type === 'url') { open.href = src; open.textContent = 'Mở liên kết ↗'; }
}

function initMedia() {
  videos = shuffle(data.videos);
  images = shuffle(data.images);
  if (!videos.length && images.length) setTab('image'); else renderMedia();
  document.querySelectorAll('.tab').forEach((t) => (t.onclick = () => setTab(t.dataset.tab)));
  $('media-prev').onclick = () => { const l = mediaTab === 'video' ? videos : images; if (l.length) { mi = (mi - 1 + l.length) % l.length; renderMedia(); } };
  $('media-next').onclick = () => { const l = mediaTab === 'video' ? videos : images; if (l.length) { mi = (mi + 1) % l.length; renderMedia(); } };
}
function setTab(tab) {
  mediaTab = tab; mi = 0;
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
  renderMedia();
}

async function initBackground() {
  const img = pick(data.images);
  if (!img) return;
  const src = await resolveMediaUrl(img);
  if (src) $('bg').style.backgroundImage = `url("${src}")`;
}

/* ------------------------------------------------------------------ breathing */

let breathTimer = null;
function startBreathing() {
  $('breathe-modal').classList.remove('hidden');
  const circle = $('breath-circle'), label = $('breath-label'), time = $('breath-time');
  const phases = [
    { name: 'Hít vào', dur: 4, scale: 1 },
    { name: 'Giữ', dur: 4, scale: 1 },
    { name: 'Thở ra', dur: 6, scale: 0.6 }
  ];
  let remaining = 60, pi = 0, left = 0;
  const step = () => {
    if (left <= 0) {
      const p = phases[pi % phases.length];
      pi++;
      left = p.dur;
      label.textContent = p.name;
      circle.style.transitionDuration = `${p.dur}s`;
      circle.style.transform = `scale(${p.scale})`;
    }
    time.textContent = remaining;
    if (remaining <= 0) {
      stopBreathing(false);
      label.textContent = 'Tuyệt vời 🌿';
      toast('Bạn vừa hoàn thành 1 phút hít thở. Cơn thèm muốn đã dịu đi chưa?');
      return;
    }
    remaining--; left--;
  };
  step();
  breathTimer = setInterval(step, 1000);
}
function stopBreathing(close = true) {
  clearInterval(breathTimer);
  breathTimer = null;
  if (close) $('breathe-modal').classList.add('hidden');
}

/* ------------------------------------------------------------------ continue (countdown + reason) */

function initContinue() {
  const btn = $('btn-continue');
  if (settings.strictMode) {
    btn.classList.add('hidden');
    $('strict-note').classList.remove('hidden');
    return;
  }
  let left = Math.max(0, Number(settings.continueDelaySec) || 0);
  const tick = () => {
    if (left > 0) {
      btn.textContent = `Vẫn tiếp tục (${left}s)`;
      btn.disabled = true;
      left--;
    } else {
      btn.textContent = 'Vẫn tiếp tục…';
      btn.disabled = false;
      clearInterval(timer);
    }
  };
  const timer = setInterval(tick, 1000);
  tick();

  btn.onclick = () => {
    $('continue-modal').classList.remove('hidden');
    const ta = $('continue-reason');
    ta.value = $('journal').value;
    ta.focus();
    validateReason();
  };
  $('continue-reason').oninput = validateReason;
  $('continue-cancel').onclick = () => { $('continue-modal').classList.add('hidden'); goBack(); };
  $('continue-confirm').onclick = doContinue;
}

function validateReason() {
  const len = $('continue-reason').value.trim().length;
  const need = settings.requireReason ? Number(settings.minReasonLength) || 0 : 0;
  $('continue-confirm').disabled = len < need;
  $('reason-hint').textContent = need
    ? (len < need ? `Hãy viết ít nhất ${need} ký tự (còn ${need - len}).` : 'Cảm ơn bạn đã thành thật với chính mình.')
    : 'Bạn có thể để trống, nhưng viết ra sẽ giúp bạn hiểu bản thân hơn.';
}

async function doContinue() {
  if (resolved) return;
  resolved = true;
  const reason = $('continue-reason').value.trim();
  if (!ctx.preview) {
    await updateEvent(ctx.id, { action: 'continue', reason, moods: [...moods], decidedAt: Date.now() });
    await chrome.runtime.sendMessage({ type: 'allow', signature: ctx.signature });
  }
  if (ctx.url) location.replace(ctx.url);
  else { $('continue-modal').classList.add('hidden'); toast('(Xem trước) Trang gốc sẽ được mở ở đây.'); resolved = false; }
}

/* ------------------------------------------------------------------ go back (win) */

async function goBack() {
  if (resolved) return;
  resolved = true;
  stopBreathing();
  if (!ctx.preview) {
    await updateEvent(ctx.id, {
      action: 'back',
      reason: $('journal').value.trim(),
      moods: [...moods],
      decidedAt: Date.now()
    });
  }
  data = await getAll();
  const s = renderStats();
  $('v-wins').textContent = s.wins || 1;
  $('v-streak').textContent = formatDuration(s.streakMs);
  $('v-rate').textContent = `${s.winRate}%`;
  const q = pick(data.quotes);
  $('v-quote').textContent = q ? `“${q.text}”` : '';
  $('victory').classList.remove('hidden');
  confetti();
}

function confetti() {
  const c = $('confetti');
  const ctx2 = c.getContext('2d');
  const W = (c.width = innerWidth * devicePixelRatio);
  const H = (c.height = innerHeight * devicePixelRatio);
  const colors = ['#8b5cf6', '#2dd4bf', '#fbbf24', '#fb7185', '#a78bfa', '#5eead4'];
  const parts = Array.from({ length: 180 }, () => ({
    x: W / 2 + (Math.random() - 0.5) * W * 0.2,
    y: H * 0.45,
    vx: (Math.random() - 0.5) * 22 * devicePixelRatio,
    vy: (-Math.random() * 22 - 6) * devicePixelRatio,
    s: (Math.random() * 7 + 4) * devicePixelRatio,
    r: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
    c: colors[(Math.random() * colors.length) | 0]
  }));
  let frames = 0;
  const loop = () => {
    ctx2.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.vy += 0.55 * devicePixelRatio; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx2.save(); ctx2.translate(p.x, p.y); ctx2.rotate(p.r);
      ctx2.fillStyle = p.c; ctx2.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx2.restore();
    }
    if (++frames < 240) requestAnimationFrame(loop); else ctx2.clearRect(0, 0, W, H);
  };
  loop();
}

async function closeTab() {
  try {
    const tab = await chrome.tabs.getCurrent();
    if (tab?.id != null) return chrome.tabs.remove(tab.id);
  } catch { /* fallthrough */ }
  window.close();
}

/* ------------------------------------------------------------------ boot */

async function boot() {
  data = await getAll();
  settings = data.settings;
  renderHero();
  renderStats();
  initQuestions();
  initGoals();
  initActions();
  initMoods();
  nextQuote();
  initMedia();
  initBackground();
  initContinue();

  $('quote-next').onclick = nextQuote;
  $('btn-back').onclick = goBack;
  $('btn-breathe').onclick = startBreathing;
  $('breathe-close').onclick = () => stopBreathing(true);
  $('v-safe').onclick = () => location.replace(settings.safeUrl || 'https://www.google.com');
  $('v-close').onclick = closeTab;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      stopBreathing(true);
      $('continue-modal').classList.add('hidden');
    }
  });
}

boot();
