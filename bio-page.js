const BP_PATHS = {
  delivery: 'M2.5 7h11v8h-11zM13.5 10h4l3 3v2h-7M6 19a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 6 19zM17 19a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 17 19z',
  whatsapp: 'M4 20l1.2-3.7A8.2 8.2 0 1 1 8 19L4 20zM9.2 8.6c-.3 2.9 3.3 6.4 6.2 6.2l.8-1.4-1.9-1-.9.7a4.5 4.5 0 0 1-2.1-2.1l.7-.9-1-1.9-1.8.4z',
  menu: 'M6 3.5h10.5a2 2 0 0 1 2 2v15H8a2 2 0 0 1-2-2v-15zM9.5 8.5h6M9.5 12h6M9.5 15.5h3.5',
  pin: 'M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 1 1 13 0c0 5.3-6.5 11-6.5 11zM12 12.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8z',
  star: 'M12 3.4l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.8l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z',
  instagram: 'M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17.2 6.8h.01',
  facebook: 'M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4a20 20 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2.1H8.6v3h2.6V21',
  tiktok: 'M14 3.5v11.2a3.3 3.3 0 1 1-3.3-3.3M14 3.5c.4 2.6 2.4 4.5 5 4.6',
  calendar: 'M4 6h16v14H4zM4 10h16M8.5 3.5v4M15.5 3.5v4',
  phone: 'M5.5 3.5h3.3l1.8 4.5-2.3 1.4a11 11 0 0 0 5.3 5.3l1.4-2.3 4.5 1.8v3.3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3.5 5.7a2 2 0 0 1 2-2.2z',
  gift: 'M4 11h16v9.5H4zM3 7.5h18V11H3zM12 7.5v13M12 7.5S10.4 3.6 8 4.4 8.8 7.5 12 7.5zM12 7.5s1.6-3.9 4-3.1-.8 3.1-4 3.1z',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 5.3l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2',
  tag: 'M3.5 12.2V3.5h8.7l8.3 8.3-8.7 8.7zM8 8h.01',
  map: 'M9 4.5L3.5 6.5v13L9 17.5l6 2 5.5-2v-13L15 6.5zM9 4.5v13M15 6.5v13',
  text: 'M5 6.5h14M5 12h14M5 17.5h9',
  image: 'M4 5.5h16v13H4zM4 15.5l4.5-4.5 4 4 2.5-2.5 5 5M15.5 9.5h.01',
  chevron: 'M9.5 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  ticket: 'M3.5 8V5.5h17V8a2.5 2.5 0 0 0 0 5v2.5h-17V13a2.5 2.5 0 0 0 0-5z'
};
function BpIcon({
  n,
  size = 22,
  sw = 1.8,
  fill = 'none',
  style
}) {
  return React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: fill,
    stroke: "currentColor",
    strokeWidth: sw,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: style,
    "aria-hidden": "true"
  }, React.createElement("path", {
    d: BP_PATHS[n] || BP_PATHS.link
  }));
}
function BpLead({
  b,
  cfg,
  preview,
  track
}) {
  const K = window.KStudio;
  const [name, setName] = React.useState(''),
    [phone, setPhone] = React.useState(''),
    [ok, setOk] = React.useState(false);
  const [busy, setBusy] = React.useState(false),
    [err, setErr] = React.useState(''),
    [done, setDone] = React.useState(() => {
      try {
        return !!localStorage.getItem('klinks_lead_' + cfg.slug);
      } catch (e) {
        return false;
      }
    });
  const [copied, setCopied] = React.useState(false);
  const go = async e => {
    e.preventDefault();
    setErr('');
    let d = phone.replace(/\D/g, '');
    if (d.length < 10 || d.length > 13) return setErr('Digite o WhatsApp com DDD.');
    if (d.length <= 11) d = '55' + d;
    if (!ok) return setErr('Marque a autorização para receber o cupom.');
    setBusy(true);
    try {
      if (!preview) {
        let src = '';
        try {
          src = new URLSearchParams(location.search).get('src') || '';
        } catch (x) {}
        await window.KlinksBackend.engine.saveLead({
          restaurant_slug: cfg.slug,
          name: name.trim().slice(0, 60) || null,
          phone: d,
          source: src.slice(0, 30) || null,
          consent: true
        });
        track('Cupom por WhatsApp · cadastro', null, b.id);
      }
      try {
        localStorage.setItem('klinks_lead_' + cfg.slug, '1');
      } catch (x) {}
      setDone(true);
    } catch (x) {
      setErr('Não deu certo agora. Tente de novo em instantes.');
    }
    setBusy(false);
  };
  const h = K.href(b.url);
  return React.createElement("div", {
    className: "bp-card bp-lead"
  }, React.createElement("div", {
    className: "bp-lead-h"
  }, React.createElement("span", {
    className: "bp-tile",
    style: {
      background: '#22c55e'
    }
  }, React.createElement(BpIcon, {
    n: "ticket",
    size: 24
  })), React.createElement("div", null, React.createElement("h3", null, b.title), b.desc && !done ? React.createElement("p", null, b.desc) : null)), done ? React.createElement(React.Fragment, null, React.createElement("button", {
    className: "bp-coupon",
    onClick: () => {
      navigator.clipboard?.writeText(b.coupon);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }, React.createElement("span", null, copied ? 'Cupom copiado!' : 'Seu cupom · toque para copiar'), React.createElement("code", null, b.coupon)), h ? React.createElement("a", {
    className: "bp-cta",
    href: h,
    target: "_blank",
    rel: "noopener",
    onClick: () => track('Cupom por WhatsApp · usar', h, b.id + '-usar')
  }, "Usar no pedido", React.createElement(BpIcon, {
    n: "chevron",
    size: 16,
    sw: 2.2
  })) : null) : React.createElement("form", {
    onSubmit: go,
    className: "bp-lead-f"
  }, React.createElement("input", {
    className: "bp-in",
    placeholder: "Seu nome (opcional)",
    value: name,
    onChange: e => setName(e.target.value),
    autoComplete: "given-name",
    maxLength: 60
  }), React.createElement("input", {
    className: "bp-in",
    placeholder: "WhatsApp com DDD",
    value: phone,
    onChange: e => setPhone(e.target.value),
    inputMode: "tel",
    autoComplete: "tel",
    required: true
  }), React.createElement("label", {
    className: "bp-ok"
  }, React.createElement("input", {
    type: "checkbox",
    checked: ok,
    onChange: e => setOk(e.target.checked)
  }), React.createElement("span", null, "Autorizo ", cfg.profile?.name || 'o restaurante', " a me enviar ofertas pelo WhatsApp. Posso cancelar quando quiser.")), err ? React.createElement("div", {
    className: "bp-err"
  }, err) : null, React.createElement("button", {
    className: "bp-cta",
    disabled: busy,
    style: {
      border: 0,
      width: '100%',
      cursor: 'pointer'
    }
  }, busy ? 'Enviando…' : b.cta || 'Quero meu cupom')));
}
function BioPage({
  cfg,
  preview
}) {
  const K = window.KStudio;
  const t = K.resolveTheme(cfg);
  const r = {
    square: 6,
    soft: 16,
    pill: 999
  }[cfg.buttonShape] ?? 16;
  const vars = {
    '--bp-bg': t.bg,
    '--bp-ink': t.ink,
    '--bp-muted': t.muted,
    '--bp-btn': t.btn,
    '--bp-btn-ink': t.btnInk,
    '--bp-accent': t.accent,
    '--bp-r': (r === 999 ? 34 : r) + 'px',
    '--bp-font': K.fontCss(cfg.font),
    '--bp-fw': ['Anton', 'Bebas', 'Archivo', 'Caveat'].includes(cfg.font) ? 400 : 700
  };
  const p = cfg.profile;
  const hb = cfg.blocks.find(b => b.type === 'hours' && b.on);
  const status = hb ? K.statusNow(hb.week) : null;
  const [copied, setCopied] = React.useState('');
  const track = (label, h, id) => {
    if (!preview && window.KlinksAnalytics) window.KlinksAnalytics.track(id ? 'click:' + id : 'click', {
      label,
      href: h
    });
  };
  const A = ({
    h,
    label,
    id,
    children,
    className,
    style
  }) => React.createElement("a", {
    className: className,
    style: style,
    href: h || undefined,
    target: h && !h.startsWith('tel:') ? '_blank' : undefined,
    rel: "noopener",
    onClick: e => {
      if (!h) e.preventDefault();
      track(label, h, id);
    }
  }, children);
  const blocks = cfg.blocks.filter(b => b.on && (b.type !== 'offer' || K.offerState(b).active));
  const render = b => {
    if (b.type === 'link') {
      const pr = K.presetFor(b.icon),
        h = K.linkHref(b, cfg);
      const tile = b.icon === 'logo' && p.logo ? React.createElement("span", {
        className: "bp-tile",
        style: {
          background: `center/cover no-repeat url("${p.logo}")`
        }
      }) : React.createElement("span", {
        className: "bp-tile",
        style: {
          background: b.highlight ? undefined : pr.color
        }
      }, React.createElement(BpIcon, {
        n: b.icon === 'logo' ? 'link' : b.icon,
        size: 24
      }));
      return React.createElement(A, {
        key: b.id,
        id: b.id,
        h: h,
        label: b.label,
        className: 'bp-link' + (b.highlight ? ' hl' : '')
      }, tile, React.createElement("span", {
        className: "bp-ltxt"
      }, React.createElement("b", null, b.label || 'Sem título'), b.sub ? React.createElement("span", null, b.sub) : null), React.createElement(BpIcon, {
        n: "chevron",
        size: 18,
        style: {
          opacity: .5
        }
      }));
    }
    if (b.type === 'offer') {
      const st = K.offerState(b),
        h = K.href(b.url);
      return React.createElement("div", {
        key: b.id,
        className: "bp-card"
      }, React.createElement("div", {
        className: 'bp-offer-img' + (b.image ? '' : ' empty'),
        style: b.image ? {
          backgroundImage: `url(${b.image})`,
          backgroundPosition: `50% ${b.imageY ?? 50}%`
        } : null
      }, b.eyebrow ? React.createElement("span", {
        className: "bp-ribbon"
      }, b.eyebrow) : null), React.createElement("div", {
        className: "bp-offer-b"
      }, React.createElement("h3", null, b.title), b.desc ? React.createElement("p", null, b.desc) : null, b.priceFrom || b.priceTo ? React.createElement("div", {
        className: "bp-price"
      }, b.priceFrom ? React.createElement("s", null, "R$ ", b.priceFrom) : null, b.priceTo ? React.createElement("b", null, "R$ ", b.priceTo) : null) : null, b.coupon ? React.createElement("button", {
        className: "bp-coupon",
        onClick: () => {
          navigator.clipboard?.writeText(b.coupon);
          setCopied(b.id);
          setTimeout(() => setCopied(''), 1600);
          track('Cupom · ' + b.coupon, null, b.id + '-cupom');
        }
      }, React.createElement("span", null, copied === b.id ? 'Cupom copiado!' : 'Toque para copiar o cupom'), React.createElement("code", null, b.coupon)) : null, h ? React.createElement(A, {
        h: h,
        id: b.id,
        label: 'Oferta · ' + b.title,
        className: "bp-cta"
      }, b.cta || 'Aproveitar', React.createElement(BpIcon, {
        n: "chevron",
        size: 16,
        sw: 2.2
      })) : null, st.label ? React.createElement("div", {
        className: "bp-ends"
      }, React.createElement(BpIcon, {
        n: "clock",
        size: 14,
        sw: 2
      }), st.label) : null));
    }
    if (b.type === 'map') {
      if (!b.address) return preview ? React.createElement("div", {
        key: b.id,
        className: "bp-card bp-empty"
      }, "Mapa: adicione o endere\xE7o") : null;
      return React.createElement("div", {
        key: b.id,
        className: "bp-card bp-map"
      }, React.createElement("iframe", {
        title: "Mapa",
        loading: "lazy",
        src: K.mapsEmbed(b.address),
        style: preview ? {
          pointerEvents: 'none'
        } : null
      }), React.createElement("div", {
        className: "bp-map-f"
      }, React.createElement("div", null, b.address), React.createElement(A, {
        h: K.mapsLink(b.address),
        id: b.id,
        label: b.label || 'Como chegar'
      }, b.label || 'Como chegar')));
    }
    if (b.type === 'hours') {
      const d = new Date().getDay();
      return React.createElement("div", {
        key: b.id,
        className: "bp-card bp-hours"
      }, React.createElement("div", {
        className: "bp-hours-h"
      }, React.createElement("span", {
        className: 'bp-dot',
        style: {
          background: status?.open ? '#22c55e' : '#9ca3af'
        }
      }), status?.label), b.week.map((w, i) => React.createElement("div", {
        key: i,
        className: 'bp-hours-r' + (i === d ? ' today' : '')
      }, React.createElement("span", null, K.WEEK[i]), React.createElement("span", null, w.on ? `${K.fmtH(w.open)} – ${K.fmtH(w.close)}` : 'Fechado'))));
    }
    if (b.type === 'menu') {
      const items = (b.items || []).filter(it => it.name);
      if (!items.length) return preview ? React.createElement("div", {
        key: b.id,
        className: "bp-card bp-empty"
      }, "Mais pedidos: adicione produtos") : null;
      return React.createElement("div", {
        key: b.id,
        className: "bp-card bp-menu"
      }, b.title ? React.createElement("div", {
        className: "bp-menu-h"
      }, b.title) : null, items.map(it => {
        const h = K.href(it.url || b.url);
        return React.createElement(A, {
          key: it.id,
          id: b.id + '-' + it.id,
          h: h,
          label: 'Mais pedidos · ' + it.name,
          className: "bp-mi"
        }, React.createElement("span", {
          className: 'bp-mi-img' + (it.image ? '' : ' empty'),
          style: it.image ? {
            backgroundImage: `url(${it.image})`
          } : null
        }, it.image ? null : React.createElement(BpIcon, {
          n: "menu",
          size: 20
        })), React.createElement("span", {
          className: "bp-mi-t"
        }, React.createElement("b", null, it.name), it.desc ? React.createElement("span", null, it.desc) : null), it.price ? React.createElement("span", {
          className: "bp-mi-p"
        }, "R$ ", it.price) : null);
      }));
    }
    if (b.type === 'lead') return React.createElement(BpLead, {
      key: b.id,
      b: b,
      cfg: cfg,
      preview: preview,
      track: track
    });
    if (b.type === 'review' && (b.rating || (b.quotes || []).some(x => x.text))) {
      const h = K.href(b.url),
        qs = (b.quotes || []).filter(x => x.text).slice(0, 3);
      return React.createElement("div", {
        key: b.id,
        className: "bp-card bp-rev"
      }, b.rating ? React.createElement("div", {
        className: "bp-rev-h"
      }, React.createElement("b", null, b.rating), React.createElement("div", null, React.createElement("span", {
        className: "bp-stars"
      }, [0, 1, 2, 3, 4].map(i => React.createElement(BpIcon, {
        key: i,
        n: "star",
        size: 16,
        fill: "currentColor",
        sw: 0
      }))), React.createElement("span", null, b.count ? b.count + ' avaliações no Google' : 'no Google'))) : null, qs.map((x, i) => React.createElement("blockquote", {
        key: i
      }, "\u201C", x.text, "\u201D", x.who ? React.createElement("cite", null, x.who) : null)), h ? React.createElement(A, {
        h: h,
        id: b.id,
        label: b.label,
        className: "bp-cta"
      }, b.label || 'Avalie a gente', React.createElement(BpIcon, {
        n: "star",
        size: 16,
        fill: "currentColor",
        sw: 0
      })) : null);
    }
    if (b.type === 'review') {
      const h = K.href(b.url);
      return React.createElement(A, {
        key: b.id,
        id: b.id,
        h: h,
        label: b.label,
        className: "bp-link"
      }, React.createElement("span", {
        className: "bp-tile",
        style: {
          background: '#fff',
          color: '#f5b301'
        }
      }, React.createElement(BpIcon, {
        n: "star",
        size: 26,
        fill: "currentColor",
        sw: 1
      })), React.createElement("span", {
        className: "bp-ltxt"
      }, React.createElement("b", null, b.label), React.createElement("span", {
        className: "bp-stars"
      }, [0, 1, 2, 3, 4].map(i => React.createElement(BpIcon, {
        key: i,
        n: "star",
        size: 14,
        fill: "currentColor",
        sw: 0
      })))), React.createElement(BpIcon, {
        n: "chevron",
        size: 18,
        style: {
          opacity: .5
        }
      }));
    }
    if (b.type === 'text') return React.createElement("div", {
      key: b.id,
      className: "bp-card bp-text"
    }, b.title ? React.createElement("h4", null, b.title) : null, React.createElement("p", null, b.text));
    return null;
  };
  return React.createElement("div", {
    className: `bp bp-st-${cfg.buttonStyle || 'fill'} bp-shape-${cfg.buttonShape || 'soft'}`,
    style: vars
  }, React.createElement("div", {
    className: "bp-inner"
  }, React.createElement("div", {
    className: 'bp-cover' + (p.cover ? '' : ' empty'),
    style: p.cover ? {
      backgroundImage: `url(${p.cover})`,
      backgroundPosition: `50% ${p.coverY ?? 50}%`
    } : null
  }), React.createElement("div", {
    className: "bp-logo",
    style: p.logo ? {
      backgroundImage: `url(${p.logo})`
    } : null
  }, p.logo ? null : p.logoLetter || (p.name || 'K')[0]), React.createElement("h1", {
    className: "bp-name"
  }, p.name || 'Seu restaurante'), p.tagline ? React.createElement("p", {
    className: "bp-tag"
  }, p.tagline) : null, status ? React.createElement("div", {
    className: 'bp-status' + (status.open ? ' open' : '')
  }, React.createElement("span", {
    className: "bp-dot"
  }), status.open ? 'Aberto agora' : status.label) : null, K.socialLinks(cfg.social).length ? React.createElement("div", {
    className: "bp-social"
  }, K.socialLinks(cfg.social).map(([n, h]) => React.createElement(A, {
    key: n,
    id: 'social-' + n,
    h: h,
    label: 'Social · ' + n
  }, React.createElement(BpIcon, {
    n: n,
    size: 22
  })))) : null, React.createElement("div", {
    className: "bp-blocks"
  }, blocks.length ? blocks.map(render) : React.createElement("div", {
    className: "bp-empty"
  }, "Nenhum bloco vis\xEDvel ainda.")), cfg.watermark !== false ? React.createElement("a", {
    className: "bp-mark",
    href: "https://useklinks.com",
    target: "_blank",
    rel: "noopener"
  }, "Feito com ", React.createElement("b", null, "KLINKS")) : null));
}
Object.assign(window, {
  BioPage,
  BpIcon
});