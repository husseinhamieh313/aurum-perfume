import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const gold = 'var(--gold)';
const dark2 = 'var(--dark2)';
const dark3 = 'var(--dark3)';

const STATUSES = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];

const STATUS_INFO = {
  Confirmed:  { icon: '✅', color: '#27ae60', label: 'Order Confirmed',   desc: 'Your order has been received and confirmed.' },
  Processing: { icon: '⚙️', color: '#f39c12', label: 'Processing',        desc: 'We\'re preparing your fragrances with care.' },
  Shipped:    { icon: '🚚', color: '#3498db', label: 'Shipped',            desc: 'Your order is on its way to you.' },
  Delivered:  { icon: '🎁', color: '#2ecc71', label: 'Delivered',          desc: 'Your order has been delivered. Enjoy!' },
  Cancelled:  { icon: '❌', color: '#e74c3c', label: 'Cancelled',          desc: 'This order has been cancelled.' },
};

export default function TrackOrderPage() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const track = async () => {
    const id = orderId.trim().toUpperCase();
    if (!id) { setErr('Please enter your order ID.'); return; }
    setLoading(true); setErr(''); setOrder(null);
    try {
      const { data } = await api.get(`/orders/track/${id}`);
      setOrder(data);
    } catch (e) {
      setErr(e.response?.data?.error || 'Order not found. Please check your order ID.');
    } finally { setLoading(false); }
  };

  const statusIdx = order ? STATUSES.indexOf(order.status) : -1;
  const isCancelled = order?.status === 'Cancelled';
  const items = order ? (Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]')) : [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,10,.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(201,168,76,.18)', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.9rem', fontWeight: 300, letterSpacing: '.35em', color: gold, cursor: 'pointer' }} onClick={() => navigate('/')}>AURUM</span>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--gray)', cursor: 'pointer', fontSize: '.78rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>← Back to Store</button>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '4rem 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '.64rem', letterSpacing: '.45em', textTransform: 'uppercase', color: gold, marginBottom: '1rem' }}>Real-Time Updates</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 300, marginBottom: '.8rem' }}>Track Your Order</h1>
          <p style={{ color: 'var(--gray)', fontSize: '.85rem' }}>Enter your order ID to see real-time status updates.</p>
        </div>

        {/* Search box */}
        <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.18)', padding: '2rem', marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '.65rem', color: 'var(--gray)', letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: '.5rem' }}>Order ID</label>
          <div style={{ display: 'flex', gap: '.8rem' }}>
            <input
              className="form-input"
              style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '.1em' }}
              placeholder="e.g. AUR-12345678"
              value={orderId}
              onChange={e => setOrderId(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && track()}
            />
            <button className="btn-primary" style={{ padding: '.88rem 1.8rem', whiteSpace: 'nowrap' }} onClick={track} disabled={loading}>
              {loading ? '…' : 'Track'}
            </button>
          </div>
          {err && <div className="msg-error" style={{ marginTop: '1rem', marginBottom: 0 }}>{err}</div>}
        </div>

        {/* Results */}
        {order && (
          <div style={{ animation: 'fadeUp .4s ease' }}>
            {/* Order header */}
            <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.2)', padding: '1.8rem', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.4rem' }}>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.5rem', color: gold, marginBottom: '.25rem' }}>{order.id}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--gray)' }}>Placed on {new Date(order.created).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.4rem', color: gold }}>${parseFloat(order.total).toFixed(2)}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--gray)', textTransform: 'capitalize' }}>{order.payment}</div>
                </div>
              </div>
              {order.address && (
                <div style={{ fontSize: '.78rem', color: 'var(--gray)', borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: '.9rem' }}>
                  📍 {order.address}
                </div>
              )}
            </div>

            {/* Status timeline */}
            {!isCancelled ? (
              <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', padding: '2rem', marginBottom: '1.2rem' }}>
                <div style={{ fontSize: '.68rem', color: gold, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: '1.8rem' }}>Order Progress</div>
                <div style={{ position: 'relative' }}>
                  {/* Progress line */}
                  <div style={{ position: 'absolute', top: 18, left: 18, right: 18, height: 2, background: 'rgba(255,255,255,.07)', zIndex: 0 }} />
                  <div style={{ position: 'absolute', top: 18, left: 18, height: 2, background: gold, zIndex: 1, width: statusIdx >= 0 ? `${Math.min((statusIdx / (STATUSES.length - 1)) * 100, 100) * (1 - 36 / 600)}%` : '0%', transition: 'width 1s ease', maxWidth: 'calc(100% - 36px)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                    {STATUSES.map((s, i) => {
                      const info = STATUS_INFO[s];
                      const done = i <= statusIdx;
                      const current = i === statusIdx;
                      return (
                        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.6rem', flex: 1 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: done ? gold : 'var(--dark3)', border: `2px solid ${done ? gold : 'rgba(201,168,76,.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.95rem', transition: 'all .5s', boxShadow: current ? `0 0 0 4px rgba(201,168,76,.2)` : 'none' }}>
                            {done ? (current ? info.icon : '✓') : <span style={{ fontSize: '.7rem', color: 'var(--gray)' }}>{i + 1}</span>}
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '.68rem', color: done ? gold : 'var(--gray)', fontWeight: done ? 500 : 300, letterSpacing: '.05em' }}>{info.label}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {statusIdx >= 0 && (
                  <div style={{ marginTop: '2rem', background: dark3, border: `1px solid ${STATUS_INFO[order.status]?.color}30`, padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '.8rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>{STATUS_INFO[order.status]?.icon}</span>
                    <div>
                      <div style={{ fontSize: '.82rem', color: STATUS_INFO[order.status]?.color, marginBottom: '.15rem' }}>{STATUS_INFO[order.status]?.label}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--gray)' }}>{STATUS_INFO[order.status]?.desc}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: 'rgba(192,57,43,.08)', border: '1px solid rgba(192,57,43,.3)', padding: '1.5rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>❌</span>
                <div>
                  <div style={{ color: '#e74c3c', fontSize: '.88rem', marginBottom: '.2rem' }}>Order Cancelled</div>
                  <div style={{ color: 'var(--gray)', fontSize: '.78rem' }}>This order has been cancelled. Contact us if you have questions.</div>
                </div>
              </div>
            )}

            {/* Items */}
            {items.length > 0 && (
              <div style={{ background: dark2, border: '1px solid rgba(201,168,76,.14)', padding: '1.8rem' }}>
                <div style={{ fontSize: '.68rem', color: gold, letterSpacing: '.15em', textTransform: 'uppercase', marginBottom: '1.2rem' }}>Items Ordered</div>
                {items.map((item, i) => {
                  const img = Array.isArray(item.images) ? item.images[0] : null;
                  return (
                    <div key={i} style={{ display: 'flex', gap: '1rem', padding: '.9rem 0', borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none', alignItems: 'center' }}>
                      <div style={{ width: 52, height: 68, background: dark3, flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: 'rgba(201,168,76,.3)' }}>
                        {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} /> : '🧴'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.72rem', color: gold, marginBottom: '.15rem' }}>{item.brand_name}</div>
                        <div style={{ fontSize: '.88rem', marginBottom: '.15rem' }}>{item.name}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--gray)' }}>{item.sizeLabel} × {item.qty}</div>
                      </div>
                      <div style={{ fontSize: '.9rem', color: gold, fontWeight: 500 }}>${(item.price * item.qty).toFixed(2)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Help text */}
        {!order && !loading && (
          <div style={{ textAlign: 'center', color: 'var(--gray)', fontSize: '.78rem', marginTop: '1.5rem' }}>
            Your order ID was sent in your confirmation. It looks like <span style={{ color: gold, fontFamily: 'monospace' }}>AUR-12345678</span>
          </div>
        )}
      </div>
    </div>
  );
}