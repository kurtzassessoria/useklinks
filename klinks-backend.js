/* ─────────────────────────────────────────────────────────────────────────
   KLINKS · Backend único do SaaS
   window.KlinksBackend — mesma API em dois motores:
     · supabase : produção (useklinks.com) — banco, login, fotos e dados reais
     · local    : demonstração/preview — tudo no navegador (localStorage)
   O motor é escolhido no init(): em useklinks.com é SEMPRE supabase; fora dele,
   testa a conexão (3,5s) e cai para local se o banco não responder.
   ───────────────────────────────────────────────────────────────────────── */
(() => {
  const PROD_HOSTS = /(^|\.)useklinks\.com$/i;
  const RESERVED = ['studio','cadastro','entrar','pagina','api','admin','app','login','assets','www','blog','ajuda','planos','precos','termos','privacidade','kurtz','klinks','plaquinha','relatorio'];
  const SLUG_RE = /^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$/;
  const timeout = (p, ms, msg) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(msg || 'O servidor demorou para responder.')), ms))]);
  const slugify = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, 'e').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  const validSlug = (s) => SLUG_RE.test(s) && !RESERVED.includes(s);

  function traduz(msg) {
    const m = String(msg || '').toLowerCase();
    if (m.includes('not_admin')) return 'Sua conta não tem permissão de administrador.';
    if (m.includes('should be different')) return 'A nova senha precisa ser diferente da atual.';
    if (m.includes('reauthentication') || m.includes('session missing') || m.includes('jwt')) return 'Sua sessão expirou. Entre de novo e tente outra vez.';
    if (m.includes('invalid login')) return 'E-mail ou senha incorretos.';
    if (m.includes('already registered') || m.includes('already been registered')) return 'Esse e-mail já tem conta. Use “Entrar”.';
    if (m.includes('slug_taken')) return 'Esse endereço acabou de ser usado. Escolha outro.';
    if (m.includes('already_has_restaurant')) return 'Sua conta já tem uma página.';
    if (m.includes('email not confirmed')) return 'Confirme seu e-mail pelo link que enviamos e depois entre.';
    if (m.includes('rate limit')) return 'Muitas tentativas. Aguarde um minuto.';
    if (m.includes('password')) return 'Senha inválida (mínimo 6 caracteres).';
    if (m.includes('row-level security')) return 'Sem permissão para essa ação. Saia e entre de novo.';
    return msg || 'Algo deu errado. Tente de novo.';
  }

  // ── Motor Supabase ──────────────────────────────────────────────────────
  function supabaseEngine() {
    const c = window.supabase.createClient(window.KLINKS_SUPABASE_URL, window.KLINKS_SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
    const bucket = window.KLINKS_SUPABASE_BUCKET || 'restaurants';
    const T = 10000;
    const run = async (q) => { const { data, error } = await timeout(q, T); if (error) throw new Error(traduz(error.message)); return data; };
    return {
      mode: 'supabase', client: c,
      async ping() { await run(c.from('public_pages').select('slug', { head: true, count: 'exact' }).limit(1)); },
      async getUser() { const { data } = await c.auth.getSession(); return data?.session?.user || null; },
      async signUp(email, pw) {
        const { data, error } = await timeout(c.auth.signUp({ email, password: pw, options: { emailRedirectTo: location.origin + '/entrar' } }), T);
        if (error) throw new Error(traduz(error.message));
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) throw new Error(traduz('already registered'));
        return { user: data.user, needsConfirm: !data.session };
      },
      async signIn(email, pw) { const { data, error } = await timeout(c.auth.signInWithPassword({ email, password: pw }), T); if (error) throw new Error(traduz(error.message)); return data.user; },
      async signOut() { await c.auth.signOut(); },
      async updatePassword(pw) { const { error } = await timeout(c.auth.updateUser({ password: pw }), T); if (error) throw new Error(traduz(error.message)); },
      async updateEmail(email) { const { error } = await timeout(c.auth.updateUser({ email }, { emailRedirectTo: location.origin + '/entrar' }), T); if (error) throw new Error(traduz(error.message)); return { needsConfirm: true }; },
      async signOutAll() { await c.auth.signOut({ scope: 'global' }); },
      async resetPassword(email) { const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/entrar?reset=1' }); if (error) throw new Error(traduz(error.message)); },
      async slugAvailable(s) { if (!validSlug(s)) return false; return !!(await run(c.rpc('slug_available', { p_slug: s }))); },
      async myRestaurant() {
        try { await run(c.rpc('claim_invited')); } catch (e) { console.warn('[KLINKS] claim_invited', e.message); }
        const rows = await run(c.from('restaurants').select('slug,plan,plan_until,config').limit(1));
        return rows && rows[0] || null;
      },
      async createRestaurant(slug, config) { await run(c.rpc('create_my_restaurant', { p_slug: slug, p_config: config })); return { slug, plan: 'free', config }; },
      async saveConfig(slug, config) { const { plan, ...clean } = config; await run(c.from('restaurants').update({ config: clean }).eq('slug', slug)); },
      async loadPublic(slug) { const rows = await run(c.from('public_pages').select('slug,plan,config').eq('slug', slug).limit(1)); return rows && rows[0] || null; },
      async track(row) {
        let { error } = await c.from('shortcut_clicks').insert(row);
        if (error && /session_id/i.test(error.message)) { const { session_id, ...r } = row; ({ error } = await c.from('shortcut_clicks').insert(r)); }
        if (error) console.warn('[KLINKS] track', error.message);
      },
      async isAdmin() { try { return !!(await run(c.rpc('is_admin'))); } catch (e) { return false; } },
      async adminList() { return await run(c.rpc('admin_list_restaurants')) || []; },
      async adminCreate(slug, email, config) { await run(c.rpc('admin_create_restaurant', { p_slug: slug, p_email: email || '', p_config: config })); },
      async adminLoad(slug) { const r = await run(c.rpc('admin_get_restaurant', { p_slug: slug })); return r && r[0] || null; },
      async adminSave(slug, config) { const { plan, ...clean } = config; await run(c.rpc('admin_save_config', { p_slug: slug, p_config: clean })); },
      async adminDelete(slug) { await run(c.rpc('admin_delete_restaurant', { p_slug: slug })); },
      async adminSetEmail(slug, email) { await run(c.rpc('admin_set_email', { p_slug: slug, p_email: email || '' })); },
      async saveLead(row) { const { error } = await timeout(c.from('leads').insert(row), T); if (error) throw new Error(traduz(error.message)); },
      async leads(slug) { return await run(c.from('leads').select('id,name,phone,source,created_at').eq('restaurant_slug', slug).order('created_at', { ascending: false }).limit(5000)); },
      async deleteLead(id) { await run(c.from('leads').delete().eq('id', id)); },
      async events(slug, sinceIso) { return await run(c.from('shortcut_clicks').select('event,label,referrer,user_agent,session_id,created_at').eq('restaurant_slug', slug).gte('created_at', sinceIso).order('created_at', { ascending: false }).limit(50000)); },
      async upload(file, slot, slug) {
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `${slug}/${slot}-${Date.now()}.${ext}`;
        const { error } = await timeout(c.storage.from(bucket).upload(path, file, { upsert: true, cacheControl: '31536000', contentType: file.type }), 30000, 'O envio da foto demorou demais. Tente uma foto menor.');
        if (error) throw new Error(traduz(error.message));
        return c.storage.from(bucket).getPublicUrl(path).data.publicUrl;
      },
    };
  }

  // ── Motor local (demonstração) ──────────────────────────────────────────
  function localEngine() {
    const K = 'klinks_local_db';
    const db = () => { try { return JSON.parse(localStorage.getItem(K)) || { users: {}, restaurants: {}, session: null }; } catch (e) { return { users: {}, restaurants: {}, session: null }; } };
    const save = (d) => { try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) { throw new Error('Sem espaço no navegador. Use fotos menores.'); } };
    const wait = (ms = 250) => new Promise(r => setTimeout(r, ms));
    return {
      mode: 'local',
      async ping() {},
      async getUser() { const d = db(); return d.session && d.users[d.session] ? { id: d.users[d.session].id, email: d.session } : null; },
      async signUp(email, pw) {
        await wait(); email = email.toLowerCase(); const d = db();
        if (d.users[email]) throw new Error(traduz('already registered'));
        if (String(pw).length < 6) throw new Error(traduz('password'));
        d.users[email] = { id: 'u' + Date.now().toString(36), pw }; d.session = email; save(d);
        return { user: { id: d.users[email].id, email }, needsConfirm: false };
      },
      async signIn(email, pw) {
        await wait(); email = email.toLowerCase(); const d = db();
        if (!d.users[email] || d.users[email].pw !== pw) throw new Error(traduz('invalid login'));
        d.session = email; save(d); return { id: d.users[email].id, email };
      },
      async signOut() { const d = db(); d.session = null; save(d); },
      async resetPassword() { await wait(); },
      async updatePassword(pw) { await wait(); const d = db(); if (d.users[d.session]) { d.users[d.session].pw = pw; save(d); } },
      async updateEmail(email) { await wait(); email = email.toLowerCase(); const d = db(); if (d.users[email]) throw new Error(traduz('already registered')); d.users[email] = d.users[d.session]; delete d.users[d.session]; d.session = email; save(d); return { needsConfirm: false }; },
      async signOutAll() { const d = db(); d.session = null; save(d); },
      async slugAvailable(s) { await wait(150); return validSlug(s) && !db().restaurants[s]; },
      async myRestaurant() { const d = db(); const u = d.session && d.users[d.session]; if (!u) return null; if (!Object.values(d.restaurants).some(v => v.owner === u.id)) { const inv = Object.values(d.restaurants).find(v => !v.owner && v.ownerEmail === d.session); if (inv) { inv.owner = u.id; save(d); } } const r = Object.entries(d.restaurants).find(([, v]) => v.owner === u.id); return r ? { slug: r[0], plan: r[1].plan, config: r[1].config } : null; },
      async createRestaurant(slug, config) {
        await wait(); const d = db(); const u = d.users[d.session]; if (!u) throw new Error('Entre na sua conta.');
        if (Object.values(d.restaurants).some(v => v.owner === u.id)) throw new Error(traduz('already_has_restaurant'));
        if (!validSlug(slug) || d.restaurants[slug]) throw new Error(traduz('slug_taken'));
        d.restaurants[slug] = { owner: u.id, plan: 'free', config }; save(d); return { slug, plan: 'free', config };
      },
      async saveConfig(slug, config) { const d = db(); if (!d.restaurants[slug]) throw new Error('Página não encontrada.'); const { plan, ...clean } = config; d.restaurants[slug].config = clean; save(d); },
      async setPlan(slug, plan) { const d = db(); if (d.restaurants[slug]) { d.restaurants[slug].plan = plan; save(d); } },
      async loadPublic(slug) { const r = db().restaurants[slug]; return r ? { slug, plan: r.plan, config: r.config } : null; },
      async track() { /* analytics.js já guarda localmente */ },
      async isAdmin() { return true; },
      async adminList() { const d = db(); return Object.entries(d.restaurants).map(([slug, v]) => ({ slug, owner_email: v.ownerEmail || Object.keys(d.users).find(e => d.users[e].id === v.owner) || '', claimed: !!v.owner, name: v.config?.profile?.name || slug })); },
      async adminCreate(slug, email, config) { await wait(); const d = db(); if (!validSlug(slug) || d.restaurants[slug]) throw new Error(traduz('slug_taken')); d.restaurants[slug] = { owner: null, ownerEmail: (email || '').toLowerCase(), plan: 'pro', config }; save(d); },
      async adminLoad(slug) { const d = db(), v = d.restaurants[slug]; return v ? { slug, owner_email: v.ownerEmail || '', claimed: !!v.owner, config: v.config } : null; },
      async adminSave(slug, config) { const d = db(); if (!d.restaurants[slug]) throw new Error('Página não encontrada.'); const { plan, ...clean } = config; d.restaurants[slug].config = clean; save(d); },
      async adminDelete(slug) { const d = db(); delete d.restaurants[slug]; save(d); },
      async adminSetEmail(slug, email) { const d = db(); if (d.restaurants[slug] && !d.restaurants[slug].owner) { d.restaurants[slug].ownerEmail = (email || '').toLowerCase(); save(d); } },
      async saveLead(row) { await wait(); const k = 'klinks_local_leads'; let a = []; try { a = JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) {} a.unshift({ ...row, id: 'l' + Date.now(), created_at: new Date().toISOString() }); localStorage.setItem(k, JSON.stringify(a.slice(0, 500))); },
      async leads(slug) { try { return JSON.parse(localStorage.getItem('klinks_local_leads') || '[]').filter(l => l.restaurant_slug === slug); } catch (e) { return []; } },
      async deleteLead(id) { const k = 'klinks_local_leads'; try { localStorage.setItem(k, JSON.stringify(JSON.parse(localStorage.getItem(k) || '[]').filter(l => l.id !== id))); } catch (e) {} },
      async events(slug, sinceIso) { const t = Date.parse(sinceIso); return (window.KlinksAnalytics ? window.KlinksAnalytics.events() : []).filter(e => e.slug === slug && e.ts >= t); },
      async upload(file) {
        if (file.size > 900 * 1024) throw new Error('No modo demonstração, use fotos de até 900 KB.');
        return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(new Error('Falha lendo o arquivo')); r.readAsDataURL(file); });
      },
      list() { return db(); },
    };
  }

  let engine = null, ready = null;
  async function init() {
    if (ready) return ready;
    ready = (async () => {
      const hasSb = typeof window.supabase?.createClient === 'function' && window.KLINKS_SUPABASE_URL && !/YOUR-/.test(window.KLINKS_SUPABASE_URL);
      const forceLocal = /[?&]demo=1/.test(location.search);
      if (hasSb && !forceLocal) {
        const sb = supabaseEngine();
        if (PROD_HOSTS.test(location.hostname)) { engine = sb; return engine; }
        try { await timeout(sb.ping(), 3500); engine = sb; return engine; }
        catch (e) { console.warn('[KLINKS] banco indisponível, usando modo demonstração:', e.message); }
      }
      engine = localEngine(); return engine;
    })();
    return ready;
  }

  // Slug da URL: ?r=slug  ·  useklinks.com/slug  ·  useklinks.com/studio/slug
  function slugFromUrl() {
    try {
      const q = new URLSearchParams(location.search).get('r'); if (q) return q;
      if (/\.html?$/i.test(location.pathname)) return '';
      const seg = location.pathname.split('/').filter(Boolean);
      const s = seg.length === 1 ? seg[0] : '';
      return validSlug(s) ? s : '';
    } catch (e) { return ''; }
  }
  const PUBLIC_BASE = (window.KLINKS_PUBLIC_BASE || 'https://useklinks.com').replace(/\/+$/, '');
  const prettyUrl = (slug) => PUBLIC_BASE.replace(/^https?:\/\//, '') + '/' + slug;
  // Link que funciona AGORA: no domínio, o bonito; no preview, pagina.html?r=
  const liveUrl = (slug) => PROD_HOSTS.test(location.hostname) ? PUBLIC_BASE + '/' + slug : new URL('pagina.html', location.href).href.split('?')[0] + '?r=' + encodeURIComponent(slug);
  const shareUrl = (slug) => PUBLIC_BASE + '/' + slug;

  window.KlinksBackend = {
    init, get engine() { return engine; }, get mode() { return engine && engine.mode; },
    slugify, validSlug, slugFromUrl, prettyUrl, liveUrl, shareUrl, RESERVED, traduz,
  };
})();
