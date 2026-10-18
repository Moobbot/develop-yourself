import { getAll, updateSettings, computeStats, formatDuration, pick } from '../src/storage.js';
import { LOCK_PHRASE } from '../src/defaults.js';

const $ = (id) => document.getElementById(id);
let data;

function askLock() {
  if (!data.settings.lockDisable) return Promise.resolve(true);
  return new Promise((resolve) => {
    const box = $('lock'), inp = $('lock-input'), ok = $('lock-ok');
    $('lock-phrase').textContent = LOCK_PHRASE;
    inp.value = '';
    ok.disabled = true;
    box.classList.remove('hidden');
    inp.focus();
    inp.oninput = () => { ok.disabled = inp.value.trim().toLowerCase() !== LOCK_PHRASE.toLowerCase(); };
    inp.onpaste = (e) => e.preventDefault();
    const done = (v) => { box.classList.add('hidden'); resolve(v); };
    ok.onclick = () => done(true);
    $('lock-cancel').onclick = () => done(false);
  });
}

function render() {
  const s = data.settings;
  const st = computeStats(data.events, s);
  const paused = s.pausedUntil && s.pausedUntil > Date.now();
  const status = $('status');
  if (!s.enabled) { status.className = 'status off'; status.textContent = 'Đã tắt'; }
  else if (paused) {
    status.className = 'status paused';
    status.textContent = `Tạm dừng đến ${new Date(s.pausedUntil).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  } else { status.className = 'status on'; status.textContent = 'Đang bảo vệ'; }

  $('enabled').checked = !!s.enabled;
  $('pause-row').classList.toggle('hidden', !s.enabled || paused);
  $('resume-row').classList.toggle('hidden', !paused);

  $('streak').textContent = formatDuration(st.streakMs);
  $('streak-sub').textContent = st.relapses ? 'kể từ lần cuối chọn tiếp tục' : 'kể từ khi cài đặt';
  $('wins').textContent = st.wins;
  $('today').textContent = st.todayCount;
  $('rate').textContent = `${st.winRate}%`;
}

(async function boot() {
  data = await getAll();
  const q = pick(data.quotes);
  $('quote').textContent = q ? `“${q.text}”${q.author ? ` — ${q.author}` : ''}` : '';
  render();

  $('enabled').onchange = async (e) => {
    const on = e.target.checked;
    if (!on && !(await askLock())) { e.target.checked = true; return; }
    data.settings = await updateSettings({ enabled: on, pausedUntil: 0 });
    render();
  };
  document.querySelectorAll('[data-pause]').forEach((b) => (b.onclick = async () => {
    if (!(await askLock())) return;
    data.settings = await updateSettings({ pausedUntil: Date.now() + Number(b.dataset.pause) * 60000 });
    render();
  }));
  $('resume').onclick = async () => { data.settings = await updateSettings({ pausedUntil: 0 }); render(); };
  $('open-options').onclick = () => chrome.runtime.openOptionsPage();
  $('open-preview').onclick = () => chrome.tabs.create({ url: chrome.runtime.getURL('pages/intervention.html') });
})();
