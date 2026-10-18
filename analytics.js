/* ─────────────────────────────────────────────────────────────────────────
   KLINKS · Camada de Analytics (rastreio de cliques)
   ─────────────────────────────────────────────────────────────────────────

   Abstração ÚNICA usada pela página:

     window.KlinksAnalytics.track(event, meta?) → void

   Eventos rastreados na V1 (disparados por cliques nos botões):
     · delivery   — CTA principal (pedido)
     · whatsapp   — botão/atalho de WhatsApp
     · google     — avaliar no Google / como chegar
     · instagram  — atalho de Instagram
     · tour        — abrir o Tour 360 / capa

   ───────── Implementação padrão (offline / local-first) ─────────────────
   Os eventos são acumulados em memória + localStorage. Funciona sem backend,
   sobrevive a reload e permite inspecionar o funil durante demos:

     KlinksAnalytics.summary()   → { delivery: 3, whatsapp: 1, ... }
     KlinksAnalytics.events()    → lista completa com timestamp
     KlinksAnalytics.reset()     → zera o buffer

   ───────── Roadmap SaaS · enviar para Supabase ──────────────────────────
   Quando o backend estiver pronto, descomente o bloco SUPABASE abaixo e
   troque `sink: sinkLocal` por `sink: sinkSupabase`. Nenhuma outra parte
   da página precisa mudar — o contrato track(event, meta) é o mesmo.

   Schema sugerido (Supabase):
     create table shortcut_clicks (
       id uuid primary key default gen_random_uuid(),
       restaurant_slug text not null,
       event text not null,                 -- delivery | whatsapp | google | ...
       href text,
       label text,
       referrer text,
       user_agent text,
       created_at timestamptz default now()
     );
     -- índice para relatórios por restaurante + período
     create index on shortcut_clicks (restaurant_slug, created_at desc);
   ───────────────────────────────────────────────────────────────────── */

(() => {
  const STORE_KEY = 'klinks_events';
  const MAX_KEPT = 500; // evita crescer indefinidamente no localStorage

  const slugOf = (s) =>
    String(s || 'restaurant').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'restaurant';

  function loadBuffer() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]') || []; }
    catch (_) { return []; }
  }
  function saveBuffer(arr) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(arr.slice(-MAX_KEPT))); }
    catch (_) { /* storage cheio / indisponível — ignora */ }
  }

  // ── Sink padrão: localStorage + console ────────────────────────────────
  function sinkLocal(rec) {
    const buf = loadBuffer();
    buf.push(rec);
    saveBuffer(buf);
    // visível no console durante demos/dev
    if (window.__klinksDebug) console.debug('[KLINKS analytics]', rec.event, rec);
  }

  // ── Sink Supabase (comentado — pronto para descomentar) ────────────────
  //
  // const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
  // const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';
  // async function sinkSupabase(rec) {
  //   const sb = window.__sb ||= window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  //   const { error } = await sb.from('shortcut_clicks').insert({
  //     restaurant_slug: rec.slug,
  //     event: rec.event,
  //     href: rec.href || null,
  //     label: rec.label || null,
  //     referrer: rec.referrer || null,
  //     user_agent: rec.userAgent || null,
  //   });
  //   if (error) console.warn('[KLINKS analytics] supabase', error.message);
  // }

  // Sink Supabase: ativo automaticamente quando o KlinksDB está configurado.
  // Grava no banco só na página pública real (pagina.html marca __klinksPublic).
  async function sinkSupabase(rec) {
    const B = window.KlinksBackend;
    if (!B || B.mode !== 'supabase' || !window.__klinksPublic) return;
    B.engine.track({ restaurant_slug: rec.slug, event: rec.event, href: rec.href || null, label: rec.label || null,
      referrer: rec.referrer || null, user_agent: rec.userAgent || null, session_id: rec.sid });
  }
  function sessionId() {
    try { let s = sessionStorage.getItem('klinks_sid'); if (!s) { s = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem('klinks_sid', s); } return s; }
    catch (_) { return null; }
  }
  function sinkAuto(rec) { sinkLocal(rec); sinkSupabase(rec); }

  const urlParam = (k) => { try { return new URLSearchParams(location.search).get(k) || ''; } catch (_) { return ''; } };

  function track(event, meta = {}) {
    if (!event) return;
    const src = urlParam('src');
    const sid = sessionId();
    const slug0 = window.__klinksSlug || urlParam('r') || slugOf(window.__currentConfig?.brandName);
    // 1 visita por sessão (recarregar a página não infla o número)
    if (event === 'view') { try { const k = 'klinks_viewed_' + slug0; if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); } catch (_) {} }
    const rec = {
      event,
      slug: slug0, sid,
      label: meta.label || null,
      href: meta.href || null,
      ts: Date.now(),
      iso: new Date().toISOString(),
      referrer: src ? 'src:' + src + (document.referrer ? '|' + document.referrer : '') : (document.referrer || null),
      userAgent: navigator.userAgent,
    };
    try { window.KlinksAnalytics.sink(rec); }
    catch (e) { /* nunca quebra a navegação por causa do analytics */ }
    window.dispatchEvent(new CustomEvent('klinksevent', { detail: rec }));
  }

  // ── Delegação de clique: qualquer [data-klinks-event] é rastreado ───────
  // Captura na fase de captura para registrar antes de preventDefault de
  // handlers (ex.: fullscreen do tour).
  document.addEventListener('click', (e) => {
    const el = e.target.closest?.('[data-klinks-event]');
    if (!el) return;
    track(el.getAttribute('data-klinks-event'), {
      href: el.getAttribute('href') || null,
      label: (el.textContent || '').trim().slice(0, 80) || null,
    });
  }, true);

  window.KlinksAnalytics = {
    track,
    sink: sinkAuto,            // local + Supabase (quando configurado)
    events: () => loadBuffer(),
    summary: () => loadBuffer().reduce((a, r) => {
      a[r.event] = (a[r.event] || 0) + 1; return a;
    }, {}),
    reset: () => saveBuffer([]),
  };
})();
