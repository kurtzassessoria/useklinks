/* KLINKS Studio · dados, temas, blocos, migração, horários e estatísticas */
(() => {
const THEMES = [
  {id:'brasa',name:'Brasa',bg:'#17110f',ink:'#fff4ea',muted:'#c4ab9b',btn:'#261b17',btnInk:'#fff4ea',accent:'#ff5a1f'},
  {id:'mostarda',name:'Mostarda',bg:'#f6e05a',ink:'#1b1708',muted:'#4f461a',btn:'rgba(27,23,8,.08)',btnInk:'#1b1708',accent:'#1b1708'},
  {id:'tomate',name:'Tomate',bg:'#f6efe6',ink:'#2b1a14',muted:'#7a5d50',btn:'#ffffff',btnInk:'#2b1a14',accent:'#e0412a'},
  {id:'manjericao',name:'Manjericão',bg:'#e9f2e1',ink:'#16392a',muted:'#4b6a58',btn:'#ffffff',btnInk:'#16392a',accent:'#2f7d4f'},
  {id:'noite',name:'Noite',bg:'#0f1115',ink:'#f3f3f3',muted:'#9aa0a8',btn:'#1b1e25',btnInk:'#f3f3f3',accent:'#f5b301'},
  {id:'acai',name:'Açaí',bg:'#25102f',ink:'#f8eefe',muted:'#bfa2cf',btn:'#361a44',btnInk:'#f8eefe',accent:'#c58bff'},
  {id:'sal',name:'Sal',bg:'#ffffff',ink:'#121212',muted:'#6b6b6b',btn:'#f1f1f1',btnInk:'#121212',accent:'#121212'},
  {id:'coco',name:'Coco',bg:'#f2e9da',ink:'#3a2a1b',muted:'#7d6650',btn:'#fffaf1',btnInk:'#3a2a1b',accent:'#8a5a2b'},
  {id:'oceano',name:'Oceano',bg:'#e3eff6',ink:'#0d2b45',muted:'#4e6a80',btn:'#ffffff',btnInk:'#0d2b45',accent:'#1565c0'},
];
const FONTS = [
  ['Manrope',"'Manrope',sans-serif"],['Poppins',"'Poppins',sans-serif"],['Lato',"'Lato',sans-serif"],
  ['Playfair',"'Playfair Display',serif"],['DM Serif',"'DM Serif Display',serif"],['Cinzel',"'Cinzel',serif"],
  ['Bebas',"'Bebas Neue',sans-serif"],['Anton',"'Anton',sans-serif"],['Oswald',"'Oswald',sans-serif"],
  ['Alegreya',"'Alegreya',serif"],['Slab',"'Roboto Slab',serif"],['Comfortaa',"'Comfortaa',sans-serif"],
  ['Space Mono',"'Space Mono',monospace"],['Caveat',"'Caveat',cursive"],['Archivo',"'Archivo Black',sans-serif"],
].map(([id,css])=>({id,css}));
const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Poppins:wght@400;600;700&family=Lato:wght@400;700&family=Playfair+Display:wght@500;700&family=DM+Serif+Display&family=Cinzel:wght@500;700&family=Bebas+Neue&family=Anton&family=Oswald:wght@400;600&family=Alegreya:wght@500;700&family=Roboto+Slab:wght@500;700&family=Comfortaa:wght@500;700&family=Space+Mono:wght@400;700&family=Caveat:wght@600&family=Archivo+Black&display=swap';

const LINK_PRESETS = [
  {icon:'delivery',short:'Delivery',label:'Pedir pelo delivery',color:'#ff5a1f',hint:'Link do seu cardápio digital ou app de pedidos'},
  {icon:'menu',short:'Cardápio',label:'Ver cardápio',color:'#7c3aed',hint:'Link do cardápio'},
  {icon:'whatsapp',short:'WhatsApp',label:'Chamar no WhatsApp',color:'#22c55e',kind:'whatsapp'},
  {icon:'calendar',short:'Reserva',label:'Reservar mesa',color:'#0ea5e9',hint:'Link de reserva ou WhatsApp'},
  {icon:'pin',short:'Mapa',label:'Como chegar',color:'#ea4335',kind:'maps'},
  {icon:'instagram',short:'Instagram',label:'Siga no Instagram',color:'#e1306c',hint:'https://instagram.com/seuperfil'},
  {icon:'phone',short:'Ligar',label:'Ligar agora',color:'#14b8a6',kind:'phone'},
  {icon:'gift',short:'Fidelidade',label:'Clube de vantagens',color:'#f59e0b',hint:'Link do programa de fidelidade'},
  {icon:'link',short:'Outro',label:'Outro link',color:'#64748b',hint:'Qualquer endereço da internet'},
];
const BLOCK_TYPES = [
  {type:'offer',group:'Vender',name:'Oferta',desc:'Promoção com preço, cupom e prazo',icon:'tag',color:'#ff5a1f'},
  {type:'review',group:'Vender',name:'Avaliações no Google',desc:'Peça 5 estrelas a quem já comprou',icon:'star',color:'#f5b301'},
  {type:'link',group:'Conteúdo',name:'Botão',desc:'Delivery, WhatsApp, cardápio, reservas',icon:'link',color:'#7c3aed'},
  {type:'text',group:'Conteúdo',name:'Aviso / texto',desc:'Recado rápido, novidade, história',icon:'text',color:'#64748b'},
  {type:'map',group:'Local',name:'Mapa',desc:'Google Maps com o seu endereço',icon:'map',color:'#ea4335'},
  {type:'hours',group:'Local',name:'Horário de funcionamento',desc:'Mostra “Aberto agora” sozinho',icon:'clock',color:'#0ea5e9'},
];
const OFFER_TEMPLATES = [
  {name:'Produto do mês',eyebrow:'Do mês',title:'Pizza do mês',desc:'Sabor especial com preço exclusivo durante todo o mês.',priceFrom:'89,90',priceTo:'69,90',cta:'Quero essa'},
  {name:'Combo',eyebrow:'Combo',title:'Combo família',desc:'2 pizzas grandes + refri 2L.',priceFrom:'159,90',priceTo:'129,90',cta:'Pedir combo'},
  {name:'Cupom 1ª compra',eyebrow:'Primeira compra',title:'10% OFF no primeiro pedido',desc:'Use o cupom no fechamento do pedido.',coupon:'BEMVINDO10',cta:'Usar cupom'},
  {name:'Frete grátis',eyebrow:'Hoje',title:'Entrega grátis',desc:'Pedidos acima de R$ 80 até as 20h.',cta:'Pedir agora'},
];
const WEEK = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const WEEK_S = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

const uid = () => 'b' + Math.random().toString(36).slice(2, 9);
const pad = (n) => String(n).padStart(2, '0');
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const endOfMonth = () => { const d = new Date(); return isoDate(new Date(d.getFullYear(), d.getMonth()+1, 0)); };
const defaultWeek = (o='18:30', c='23:00') => WEEK.map(() => ({on:true, open:o, close:c}));

function newBlock(type, preset) {
  const id = uid();
  if (type === 'link') { const p = preset || LINK_PRESETS[0]; return {id,type,on:true,icon:p.icon,label:p.label,sub:'',url:'',phone:'',msg:'',highlight:false}; }
  if (type === 'offer') { const t = preset || OFFER_TEMPLATES[0]; return {id,type,on:true,image:'',imageY:50,eyebrow:t.eyebrow||'',title:t.title,desc:t.desc||'',priceFrom:t.priceFrom||'',priceTo:t.priceTo||'',coupon:t.coupon||'',ends:endOfMonth(),cta:t.cta||'Aproveitar',url:''}; }
  if (type === 'map') return {id,type,on:true,address:'',label:'Como chegar'};
  if (type === 'hours') return {id,type,on:true,week:defaultWeek()};
  if (type === 'review') return {id,type,on:true,label:'Nos avalie no Google',sub:'Leva 10 segundos e ajuda muito',url:''};
  if (type === 'text') return {id,type,on:true,title:'',text:'Escreva aqui um recado para seus clientes.'};
}

const DEFAULT = {
  v:3, slug:'pinerolo', plan:'free', watermark:true,
  profile:{name:'Pinerolo Pizzaria',tagline:'Massa de longa fermentação · Delivery e salão em Penha-SC',logo:'',logoLetter:'P',cover:'',coverY:50},
  social:{instagram:'pinerolo',facebook:'',tiktok:'',whatsapp:'5547992000820'},
  theme:'brasa', custom:{bg:'#17110f',ink:'#fff4ea',btn:'#261b17',btnInk:'#fff4ea',accent:'#ff5a1f'},
  font:'Manrope', buttonShape:'soft', buttonStyle:'fill',
  seo:{title:'',description:''}, pixel:'',
  blocks:[
    {id:'b1',type:'link',on:true,icon:'delivery',label:'Pedir pelo delivery',sub:'Entrega em ~35 min · pague no app',url:'https://app.cardapioweb.com/pinerolopizzaria',phone:'',msg:'',highlight:true},
    {id:'b2',type:'offer',on:true,image:'',imageY:50,eyebrow:'Pizza do mês',title:'Cheese Potato',desc:'Pizza grande, 12 fatias, 35 cm. Massa de longa fermentação.',priceFrom:'89,90',priceTo:'69,90',coupon:'',ends:endOfMonth(),cta:'Quero essa',url:'https://app.cardapioweb.com/pinerolopizzaria'},
    {id:'b3',type:'link',on:true,icon:'whatsapp',label:'Chamar no WhatsApp',sub:'Atendimento das 18h30 às 23h',url:'',phone:'5547992000820',msg:'Olá! Gostaria de fazer um pedido.',highlight:false},
    {id:'b4',type:'hours',on:true,week:defaultWeek('18:30','23:10')},
    {id:'b5',type:'map',on:true,address:'',label:'Como chegar'},
    {id:'b6',type:'review',on:true,label:'Nos avalie no Google',sub:'Leva 10 segundos e ajuda muito',url:''},
  ],
  meta:{shared:false,onboardingHidden:false},
};

// v2 (config plano antigo) → v3 (blocos)
function migrateLegacy(c) {
  if (!c) return null;
  if (c.studio) return c.studio;
  if (c.v === 3) return c;
  const out = JSON.parse(JSON.stringify(DEFAULT));
  out.blocks = [];
  out.profile = {name:c.brandName||'Seu restaurante',tagline:c.brandTagline||'',logo:c.brandLogoImage||'',logoLetter:c.brandLogoLetter||'R',cover:c.tourImage||'',coverY:c.tourImageY||50};
  const ok = (u) => u && u !== '#';
  const wa = /phone=(\d+)/.exec(c.btn1Url||'');
  out.social = {instagram:'',facebook:'',tiktok:'',whatsapp:wa?wa[1]:''};
  if (ok(c.primaryCtaUrl)) out.blocks.push({...newBlock('link'),label:c.primaryCtaLabel||'Pedir pelo delivery',sub:c.primaryCtaSublabel||'',url:c.primaryCtaUrl,highlight:true});
  if (c.promoEnabled) out.blocks.push({...newBlock('offer'),eyebrow:c.promoEyebrow||'',title:[c.promoTitle,c.promoTitleAccent].filter(Boolean).join(' '),desc:c.promoDescription||'',image:c.promoImage||'',priceFrom:'',priceTo:'',cta:c.promoCtaLabel||'Aproveitar',url:ok(c.promoCtaUrl)?c.promoCtaUrl:''});
  [1,2,3].forEach(i => { if (c['btn'+i+'Enabled'] && ok(c['btn'+i+'Url'])) out.blocks.push({...newBlock('link',LINK_PRESETS.find(p=>p.icon===c['btn'+i+'Icon'])),label:c['btn'+i+'Label'],sub:c['btn'+i+'Sublabel']||'',url:c['btn'+i+'Url'],phone:i===1&&wa?wa[1]:''}); });
  [1,2,3,4,5,6].forEach(i => {
    if (!c['shortcut'+i+'Enabled']) return;
    const ic = c['shortcut'+i+'Icon'], u = c['shortcut'+i+'Url'];
    if (ic === 'star') out.blocks.push({...newBlock('review'),url:ok(u)?u:''});
    else if (ok(u)) out.blocks.push({...newBlock('link',LINK_PRESETS.find(p=>p.icon===ic)),label:c['shortcut'+i+'Label'],url:u});
  });
  out.blocks.push(newBlock('hours'));
  out.blocks.push({...newBlock('map'),address:[c.infoAddress,c.infoCity].filter(Boolean).join(' - ')});
  return out;
}

// ── Links ──
const href = (u) => !u ? '' : /^(https?:|mailto:|tel:|#)/i.test(u) ? u : 'https://' + u.replace(/^\/+/, '');
const digits = (s) => String(s||'').replace(/\D/g, '');
const waLink = (phone, msg) => { let d = digits(phone); if (!d) return ''; if (d.length <= 11) d = '55' + d; return `https://wa.me/${d}${msg?'?text='+encodeURIComponent(msg):''}`; };
const mapsLink = (addr) => addr ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addr) : '';
const mapsEmbed = (addr) => 'https://www.google.com/maps?q=' + encodeURIComponent(addr) + '&output=embed';
function linkHref(b, cfg) {
  if (b.icon === 'whatsapp') return waLink(b.phone || cfg?.social?.whatsapp, b.msg) || href(b.url);
  if (b.icon === 'phone' && b.phone) return 'tel:+' + (digits(b.phone).length <= 11 ? '55' : '') + digits(b.phone);
  if (b.icon === 'pin' && !b.url) { const m = cfg?.blocks?.find(x => x.type === 'map' && x.address); return m ? mapsLink(m.address) : ''; }
  return href(b.url);
}
function socialLinks(s) {
  const out = [];
  if (s.instagram) out.push(['instagram', /^https?:/.test(s.instagram) ? s.instagram : 'https://instagram.com/' + s.instagram.replace('@','')]);
  if (s.facebook) out.push(['facebook', href(s.facebook)]);
  if (s.tiktok) out.push(['tiktok', /^https?:/.test(s.tiktok) ? s.tiktok : 'https://tiktok.com/@' + s.tiktok.replace('@','')]);
  if (s.whatsapp) out.push(['whatsapp', waLink(s.whatsapp)]);
  return out;
}

// ── Tema / fonte ──
function resolveTheme(cfg) {
  if (cfg.theme === 'custom') { const c = cfg.custom; return {...c, muted: c.ink + 'b3'}; }
  return THEMES.find(t => t.id === cfg.theme) || THEMES[0];
}
const fontCss = (id) => (FONTS.find(f => f.id === id) || FONTS[0]).css;
const presetFor = (icon) => LINK_PRESETS.find(p => p.icon === icon) || LINK_PRESETS[LINK_PRESETS.length-1];

// ── Horários ──
const toMin = (s) => { const [h,m] = String(s||'0:0').split(':').map(Number); return h*60 + (m||0); };
const fmtH = (s) => { const [h,m] = String(s).split(':'); return `${+h}h${m && m !== '00' ? m : ''}`; };
function statusNow(week, now = new Date()) {
  if (!week) return null;
  const d = now.getDay(), mins = now.getHours()*60 + now.getMinutes();
  const t = week[d], y = week[(d+6)%7];
  if (t.on) { const o = toMin(t.open), c = toMin(t.close);
    if ((c > o && mins >= o && mins < c) || (c <= o && mins >= o)) return {open:true,label:`Aberto agora · fecha às ${fmtH(t.close)}`}; }
  if (y.on && toMin(y.close) <= toMin(y.open) && mins < toMin(y.close)) return {open:true,label:`Aberto agora · fecha às ${fmtH(y.close)}`};
  if (t.on && mins < toMin(t.open)) return {open:false,label:`Fechado · abre hoje às ${fmtH(t.open)}`};
  for (let i = 1; i <= 7; i++) { const w = week[(d+i)%7]; if (w.on) return {open:false,label:`Fechado · abre ${i===1?'amanhã':WEEK[(d+i)%7].toLowerCase()} às ${fmtH(w.open)}`}; }
  return {open:false,label:'Fechado'};
}

// ── Ofertas ──
function offerState(b, now = new Date()) {
  if (!b.ends) return {active:true,label:''};
  const end = new Date(b.ends + 'T23:59:59'); const ms = end - now;
  if (ms < 0) return {active:false,label:'Encerrada'};
  const days = Math.floor(ms / 864e5);
  return {active:true,label: days === 0 ? 'Último dia!' : days === 1 ? 'Termina amanhã' : `Termina em ${days} dias`};
}

// ── Onboarding ──
function steps(cfg) {
  const B = cfg.blocks;
  const order = B.find(b => b.type==='link' && ['delivery','menu'].includes(b.icon) && b.url);
  const cand = order || B.find(b => b.type==='link' && ['delivery','menu'].includes(b.icon));
  return [
    {id:'profile',title:'Sua marca',desc:'Nome, logo e foto de capa',done:!!(cfg.profile.name && cfg.profile.logo),go:{panel:'page',sub:{kind:'profile'}}},
    {id:'order',title:'Botão de pedido',desc:'Link do delivery ou cardápio',done:!!order,go:cand?{panel:'page',sub:{kind:'block',id:cand.id}}:{panel:'page',add:'link'}},
    {id:'whatsapp',title:'WhatsApp',desc:'Número para atendimento',done:!!(cfg.social.whatsapp || B.some(b=>b.icon==='whatsapp'&&b.phone)),go:{panel:'page',sub:{kind:'social'}}},
    {id:'local',title:'Endereço e horário',desc:'Mapa e “Aberto agora”',done:B.some(b=>b.type==='map'&&b.address&&b.on),go:(()=>{const m=B.find(b=>b.type==='map');return m?{panel:'page',sub:{kind:'block',id:m.id}}:{panel:'page',add:'map'};})()},
    {id:'offer',title:'Primeira oferta',desc:'Promoção com prazo',done:B.some(b=>b.type==='offer'&&b.on&&offerState(b).active),go:{panel:'offers'}},
    {id:'share',title:'Coloque na bio',desc:'Link no Instagram e WhatsApp',done:!!cfg.meta?.shared,go:{panel:'share'}},
  ];
}

// ── Estatísticas ──
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function emptyStats(days) {
  const daily = []; const now = new Date();
  for (let i = days-1; i >= 0; i--) { const d = new Date(now); d.setDate(d.getDate()-i); daily.push({date:isoDate(d),dow:d.getDay(),views:0,clicks:0}); }
  return {daily,views:0,clicks:0,people:0,clickers:0,top:{},src:{Instagram:0,WhatsApp:0,Google:0,'QR Code':0,Direto:0},mobile:0,heat:Array.from({length:7},()=>Array(24).fill(0))};
}
function finalize(s, cfg) {
  // Taxa de clique = visitas que clicaram em algo ÷ visitas (nunca passa de 100%).
  s.ctr = s.views ? Math.min(100, Math.round((s.clickers || Math.min(s.clicks, s.views)) / s.views * 100)) : 0;
  const names = {};
  (cfg?.blocks || []).forEach(b => { names[b.id] = b.type === 'offer' ? 'Oferta · ' + b.title : b.type === 'map' ? (b.label || 'Como chegar') + ' (mapa)' : b.label; names[b.id + '-cupom'] = 'Cupom · ' + (b.coupon || ''); });
  ['instagram','facebook','tiktok','whatsapp'].forEach(n => names['social-' + n] = 'Ícone ' + n);
  s.topList = Object.entries(s.top).map(([k,v]) => ({label: names[k] || v.label || k, n: v.n, gone: !names[k] && !!k})).sort((a,b) => b.n-a.n);
  s.srcList = Object.entries(s.src).map(([label,n]) => ({label,n})).filter(x => x.n).sort((a,b) => b.n-a.n);
  let best = [0,0,0]; s.heat.forEach((r,d) => r.forEach((v,h) => { if (v > best[0]) best = [v,d,h]; }));
  s.peak = best[0] >= 3 ? {dow:best[1],hour:best[2]} : null;
  s.mobilePct = s.views ? Math.round(s.mobile / s.views * 100) : 0;
  return s;
}
function demoStats(cfg, days) {
  const r = rng(days * 97 + (cfg.slug||'').length), s = emptyStats(days);
  const links = cfg.blocks.filter(b => b.on && ['link','offer','review','map'].includes(b.type));
  const w = {delivery:.42,menu:.3,whatsapp:.14,pin:.1,calendar:.06,instagram:.05};
  s.daily.forEach(d => {
    const base = [.8,.55,.6,.65,.85,1.25,1.35][d.dow];
    d.views = Math.round((240 + r()*90) * base); d.clicks = Math.round(d.views * (.55 + r()*.15));
    s.views += d.views; s.clicks += d.clicks;
    for (let h = 0; h < 24; h++) { const k = (h>=11&&h<=13?.5:0) + (h>=18&&h<=22?1:0) + (h===20?.4:0); s.heat[d.dow][h] += Math.round(d.views * k * (.08 + r()*.04)); }
  });
  s.clickers = Math.round(s.views * .58);
  links.forEach(b => { const k = b.type==='offer'?.2:b.type==='review'?.03:b.type==='map'?.08:(w[b.icon]||.04); s.top[b.id] = {n:Math.round(s.clicks * k * (.9 + r()*.2))}; });
  Object.assign(s.src, {Instagram:Math.round(s.views*.58),WhatsApp:Math.round(s.views*.17),Google:Math.round(s.views*.13),'QR Code':Math.round(s.views*.05),Direto:Math.round(s.views*.07)});
  s.mobile = Math.round(s.views * .91); s.demo = true;
  return finalize(s, cfg);
}
function classify(ref) {
  const x = String(ref||'').toLowerCase();
  if (/src:ig|instagram/.test(x)) return 'Instagram';
  if (/src:wa|whatsapp|wa\.me/.test(x)) return 'WhatsApp';
  if (/src:google|google\./.test(x)) return 'Google';
  if (/src:qr/.test(x)) return 'QR Code';
  return 'Direto';
}
function computeStats(rows, days, cfg) {
  const s = emptyStats(days); const idx = {}; s.daily.forEach((d,i) => idx[d.date] = i);
  const viewS = new Set(), clickS = new Set();
  rows.forEach(r => {
    const t = new Date(r.created_at || r.iso || r.ts); const k = idx[isoDate(t)]; if (k == null) return;
    const sid = r.session_id || r.sid;
    if (r.event === 'view') {
      s.views++; s.daily[k].views++; s.src[classify(r.referrer)]++;
      if (/mobi|android|iphone/i.test(r.user_agent||r.userAgent||'')) s.mobile++;
      s.heat[t.getDay()][t.getHours()]++; if (sid) viewS.add(sid);
    } else {
      s.clicks++; s.daily[k].clicks++; if (sid) clickS.add(sid);
      const key = String(r.event).startsWith('click:') ? r.event.slice(6) : (r.label || r.event);
      (s.top[key] ||= {n:0,label:r.label}).n++;
    }
  });
  s.people = viewS.size;
  s.clickers = [...clickS].filter(x => viewS.has(x)).length;
  return finalize(s, cfg);
}
// Fonte única: KlinksBackend (Supabase em produção, navegador no modo demonstração).
async function fetchStats(cfg, days) {
  const since = new Date(Date.now() - days*864e5).toISOString();
  const B = window.KlinksBackend;
  try {
    await B.init();
    const rows = await B.engine.events(cfg.slug, since);
    return {...computeStats(rows || [], days, cfg), source: B.mode};
  } catch (e) { return {...computeStats([], days, cfg), source: B && B.mode, error: e.message}; }
}

const SEGMENTS = [
  {id:'pizzaria',name:'Pizzaria',theme:'tomate',font:'Playfair',offer:{eyebrow:'Pizza do mês',title:'Pizza do mês',desc:'Sabor especial com preço exclusivo durante todo o mês.',priceFrom:'89,90',priceTo:'69,90',cta:'Quero essa'}},
  {id:'hamburgueria',name:'Hamburgueria',theme:'noite',font:'Anton',offer:{eyebrow:'Combo',title:'Combo smash + fritas + refri',desc:'Smash duplo, fritas média e refri lata.',priceFrom:'49,90',priceTo:'39,90',cta:'Pedir combo'}},
  {id:'japones',name:'Japonês / sushi',theme:'sal',font:'DM Serif',offer:{eyebrow:'Combinado',title:'Combinado 30 peças',desc:'Sashimi, niguiri, uramaki e hot. Serve 2 pessoas.',priceFrom:'139,90',priceTo:'109,90',cta:'Pedir agora'}},
  {id:'acai',name:'Açaí / sorvete',theme:'acai',font:'Comfortaa',offer:{eyebrow:'Do dia',title:'Açaí 500 ml + 3 adicionais',desc:'Monte do seu jeito.',priceFrom:'29,90',priceTo:'22,90',cta:'Montar o meu'}},
  {id:'restaurante',name:'Restaurante / marmita',theme:'manjericao',font:'Poppins',offer:{eyebrow:'Hoje',title:'Prato do dia',desc:'Arroz, feijão, salada e a proteína do dia.',priceTo:'24,90',cta:'Pedir marmita'}},
  {id:'bar',name:'Bar / pub',theme:'mostarda',font:'Oswald',offer:{eyebrow:'Happy hour',title:'Chopp em dobro',desc:'De terça a sexta, das 17h às 20h.',cta:'Reservar mesa'}},
  {id:'cafe',name:'Padaria / café',theme:'coco',font:'Alegreya',offer:{eyebrow:'Manhã',title:'Café + pão de queijo',desc:'Todo dia até as 11h.',priceTo:'12,90',cta:'Pedir agora'}},
];
function buildConfig({name, slug, segment, whatsapp}) {
  const seg = SEGMENTS.find(s => s.id === segment) || SEGMENTS[0];
  const wa = String(whatsapp||'').replace(/\D/g,'');
  const cfg = JSON.parse(JSON.stringify(DEFAULT));
  Object.assign(cfg, {slug, plan:'free', theme:seg.theme, lastTheme:seg.theme, font:seg.font, segment:seg.id});
  const t = THEMES.find(x => x.id === seg.theme); cfg.custom = {bg:t.bg,ink:t.ink,btn:t.btn.startsWith('#')?t.btn:t.bg,btnInk:t.btnInk,accent:t.accent};
  cfg.profile = {name, tagline:'', logo:'', logoLetter:(name||'K').trim()[0].toUpperCase(), cover:'', coverY:50};
  cfg.social = {instagram:'', facebook:'', tiktok:'', whatsapp: wa ? (wa.length <= 11 ? '55' + wa : wa) : ''};
  cfg.blocks = [
    {...newBlock('link', LINK_PRESETS[0]), highlight:true, sub:'Peça pelo nosso cardápio digital'},
    newBlock('offer', seg.offer),
    {...newBlock('link', LINK_PRESETS[2]), phone: cfg.social.whatsapp, msg:'Olá! Vim pela página e gostaria de fazer um pedido.'},
    newBlock('hours'), newBlock('map'), newBlock('review'),
  ];
  cfg.meta = {shared:false, onboardingHidden:false};
  return cfg;
}
const PLAN_LIMITS = {free:{offers:1, days:[7,30]}, pro:{offers:99, days:[7,30,90]}};

window.KStudio = {THEMES,FONTS,FONTS_URL,LINK_PRESETS,BLOCK_TYPES,OFFER_TEMPLATES,WEEK,WEEK_S,DEFAULT,
  uid,newBlock,migrateLegacy,href,waLink,mapsLink,mapsEmbed,linkHref,socialLinks,resolveTheme,fontCss,presetFor,
  statusNow,fmtH,offerState,steps,fetchStats,demoStats,SEGMENTS,buildConfig,PLAN_LIMITS};
})();
