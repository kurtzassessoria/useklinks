function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SI = p => React.createElement(BpIcon, p);
function SRow({
  icon,
  color,
  title,
  sub,
  right,
  onClick,
  cls,
  children,
  ...rest
}) {
  return React.createElement("div", _extends({
    className: 'st-row ' + (cls || ''),
    onClick: onClick,
    role: "button",
    tabIndex: 0
  }, rest), children, icon ? React.createElement("span", {
    className: "st-ic",
    style: {
      background: color || '#3a3a40'
    }
  }, React.createElement(SI, {
    n: icon,
    size: 18,
    sw: 2
  })) : null, React.createElement("span", {
    className: "st-rt"
  }, React.createElement("b", null, title), sub ? React.createElement("span", null, sub) : null), right);
}
function SField({
  label,
  hint,
  children
}) {
  return React.createElement("div", {
    className: "st-f"
  }, label ? React.createElement("label", null, label) : null, children, hint ? React.createElement("small", null, hint) : null);
}
function SInput({
  value,
  onChange,
  ...p
}) {
  return React.createElement("input", _extends({
    className: "st-in",
    value: value ?? '',
    onChange: e => onChange(e.target.value)
  }, p));
}
function SText({
  value,
  onChange,
  ...p
}) {
  return React.createElement("textarea", _extends({
    className: "st-ta",
    value: value ?? '',
    onChange: e => onChange(e.target.value)
  }, p));
}
function SToggle({
  on,
  onChange,
  disabled
}) {
  return React.createElement("button", {
    className: 'st-tg' + (on ? ' on' : ''),
    disabled: disabled,
    onClick: e => {
      e.stopPropagation();
      onChange(!on);
    },
    "aria-pressed": on
  });
}
function SSeg({
  options,
  value,
  onChange
}) {
  return React.createElement("div", {
    className: "st-seg"
  }, options.map(([v, l]) => React.createElement("button", {
    key: v,
    className: value === v ? 'on' : '',
    onClick: () => onChange(v)
  }, l)));
}
function SBack({
  onClick,
  label = 'Voltar'
}) {
  return React.createElement("button", {
    className: "st-back",
    onClick: onClick
  }, React.createElement(SI, {
    n: "chevron",
    size: 16,
    sw: 2.2
  }), label);
}
async function shrinkImage(file, max = 1400) {
  if (!/^image\//.test(file.type)) throw new Error('Esse arquivo não é uma imagem.');
  if (/heic|heif/i.test(file.type)) throw new Error('Foto em HEIC (iPhone). Tire um print da foto ou mude a câmera para “Mais compatível”.');
  if (!/^image\/(jpeg|png|webp)/.test(file.type)) return file;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const png = file.type === 'image/png';
    const blob = await new Promise(r => c.toBlob(r, png ? 'image/png' : 'image/jpeg', .8));
    return new File([blob], file.name.replace(/\.\w+$/, png ? '.png' : '.jpg'), {
      type: blob.type
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
function SImage({
  value,
  onChange,
  slot,
  slug,
  shape,
  label = 'Enviar foto'
}) {
  const ref = React.useRef(null);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState('');
  const pick = async f => {
    if (!f) return;
    setBusy(true);
    setErr('');
    try {
      const small = await shrinkImage(f, slot === 'logo' ? 600 : 1400);
      await window.KlinksBackend.init();
      onChange(await window.KlinksBackend.engine.upload(small, slot, slug));
    } catch (e) {
      setErr(e.message || 'Falha no envio');
    }
    setBusy(false);
  };
  return React.createElement("div", null, React.createElement("div", {
    className: "st-img"
  }, React.createElement("div", {
    className: 'st-img-p ' + (shape || '') + (value ? ' has' : ''),
    style: value ? {
      backgroundImage: `url(${value})`
    } : null
  }, value ? null : React.createElement(SI, {
    n: "image",
    size: 22
  })), React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, React.createElement("button", {
    className: "st-btn sm",
    onClick: () => ref.current.click(),
    disabled: busy
  }, busy ? 'Enviando…' : value ? 'Trocar' : label), value ? React.createElement("button", {
    className: "st-btn sm danger",
    onClick: () => onChange('')
  }, "Remover") : null), React.createElement("input", {
    ref: ref,
    type: "file",
    accept: "image/*",
    hidden: true,
    onChange: e => {
      pick(e.target.files[0]);
      e.target.value = '';
    }
  })), err ? React.createElement("div", {
    className: "st-err",
    style: {
      marginTop: 10
    }
  }, err) : null);
}
function SRange({
  value,
  onChange,
  min = 0,
  max = 100
}) {
  return React.createElement("input", {
    type: "range",
    min: min,
    max: max,
    value: value ?? 50,
    onChange: e => onChange(+e.target.value),
    style: {
      width: '100%',
      accentColor: '#ff4f12'
    }
  });
}
Object.assign(window, {
  SI,
  SRow,
  SField,
  SInput,
  SText,
  SToggle,
  SSeg,
  SBack,
  SImage,
  SRange
});