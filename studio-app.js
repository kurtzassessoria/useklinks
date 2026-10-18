const RAIL = [['page', 'Minha página'], ['offers', 'Ofertas'], ['style', 'Aparência'], ['data', 'Dados'], ['share', 'Compartilhar']];
const RAIL_ICONS = {
  page: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5',
  offers: BP_PATHS.tag,
  style: 'M12 3.5s6.5 7 6.5 11.2a6.5 6.5 0 1 1-13 0C5.5 10.5 12 3.5 12 3.5z',
  data: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  share: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z'
};
const RailIcon = ({
  id
}) => React.createElement("svg", {
  width: "22",
  height: "22",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.8",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, React.createElement("path", {
  d: RAIL_ICONS[id]
}));
const clone = x => JSON.parse(JSON.stringify(x));
const lsGet = k => {
  try {
    return JSON.parse(localStorage.getItem(k) || 'null');
  } catch (e) {
    return null;
  }
};
const lsSet = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
    return true;
  } catch (e) {
    return false;
  }
};
const stripPlan = c => {
  const {
    plan,
    ...r
  } = c;
  return r;
};
function Studio() {
  const B = window.KlinksBackend,
    K = window.KStudio;
  useUiTheme();
  const [phase, setPhase] = React.useState('boot');
  const [user, setUser] = React.useState(null);
  const [rest, setRest] = React.useState(null);
  const [cfg, setCfg] = React.useState(null);
  const [pub, setPub] = React.useState(null);
  const [bootErr, setBootErr] = React.useState('');
  const boot = React.useCallback(async () => {
    setPhase('boot');
    setBootErr('');
    try {
      await B.init();
      const u = await B.engine.getUser();
      if (!u) {
        setPhase('auth');
        return;
      }
      setUser(u);
      const r = await B.engine.myRestaurant();
      if (!r) {
        setPhase('create');
        return;
      }
      const live = {
        ...clone(K.DEFAULT),
        ...(K.migrateLegacy(r.config) || {}),
        slug: r.slug
      };
      delete live.plan;
      setRest({
        slug: r.slug,
        plan: r.plan || 'free'
      });
      setPub(JSON.stringify(live));
      setCfg(lsGet('klinks_draft_' + r.slug) || live);
      setPhase('editor');
    } catch (e) {
      setBootErr(e.message);
      setPhase('error');
    }
  }, []);
  React.useEffect(() => {
    boot();
  }, []);
  const signOut = async () => {
    await B.engine.signOut();
    setUser(null);
    setRest(null);
    setCfg(null);
    setPhase('auth');
  };
  if (phase === 'boot') return React.createElement("div", {
    className: "st-login"
  }, React.createElement("p", {
    className: "st-lead"
  }, "Carregando\u2026"));
  if (phase === 'error') return React.createElement("div", {
    className: "st-login"
  }, React.createElement("div", {
    className: "st-card",
    style: {
      maxWidth: 420
    }
  }, React.createElement("h1", {
    className: "st-h1",
    style: {
      fontSize: 20
    }
  }, "N\xE3o conseguimos conectar"), React.createElement("p", {
    className: "st-lead"
  }, bootErr), React.createElement("button", {
    className: "st-btn pri",
    onClick: boot
  }, "Tentar de novo")));
  if (phase === 'auth') {
    const p = location.pathname + location.search;
    return React.createElement(AuthScreen, {
      initial: /entrar|login/.test(p) ? 'login' : 'signup',
      onAuthed: boot
    });
  }
  if (phase === 'create') return React.createElement(CreatePage, {
    user: user,
    onCreated: boot,
    onSignOut: signOut
  });
  return React.createElement(Editor, {
    B: B,
    K: K,
    rest: rest,
    setRest: setRest,
    cfg: cfg,
    setCfg: setCfg,
    pub: pub,
    setPub: setPub,
    signOut: signOut
  });
}
function Editor({
  B,
  K,
  rest,
  setRest,
  cfg,
  setCfg,
  pub,
  setPub,
  signOut
}) {
  const [nav, setNav] = React.useState(() => ({
    panel: 'page',
    ...(lsGet('klinks_studio_nav') || {})
  }));
  const [toast, setToast] = React.useState('');
  const [pvOpen, setPvOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const mainRef = React.useRef(null);
  React.useEffect(() => {
    if (!lsSet('klinks_draft_' + rest.slug, cfg)) setToast('Rascunho grande demais para este navegador. Publique ou use fotos menores.');
  }, [cfg]);
  React.useEffect(() => {
    lsSet('klinks_studio_nav', {
      panel: nav.panel
    });
  }, [nav.panel]);
  React.useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 2800);
      return () => clearTimeout(t);
    }
  }, [toast]);
  React.useEffect(() => {
    const h = e => {
      if (JSON.stringify(cfg) !== pub) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [cfg, pub]);
  const plan = rest.plan,
    limits = K.PLAN_LIMITS[plan] || K.PLAN_LIMITS.free;
  const full = {
    ...cfg,
    plan
  };
  const s = {
    cfg: full,
    nav,
    mode: B.mode,
    plan,
    limits,
    toast: setToast,
    publicUrl: B.liveUrl(rest.slug),
    shareUrl: B.shareUrl(rest.slug),
    prettyUrl: B.prettyUrl(rest.slug),
    upd: patch => setCfg(c => stripPlan({
      ...c,
      ...patch
    })),
    updP: (k, patch) => setCfg(c => ({
      ...c,
      [k]: {
        ...(c[k] || {}),
        ...patch
      }
    })),
    updBlock: (id, patch) => setCfg(c => ({
      ...c,
      blocks: c.blocks.map(b => b.id === id ? {
        ...b,
        ...patch
      } : b)
    })),
    addBlock: (type, preset, top) => {
      if (type === 'offer') {
        const act = cfg.blocks.filter(b => b.type === 'offer' && b.on && K.offerState(b).active).length;
        if (act >= limits.offers) {
          setToast(`No plano Free é ${limits.offers} oferta ativa por vez. Desligue a atual ou assine o Pro.`);
          return null;
        }
      }
      const b = K.newBlock(type, preset);
      setCfg(c => {
        const bl = [...c.blocks];
        if (top) {
          const i = bl.findIndex(x => x.type === 'link' && x.highlight);
          bl.splice(i + 1, 0, b);
        } else bl.push(b);
        return {
          ...c,
          blocks: bl
        };
      });
      if (!top) setNav({
        panel: 'page',
        sub: {
          kind: 'block',
          id: b.id
        }
      });
      return b.id;
    },
    duplicate: id => setCfg(c => {
      const i = c.blocks.findIndex(b => b.id === id);
      const bl = [...c.blocks];
      bl.splice(i + 1, 0, {
        ...clone(c.blocks[i]),
        id: K.uid()
      });
      return {
        ...c,
        blocks: bl
      };
    }),
    removeBlock: id => setCfg(c => ({
      ...c,
      blocks: c.blocks.filter(b => b.id !== id)
    })),
    moveBlock: (from, to) => setCfg(c => {
      const bl = [...c.blocks];
      const [x] = bl.splice(from, 1);
      bl.splice(to, 0, x);
      return {
        ...c,
        blocks: bl
      };
    }),
    go: n => {
      if (n.add) {
        n.add === 'link' ? setNav({
          panel: 'page',
          sub: {
            kind: 'add-link'
          }
        }) : s.addBlock(n.add);
      } else setNav(n);
      if (mainRef.current) mainRef.current.scrollTop = 0;
    },
    setPlan: async p => {
      if (B.engine.setPlan) {
        await B.engine.setPlan(rest.slug, p);
        setRest({
          ...rest,
          plan: p
        });
      }
    },
    discard: () => {
      setCfg(JSON.parse(pub));
      setToast('Alterações descartadas.');
    },
    signOut
  };
  const dirty = JSON.stringify(cfg) !== pub;
  const publish = async () => {
    setBusy(true);
    try {
      await B.engine.saveConfig(rest.slug, cfg);
      setPub(JSON.stringify(cfg));
      setToast('Publicado! Sua página já está atualizada.');
    } catch (e) {
      setToast('Não foi possível publicar: ' + e.message);
    }
    setBusy(false);
  };
  const t = K.resolveTheme(full);
  const sub = nav.sub;
  let panel;
  if (nav.panel === 'page' && sub?.kind === 'profile') panel = React.createElement(ProfileEditor, {
    s: s
  });else if (nav.panel === 'page' && sub?.kind === 'social') panel = React.createElement(SocialEditor, {
    s: s
  });else if (nav.panel === 'page' && sub?.kind === 'add-link') panel = React.createElement(AddLinkPicker, {
    s: s
  });else if (nav.panel === 'page' && sub?.kind === 'block') panel = React.createElement(BlockEditor, {
    s: s,
    id: sub.id
  });else if (nav.panel === 'offers') panel = React.createElement(OffersPanel, {
    s: s
  });else if (nav.panel === 'style') panel = React.createElement(StylePanel, {
    s: s
  });else if (nav.panel === 'data') panel = React.createElement(DataPanel, {
    s: s
  });else if (nav.panel === 'share') panel = React.createElement(SharePanel, {
    s: s
  });else if (nav.panel === 'settings') panel = React.createElement(SettingsPanel, {
    s: s
  });else panel = React.createElement(PagePanel, {
    s: s
  });
  const stepsLeft = K.steps(full).filter(x => !x.done).length;
  return React.createElement("div", {
    className: "st",
    "data-screen-label": nav.panel
  }, React.createElement("nav", {
    className: "st-rail"
  }, React.createElement("div", {
    className: "st-brand img",
    title: "Assessoria Kurtz"
  }), RAIL.map(([id, label]) => React.createElement("button", {
    key: id,
    className: 'st-rb' + (nav.panel === id ? ' on' : ''),
    onClick: () => s.go({
      panel: id
    }),
    "aria-label": label
  }, React.createElement(RailIcon, {
    id: id
  }), React.createElement("span", {
    className: "tip"
  }, label), id === 'page' && stepsLeft && !cfg.meta?.onboardingHidden ? React.createElement("span", {
    className: "badge"
  }) : null)), React.createElement("div", {
    className: "st-sp"
  }), React.createElement(UiToggle, {
    rail: true
  }), React.createElement("button", {
    className: 'st-rb' + (nav.panel === 'settings' ? ' on' : ''),
    onClick: () => s.go({
      panel: 'settings'
    }),
    "aria-label": "Configura\xE7\xF5es"
  }, React.createElement(RailIcon, {
    id: "settings"
  }), React.createElement("span", {
    className: "tip"
  }, "Configura\xE7\xF5es"))), React.createElement("main", {
    className: "st-main",
    ref: mainRef
  }, B.mode === 'local' ? React.createElement("div", {
    className: "st-demo-bar top"
  }, "Modo demonstra\xE7\xE3o \u2014 tudo fica salvo s\xF3 neste navegador. Em useklinks.com usa o banco de dados real.") : null, panel), React.createElement("section", {
    className: 'st-pv' + (pvOpen ? ' open' : '')
  }, React.createElement("div", {
    className: "st-glow",
    style: {
      background: `radial-gradient(60% 50% at 50% 30%, ${t.accent}55, transparent 70%)`
    }
  }), React.createElement("div", {
    className: "st-pvbar"
  }, pvOpen ? React.createElement("button", {
    className: "st-btn sm",
    onClick: () => setPvOpen(false)
  }, "Fechar") : null, React.createElement("div", {
    className: "st-url",
    title: s.shareUrl
  }, dirty ? React.createElement("span", {
    className: "st-dirty"
  }, React.createElement("i", null), "N\xE3o publicado") : React.createElement("span", null, "P\xE1gina publicada"), React.createElement("a", {
    href: s.publicUrl,
    target: "_blank",
    rel: "noopener"
  }, s.prettyUrl)), React.createElement("button", {
    className: "st-btn sm pri",
    disabled: !dirty || busy,
    onClick: publish
  }, busy ? 'Publicando…' : dirty ? 'Publicar' : 'Publicado'), React.createElement("button", {
    className: "st-btn sm light",
    onClick: () => {
      setPvOpen(false);
      s.go({
        panel: 'share'
      });
    }
  }, "Compartilhar")), React.createElement("div", {
    className: "st-phone"
  }, React.createElement("div", {
    className: "st-phone-s"
  }, React.createElement(BioPage, {
    cfg: full,
    preview: true
  })))), React.createElement("div", {
    className: "st-mob"
  }, React.createElement("button", {
    className: "st-btn pri",
    onClick: () => setPvOpen(true)
  }, "Ver p\xE1gina", dirty ? ' · publicar' : '')), toast ? React.createElement("div", {
    className: "st-toast"
  }, React.createElement(SI, {
    n: "check",
    size: 16,
    sw: 3
  }), toast) : null);
}
window.Studio = Studio;