import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Lock, Mail, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

// Mock user accounts for demo
const DEMO_USERS = {
  'superadmin@sicams.id':   { password: 'Admin123!', role: 'super-admin', name: 'Super Admin',     avatar: 'SA' },
  'admin@sicams.id':        { password: 'Admin123!', role: 'admin',       name: 'Admin Kelurahan', avatar: 'AK' },
  'petugas@sicams.id':      { password: 'Admin123!', role: 'petugas',     name: 'Petugas Lapangan',avatar: 'PL' },
  'user@sicams.id':         { password: 'User123!',  role: 'masyarakat',  name: 'Budi Santoso',    avatar: 'BS' },
  'pimpinan@sicams.id':     { password: 'Admin123!', role: 'pimpinan',    name: 'Kepala Kelurahan',avatar: 'KK' },
};

const ROLE_LABELS = {
  'super-admin': { label: 'Super Admin', color: '#6366f1' },
  'admin':       { label: 'Admin', color: '#8b5cf6' },
  'petugas':     { label: 'Petugas', color: '#06b6d4' },
  'masyarakat':  { label: 'Masyarakat', color: '#10b981' },
  'pimpinan':    { label: 'Pimpinan', color: '#f59e0b' },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [step, setStep] = useState('login'); // 'login' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempUser, setTempUser] = useState(null);
  const [tempToken, setTempToken] = useState(null);
  const [otpTimer, setOtpTimer] = useState(60);
  const [particles, setParticles] = useState([]);
  const otpRefs = useRef([]);

  // Generate background particles
  useEffect(() => {
    const pts = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(pts);
  }, []);

  // OTP countdown
  useEffect(() => {
    if (step !== 'otp') return;
    const t = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [step]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      setTempUser(res.data.user);
      setTempToken(res.data.access_token);
      setLoading(false);
      toast.success('Kredensial valid! Verifikasi OTP dikirim ke email.');
      setStep('otp');
      setOtpTimer(60);
    } catch (err) {
      setError('Email atau password salah. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Masukkan 6 digit OTP.'); return; }
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 1000));

    // Demo: accept any 6 digits or "123456"
    if (code === '123456' || code.length === 6) {
      login(tempUser, tempToken);
      toast.success(`Selamat datang, ${tempUser.name}!`);
      const roleMap = {
        'super_admin': '/admin/dashboard',
        'admin': '/admin/dashboard',
        'masyarakat': '/user/dashboard',
        'pimpinan': '/pimpinan/dashboard',
      };
      navigate(roleMap[tempUser.role] || '/');
    } else {
      setError('Kode OTP tidak valid.');
    }
    setLoading(false);
  };

  const handleQuickLogin = (email, info) => {
    setEmail(email);
    setPassword(info.password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'stretch',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: '50%',
          background: 'rgba(99,102,241,0.4)',
          animation: `float ${p.duration}s ${p.delay}s ease-in-out infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Glow blobs */}
      <div style={{ position:'absolute', width:400, height:400, background:'rgba(99,102,241,0.08)', borderRadius:'50%', filter:'blur(80px)', top:'-100px', left:'-100px', animation:'blob 20s infinite' }} />
      <div style={{ position:'absolute', width:300, height:300, background:'rgba(139,92,246,0.08)', borderRadius:'50%', filter:'blur(60px)', bottom:'-50px', right:'20%', animation:'blob 15s 5s infinite' }} />
      <div style={{ position:'absolute', width:200, height:200, background:'rgba(6,182,212,0.06)', borderRadius:'50%', filter:'blur(50px)', top:'40%', right:'-50px', animation:'blob 18s 2s infinite' }} />

      {/* Left Branding Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 50%, rgba(6,182,212,0.03) 100%)',
        borderRight: '1px solid var(--border)',
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{
          width: 72, height: 72,
          background: 'var(--gradient-primary)',
          borderRadius: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)',
          marginBottom: '1.5rem',
          animation: 'float 4s ease-in-out infinite',
        }}>
          <Shield size={36} color="white" />
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', textAlign: 'center', lineHeight: 1.2 }}>
          <span className="text-gradient">SICAMS</span>
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 300, marginTop: '0.5rem', lineHeight: 1.6 }}>
          Smart Integrated Community & Asset Management System
        </p>

        {/* Feature pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '3rem', width: '100%', maxWidth: 320 }}>
          {[
            { icon: '⛓️', label: 'Blockchain Audit Trail', desc: 'Immutable SHA-256 record' },
            { icon: '🤖', label: 'AI Assistant', desc: 'Smart search & chatbot' },
            { icon: '🔐', label: 'Multi-Layer Security', desc: 'JWT + MFA + RBAC' },
            { icon: '📊', label: 'Real-time Analytics', desc: 'Dashboard & reports' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.875rem',
              padding: '0.875rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              animation: `fadeIn 0.5s ${i * 0.1}s ease both`,
            }}>
              <span style={{ fontSize: '1.25rem' }}>{f.icon}</span>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{f.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Demo accounts */}
        <div style={{ marginTop: '2.5rem', width: '100%', maxWidth: 320 }}>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.75rem' }}>Demo Accounts</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {Object.entries(DEMO_USERS).map(([em, info]) => (
              <button
                key={em}
                onClick={() => handleQuickLogin(em, info)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  width: '100%',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '8px',
                  background: ROLE_LABELS[info.role].color + '33',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.625rem', fontWeight: 700,
                  color: ROLE_LABELS[info.role].color,
                  flexShrink: 0,
                }}>
                  {info.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.name}</div>
                  <div style={{ fontSize: '0.6875rem', color: ROLE_LABELS[info.role].color }}>{ROLE_LABELS[info.role].label}</div>
                </div>
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', marginTop: '0.5rem', textAlign:'center' }}>Klik akun → OTP: <strong style={{color:'var(--cyan-400)'}}>123456</strong></p>
        </div>
      </div>

      {/* Right Login Form */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '3rem 2.5rem',
        position: 'relative',
      }}>
        {step === 'login' ? (
          <div style={{ width: '100%', animation: 'slideInRight 0.4s ease' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>Selamat Datang</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem', fontSize: '0.9375rem' }}>Masuk ke akun SICAMS Anda</p>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.875rem 1rem',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                color: '#f87171', fontSize: '0.875rem',
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group">
                <label className="input-label">Email</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    className="input"
                    type="email"
                    placeholder="nama@sicams.id"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="input-with-icon" style={{ position: 'relative' }}>
                  <Lock size={16} className="input-icon" />
                  <input
                    className="input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: '0.875rem', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--text-muted)',
                      cursor: 'pointer', background: 'none', border: 'none',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" style={{ fontSize: '0.8125rem', color: 'var(--primary-400)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Lupa Password?
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ width: '100%', marginTop: '0.25rem' }}
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Masuk ke Sistem
                  </>
                )}
              </button>
            </form>

            {/* Security badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
              {['JWT Auth', 'MFA Ready', 'AES-256'].map(b => (
                <div key={b} style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  fontSize: '0.6875rem', color: 'var(--text-muted)',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                  {b}
                </div>
              ))}
            </div>
          </div>
        ) : (
          // OTP Step
          <div style={{ width: '100%', animation: 'slideInRight 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: 64, height: 64,
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
                <Shield size={28} color="#818cf8" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Verifikasi OTP</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Kode OTP telah dikirim ke<br />
                <strong style={{ color: 'var(--primary-400)' }}>{email}</strong>
              </p>
              {tempUser && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.375rem 0.875rem',
                  background: ROLE_LABELS[tempUser.role].color + '22',
                  border: `1px solid ${ROLE_LABELS[tempUser.role].color}44`,
                  borderRadius: 'var(--radius-full)',
                  marginTop: '0.75rem',
                  fontSize: '0.8125rem', color: ROLE_LABELS[tempUser.role].color, fontWeight: 600,
                }}>
                  <CheckCircle size={14} />
                  {ROLE_LABELS[tempUser.role].label} — {tempUser.name}
                </div>
              )}
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.875rem', background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem', color: '#f87171', fontSize: '0.875rem',
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleOtpVerify}>
              {/* OTP Input boxes */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => handleOtpKeyDown(e, i)}
                    style={{
                      width: 52, height: 60,
                      textAlign: 'center',
                      fontSize: '1.5rem', fontWeight: 700,
                      background: digit ? 'rgba(99,102,241,0.15)' : 'var(--bg-input)',
                      border: `2px solid ${digit ? 'var(--primary-500)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading || otp.join('').length < 6}
                style={{ width: '100%' }}
              >
                {loading ? (
                  <><Loader size={16} className="animate-spin" /> Memverifikasi...</>
                ) : (
                  <><CheckCircle size={16} /> Verifikasi OTP</>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              {otpTimer > 0 ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Kirim ulang dalam <span style={{ color: 'var(--primary-400)', fontWeight: 600 }}>{otpTimer}s</span>
                </p>
              ) : (
                <button
                  onClick={() => { setOtpTimer(60); toast.success('OTP baru telah dikirim!'); }}
                  style={{ fontSize: '0.875rem', color: 'var(--primary-400)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Kirim Ulang OTP
                </button>
              )}
              <button
                onClick={() => { setStep('login'); setError(''); setOtp(['','','','','','']); }}
                style={{ display: 'block', margin: '0.75rem auto 0', fontSize: '0.875rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ← Kembali ke Login
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '1.5rem', fontSize: '0.75rem', color: 'var(--text-disabled)', textAlign: 'center' }}>
          © 2026 SICAMS · v1.0.0 · Magang Teknik Informatika
        </div>
      </div>
    </div>
  );
}
