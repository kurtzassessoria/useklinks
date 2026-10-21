function AdminHome({
  user,
  onOpen,
  onSignOut
}) {
  const B = window.KlinksBackend,
    K = window.KStudio;
  const [rows, setRows] = React.useState(null),
    [err, setErr] = React.useState('');
  const [q, setQ] = React.useState(''),
    [creating, setCreating] = React.useState(false),
    [copied, setCopied] = React.useState('');
  const load = () => B.engine.adminList().then(r => setRows(r || [])).catch(e => {
    setErr(e.message);
    setRows([]);
  });
  React.useEffect(() => {
    load();
  }, []);
  const list = (rows || []).filter(r => !q || (r.name + ' ' + r.slug + ' ' + (r.owner_email || '')).toLowerCase().includes(q.toLowerCase()));
  const msg = r => `Oi! A página da ${r.name || r.slug} no KLINKS está pronta 🎉\n\n👉 ${B.prettyUrl(r.slug)}\n\nPara editar fotos, ofertas e horários pelo celular, faça o primeiro acesso aqui:\n${B.prettyUrl('entrar?primeiro=1')}\n\nUse o e-mail ${r.owner_email || '[SEU E-MAIL]'} e crie sua senha. Vai chegar um e-mail do KLINKS para confirmar: é só tocar em “Confirmar meu e-mail”.`;
  const copy = r => {
    navigator.clipboard?.writeText(msg(r));
    setCopied(r.slug);
    setTimeout(() => setCopied(''), 1500);
  };
  return React.createElement("div", {
    className: "st-adm"
  }, React.createElement("div", {
    className: "st-adm-top"
  }, React.createElement("div", {
    className: "st-brand img"
  }), React.createElement("b", null, "KLINKS"), React.createElement("span", {
    className: "st-lock st-pro"
  }, "ADM"), React.createElement("div", {
    style: {
      flex: 1
    }
  }), React.createElement("span", {
    className: "st-adm-me"
  }, user?.email), React.createElement(UiToggle, null), React.createElement("button", {
    className: "st-btn sm",
    onClick: onSignOut
  }, "Sair")), React.createElement("div", {
    className: "st-col",
    style: {
      maxWidth: 820,
      margin: '0 auto'
    }
  }, React.createElement("h1", {
    className: "st-h1"
  }, "Clientes"), React.createElement("p", {
    className: "st-lead"
  }, "Crie e edite a p\xE1gina de qualquer cliente sem criar login para ele. Quando estiver pronta, mande a mensagem de primeiro acesso: o cliente confirma o pr\xF3prio e-mail e a p\xE1gina passa a ser dele."), err ? React.createElement("div", {
    className: "st-err",
    style: {
      marginTop: 14
    }
  }, err) : null, React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 18,
      flexWrap: 'wrap'
    }
  }, React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 220
    }
  }, React.createElement(SInput, {
    value: q,
    onChange: setQ,
    placeholder: "Buscar por nome, endere\xE7o ou e-mail"
  })), React.createElement("button", {
    className: "st-btn pri",
    onClick: () => setCreating(!creating)
  }, creating ? 'Fechar' : '+ Novo cliente')), creating ? React.createElement(AdminNewClient, {
    onCreated: slug => {
      setCreating(false);
      onOpen(slug);
    }
  }) : null, React.createElement(AdminCodes, null), React.createElement("div", {
    className: "st-sec"
  }, React.createElement("span", null, rows ? list.length + (list.length === 1 ? ' página' : ' páginas') : 'Carregando…')), React.createElement("div", {
    className: "st-list"
  }, list.map(r => React.createElement("div", {
    key: r.slug,
    className: "st-adm-row"
  }, React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("b", null, r.name || r.slug), React.createElement("span", null, B.prettyUrl(r.slug), " \xB7 ", r.plan_until ? React.createElement("em", {
    className: new Date(r.plan_until) < new Date() ? 'warn' : new Date(r.plan_until) - new Date() < 7 * 864e5 ? 'warn' : ''
  }, new Date(r.plan_until) < new Date() ? 'Vencido em ' : 'Vence ', new Date(r.plan_until).toLocaleDateString('pt-BR')) : null, r.plan_until ? ' · ' : '', r.claimed ? React.createElement("em", {
    className: "ok"
  }, "Dono ativo") : r.owner_email ? React.createElement("em", null, "Aguardando 1\xBA acesso \xB7 ", r.owner_email) : React.createElement("em", {
    className: "warn"
  }, "Sem e-mail do dono"))), React.createElement("div", {
    className: "st-adm-act"
  }, React.createElement("button", {
    className: "st-btn sm pri",
    onClick: () => onOpen(r.slug)
  }, "Editar"), React.createElement("a", {
    className: "st-btn sm",
    style: {
      textDecoration: 'none'
    },
    href: B.liveUrl(r.slug),
    target: "_blank",
    rel: "noopener"
  }, "Ver"), React.createElement("a", {
    className: "st-btn sm",
    style: {
      textDecoration: 'none'
    },
    href: '/plaquinha?s=' + encodeURIComponent(r.slug),
    target: "_blank",
    rel: "noopener"
  }, "Plaquinha"), !r.claimed ? React.createElement("button", {
    className: "st-btn sm",
    onClick: () => copy(r)
  }, copied === r.slug ? 'Copiado!' : 'Msg. 1º acesso') : null, React.createElement("button", {
    className: "st-btn sm",
    onClick: async () => {
      const p = prompt('Renovar a assinatura de ' + (r.name || r.slug) + '.\nDigite o plano pago: mensal, trimestral ou anual', 'trimestral');
      if (p == null) return;
      const pl = p.trim().toLowerCase();
      if (!['mensal', 'trimestral', 'anual'].includes(pl)) return alert('Plano inválido.');
      try {
        const u = await B.engine.adminExtend(r.slug, pl);
        alert('Renovado até ' + new Date(u).toLocaleDateString('pt-BR') + '.');
        load();
      } catch (x) {
        alert(x.message);
      }
    }
  }, "Renovar"), React.createElement("button", {
    className: "st-btn sm danger",
    title: "Excluir p\xE1gina",
    onClick: async () => {
      const v = prompt('Excluir a página "' + (r.name || r.slug) + '" com todas as visitas, cliques e contatos? Não dá para desfazer.\n\nPara confirmar, digite o endereço: ' + r.slug);
      if (v == null) return;
      if (v.trim().toLowerCase() !== r.slug) return alert('Endereço diferente. Nada foi excluído.');
      try {
        await B.engine.adminDelete(r.slug);
        localStorage.removeItem('klinks_draft_' + r.slug);
        load();
      } catch (x) {
        alert(x.message);
      }
    }
  }, "Excluir"), !r.claimed ? React.createElement("button", {
    className: "st-btn sm",
    onClick: async () => {
      const e = prompt('E-mail do dono (é com ele que o cliente faz o primeiro acesso):', r.owner_email || '');
      if (e == null) return;
      try {
        await B.engine.adminSetEmail(r.slug, e.trim());
        load();
      } catch (x) {
        alert(x.message);
      }
    }
  }, "E-mail") : null))), rows && !list.length ? React.createElement("div", {
    className: "st-card",
    style: {
      color: 'var(--s-mut)',
      fontSize: 14
    }
  }, q ? 'Nada encontrado.' : 'Nenhuma página ainda. Crie a primeira em “Novo cliente”.') : null)));
}
function AdminNewClient({
  onCreated
}) {
  const B = window.KlinksBackend,
    K = window.KStudio;
  const [name, setName] = React.useState(''),
    [slug, setSlug] = React.useState(''),
    [touched, setTouched] = React.useState(false);
  const [segment, setSegment] = React.useState('pizzaria'),
    [wa, setWa] = React.useState(''),
    [email, setEmail] = React.useState('');
  const [busy, setBusy] = React.useState(false),
    [err, setErr] = React.useState(''),
    [plan, setPlan] = React.useState('trimestral');
  const check = useSlugCheck(slug);
  React.useEffect(() => {
    if (!touched) setSlug(B.slugify(name));
  }, [name]);
  const go = async e => {
    e.preventDefault();
    setErr('');
    if (!name.trim()) return setErr('Digite o nome do restaurante.');
    if (check.state !== 'ok') return setErr(check.msg || 'Escolha um endereço disponível.');
    if (email && !/^\S+@\S+\.\S+$/.test(email.trim())) return setErr('E-mail inválido.');
    setBusy(true);
    try {
      await B.engine.adminCreate(slug, email.trim().toLowerCase(), K.buildConfig({
        name: name.trim(),
        slug,
        segment,
        whatsapp: wa
      }));
      if (plan) await B.engine.adminExtend(slug, plan);
      onCreated(slug);
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };
  return React.createElement("form", {
    className: "st-card",
    style: {
      marginTop: 14
    },
    onSubmit: go
  }, React.createElement("b", {
    style: {
      fontSize: 16
    }
  }, "Novo cliente"), React.createElement("p", {
    className: "st-lead",
    style: {
      margin: '4px 0 16px'
    }
  }, "Nenhum e-mail \xE9 enviado agora. O cliente s\xF3 recebe a confirma\xE7\xE3o quando fizer o primeiro acesso."), err ? React.createElement("div", {
    className: "st-err"
  }, err) : null, React.createElement(SField, {
    label: "Nome do restaurante"
  }, React.createElement(SInput, {
    value: name,
    onChange: setName,
    placeholder: "Ex.: Dom Gourmet",
    maxLength: 40
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
  }), React.createElement("div", {
    className: "st-two"
  }, React.createElement(SField, {
    label: "WhatsApp do restaurante"
  }, React.createElement("div", {
    className: "st-pre"
  }, React.createElement("span", null, "+55"), React.createElement(SInput, {
    value: wa,
    onChange: v => setWa(v.replace(/\D/g, '')),
    inputMode: "numeric",
    placeholder: "47992000820"
  }))), React.createElement(SField, {
    label: "E-mail do dono",
    hint: "Pode deixar para depois."
  }, React.createElement(SInput, {
    type: "email",
    value: email,
    onChange: setEmail,
    placeholder: "dono@restaurante.com"
  }))), React.createElement(SField, {
    label: "Plano pago",
    hint: "Define o vencimento. \u201CCortesia\u201D n\xE3o vence (clientes da Kurtz)."
  }, React.createElement("div", {
    className: "st-chips"
  }, [['mensal', 'Mensal'], ['trimestral', 'Trimestral'], ['anual', 'Anual'], ['', 'Cortesia']].map(([v, l]) => React.createElement("button", {
    type: "button",
    key: l,
    className: 'st-chip' + (plan === v ? ' on' : ''),
    onClick: () => setPlan(v)
  }, l)))), React.createElement("button", {
    className: "st-btn pri full",
    disabled: busy || check.state === 'checking'
  }, busy ? 'Criando…' : 'Criar e começar a editar'));
}
const PLAN_LBL = {
  mensal: 'Mensal · R$ 29,90',
  trimestral: 'Trimestral · R$ 69,97',
  anual: 'Anual · R$ 289,90'
};
function AdminCodes() {
  const B = window.KlinksBackend;
  const [rows, setRows] = React.useState(null),
    [open, setOpen] = React.useState(false),
    [all, setAll] = React.useState(false);
  const [plan, setPlan] = React.useState('trimestral'),
    [kurtz, setKurtz] = React.useState(false),
    [note, setNote] = React.useState('');
  const [busy, setBusy] = React.useState(false),
    [err, setErr] = React.useState(''),
    [copied, setCopied] = React.useState('');
  const load = () => B.engine.adminCodes().then(r => setRows(r || [])).catch(e => {
    setErr(e.message);
    setRows([]);
  });
  React.useEffect(() => {
    load();
  }, []);
  const msg = c => c.kurtz ? `Pagamento confirmado! ✅ Bem-vindo ao KLINKS.\n\nVocê escolheu a montagem pela Kurtz, então eu monto sua página. Me manda aqui:\n1. Logo\n2. 1 foto para a capa e a foto da promoção\n3. Os 3 mais vendidos (nome, preço e foto)\n4. Horário de funcionamento\n5. Seu e-mail\n\nEm até 24h te devolvo pronta.` : `Pagamento confirmado! ✅ Bem-vindo ao KLINKS.\n\nSeu código de acesso: *${c.code}*\n\nCrie sua página aqui (leva 2 minutos):\n👉 useklinks.com/cadastro?codigo=${c.code}\n\nQualquer dúvida, é só chamar.`;
  const copy = c => {
    navigator.clipboard?.writeText(msg(c));
    setCopied(c.code);
    setTimeout(() => setCopied(''), 1500);
  };
  const gen = async e => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const c = await B.engine.adminNewCode(plan, kurtz, note);
      setNote('');
      setKurtz(false);
      await load();
      copy({
        code: c,
        kurtz
      });
    } catch (x) {
      setErr(x.message);
    }
    setBusy(false);
  };
  const free = (rows || []).filter(r => !r.used_at).length;
  const list = all ? rows || [] : (rows || []).slice(0, 6);
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "st-sec"
  }, React.createElement("span", null, "C\xF3digos de acesso", rows ? ' · ' + free + ' livre' + (free === 1 ? '' : 's') : '')), React.createElement("div", {
    className: "st-card"
  }, React.createElement("p", {
    className: "st-lead",
    style: {
      margin: '0 0 12px'
    }
  }, "O cadastro s\xF3 abre com c\xF3digo. Pagamento confirmado na Cakto \u2192 gere o c\xF3digo aqui \u2192 a mensagem do WhatsApp j\xE1 \xE9 copiada com o link."), err ? React.createElement("div", {
    className: "st-err"
  }, err) : null, open ? React.createElement("form", {
    onSubmit: gen,
    style: {
      marginBottom: 14
    }
  }, React.createElement(SField, {
    label: "Plano pago"
  }, React.createElement("div", {
    className: "st-chips"
  }, Object.keys(PLAN_LBL).map(p => React.createElement("button", {
    type: "button",
    key: p,
    className: 'st-chip' + (plan === p ? ' on' : ''),
    onClick: () => setPlan(p)
  }, PLAN_LBL[p])))), React.createElement(SField, {
    label: "Cliente (s\xF3 para voc\xEA)"
  }, React.createElement(SInput, {
    value: note,
    onChange: setNote,
    placeholder: "Ex.: Pizzaria do Z\xE9 \xB7 (47) 99999-0000",
    maxLength: 80
  })), React.createElement("label", {
    className: "st-check",
    style: {
      marginBottom: 12
    }
  }, React.createElement("input", {
    type: "checkbox",
    checked: kurtz,
    onChange: e => setKurtz(e.target.checked)
  }), "Comprou a montagem Kurtz (R$ 9,90) \u2014 eu monto a p\xE1gina"), React.createElement("button", {
    className: "st-btn pri",
    disabled: busy
  }, busy ? 'Gerando…' : 'Gerar código e copiar mensagem')) : React.createElement("button", {
    className: "st-btn sm pri",
    style: {
      marginBottom: 12
    },
    onClick: () => setOpen(true)
  }, "+ Gerar c\xF3digo"), React.createElement("div", {
    className: "st-list"
  }, list.map(c => React.createElement("div", {
    key: c.code,
    className: "st-adm-row"
  }, React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("b", {
    style: {
      letterSpacing: '.06em'
    }
  }, c.code), React.createElement("span", null, (PLAN_LBL[c.plan] || c.plan).split(' · ')[0], c.kurtz ? ' + montagem' : '', c.note ? ' · ' + c.note : '', " \xB7 ", c.used_at ? React.createElement("em", {
    className: "ok"
  }, "Usado \xB7 ", c.used_slug) : React.createElement("em", null, "Livre"))), React.createElement("div", {
    className: "st-adm-act"
  }, !c.used_at ? React.createElement(React.Fragment, null, React.createElement("button", {
    className: "st-btn sm",
    onClick: () => copy(c)
  }, copied === c.code ? 'Copiado!' : 'Copiar msg.'), React.createElement("button", {
    className: "st-btn sm danger",
    onClick: async () => {
      if (confirm('Apagar o código ' + c.code + '?')) {
        await B.engine.adminDeleteCode(c.code);
        load();
      }
    }
  }, "\xD7")) : null))), rows && !rows.length ? React.createElement("span", {
    style: {
      color: 'var(--s-mut)',
      fontSize: 14
    }
  }, "Nenhum c\xF3digo gerado ainda.") : null, rows && rows.length > 6 ? React.createElement("button", {
    className: "st-btn sm",
    onClick: () => setAll(!all)
  }, all ? 'Ver menos' : 'Ver todos (' + rows.length + ')') : null)));
}
Object.assign(window, {
  AdminHome,
  AdminNewClient,
  AdminCodes
});