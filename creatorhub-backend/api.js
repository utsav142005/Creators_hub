/* ═══════════════════════════════════════════════════════════════
   CreatorHub — Frontend API Helper
   api.js  (place this in your frontend folder)

   Drop this file next to your index.html and import it in
   your script.js:  <script src="api.js"></script>
═══════════════════════════════════════════════════════════════ */

const API_URL = 'http://localhost:5000/api';   // ← change if hosted elsewhere

// ─── TOKEN HELPERS ───────────────────────────────────────────────────────────

const getToken  = ()          => localStorage.getItem('ch_token');
const setToken  = (t)         => localStorage.setItem('ch_token', t);
const clearToken = ()         => localStorage.removeItem('ch_token');
const getUser   = ()          => JSON.parse(localStorage.getItem('ch_user') || 'null');
const setUser   = (u)         => localStorage.setItem('ch_user', JSON.stringify(u));

// ─── BASE FETCH WRAPPER ───────────────────────────────────────────────────────

/**
 * Makes an authenticated API request.
 * @param {string} endpoint  - e.g. '/auth/login'
 * @param {string} method    - GET | POST | PUT | PATCH | DELETE
 * @param {object} [body]    - request body (will be JSON-stringified)
 * @returns {Promise<object>} parsed JSON response
 */
async function apiFetch(endpoint, method = 'GET', body = null) {
  const headers = { 'Content-Type': 'application/json' };

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data     = await response.json();

  if (!response.ok) {
    // Throw a descriptive error so callers can catch it
    const err = new Error(data.message || 'Something went wrong');
    err.errors = data.errors;   // validation errors array
    throw err;
  }

  return data;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

const Auth = {

  /**
   * Register a new user.
   * @example
   *   await Auth.signup({ name: 'Priya', email: 'p@x.com', password: 'pass1234', role: 'creator' });
   */
  async signup({ name, email, password, role = 'client' }) {
    const data = await apiFetch('/auth/signup', 'POST', { name, email, password, role });
    setToken(data.token);
    setUser(data.user);
    return data;
  },

  /**
   * Login an existing user.
   * @example
   *   await Auth.login({ email: 'p@x.com', password: 'pass1234' });
   */
  async login({ email, password }) {
    const data = await apiFetch('/auth/login', 'POST', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  },

  logout() {
    clearToken();
    localStorage.removeItem('ch_user');
    window.location.href = 'login.html';
  },

  async getMe() {
    return apiFetch('/auth/me');
  },

  isLoggedIn() {
    return !!getToken();
  },
};

// ─── SERVICES ─────────────────────────────────────────────────────────────────

const Services = {

  /** Fetch all services. Optional filters: { category_id, search } */
  async getAll({ limit = 20, offset = 0, category_id, search } = {}) {
    let url = `/services?limit=${limit}&offset=${offset}`;
    if (category_id) url += `&category_id=${category_id}`;
    if (search)      url += `&search=${encodeURIComponent(search)}`;
    return apiFetch(url);
  },

  async getById(id) {
    return apiFetch(`/services/${id}`);
  },

  /** Creators only */
  async create(serviceData) {
    return apiFetch('/services', 'POST', serviceData);
  },

  async update(id, serviceData) {
    return apiFetch(`/services/${id}`, 'PUT', serviceData);
  },

  async delete(id) {
    return apiFetch(`/services/${id}`, 'DELETE');
  },
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────

const Orders = {

  /** role: 'client' | 'creator' */
  async getMine(role = 'client') {
    return apiFetch(`/orders?role=${role}`);
  },

  async getById(id) {
    return apiFetch(`/orders/${id}`);
  },

  async create(service_id, notes = '') {
    return apiFetch('/orders', 'POST', { service_id, notes });
  },

  async updateStatus(id, status) {
    return apiFetch(`/orders/${id}/status`, 'PATCH', { status });
  },

  async leaveReview(orderId, { rating, comment }) {
    return apiFetch(`/orders/${orderId}/review`, 'POST', { rating, comment });
  },
};

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

const Categories = {
  async getAll() {
    return apiFetch('/categories');
  },
};

// ─── USERS ───────────────────────────────────────────────────────────────────

const Users = {
  async getAll(){
    return apiFetch('/users')
  },
  async getById(id) {
    return apiFetch(`/users/${id}`);
  },
  async updateProfile(data) {
    return apiFetch('/users/me', 'PUT', data);
  },
};

// ─── SIGNUP FORM VALIDATION ───
async function handleSignup() {
  let valid = true;
  const nameGroup  = document.getElementById('sg-name');
  const emailGroup = document.getElementById('sg-email');
  const passGroup  = document.getElementById('sg-pass');

  const name  = nameGroup.querySelector('input').value.trim();
  const email = emailGroup.querySelector('input').value.trim();
  const pass  = passGroup.querySelector('input').value;
  const role  = document.querySelector('input[name="role"]:checked')?.value || 'client';

  // Frontend validation (same as before)
  if (!name)  { nameGroup.classList.add('error');  valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailGroup.classList.add('error'); valid = false;
  }
  if (pass.length < 8) { passGroup.classList.add('error'); valid = false; }
  if (!valid) return;

  // ← NEW: actually sends data to your backend
  try {
    await Auth.signup({ name, email, password: pass, role });
    alert('Account created successfully! Welcome to CreatorHub 🎉');
    window.location.href = 'index.html';
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// ─── LOGIN FORM VALIDATION ───
async function handleLogin() {
  let valid = true;
  const emailGroup = document.getElementById('lg-email');
  const passGroup  = document.getElementById('lg-pass');

  const email = emailGroup.querySelector('input').value.trim();
  const pass  = passGroup.querySelector('input').value;

  // Frontend validation (same as before)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailGroup.classList.add('error'); valid = false;
  }
  if (!pass) { passGroup.classList.add('error'); valid = false; }
  if (!valid) return;

  // ← NEW: actually sends data to your backend
  try {
    await Auth.login({ email, password: pass });
    alert('Logged in successfully! Welcome back 👋');
    window.location.href = 'index.html';
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

   