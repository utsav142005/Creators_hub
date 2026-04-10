/* ═══════════════════════════════════════════════════════════
   CreatorHub — script.js
   Full Backend Integration (Node.js + Express + MongoDB)
   All API calls go to http://localhost:5000/api
═══════════════════════════════════════════════════════════ */

const BASE_URL = 'http://localhost:5000/api';

/* ─── TOKEN HELPERS ─── */
const Auth = {
  getToken  : ()            => localStorage.getItem('ch_token'),
  getUser   : ()            => JSON.parse(localStorage.getItem('ch_user') || 'null'),
  setSession: (token, user) => {
    localStorage.setItem('ch_token', token);
    localStorage.setItem('ch_user', JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem('ch_token');
    localStorage.removeItem('ch_user');
  },
  isLoggedIn: () => !!localStorage.getItem('ch_token'),
};

/* ─── CORE FETCH WRAPPER ─── */
async function apiFetch(endpoint, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && Auth.getToken()) headers['Authorization'] = `Bearer ${Auth.getToken()}`;
  const res  = await fetch(`${BASE_URL}${endpoint}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) {
    const msg = data.errors ? data.errors.map(e => e.message).join('\n') : (data.message || 'Something went wrong');
    throw new Error(msg);
  }
  return data;
}

/* ═══════════════════════════════════════════════════════════
   PROFESSIONAL TOAST NOTIFICATION SYSTEM
   Replaces ALL browser alert() with beautiful toasts
═══════════════════════════════════════════════════════════ */
(function() {
  if (document.getElementById('ch-toast-css')) return;
  const s = document.createElement('style');
  s.id = 'ch-toast-css';
  s.textContent = `
    #ch-toasts{position:fixed;top:82px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none}
    .cht{display:flex;align-items:flex-start;gap:12px;padding:14px 18px;border-radius:14px;min-width:300px;max-width:380px;pointer-events:auto;
      box-shadow:0 8px 32px rgba(0,0,0,0.13);font-family:'DM Sans',sans-serif;font-size:.87rem;line-height:1.5;
      cursor:pointer;position:relative;overflow:hidden;border:1px solid transparent;
      animation:chtIn .36s cubic-bezier(.34,1.56,.64,1) forwards}
    .cht.out{animation:chtOut .28s ease forwards}
    @keyframes chtIn{from{opacity:0;transform:translateX(55px) scale(.92)}to{opacity:1;transform:none}}
    @keyframes chtOut{from{opacity:1;transform:none;max-height:120px}to{opacity:0;transform:translateX(55px) scale(.9);max-height:0;padding:0;margin:0}}
    .cht-ico{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:.8rem;flex-shrink:0;margin-top:1px}
    .cht-body{flex:1}.cht-title{font-weight:700;font-size:.87rem;margin-bottom:1px}.cht-msg{font-size:.8rem;opacity:.85}
    .cht-bar{position:absolute;bottom:0;left:0;height:3px;border-radius:0 0 14px 14px;animation:chtBar linear forwards}
    @keyframes chtBar{from{width:100%}to{width:0}}
    .cht.success{background:#f0fdf4;border-color:rgba(16,185,129,.22);color:#065f46}
    .cht.success .cht-ico{background:#d1fae5;color:#10b981}.cht.success .cht-bar{background:#10b981}
    .cht.error{background:#fff1f2;border-color:rgba(239,68,68,.22);color:#7f1d1d}
    .cht.error .cht-ico{background:#fee2e2;color:#ef4444}.cht.error .cht-bar{background:#ef4444}
    .cht.info{background:#eff6ff;border-color:rgba(59,130,246,.22);color:#1e3a5f}
    .cht.info .cht-ico{background:#dbeafe;color:#3b82f6}.cht.info .cht-bar{background:#3b82f6}
    .cht.warning{background:#fffbeb;border-color:rgba(245,158,11,.22);color:#78350f}
    .cht.warning .cht-ico{background:#fef3c7;color:#f59e0b}.cht.warning .cht-bar{background:#f59e0b}
    .ch-fbanner{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:12px;margin-bottom:18px;
      font-size:.85rem;font-weight:500;line-height:1.5;animation:chtIn .3s ease forwards}
    .ch-fbanner.error{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);color:#b91c1c}
    .ch-fbanner.success{background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.2);color:#065f46}
    @media(max-width:500px){#ch-toasts{right:12px;left:12px}.cht{min-width:unset;max-width:100%}}
  `;
  document.head.appendChild(s);
})();

const _TICONS = { success:'<i class="fas fa-check"></i>', error:'<i class="fas fa-times"></i>', info:'<i class="fas fa-info"></i>', warning:'<i class="fas fa-exclamation"></i>' };
const _TTITLES = { success:'Success', error:'Error', info:'Info', warning:'Warning' };

function showToast(message, type = 'info', ms = 4000) {
  let box = document.getElementById('ch-toasts');
  if (!box) { box = document.createElement('div'); box.id = 'ch-toasts'; document.body.appendChild(box); }
  const t = document.createElement('div');
  t.className = `cht ${type}`;
  t.innerHTML = `<div class="cht-ico">${_TICONS[type]||_TICONS.info}</div><div class="cht-body"><div class="cht-title">${_TTITLES[type]||'Notice'}</div><div class="cht-msg">${message}</div></div><div class="cht-bar" style="animation-duration:${ms}ms"></div>`;
  t.onclick = () => { if (!t._done) { t._done=true; clearTimeout(t._t); t.classList.add('out'); setTimeout(()=>t.remove(),300); }};
  box.appendChild(t);
  t._t = setTimeout(() => t.onclick(), ms);
}

function showBanner(message, type = 'error') {
  document.getElementById('ch-fbanner')?.remove();
  const b = document.createElement('div');
  b.id = 'ch-fbanner';
  b.className = `ch-fbanner ${type}`;
  b.innerHTML = `<i class="fas ${type==='success'?'fa-check-circle':'fa-exclamation-circle'}" style="font-size:1rem;flex-shrink:0"></i><span>${message}</span>`;
  const card = document.querySelector('.auth-card');
  if (card) card.prepend(b);
  if (type === 'success') setTimeout(() => b.remove(), 6000);
}

/* ─── FIELD HELPERS ─── */
function showFieldError(id, msg) {
  const g = document.getElementById(id); if (!g) return;
  g.classList.add('error');
  const m = g.querySelector('.error-msg'); if (m && msg) m.textContent = msg;
}
function clearError(id) { document.getElementById(id)?.classList.remove('error'); }
function setLoading(btn, on, html) { btn.disabled = on; btn.innerHTML = on ? '<i class="fas fa-spinner fa-spin"></i> Please wait...' : html; }

/* ─── NAVBAR ─── */
function initNavbar() {
  const el = document.querySelector('.nav-actions'); if (!el) return;
  if (Auth.isLoggedIn()) {
    const u = Auth.getUser();
    el.innerHTML = `<span style="font-size:.88rem;color:var(--ink-light);font-weight:500">Hi, <strong>${u?.name?.split(' ')[0]||'User'}</strong> 👋</span><button class="btn btn-ghost" onclick="logout()" style="padding:8px 18px"><i class="fas fa-sign-out-alt"></i> Logout</button>`;
  }
  const mob = document.querySelector('.mobile-menu .nav-actions');
  if (mob && Auth.isLoggedIn()) mob.innerHTML = `<button class="btn btn-ghost btn-full" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>`;
}
function logout() { Auth.clear(); showToast('You have been logged out.', 'info', 2500); setTimeout(() => { window.location.href = 'index.html'; }, 800); }

/* ─── SCROLL / MENU ─── */
window.addEventListener('scroll', () => { document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 10); });
function toggleMenu() {
  const m = document.getElementById('mobileMenu'), i = document.getElementById('burger-icon'); if (!m||!i) return;
  m.classList.toggle('open'); i.className = m.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
}
function scrollToSection(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }

/* ─── SIGNUP (real MongoDB) ─── */
function selectRole(r) {
  document.getElementById('role-creator')?.classList.toggle('selected', r==='creator');
  document.getElementById('role-client')?.classList.toggle('selected', r==='client');
}
function togglePass(id, icon) {
  const inp = document.getElementById(id); if (!inp) return;
  const p = inp.type==='password'; inp.type = p?'text':'password';
  icon.className = p ? 'fas fa-eye-slash input-wrap-right' : 'fas fa-eye input-wrap-right';
}

async function handleSignup() {
  const ng=document.getElementById('sg-name'), eg=document.getElementById('sg-email'), pg=document.getElementById('sg-pass');
  if (!ng||!eg||!pg) return;
  const name=ng.querySelector('input').value.trim(), email=eg.querySelector('input').value.trim(), pass=pg.querySelector('input').value;
  const role = document.querySelector('.role-option.selected input')?.value || 'client';
  let ok = true;
  if (!name)                                               { showFieldError('sg-name','Name is required'); ok=false; }
  if (!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFieldError('sg-email','Please enter a valid email'); ok=false; }
  if (pass.length < 8)                                    { showFieldError('sg-pass','Password must be at least 8 characters'); ok=false; }
  if (!ok) return;

  const btn = document.querySelector('button[onclick="handleSignup()"]'), def = btn?.innerHTML;
  if (btn) setLoading(btn, true, def);
  try {
    const data = await apiFetch('/auth/signup', { method:'POST', body:{ name, email, password:pass, role } });
    Auth.setSession(data.token, data.user);
    const first = name.split(' ')[0];
    showBanner(`Welcome to CreatorHub, ${first}! 🎉 Redirecting…`, 'success');
    showToast(`Account created! Welcome, ${first} 🚀`, 'success', 3500);
    setTimeout(() => { window.location.href = 'index.html'; }, 1600);
  } catch (err) {
    showBanner(err.message, 'error');
    showToast(err.message, 'error', 5000);
    if (btn) setLoading(btn, false, def);
  }
}

/* ─── LOGIN (real MongoDB) ─── */
async function handleLogin() {
  const eg=document.getElementById('lg-email'), pg=document.getElementById('lg-pass');
  if (!eg||!pg) return;
  const email=eg.querySelector('input').value.trim(), pass=pg.querySelector('input').value;
  let ok = true;
  if (!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFieldError('lg-email','Please enter a valid email'); ok=false; }
  if (!pass)                                               { showFieldError('lg-pass','Password is required'); ok=false; }
  if (!ok) return;

  const btn = document.querySelector('button[onclick="handleLogin()"]'), def = btn?.innerHTML;
  if (btn) setLoading(btn, true, def);
  try {
    const data = await apiFetch('/auth/login', { method:'POST', body:{ email, password:pass } });
    Auth.setSession(data.token, data.user);
    const first = data.user?.name?.split(' ')[0] || 'back';
    showBanner(`Welcome back, ${first}! 👋 Redirecting…`, 'success');
    showToast(`Logged in successfully! Welcome back, ${first} 👋`, 'success', 3500);
    setTimeout(() => { window.location.href = 'index.html'; }, 1600);
  } catch (err) {
    showBanner(err.message, 'error');
    showToast(err.message, 'error', 5000);
    if (btn) setLoading(btn, false, def);
  }
}

/* ─── CREATORS SECTION ─── */
const CARD_GRADIENTS = ['','warm','teal','rose','green','violet'];
const CARD_EMOJIS    = ['🎨','🎬','💻','✍️','📱','🎵','📸','📊'];

function renderStars(avg=0, count=0) {
  const f=Math.floor(avg), h=avg%1>=.5?1:0, e=5-f-h;
  return '<i class="fas fa-star"></i>'.repeat(f)+(h?'<i class="fas fa-star-half-alt"></i>':'')+
    '<i class="far fa-star"></i>'.repeat(e)+`<span>${avg.toFixed(1)} (${count} reviews)</span>`;
}
function buildCreatorCard(c, i) {
  const g=CARD_GRADIENTS[i%CARD_GRADIENTS.length], e=CARD_EMOJIS[i%CARD_EMOJIS.length];
  const skill=c.skills?.[0]||'Creative Professional', r=c.rating||{average:4.8,count:12};
  return `<div class="creator-card" onclick="window.location.href='profile.html?id=${c._id||i}'">
    <div class="creator-card-top ${g}"><div class="creator-avatar">${e}</div><span class="creator-badge">Creator</span></div>
    <div class="creator-body">
      <div class="creator-name">${c.name}</div><div class="creator-skill">${skill}</div>
      <div class="stars">${renderStars(r.average,r.count)}</div>
      <div class="creator-footer"><div class="creator-price">₹500 <small>/ project</small></div><button class="btn-sm">View Profile</button></div>
    </div></div>`;
}
function buildSkeletonCards(n=6) {
  return Array.from({length:n},()=>`<div class="creator-card" style="pointer-events:none">
    <div class="creator-card-top" style="background:var(--surface-3)"></div>
    <div class="creator-body">
      <div style="height:14px;background:var(--surface-3);border-radius:6px;margin-bottom:8px;width:60%"></div>
      <div style="height:11px;background:var(--surface-3);border-radius:6px;margin-bottom:16px;width:40%"></div>
      <div style="height:11px;background:var(--surface-3);border-radius:6px;width:80%"></div>
    </div></div>`).join('');
}

async function loadFeaturedCreators() {
  const grid = document.querySelector('.creator-grid'); if (!grid) return;
  grid.innerHTML = buildSkeletonCards(6);
  try {
    const data = await apiFetch('/users/creators');
    const creators = data.data || [];
    if (creators.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--ink-muted)"><i class="fas fa-users" style="font-size:2rem;margin-bottom:12px;display:block"></i>No creators yet. <a href="signup.html" style="color:var(--accent)">Be the first!</a></div>`;
      return;
    }
    grid.innerHTML = creators.slice(0,6).map(buildCreatorCard).join('');
  } catch {
    grid.innerHTML = getStaticCreatorCards();
  }
}

function getStaticCreatorCards() {
  const list = [
    {name:'Utsav Talreja',   skill:'Front-end Developer', grad:'',      e:'🎨', badge:'Top Rated', price:'₹1,200', r:'5.0', rv:'10', id:1},
    {name:'Umesh Farkade',   skill:'Full Stack Developer', grad:'warm',  e:'💻', badge:'Pro',        price:'₹2,000', r:'4.8', rv:'20', id:2},
    {name:'Ashutosh Malik',  skill:'Video Editor',         grad:'teal',  e:'🎬', badge:'Rising Star',price:'₹800',   r:'4.9', rv:'15', id:3},
    {name:'Vibhanshu Singh', skill:'ML Developer',         grad:'rose',  e:'🤖', badge:'Top Rated', price:'₹5,000', r:'4.9', rv:'15', id:4},
    {name:'Sunidhi Patle',   skill:'Marketing Lead',       grad:'green', e:'📱', badge:'Pro',        price:'₹1,300', r:'4.9', rv:'15', id:5},
  ];
  return list.map(c=>`<div class="creator-card">
    <div class="creator-card-top ${c.grad}"><div class="creator-avatar">${c.e}</div><span class="creator-badge">${c.badge}</span></div>
    <div class="creator-body">
      <div class="creator-name">${c.name}</div><div class="creator-skill">${c.skill}</div>
      <div class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><span>${c.r} (${c.rv} reviews)</span></div>
      <div class="creator-footer"><div class="creator-price">${c.price} <small>/ project</small></div><a class="btn btn-primary" href="profile.html?id=${c.id}">View Profile</a></div>
    </div></div>`).join('');
}

/* ─── SEARCH ─── */
async function handleSearch(q) {
  if (!q||q.trim().length<2) return;
  const grid=document.querySelector('.creator-grid'); if (!grid) return;
  grid.closest('section')?.scrollIntoView({behavior:'smooth'});
  grid.innerHTML=buildSkeletonCards(6);
  try {
    const data=await apiFetch(`/services?search=${encodeURIComponent(q)}&limit=6`);
    const s=data.data||[];
    if (!s.length) { grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--ink-muted)"><i class="fas fa-search" style="font-size:2rem;margin-bottom:12px;display:block"></i>No results for "<strong>${q}</strong>"</div>`; return; }
    grid.innerHTML=s.map((s,i)=>`<div class="creator-card"><div class="creator-card-top ${CARD_GRADIENTS[i%CARD_GRADIENTS.length]}"><div class="creator-avatar">${CARD_EMOJIS[i%CARD_EMOJIS.length]}</div><span class="creator-badge">${s.category}</span></div><div class="creator-body"><div class="creator-name">${s.title}</div><div class="creator-skill">${s.creator?.name||'Creator'}</div><div class="stars">${renderStars(s.rating?.average||0,s.rating?.count||0)}</div><div class="creator-footer"><div class="creator-price">₹${s.price} <small>/ project</small></div><button class="btn-sm">View</button></div></div></div>`).join('');
  } catch { await loadFeaturedCreators(); }
}

/* ─── CATEGORY FILTER ─── */
async function filterByCategory(cat) {
  const grid=document.querySelector('.creator-grid'); if (!grid) return;
  document.querySelector('.creator-grid')?.closest('section')?.scrollIntoView({behavior:'smooth'});
  grid.innerHTML=buildSkeletonCards(6);
  try {
    const data=await apiFetch(`/services?category=${encodeURIComponent(cat)}&limit=6`);
    const s=data.data||[];
    if (!s.length) { grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--ink-muted)"><i class="fas fa-search" style="font-size:2rem;margin-bottom:12px;display:block"></i>No services in <strong>${cat}</strong> yet.</div>`; return; }
    grid.innerHTML=s.map((s,i)=>`<div class="creator-card"><div class="creator-card-top ${CARD_GRADIENTS[i%CARD_GRADIENTS.length]}"><div class="creator-avatar">${CARD_EMOJIS[i%CARD_EMOJIS.length]}</div><span class="creator-badge">${s.category}</span></div><div class="creator-body"><div class="creator-name">${s.title}</div><div class="creator-skill">${s.creator?.name||'Creator'}</div><div class="stars">${renderStars(s.rating?.average||0,s.rating?.count||0)}</div><div class="creator-footer"><div class="creator-price">₹${s.price} <small>/ project</small></div><button class="btn-sm">View</button></div></div></div>`).join('');
  } catch { grid.innerHTML=getStaticCreatorCards(); }
}

/* ─── PAGE INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  const page = document.body.dataset.page;
  if (page === 'home') {
    loadFeaturedCreators();
    document.querySelectorAll('.cat-card').forEach(card => {
      const cn = card.querySelector('.cat-name')?.textContent?.trim();
      if (cn) { card.style.cursor='pointer'; card.addEventListener('click', () => filterByCategory(cn)); }
    });
    const si = document.querySelector('.search-bar input'), sb = document.querySelector('.search-bar .btn');
    if (si) si.addEventListener('keydown', e => { if (e.key==='Enter') handleSearch(si.value); });
    if (sb) sb.onclick = () => handleSearch(si?.value);
    document.querySelectorAll('.tag-pill').forEach(p => {
      p.addEventListener('click', () => { if (si) si.value=p.textContent; handleSearch(p.textContent); });
    });
  }
  if (page === 'login'  && Auth.isLoggedIn()) window.location.href = 'index.html';
  if (page === 'signup' && Auth.isLoggedIn()) window.location.href = 'index.html';
});
