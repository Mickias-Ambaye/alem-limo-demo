// Data layer for the Alem site. Two interchangeable backends with the same methods:
//   LocalStore  — demo mode, everything lives in this browser's localStorage.
//   SupaStore   — live mode, everything lives in the client's Supabase database
//                 (schema in supabase/schema.sql). Chosen automatically when config.js is filled in.
(function () {
  var LOCAL_KEY = 'alem_site_v6';
  var uid = function () { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10); };
  var HOURS12 = 12 * 36e5;

  function LocalStore() { this.mode = 'demo'; }
  LocalStore.prototype._read = function () {
    var base = { config: {}, bookings: [], reviews: [], team: null, sessions: {} };
    try { return Object.assign(base, JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')); } catch (e) { return base; }
  };
  LocalStore.prototype._write = function (d) { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(d)); } catch (e) {} };
  LocalStore.prototype._team = function (d) {
    if (!d.team || !d.team.length) d.team = [{ name: 'Owner', username: 'admin', pass: 'alem2259', owner: true }];
    return d.team;
  };
  LocalStore.prototype._auth = function (d, token) {
    var s = d.sessions[token];
    if (!s || s.exp < Date.now()) throw new Error('not signed in');
    s.exp = Date.now() + HOURS12;
    var me = this._team(d).filter(function (m) { return m.username === s.username; })[0];
    if (!me) throw new Error('not signed in');
    return me;
  };
  LocalStore.prototype.loadPublic = async function () {
    var d = this._read();
    return { config: d.config, reviews: d.reviews.filter(function (r) { return r.approved; }) };
  };
  LocalStore.prototype.availability = async function (date) {
    return this._read().bookings.filter(function (b) { return b.date === date && !b.archived && b.status !== 'completed'; })
      .map(function (b) { return { time: b.time, status: b.status }; });
  };
  LocalStore.prototype.requestRide = async function (row) {
    var d = this._read(); d.bookings.push(Object.assign({}, row, { id: uid(), archived: false, offsite: false, final: null })); this._write(d);
  };
  LocalStore.prototype.submitReview = async function (r) {
    var d = this._read(); d.reviews.push(Object.assign({}, r, { id: uid(), approved: false })); this._write(d);
  };
  LocalStore.prototype.login = async function (user, pass) {
    var d = this._read(), u = String(user || '').trim().toLowerCase();
    var m = this._team(d).filter(function (x) { return x.username.toLowerCase() === u && !!pass && x.pass === pass; })[0];
    if (!m) return null;
    var token = uid();
    d.sessions[token] = { username: m.username, exp: Date.now() + HOURS12 };
    this._write(d);
    return { token: token, name: m.name, username: m.username, owner: !!m.owner };
  };
  LocalStore.prototype.check = async function (token) {
    try { var d = this._read(); var m = this._auth(d, token); this._write(d); return { name: m.name, username: m.username, owner: !!m.owner }; } catch (e) { return null; }
  };
  LocalStore.prototype.logout = async function (token) { var d = this._read(); delete d.sessions[token]; this._write(d); };
  LocalStore.prototype.consoleData = async function (token) {
    var d = this._read(); this._auth(d, token);
    return { bookings: d.bookings, reviews: d.reviews, team: this._team(d).map(function (m) { return { name: m.name, username: m.username, owner: !!m.owner }; }) };
  };
  LocalStore.prototype.bookingUpdate = async function (token, id, patch) {
    var d = this._read(); this._auth(d, token);
    d.bookings = d.bookings.map(function (b) { return b.id === id ? Object.assign({}, b, patch) : b; }); this._write(d);
  };
  LocalStore.prototype.bookingDelete = async function (token, id) {
    var d = this._read(); this._auth(d, token); d.bookings = d.bookings.filter(function (b) { return b.id !== id; }); this._write(d);
  };
  LocalStore.prototype.bookingAdd = async function (token, b) {
    var d = this._read(); this._auth(d, token); d.bookings.push(Object.assign({}, b, { id: uid(), archived: false, offsite: true })); this._write(d);
  };
  LocalStore.prototype.reviewSet = async function (token, id, approved) {
    var d = this._read(); this._auth(d, token);
    d.reviews = d.reviews.map(function (r) { return r.id === id ? Object.assign({}, r, { approved: approved }) : r; }); this._write(d);
  };
  LocalStore.prototype.reviewDelete = async function (token, id) {
    var d = this._read(); this._auth(d, token); d.reviews = d.reviews.filter(function (r) { return r.id !== id; }); this._write(d);
  };
  LocalStore.prototype.configUpdate = async function (token, patch) {
    var d = this._read(); this._auth(d, token); d.config = Object.assign({}, d.config, patch); this._write(d);
  };
  LocalStore.prototype.teamAdd = async function (token, name, username, pass) {
    var d = this._read(); this._auth(d, token);
    var u = String(username || '').trim();
    if (!u || /\s/.test(u)) throw new Error('Pick a username without spaces.');
    if (String(pass || '').length < 6) throw new Error('Password needs at least 6 characters.');
    if (this._team(d).some(function (m) { return m.username.toLowerCase() === u.toLowerCase(); })) throw new Error('That username is taken.');
    d.team.push({ name: String(name || '').trim() || 'Team member', username: u, pass: pass, owner: false }); this._write(d);
  };
  LocalStore.prototype.teamRemove = async function (token, username) {
    var d = this._read(); this._auth(d, token); var t = this._team(d);
    var m = t.filter(function (x) { return x.username === username; })[0];
    if (m && m.owner) throw new Error('The owner account cannot be removed.');
    d.team = t.filter(function (x) { return x.username !== username; }); this._write(d);
  };
  LocalStore.prototype.teamSetPassword = async function (token, pass) {
    var d = this._read(); var me = this._auth(d, token);
    if (String(pass || '').length < 6) throw new Error('Password needs at least 6 characters.');
    me.pass = pass; this._write(d);
  };

  function SupaStore(url, key) {
    this.mode = 'live';
    this.db = window.supabase.createClient(url, key, { auth: { persistSession: false } });
  }
  SupaStore.prototype.rpc = async function (fn, args) {
    var r = await this.db.rpc(fn, args);
    if (r.error) throw new Error(r.error.message || 'Database error');
    return r.data;
  };
  SupaStore.prototype.loadPublic = async function () {
    var c = await this.db.from('site_config').select('rates,flats,service_area,settings,blocked,vehicles_off').eq('id', 1).maybeSingle();
    if (c.error) throw new Error(c.error.message);
    var revs = await this.db.from('reviews').select('id,stars,text,name,tag,approved').eq('approved', true).order('created_at');
    var row = c.data;
    var config = row ? { rates: row.rates, flats: row.flats, serviceArea: row.service_area, settings: row.settings, blocked: row.blocked, vehiclesOff: row.vehicles_off } : {};
    return { config: config, reviews: revs.data || [] };
  };
  SupaStore.prototype.availability = async function (date) { return (await this.rpc('availability', { p_date: date })) || []; };
  SupaStore.prototype.requestRide = async function (row) {
    var r = { conf: row.conf, status: 'new', date: row.date, time: row.time, name: row.name, phone: row.phone, email: row.email,
      trip_type: row.tripType, vehicle: row.vehicle, pickup: row.pickup, dropoff: row.dropoff, flight: row.flight, notes: row.notes,
      extras: row.extras || [], miles: row.miles, est: row.est };
    var res = await this.db.from('bookings').insert(r);
    if (res.error) throw new Error(res.error.message);
  };
  SupaStore.prototype.submitReview = async function (r) {
    var res = await this.db.from('reviews').insert({ stars: r.stars, text: r.text, name: r.name, tag: r.tag });
    if (res.error) throw new Error(res.error.message);
  };
  SupaStore.prototype.login = async function (user, pass) { return await this.rpc('team_login', { p_user: user, p_pass: pass }); };
  SupaStore.prototype.check = async function (token) { try { return await this.rpc('team_check', { p_token: token }); } catch (e) { return null; } };
  SupaStore.prototype.logout = async function (token) { try { await this.rpc('team_logout', { p_token: token }); } catch (e) {} };
  SupaStore.prototype.consoleData = async function (token) { return await this.rpc('console_data', { p_token: token }); };
  SupaStore.prototype.bookingUpdate = async function (token, id, patch) { await this.rpc('booking_update', { p_token: token, p_id: id, p_patch: patch }); };
  SupaStore.prototype.bookingDelete = async function (token, id) { await this.rpc('booking_delete', { p_token: token, p_id: id }); };
  SupaStore.prototype.bookingAdd = async function (token, b) { await this.rpc('booking_add', { p_token: token, p_b: b }); };
  SupaStore.prototype.reviewSet = async function (token, id, approved) { await this.rpc('review_set', { p_token: token, p_id: id, p_approved: approved }); };
  SupaStore.prototype.reviewDelete = async function (token, id) { await this.rpc('review_delete', { p_token: token, p_id: id }); };
  SupaStore.prototype.configUpdate = async function (token, patch) { await this.rpc('config_update', { p_token: token, p_patch: patch }); };
  SupaStore.prototype.teamAdd = async function (token, name, username, pass) { await this.rpc('team_add', { p_token: token, p_name: name, p_user: username, p_pass: pass }); };
  SupaStore.prototype.teamRemove = async function (token, username) { await this.rpc('team_remove', { p_token: token, p_user: username }); };
  SupaStore.prototype.teamSetPassword = async function (token, pass) { await this.rpc('team_set_password', { p_token: token, p_pass: pass }); };

  window.AlemStore = {
    make: function () {
      var c = window.ALEM_CONFIG || {};
      if (c.supabaseUrl && c.supabaseKey && window.supabase && window.supabase.createClient) {
        try { return new SupaStore(c.supabaseUrl, c.supabaseKey); } catch (e) { console.warn('Supabase client failed, using demo mode', e); }
      }
      return new LocalStore();
    }
  };
})();
