  import React from 'react';
import { FileText, Heart, Clock, CheckCircle, ArrowRight, Bell, Bot, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

const STATUS_STYLE = {
  submitted:    { label: 'Menunggu',     class: 'badge-warning', dot: 'pending' },
  under_review: { label: 'Ditinjau',     class: 'badge-info',    dot: 'pending' },
  approved:     { label: 'Disetujui',    class: 'badge-success', dot: 'online' },
  rejected:     { label: 'Ditolak',      class: 'badge-danger',  dot: 'offline' },
  pending:      { label: 'Menunggu',     class: 'badge-warning', dot: 'pending' },
  distributed:  { label: 'Tersalurkan', class: 'badge-cyan',    dot: 'online' },
};

export default function UserHome() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Fetch real data
  const { data: myLetters = [] } = useQuery({
    queryKey: ['letters', 'my'],
    queryFn: async () => {
      const res = await api.get('/letters');
      return res.data;
    }
  });

  const { data: myAids = [] } = useQuery({
    queryKey: ['social-aids', 'my-applications'],
    queryFn: async () => {
      const res = await api.get('/social-aids/applications');
      return res.data;
    }
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';

  return (
    <div className="page-content">
      {/* Welcome Banner */}
      <div style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.08) 100%)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 'var(--radius-xl)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(16,185,129,0.08)', borderRadius: '50%', filter: 'blur(30px)' }} />
        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: '0.875rem', color: '#34d399', fontWeight: 600, marginBottom: '0.375rem' }}>{greeting}, 👋</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Selamat datang di Portal Layanan Masyarakat SICAMS. Ada yang bisa kami bantu hari ini?
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <button className="btn btn-success" onClick={() => navigate('/user/letters')}>
              <FileText size={16} /> Ajukan Surat
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/user/aid')}>
              <Heart size={16} /> Lihat Bantuan
            </button>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Surat Diajukan', value: myLetters.length, icon: FileText, color: '#06b6d4' },
          { label: 'Surat Disetujui', value: myLetters.filter(l => l.status === 'approved').length, icon: CheckCircle, color: '#10b981' },
          { label: 'Bantuan Diajukan', value: myAids.length, icon: Heart, color: '#f59e0b' },
          { label: 'Menunggu', value: myLetters.filter(l => l.status === 'submitted').length + myAids.filter(a => a.status === 'pending').length, icon: Clock, color: '#6366f1' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '1.25rem', animation: `fadeIn 0.3s ${i * 80}ms ease both` }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', background: s.color + '20', border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem' }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* My Requests */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {/* Letters */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pengajuan Surat</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/user/letters')} style={{ color: 'var(--primary-400)', fontSize: '0.8125rem' }}>
              Lihat Semua <ArrowRight size={14} />
            </button>
          </div>
          {myLetters.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <FileText size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
              <p style={{ fontSize: '0.8125rem' }}>Belum ada pengajuan surat</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {myLetters.slice(0, 3).map(l => (
                <div key={l.id} style={{ padding: '0.75rem', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{l.type === 'domisili' ? 'Surat Domisili' : l.type}</div>
                      <span className="code" style={{ fontSize: '0.6875rem' }}>{l.tracking_code}</span>
                    </div>
                    <span className={`badge ${STATUS_STYLE[l.status]?.class}`} style={{ fontSize: '0.6875rem' }}>{STATUS_STYLE[l.status]?.label || l.status}</span>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', marginTop: '0.375rem' }}>{new Date(l.created_at).toLocaleDateString('id-ID')}</div>
                </div>
              ))}
            </div>
          )}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', fontSize: '0.875rem' }} onClick={() => navigate('/user/letters')}>
            <FileText size={14} /> Ajukan Surat Baru
          </button>
        </div>

        {/* Social Aid */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Bantuan Sosial</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/user/aid')} style={{ color: '#34d399', fontSize: '0.8125rem' }}>
              Lihat Semua <ArrowRight size={14} />
            </button>
          </div>
          {myAids.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Belum ada pendaftaran bantuan sosial
            </div>
          ) : (
            myAids.slice(0, 3).map(a => (
              <div key={a.id} style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 'var(--radius-md)', marginBottom: '0.625rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.social_aid?.name || 'Program Bantuan'}</div>
                  <span className={`badge ${STATUS_STYLE[a.status]?.class}`} style={{ fontSize: '0.6875rem' }}>{STATUS_STYLE[a.status]?.label || a.status}</span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>Didaftar: {new Date(a.created_at).toLocaleDateString('id-ID')}</div>
              </div>
            ))
          )}

          {/* Available programs */}
          <div style={{ marginTop: '0.75rem', padding: '0.875rem', background: 'rgba(16,185,129,0.05)', border: '1px dashed rgba(16,185,129,0.25)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#34d399', marginBottom: '0.375rem' }}>📢 Program Tersedia:</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>BLT Dana Desa 2026 — Rp 600.000</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>55 kuota tersisa · Deadline: 31 Agt 2026</div>
          </div>

          <button className="btn btn-success" style={{ width: '100%', marginTop: '1rem', fontSize: '0.875rem' }} onClick={() => navigate('/user/aid')}>
            <Heart size={14} /> Lihat Program Bantuan
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={16} color="#f59e0b" />
          Notifikasi Terbaru
        </h3>
        {[
          { id: 1, icon: '📄', msg: 'Pengajuan surat SURAT-2026-0101 sedang diproses petugas.', time: '5 menit lalu', unread: true },
          { id: 2, icon: '✅', msg: 'Surat Keterangan SURAT-2026-0088 telah disetujui dan siap diunduh.', time: '2 hari lalu', unread: false },
        ].map((n, i) => (
          <div key={n.id} 
            onClick={() => {
              if (n.msg.includes('Surat')) navigate('/user/letters');
              else if (n.msg.includes('Bantuan')) navigate('/user/aid');
            }}
            style={{ display: 'flex', gap: '0.875rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: n.unread ? 'rgba(99,102,241,0.05)' : 'transparent', marginBottom: '0.5rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = n.unread ? 'rgba(99,102,241,0.05)' : 'transparent'}
          >
            <span style={{ fontSize: '1.125rem' }}>{n.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.msg}</p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', marginTop: '0.25rem' }}>{n.time}</p>
            </div>
            {n.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-500)', flexShrink: 0, marginTop: 4 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
