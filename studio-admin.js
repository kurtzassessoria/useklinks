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
  }) : null, React.createElement("div", {
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
  }, React.createElement("b", null, r.name || r.slug), React.createElement("span", null, B.prettyUrl(r.slug), " \xB7 ", r.claimed ? React.createElement("em", {
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
    [err, setErr] = React.useState('');
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
  }))), React.createElement("button", {
    className: "st-btn pri full",
    disabled: busy || check.state === 'checking'
  }, busy ? 'Criando…' : 'Criar e começar a editar'));
}
Object.assign(window, {
  AdminHome,
  AdminNewClient
});