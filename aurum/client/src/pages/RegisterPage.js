import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% 100%,rgba(201,168,76,.08) 0%,transparent 65%),var(--black)' }}>
      <div style={{ background: 'var(--dark2)', border: '1px solid rgba(201,168,76,.18)', padding: '3rem', width: '100%', maxWidth: '420px', margin: '1.5rem', animation: 'fadeUp .5s ease' }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '2rem', fontWeight: 300, color: 'var(--gold)', textAlign: 'center', letterSpacing: '.35em', marginBottom: '.4rem' }}>AURUM</div>
        <div style={{ textAlign: 'center', color: 'var(--gray)', fontSize: '.78rem', letterSpacing: '.1em', marginBottom: '2.5rem' }}>Create Your Account</div>

        {error && <div className="msg-error">{error}</div>}
        <form onSubmit={handle}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" placeholder="Your Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
          </div>
          <button className="btn-primary" type="submit" style={{ width: '100%', padding: '1rem' }} disabled={loading}>
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '.78rem', color: 'var(--gray)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--gold)' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
