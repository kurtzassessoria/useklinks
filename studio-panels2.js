function StylePanel({
  s
}) {
  const K = window.KStudio,
    {
      cfg
    } = s;
  const isCustom = cfg.theme === 'custom';
  const setC = x => s.upd({
    custom: {
      ...cfg.custom,
      ...x
    }
  });
  return React.createElement("div", {
    className: "st-col"
  }, React.createElement("h1", {
    className: "st-h1"
  }, "Apar\xEAncia"), React.createElement("p", {
    className: "st-lead"
  }, "Escolha um tema pronto ou use as cores da sua marca."), React.createElement("div", {
    className: "st-sec"
  }, "Tema"), React.createElement(SSeg, {
    options: [['ready', 'Prontos'], ['custom', 'Cores da marca']],
    value: isCustom ? 'custom' : 'ready',
    onChange: v => s.upd({
      theme: v === 'custom' ? 'custom' : cfg.lastTheme || 'brasa'
    })
  }), React.createElement("div", {
    style: {
      height: 12
    }
  }), !isCustom ? React.createElement("div", {
    className: "st-themes"
  }, K.THEMES.map(t => React.createElement("button", {
    key: t.id,
    className: 'st-theme' + (cfg.theme === t.id ? ' on' : ''),
    style: {
      background: t.bg,
      color: t.ink
    },
    onClick: () => s.upd({
      theme: t.id,
      lastTheme: t.id,
      custom: {
        bg: t.bg,
        ink: t.ink,
        btn: t.btn.startsWith('#') ? t.btn : t.bg,
        btnInk: t.btnInk,
        accent: t.accent
      }
    })
  }, React.createElement("i", {
    style: {
      background: t.accent,
      boxShadow: `0 0 0 4px ${t.btn}`
    }
  }), t.name))) : React.createElement("div", {
    className: "st-colors"
  }, [['bg', 'Fundo'], ['accent', 'Destaque'], ['btn', 'Botões'], ['btnInk', 'Texto dos botões'], ['ink', 'Texto']].map(([k, l]) => React.createElement("label", {
    key: k,
    className: "st-color"
  }, React.createElement("input", {
    type: "color",
    value: cfg.custom[k],
    onChange: e => setC({
      [k]: e.target.value
    })
  }), l))), React.createElement("div", {
    className: "st-sec"
  }, "Fonte do nome e dos bot\xF5es"), React.createElement("div", {
    className: "st-fonts"
  }, K.FONTS.map(f => React.createElement("button", {
    key: f.id,
    className: 'st-font' + (cfg.font === f.id ? ' on' : ''),
    onClick: () => s.upd({
      font: f.id
    })
  }, React.createElement("b", {
    style: {
      fontFamily: f.css
    }
  }, "Aa"), React.createElement("span", null, f.id)))), React.createElement("div", {
    className: "st-sec"
  }, "Formato dos bot\xF5es"), React.createElement("div", {
    className: "st-shapes"
  }, [['square', 'Reto', 3], ['soft', 'Arredondado', 8], ['pill', 'Pílula', 20]].map(([v, l, r]) => React.createElement("button", {
    key: v,
    className: 'st-shape' + (cfg.buttonShape === v ? ' on' : ''),
    onClick: () => s.upd({
      buttonShape: v
    })
  }, React.createElement("span", null, React.createElement("i", {
    style: {
      borderRadius: r
    }
  }), l)))), React.createElement("div", {
    className: "st-sec"
  }, "Estilo dos bot\xF5es"), React.createElement(SSeg, {
    options: [['fill', 'Preenchido'], ['outline', 'Contorno'], ['shadow', 'Sombra dura']],
    value: cfg.buttonStyle,
    onChange: v => s.upd({
      buttonStyle: v
    })
  }));
}
function ReportCard({
  s,
  view,
  days
}) {
  const K = window.KStudio;
  const [leadsN, setLeadsN] = React.useState(0),
    [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    window.KlinksBackend.engine.leads(s.cfg.slug).then(l => {
      const t = Date.now() - days * 864e5;
      setLeadsN((l || []).filter(x => Date.parse(x.created_at) >= t).length);
    }).catch(() => {});
  }, [days]);
  const txt = K.reportText(view, s.cfg, days, leadsN);
  const wa = String(s.cfg.social?.whatsapp || '').replace(/\D/g, '');
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "st-sec"
  }, "Relat\xF3rio para o WhatsApp"), React.createElement("div", {
    className: "st-card"
  }, React.createElement("pre", {
    className: "st-report"
  }, txt.replace(/\*/g, '')), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 12
    }
  }, React.createElement("a", {
    className: "st-btn sm pri",
    style: {
      textDecoration: 'none'
    },
    href: 'https://wa.me/' + (wa || '') + '?text=' + encodeURIComponent(txt),
    target: "_blank",
    rel: "noopener"
  }, wa ? 'Enviar para o meu WhatsApp' : 'Enviar no WhatsApp'), React.createElement("button", {
    className: "st-btn sm",
    onClick: () => {
      navigator.clipboard?.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, copied ? 'Copiado!' : 'Copiar texto'))));
}
function LeadsCard({
  s
}) {
  const B = window.KlinksBackend;
  const [rows, setRows] = React.useState(null),
    [all, setAll] = React.useState(false);
  const load = () => B.engine.leads(s.cfg.slug).then(r => setRows(r || [])).catch(() => setRows([]));
  React.useEffect(() => {
    load();
  }, [s.cfg.slug]);
  const has = s.cfg.blocks.some(b => b.type === 'lead');
  const fmtP = p => {
    const d = String(p).replace(/^55/, '');
    return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d;
  };
  const csv = () => {
    const L = [['Nome', 'WhatsApp', 'Origem', 'Data'], ...rows.map(r => [r.name || '', r.phone, r.source || '', new Date(r.created_at).toLocaleString('pt-BR')])].map(r => r.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + L], {
      type: 'text/csv'
    }));
    a.download = `contatos-${s.cfg.slug}.csv`;
    a.click();
  };
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "st-sec"
  }, React.createElement("span", null, 'Contatos' + (rows ? ' · ' + rows.length : ''))), React.createElement("div", {
    className: "st-card"
  }, !rows ? React.createElement("span", {
    style: {
      color: 'var(--s-mut)',
      fontSize: 14
    }
  }, "Carregando\u2026") : !rows.length ? React.createElement("div", {
    style: {
      fontSize: 14,
      lineHeight: 1.55
    }
  }, React.createElement("b", null, "Nenhum contato ainda."), React.createElement("p", {
    style: {
      color: 'var(--s-mut)',
      margin: '4px 0 12px'
    }
  }, has ? 'Quando alguém pegar o cupom na sua página, o WhatsApp aparece aqui.' : 'Adicione o bloco “Cupom por WhatsApp” e comece a montar sua lista de clientes para mandar promoções.'), has ? null : React.createElement("button", {
    className: "st-btn sm pri",
    onClick: () => s.addBlock('lead')
  }, "Adicionar bloco de cupom")) : React.createElement(React.Fragment, null, React.createElement("div", {
    className: "st-leads"
  }, (all ? rows : rows.slice(0, 8)).map(r => React.createElement("div", {
    key: r.id,
    className: "st-lead-r"
  }, React.createElement("div", null, React.createElement("b", null, r.name || 'Sem nome'), React.createElement("span", null, fmtP(r.phone), " \xB7 ", new Date(r.created_at).toLocaleDateString('pt-BR'), r.source ? ' · ' + r.source : '')), React.createElement("a", {
    className: "st-btn sm",
    style: {
      textDecoration: 'none'
    },
    href: 'https://wa.me/' + r.phone + '?text=' + encodeURIComponent('Oi' + (r.name ? ', ' + r.name.split(' ')[0] : '') + '! Aqui é da ' + s.cfg.profile.name + '.'),
    target: "_blank",
    rel: "noopener"
  }, "WhatsApp"), React.createElement("button", {
    className: "st-btn sm",
    title: "Apagar contato",
    onClick: async () => {
      if (confirm('Apagar este contato?')) {
        await B.engine.deleteLead(r.id);
        load();
      }
    }
  }, "\xD7")))), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 12
    }
  }, React.createElement("button", {
    className: "st-btn sm pri",
    onClick: csv
  }, "Baixar planilha"), rows.length > 8 ? React.createElement("button", {
    className: "st-btn sm",
    onClick: () => setAll(!all)
  }, all ? 'Ver menos' : 'Ver todos (' + rows.length + ')') : null), React.createElement("small", {
    style: {
      display: 'block',
      marginTop: 12,
      color: 'var(--s-mut)',
      fontSize: 12
    }
  }, "Todos autorizaram receber ofertas. Se algu\xE9m pedir para sair, apague o contato."))));
}
const fmtN = n => n >= 10000 ? (n / 1000).toFixed(0) + 'K' : n >= 1000 ? (n / 1000).toFixed(1).replace('.', ',') + 'K' : String(n);
function DataPanel({
  s
}) {
  const K = window.KStudio;
  const [days, setDays] = React.useState(30);
  const [st, setSt] = React.useState(null);
  const [demo, setDemo] = React.useState(false);
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    let on = true;
    setSt(null);
    K.fetchStats(s.cfg, days).then(x => on && setSt(x)).catch(e => on && setSt({
      error: e.message,
      views: 0
    }));
    return () => {
      on = false;
    };
  }, [days, s.cfg.slug, tick]);
  const view = demo ? K.demoStats(s.cfg, days) : st;
  const srcLabel = st?.source === 'supabase' ? 'Dados reais da sua página publicada' : 'Modo demonstração: conta só as visitas feitas neste navegador';
  const head = React.createElement(React.Fragment, null, React.createElement("h1", {
    className: "st-h1"
  }, "Dados ", demo ? React.createElement("span", {
    className: "st-demo"
  }, "Exemplo") : null), React.createElement("p", {
    className: "st-lead"
  }, demo ? 'Números fictícios, só para você ver como o painel fica com movimento.' : srcLabel + '. Cada pessoa conta 1 visita por sessão — recarregar a página não infla o número.'), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, React.createElement("div", {
    style: {
      flex: 1
    }
  }, React.createElement(SSeg, {
    options: [[7, '7 dias'], [30, '30 dias'], [90, '90 dias']],
    value: days,
    onChange: setDays
  })), React.createElement("button", {
    className: "st-btn sm",
    onClick: () => setTick(t => t + 1)
  }, "Atualizar")));
  if (!view) return React.createElement("div", {
    className: "st-col"
  }, head, React.createElement("p", {
    className: "st-lead",
    style: {
      marginTop: 20
    }
  }, "Carregando\u2026"));
  if (view.error && !demo) return React.createElement("div", {
    className: "st-col"
  }, head, React.createElement("div", {
    className: "st-err",
    style: {
      marginTop: 16
    }
  }, "N\xE3o foi poss\xEDvel buscar os dados: ", view.error));
  if (!view.views && !view.clicks) return React.createElement("div", {
    className: "st-col"
  }, head, React.createElement("div", {
    className: "st-card",
    style: {
      marginTop: 18,
      fontSize: 14,
      lineHeight: 1.6
    }
  }, React.createElement("b", {
    style: {
      fontSize: 16
    }
  }, "Nenhuma visita nos \xFAltimos ", days, " dias."), React.createElement("p", {
    style: {
      color: 'var(--s-mut)',
      margin: '6px 0 14px'
    }
  }, "Os n\xFAmeros come\xE7am a aparecer quando algu\xE9m abre sua p\xE1gina pelo link. Para testar agora: abra sua p\xE1gina, toque em alguns bot\xF5es e volte aqui."), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, React.createElement("a", {
    className: "st-btn sm pri",
    style: {
      textDecoration: 'none'
    },
    href: s.publicUrl,
    target: "_blank",
    rel: "noopener"
  }, "Abrir minha p\xE1gina"), React.createElement("button", {
    className: "st-btn sm",
    onClick: () => setDemo(true)
  }, "Ver exemplo com movimento"))), React.createElement(LeadsCard, {
    s: s
  }));
  const maxD = Math.max(...view.daily.map(d => d.views), 1);
  const maxT = Math.max(...view.topList.map(t => t.n), 1);
  const hours = Array.from({
    length: 14
  }, (_, i) => i + 10);
  const maxH = Math.max(...view.heat.flatMap(r => hours.map(h => r[h])), 1);
  const top = view.topList[0],
    src = view.srcList[0];
  const ins = [];
  if (view.views < 30) ins.push('Ainda são poucas visitas para tirar conclusões. Com 30+ visitas os padrões ficam confiáveis.');else {
    if (view.peak) ins.push(`Seu pico é ${K.WEEK[view.peak.dow].toLowerCase()} por volta das ${view.peak.hour}h. Poste stories com “link na bio” uma hora antes.`);
    if (src) ins.push(`${Math.round(src.n / view.views * 100)}% das visitas vêm de ${src.label}.${src.label === 'Direto' ? ' Use os links por canal (aba Compartilhar) para saber a origem real.' : ''}`);
    if (top && view.clicks) ins.push(`“${top.label}” recebe ${Math.round(top.n / view.clicks * 100)}% dos cliques. Mantenha ele em primeiro.`);
    if (view.ctr < 40) ins.push('Menos de 40% das visitas clicam em algo. Teste uma oferta com foto logo abaixo do botão de pedido.');
  }
  return React.createElement("div", {
    className: "st-col",
    style: {
      maxWidth: 640
    }
  }, head, demo ? React.createElement("button", {
    className: "st-btn sm",
    style: {
      marginTop: 10
    },
    onClick: () => setDemo(false)
  }, "\u2190 Voltar aos dados reais") : null, React.createElement("div", {
    className: "st-kpis",
    style: {
      marginTop: 18
    }
  }, React.createElement("div", {
    className: "st-kpi"
  }, React.createElement("span", null, "Visitas"), React.createElement("b", null, fmtN(view.views)), React.createElement("small", null, view.views / days < 1 ? 'menos de 1 por dia' : (view.views / days).toFixed(view.views / days < 10 ? 1 : 0).replace('.', ',') + ' por dia')), React.createElement("div", {
    className: "st-kpi"
  }, React.createElement("span", null, "Cliques"), React.createElement("b", null, fmtN(view.clicks)), React.createElement("small", null, "em bot\xF5es")), React.createElement("div", {
    className: "st-kpi"
  }, React.createElement("span", null, "Taxa de clique"), React.createElement("b", null, view.ctr, "%"), React.createElement("small", null, "visitas que clicaram")), React.createElement("div", {
    className: "st-kpi"
  }, React.createElement("span", null, "Celular"), React.createElement("b", null, view.mobilePct, "%"), React.createElement("small", null, "das visitas"))), !demo ? React.createElement(ReportCard, {
    s: s,
    view: view,
    days: days
  }) : null, ins.length ? React.createElement(React.Fragment, null, React.createElement("div", {
    className: "st-sec"
  }, "O que fazer com isso"), React.createElement("div", {
    className: "st-ins"
  }, ins.map((t, i) => React.createElement("div", {
    key: i,
    className: "st-in-row"
  }, React.createElement(SI, {
    n: "star",
    size: 18
  }), React.createElement("span", null, t))))) : null, React.createElement("div", {
    className: "st-sec"
  }, "Visitas e cliques por dia"), React.createElement("div", {
    className: "st-card"
  }, React.createElement("div", {
    className: "st-bars"
  }, view.daily.map(d => React.createElement("div", {
    key: d.date,
    "data-t": `${d.date.slice(8)}/${d.date.slice(5, 7)} · ${d.views} visitas · ${d.clicks} cliques`
  }, React.createElement("i", {
    style: {
      height: Math.max(0, d.views - Math.min(d.clicks, d.views)) / maxD * 100 + '%'
    }
  }), React.createElement("em", {
    style: {
      height: Math.min(d.clicks, d.views) / maxD * 100 + '%'
    }
  })))), React.createElement("div", {
    className: "st-legend"
  }, React.createElement("span", null, React.createElement("i", {
    style: {
      background: 'var(--s-or)'
    }
  }), "Cliques"), React.createElement("span", null, React.createElement("i", {
    style: {
      background: '#3a3a40'
    }
  }), "Visitas"))), view.topList.length ? React.createElement(React.Fragment, null, React.createElement("div", {
    className: "st-sec"
  }, "Mais clicados"), React.createElement("div", {
    className: "st-card"
  }, React.createElement("div", {
    className: "st-top"
  }, view.topList.slice(0, 10).map((t, i) => React.createElement("div", {
    key: t.label + i,
    className: "st-topr"
  }, React.createElement("span", null, i + 1, "."), React.createElement("b", {
    style: {
      fontWeight: 700,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      opacity: t.gone ? .55 : 1
    }
  }, t.label, t.gone ? ' (removido)' : ''), React.createElement("b", null, t.n), React.createElement("div", {
    className: "bar"
  }, React.createElement("i", {
    style: {
      width: t.n / maxT * 100 + '%'
    }
  }))))))) : null, React.createElement("div", {
    className: "st-sec"
  }, "De onde vieram"), React.createElement("div", {
    className: "st-card"
  }, React.createElement("div", {
    className: "st-top"
  }, view.srcList.map(t => React.createElement("div", {
    key: t.label,
    className: "st-topr"
  }, React.createElement("span", null), React.createElement("b", {
    style: {
      fontWeight: 700
    }
  }, t.label), React.createElement("span", null, t.n, " \xB7 ", Math.round(t.n / Math.max(view.views, 1) * 100), "%"), React.createElement("div", {
    className: "bar"
  }, React.createElement("i", {
    style: {
      width: t.n / Math.max(view.views, 1) * 100 + '%',
      background: '#f5b301'
    }
  }))))), React.createElement("small", {
    style: {
      display: 'block',
      marginTop: 14,
      color: 'var(--s-mut)',
      fontSize: 12
    }
  }, "\u201CDireto\u201D = link sem marca\xE7\xE3o de canal. Use os links da aba ", React.createElement("b", null, "Compartilhar"), ".")), React.createElement("div", {
    className: "st-sec"
  }, "Hor\xE1rios de mais visita"), React.createElement("div", {
    className: "st-card"
  }, React.createElement("div", {
    className: "st-heat"
  }, React.createElement("span", null), hours.map(h => React.createElement("span", {
    key: h,
    style: {
      textAlign: 'center'
    }
  }, h % 2 === 0 ? h : '')), K.WEEK_S.map((d, i) => React.createElement(React.Fragment, {
    key: d
  }, React.createElement("span", null, d), hours.map(h => React.createElement("i", {
    key: h,
    title: `${d} ${h}h · ${view.heat[i][h]} visitas`,
    style: {
      opacity: .06 + view.heat[i][h] / maxH * .94
    }
  })))))), !demo ? React.createElement(LeadsCard, {
    s: s
  }) : null);
}
function SharePanel({
  s
}) {
  const url = s.shareUrl;
  const [copied, setCopied] = React.useState('');
  const copy = (txt, k) => {
    navigator.clipboard?.writeText(txt);
    setCopied(k);
    s.updP('meta', {
      shared: true
    });
    setTimeout(() => setCopied(''), 1500);
  };
  const chans = [['ig', 'Bio do Instagram', 'instagram', '#e1306c'], ['wa', 'Status e grupos do WhatsApp', 'whatsapp', '#22c55e'], ['google', 'Perfil no Google', 'star', '#f5b301'], ['qr', 'QR Code da mesa / embalagem', 'tag', '#64748b'], ['nfc', 'Plaquinha NFC (gravar no chip)', 'phone', '#111827']];
  const withSrc = k => url + (url.includes('?') ? '&' : '?') + 'src=' + k;
  return React.createElement("div", {
    className: "st-col"
  }, React.createElement("h1", {
    className: "st-h1"
  }, "Compartilhar"), React.createElement("p", {
    className: "st-lead"
  }, "Este \xE9 o endere\xE7o da sua p\xE1gina. Coloque na bio do Instagram \u2014 \xE9 dali que vem a maior parte dos pedidos."), React.createElement("div", {
    className: "st-card"
  }, React.createElement("div", {
    className: "st-qr"
  }, React.createElement("img", {
    alt: "QR Code da p\xE1gina",
    src: 'https://api.qrserver.com/v1/create-qr-code/?size=264x264&margin=0&data=' + encodeURIComponent(withSrc('qr'))
  }), React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minWidth: 0,
      flex: 1
    }
  }, React.createElement("b", {
    style: {
      fontSize: 15
    }
  }, "Seu link"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--s-mut)',
      wordBreak: 'break-all'
    }
  }, url), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginTop: 4
    }
  }, React.createElement("button", {
    className: "st-btn sm pri",
    onClick: () => copy(withSrc('ig'), 'main')
  }, copied === 'main' ? 'Copiado!' : 'Copiar link'), React.createElement("a", {
    className: "st-btn sm",
    style: {
      textDecoration: 'none'
    },
    href: s.publicUrl,
    target: "_blank",
    rel: "noopener"
  }, "Abrir"), React.createElement("a", {
    className: "st-btn sm",
    style: {
      textDecoration: 'none'
    },
    href: 'https://wa.me/?text=' + encodeURIComponent('Peça pelo nosso link: ' + withSrc('wa')),
    target: "_blank",
    rel: "noopener",
    onClick: () => s.updP('meta', {
      shared: true
    })
  }, "Enviar no WhatsApp"), React.createElement("a", {
    className: "st-btn sm",
    style: {
      textDecoration: 'none'
    },
    href: 'https://api.qrserver.com/v1/create-qr-code/?size=1200x1200&format=png&data=' + encodeURIComponent(withSrc('qr')),
    target: "_blank",
    rel: "noopener"
  }, "Baixar QR"))))), React.createElement("div", {
    className: "st-sec"
  }, "Plaquinha, display de mesa e adesivos"), React.createElement("div", {
    className: "st-card",
    style: {
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 220
    }
  }, React.createElement("b", {
    style: {
      fontSize: 15
    }
  }, "Arte pronta para imprimir"), React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--s-mut)',
      marginTop: 4,
      lineHeight: 1.5
    }
  }, "Display de mesa, adesivo de embalagem e cart\xE3o, com o QR da sua p\xE1gina e o selo \u201Caproxime o celular\u201D. Imprima em casa ou mande o PDF para a gr\xE1fica.")), React.createElement("a", {
    className: "st-btn sm pri",
    style: {
      textDecoration: 'none'
    },
    href: '/plaquinha?s=' + encodeURIComponent(s.cfg.slug),
    target: "_blank",
    rel: "noopener"
  }, "Montar arte")), React.createElement("div", {
    className: "st-sec"
  }, "Um link para cada canal"), React.createElement("p", {
    className: "st-lead",
    style: {
      marginTop: -4
    }
  }, "\xC9 o mesmo endere\xE7o com ", React.createElement("b", null, "?src="), " no final. O cliente cai na mesma p\xE1gina, mas a aba ", React.createElement("b", null, "Dados"), " sabe se ele veio do Instagram, do WhatsApp, do Google ou do QR da mesa. Use cada um no seu lugar."), React.createElement("div", {
    className: "st-list"
  }, chans.map(([k, l, ic, c]) => React.createElement(SRow, {
    key: k,
    icon: ic,
    color: c,
    title: l,
    sub: withSrc(k).replace(/^https?:\/\//, ''),
    onClick: () => copy(withSrc(k), k),
    right: React.createElement("span", {
      className: "st-btn sm"
    }, copied === k ? 'Copiado!' : 'Copiar')
  }))), React.createElement("div", {
    className: "st-sec"
  }, "Como colocar na bio do Instagram"), React.createElement("div", {
    className: "st-card",
    style: {
      fontSize: 14,
      lineHeight: 1.6
    }
  }, React.createElement("ol", {
    style: {
      margin: 0,
      paddingLeft: 18
    }
  }, React.createElement("li", null, "Copie o link \u201CBio do Instagram\u201D acima."), React.createElement("li", null, "No Instagram: ", React.createElement("b", null, "Editar perfil \u2192 Links \u2192 Adicionar link externo"), "."), React.createElement("li", null, "Cole, coloque o t\xEDtulo \u201CPe\xE7a aqui\u201D e salve."), React.createElement("li", null, "Nos stories, use o adesivo ", React.createElement("b", null, "Link"), " com o mesmo endere\xE7o."))));
}
function SettingsPanel({
  s
}) {
  const {
    cfg
  } = s;
  return React.createElement("div", {
    className: "st-col"
  }, React.createElement("h1", {
    className: "st-h1"
  }, "Configura\xE7\xF5es"), React.createElement("p", {
    className: "st-lead"
  }, "Endere\xE7o da p\xE1gina, Google e an\xFAncios."), React.createElement("div", {
    className: "st-sec"
  }, "Endere\xE7o da p\xE1gina"), React.createElement("div", {
    className: "st-card",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("b", {
    style: {
      fontSize: 15,
      wordBreak: 'break-all'
    }
  }, s.prettyUrl), React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--s-mut)',
      marginTop: 3
    }
  }, "Definido no cadastro. Para trocar, fale com o suporte.")), React.createElement("a", {
    className: "st-btn sm",
    style: {
      textDecoration: 'none'
    },
    href: s.publicUrl,
    target: "_blank",
    rel: "noopener"
  }, "Abrir")), React.createElement("div", {
    className: "st-card",
    style: {
      padding: '4px 16px',
      marginTop: 10
    }
  }, React.createElement("div", {
    className: "st-tgrow"
  }, React.createElement("div", null, React.createElement("b", null, "Mostrar \u201CFeito com KLINKS\u201D"), React.createElement("span", null, "Selo discreto no rodap\xE9 da p\xE1gina.")), React.createElement(SToggle, {
    on: cfg.watermark !== false,
    onChange: v => s.upd({
      watermark: v
    })
  }))), React.createElement("div", {
    className: "st-sec"
  }, "Google e an\xFAncios"), React.createElement(SField, {
    label: "T\xEDtulo no Google",
    hint: "Aparece na aba do navegador e na busca."
  }, React.createElement(SInput, {
    value: cfg.seo?.title,
    onChange: v => s.upd({
      seo: {
        ...cfg.seo,
        title: v
      }
    }),
    placeholder: cfg.profile.name + ' · Delivery e cardápio'
  })), React.createElement(SField, {
    label: "Descri\xE7\xE3o no Google"
  }, React.createElement(SText, {
    value: cfg.seo?.description,
    onChange: v => s.upd({
      seo: {
        ...cfg.seo,
        description: v
      }
    }),
    style: {
      minHeight: 70
    },
    placeholder: cfg.profile.tagline
  })), React.createElement(SField, {
    label: "Pixel da Meta",
    hint: "ID num\xE9rico do Pixel. Permite criar p\xFAblicos de quem visitou a p\xE1gina."
  }, React.createElement(SInput, {
    value: cfg.pixel,
    onChange: v => s.upd({
      pixel: v.replace(/\D/g, '')
    }),
    placeholder: "123456789012345"
  })), React.createElement("div", {
    className: "st-sec"
  }, "Dados da p\xE1gina"), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, React.createElement("button", {
    className: "st-btn sm",
    onClick: () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(cfg, null, 2)], {
        type: 'application/json'
      }));
      a.download = `klinks-${cfg.slug}.json`;
      a.click();
    }
  }, "Baixar backup"), React.createElement("button", {
    className: "st-btn sm",
    onClick: () => {
      if (confirm('Descartar tudo o que ainda não foi publicado?')) s.discard();
    }
  }, "Descartar altera\xE7\xF5es")));
}
function AccountPanel({
  s
}) {
  const B = window.KlinksBackend;
  const [pw, setPw] = React.useState(''),
    [pw2, setPw2] = React.useState('');
  const [mail, setMail] = React.useState('');
  const [busy, setBusy] = React.useState(''),
    [msg, setMsg] = React.useState(null);
  const email = s.user?.email || '';
  const created = s.user?.created_at ? new Date(s.user.created_at).toLocaleDateString('pt-BR') : null;
  const wa = window.KLINKS_SALES_WHATSAPP;
  const run = async (key, fn) => {
    setBusy(key);
    setMsg(null);
    try {
      await fn();
    } catch (e) {
      setMsg({
        err: true,
        t: e.message
      });
    }
    setBusy('');
  };
  const savePw = e => {
    e.preventDefault();
    if (pw.length < 6) return setMsg({
      err: true,
      t: 'A senha precisa ter pelo menos 6 caracteres.'
    });
    if (pw !== pw2) return setMsg({
      err: true,
      t: 'As duas senhas não são iguais.'
    });
    run('pw', async () => {
      await B.engine.updatePassword(pw);
      setPw('');
      setPw2('');
      setMsg({
        t: 'Senha alterada. Use a nova senha no próximo login.'
      });
    });
  };
  const saveMail = e => {
    e.preventDefault();
    const m = mail.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(m)) return setMsg({
      err: true,
      t: 'Digite um e-mail válido.'
    });
    if (m === email) return setMsg({
      err: true,
      t: 'Esse já é o seu e-mail.'
    });
    run('mail', async () => {
      const r = await B.engine.updateEmail(m);
      setMail('');
      if (r.needsConfirm) setMsg({
        t: 'Enviamos um link de confirmação para ' + m + '. A troca só vale depois que você clicar nele.'
      });else {
        s.setUser({
          ...s.user,
          email: m
        });
        setMsg({
          t: 'E-mail alterado.'
        });
      }
    });
  };
  return React.createElement("div", {
    className: "st-col"
  }, React.createElement("h1", {
    className: "st-h1"
  }, "Minha conta"), React.createElement("p", {
    className: "st-lead"
  }, "Seus dados de acesso ao KLINKS."), msg ? React.createElement("div", {
    className: msg.err ? 'st-err' : 'st-ok',
    style: {
      marginTop: 16
    }
  }, msg.t) : null, React.createElement("div", {
    className: "st-sec"
  }, "Acesso"), React.createElement("div", {
    className: "st-card",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap'
    }
  }, React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, React.createElement("b", {
    style: {
      fontSize: 15,
      wordBreak: 'break-all'
    }
  }, email), React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--s-mut)',
      marginTop: 3
    }
  }, "E-mail de login", created ? ' · conta criada em ' + created : '')), React.createElement("span", {
    className: "st-lock st-pro"
  }, "Ativa")), React.createElement("div", {
    className: "st-sec"
  }, "Mudar senha"), React.createElement("form", {
    onSubmit: savePw
  }, React.createElement("div", {
    className: "st-two"
  }, React.createElement(SField, {
    label: "Nova senha",
    hint: "M\xEDnimo de 6 caracteres."
  }, React.createElement(SInput, {
    type: "password",
    value: pw,
    onChange: setPw,
    autoComplete: "new-password"
  })), React.createElement(SField, {
    label: "Repita a nova senha"
  }, React.createElement(SInput, {
    type: "password",
    value: pw2,
    onChange: setPw2,
    autoComplete: "new-password"
  }))), React.createElement("button", {
    className: "st-btn sm pri",
    disabled: busy === 'pw' || !pw
  }, busy === 'pw' ? 'Salvando…' : 'Salvar nova senha')), React.createElement("div", {
    className: "st-sec"
  }, "Mudar e-mail de login"), React.createElement("form", {
    onSubmit: saveMail
  }, React.createElement(SField, {
    label: "Novo e-mail",
    hint: "Voc\xEA recebe um link no novo e-mail para confirmar a troca."
  }, React.createElement(SInput, {
    type: "email",
    value: mail,
    onChange: setMail,
    autoComplete: "email",
    placeholder: "novo@email.com"
  })), React.createElement("button", {
    className: "st-btn sm",
    disabled: busy === 'mail' || !mail
  }, busy === 'mail' ? 'Enviando…' : 'Trocar e-mail')), React.createElement("div", {
    className: "st-sec"
  }, "Seguran\xE7a"), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, React.createElement("button", {
    className: "st-btn sm",
    onClick: s.signOut
  }, "Sair deste aparelho"), React.createElement("button", {
    className: "st-btn sm danger",
    onClick: () => {
      if (confirm('Sair da conta em todos os celulares e computadores?')) run('all', async () => {
        await B.engine.signOutAll();
        s.signOut();
      });
    }
  }, "Sair de todos os aparelhos")), wa ? React.createElement(React.Fragment, null, React.createElement("div", {
    className: "st-sec"
  }, "Ajuda"), React.createElement("a", {
    className: "st-btn sm",
    style: {
      textDecoration: 'none',
      alignSelf: 'flex-start'
    },
    href: 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Olá! Preciso de ajuda com o KLINKS (' + s.prettyUrl + ').'),
    target: "_blank",
    rel: "noopener"
  }, "Falar com o suporte no WhatsApp")) : null);
}
Object.assign(window, {
  StylePanel,
  DataPanel,
  SharePanel,
  SettingsPanel,
  AccountPanel
});