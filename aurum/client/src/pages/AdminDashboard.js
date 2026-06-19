import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const gold = 'var(--gold)';
const dark2 = 'var(--dark2)';
const dark3 = 'var(--dark3)';
const SIDEBAR_W = 265;

const DEFAULT_PROFILE = { projection: 5, summer: 5, winter: 5, fall: 5, spring: 5, day: 5, night: 5 };

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  const colors = { success: '#27ae60', error: '#e74c3c', info: gold };
  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: dark2, border: `1px solid ${colors[type] || gold}`, color: colors[type] || gold, padding: '.88rem 1.4rem', zIndex: 9999, fontSize: '.82rem', animation: 'fadeUp .3s ease', boxShadow: '0 8px 32px rgba(0,0,0,.5)' }}>
      {type === 'success' ? '✅' : type === 'error' ? '❌' : '✨'} {msg}
    </div>
  );
}

function Confirm({ title, msg, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.25)', padding: '2rem', maxWidth: 400, width: '90%' }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', color: gold, marginBottom: '1rem' }}>{title}</h3>
        <p style={{ color: 'var(--light-gray)', marginBottom: '1.8rem', fontSize: '.88rem' }}>{msg}</p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onConfirm} style={{ background: 'var(--danger)', color: '#fff', border: 'none', padding: '.75rem 1.5rem', cursor: 'pointer', fontFamily: "'Jost',sans-serif", fontSize: '.78rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>Delete</button>
          <button onClick={onCancel} className="btn-outline" style={{ padding: '.75rem 1.5rem' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ── SCENT PROFILE SLIDERS ── */
const PROFILE_FIELDS = [
  { key: 'projection', label: '📡 Projection',  group: 'performance', desc: 'How far the scent radiates', color: '#C9A84C' },
  { key: 'summer',     label: '☀️ Summer',       group: 'season',      desc: 'Suitability for summer',    color: '#F4A261' },
  { key: 'winter',     label: '❄️ Winter',        group: 'season',      desc: 'Suitability for winter',    color: '#74B9D7' },
  { key: 'fall',       label: '🍂 Fall / Autumn', group: 'season',      desc: 'Suitability for fall',      color: '#D4845A' },
  { key: 'spring',     label: '🌸 Spring',        group: 'season',      desc: 'Suitability for spring',    color: '#A8D8A8' },
  { key: 'day',        label: '🌤️ Day',            group: 'time',        desc: 'Daytime wearability',       color: '#F9CA24' },
  { key: 'night',      label: '🌙 Night',          group: 'time',        desc: 'Evening / nighttime wear',  color: '#6C5CE7' },
];

function ScentProfileSliders({ profile, onChange }) {
  const groups = [
    { title: '📡 Performance', fields: PROFILE_FIELDS.filter(f => f.group === 'performance') },
    { title: '🍃 Season Suitability', fields: PROFILE_FIELDS.filter(f => f.group === 'season') },
    { title: '⏱️ Time of Day', fields: PROFILE_FIELDS.filter(f => f.group === 'time') },
  ];

  return (
    <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', padding: '2rem', marginBottom: '1.5rem' }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', color: gold, marginBottom: '.4rem', paddingBottom: '.8rem', borderBottom: '1px solid rgba(201,168,76,.12)' }}>
        Scent Profile
      </div>
      <p style={{ color: 'var(--gray)', fontSize: '.75rem', marginBottom: '1.8rem' }}>
        Set each slider from 0 (not suitable) to 10 (perfect). These appear as visual bars on the product detail page.
      </p>
      {groups.map(group => (
        <div key={group.title} style={{ marginBottom: '1.8rem' }}>
          <div style={{ fontSize: '.7rem', letterSpacing: '.18em', textTransform: 'uppercase', color: gold, marginBottom: '1rem', borderLeft: `3px solid ${gold}`, paddingLeft: '.6rem' }}>{group.title}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
            {group.fields.map(field => {
              const val = profile[field.key] ?? 5;
              return (
                <div key={field.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                    <label style={{ fontSize: '.78rem', color: 'var(--light-gray)' }}>{field.label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <span style={{ background: 'rgba(201,168,76,.12)', border: `1px solid ${field.color}40`, color: field.color, fontSize: '.72rem', fontWeight: 600, padding: '.15rem .5rem', minWidth: 28, textAlign: 'center' }}>{val}</span>
                      <span style={{ fontSize: '.62rem', color: 'var(--gray)' }}>/10</span>
                    </div>
                  </div>
                  {/* Track + fill */}
                  <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,.07)', borderRadius: 3, marginBottom: '.3rem' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${val * 10}%`, background: `linear-gradient(90deg, ${field.color}88, ${field.color})`, borderRadius: 3, transition: 'width .2s' }} />
                  </div>
                  <input
                    type="range" min={0} max={10} step={1} value={val}
                    onChange={e => onChange({ ...profile, [field.key]: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: field.color, cursor: 'pointer', height: 4 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.6rem', color: 'rgba(255,255,255,.2)', marginTop: '.1rem' }}>
                    <span>0</span><span>5</span><span>10</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── OVERVIEW PANEL ── */
function OverviewPanel({ products, brands, orders, users, messages }) {
  const revenue = orders.reduce((s, o) => s + parseFloat(o.total || 0), 0);
  const unread = messages.filter(m => !m.is_read).length;
  const stats = [
    { icon: '🧴', label: 'Products', value: products.length },
    { icon: '🏷️', label: 'Brands', value: brands.length },
    { icon: '📦', label: 'Orders', value: orders.length },
    { icon: '👥', label: 'Users', value: users.length },
    { icon: '💰', label: 'Revenue', value: `$${revenue.toFixed(0)}` },
  ];
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}><h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.2rem', fontWeight: 300 }}>Dashboard</h1><p style={{ color: 'var(--gray)', fontSize: '.8rem', marginTop: '.2rem' }}>Welcome back — here's your store overview.</p></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '1.2rem', marginBottom: '2rem' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', padding: '1.4rem', position: 'relative', overflow: 'hidden', transition: 'all .3s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.14)'; e.currentTarget.style.transform = 'none'; }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '1.5rem', color: 'rgba(201,168,76,.18)' }}>{s.icon}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.3rem', color: gold, lineHeight: 1, marginBottom: '.3rem' }}>{s.value}</div>
            <div style={{ fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gray)' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
        <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', padding: '1.8rem' }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', color: gold, marginBottom: '1.4rem', paddingBottom: '.8rem', borderBottom: '1px solid rgba(201,168,76,.12)' }}>Recent Orders</div>
          {orders.length === 0 ? <div style={{ color: 'var(--gray)', fontSize: '.83rem' }}>No orders yet</div> : [...orders].slice(0, 5).map(o => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '.7rem 0', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: '.83rem' }}>
              <span style={{ color: gold, fontFamily: "'Cormorant Garamond',serif" }}>{o.id}</span>
              <span style={{ color: 'var(--light-gray)' }}>{o.customer}</span>
              <span style={{ color: gold }}>${parseFloat(o.total).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', padding: '1.8rem' }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', color: gold, marginBottom: '1.4rem', paddingBottom: '.8rem', borderBottom: '1px solid rgba(201,168,76,.12)' }}>Messages {unread > 0 && <span style={{ background: gold, color: 'var(--black)', borderRadius: 10, padding: '0 7px', fontSize: '.65rem', marginLeft: '.5rem' }}>{unread}</span>}</div>
          {messages.length === 0 ? <div style={{ color: 'var(--gray)', fontSize: '.83rem' }}>No messages yet</div> : [...messages].slice(0, 5).map(m => (
            <div key={m.id} style={{ padding: '.7rem 0', borderBottom: '1px solid rgba(255,255,255,.04)', borderLeft: m.is_read ? 'none' : `3px solid ${gold}`, paddingLeft: m.is_read ? 0 : '.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.83rem' }}>
                <span style={{ color: gold }}>{m.name}</span>
                <span style={{ color: 'var(--gray)', fontSize: '.72rem' }}>{m.created}</span>
              </div>
              <div style={{ color: 'var(--gray)', fontSize: '.75rem', marginTop: '.2rem' }}>{m.subject || m.message?.slice(0, 50)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── PRODUCTS PANEL ── */
function ProductsPanel({ products, brands, onRefresh, toast }) {
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [editing, setEditing] = useState(null);

  const filtered = products.filter(p => {
    if (brandFilter && p.brand_id !== Number(brandFilter)) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const deleteProduct = async id => {
    await api.delete(`/products/${id}`);
    toast('Product deleted', 'info');
    onRefresh();
  };

  if (editing !== null) return <ProductForm product={editing} brands={brands} onDone={() => { setEditing(null); onRefresh(); }} toast={toast} />;

  return (
    <div>
      {confirm && <Confirm title="Delete Product" msg={`Delete "${confirm.name}"?`} onConfirm={() => { deleteProduct(confirm.id); setConfirm(null); }} onCancel={() => setConfirm(null)} />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.2rem', fontWeight: 300 }}>Products</h1><p style={{ color: 'var(--gray)', fontSize: '.8rem' }}>{products.length} product(s)</p></div>
        <button className="btn-primary" onClick={() => setEditing({})}>+ Add Product</button>
      </div>
      <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', overflowX: 'auto' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(201,168,76,.1)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input style={{ padding: '.5rem 1rem', background: dark3, border: '1px solid rgba(201,168,76,.15)', color: 'var(--white)', fontFamily: "'Jost',sans-serif", fontSize: '.82rem', outline: 'none', minWidth: 200 }} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-select" style={{ width: 'auto' }} value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
            <option value="">All Brands</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <span style={{ marginLeft: 'auto', color: 'var(--gray)', fontSize: '.78rem' }}>{filtered.length} result(s)</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead><tr>{['Product','Brand','Category','Tester','50ml','100ml','Stock','Scent Profile','Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: '.8rem 1.2rem', background: dark3, fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gray)', whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(p => {
              const sp = p.scent_profile || DEFAULT_PROFILE;
              return (
                <tr key={p.id} onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: '.83rem', color: 'var(--white)', fontFamily: "'Cormorant Garamond',serif" }}>{p.name}</td>
                  <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: '.83rem', color: 'var(--gray)' }}>{p.brand_name || '—'}</td>
                  <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)' }}><span className={`tag tag-${p.category}`}>{p.category}</span></td>
                  {['price_tester','price_50','price_100'].map(k => <td key={k} style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: '.83rem', color: gold }}>{p[k] > 0 ? `$${p[k]}` : '—'}</td>)}
                  <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: '.83rem', color: p.stock === 0 ? '#e74c3c' : 'var(--light-gray)' }}>{p.stock}</td>
                  {/* Mini scent bars */}
                  <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)', minWidth: 140 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {[['📡', sp.projection, '#C9A84C'], ['☀️', sp.summer, '#F4A261'], ['❄️', sp.winter, '#74B9D7'], ['🌙', sp.night, '#6C5CE7']].map(([icon, val, color]) => (
                        <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: '.65rem', width: 14 }}>{icon}</span>
                          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,.07)', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(val || 0) * 10}%`, background: color, borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: '.6rem', color: 'var(--gray)', width: 12 }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                    <div style={{ display: 'flex', gap: '.4rem' }}>
                      <button className="btn-action btn-edit" onClick={() => setEditing(p)}>Edit</button>
                      <button className="btn-action btn-danger" onClick={() => setConfirm(p)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductForm({ product, brands, onDone, toast }) {
  const isEdit = !!product?.id;
  const [form, setForm] = useState({
    name: product?.name || '',
    brand_id: product?.brand_id || '',
    category: product?.category || 'men',
    stock: product?.stock || 0,
    description: product?.description || '',
    notes: product?.notes || '',
    price_tester: product?.price_tester || 0,
    price_50: product?.price_50 || 0,
    price_100: product?.price_100 || 0,
    images: Array.isArray(product?.images) ? product.images : (typeof product?.images === 'string' ? JSON.parse(product?.images || '[]') : []),
    scent_profile: product?.scent_profile || { ...DEFAULT_PROFILE },
  });
  const [newImgUrl, setNewImgUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = React.useRef();

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name || !form.brand_id) { toast('Name and brand are required', 'error'); return; }
    setSaving(true);
    try {
      if (isEdit) await api.put(`/products/${product.id}`, form);
      else await api.post('/products', form);
      toast(isEdit ? 'Product updated' : 'Product created', 'success');
      onDone();
    } catch (err) { toast(err.response?.data?.error || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const addImg = () => { if (newImgUrl.trim()) { setF('images', [...form.images, newImgUrl.trim()]); setNewImgUrl(''); } };
  const removeImg = i => setF('images', form.images.filter((_, idx) => idx !== i));

  const handleGalleryUpload = e => {
    const files = Array.from(e.target.files);
    const readers = files.map(file => new Promise(res => {
      const r = new FileReader();
      r.onload = ev => res(ev.target.result);
      r.readAsDataURL(file);
    }));
    Promise.all(readers).then(results => {
      setForm(f => ({ ...f, images: [...f.images, ...results].slice(0, 5) }));
    });
    e.target.value = '';
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div><h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.2rem', fontWeight: 300 }}>{isEdit ? `Edit: ${product.name}` : 'Add Product'}</h1></div>
        <button className="btn-outline" onClick={onDone}>← Back</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        <div>
          {/* Basic Info */}
          <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', color: gold, marginBottom: '1.4rem', paddingBottom: '.8rem', borderBottom: '1px solid rgba(201,168,76,.12)' }}>Basic Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Product Name *</label><input className="form-input" value={form.name} onChange={e => setF('name', e.target.value)} placeholder="e.g. Midnight Oud" /></div>
              <div className="form-group"><label className="form-label">Brand *</label>
                <select className="form-select" value={form.brand_id} onChange={e => setF('brand_id', Number(e.target.value))}>
                  <option value="">— Select Brand —</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Category *</label>
                <select className="form-select" value={form.category} onChange={e => setF('category', e.target.value)}>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Stock</label><input className="form-input" type="number" min={0} value={form.stock} onChange={e => setF('stock', Number(e.target.value))} /></div>
            </div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="textarea-input" value={form.description} onChange={e => setF('description', e.target.value)} style={{ minHeight: 80 }} /></div>
            <div className="form-group"><label className="form-label">Scent Notes <span style={{ color: 'var(--gray)' }}>(comma separated)</span></label><input className="form-input" value={form.notes} onChange={e => setF('notes', e.target.value)} placeholder="Rose, Sandalwood, Musk" /></div>
          </div>

          {/* Prices */}
          <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', padding: '2rem', marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', color: gold, marginBottom: '1.4rem', paddingBottom: '.8rem', borderBottom: '1px solid rgba(201,168,76,.12)' }}>Sizes & Prices</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {[['price_tester','🧪 Tester ($)'],['price_50','🔹 50 ml ($)'],['price_100','🔷 100 ml ($)']].map(([k,l]) => (
                <div className="form-group" key={k}><label className="form-label">{l}</label><input className="form-input" type="number" min={0} step={0.01} value={form[k]} onChange={e => setF(k, parseFloat(e.target.value) || 0)} /></div>
              ))}
            </div>
          </div>

          {/* SCENT PROFILE SLIDERS */}
          <ScentProfileSliders
            profile={form.scent_profile}
            onChange={p => setF('scent_profile', p)}
          />
        </div>

        {/* IMAGES */}
        <div>
          <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', padding: '2rem', position: 'sticky', top: '80px' }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', color: gold, marginBottom: '1.4rem', paddingBottom: '.8rem', borderBottom: '1px solid rgba(201,168,76,.12)' }}>Images <span style={{ fontSize: '.65rem', color: 'var(--gray)', fontFamily: "'Jost',sans-serif" }}>(max 5)</span></div>

            {/* Main preview */}
            <div style={{ aspectRatio: '3/4', background: dark3, border: '2px dashed rgba(201,168,76,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', overflow: 'hidden', fontSize: '4rem', color: 'rgba(201,168,76,.25)', position: 'relative', cursor: 'pointer' }}
              onClick={() => fileInputRef.current?.click()}>
              {form.images[0] ? <img src={form.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} /> : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🧴</div>
                  <div style={{ fontSize: '.7rem', color: 'rgba(201,168,76,.4)', letterSpacing: '.1em' }}>Click to upload</div>
                </div>
              )}
              {form.images[0] && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'all .25s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,.45)'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.style.opacity = '0'; }}>
                  <span style={{ color: gold, fontSize: '.75rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>Change</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {form.images.length > 0 && (
              <div style={{ display: 'flex', gap: '.4rem', marginBottom: '.8rem', flexWrap: 'wrap' }}>
                {form.images.map((url, i) => (
                  <div key={i} style={{ position: 'relative', width: 48, height: 60 }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', border: `2px solid ${i === 0 ? gold : 'rgba(201,168,76,.2)'}` }} onError={e => e.target.style.opacity = '.3'} />
                    <button onClick={() => removeImg(i)} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, background: '#e74c3c', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload from gallery */}
            {form.images.length < 5 && (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGalleryUpload} />
                <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: '.7rem', background: 'rgba(201,168,76,.08)', border: '1px dashed rgba(201,168,76,.35)', color: gold, cursor: 'pointer', fontSize: '.75rem', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: "'Jost',sans-serif", marginBottom: '.7rem', transition: 'all .25s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,168,76,.08)'}>
                  📷 Upload from Gallery
                </button>
              </>
            )}

            {/* Or paste URL */}
            {form.images.length < 5 && (
              <div>
                <div style={{ fontSize: '.62rem', color: 'var(--gray)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.4rem' }}>Or paste URL</div>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <input className="form-input" value={newImgUrl} onChange={e => setNewImgUrl(e.target.value)} placeholder="https://example.com/image.jpg" onKeyDown={e => e.key === 'Enter' && addImg()} style={{ fontSize: '.78rem' }} />
                  <button className="btn-action btn-edit" onClick={addImg} style={{ whiteSpace: 'nowrap', padding: '.5rem .8rem' }}>Add</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</button>
        <button className="btn-outline" onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}

/* ── BRANDS PANEL ── */
function BrandsPanel({ brands, onRefresh, toast }) {
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', country: '', founded: '', logo: '', website: '', description: '' });
  const [saving, setSaving] = useState(false);

  const openEdit = b => { setForm(b ? { name: b.name, country: b.country || '', founded: b.founded || '', logo: b.logo || '', website: b.website || '', description: b.description || '' } : { name: '', country: '', founded: '', logo: '', website: '', description: '' }); setEditing(b || 'new'); };

  const save = async () => {
    if (!form.name) { toast('Name is required', 'error'); return; }
    setSaving(true);
    try {
      if (editing === 'new') await api.post('/brands', form);
      else await api.put(`/brands/${editing.id}`, form);
      toast(editing === 'new' ? 'Brand created' : 'Brand updated', 'success');
      setEditing(null); onRefresh();
    } catch (err) { toast(err.response?.data?.error || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const deleteBrand = async id => { await api.delete(`/brands/${id}`); toast('Brand deleted', 'info'); onRefresh(); };
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      {confirm && <Confirm title="Delete Brand" msg={`Delete "${confirm.name}"? Products will be unlinked.`} onConfirm={() => { deleteBrand(confirm.id); setConfirm(null); }} onCancel={() => setConfirm(null)} />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div><h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.2rem', fontWeight: 300 }}>Brands</h1><p style={{ color: 'var(--gray)', fontSize: '.8rem' }}>{brands.length} brand(s)</p></div>
        <button className="btn-primary" onClick={() => openEdit(null)}>+ Add Brand</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
        {brands.map(b => (
          <div key={b.id} style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', padding: '1.5rem', transition: 'border-color .3s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,.35)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,.14)'}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', color: gold, marginBottom: '1rem', overflow: 'hidden' }}>
              {b.logo ? <img src={b.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : b.name[0]}
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', marginBottom: '.2rem' }}>{b.name}</div>
            <div style={{ fontSize: '.7rem', color: 'var(--gray)', marginBottom: '.4rem' }}>{b.country}{b.founded ? ` · Est. ${b.founded}` : ''}</div>
            <div style={{ fontSize: '.75rem', color: gold, marginBottom: '1rem' }}>{b.productCount || 0} products</div>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button className="btn-action btn-edit" onClick={() => openEdit(b)}>Edit</button>
              <button className="btn-action btn-danger" onClick={() => setConfirm(b)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.2)', padding: '2.5rem', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", color: gold, fontSize: '1.8rem', marginBottom: '1.8rem' }}>{editing === 'new' ? 'Add Brand' : `Edit: ${editing.name}`}</h2>
            {[['name','Brand Name *'],['country','Country'],['founded','Founded Year'],['logo','Logo URL'],['website','Website URL']].map(([k,l]) => (
              <div className="form-group" key={k}><label className="form-label">{l}</label><input className="form-input" value={form[k]} onChange={e => setF(k, e.target.value)} /></div>
            ))}
            <div className="form-group"><label className="form-label">Description</label><textarea className="textarea-input" value={form.description} onChange={e => setF('description', e.target.value)} /></div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Brand'}</button>
              <button className="btn-outline" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── ORDERS PANEL ── */
function OrdersPanel({ orders, onRefresh, toast }) {
  const [search, setSearch] = useState('');
  const total = orders.reduce((s, o) => s + parseFloat(o.total || 0), 0);
  const filtered = orders.filter(o => !search || o.id.toLowerCase().includes(search) || o.customer?.toLowerCase().includes(search));
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}><h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.2rem', fontWeight: 300 }}>Orders</h1><p style={{ color: 'var(--gray)', fontSize: '.8rem' }}>{orders.length} order(s) · ${total.toFixed(2)} total</p></div>
      <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', overflowX: 'auto' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(201,168,76,.1)' }}>
          <input style={{ padding: '.5rem 1rem', background: dark3, border: '1px solid rgba(201,168,76,.15)', color: 'var(--white)', fontFamily: "'Jost',sans-serif", fontSize: '.82rem', outline: 'none', minWidth: 220 }} placeholder="Search orders…" value={search} onChange={e => setSearch(e.target.value.toLowerCase())} />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead><tr>{['Order ID','Customer','Items','Total','Date','Payment','Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '.8rem 1.2rem', background: dark3, fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gray)' }}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--gray)' }}>No orders yet</td></tr> :
              filtered.map(o => {
                const items = Array.isArray(o.items) ? o.items : (typeof o.items === 'string' ? JSON.parse(o.items || '[]') : []);
                return (
                  <tr key={o.id} onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)', color: gold, fontFamily: "'Cormorant Garamond',serif" }}>{o.id}</td>
                    <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: '.83rem' }}>{o.customer}</td>
                    <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: '.83rem', color: 'var(--gray)' }}>{items.length} item(s)</td>
                    <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)', color: gold, fontSize: '.88rem' }}>${parseFloat(o.total).toFixed(2)}</td>
                    <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: '.83rem', color: 'var(--gray)' }}>{o.created}</td>
                    <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: '.83rem', color: 'var(--gray)', textTransform: 'capitalize' }}>{o.payment}</td>
                    <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)' }}><span className="tag tag-confirmed">{o.status}</span></td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── MESSAGES PANEL ── */
function MessagesPanel({ messages, onRefresh, toast }) {
  const unread = messages.filter(m => !m.is_read).length;
  const [confirm, setConfirm] = useState(null);
  const markRead = async id => { await api.put(`/messages/${id}/read`); onRefresh(); };
  const markAllRead = async () => { await api.put('/messages/read-all'); onRefresh(); toast('All marked read', 'info'); };
  const deleteMsg = async id => { await api.delete(`/messages/${id}`); toast('Message deleted', 'info'); onRefresh(); };

  return (
    <div>
      {confirm && <Confirm title="Delete Message" msg="Delete this message?" onConfirm={() => { deleteMsg(confirm); setConfirm(null); }} onCancel={() => setConfirm(null)} />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div><h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.2rem', fontWeight: 300 }}>Messages</h1><p style={{ color: 'var(--gray)', fontSize: '.8rem' }}>{messages.length} message(s) · {unread} unread</p></div>
        {unread > 0 && <button className="btn-outline" onClick={markAllRead}>Mark All Read</button>}
      </div>
      {messages.length === 0 ? <div style={{ color: 'var(--gray)', padding: '3rem', textAlign: 'center' }}>No messages yet</div> :
        messages.map(m => (
          <div key={m.id} style={{ background: dark3, border: `1px solid ${!m.is_read ? gold : 'rgba(201,168,76,.1)'}`, borderLeft: `3px solid ${!m.is_read ? gold : 'rgba(201,168,76,.1)'}`, padding: '1.4rem', marginBottom: '.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
              <span style={{ color: gold, fontWeight: 500, fontSize: '.88rem' }}>{m.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
                <span style={{ color: 'var(--gray)', fontSize: '.72rem' }}>{m.created}</span>
                {!m.is_read && <button className="btn-action btn-edit" style={{ fontSize: '.62rem', padding: '.2rem .55rem' }} onClick={() => markRead(m.id)}>Mark Read</button>}
                <button className="btn-action btn-danger" style={{ fontSize: '.62rem', padding: '.2rem .55rem' }} onClick={() => setConfirm(m.id)}>Delete</button>
              </div>
            </div>
            <div style={{ color: 'var(--gray)', fontSize: '.75rem', marginBottom: '.3rem' }}>{m.email}</div>
            {m.subject && <div style={{ fontSize: '.82rem', marginBottom: '.3rem' }}><strong style={{ color: gold }}>Subject:</strong> {m.subject}</div>}
            <div style={{ color: 'var(--gray)', fontSize: '.82rem', lineHeight: 1.65 }}>{m.message}</div>
          </div>
        ))
      }
    </div>
  );
}

/* ── SITE REVIEWS PANEL (general website testimonials) ── */
function Stars({ rating, size = 13 }) {
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize: size, color: s <= rating ? '#F4C542' : 'rgba(255,255,255,.18)', lineHeight: 1 }}>★</span>
      ))}
    </div>
  );
}

function SiteReviewsPanel({ toast }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/site-reviews/all').then(r => setReviews(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const toggleApprove = async (r) => {
    await api.patch(`/site-reviews/${r.id}/approve`, { is_approved: r.is_approved ? 0 : 1 });
    toast(r.is_approved ? 'Review hidden from site' : 'Review now visible on site', 'info');
    load();
  };
  const deleteReview = async id => { await api.delete(`/site-reviews/${id}`); toast('Review deleted', 'info'); load(); };

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const visibleCount = reviews.filter(r => r.is_approved).length;

  return (
    <div>
      {confirm && <Confirm title="Delete Review" msg="Permanently delete this site review?" onConfirm={() => { deleteReview(confirm); setConfirm(null); }} onCancel={() => setConfirm(null)} />}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.2rem', fontWeight: 300 }}>Site Reviews</h1>
        <p style={{ color: 'var(--gray)', fontSize: '.8rem' }}>{reviews.length} total · {visibleCount} visible on site · {avg} ★ average</p>
      </div>
      {loading ? <div style={{ color: 'var(--gray)', padding: '3rem', textAlign: 'center' }}>Loading…</div> :
        reviews.length === 0 ? <div style={{ color: 'var(--gray)', padding: '3rem', textAlign: 'center' }}>No site reviews yet</div> :
        reviews.map(r => (
          <div key={r.id} style={{ background: dark3, border: `1px solid ${r.is_approved ? 'rgba(201,168,76,.14)' : 'rgba(192,57,43,.3)'}`, padding: '1.4rem', marginBottom: '.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.5rem', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.3rem' }}>
                  <span style={{ color: gold, fontWeight: 500, fontSize: '.88rem' }}>{r.name}</span>
                  <Stars rating={r.rating} size={12} />
                  {!r.is_approved && <span style={{ background: 'rgba(192,57,43,.15)', color: '#e74c3c', fontSize: '.6rem', padding: '.15rem .5rem', letterSpacing: '.08em', textTransform: 'uppercase' }}>Hidden</span>}
                </div>
                {r.email && <div style={{ color: 'var(--gray)', fontSize: '.72rem' }}>{r.email}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexShrink: 0 }}>
                <span style={{ color: 'var(--gray)', fontSize: '.7rem' }}>{new Date(r.created).toLocaleDateString()}</span>
                <button className="btn-action btn-edit" style={{ fontSize: '.62rem', padding: '.2rem .55rem' }} onClick={() => toggleApprove(r)}>{r.is_approved ? 'Hide' : 'Show'}</button>
                <button className="btn-action btn-danger" style={{ fontSize: '.62rem', padding: '.2rem .55rem' }} onClick={() => setConfirm(r.id)}>Delete</button>
              </div>
            </div>
            {r.title && <div style={{ fontSize: '.85rem', marginBottom: '.3rem', fontStyle: 'italic' }}><strong style={{ color: gold, fontStyle: 'normal' }}>"{r.title}"</strong></div>}
            <div style={{ color: 'var(--gray)', fontSize: '.82rem', lineHeight: 1.65 }}>{r.body}</div>
          </div>
        ))
      }
    </div>
  );
}


function UsersPanel({ users, onRefresh, toast }) {
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);
  const filtered = users.filter(u => !search || u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
  const deleteUser = async id => { await api.delete(`/users/${id}`); toast('User removed', 'info'); onRefresh(); };

  return (
    <div>
      {confirm && <Confirm title="Remove User" msg="Remove this user?" onConfirm={() => { deleteUser(confirm); setConfirm(null); }} onCancel={() => setConfirm(null)} />}
      <div style={{ marginBottom: '2rem' }}><h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.2rem', fontWeight: 300 }}>Users</h1><p style={{ color: 'var(--gray)', fontSize: '.8rem' }}>{users.length} user(s)</p></div>
      <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', overflowX: 'auto' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(201,168,76,.1)' }}>
          <input style={{ padding: '.5rem 1rem', background: dark3, border: '1px solid rgba(201,168,76,.15)', color: 'var(--white)', fontFamily: "'Jost',sans-serif", fontSize: '.82rem', outline: 'none', minWidth: 220 }} placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value.toLowerCase())} />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead><tr>{['Name','Email','Role','Joined','Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: '.8rem 1.2rem', background: dark3, fontSize: '.68rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--gray)' }}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)', color: 'var(--white)' }}>{u.name}</td>
                <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)', color: 'var(--gray)' }}>{u.email}</td>
                <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)' }}><span className={`tag tag-${u.role}`}>{u.role}</span></td>
                <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)', color: 'var(--gray)' }}>{u.joined}</td>
                <td style={{ padding: '.88rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                  {u.role !== 'admin' ? <button className="btn-action btn-danger" onClick={() => setConfirm(u.id)}>Remove</button> : <span style={{ color: 'var(--gray)', fontSize: '.72rem' }}>Protected</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── PAYMENT SETTINGS PANEL ── */
function PaymentsPanel({ toast }) {
  const [settings, setSettings] = useState(null);
  useEffect(() => {
    api.get('/settings').then(({ data }) => {
      setSettings({
        card: { enabled: data.payment_card_enabled === '1', soon: data.payment_card_soon === '1' },
        wish: { enabled: data.payment_wish_enabled === '1', soon: data.payment_wish_soon === '1' },
        cod:  { enabled: data.payment_cod_enabled  === '1', soon: data.payment_cod_soon  === '1' },
      });
    });
  }, []);

  const save = async () => {
    await api.put('/settings', {
      payment_card_enabled: settings.card.enabled ? '1' : '0', payment_card_soon: settings.card.soon ? '1' : '0',
      payment_wish_enabled: settings.wish.enabled ? '1' : '0', payment_wish_soon: settings.wish.soon ? '1' : '0',
      payment_cod_enabled:  settings.cod.enabled  ? '1' : '0', payment_cod_soon:  settings.cod.soon  ? '1' : '0',
    });
    toast('Payment settings saved', 'success');
  };

  if (!settings) return <div style={{ color: 'var(--gray)', padding: '3rem' }}>Loading…</div>;
  const methods = [['card','💳','Credit Card','Visa, Mastercard, Amex'],['wish','🛒','Wish','Wish payment platform'],['cod','💵','Pay on Delivery','Cash on delivery']];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}><h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.2rem', fontWeight: 300 }}>Payment Methods</h1><p style={{ color: 'var(--gray)', fontSize: '.8rem' }}>Enable or disable payment options at checkout.</p></div>
      <div style={{ maxWidth: 680 }}>
        {methods.map(([k, icon, name, desc]) => (
          <div key={k} style={{ background: dark3, border: '1px solid rgba(201,168,76,.14)', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.8rem' }}>{icon}</span>
              <div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.15rem' }}>{name}</div><div style={{ fontSize: '.75rem', color: 'var(--gray)', marginTop: '.15rem' }}>{desc}</div></div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {[['enabled','Enabled'],['soon','Soon badge']].map(([prop, label]) => (
                <label key={prop} style={{ display: 'flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer' }}>
                  <div style={{ position: 'relative', width: 42, height: 22 }} onClick={() => setSettings(s => ({ ...s, [k]: { ...s[k], [prop]: !s[k][prop] } }))}>
                    <div style={{ position: 'absolute', inset: 0, background: settings[k][prop] ? 'rgba(201,168,76,.3)' : 'rgba(255,255,255,.1)', borderRadius: 11, cursor: 'pointer', transition: '.3s' }}>
                      <div style={{ position: 'absolute', height: 16, width: 16, left: settings[k][prop] ? 23 : 3, bottom: 3, background: settings[k][prop] ? gold : 'var(--gray)', borderRadius: '50%', transition: '.3s' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '.75rem', color: 'var(--light-gray)' }}>{label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button className="btn-primary" onClick={save} style={{ marginTop: '1rem' }}>Save Settings</button>
      </div>
    </div>
  );
}

/* ── MAIN ADMIN DASHBOARD ── */
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [panel, setPanel] = useState('overview');
  const [data, setData] = useState({ products: [], brands: [], orders: [], users: [], messages: [] });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'info') => setToast({ msg, type, key: Date.now() }), []);

  const fetchAll = useCallback(async () => {
    try {
      const [p, b, o, u, m] = await Promise.all([
        api.get('/products'), api.get('/brands'), api.get('/orders'),
        api.get('/users'), api.get('/messages'),
      ]);
      setData({ products: p.data, brands: b.data, orders: o.data, users: u.data, messages: m.data });
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const unreadMsgs = data.messages.filter(m => !m.is_read).length;
  const navItems = [
    { key: 'overview',  icon: '📊', label: 'Overview' },
    { key: 'products',  icon: '🧴', label: 'Products' },
    { key: 'brands',    icon: '🏷️', label: 'Brands' },
    { key: 'orders',    icon: '📦', label: 'Orders' },
    { key: 'messages',  icon: '✉️', label: 'Messages', badge: unreadMsgs },
    { key: 'sitereviews', icon: '⭐', label: 'Site Reviews' },
    { key: 'users',     icon: '👥', label: 'Users' },
    { key: 'payments',  icon: '💳', label: 'Payments' },
  ];

  /* inline css for action buttons */
  const style = document.createElement('style');
  style.textContent = `.btn-action{padding:.3rem .75rem;border:none;cursor:pointer;font-family:'Jost',sans-serif;font-size:.72rem;letter-spacing:.07em;text-transform:uppercase;transition:all .2s}.btn-edit{background:rgba(201,168,76,.12);color:var(--gold);border:1px solid rgba(201,168,76,.25)}.btn-edit:hover{background:rgba(201,168,76,.22)}.btn-danger{background:rgba(192,57,43,.12);color:#e74c3c;border:1px solid rgba(192,57,43,.25)}.btn-danger:hover{background:rgba(192,57,43,.25)}`;
  if (!document.head.querySelector('[data-aurum-admin]')) { style.setAttribute('data-aurum-admin','1'); document.head.appendChild(style); }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* SIDEBAR */}
      <div style={{ width: SIDEBAR_W, minHeight: '100vh', background: dark2, borderRight: '1px solid rgba(201,168,76,.15)', position: 'fixed', top: 0, left: 0, zIndex: 300, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '1.6rem 1.5rem', borderBottom: '1px solid rgba(201,168,76,.15)', display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.6rem', fontWeight: 300, color: gold, letterSpacing: '.25em' }}>AURUM</span>
          <span style={{ background: 'rgba(201,168,76,.15)', color: gold, fontSize: '.6rem', padding: '.2rem .5rem', letterSpacing: '.1em', textTransform: 'uppercase', border: '1px solid rgba(201,168,76,.25)' }}>Admin</span>
        </div>
        <div style={{ padding: '.4rem 0', flex: 1 }}>
          <div style={{ padding: '.9rem 1.5rem .4rem', fontSize: '.6rem', letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(201,168,76,.45)' }}>Management</div>
          {navItems.map(item => (
            <div key={item.key} onClick={() => setPanel(item.key)} style={{ display: 'flex', alignItems: 'center', gap: '.78rem', padding: '.72rem 1.4rem', color: panel === item.key ? gold : 'var(--gray)', cursor: 'pointer', transition: 'all .25s', fontSize: '.78rem', letterSpacing: '.07em', textTransform: 'uppercase', borderLeft: `3px solid ${panel === item.key ? gold : 'transparent'}`, background: panel === item.key ? 'rgba(201,168,76,.07)' : 'transparent' }}
              onMouseEnter={e => { if (panel !== item.key) { e.currentTarget.style.color = 'var(--light-gray)'; e.currentTarget.style.background = 'rgba(255,255,255,.03)'; } }}
              onMouseLeave={e => { if (panel !== item.key) { e.currentTarget.style.color = 'var(--gray)'; e.currentTarget.style.background = 'transparent'; } }}>
              <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
              {item.label}
              {item.badge > 0 && <span style={{ marginLeft: 'auto', background: gold, color: 'var(--black)', borderRadius: 10, minWidth: 18, height: 18, fontSize: '.62rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, padding: '0 4px' }}>{item.badge}</span>}
            </div>
          ))}
        </div>
        <div style={{ padding: '1.2rem 1.4rem', borderTop: '1px solid rgba(201,168,76,.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', marginBottom: '.9rem' }}>
            <div style={{ width: 34, height: 34, background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: gold, fontSize: '.85rem' }}>👤</div>
            <div><div style={{ fontSize: '.82rem' }}>{user?.name}</div><div style={{ fontSize: '.65rem', color: gold, letterSpacing: '.08em', textTransform: 'uppercase' }}>Admin</div></div>
          </div>
          <button onClick={() => navigate('/')} style={{ width: '100%', background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.2)', color: gold, padding: '.55rem', fontSize: '.7rem', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Jost',sans-serif", marginBottom: '.5rem' }}>🏪 View Store</button>
          <button onClick={logout} style={{ width: '100%', background: 'rgba(192,57,43,.1)', border: '1px solid rgba(192,57,43,.25)', color: '#e74c3c', padding: '.55rem', fontSize: '.7rem', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Jost',sans-serif", marginTop: '.5rem' }}>Logout</button>
        </div>
      </div>

      {/* TOPBAR */}
      <div style={{ position: 'fixed', top: 0, left: SIDEBAR_W, right: 0, height: 62, zIndex: 200, background: 'rgba(17,17,17,.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(201,168,76,.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.4rem', fontWeight: 300 }}>
          {navItems.find(n => n.key === panel)?.label || 'Dashboard'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '.78rem', color: gold, letterSpacing: '.08em' }}>Welcome, {user?.name}</span>
          <span style={{ fontSize: '.72rem', color: 'var(--gray)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ marginLeft: SIDEBAR_W, flex: 1, padding: '5rem 2rem 2rem', minHeight: '100vh', background: 'var(--black)' }}>
        {panel === 'overview'  && <OverviewPanel {...data} />}
        {panel === 'products'  && <ProductsPanel products={data.products} brands={data.brands} onRefresh={fetchAll} toast={showToast} />}
        {panel === 'brands'    && <BrandsPanel brands={data.brands} onRefresh={fetchAll} toast={showToast} />}
        {panel === 'orders'    && <OrdersPanel orders={data.orders} onRefresh={fetchAll} toast={showToast} />}
        {panel === 'messages'  && <MessagesPanel messages={data.messages} onRefresh={fetchAll} toast={showToast} />}
        {panel === 'sitereviews' && <SiteReviewsPanel toast={showToast} />}
        {panel === 'users'     && <UsersPanel users={data.users} onRefresh={fetchAll} toast={showToast} />}
        {panel === 'payments'  && <PaymentsPanel toast={showToast} />}
      </div>
    </div>
  );
}