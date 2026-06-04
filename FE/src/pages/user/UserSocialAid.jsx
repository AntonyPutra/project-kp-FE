import React, { useState } from 'react';
import { Heart, CheckCircle, Clock, Send, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

function formatCurrency(val) {
  if (!val) return '—';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

export default function UserSocialAid() {
  const queryClient = useQueryClient();
  const [applying, setApplying] = useState(null);
  
  // Fetch Programs
  const { data: programs = [], isLoading: loadingPrograms } = useQuery({
    queryKey: ['social-aids'],
    queryFn: async () => {
      const res = await api.get('/social-aids');
      return res.data;
    }
  });

  // Fetch My Applications
  const { data: myApps = [], isLoading: loadingApps } = useQuery({
    queryKey: ['social-aid-applications', 'user'],
    queryFn: async () => {
      const res = await api.get('/social-aids/applications');
      return res.data;
    }
  });

  // Apply Mutation
  const applyMutation = useMutation({
    mutationFn: async (aidId) => {
      const res = await api.post(`/social-aids/${aidId}/apply`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['social-aid-applications']);
      toast.success(`Berhasil mendaftar program!`);
      setApplying(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal mendaftar program');
    }
  });

  const submitApp = () => {
    applyMutation.mutate(applying.id);
  };

  const isLoading = loadingPrograms || loadingApps;

  if (isLoading) {
    return <div className="p-8 text-center"><Loader className="animate-spin inline mr-2"/> Memuat Program Bantuan...</div>;
  }

  return (
    <div className="page-content">
      <div>
        <h1 className="page-title">Bantuan Sosial</h1>
        <p className="page-subtitle">Lihat program bantuan tersedia dan status pendaftaran Anda</p>
      </div>

      {/* My applications */}
      {myApps.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.875rem' }}>📋 Pendaftaran Saya</h3>
          {myApps.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{a.social_aid?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Didaftar: {new Date(a.created_at).toLocaleString('id-ID')}</div>
              </div>
              <span className={`badge ${a.status === 'pending' || a.status === 'under_review' ? 'badge-warning' : a.status === 'rejected' ? 'badge-danger' : 'badge-success'}`}>
                {a.status === 'pending' ? 'Menunggu' : a.status === 'under_review' ? 'Ditinjau' : a.status === 'rejected' ? 'Ditolak' : a.status === 'approved' ? 'Disetujui' : 'Tersalurkan'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Available programs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {programs.map(p => {
          const alreadyApplied = myApps.some(a => a.social_aid_id === p.id);
          const isOpen = new Date() <= new Date(p.deadline);

          return (
            <div key={p.id} className="card" style={{ borderColor: isOpen ? 'rgba(16,185,129,0.2)' : 'var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <span className="code" style={{ fontSize: '0.6875rem' }}>BANSOS-{p.id.substring(0,6)}</span>
                {isOpen ? <span className="badge badge-success">Terbuka</span> : <span className="badge badge-muted">Ditutup</span>}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{p.name}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nilai</div>
                  <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.9375rem' }}>{formatCurrency(p.amount)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Batas Daftar</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{new Date(p.deadline).toLocaleDateString('id-ID')}</div>
                </div>
              </div>
              
              <button
                className={`btn ${alreadyApplied ? 'btn-secondary' : 'btn-success'}`}
                style={{ width: '100%', marginTop: '1rem', fontSize: '0.875rem' }}
                disabled={alreadyApplied || !isOpen}
                onClick={() => setApplying(p)}
              >
                {alreadyApplied ? <><CheckCircle size={14} /> Sudah Mendaftar</> : <><Send size={14} /> Daftar Sekarang</>}
              </button>
            </div>
          );
        })}
        {programs.length === 0 && <div className="text-center p-8 w-full col-span-full">Tidak ada program bantuan sosial saat ini.</div>}
      </div>

      {/* Application Modal */}
      {applying && (
        <div className="modal-overlay" onClick={() => setApplying(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Daftar: {applying.name}</h3>
              <button onClick={() => setApplying(null)} className="btn-ghost" style={{ padding: 4 }}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', textAlign: 'center' }}>
              <Heart size={48} color="#10b981" style={{ margin: '0 auto' }} />
              <p style={{ color: 'var(--text-secondary)' }}>
                Apakah Anda yakin ingin mendaftar ke program <strong>{applying.name}</strong>?
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Pendaftaran akan dikirim untuk diverifikasi oleh admin kelurahan.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setApplying(null)} disabled={applyMutation.isPending}>Batal</button>
              <button className="btn btn-success" onClick={submitApp} disabled={applyMutation.isPending}>
                {applyMutation.isPending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />} 
                Konfirmasi Pendaftaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
