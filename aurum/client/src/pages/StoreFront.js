import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const gold = 'var(--gold)';
const dark2 = 'var(--dark2)';
const dark3 = 'var(--dark3)';

function parseImgs(raw) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') { try { return JSON.parse(raw || '[]'); } catch { return []; } }
  return [];
}

/* ── Toast ── */
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  const c = { success: '#27ae60', error: '#e74c3c', info: gold };
  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: dark2, border: `1px solid ${c[type] || gold}`, color: c[type] || gold, padding: '.88rem 1.4rem', zIndex: 9999, fontSize: '.82rem', animation: 'fadeUp .3s ease', boxShadow: '0 8px 32px rgba(0,0,0,.5)' }}>
      {type === 'success' ? '✅' : type === 'error' ? '❌' : '✨'} {msg}
    </div>
  );
}

/* ── Stars ── */
function Stars({ rating, size = 13, interactive = false, onRate }) {
  const [hover, setHover] = useState(0);
  const display = interactive ? (hover || rating) : rating;
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s}
          onClick={() => interactive && onRate && onRate(s)}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{ fontSize: size, cursor: interactive ? 'pointer' : 'default', color: s <= display ? '#F4C542' : 'rgba(255,255,255,.18)', transition: 'color .15s', lineHeight: 1, userSelect: 'none' }}>★</span>
      ))}
    </div>
  );
}

/* ── Scent bars ── */
const PROFILE_BARS = [
  { key: 'projection', label: 'Projection',    icon: '📡', color: '#C9A84C', group: 'Performance' },
  { key: 'summer',     label: 'Summer',        icon: '☀️', color: '#F4A261', group: 'Season' },
  { key: 'fall',       label: 'Fall / Autumn', icon: '🍂', color: '#D4845A', group: 'Season' },
  { key: 'winter',     label: 'Winter',        icon: '❄️', color: '#74B9D7', group: 'Season' },
  { key: 'spring',     label: 'Spring',        icon: '🌸', color: '#A8D8A8', group: 'Season' },
  { key: 'day',        label: 'Day',           icon: '🌤️', color: '#F9CA24', group: 'Time' },
  { key: 'night',      label: 'Night',         icon: '🌙', color: '#6C5CE7', group: 'Time' },
];

function ScentBars({ profile }) {
  if (!profile) return null;
  return (
    <div style={{ borderTop: '1px solid rgba(201,168,76,.12)', paddingTop: '1rem' }}>
      <div style={{ fontSize: '.65rem', color: gold, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Scent Profile</div>
      {['Performance','Season','Time'].map(g => (
        <div key={g} style={{ marginBottom: '.9rem' }}>
          <div style={{ fontSize: '.58rem', letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(201,168,76,.5)', marginBottom: '.5rem' }}>{g}</div>
          {PROFILE_BARS.filter(b => b.group === g).map(b => {
            const val = profile[b.key] ?? 5;
            return (
              <div key={b.key} style={{ display: 'flex', alignItems: 'center', gap: '.7rem', marginBottom: '.45rem' }}>
                <span style={{ fontSize: '.8rem', width: 18, flexShrink: 0 }}>{b.icon}</span>
                <span style={{ fontSize: '.72rem', color: 'var(--gray)', width: 82, flexShrink: 0 }}>{b.label}</span>
                <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,.07)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${val * 10}%`, background: `linear-gradient(90deg,${b.color}66,${b.color})`, borderRadius: 3, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} />
                </div>
                <span style={{ fontSize: '.68rem', color: b.color, fontWeight: 600, width: 18, textAlign: 'right', flexShrink: 0 }}>{val}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ── Review Form ── */
function ReviewForm({ productId, user, onSubmitted }) {
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', rating: 0, title: '', body: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.rating) { setErr('Please select a star rating.'); return; }
    if (!form.name.trim()) { setErr('Please enter your name.'); return; }
    if (!form.body.trim()) { setErr('Please write a review.'); return; }
    setSaving(true); setErr('');
    try {
      await api.post('/reviews', { product_id: productId, user_id: user?.id || null, name: form.name, email: form.email, rating: form.rating, title: form.title, body: form.body });
      onSubmitted();
    } catch (e) { setErr(e.response?.data?.error || 'Failed to submit.'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.15)', padding: '1.4rem', marginTop: '1.2rem' }}>
      <div style={{ fontSize: '.72rem', color: gold, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: '1rem' }}>Write a Review</div>
      {err && <div className="msg-error" style={{ marginBottom: '.8rem', fontSize: '.75rem' }}>{err}</div>}
      <div style={{ marginBottom: '.8rem' }}>
        <div style={{ fontSize: '.65rem', color: 'var(--gray)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.4rem' }}>Your Rating *</div>
        <Stars rating={form.rating} size={22} interactive onRate={v => setF('rating', v)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.7rem', marginBottom: '.7rem' }}>
        <div><label style={{ fontSize: '.65rem', color: 'var(--gray)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: '.3rem' }}>Name *</label>
          <input className="form-input" style={{ fontSize: '.8rem', padding: '.6rem .8rem' }} value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Your name" /></div>
        <div><label style={{ fontSize: '.65rem', color: 'var(--gray)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: '.3rem' }}>Email</label>
          <input className="form-input" style={{ fontSize: '.8rem', padding: '.6rem .8rem' }} value={form.email} onChange={e => setF('email', e.target.value)} placeholder="your@email.com" /></div>
      </div>
      <div style={{ marginBottom: '.7rem' }}>
        <label style={{ fontSize: '.65rem', color: 'var(--gray)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: '.3rem' }}>Review Title</label>
        <input className="form-input" style={{ fontSize: '.8rem', padding: '.6rem .8rem' }} value={form.title} onChange={e => setF('title', e.target.value)} placeholder="e.g. Absolutely stunning" />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontSize: '.65rem', color: 'var(--gray)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: '.3rem' }}>Your Review *</label>
        <textarea className="textarea-input" style={{ fontSize: '.8rem', padding: '.6rem .8rem', minHeight: 80 }} value={form.body} onChange={e => setF('body', e.target.value)} placeholder="Share your experience with this fragrance…" />
      </div>
      <button className="btn-primary" style={{ padding: '.65rem 2rem', fontSize: '.75rem' }} onClick={submit} disabled={saving}>
        {saving ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  );
}

/* ── Reviews Tab ── */
function ReviewsTab({ productId, user }) {
  const [data, setData] = useState({ reviews: [], avg: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get(`/reviews/product/${productId}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  const distrib = [5,4,3,2,1].map(s => ({ star: s, count: data.reviews.filter(r => r.rating === s).length }));

  return (
    <div style={{ overflowY: 'auto', maxHeight: 420 }}>
      {loading ? <div style={{ color: 'var(--gray)', fontSize: '.82rem', padding: '1rem 0' }}>Loading…</div> : (
        <>
          {data.count > 0 && (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.2rem', padding: '1rem', background: 'rgba(201,168,76,.04)', border: '1px solid rgba(201,168,76,.1)' }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '3rem', color: gold, lineHeight: 1 }}>{data.avg.toFixed(1)}</div>
                <Stars rating={Math.round(data.avg)} size={14} />
                <div style={{ fontSize: '.65rem', color: 'var(--gray)', marginTop: '.3rem' }}>{data.count} review{data.count !== 1 ? 's' : ''}</div>
              </div>
              <div style={{ flex: 1 }}>
                {distrib.map(d => (
                  <div key={d.star} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
                    <span style={{ fontSize: '.65rem', color: 'var(--gray)', width: 10 }}>{d.star}</span>
                    <span style={{ fontSize: '.7rem', color: '#F4C542' }}>★</span>
                    <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,.07)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: data.count ? `${(d.count/data.count)*100}%` : '0%', background: 'linear-gradient(90deg,#F4C54288,#F4C542)', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: '.62rem', color: 'var(--gray)', width: 12 }}>{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.reviews.length === 0
            ? <div style={{ color: 'var(--gray)', fontSize: '.82rem', padding: '.5rem 0 1rem' }}>No reviews yet — be the first!</div>
            : data.reviews.map(r => (
              <div key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,.06)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.3rem' }}>
                  <div><Stars rating={r.rating} size={12} />{r.title && <div style={{ fontSize: '.82rem', color: 'var(--white)', fontWeight: 500, marginTop: '.2rem' }}>{r.title}</div>}</div>
                  <div style={{ fontSize: '.65rem', color: 'var(--gray)', textAlign: 'right', flexShrink: 0, marginLeft: '.5rem' }}>
                    <div>{r.name}</div>
                    <div>{new Date(r.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>
                {r.body && <p style={{ fontSize: '.8rem', color: 'var(--gray)', lineHeight: 1.7, margin: 0 }}>{r.body}</p>}
              </div>
            ))
          }
          {!submitted
            ? <ReviewForm productId={productId} user={user} onSubmitted={() => { setSubmitted(true); load(); }} />
            : <div style={{ background: 'rgba(39,174,96,.08)', border: '1px solid rgba(39,174,96,.3)', color: '#2ecc71', padding: '.9rem 1rem', fontSize: '.82rem', marginTop: '1rem' }}>✅ Thank you! Your review has been published.</div>
          }
        </>
      )}
    </div>
  );
}

/* ── ProductCard — original tall portrait style ── */
function ProductCard({ product, brands, onView, onAddToCart }) {
  const brand = brands.find(b => b.id === product.brand_id);
  const imgs = parseImgs(product.images);
  const inStock = product.stock > 0;
  const sizes = [];
  if (product.price_tester > 0) sizes.push({ key: 'tester', label: 'Tester', price: +product.price_tester });
  if (product.price_50 > 0)     sizes.push({ key: 'ml50',   label: '50 ml',  price: +product.price_50 });
  if (product.price_100 > 0)    sizes.push({ key: 'ml100',  label: '100 ml', price: +product.price_100 });
  const [ratingData, setRatingData] = useState({ avg: 0, count: 0 });
  useEffect(() => {
    api.get(`/reviews/product/${product.id}`).then(r => setRatingData({ avg: r.data.avg, count: r.data.count })).catch(() => {});
  }, [product.id]);

  return (
    <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', transition: 'all .35s', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.45)'; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,.5)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.14)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>

      {!inStock && <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(192,57,43,.85)', color: '#fff', fontSize: '.6rem', padding: '.2rem .6rem', letterSpacing: '.1em', textTransform: 'uppercase', zIndex: 2 }}>Out of Stock</div>}

      {/* Tall portrait image — original style */}
      <div style={{ aspectRatio: '3/4', background: dark3, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '4rem', color: 'rgba(201,168,76,.2)', cursor: 'pointer', position: 'relative' }} onClick={() => onView(product)}>
        {imgs[0] ? <img src={imgs[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} /> : '🧴'}
      </div>

      <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '.4rem', flex: 1 }}>
        <div style={{ fontSize: '.62rem', color: gold, letterSpacing: '.15em', textTransform: 'uppercase' }}>{brand?.name || product.brand_name || '—'}</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.25rem', fontWeight: 400, marginBottom: '.4rem', cursor: 'pointer' }} onClick={() => onView(product)}>{product.name}</div>

        {/* Star rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', cursor: 'pointer' }} onClick={() => onView(product)}>
          <Stars rating={Math.round(ratingData.avg)} size={12} />
          <span style={{ fontSize: '.62rem', color: ratingData.count > 0 ? '#F4C542' : 'var(--gray)' }}>
            {ratingData.count > 0 ? `${ratingData.avg.toFixed(1)} (${ratingData.count})` : 'No reviews yet'}
          </span>
        </div>

        <div style={{ fontSize: '.72rem', color: 'var(--gray)', marginBottom: '1rem' }}><span className={`tag tag-${product.category}`}>{product.category}</span></div>

        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {product.price_tester > 0 && <span style={{ fontSize: '.7rem', color: 'var(--light-gray)' }}>Tester <strong style={{ color: gold }}>${product.price_tester}</strong></span>}
          {product.price_50 > 0 && <span style={{ fontSize: '.7rem', color: 'var(--light-gray)' }}>50ml <strong style={{ color: gold }}>${product.price_50}</strong></span>}
          {product.price_100 > 0 && <span style={{ fontSize: '.7rem', color: 'var(--light-gray)' }}>100ml <strong style={{ color: gold }}>${product.price_100}</strong></span>}
        </div>

        <button className="btn-primary" style={{ width: '100%', padding: '.7rem', fontSize: '.72rem' }} disabled={!inStock} onClick={() => onAddToCart(product)}>
          {inStock ? 'Add to Cart' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}

/* ── ProductModal ── */
function ProductModal({ product, brands, onClose, onAddToCart, user }) {
  if (!product) return null;
  const brand = brands.find(b => b.id === product.brand_id);
  const imgs = parseImgs(product.images);
  const [selImg, setSelImg] = useState(0);
  const [extraImgs, setExtraImgs] = useState([]);
  const [activeTab, setActiveTab] = useState('details');
  const fileRef = useRef();
  const sizes = [];
  if (product.price_tester > 0) sizes.push({ key: 'tester', label: 'Tester', price: +product.price_tester });
  if (product.price_50 > 0)     sizes.push({ key: 'ml50',   label: '50 ml',  price: +product.price_50 });
  if (product.price_100 > 0)    sizes.push({ key: 'ml100',  label: '100 ml', price: +product.price_100 });
  const [selSize, setSelSize] = useState(sizes[0] || null);
  const [ratingData, setRatingData] = useState({ avg: 0, count: 0 });

  useEffect(() => { setSelSize(sizes[0] || null); setSelImg(0); setExtraImgs([]); setActiveTab('details'); }, [product.id]);
  useEffect(() => { api.get(`/reviews/product/${product.id}`).then(r => setRatingData({ avg: r.data.avg, count: r.data.count })).catch(() => {}); }, [product.id]);

  const notes = product.notes ? product.notes.split(',').map(n => n.trim()).filter(Boolean) : [];
  const allImgs = [...imgs, ...extraImgs];

  const handleFileUpload = e => {
    const files = Array.from(e.target.files);
    Promise.all(files.map(f => new Promise(res => { const r = new FileReader(); r.onload = ev => res(ev.target.result); r.readAsDataURL(f); })))
      .then(results => setExtraImgs(prev => [...prev, ...results]));
    e.target.value = '';
  };

  const Tab = ({ id, label, badge }) => (
    <button onClick={() => setActiveTab(id)} style={{ padding: '.5rem 1.1rem', border: 'none', background: activeTab === id ? 'rgba(201,168,76,.12)' : 'transparent', color: activeTab === id ? gold : 'var(--gray)', cursor: 'pointer', fontSize: '.7rem', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: "'Jost',sans-serif", borderBottom: `2px solid ${activeTab === id ? gold : 'transparent'}`, transition: 'all .2s', display: 'inline-flex', alignItems: 'center', gap: '.3rem' }}>
      {label}{badge > 0 && <span style={{ background: gold, color: 'var(--black)', borderRadius: 8, padding: '0 5px', fontSize: '.55rem', fontWeight: 700 }}>{badge}</span>}
    </button>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,.2)', width: '100%', maxWidth: '980px', display: 'grid', gridTemplateColumns: '400px 1fr', animation: 'fadeUp .3s ease', position: 'relative', maxHeight: '92vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.1)', color: 'var(--light-gray)', fontSize: '1rem', cursor: 'pointer', zIndex: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

        {/* Gallery */}
        <div style={{ background: dark3, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: '0 0 auto', aspectRatio: '3/4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '6rem', color: 'rgba(201,168,76,.15)', position: 'relative' }}>
            {allImgs[selImg] ? <img src={allImgs[selImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>🧴</span>}
            <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,.7)', border: '1px solid rgba(201,168,76,.4)', color: gold, padding: '.4rem .85rem', fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>📷 Add Photo</button>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
          </div>
          {allImgs.length > 0 && (
            <div style={{ display: 'flex', gap: '.4rem', padding: '.7rem', overflowX: 'auto', background: 'rgba(0,0,0,.3)', flexShrink: 0 }}>
              {allImgs.map((src, i) => (
                <div key={i} onClick={() => setSelImg(i)} style={{ width: 52, height: 66, flexShrink: 0, border: `2px solid ${i === selImg ? gold : 'rgba(201,168,76,.2)'}`, cursor: 'pointer', overflow: 'hidden' }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
              <div onClick={() => fileRef.current?.click()} style={{ width: 52, height: 66, flexShrink: 0, border: '2px dashed rgba(201,168,76,.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(201,168,76,.5)', fontSize: '1.2rem' }}>+</div>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ fontSize: '.63rem', color: gold, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: '.25rem' }}>{brand?.name || product.brand_name}</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.9rem', fontWeight: 300, lineHeight: 1.1, marginBottom: '.4rem' }}>{product.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.7rem', cursor: 'pointer' }} onClick={() => setActiveTab('reviews')}>
            <Stars rating={Math.round(ratingData.avg)} size={14} />
            <span style={{ fontSize: '.72rem', color: ratingData.count > 0 ? '#F4C542' : 'var(--gray)' }}>
              {ratingData.count > 0 ? `${ratingData.avg.toFixed(1)} · ${ratingData.count} review${ratingData.count !== 1 ? 's' : ''}` : 'No reviews — be the first!'}
            </span>
          </div>
          <span className={`tag tag-${product.category}`} style={{ alignSelf: 'flex-start', marginBottom: '.9rem' }}>{product.category}</span>

          <div style={{ display: 'flex', borderBottom: '1px solid rgba(201,168,76,.12)', marginBottom: '1rem', gap: '.1rem', flexShrink: 0 }}>
            <Tab id="details" label="Details" badge={0} />
            <Tab id="profile" label="Scent Profile" badge={0} />
            <Tab id="reviews" label="Reviews" badge={ratingData.count} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {activeTab === 'details' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
                {product.description && <p style={{ color: 'var(--gray)', fontSize: '.83rem', lineHeight: 1.8, margin: 0 }}>{product.description}</p>}
                {notes.length > 0 && (
                  <div>
                    <div style={{ fontSize: '.63rem', color: gold, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: '.5rem' }}>Scent Notes</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
                      {notes.map(n => <span key={n} style={{ background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.2)', color: 'var(--light-gray)', fontSize: '.7rem', padding: '.2rem .6rem' }}>{n}</span>)}
                    </div>
                  </div>
                )}
                <div style={{ fontSize: '.75rem', color: product.stock > 0 ? '#27ae60' : '#e74c3c' }}>
                  {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
                </div>
              </div>
            )}
            {activeTab === 'profile' && <ScentBars profile={product.scent_profile} />}
            {activeTab === 'reviews' && <ReviewsTab productId={product.id} user={user} />}
          </div>

          <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(201,168,76,.1)', paddingTop: '1rem', flexShrink: 0 }}>
            {sizes.length > 0 && (
              <div style={{ marginBottom: '.9rem' }}>
                <div style={{ fontSize: '.63rem', color: gold, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: '.5rem' }}>Select Size</div>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  {sizes.map(s => (
                    <button key={s.key} onClick={() => setSelSize(s)} style={{ padding: '.5rem 1rem', border: `1px solid ${selSize?.key === s.key ? gold : 'rgba(201,168,76,.25)'}`, background: selSize?.key === s.key ? 'rgba(201,168,76,.1)' : 'transparent', color: selSize?.key === s.key ? gold : 'var(--light-gray)', cursor: 'pointer', fontSize: '.75rem', fontFamily: "'Jost',sans-serif", transition: 'all .2s' }}>
                      {s.label} — <strong>${s.price}</strong>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {product.stock <= 0
              ? <div style={{ color: '#e74c3c', fontSize: '.8rem' }}>Currently out of stock</div>
              : <button className="btn-primary" style={{ width: '100%' }} onClick={() => { if (selSize) { onAddToCart(product, selSize.key, selSize.label, selSize.price); onClose(); } }}>
                  Add to Cart — {selSize ? `$${selSize.price}` : 'Select a size'}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Cart Sidebar ── */
function CartSidebar({ open, onClose }) {
  const { cart, removeFromCart, updateQty, cartTotal } = useAuth();
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 4000 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)' }} onClick={onClose} />
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '420px', maxWidth: '100vw', background: 'var(--dark)', borderLeft: '1px solid rgba(201,168,76,.18)', display: 'flex', flexDirection: 'column', animation: 'fadeUp .25s ease' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(201,168,76,.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', fontWeight: 300 }}>Your Cart</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--gray)', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.2rem' }}>
          {cart.length === 0
            ? <div style={{ textAlign: 'center', color: 'var(--gray)', padding: '3rem 0', fontSize: '.88rem' }}>Your cart is empty</div>
            : cart.map(item => {
                const img = Array.isArray(item.images) ? item.images[0] : null;
                return (
                  <div key={item.key} style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem', paddingBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                    <div style={{ width: 60, height: 80, background: dark3, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'rgba(201,168,76,.3)' }}>
                      {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} /> : '🧴'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.7rem', color: gold, marginBottom: '.15rem' }}>{item.brand_name}</div>
                      <div style={{ fontSize: '.85rem', marginBottom: '.15rem' }}>{item.name}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--gray)', marginBottom: '.5rem' }}>{item.sizeLabel} — ${item.price}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <button onClick={() => updateQty(item.key, item.qty - 1)} style={{ width: 24, height: 24, border: '1px solid rgba(201,168,76,.3)', background: 'none', color: gold, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                        <span style={{ minWidth: 20, textAlign: 'center', fontSize: '.85rem' }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.key, item.qty + 1)} style={{ width: 24, height: 24, border: '1px solid rgba(201,168,76,.3)', background: 'none', color: gold, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                        <button onClick={() => removeFromCart(item.key)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', fontSize: '.7rem' }}>Remove</button>
                      </div>
                    </div>
                    <div style={{ fontSize: '.88rem', color: gold, fontWeight: 500, whiteSpace: 'nowrap' }}>${(item.price * item.qty).toFixed(2)}</div>
                  </div>
                );
              })}
        </div>
        {cart.length > 0 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(201,168,76,.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem', fontSize: '.88rem' }}>
              <span style={{ color: 'var(--gray)' }}>Subtotal</span>
              <span style={{ color: gold, fontWeight: 500, fontSize: '1.1rem' }}>${cartTotal.toFixed(2)}</span>
            </div>
            <button className="btn-primary" style={{ width: '100%' }} onClick={() => { onClose(); navigate('/checkout'); }}>Proceed to Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Customer Reviews Section (home page) ── */
function SiteReviewForm({ user, onSubmitted }) {
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', rating: 0, title: '', body: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.rating) { setErr('Please select a star rating.'); return; }
    if (!form.name.trim()) { setErr('Please enter your name.'); return; }
    if (!form.body.trim()) { setErr('Please write your review.'); return; }
    setSaving(true); setErr('');
    try {
      await api.post('/site-reviews', { user_id: user?.id || null, name: form.name, email: form.email, rating: form.rating, title: form.title, body: form.body });
      onSubmitted();
      setForm({ name: user?.name || '', email: user?.email || '', rating: 0, title: '', body: '' });
    } catch (e) { setErr(e.response?.data?.error || 'Failed to submit review.'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.15)', padding: '2rem', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ fontSize: '.7rem', color: gold, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: '1.2rem', textAlign: 'center' }}>Share Your Experience</div>
      {err && <div className="msg-error" style={{ marginBottom: '1rem', fontSize: '.78rem' }}>{err}</div>}
      <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
        <div style={{ fontSize: '.65rem', color: 'var(--gray)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.5rem' }}>Your Rating *</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Stars rating={form.rating} size={26} interactive onRate={v => setF('rating', v)} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem', marginBottom: '.8rem' }}>
        <div><label style={{ fontSize: '.65rem', color: 'var(--gray)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: '.35rem' }}>Name *</label>
          <input className="form-input" value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Your name" /></div>
        <div><label style={{ fontSize: '.65rem', color: 'var(--gray)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: '.35rem' }}>Email</label>
          <input className="form-input" value={form.email} onChange={e => setF('email', e.target.value)} placeholder="your@email.com" /></div>
      </div>
      <div style={{ marginBottom: '.8rem' }}>
        <label style={{ fontSize: '.65rem', color: 'var(--gray)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: '.35rem' }}>Review Title</label>
        <input className="form-input" value={form.title} onChange={e => setF('title', e.target.value)} placeholder="e.g. Wonderful shopping experience" />
      </div>
      <div style={{ marginBottom: '1.2rem' }}>
        <label style={{ fontSize: '.65rem', color: 'var(--gray)', letterSpacing: '.1em', textTransform: 'uppercase', display: 'block', marginBottom: '.35rem' }}>Your Review *</label>
        <textarea className="textarea-input" style={{ minHeight: 100 }} value={form.body} onChange={e => setF('body', e.target.value)} placeholder="Tell us about your experience with AURUM…" />
      </div>
      <button className="btn-primary" style={{ width: '100%' }} onClick={submit} disabled={saving}>{saving ? 'Submitting…' : 'Submit Review'}</button>
    </div>
  );
}

function HomeReviews() {
  const { user } = useAuth();
  const [data, setData] = useState({ reviews: [], avg: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/site-reviews').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmitted = () => { setSubmitted(true); setShowForm(false); load(); setTimeout(() => setSubmitted(false), 5000); };

  return (
    <div style={{ padding: '5rem 2.5rem', background: 'var(--black)', borderTop: '1px solid rgba(201,168,76,.1)' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ fontSize: '.64rem', letterSpacing: '.45em', textTransform: 'uppercase', color: gold, marginBottom: '1rem' }}>What Our Clients Say</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, marginBottom: '.8rem' }}>Customer Reviews</h2>
        {data.count > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.6rem', marginBottom: '.5rem' }}>
            <Stars rating={Math.round(data.avg)} size={16} />
            <span style={{ fontSize: '.8rem', color: '#F4C542' }}>{data.avg.toFixed(1)} out of 5</span>
            <span style={{ fontSize: '.75rem', color: 'var(--gray)' }}>· {data.count} review{data.count !== 1 ? 's' : ''}</span>
          </div>
        )}
        <span style={{ display: 'block', width: 55, height: 1, background: gold, margin: '1rem auto 0' }} />
      </div>

      {loading ? <div style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>Loading reviews…</div> : (
        <>
          {data.reviews.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--gray)', fontSize: '.85rem', marginBottom: '2.5rem' }}>No reviews yet — be the first to share your experience!</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: 1200, margin: '0 auto 3rem' }}>
              {data.reviews.map(r => (
                <div key={r.id} style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '.7rem', transition: 'all .3s', position: 'relative' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.14)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ position: 'absolute', top: '1.2rem', right: '1.4rem', fontFamily: "'Cormorant Garamond',serif", fontSize: '3.5rem', color: 'rgba(201,168,76,.1)', lineHeight: 1, userSelect: 'none' }}>"</div>
                  <Stars rating={r.rating} size={13} />
                  {r.title && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.1rem', color: 'var(--white)', fontStyle: 'italic' }}>"{r.title}"</div>}
                  {r.body && <p style={{ fontSize: '.8rem', color: 'var(--gray)', lineHeight: 1.75, margin: 0, flex: 1 }}>{r.body}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem', paddingTop: '.8rem', borderTop: '1px solid rgba(255,255,255,.05)', marginTop: 'auto' }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: '1rem', color: gold, flexShrink: 0 }}>
                      {r.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '.78rem', color: 'var(--light-gray)' }}>{r.name}</div>
                      <div style={{ fontSize: '.65rem', color: 'var(--gray)' }}>{new Date(r.created).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Write a review CTA */}
          <div style={{ textAlign: 'center' }}>
            {submitted ? (
              <div style={{ background: 'rgba(39,174,96,.08)', border: '1px solid rgba(39,174,96,.3)', color: '#2ecc71', padding: '1rem 1.5rem', fontSize: '.85rem', maxWidth: 480, margin: '0 auto' }}>
                ✅ Thank you! Your review has been published for all visitors to see.
              </div>
            ) : showForm ? (
              <SiteReviewForm user={user} onSubmitted={handleSubmitted} />
            ) : (
              <button className="btn-outline" onClick={() => setShowForm(true)}>✍️ Write a Review</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Footer ── */
function Footer({ setView }) {
  return (
    <footer style={{ background: '#080808', borderTop: '1px solid rgba(201,168,76,.15)' }}>
      <div style={{ padding: '3.5rem 4rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', borderBottom: '1px solid rgba(201,168,76,.1)' }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', fontWeight: 300, letterSpacing: '.35em', color: gold, marginBottom: '.6rem' }}>AURUM</div>
          <div style={{ fontSize: '.62rem', letterSpacing: '.25em', textTransform: 'uppercase', color: 'rgba(201,168,76,.5)', marginBottom: '1.2rem' }}>Luxury Fragrance House</div>
          <p style={{ fontSize: '.78rem', color: 'var(--gray)', lineHeight: 1.8, maxWidth: 280 }}>Curating the world's most prestigious fragrances since 2024. Every bottle is authenticated and sourced directly from official distributors.</p>
          <div style={{ display: 'flex', gap: '.8rem', marginTop: '1.2rem' }}>
            {['IG','FB','WA'].map(s => (
              <div key={s} style={{ width: 34, height: 34, border: '1px solid rgba(201,168,76,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(201,168,76,.6)', fontSize: '.6rem', letterSpacing: '.05em', transition: 'all .25s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.color = gold; e.currentTarget.style.background = 'rgba(201,168,76,.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.25)'; e.currentTarget.style.color = 'rgba(201,168,76,.6)'; e.currentTarget.style.background = 'transparent'; }}>{s}</div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '.65rem', letterSpacing: '.2em', textTransform: 'uppercase', color: gold, marginBottom: '1.2rem' }}>Navigation</div>
          {[['home','Home'],['shop','Shop'],['brands','Brands'],['contact','Contact']].map(([v,l]) => (
            <div key={v} onClick={() => setView(v)} style={{ fontSize: '.78rem', color: 'var(--gray)', marginBottom: '.6rem', cursor: 'pointer', transition: 'color .2s' }}
              onMouseEnter={e => e.currentTarget.style.color = gold}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--gray)'}>{l}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: '.65rem', letterSpacing: '.2em', textTransform: 'uppercase', color: gold, marginBottom: '1.2rem' }}>Customer Care</div>
          {['Shipping Policy','Return Policy','Authenticity Guarantee','Privacy Policy','FAQ'].map(l => (
            <div key={l} style={{ fontSize: '.78rem', color: 'var(--gray)', marginBottom: '.6rem', cursor: 'pointer', transition: 'color .2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--light-gray)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--gray)'}>{l}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: '.65rem', letterSpacing: '.2em', textTransform: 'uppercase', color: gold, marginBottom: '1.2rem' }}>Contact</div>
          {[['📍','Sidon, Lebanon'],['📞','+961 70 000 000'],['✉️','hello@aurum.com'],['🕐','Mon–Sat · 10am – 8pm']].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start', marginBottom: '.7rem' }}>
              <span style={{ fontSize: '.8rem', flexShrink: 0, marginTop: '.1rem' }}>{icon}</span>
              <span style={{ fontSize: '.75rem', color: 'var(--gray)', lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,.3),rgba(201,168,76,.6),rgba(201,168,76,.3),transparent)' }} />
      <div style={{ padding: '1.2rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem' }}>
        <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.2)', letterSpacing: '.08em' }}>© {new Date().getFullYear()} AURUM Luxury Perfume. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Terms of Service','Privacy Policy','Cookie Policy'].map(l => (
            <span key={l} style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.2)', cursor: 'pointer', letterSpacing: '.06em' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(201,168,76,.6)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.2)'}>{l}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          {['💳','💵','🛒'].map(icon => <span key={icon} style={{ fontSize: '1rem', opacity: .35 }}>{icon}</span>)}
          <span style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.18)', marginLeft: '.3rem' }}>Secure Payment</span>
        </div>
      </div>
    </footer>
  );
}

/* ── MAIN STOREFRONT ── */
export default function StoreFront() {
  const { user, logout, cartCount, addToCart } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home');
  const [filterCat, setFilterCat] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactMsg, setContactMsg] = useState('');

  const showToast = useCallback((msg, type = 'info') => setToast({ msg, type, key: Date.now() }), []);

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/brands')]).then(([p, b]) => {
      setProducts(p.data); setBrands(b.data);
    }).finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(p => {
    if (filterCat && p.category !== filterCat) return false;
    if (filterBrand && p.brand_id !== filterBrand) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.description||'').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAddToCart = useCallback((product, sizeKey, sizeLabel, price) => {
    if (product.stock <= 0) return;
    if (!sizeKey) {
      const sizes = [];
      if (product.price_tester > 0) sizes.push({ key: 'tester', label: 'Tester', price: +product.price_tester });
      if (product.price_50 > 0)     sizes.push({ key: 'ml50',   label: '50 ml',  price: +product.price_50 });
      if (product.price_100 > 0)    sizes.push({ key: 'ml100',  label: '100 ml', price: +product.price_100 });
      if (!sizes.length) return;
      sizeKey = sizes[0].key; sizeLabel = sizes[0].label; price = sizes[0].price;
    }
    addToCart(product, sizeKey, sizeLabel, price);
    showToast(`${product.name} (${sizeLabel}) added to cart`, 'success');
  }, [addToCart, showToast]);

  const sendContact = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) { setContactMsg('error'); return; }
    try {
      await api.post('/messages', contactForm);
      setContactMsg('success');
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setContactMsg(''), 4000);
    } catch { setContactMsg('error'); }
  };

  const navStyle = { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(10,10,10,.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(201,168,76,.18)', padding: '0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <nav style={navStyle}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.9rem', fontWeight: 300, letterSpacing: '.35em', color: gold, cursor: 'pointer' }} onClick={() => setView('home')}>AURUM</span>
        <ul style={{ display: 'flex', gap: '2rem', alignItems: 'center', listStyle: 'none' }}>
          {['home','shop','brands','contact'].map(v => (
            <li key={v}><span onClick={() => setView(v)} style={{ color: view === v ? gold : 'var(--light-gray)', cursor: 'pointer', fontSize: '.78rem', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 300, transition: 'color .3s' }}>{v}</span></li>
          ))}
        </ul>
        <div style={{ display: 'flex', gap: '.8rem', alignItems: 'center' }}>
          <button onClick={() => setCartOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--light-gray)', cursor: 'pointer', fontSize: '1.2rem', position: 'relative', padding: '.3rem' }}>
            🛒{cartCount > 0 && <span style={{ position: 'absolute', top: -5, right: -5, background: gold, color: 'var(--black)', borderRadius: '50%', width: 17, height: 17, fontSize: '.62rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{cartCount}</span>}
          </button>
          {user ? (
            <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center' }}>
              <span style={{ fontSize: '.75rem', color: gold }}>{user.name}</span>
              {user.role === 'admin' && <button className="btn-outline" style={{ padding: '.35rem .9rem', fontSize: '.7rem' }} onClick={() => navigate('/admin')}>Admin</button>}
              <button className="btn-outline" style={{ padding: '.35rem .9rem', fontSize: '.7rem' }} onClick={logout}>Logout</button>
            </div>
          ) : (
            <button className="btn-outline" style={{ padding: '.38rem 1.1rem', fontSize: '.72rem' }} onClick={() => navigate('/login')}>Sign In</button>
          )}
        </div>
      </nav>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      {selectedProduct && <ProductModal product={selectedProduct} brands={brands} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} user={user} />}
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <div style={{ flex: 1, paddingTop: '68px' }}>

        {/* ── HOME ── */}
        {view === 'home' && (
          <div>
            {/* Hero */}
            <div style={{ height: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'url(/background-aurum.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.52)' }} />
              <div style={{ textAlign: 'center', maxWidth: '820px', padding: '0 2rem', animation: 'fadeUp 1.1s ease both', position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '.68rem', letterSpacing: '.45em', textTransform: 'uppercase', color: gold, marginBottom: '1.5rem', fontWeight: 300 }}>Luxury Fragrance House</div>
                <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(3.5rem,8.5vw,7.5rem)', fontWeight: 300, lineHeight: .95, marginBottom: '1.5rem' }}>The Art of<br /><em style={{ color: gold }}>Scent</em></h1>
                <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.88rem', letterSpacing: '.06em', lineHeight: 1.9, marginBottom: '3rem', fontWeight: 300 }}>Curated fragrances from the world's most prestigious houses.<br />Every bottle tells a story.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn-primary" onClick={() => setView('shop')}>Explore Collection</button>
                  <button className="btn-outline" onClick={() => setView('brands')}>Our Brands</button>
                </div>
              </div>
            </div>

            {/* Features strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid rgba(201,168,76,.12)' }}>
              {[['🌹','Authentic','100% authentic fragrances from verified sources worldwide.'],['✈️','Worldwide Shipping','Discreet, insured delivery to your door.'],['💎','Exclusive Selection','Rare and discontinued scents you won\'t find elsewhere.']].map(([icon,title,text]) => (
                <div key={title} style={{ padding: '3rem 2.5rem', textAlign: 'center', borderRight: '1px solid rgba(201,168,76,.12)', transition: 'background .3s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ fontSize: '1.8rem', color: gold, marginBottom: '1rem' }}>{icon}</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.25rem', marginBottom: '.5rem' }}>{title}</h3>
                  <p style={{ color: 'var(--gray)', fontSize: '.78rem', lineHeight: 1.75 }}>{text}</p>
                </div>
              ))}
            </div>

            {/* Featured products */}
            <div style={{ padding: '6rem 2.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ fontSize: '.64rem', letterSpacing: '.45em', textTransform: 'uppercase', color: gold, marginBottom: '1rem' }}>Handpicked</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 300 }}>Featured Fragrances</h2>
                <span style={{ display: 'block', width: 55, height: 1, background: gold, margin: '1.5rem auto 0' }} />
              </div>
              {loading ? <div style={{ textAlign: 'center', color: 'var(--gray)', padding: '4rem' }}>Loading…</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.5rem', maxWidth: 1200, margin: '0 auto' }}>
                  {products.slice(0, 6).map(p => <ProductCard key={p.id} product={p} brands={brands} onView={setSelectedProduct} onAddToCart={handleAddToCart} />)}
                </div>
              )}
              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <button className="btn-outline" onClick={() => setView('shop')}>View All Products</button>
              </div>
            </div>

            {/* Brands strip */}
            <div style={{ padding: '4rem 2.5rem', background: dark2, borderTop: '1px solid rgba(201,168,76,.1)', borderBottom: '1px solid rgba(201,168,76,.1)' }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ fontSize: '.64rem', letterSpacing: '.45em', textTransform: 'uppercase', color: gold, marginBottom: '.8rem' }}>Our Partners</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', fontWeight: 300 }}>Prestigious Houses</h2>
              </div>
              {/* Equal-height grid, logo square container */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', maxWidth: 1200, margin: '0 auto' }}>
                {brands.map(b => (
                  <div key={b.id} onClick={() => { setFilterBrand(b.id); setView('shop'); }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.7rem', cursor: 'pointer', padding: '1.4rem 1rem', background: dark3, border: '1px solid rgba(201,168,76,.15)', transition: 'all .3s', height: '170px', justifyContent: 'center' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.15)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    {/* Square logo box — objectFit contain so nothing is cropped */}
                    <div style={{ width: 68, height: 68, background: 'rgba(201,168,76,.06)', border: '1px solid rgba(201,168,76,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {b.logo
                        ? <img src={b.logo} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} onError={e => e.target.style.display='none'} />
                        : <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.6rem', color: gold }}>{b.name[0]}</span>}
                    </div>
                    <div style={{ fontSize: '.67rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--light-gray)', textAlign: 'center', lineHeight: 1.35 }}>{b.name}</div>
                    <div style={{ fontSize: '.6rem', color: 'var(--gray)' }}>{b.productCount || 0} products</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer reviews section — visible to ALL visitors */}
            <HomeReviews />
          </div>
        )}

        {/* ── SHOP ── */}
        {view === 'shop' && (
          <div>
            <div style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(201,168,76,.08) 0%,transparent 60%),var(--black)', padding: '3rem 2.5rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '.64rem', letterSpacing: '.45em', textTransform: 'uppercase', color: gold, marginBottom: '1rem' }}>Our Collection</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 300 }}>All Fragrances</h1>
            </div>
            <div style={{ padding: '1.2rem 2.5rem', background: dark2, borderBottom: '1px solid rgba(201,168,76,.1)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input style={{ padding: '.55rem 1rem', background: dark3, border: '1px solid rgba(201,168,76,.15)', color: 'var(--white)', fontFamily: "'Jost',sans-serif", fontSize: '.82rem', outline: 'none', minWidth: 220 }} placeholder="Search fragrances…" value={search} onChange={e => setSearch(e.target.value)} />
              <select className="form-select" style={{ width: 'auto' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option value="">All Categories</option><option value="men">Men</option><option value="women">Women</option><option value="unisex">Unisex</option>
              </select>
              <select className="form-select" style={{ width: 'auto' }} value={filterBrand} onChange={e => setFilterBrand(e.target.value ? Number(e.target.value) : '')}>
                <option value="">All Brands</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {(filterCat || filterBrand || search) && <button onClick={() => { setFilterCat(''); setFilterBrand(''); setSearch(''); }} style={{ background: 'none', border: '1px solid rgba(201,168,76,.25)', color: gold, padding: '.5rem 1rem', cursor: 'pointer', fontSize: '.75rem', letterSpacing: '.1em' }}>Clear</button>}
              <span style={{ marginLeft: 'auto', color: 'var(--gray)', fontSize: '.78rem' }}>{filteredProducts.length} product(s)</span>
            </div>
            <div style={{ padding: '2rem 2.5rem' }}>
              {loading ? <div style={{ textAlign: 'center', color: 'var(--gray)', padding: '4rem' }}>Loading…</div>
                : filteredProducts.length === 0 ? <div style={{ textAlign: 'center', color: 'var(--gray)', padding: '4rem' }}>No products found.</div>
                : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
                    {filteredProducts.map(p => <ProductCard key={p.id} product={p} brands={brands} onView={setSelectedProduct} onAddToCart={handleAddToCart} />)}
                  </div>}
            </div>
          </div>
        )}

        {/* ── BRANDS ── */}
        {view === 'brands' && (
          <div>
            <div style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(201,168,76,.08) 0%,transparent 60%),var(--black)', padding: '3rem 2.5rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '.64rem', letterSpacing: '.45em', textTransform: 'uppercase', color: gold, marginBottom: '1rem' }}>Heritage & Craft</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 300 }}>Our Brands</h1>
            </div>
            <div style={{ padding: '2.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1.5rem', maxWidth: 1200, margin: '0 auto' }}>
                {brands.map(b => (
                  <div key={b.id} onClick={() => { setFilterBrand(b.id); setView('shop'); }} style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'all .35s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 45px rgba(0,0,0,.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,.14)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ width: 70, height: 70, background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem', overflow: 'hidden' }}>
                      {b.logo ? <img src={b.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} onError={e => e.target.style.display='none'} /> : <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', color: gold }}>{b.name[0]}</span>}
                    </div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', fontWeight: 400, marginBottom: '.3rem' }}>{b.name}</h3>
                    <div style={{ fontSize: '.72rem', color: gold, marginBottom: '.5rem' }}>{b.country}{b.founded ? ` · Est. ${b.founded}` : ''}</div>
                    <div style={{ fontSize: '.75rem', color: gold, marginBottom: '.8rem' }}>{b.productCount || 0} fragrances</div>
                    <p style={{ fontSize: '.78rem', color: 'var(--gray)', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{b.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CONTACT ── */}
        {view === 'contact' && (
          <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 2.5rem' }}>
            <div style={{ maxWidth: 680, width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ fontSize: '.64rem', letterSpacing: '.45em', textTransform: 'uppercase', color: gold, marginBottom: '1rem' }}>Get in Touch</div>
                <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 300 }}>Contact Us</h1>
              </div>
              <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', padding: '2.5rem' }}>
                {contactMsg === 'success' && <div className="msg-success">Message sent! We'll reply within 24 hours.</div>}
                {contactMsg === 'error' && <div className="msg-error">Please fill all required fields.</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group"><label className="form-label">Your Name *</label><input className="form-input" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Email Address *</label><input className="form-input" type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} /></div>
                </div>
                <div className="form-group"><label className="form-label">Subject</label><input className="form-input" value={contactForm.subject} onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Message *</label><textarea className="textarea-input" style={{ minHeight: 140 }} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} /></div>
                <button className="btn-primary" onClick={sendContact}>Send Message</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer setView={setView} />
    </div>
  );
}