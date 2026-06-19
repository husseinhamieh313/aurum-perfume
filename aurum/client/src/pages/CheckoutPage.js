import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const gold = 'var(--gold)';
const dark2 = 'var(--dark2)';
const dark3 = 'var(--dark3)';

function Toast({ msg, type, onDone }) {
  React.useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  const colors = { success: '#27ae60', error: '#e74c3c', info: gold };
  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: dark2, border: `1px solid ${colors[type] || gold}`, color: colors[type] || gold, padding: '.88rem 1.4rem', zIndex: 9999, fontSize: '.82rem', animation: 'fadeUp .3s ease', boxShadow: '0 8px 32px rgba(0,0,0,.5)' }}>
      {type === 'success' ? '✅' : type === 'error' ? '❌' : '✨'} {msg}
    </div>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart, user } = useAuth();
  const [form, setForm] = useState({
    fname: user?.name?.split(' ')[0] || '',
    lname: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    address: '', city: '', zip: '', country: 'Lebanon', payment: 'cod'
  });
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'info') => setToast({ msg, type, key: Date.now() });
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const placeOrder = async () => {
    if (!form.fname || !form.lname || !form.email || !form.address || !form.city || !form.zip) {
      showToast('Please fill all shipping fields.', 'error');
      return;
    }
    if (cart.length === 0) {
      showToast('Your cart is empty.', 'error');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        customer: `${form.fname} ${form.lname}`,
        email: form.email,
        items: cart,
        total: cartTotal,
        payment: form.payment,
        address: `${form.address}, ${form.city}, ${form.zip}, ${form.country}`,
      });
      clearCart();
      setOrderId(data.id);
    } catch (err) {
      showToast(err.response?.data?.error || 'Order failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const shipping = cartTotal > 100 ? 0 : 15;
  const grandTotal = cartTotal + shipping;

  // ── ORDER CONFIRMED SCREEN ──
  if (orderId) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'radial-gradient(ellipse at 50% 60%,rgba(201,168,76,.07) 0%,transparent 60%),var(--black)' }}>
      <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.25)', padding: '3.5rem', maxWidth: 500, width: '100%', textAlign: 'center', animation: 'fadeUp .5s ease' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1.2rem' }}>✅</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.4rem', fontWeight: 300, color: gold, marginBottom: '.8rem' }}>Order Confirmed!</h2>
        <p style={{ color: 'var(--gray)', marginBottom: '1.5rem', fontSize: '.88rem', lineHeight: 1.7 }}>
          Thank you for your order, <strong style={{ color: 'var(--white)' }}>{form.fname}</strong>.<br />
          We'll contact you at <strong style={{ color: 'var(--white)' }}>{form.email}</strong> shortly.
        </p>
        <div style={{ background: dark3, border: '1px solid rgba(201,168,76,.18)', padding: '1rem 1.5rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '.65rem', color: 'var(--gray)', letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: '.3rem' }}>Order ID</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', color: gold, letterSpacing: '.1em' }}>{orderId}</div>
        </div>
        <button className="btn-primary" onClick={() => navigate('/')}>Continue Shopping</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,10,.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(201,168,76,.18)', padding: '0 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.9rem', fontWeight: 300, letterSpacing: '.35em', color: gold, cursor: 'pointer' }} onClick={() => navigate('/')}>AURUM</span>
        <span style={{ fontSize: '.78rem', color: 'var(--gray)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Secure Checkout</span>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', fontSize: '.78rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>← Back to Store</button>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2.5rem', fontWeight: 300, marginBottom: '2.5rem' }}>Checkout</h1>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--gray)', padding: '5rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
            <p style={{ marginBottom: '1.5rem' }}>Your cart is empty.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Shop Now</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2.5rem', alignItems: 'start' }}>

            {/* LEFT — FORMS */}
            <div>
              {/* Shipping */}
              <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", color: gold, fontSize: '1.3rem', marginBottom: '1.4rem', paddingBottom: '.8rem', borderBottom: '1px solid rgba(201,168,76,.12)' }}>
                  📦 Shipping Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group"><label className="form-label">First Name *</label><input className="form-input" value={form.fname} onChange={e => setF('fname', e.target.value)} placeholder="John" /></div>
                  <div className="form-group"><label className="form-label">Last Name *</label><input className="form-input" value={form.lname} onChange={e => setF('lname', e.target.value)} placeholder="Doe" /></div>
                </div>
                <div className="form-group"><label className="form-label">Email Address *</label><input className="form-input" type="email" value={form.email} onChange={e => setF('email', e.target.value)} placeholder="your@email.com" /></div>
                <div className="form-group"><label className="form-label">Street Address *</label><input className="form-input" value={form.address} onChange={e => setF('address', e.target.value)} placeholder="123 Main Street" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group"><label className="form-label">City *</label><input className="form-input" value={form.city} onChange={e => setF('city', e.target.value)} placeholder="Beirut" /></div>
                  <div className="form-group"><label className="form-label">ZIP / Postal Code *</label><input className="form-input" value={form.zip} onChange={e => setF('zip', e.target.value)} placeholder="00000" /></div>
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <select className="form-select" value={form.country} onChange={e => setF('country', e.target.value)}>
                    {['Lebanon','UAE','Saudi Arabia','Jordan','Egypt','Kuwait','Qatar','Bahrain','Oman','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Payment */}
              <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', padding: '2rem' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", color: gold, fontSize: '1.3rem', marginBottom: '1.4rem', paddingBottom: '.8rem', borderBottom: '1px solid rgba(201,168,76,.12)' }}>
                  💳 Payment Method
                </h3>
                {[
                  { key: 'cod',  icon: '💵', label: 'Cash on Delivery',    sub: 'Pay when your order arrives', enabled: true },
                  { key: 'card', icon: '💳', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, Amex',       enabled: false },
                  { key: 'wish', icon: '🛒', label: 'Wish Pay',            sub: 'Pay via Wish platform',        enabled: false },
                ].map(m => (
                  <div key={m.key} onClick={() => m.enabled && setF('payment', m.key)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.2rem', border: `1px solid ${form.payment === m.key ? gold : 'rgba(201,168,76,.15)'}`, background: form.payment === m.key ? 'rgba(201,168,76,.07)' : 'transparent', marginBottom: '.7rem', cursor: m.enabled ? 'pointer' : 'not-allowed', opacity: m.enabled ? 1 : .45, transition: 'all .2s' }}>
                    <span style={{ fontSize: '1.5rem' }}>{m.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '.85rem', color: form.payment === m.key ? 'var(--white)' : 'var(--light-gray)' }}>
                        {m.label} {!m.enabled && <span style={{ fontSize: '.65rem', background: 'rgba(201,168,76,.15)', color: gold, padding: '.1rem .4rem', marginLeft: '.4rem', letterSpacing: '.07em' }}>COMING SOON</span>}
                      </div>
                      <div style={{ fontSize: '.72rem', color: 'var(--gray)', marginTop: '.2rem' }}>{m.sub}</div>
                    </div>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${form.payment === m.key ? gold : 'rgba(201,168,76,.3)'}`, background: form.payment === m.key ? gold : 'transparent', transition: 'all .2s' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — ORDER SUMMARY */}
            <div>
              <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', padding: '2rem', position: 'sticky', top: '90px' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", color: gold, fontSize: '1.3rem', marginBottom: '1.4rem', paddingBottom: '.8rem', borderBottom: '1px solid rgba(201,168,76,.12)' }}>
                  Order Summary
                </h3>

                {/* Items */}
                <div style={{ marginBottom: '1.2rem' }}>
                  {cart.map(item => {
                    const img = Array.isArray(item.images) ? item.images[0] : null;
                    return (
                      <div key={item.key} style={{ display: 'flex', gap: '.9rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                        <div style={{ width: 52, height: 68, background: dark3, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: 'rgba(201,168,76,.3)' }}>
                          {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} /> : '🧴'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '.72rem', color: gold, marginBottom: '.1rem' }}>{item.brand_name}</div>
                          <div style={{ fontSize: '.83rem', marginBottom: '.2rem' }}>{item.name}</div>
                          <div style={{ fontSize: '.7rem', color: 'var(--gray)' }}>{item.sizeLabel} × {item.qty}</div>
                        </div>
                        <div style={{ fontSize: '.85rem', color: gold, fontWeight: 500, whiteSpace: 'nowrap' }}>${(item.price * item.qty).toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div style={{ borderTop: '1px solid rgba(201,168,76,.12)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.6rem', fontSize: '.83rem' }}>
                    <span style={{ color: 'var(--gray)' }}>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem', fontSize: '.83rem' }}>
                    <span style={{ color: 'var(--gray)' }}>Shipping</span>
                    <span style={{ color: shipping === 0 ? '#27ae60' : 'inherit' }}>{shipping === 0 ? 'Free 🎉' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  {shipping > 0 && <div style={{ fontSize: '.7rem', color: 'var(--gray)', marginBottom: '1rem', background: 'rgba(201,168,76,.05)', padding: '.5rem .7rem', borderLeft: '2px solid rgba(201,168,76,.3)' }}>
                    Spend ${(100 - cartTotal).toFixed(2)} more for free shipping
                  </div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 500, borderTop: '1px solid rgba(201,168,76,.15)', paddingTop: '1rem' }}>
                    <span>Total</span>
                    <span style={{ color: gold }}>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '1.5rem', padding: '1.1rem', fontSize: '.82rem' }}
                  onClick={placeOrder}
                  disabled={loading}
                >
                  {loading ? 'Placing Order…' : `Place Order — $${grandTotal.toFixed(2)}`}
                </button>
                <div style={{ textAlign: 'center', marginTop: '.8rem', fontSize: '.72rem', color: 'var(--gray)' }}>
                  🔒 Secure checkout · No hidden fees
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}