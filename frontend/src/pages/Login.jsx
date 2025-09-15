import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedLogo from '../components/AnimatedLogo';
import Header from '../components/Header';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        setSuccess(true);
        setTimeout(() => {
          navigate('/main');
        }, 800); // Show success for a moment, then redirect
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur de connexion.');
      }
    } catch (err) {
      setError('Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div style={{ minHeight: '100vh', background: '#100D14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '10vh' }}>
        <div style={{ width: 600, display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '36px' }}>
          <span style={{
            color: '#fff',
            fontWeight: 900,
            fontFamily: "'Montserrat', 'Tahoma', sans-serif",
            textTransform: 'uppercase',
            fontSize: '3.2rem',
            lineHeight: 0.9,
            letterSpacing: '-2px',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'geometricPrecision',
            WebkitTextStroke: '0.5px #fff',
            margin: 0,
            marginTop: '28px',
            padding: 0,
            width: '100%',
            maxWidth: '100%',
            display: 'block',
            textAlign: 'center',
          }}>CONNECTE-TOI</span>
        </div>
        {error && <div style={{ color: '#ff3e3e', marginBottom: 16, fontWeight: 600 }}>{error}</div>}
        {success ? (
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', marginTop: 48 }}>Connexion réussie !</div>
        ) : (
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: 340,
          color: '#fff',
          fontFamily: "'Montserrat', 'Tahoma', sans-serif",
          marginTop: '64px',
        }}>
          <div style={{ width: 600, maxWidth: '98vw', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <label htmlFor="login-email" style={{ marginBottom: 5, fontWeight: 500, fontSize: '0.98rem', color: '#bdbdbd', letterSpacing: '0.1px', textAlign: 'left' }}>Email</label>
            <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{
              padding: '16px', borderRadius: 8, border: 'none', marginBottom: 22, fontSize: '1.13rem', outline: 'none', background: '#353542', color: '#fff', fontWeight: 500, width: '100%', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '0.5px', boxShadow: '0 1px 4px 0 rgba(0,0,0,0.10)'}} />
            <label htmlFor="login-password" style={{ marginBottom: 5, fontWeight: 500, fontSize: '0.98rem', color: '#bdbdbd', letterSpacing: '0.1px', textAlign: 'left' }}>Mot de passe</label>
            <input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{
              padding: '16px', borderRadius: 8, border: 'none', marginBottom: 6, fontSize: '1.13rem', outline: 'none', background: '#353542', color: '#fff', fontWeight: 500, width: '100%', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '0.5px', boxShadow: '0 1px 4px 0 rgba(0,0,0,0.10)'}} />
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button type="button" style={{
                background: 'none',
                border: 'none',
                color: '#bdbdbd',
                fontSize: '0.98rem',
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
                margin: 0,
                outline: 'none',
                transition: 'color 0.18s',
              }}
              onClick={() => alert('Fonctionnalité à venir !')}
              >mot de passe oublié ?</button>
            </div>
            <button type="submit" disabled={loading} style={{
              background: 'linear-gradient(180deg, #ff9100 70%, #ff6d00 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '13px 0',
              fontWeight: 700,
              fontSize: '1.13rem',
              cursor: 'pointer',
              width: '100%',
              transition: 'background 0.2s',
              letterSpacing: '0.5px',
              marginTop: 6,
              opacity: loading ? 0.7 : 1,
            }}>{loading ? '...' : 'Se connecter'}</button>
          </div>
        </form>
        )}
      </div>
    </>
  );
} 