import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 100%,rgba(201,168,76,.08) 0%,transparent 65%),var(--black)' }}>
      <div style={{ background: 'var(--dark2)', border: '1px solid rgba(201,168,76,.18)', padding: '3rem', width: '100%', maxWidth: '420px', margin: '1.5rem', animation: 'fadeUp .5s ease' }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', fontWeight: 300, color: 'var(--gold)', textAlign: 'center', letterSpacing: '.35em', marginBottom: '.4rem' }}>AURUM</div>
        <div style={{ textAlign: 'center', color: 'var(--gray)', fontSize: '.78rem', letterSpacing: '.1em', marginBottom: '2.5rem' }}>Admin & Account Access</div>

        {error && <div className="msg-error">{error}</div>}
        <form onSubmit={handle}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button className="btn-primary" type="submit" style={{ width: '100%', padding: '1rem' }} disabled={loading}>
            {loading ? 'Signing In…' : 'Sign In'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '.78rem', color: 'var(--gray)' }}>
          No account? <Link to="/register" style={{ color: 'var(--gold)' }}>Register</Link>
          &nbsp;&nbsp;·&nbsp;&nbsp;
          <Link to="/" style={{ color: 'var(--gold)' }}>Back to Store</Link>
        </div>
      </div>
    </div>
  );
}
