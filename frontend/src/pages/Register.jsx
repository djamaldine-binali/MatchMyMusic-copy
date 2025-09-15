import React, { useState } from 'react';
import Header from '../components/Header';

export default function Register() {
  const [step, setStep] = useState('email'); // 'email', 'login', 'register', 'success'
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/users/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.exists) {
        setStep('login');
      } else {
        setStep('register');
      }
    } catch (err) {
      setError("Erreur lors de la vérification de l'email.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });
      if (res.ok) {
        setStep('success');
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur lors de l\'inscription.');
      }
    } catch (err) {
      setError("Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
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
        setStep('success');
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
            textAlign: 'left',
          }}>
            {step === 'email' && 'Entre ton adresse email'}
            {step === 'login' && 'Connecte-toi'}
            {step === 'register' && 'Crée ton compte'}
            {step === 'success' && 'Bienvenue !'}
          </span>
        </div>
        {error && <div style={{ color: '#ff3e3e', marginBottom: 16, fontWeight: 600 }}>{error}</div>}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} style={{ width: 600, maxWidth: '98vw', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <label htmlFor="register-email" style={{ marginBottom: 5, fontWeight: 500, fontSize: '0.98rem', color: '#bdbdbd', letterSpacing: '0.1px', textAlign: 'left' }}>Email</label>
            <input id="register-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{
              padding: '16px', borderRadius: 8, border: 'none', marginBottom: 22, fontSize: '1.13rem', outline: 'none', background: '#353542', color: '#fff', fontWeight: 500, width: '100%', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '0.5px', boxShadow: '0 1px 4px 0 rgba(0,0,0,0.10)'}} />
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
            }}>{loading ? '...' : 'Continuer'}</button>
          </form>
        )}
        {step === 'login' && (
          <form onSubmit={handleLogin} style={{ width: 600, maxWidth: '98vw', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <label htmlFor="login-password" style={{ marginBottom: 5, fontWeight: 500, fontSize: '0.98rem', color: '#bdbdbd', letterSpacing: '0.1px', textAlign: 'left' }}>Mot de passe</label>
            <input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{
              padding: '16px', borderRadius: 8, border: 'none', marginBottom: 22, fontSize: '1.13rem', outline: 'none', background: '#353542', color: '#fff', fontWeight: 500, width: '100%', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '0.5px', boxShadow: '0 1px 4px 0 rgba(0,0,0,0.10)'}} />
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
          </form>
        )}
        {step === 'register' && (
          <form onSubmit={handleRegister} style={{ width: 600, maxWidth: '98vw', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <label htmlFor="register-username" style={{ marginBottom: 5, fontWeight: 500, fontSize: '0.98rem', color: '#bdbdbd', letterSpacing: '0.1px', textAlign: 'left' }}>Nom d'utilisateur</label>
            <input id="register-username" type="text" value={username} onChange={e => setUsername(e.target.value)} required style={{
              padding: '16px', borderRadius: 8, border: 'none', marginBottom: 22, fontSize: '1.13rem', outline: 'none', background: '#353542', color: '#fff', fontWeight: 500, width: '100%', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '0.5px', boxShadow: '0 1px 4px 0 rgba(0,0,0,0.10)'}} />
            <label htmlFor="register-password" style={{ marginBottom: 5, fontWeight: 500, fontSize: '0.98rem', color: '#bdbdbd', letterSpacing: '0.1px', textAlign: 'left' }}>Mot de passe</label>
            <input id="register-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{
              padding: '16px', borderRadius: 8, border: 'none', marginBottom: 22, fontSize: '1.13rem', outline: 'none', background: '#353542', color: '#fff', fontWeight: 500, width: '100%', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '0.5px', boxShadow: '0 1px 4px 0 rgba(0,0,0,0.10)'}} />
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
            }}>{loading ? '...' : "S'inscrire"}</button>
          </form>
        )}
        {step === 'success' && (
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', marginTop: 48 }}>Inscription ou connexion réussie !</div>
        )}
      </div>
    </>
  );
} 