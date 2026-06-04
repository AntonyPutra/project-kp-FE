import React, { useState } from 'react';
import { Heart, CheckCircle, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const PROGRAMS = [
  { id: 1, code: 'BANSOS-2026-001', name: 'BLT Dana Desa 2026', type: 'tunai', amount: 600000, quota: 200, registered: 145, period: 'Jun – Agt 2026', open: true },
  { id: 3, code: 'BANSOS-2026-003', name: 'Beasiswa Pendidikan 2026', type: 'pendidikan', amount: 1500000, quota: 50, registered: 30, period: 'Jan – Des 2026', open: true },
];

const MY_APPS = [
  { id: 1, name: 'BLT Dana Desa 2026', status: 'pending', date: '2026-06-01' },
];

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

export default function UserSocialAid() {
  const [apps, setApps] = useState(MY_APPS);
  const [applying, setApplying] = useState(null);
  const [form, setForm] = useState({ income: '', dependents: '', occupation: '', reason: '' });

  const submitApp = () => {
    if (!form.reason) { toast.error('Alasan pendaftaran wajib diisi.'); return; }
    setApps(prev => [...prev, { id: Date.now(), name: applying.name, status: 'pending', date: new Date().toLocaleDateString('id-ID') }]);
    toast.success(`Berhasil mendaftar program ${applying.name}!`);
    setApplying(null);
    setForm({ income: '', dependents: '', occupation: '', reason: '' });
  };

  return (
    <div className="page-content">
      <div>
        <h1 className="page-title">Bantuan Sosial</h1>
        <p className="page-subtitle">Lihat program bantuan tersedia dan status pendaftaran Anda</p>
      </div>

      {/* My applications */}
      {apps.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.875rem' }}>📋 Pendaftaran Saya</h3>
          {apps.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{a.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Didaftar: {a.date}</div>
              </div>
              <span className={`badge ${a.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
                {a.status === 'pending' ? 'Menunggu' : 'Disetujui'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Available programs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {PROGRAMS.map(p => {
          const alreadyApplied = apps.some(a => a.name === p.name);
          return (
            <div key={p.id} className="card" style={{ borderColor: p.open ? 'rgba(16,185,129,0.2)' : 'var(--border)' }}>
              <div style={{ display: 'flex', justify: 'space-between', marginBottom: '0.875rem' }}>
                <span className="code" style={{ fontSize: '0.6875rem' }}>{p.code}</span>
                {p.open && <span className="badge badge-success">Terbuka</span>}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{p.name}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nilai</div>
                  <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.9375rem' }}>{formatCurrency(p.amount)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Periode</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{p.period}</div>
                </div>
              </div>
              {/* Quota bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                  <span>Sisa Kuota</span>
                  <span style={{ fontWeight: 700 }}>{p.quota - p.registered} / {p.quota}</span>
                </div>
                <div style={{ height: 5, background: 'var(--bg-muted)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(p.registered / p.quota) * 100}%`, background: '#10b981', borderRadius: 'var(--radius-full)' }} />
                </div>
              </div>
              <button
                className={`btn ${alreadyApplied ? 'btn-secondary' : 'btn-success'}`}
                style={{ width: '100%', marginTop: '1rem', fontSize: '0.875rem' }}
                disabled={alreadyApplied || !p.open}
                onClick={() => { setApplying(p); setForm({ income: '', dependents: '', occupation: '', reason: '' }); }}
              >
                {alreadyApplied ? <><CheckCircle size={14} /> Sudah Mendaftar</> : <><Send size={14} /> Daftar Sekarang</>}
              </button>
            </div>
          );
        })}
      </div>

      {/* Application Modal */}
      {applying && (
        <div className="modal-overlay" onClick={() => setApplying(null)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Daftar: {applying.name}</h3>
              <button onClick={() => setApplying(null)} className="btn-ghost" style={{ padding: 4 }}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div className="input-group">
                  <label className="input-label">Penghasilan/bulan (Rp)</label>
                  <input className="input" type="number" placeholder="0" value={form.income} onChange={e => setForm(p => ({ ...p, income: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Jumlah Tanggungan</label>
                  <input className="input" type="number" placeholder="0" value={form.dependents} onChange={e => setForm(p => ({ ...p, dependents: e.target.value }))} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Pekerjaan</label>
                <input className="input" placeholder="Pekerjaan saat ini" value={form.occupation} onChange={e => setForm(p => ({ ...p, occupation: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Alasan Pendaftaran *</label>
                <textarea className="input" rows={3} placeholder="Jelaskan mengapa Anda membutuhkan bantuan ini..." value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setApplying(null)}>Batal</button>
              <button className="btn btn-success" onClick={submitApp}>
                <Send size={14} /> Kirim Pendaftaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
