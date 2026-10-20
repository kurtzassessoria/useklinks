function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function blockMeta(b, cfg) {
  const K = window.KStudio;
  if (b.type === 'link') {
    const p = K.presetFor(b.icon);
    return {
      icon: b.icon === 'logo' ? 'link' : b.icon,
      color: p.color,
      title: b.label || 'Botão sem título',
      sub: K.linkHref(b, cfg) ? (b.highlight ? 'Destaque · ' : '') + (b.sub || K.linkHref(b, cfg)) : 'Falta o link'
    };
  }
  if (b.type === 'offer') {
    const st = K.offerState(b);
    return {
      icon: 'tag',
      color: '#ff5a1f',
      title: 'Oferta · ' + (b.title || 'sem título'),
      sub: st.active ? (b.priceTo ? 'R$ ' + b.priceTo + ' · ' : '') + (st.label || 'Sem prazo') : st.scheduled ? 'Programada · aparece ' + K.daysLabel(b.days) : 'Encerrada — não aparece na página'
    };
  }
  if (b.type === 'menu') {
    const n = (b.items || []).filter(x => x.name).length;
    return {
      icon: 'menu',
      color: '#7c3aed',
      title: b.title || 'Mais pedidos',
      sub: n ? n + (n === 1 ? ' produto' : ' produtos') : 'Adicione produtos'
    };
  }
  if (b.type === 'lead') return {
    icon: 'ticket',
    color: '#22c55e',
    title: 'Cupom por WhatsApp',
    sub: (b.coupon || 'Sem cupom') + ' · contatos em Dados'
  };
  if (b.type === 'map') return {
    icon: 'map',
    color: '#ea4335',
    title: 'Mapa',
    sub: b.address || 'Falta o endereço'
  };
  if (b.type === 'hours') {
    const s = K.statusNow(b.week);
    return {
      icon: 'clock',
      color: '#0ea5e9',
      title: 'Horário de funcionamento',
      sub: s.label
    };
  }
  if (b.type === 'review') return {
    icon: 'star',
    color: '#f5b301',
    title: b.label,
    sub: !b.url ? 'Falta o link de avaliação' : b.rating ? 'Nota ' + b.rating + (b.count ? ' · ' + b.count + ' avaliações' : '') : 'Avaliações no Google'
  };
  if (b.type === 'text') return {
    icon: 'text',
    color: '#64748b',
    title: b.title || 'Aviso',
    sub: b.text
  };
  return {
    icon: 'link',
    title: b.type
  };
}
function Onboarding({
  s
}) {
  const steps = window.KStudio.steps(s.cfg);
  const done = steps.filter(x => x.done).length;
  if (s.cfg.meta?.onboardingHidden) return null;
  const next = steps.find(x => !x.done);
  return React.createElement("div", {
    className: "st-onb"
  }, React.createElement("div", {
    className: "st-onb-h"
  }, React.createElement("div", null, React.createElement("b", null, done === steps.length ? 'Tudo pronto! Sua página está completa.' : 'Configure sua página em 6 passos'), React.createElement("br", null), React.createElement("span", null, done, " de ", steps.length, " conclu\xEDdos", next ? ' · próximo: ' + next.title.toLowerCase() : '')), React.createElement("button", {
    className: "st-btn sm",
    onClick: () => s.updP('meta', {
      onboardingHidden: true
    })
  }, "Ocultar")), React.createElement("div", {
    className: "st-prog"
  }, React.createElement("i", {
    style: {
      width: done / steps.length * 100 + '%'
    }
  })), React.createElement("div", {
    className: "st-steps"
  }, steps.map((x, i) => React.createElement("button", {
    key: x.id,
    className: 'st-step' + (x.done ? ' done' : '') + (x === next ? ' next' : ''),
    onClick: () => s.go(x.go)
  }, React.createElement("span", {
    className: "n"
  }, x.done ? React.createElement(SI, {
    n: "check",
    size: 14,
    sw: 3
  }) : i + 1), React.createElement("b", null, x.title), React.createElement("span", null, x.desc)))));
}
function PagePanel({
  s
}) {
  const K = window.KStudio,
    {
      cfg
    } = s;
  const [drag, setDrag] = React.useState(null);
  const groups = ['Vender', 'Conteúdo', 'Local'];
  const socials = K.socialLinks(cfg.social).length;
  return React.createElement("div", {
    className: "st-col"
  }, React.createElement("h1", {
    className: "st-h1"
  }, "Minha p\xE1gina"), React.createElement("p", {
    className: "st-lead"
  }, "Tudo o que voc\xEA muda aqui aparece na pr\xE9via ao lado. Quando estiver bom, toque em ", React.createElement("b", null, "Publicar"), "."), React.createElement(Onboarding, {
    s: s
  }), React.createElement("div", {
    className: "st-sec"
  }, "Topo"), React.createElement("div", {
    className: "st-list"
  }, React.createElement(SRow, {
    icon: "instagram",
    color: "#2563eb",
    title: "Perfil",
    sub: cfg.profile.name,
    onClick: () => s.go({
      panel: 'page',
      sub: {
        kind: 'profile'
      }
    }),
    right: React.createElement(SI, {
      n: "chevron",
      size: 18,
      className: "st-chev"
    })
  }), React.createElement(SRow, {
    icon: "whatsapp",
    color: "#1e1b4b",
    title: "Redes sociais e WhatsApp",
    onClick: () => s.go({
      panel: 'page',
      sub: {
        kind: 'social'
      }
    }),
    right: React.createElement(React.Fragment, null, React.createElement("span", {
      className: "st-cnt"
    }, socials), React.createElement(SI, {
      n: "chevron",
      size: 18
    }))
  })), React.createElement("div", {
    className: "st-sec"
  }, React.createElement("span", null, "Blocos da página · " + cfg.blocks.length), React.createElement("span", {
    style: {
      letterSpacing: 0,
      textTransform: 'none',
      fontWeight: 600
    }
  }, "Arraste para reordenar")), React.createElement("div", {
    className: "st-list"
  }, cfg.blocks.map((b, i) => {
    const m = blockMeta(b, cfg);
    return React.createElement(SRow, _extends({
      key: b.id
    }, m, {
      cls: (b.on ? '' : 'off') + (drag === i ? ' drag' : ''),
      draggable: true,
      onDragStart: () => setDrag(i),
      onDragEnd: () => setDrag(null),
      onDragOver: e => {
        e.preventDefault();
        if (drag != null && drag !== i) {
          s.moveBlock(drag, i);
          setDrag(i);
        }
      },
      onClick: () => s.go({
        panel: 'page',
        sub: {
          kind: 'block',
          id: b.id
        }
      }),
      right: React.createElement(React.Fragment, null, React.createElement(SToggle, {
        on: b.on,
        onChange: v => s.updBlock(b.id, {
          on: v
        })
      }), React.createElement(SI, {
        n: "chevron",
        size: 18
      }))
    }), React.createElement("span", {
      className: "st-grip",
      onClick: e => e.stopPropagation()
    }, React.createElement("svg", {
      width: "10",
      height: "16",
      viewBox: "0 0 10 16",
      fill: "currentColor"
    }, React.createElement("circle", {
      cx: "2",
      cy: "2",
      r: "1.6"
    }), React.createElement("circle", {
      cx: "8",
      cy: "2",
      r: "1.6"
    }), React.createElement("circle", {
      cx: "2",
      cy: "8",
      r: "1.6"
    }), React.createElement("circle", {
      cx: "8",
      cy: "8",
      r: "1.6"
    }), React.createElement("circle", {
      cx: "2",
      cy: "14",
      r: "1.6"
    }), React.createElement("circle", {
      cx: "8",
      cy: "14",
      r: "1.6"
    }))));
  })), React.createElement("h2", {
    className: "st-h1",
    style: {
      fontSize: 19,
      marginTop: 40
    }
  }, "Adicionar bloco"), groups.map(g => React.createElement(React.Fragment, {
    key: g
  }, React.createElement("div", {
    className: "st-sec"
  }, g), React.createElement("div", {
    className: "st-add"
  }, K.BLOCK_TYPES.filter(t => t.group === g).map(t => React.createElement(SRow, {
    key: t.type,
    icon: t.icon,
    color: t.color,
    title: t.name,
    sub: t.desc,
    onClick: () => t.type === 'link' ? s.go({
      panel: 'page',
      sub: {
        kind: 'add-link'
      }
    }) : t.type === 'offer' ? s.go({
      panel: 'offers'
    }) : s.addBlock(t.type),
    right: React.createElement("span", {
      className: "st-plus"
    }, "+")
  }))))));
}
function AddLinkPicker({
  s
}) {
  const K = window.KStudio;
  return React.createElement("div", {
    className: "st-col"
  }, React.createElement(SBack, {
    onClick: () => s.go({
      panel: 'page'
    }),
    label: "Minha p\xE1gina"
  }), React.createElement("h1", {
    className: "st-h1"
  }, "Novo bot\xE3o"), React.createElement("p", {
    className: "st-lead"
  }, "Escolha o tipo. J\xE1 vem com \xEDcone e texto prontos \u2014 voc\xEA s\xF3 cola o link."), React.createElement("div", {
    className: "st-add"
  }, K.LINK_PRESETS.map(p => React.createElement(SRow, {
    key: p.icon,
    icon: p.icon,
    color: p.color,
    title: p.label,
    onClick: () => s.addBlock('link', p),
    right: React.createElement("span", {
      className: "st-plus"
    }, "+")
  }))));
}
function ProfileEditor({
  s
}) {
  const p = s.cfg.profile,
    set = x => s.updP('profile', x);
  return React.createElement("div", {
    className: "st-col"
  }, React.createElement(SBack, {
    onClick: () => s.go({
      panel: 'page'
    }),
    label: "Minha p\xE1gina"
  }), React.createElement("h1", {
    className: "st-h1"
  }, "Perfil"), React.createElement("p", {
    className: "st-lead"
  }, "O topo da sua p\xE1gina: \xE9 o que o cliente v\xEA primeiro."), React.createElement(SField, {
    label: "Logo",
    hint: "Quadrada, de prefer\xEAncia com fundo. Aparece no c\xEDrculo."
  }, React.createElement(SImage, {
    value: p.logo,
    onChange: v => set({
      logo: v
    }),
    slot: "logo",
    slug: s.cfg.slug,
    shape: "round",
    label: "Enviar logo"
  })), React.createElement(SField, {
    label: "Foto de capa",
    hint: "Uma foto do seu prato mais vendido ou do sal\xE3o funciona melhor."
  }, React.createElement(SImage, {
    value: p.cover,
    onChange: v => set({
      cover: v
    }),
    slot: "cover",
    slug: s.cfg.slug,
    shape: "wide",
    label: "Enviar capa"
  })), p.cover ? React.createElement(SField, {
    label: "Posi\xE7\xE3o da capa"
  }, React.createElement(SRange, {
    value: p.coverY,
    onChange: v => set({
      coverY: v
    })
  })) : null, React.createElement(SField, {
    label: "Nome do restaurante"
  }, React.createElement(SInput, {
    value: p.name,
    onChange: v => set({
      name: v
    }),
    maxLength: 40
  })), React.createElement(SField, {
    label: "Frase curta",
    hint: "O que voc\xEA vende e onde. Ex.: \u201CRod\xEDzio de sushi \xB7 Penha-SC\u201D."
  }, React.createElement(SText, {
    value: p.tagline,
    onChange: v => set({
      tagline: v
    }),
    maxLength: 120,
    style: {
      minHeight: 70
    }
  })));
}
function SocialEditor({
  s
}) {
  const so = s.cfg.social,
    set = x => s.updP('social', x);
  return React.createElement("div", {
    className: "st-col"
  }, React.createElement(SBack, {
    onClick: () => s.go({
      panel: 'page'
    }),
    label: "Minha p\xE1gina"
  }), React.createElement("h1", {
    className: "st-h1"
  }, "Redes sociais"), React.createElement("p", {
    className: "st-lead"
  }, "Aparecem como \xEDcones embaixo do nome. Deixe em branco o que n\xE3o usa."), React.createElement(SField, {
    label: "WhatsApp",
    hint: "Com DDD, s\xF3 n\xFAmeros. Ex.: 47 99200-0820"
  }, React.createElement("div", {
    className: "st-pre"
  }, React.createElement("span", null, "+55"), React.createElement(SInput, {
    value: so.whatsapp?.replace(/^55/, ''),
    onChange: v => set({
      whatsapp: v.replace(/\D/g, '')
    }),
    inputMode: "numeric",
    placeholder: "47992000820"
  }))), React.createElement(SField, {
    label: "Instagram"
  }, React.createElement("div", {
    className: "st-pre"
  }, React.createElement("span", null, "@"), React.createElement(SInput, {
    value: so.instagram,
    onChange: v => set({
      instagram: v.replace('@', '')
    }),
    placeholder: "seurestaurante"
  }))), React.createElement(SField, {
    label: "TikTok"
  }, React.createElement("div", {
    className: "st-pre"
  }, React.createElement("span", null, "@"), React.createElement(SInput, {
    value: so.tiktok,
    onChange: v => set({
      tiktok: v.replace('@', '')
    })
  }))), React.createElement(SField, {
    label: "Facebook",
    hint: "Link completo da p\xE1gina"
  }, React.createElement(SInput, {
    value: so.facebook,
    onChange: v => set({
      facebook: v
    }),
    placeholder: "facebook.com/seurestaurante"
  })));
}
function BlockEditor({
  s,
  id
}) {
  const K = window.KStudio;
  const b = s.cfg.blocks.find(x => x.id === id);
  if (!b) return React.createElement("div", {
    className: "st-col"
  }, React.createElement(SBack, {
    onClick: () => s.go({
      panel: 'page'
    })
  }), React.createElement("p", {
    className: "st-lead"
  }, "Bloco removido."));
  const set = x => s.updBlock(id, x);
  const back = b.type === 'offer' && s.nav.from === 'offers' ? {
    panel: 'offers'
  } : {
    panel: 'page'
  };
  const m = blockMeta(b, s.cfg);
  let body = null;
  if (b.type === 'link') {
    const pr = K.presetFor(b.icon);
    body = React.createElement(React.Fragment, null, React.createElement(SField, {
      label: "Tipo de bot\xE3o"
    }, React.createElement("div", {
      className: "st-chips"
    }, K.LINK_PRESETS.map(p => React.createElement("button", {
      key: p.icon,
      className: 'st-chip' + (b.icon === p.icon ? ' on' : ''),
      onClick: () => set({
        icon: p.icon
      })
    }, React.createElement("i", {
      style: {
        background: p.color
      }
    }, React.createElement(SI, {
      n: p.icon,
      size: 16,
      sw: 2
    })), p.short)), s.cfg.profile.logo ? React.createElement("button", {
      className: 'st-chip' + (b.icon === 'logo' ? ' on' : ''),
      onClick: () => set({
        icon: 'logo'
      })
    }, React.createElement("i", {
      style: {
        background: `center/cover url(${s.cfg.profile.logo})`
      }
    }), "Logo") : null)), React.createElement(SField, {
      label: "Texto do bot\xE3o"
    }, React.createElement(SInput, {
      value: b.label,
      onChange: v => set({
        label: v
      }),
      maxLength: 42
    })), React.createElement(SField, {
      label: "Texto menor (opcional)",
      hint: "Ex.: \u201CEntrega em ~35 min\u201D ou \u201CAtendimento at\xE9 23h\u201D."
    }, React.createElement(SInput, {
      value: b.sub,
      onChange: v => set({
        sub: v
      }),
      maxLength: 60
    })), pr.kind === 'whatsapp' ? React.createElement(React.Fragment, null, React.createElement(SField, {
      label: "N\xFAmero do WhatsApp",
      hint: s.cfg.social.whatsapp && !b.phone ? 'Vazio = usa o número das Redes sociais.' : 'Com DDD, só números.'
    }, React.createElement("div", {
      className: "st-pre"
    }, React.createElement("span", null, "+55"), React.createElement(SInput, {
      value: b.phone?.replace(/^55/, ''),
      onChange: v => set({
        phone: v.replace(/\D/g, '')
      }),
      inputMode: "numeric"
    }))), React.createElement(SField, {
      label: "Mensagem que j\xE1 vem escrita",
      hint: "O cliente s\xF3 aperta enviar \u2014 voc\xEA j\xE1 sabe que veio da bio."
    }, React.createElement(SText, {
      value: b.msg,
      onChange: v => set({
        msg: v
      }),
      style: {
        minHeight: 70
      }
    }))) : pr.kind === 'phone' ? React.createElement(SField, {
      label: "Telefone"
    }, React.createElement("div", {
      className: "st-pre"
    }, React.createElement("span", null, "+55"), React.createElement(SInput, {
      value: b.phone?.replace(/^55/, ''),
      onChange: v => set({
        phone: v.replace(/\D/g, '')
      }),
      inputMode: "numeric"
    }))) : React.createElement(SField, {
      label: "Link",
      hint: pr.kind === 'maps' ? 'Vazio = usa o endereço do bloco Mapa.' : pr.hint
    }, React.createElement(SInput, {
      value: b.url,
      onChange: v => set({
        url: v.trim()
      }),
      placeholder: "https://",
      inputMode: "url"
    })), React.createElement("div", {
      className: "st-card",
      style: {
        padding: '4px 16px'
      }
    }, React.createElement("div", {
      className: "st-tgrow"
    }, React.createElement("div", null, React.createElement("b", null, "Bot\xE3o em destaque"), React.createElement("span", null, "Cor forte. Use s\xF3 no principal (normalmente o pedido).")), React.createElement(SToggle, {
      on: b.highlight,
      onChange: v => set({
        highlight: v
      })
    }))));
  }
  if (b.type === 'offer') {
    const st = K.offerState(b);
    body = React.createElement(React.Fragment, null, React.createElement(SField, {
      label: "Foto do produto",
      hint: "Foto real vende mais que arte. Bem iluminada, de cima ou 45\xB0."
    }, React.createElement(SImage, {
      value: b.image,
      onChange: v => set({
        image: v
      }),
      slot: 'offer-' + b.id,
      slug: s.cfg.slug,
      shape: "wide"
    })), b.image ? React.createElement(SField, {
      label: "Posi\xE7\xE3o da foto"
    }, React.createElement(SRange, {
      value: b.imageY,
      onChange: v => set({
        imageY: v
      })
    })) : null, React.createElement(SField, {
      label: "Etiqueta",
      hint: "Ex.: Pizza do m\xEAs \xB7 S\xF3 hoje \xB7 Combo"
    }, React.createElement(SInput, {
      value: b.eyebrow,
      onChange: v => set({
        eyebrow: v
      }),
      maxLength: 24
    })), React.createElement(SField, {
      label: "Nome da oferta"
    }, React.createElement(SInput, {
      value: b.title,
      onChange: v => set({
        title: v
      }),
      maxLength: 50
    })), React.createElement(SField, {
      label: "Descri\xE7\xE3o"
    }, React.createElement(SText, {
      value: b.desc,
      onChange: v => set({
        desc: v
      }),
      maxLength: 180,
      style: {
        minHeight: 70
      }
    })), React.createElement("div", {
      className: "st-two"
    }, React.createElement(SField, {
      label: "Pre\xE7o de (R$)"
    }, React.createElement(SInput, {
      value: b.priceFrom,
      onChange: v => set({
        priceFrom: v
      }),
      inputMode: "decimal",
      placeholder: "89,90"
    })), React.createElement(SField, {
      label: "Pre\xE7o por (R$)"
    }, React.createElement(SInput, {
      value: b.priceTo,
      onChange: v => set({
        priceTo: v
      }),
      inputMode: "decimal",
      placeholder: "69,90"
    }))), React.createElement(SField, {
      label: "Cupom (opcional)",
      hint: "O cliente toca e copia. Crie o mesmo cupom no seu card\xE1pio digital."
    }, React.createElement(SInput, {
      value: b.coupon,
      onChange: v => set({
        coupon: v.toUpperCase().replace(/\s/g, '')
      }),
      placeholder: "PIZZA10"
    })), React.createElement(SField, {
      label: "Dias em que aparece",
      hint: (b.days || []).length && b.days.length < 7 ? 'Aparece só ' + K.daysLabel(b.days) + '. Nos outros dias some sozinha.' : 'Todos os dias. Toque nos dias para programar (ex.: “Terça do hambúrguer”).'
    }, React.createElement("div", {
      className: "st-chips"
    }, K.WEEK_S.map((w, i) => {
      const ds = b.days && b.days.length ? b.days : [0, 1, 2, 3, 4, 5, 6];
      const on = ds.includes(i);
      return React.createElement("button", {
        key: i,
        className: 'st-chip' + (on && ds.length < 7 ? ' on' : ''),
        onClick: () => {
          let n = on ? ds.filter(x => x !== i) : [...ds, i];
          if (ds.length === 7) n = [i];
          set({
            days: n.length && n.length < 7 ? n : []
          });
        }
      }, w);
    }))), React.createElement(SField, {
      label: "Termina em",
      hint: st.active || st.scheduled ? 'Depois dessa data a oferta some sozinha da página. Vazio = sem prazo.' : 'Já encerrou — está escondida. Mude a data para voltar.'
    }, React.createElement("input", {
      type: "date",
      className: "st-in",
      value: b.ends || '',
      onChange: e => set({
        ends: e.target.value
      }),
      style: {
        colorScheme: 'dark'
      }
    })), React.createElement("div", {
      className: "st-two"
    }, React.createElement(SField, {
      label: "Texto do bot\xE3o"
    }, React.createElement(SInput, {
      value: b.cta,
      onChange: v => set({
        cta: v
      }),
      maxLength: 24
    })), React.createElement(SField, {
      label: "Link do bot\xE3o"
    }, React.createElement(SInput, {
      value: b.url,
      onChange: v => set({
        url: v.trim()
      }),
      placeholder: "Link do produto no card\xE1pio"
    }))));
  }
  if (b.type === 'map') body = React.createElement(React.Fragment, null, React.createElement(SField, {
    label: "Endere\xE7o completo",
    hint: "Rua, n\xFAmero, bairro e cidade \u2014 igual aparece no Google Maps."
  }, React.createElement(SText, {
    value: b.address,
    onChange: v => set({
      address: v
    }),
    style: {
      minHeight: 70
    },
    placeholder: "R. Tim\xF3teo Perfeito Flores, 3482 - Gravat\xE1, Penha - SC"
  })), React.createElement(SField, {
    label: "Texto do bot\xE3o"
  }, React.createElement(SInput, {
    value: b.label,
    onChange: v => set({
      label: v
    })
  })), b.address ? React.createElement("div", {
    className: "st-card",
    style: {
      padding: 0,
      overflow: 'hidden'
    }
  }, React.createElement("iframe", {
    title: "mapa",
    src: K.mapsEmbed(b.address),
    style: {
      width: '100%',
      height: 220,
      border: 0,
      display: 'block'
    },
    loading: "lazy"
  })) : null);
  if (b.type === 'hours') body = React.createElement(React.Fragment, null, React.createElement("p", {
    className: "st-lead",
    style: {
      marginTop: -10
    }
  }, "Com isso, a p\xE1gina mostra ", React.createElement("b", null, "\u201CAberto agora\u201D"), " ou ", React.createElement("b", null, "\u201CFechado \xB7 abre \xE0s 18h30\u201D"), " sozinha. Se fecha depois da meia-noite, \xE9 s\xF3 colocar o hor\xE1rio (ex.: 01:00)."), React.createElement("div", {
    className: "st-card",
    style: {
      padding: '4px 16px'
    }
  }, b.week.map((w, i) => React.createElement("div", {
    key: i,
    className: "st-tgrow"
  }, React.createElement("div", {
    style: {
      minWidth: 80
    }
  }, React.createElement("b", null, K.WEEK[i])), w.on ? React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      flex: 1,
      justifyContent: 'flex-end'
    }
  }, React.createElement("input", {
    type: "time",
    className: "st-in",
    style: {
      width: 110,
      height: 38,
      colorScheme: 'dark'
    },
    value: w.open,
    onChange: e => set({
      week: b.week.map((x, j) => j === i ? {
        ...x,
        open: e.target.value
      } : x)
    })
  }), React.createElement("span", {
    style: {
      color: 'var(--s-mut)'
    }
  }, "\xE0s"), React.createElement("input", {
    type: "time",
    className: "st-in",
    style: {
      width: 110,
      height: 38,
      colorScheme: 'dark'
    },
    value: w.close,
    onChange: e => set({
      week: b.week.map((x, j) => j === i ? {
        ...x,
        close: e.target.value
      } : x)
    })
  })) : React.createElement("span", {
    style: {
      flex: 1,
      textAlign: 'right',
      color: 'var(--s-mut)',
      fontSize: 13
    }
  }, "Fechado"), React.createElement(SToggle, {
    on: w.on,
    onChange: v => set({
      week: b.week.map((x, j) => j === i ? {
        ...x,
        on: v
      } : x)
    })
  })))), React.createElement("button", {
    className: "st-btn sm",
    style: {
      marginTop: 12
    },
    onClick: () => set({
      week: b.week.map(() => ({
        ...(b.week.find(x => x.on) || b.week[0]),
        on: true
      }))
    })
  }, "Copiar o 1\xBA hor\xE1rio para todos os dias"));
  if (b.type === 'review') {
    const qs = [0, 1, 2].map(i => (b.quotes || [])[i] || {
      text: '',
      who: ''
    });
    const setQ = (i, x) => set({
      quotes: qs.map((q, j) => j === i ? {
        ...q,
        ...x
      } : q)
    });
    body = React.createElement(React.Fragment, null, React.createElement(SField, {
      label: "Texto do bot\xE3o"
    }, React.createElement(SInput, {
      value: b.label,
      onChange: v => set({
        label: v
      })
    })), React.createElement(SField, {
      label: "Link de avalia\xE7\xE3o do Google",
      hint: "No Perfil da Empresa no Google: \u201CPedir avalia\xE7\xF5es\u201D \u2192 copiar link. Come\xE7a com g.page/r/\u2026"
    }, React.createElement(SInput, {
      value: b.url,
      onChange: v => set({
        url: v.trim()
      }),
      placeholder: "https://g.page/r/..."
    })), React.createElement("div", {
      className: "st-two"
    }, React.createElement(SField, {
      label: "Nota no Google",
      hint: "Copie do Google. Vazio = s\xF3 o bot\xE3o."
    }, React.createElement(SInput, {
      value: b.rating,
      onChange: v => set({
        rating: v.replace(/[^\d,.]/g, '').replace('.', ',').slice(0, 3)
      }),
      placeholder: "4,9",
      inputMode: "decimal"
    })), React.createElement(SField, {
      label: "N\xBA de avalia\xE7\xF5es"
    }, React.createElement(SInput, {
      value: b.count,
      onChange: v => set({
        count: v.replace(/\D/g, '')
      }),
      placeholder: "312",
      inputMode: "numeric"
    }))), React.createElement("div", {
      className: "st-sec"
    }, "Depoimentos (at\xE9 3)"), React.createElement("p", {
      className: "st-lead",
      style: {
        marginTop: -4
      }
    }, "Copie avalia\xE7\xF5es reais do seu Google. Prova social perto do bot\xE3o de pedido aumenta os cliques."), qs.map((q, i) => React.createElement("div", {
      key: i,
      className: "st-two"
    }, React.createElement(SField, {
      label: 'Depoimento ' + (i + 1)
    }, React.createElement(SText, {
      value: q.text,
      onChange: v => setQ(i, {
        text: v
      }),
      maxLength: 160,
      style: {
        minHeight: 60
      },
      placeholder: "Melhor pizza da cidade, chegou quentinha!"
    })), React.createElement(SField, {
      label: "Nome"
    }, React.createElement(SInput, {
      value: q.who,
      onChange: v => setQ(i, {
        who: v
      }),
      maxLength: 30,
      placeholder: "Ana P."
    })))));
  }
  if (b.type === 'menu') {
    const its = b.items || [];
    const setI = (iid, x) => set({
      items: its.map(it => it.id === iid ? {
        ...it,
        ...x
      } : it)
    });
    body = React.createElement(React.Fragment, null, React.createElement(SField, {
      label: "T\xEDtulo do bloco"
    }, React.createElement(SInput, {
      value: b.title,
      onChange: v => set({
        title: v
      }),
      maxLength: 30,
      placeholder: "Mais pedidos"
    })), React.createElement(SField, {
      label: "Link padr\xE3o",
      hint: "Para onde vai quem toca num produto (seu card\xE1pio digital). Cada produto pode ter um link pr\xF3prio."
    }, React.createElement(SInput, {
      value: b.url,
      onChange: v => set({
        url: v.trim()
      }),
      placeholder: "https://",
      inputMode: "url"
    })), its.map((it, i) => React.createElement("div", {
      key: it.id,
      className: "st-card",
      style: {
        marginBottom: 10
      }
    }, React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 10
      }
    }, React.createElement("b", {
      style: {
        flex: 1
      }
    }, "Produto ", i + 1), i > 0 ? React.createElement("button", {
      className: "st-btn sm",
      onClick: () => {
        const n = [...its];
        [n[i - 1], n[i]] = [n[i], n[i - 1]];
        set({
          items: n
        });
      }
    }, "Subir") : null, React.createElement("button", {
      className: "st-btn sm danger",
      style: {
        marginLeft: 6
      },
      onClick: () => set({
        items: its.filter(x => x.id !== it.id)
      })
    }, "Remover")), React.createElement(SField, {
      label: "Foto"
    }, React.createElement(SImage, {
      value: it.image,
      onChange: v => setI(it.id, {
        image: v
      }),
      slot: 'menu-' + it.id,
      slug: s.cfg.slug,
      shape: "round"
    })), React.createElement("div", {
      className: "st-two"
    }, React.createElement(SField, {
      label: "Nome"
    }, React.createElement(SInput, {
      value: it.name,
      onChange: v => setI(it.id, {
        name: v
      }),
      maxLength: 40
    })), React.createElement(SField, {
      label: "Pre\xE7o (R$)"
    }, React.createElement(SInput, {
      value: it.price,
      onChange: v => setI(it.id, {
        price: v
      }),
      inputMode: "decimal",
      placeholder: "49,90"
    }))), React.createElement(SField, {
      label: "Descri\xE7\xE3o curta (opcional)"
    }, React.createElement(SInput, {
      value: it.desc,
      onChange: v => setI(it.id, {
        desc: v
      }),
      maxLength: 70
    })), React.createElement(SField, {
      label: "Link pr\xF3prio (opcional)"
    }, React.createElement(SInput, {
      value: it.url,
      onChange: v => setI(it.id, {
        url: v.trim()
      }),
      placeholder: "Link do produto no card\xE1pio",
      inputMode: "url"
    })))), its.length < 6 ? React.createElement("button", {
      className: "st-btn sm",
      onClick: () => set({
        items: [...its, {
          id: K.uid(),
          name: '',
          desc: '',
          price: '',
          image: '',
          url: ''
        }]
      })
    }, "+ Adicionar produto") : React.createElement("p", {
      className: "st-lead"
    }, "M\xE1ximo de 6 produtos. Menos \xE9 mais: 3 campe\xF5es vendem melhor."));
  }
  if (b.type === 'lead') body = React.createElement(React.Fragment, null, React.createElement("p", {
    className: "st-lead",
    style: {
      marginTop: -10
    }
  }, "O cliente deixa o WhatsApp e recebe o cupom na hora. Os contatos ficam em ", React.createElement("b", null, "Dados \u2192 Contatos"), ", prontos para voc\xEA mandar promo\xE7\xF5es. Ele marca a autoriza\xE7\xE3o (LGPD) antes de enviar."), React.createElement(SField, {
    label: "T\xEDtulo"
  }, React.createElement(SInput, {
    value: b.title,
    onChange: v => set({
      title: v
    }),
    maxLength: 50
  })), React.createElement(SField, {
    label: "Texto"
  }, React.createElement(SInput, {
    value: b.desc,
    onChange: v => set({
      desc: v
    }),
    maxLength: 90
  })), React.createElement("div", {
    className: "st-two"
  }, React.createElement(SField, {
    label: "Cupom",
    hint: "Crie o mesmo cupom no seu card\xE1pio digital."
  }, React.createElement(SInput, {
    value: b.coupon,
    onChange: v => set({
      coupon: v.toUpperCase().replace(/\s/g, '')
    }),
    placeholder: "BEMVINDO10"
  })), React.createElement(SField, {
    label: "Texto do bot\xE3o"
  }, React.createElement(SInput, {
    value: b.cta,
    onChange: v => set({
      cta: v
    }),
    maxLength: 24
  }))), React.createElement(SField, {
    label: "Link para usar o cupom",
    hint: "Depois de ganhar o cupom, aparece o bot\xE3o \u201CUsar no pedido\u201D."
  }, React.createElement(SInput, {
    value: b.url,
    onChange: v => set({
      url: v.trim()
    }),
    placeholder: "Link do seu card\xE1pio digital",
    inputMode: "url"
  })));
  if (b.type === 'text') body = React.createElement(React.Fragment, null, React.createElement(SField, {
    label: "T\xEDtulo (opcional)"
  }, React.createElement(SInput, {
    value: b.title,
    onChange: v => set({
      title: v
    }),
    placeholder: "Ex.: Feriado de Natal"
  })), React.createElement(SField, {
    label: "Texto"
  }, React.createElement(SText, {
    value: b.text,
    onChange: v => set({
      text: v
    }),
    maxLength: 400
  })));
  return React.createElement("div", {
    className: "st-col"
  }, React.createElement(SBack, {
    onClick: () => s.go(back),
    label: back.panel === 'offers' ? 'Ofertas' : 'Minha página'
  }), React.createElement("h1", {
    className: "st-h1"
  }, React.createElement("span", {
    className: "st-ic",
    style: {
      background: m.color
    }
  }, React.createElement(SI, {
    n: m.icon,
    size: 18,
    sw: 2
  })), b.type === 'offer' ? 'Oferta' : m.title), React.createElement("div", {
    className: "st-card",
    style: {
      padding: '4px 16px',
      marginBottom: 22
    }
  }, React.createElement("div", {
    className: "st-tgrow"
  }, React.createElement("div", null, React.createElement("b", null, "Vis\xEDvel na p\xE1gina"), React.createElement("span", null, "Desligue para esconder sem apagar.")), React.createElement(SToggle, {
    on: b.on,
    onChange: v => set({
      on: v
    })
  }))), body, React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 26
    }
  }, React.createElement("button", {
    className: "st-btn sm",
    onClick: () => s.duplicate(id)
  }, "Duplicar"), React.createElement("button", {
    className: "st-btn sm danger",
    onClick: () => {
      if (confirm('Apagar este bloco?')) {
        s.removeBlock(id);
        s.go(back);
      }
    }
  }, "Apagar bloco")));
}
function OffersPanel({
  s
}) {
  const K = window.KStudio;
  const offers = s.cfg.blocks.filter(b => b.type === 'offer');
  const open = id => s.go({
    panel: 'page',
    sub: {
      kind: 'block',
      id
    },
    from: 'offers'
  });
  return React.createElement("div", {
    className: "st-col"
  }, React.createElement("h1", {
    className: "st-h1"
  }, "Ofertas"), React.createElement("p", {
    className: "st-lead"
  }, "Promo\xE7\xF5es com foto, pre\xE7o, cupom e prazo. Quando a data passa, a oferta sai da p\xE1gina sozinha \u2014 voc\xEA nunca mais esquece promo\xE7\xE3o vencida no ar."), React.createElement("div", {
    className: "st-sec"
  }, React.createElement("span", null, "Suas ofertas · " + offers.length)), React.createElement("div", {
    className: "st-list"
  }, offers.length ? offers.map(b => {
    const m = blockMeta(b, s.cfg);
    return React.createElement(SRow, _extends({
      key: b.id
    }, m, {
      cls: b.on && K.offerState(b).active ? '' : 'off',
      onClick: () => open(b.id),
      right: React.createElement(React.Fragment, null, React.createElement(SToggle, {
        on: b.on,
        onChange: v => s.updBlock(b.id, {
          on: v
        })
      }), React.createElement(SI, {
        n: "chevron",
        size: 18
      }))
    }));
  }) : React.createElement("div", {
    className: "st-card",
    style: {
      color: 'var(--s-mut)',
      fontSize: 14
    }
  }, "Nenhuma oferta ainda. Comece por um modelo abaixo.")), React.createElement("div", {
    className: "st-sec"
  }, "Come\xE7ar de um modelo"), React.createElement("div", {
    className: "st-add"
  }, K.OFFER_TEMPLATES.map(t => React.createElement(SRow, {
    key: t.name,
    icon: t.coupon ? 'ticket' : 'tag',
    color: "#ff5a1f",
    title: t.name,
    sub: t.title,
    onClick: () => {
      const id = s.addBlock('offer', t, true);
      if (id) open(id);
    },
    right: React.createElement("span", {
      className: "st-plus"
    }, "+")
  }))), React.createElement("div", {
    className: "st-sec"
  }, "Dica"), React.createElement("div", {
    className: "st-ins"
  }, React.createElement("div", {
    className: "st-in-row"
  }, React.createElement(SI, {
    n: "star",
    size: 18
  }), React.createElement("span", null, "Uma oferta por vez converte melhor que tr\xEAs. Coloque a oferta logo abaixo do bot\xE3o de pedido e divulgue nos stories com \u201Clink na bio\u201D."))));
}
Object.assign(window, {
  PagePanel,
  AddLinkPicker,
  ProfileEditor,
  SocialEditor,
  BlockEditor,
  OffersPanel,
  blockMeta
});