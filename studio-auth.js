function useSlugCheck(slug) {
  const B = window.KlinksBackend;
  const [st, setSt] = React.useState({
    state: 'idle'
  });
  React.useEffect(() => {
    if (!slug) {
      setSt({
        state: 'idle'
      });
      return;
    }
    if (!B.validSlug(slug)) {
      setSt({
        state: 'bad',
        msg: slug.length < 3 ? 'Mínimo de 3 letras.' : 'Esse endereço é reservado ou inválido.'
      });
      return;
    }
    setSt({
      state: 'checking'
    });
    let on = true;
    const t = setTimeout(() => B.engine.slugAvailable(slug).then(ok => on && setSt(ok ? {
      state: 'ok'
    } : {
      state: 'taken',
      msg: 'Já existe uma página com esse endereço.'
    })).catch(e => on && setSt({
      state: 'bad',
      msg: e.message
    })), 350);
    return () => {
      on = false;
      clearTimeout(t);
    };
  }, [slug]);
  return st;
}
function SlugField({
  slug,
  setSlug,
  check
}) {
  const B = window.KlinksBackend;
  const base = B.prettyUrl('').replace(/\/$/, '');
  const color = check.state === 'ok' ? 'var(--s-ok)' : check.state === 'taken' || check.state === 'bad' ? '#ff8a80' : 'var(--s-mut)';
  return React.createElement(SField, {
    label: "Endere\xE7o da sua p\xE1gina",
    hint: React.createElement("span", {
      style: {
        color
      }
    }, check.state === 'ok' ? '✓ Disponível' : check.state === 'checking' ? 'Verificando…' : check.msg || 'Só letras, números e hífen.')
  }, React.createElement("div", {
    className: "st-pre"
  }, React.createElement("span", null, base + '/'), React.createElement(SInput, {
    value: slug,
    onChange: v => setSlug(B.slugify(v)),
    autoCapitalize: "none",
    autoCorrect: "off",
    spellCheck: "false"
  })));
}
function SegmentPick({
  value,
  onChange
}) {
  return React.createElement(SField, {
    label: "Tipo de neg\xF3cio",
    hint: "J\xE1 montamos a p\xE1gina com tema, oferta e bot\xF5es certos para o seu tipo."
  }, React.createElement("div", {
    className: "st-chips"
  }, window.KStudio.SEGMENTS.map(s => React.createElement("button", {
    type: "button",
    key: s.id,
    className: 'st-chip pad' + (value === s.id ? ' on' : ''),
    onClick: () => onChange(s.id)
  }, s.name))));
}
function AuthShell({
  children,
  preview,
  previewLabel
}) {
  return React.createElement("div", {
    className: "st-auth"
  }, React.createElement("div", {
    className: "st-auth-l"
  }, React.createElement("div", {
    className: "st-auth-top"
  }, React.createElement("div", {
    className: "st-brand img"
  }), React.createElement("b", null, "KLINKS"), React.createElement("span", null, "por Assessoria Kurtz"), React.createElement("div", {
    style: {
      flex: 1
    }
  }), React.createElement(UiToggle, null)), React.createElement("div", {
    className: "st-auth-form"
  }, children), window.KlinksBackend.mode === 'local' ? React.createElement("div", {
    className: "st-demo-bar"
  }, "Modo demonstra\xE7\xE3o \u2014 contas e p\xE1ginas ficam s\xF3 neste navegador.") : null), React.createElement("div", {
    className: "st-auth-r"
  }, previewLabel ? React.createElement("div", {
    className: "st-auth-tag"
  }, previewLabel) : null, preview ? React.createElement("div", {
    className: "st-phone st-auth-phone"
  }, React.createElement("div", {
    className: "st-phone-s"
  }, React.createElement(BioPage, {
    cfg: preview,
    preview: true
  }))) : null));
}
function AuthScreen({
  initial,
  onAuthed
}) {
  const B = window.KlinksBackend,
    K = window.KStudio;
  const [tab, setTab] = React.useState(initial || 'signup');
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [touchedSlug, setTouched] = React.useState(false);
  const [segment, setSegment] = React.useState('pizzaria');
  const [wa, setWa] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [agree, setAgree] = React.useState(true);
  const [step, setStep] = React.useState(1);
  const [err, setErr] = React.useState('');
  const [info, setInfo] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const check = useSlugCheck(tab === 'signup' ? slug : '');
  React.useEffect(() => {
    if (!touchedSlug) setSlug(B.slugify(name));
  }, [name]);
  const [showcase, setShowcase] = React.useState(null);
  const [touched, setTouchedForm] = React.useState(false);
  React.useEffect(() => {
    const sc = window.KLINKS_SHOWCASE_SLUG;
    if (!sc) return;
    B.init().then(() => B.engine.loadPublic(sc)).then(r => {
      if (r) setShowcase({
        ...K.DEFAULT,
        ...(K.migrateLegacy(r.config) || {}),
        slug: r.slug
      });
    }).catch(() => {});
  }, []);
  React.useEffect(() => {
    if (name.trim() || segment !== 'pizzaria') setTouchedForm(true);
  }, [name, segment]);
  const built = React.useMemo(() => K.buildConfig({
    name: name || 'Seu restaurante',
    slug: slug || 'seu-restaurante',
    segment,
    whatsapp: wa
  }), [name, slug, segment, wa]);
  const useShow = showcase && !touched;
  const preview = useShow ? showcase : built;
  const doSignup = async e => {
    e.preventDefault();
    setErr('');
    setInfo('');
    if (step === 1) {
      if (!name.trim()) return setErr('Digite o nome do restaurante.');
      if (check.state !== 'ok') return setErr(check.msg || 'Escolha um endereço disponível.');
      setStep(2);
      return;
    }
    if (!agree) return setErr('Aceite os termos para continuar.');
    setBusy(true);
    try {
      const r = await B.engine.signUp(email.trim(), pw);
      if (r.needsConfirm) {
        localStorage.setItem('klinks_pending', JSON.stringify({
          name,
          slug,
          segment,
          wa
        }));
        setInfo('Enviamos um link de confirmação para ' + email + '. Abra o e-mail, confirme e depois entre aqui — sua página será criada automaticamente.');
        setTab('login');
        setBusy(false);
        return;
      }
      await B.engine.createRestaurant(slug, K.buildConfig({
        name: name.trim(),
        slug,
        segment,
        whatsapp: wa
      }));
      onAuthed();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };
  const doLogin = async e => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await B.engine.signIn(email.trim(), pw);
      onAuthed();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };
  const doReset = async () => {
    if (!email) return setErr('Digite seu e-mail acima primeiro.');
    setBusy(true);
    try {
      await B.engine.resetPassword(email.trim());
      setInfo('Se esse e-mail tiver conta, enviamos um link para criar uma nova senha.');
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };
  if (tab === 'login') return React.createElement(AuthShell, null, React.createElement("form", {
    onSubmit: doLogin
  }, React.createElement("h1", {
    className: "st-h1"
  }, "Entrar"), React.createElement("p", {
    className: "st-lead"
  }, "Edite sua p\xE1gina, suas ofertas e veja quem visitou."), info ? React.createElement("div", {
    className: "st-ok"
  }, info) : null, err ? React.createElement("div", {
    className: "st-err"
  }, err) : null, React.createElement(SField, {
    label: "E-mail"
  }, React.createElement(SInput, {
    type: "email",
    value: email,
    onChange: setEmail,
    required: true,
    autoComplete: "email"
  })), React.createElement(SField, {
    label: "Senha"
  }, React.createElement(SInput, {
    type: "password",
    value: pw,
    onChange: setPw,
    required: true,
    autoComplete: "current-password"
  })), React.createElement("button", {
    className: "st-btn pri full",
    disabled: busy
  }, busy ? 'Entrando…' : 'Entrar'), React.createElement("div", {
    className: "st-auth-links"
  }, React.createElement("button", {
    type: "button",
    onClick: doReset
  }, "Esqueci minha senha"), React.createElement("button", {
    type: "button",
    onClick: () => {
      setTab('signup');
      setErr('');
      setInfo('');
    }
  }, "Criar conta"))));
  return React.createElement(AuthShell, {
    preview: preview,
    previewLabel: useShow ? 'Exemplo real · ' + showcase.profile.name : touched ? 'Prévia da sua página' : null
  }, React.createElement("form", {
    onSubmit: doSignup
  }, React.createElement("div", {
    className: "st-stepper"
  }, React.createElement("span", {
    className: step >= 1 ? 'on' : ''
  }, "1 \xB7 Sua p\xE1gina"), React.createElement("span", {
    className: step >= 2 ? 'on' : ''
  }, "2 \xB7 Sua conta")), React.createElement("h1", {
    className: "st-h1"
  }, step === 1 ? 'Crie a página do seu restaurante' : 'Quase lá'), React.createElement("p", {
    className: "st-lead"
  }, step === 1 ? 'Pronta em 2 minutos. Um link para a bio do Instagram com delivery, WhatsApp, ofertas e mapa.' : 'Com essa conta você entra para editar sua página de qualquer celular.'), err ? React.createElement("div", {
    className: "st-err"
  }, err) : null, step === 1 ? React.createElement(React.Fragment, null, React.createElement(SField, {
    label: "Nome do restaurante"
  }, React.createElement(SInput, {
    value: name,
    onChange: setName,
    placeholder: "Ex.: Pinerolo Pizzaria",
    maxLength: 40,
    autoFocus: true
  })), React.createElement(SlugField, {
    slug: slug,
    setSlug: v => {
      setTouched(true);
      setSlug(v);
    },
    check: check
  }), React.createElement(SegmentPick, {
    value: segment,
    onChange: setSegment
  }), React.createElement("button", {
    className: "st-btn pri full",
    disabled: check.state === 'checking'
  }, "Continuar")) : React.createElement(React.Fragment, null, React.createElement(SField, {
    label: "WhatsApp do restaurante",
    hint: "Vira o bot\xE3o \u201CChamar no WhatsApp\u201D. Com DDD."
  }, React.createElement("div", {
    className: "st-pre"
  }, React.createElement("span", null, "+55"), React.createElement(SInput, {
    value: wa,
    onChange: v => setWa(v.replace(/\D/g, '')),
    inputMode: "numeric",
    placeholder: "47992000820"
  }))), React.createElement(SField, {
    label: "Seu e-mail"
  }, React.createElement(SInput, {
    type: "email",
    value: email,
    onChange: setEmail,
    required: true,
    autoComplete: "email"
  })), React.createElement(SField, {
    label: "Crie uma senha",
    hint: "M\xEDnimo de 6 caracteres."
  }, React.createElement(SInput, {
    type: "password",
    value: pw,
    onChange: setPw,
    required: true,
    minLength: 6,
    autoComplete: "new-password"
  })), React.createElement("label", {
    className: "st-check"
  }, React.createElement("input", {
    type: "checkbox",
    checked: agree,
    onChange: e => setAgree(e.target.checked)
  }), "Li e aceito os termos de uso e a pol\xEDtica de privacidade."), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, React.createElement("button", {
    type: "button",
    className: "st-btn",
    onClick: () => setStep(1)
  }, "Voltar"), React.createElement("button", {
    className: "st-btn pri",
    style: {
      flex: 1
    },
    disabled: busy
  }, busy ? 'Criando sua página…' : 'Criar minha página'))), React.createElement("div", {
    className: "st-auth-links"
  }, React.createElement("span", null), React.createElement("button", {
    type: "button",
    onClick: () => {
      setTab('login');
      setErr('');
    }
  }, "J\xE1 tenho conta \u2014 entrar"))));
}
function CreatePage({
  user,
  onCreated,
  onSignOut
}) {
  const B = window.KlinksBackend,
    K = window.KStudio;
  const pend = (() => {
    try {
      return JSON.parse(localStorage.getItem('klinks_pending') || 'null');
    } catch (e) {
      return null;
    }
  })() || {};
  const [name, setName] = React.useState(pend.name || '');
  const [slug, setSlug] = React.useState(pend.slug || '');
  const [segment, setSegment] = React.useState(pend.segment || 'pizzaria');
  const [wa, setWa] = React.useState(pend.wa || '');
  const [err, setErr] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const check = useSlugCheck(slug);
  const [showcase, setShowcase] = React.useState(null);
  const [touched, setTouchedForm] = React.useState(false);
  React.useEffect(() => {
    const sc = window.KLINKS_SHOWCASE_SLUG;
    if (!sc) return;
    B.init().then(() => B.engine.loadPublic(sc)).then(r => {
      if (r) setShowcase({
        ...K.DEFAULT,
        ...(K.migrateLegacy(r.config) || {}),
        slug: r.slug
      });
    }).catch(() => {});
  }, []);
  React.useEffect(() => {
    if (name.trim() || segment !== 'pizzaria') setTouchedForm(true);
  }, [name, segment]);
  const built = React.useMemo(() => K.buildConfig({
    name: name || 'Seu restaurante',
    slug: slug || 'seu-restaurante',
    segment,
    whatsapp: wa
  }), [name, slug, segment, wa]);
  const useShow = showcase && !touched;
  const preview = useShow ? showcase : built;
  const submit = async e => {
    e.preventDefault();
    setErr('');
    if (!name.trim()) return setErr('Digite o nome do restaurante.');
    if (check.state !== 'ok') return setErr(check.msg || 'Escolha um endereço disponível.');
    setBusy(true);
    try {
      await B.engine.createRestaurant(slug, K.buildConfig({
        name: name.trim(),
        slug,
        segment,
        whatsapp: wa
      }));
      localStorage.removeItem('klinks_pending');
      onCreated();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };
  return React.createElement(AuthShell, {
    preview: preview,
    previewLabel: useShow ? 'Exemplo real · ' + showcase.profile.name : touched ? 'Prévia da sua página' : null
  }, React.createElement("form", {
    onSubmit: submit
  }, React.createElement("h1", {
    className: "st-h1"
  }, "Crie sua p\xE1gina"), React.createElement("p", {
    className: "st-lead"
  }, "Conta: ", React.createElement("b", null, user.email)), err ? React.createElement("div", {
    className: "st-err"
  }, err) : null, React.createElement(SField, {
    label: "Nome do restaurante"
  }, React.createElement(SInput, {
    value: name,
    onChange: v => {
      setName(v);
      setSlug(B.slugify(v));
    },
    maxLength: 40
  })), React.createElement(SlugField, {
    slug: slug,
    setSlug: setSlug,
    check: check
  }), React.createElement(SegmentPick, {
    value: segment,
    onChange: setSegment
  }), React.createElement(SField, {
    label: "WhatsApp do restaurante"
  }, React.createElement("div", {
    className: "st-pre"
  }, React.createElement("span", null, "+55"), React.createElement(SInput, {
    value: wa,
    onChange: v => setWa(v.replace(/\D/g, '')),
    inputMode: "numeric"
  }))), React.createElement("button", {
    className: "st-btn pri full",
    disabled: busy
  }, busy ? 'Criando…' : 'Criar minha página'), React.createElement("div", {
    className: "st-auth-links"
  }, React.createElement("span", null), React.createElement("button", {
    type: "button",
    onClick: onSignOut
  }, "Sair"))));
}
function NewPasswordScreen({
  onDone
}) {
  const B = window.KlinksBackend;
  const [pw, setPw] = React.useState(''),
    [pw2, setPw2] = React.useState('');
  const [busy, setBusy] = React.useState(false),
    [err, setErr] = React.useState('');
  const go = async e => {
    e.preventDefault();
    setErr('');
    if (pw.length < 6) return setErr('A senha precisa ter pelo menos 6 caracteres.');
    if (pw !== pw2) return setErr('As duas senhas não são iguais.');
    setBusy(true);
    try {
      await B.engine.updatePassword(pw);
      onDone();
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };
  return React.createElement(AuthShell, null, React.createElement("form", {
    onSubmit: go
  }, React.createElement("h1", {
    className: "st-h1"
  }, "Crie sua nova senha"), React.createElement("p", {
    className: "st-lead",
    style: {
      marginBottom: 20
    }
  }, "Escolha uma senha que voc\xEA n\xE3o usa em outros sites."), err ? React.createElement("div", {
    className: "st-err"
  }, err) : null, React.createElement(SField, {
    label: "Nova senha",
    hint: "M\xEDnimo de 6 caracteres."
  }, React.createElement(SInput, {
    type: "password",
    value: pw,
    onChange: setPw,
    required: true,
    autoComplete: "new-password"
  })), React.createElement(SField, {
    label: "Repita a nova senha"
  }, React.createElement(SInput, {
    type: "password",
    value: pw2,
    onChange: setPw2,
    required: true,
    autoComplete: "new-password"
  })), React.createElement("button", {
    className: "st-btn pri full",
    disabled: busy
  }, busy ? 'Salvando…' : 'Salvar e entrar')));
}
function useUiTheme() {
  const [ui, setUi] = React.useState(() => localStorage.getItem('klinks_ui') || 'dark');
  React.useEffect(() => {
    document.documentElement.dataset.ui = ui;
    localStorage.setItem('klinks_ui', ui);
    window.dispatchEvent(new CustomEvent('klinksui', {
      detail: ui
    }));
  }, [ui]);
  React.useEffect(() => {
    const h = e => setUi(e.detail);
    window.addEventListener('klinksui', h);
    return () => window.removeEventListener('klinksui', h);
  }, []);
  return [ui, setUi];
}
function UiToggle({
  rail
}) {
  const [ui, setUi] = useUiTheme();
  const next = ui === 'dark' ? 'light' : 'dark';
  const icon = ui === 'dark' ? React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round"
  }, React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "4"
  }), React.createElement("path", {
    d: "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
  })) : React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, React.createElement("path", {
    d: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"
  }));
  if (rail) return React.createElement("button", {
    className: "st-rb",
    onClick: () => setUi(next),
    "aria-label": next === 'light' ? 'Modo claro' : 'Modo escuro'
  }, icon, React.createElement("span", {
    className: "tip"
  }, next === 'light' ? 'Modo claro' : 'Modo escuro'));
  return React.createElement("button", {
    type: "button",
    className: "st-btn sm",
    onClick: () => setUi(next)
  }, icon, next === 'light' ? 'Claro' : 'Escuro');
}
Object.assign(window, {
  AuthScreen,
  CreatePage,
  NewPasswordScreen,
  UiToggle,
  useUiTheme
});