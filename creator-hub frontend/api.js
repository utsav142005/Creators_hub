/* ═══════════════════════════════════════════════════════════════
   CreatorHub — Frontend API Helper
   api.js  (place this in your frontend folder)

   Drop this file next to your index.html and import it in
   your script.js:  <script src="api.js"></script>
═══════════════════════════════════════════════════════════════ */

const API_URL = 'https://creators-hub-xbxl.onrender.com';   // ← change if hosted elsewhere

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
  async getById(id) {
    return apiFetch(`/users/${id}`);
  },
  async updateProfile(data) {
    return apiFetch('/users/me', 'PUT', data);
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   HOW TO USE IN YOUR HTML FILES
   ─────────────────────────────────────────────────────────────────────────────

   1. Add <script src="api.js"></script> BEFORE your script.js

   ── SIGNUP ──────────────────────────────────────────────────────────────────

   async function handleSignup() {
     try {
       await Auth.signup({
         name:     document.querySelector('#sg-name input').value,
         email:    document.querySelector('#sg-email input').value,
         password: document.querySelector('#sg-pass input').value,
         role:     document.querySelector('input[name="role"]:checked').value,
       });
       window.location.href = 'index.html';
     } catch (err) {
       alert(err.message);
     }
   }

   ── LOGIN ────────────────────────────────────────────────────────────────────

   async function handleLogin() {
     try {
       await Auth.login({
         email:    document.querySelector('#lg-email input').value,
         password: document.querySelector('#lg-pass input').value,
       });
       window.location.href = 'index.html';
     } catch (err) {
       alert(err.message);
     }
   }

   ── LOAD SERVICES ────────────────────────────────────────────────────────────

   const { services } = await Services.getAll({ limit: 10 });
   services.forEach(s => {
     console.log(s.title, s.price);
   });

   ── PLACE AN ORDER ──────────────────────────────────────────────────────────

   const { order } = await Orders.create(serviceId, 'Please make it bold!');

   ─────────────────────────────────────────────────────────────────────────── */
