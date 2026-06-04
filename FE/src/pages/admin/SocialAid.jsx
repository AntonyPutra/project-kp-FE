import React, { useState } from 'react';
import { Heart, CheckCircle, XCircle, Clock, Plus, Search, Eye, User, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

const AID_STATUS = {
  open:        { label: 'Terbuka',      class: 'badge-success' },
  closed:      { label: 'Ditutup',      class: 'badge-muted' },
  distributed: { label: 'Tersalurkan', class: 'badge-cyan' },
};

const APP_STATUS = {
  pending:       { label: 'Menunggu',      class: 'badge-muted' },
  under_review:  { label: 'Ditinjau',      class: 'badge-warning' },
  verified:      { label: 'Terverifikasi', class: 'badge-info' },
  approved:      { label: 'Disetujui',     class: 'badge-success' },
  rejected:      { label: 'Ditolak',       class: 'badge-danger' },
  distributed:   { label: 'Tersalurkan',   class: 'badge-cyan' },
};

function formatCurrency(val) {
  if (!val) return '—';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

export default function SocialAid() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('programs');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', quota: '', deadline: '', amount: '' });

  // Fetch Programs
  const { data: programs = [], isLoading: loadingPrograms } = useQuery({
    queryKey: ['social-aids'],
    queryFn: async () => {
      const res = await api.get('/social-aids');
      return res.data;
    }
  });

  // Fetch Applications
  const { data: applications = [], isLoading: loadingApps } = useQuery({
    queryKey: ['social-aid-applications'],
    queryFn: async () => {
      const res = await api.get('/social-aids/applications');
      return res.data;
    }
  });

  // Create Program
  const createProgramMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/social-aids', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['social-aids']);
      toast.success('Program Bantuan Sosial berhasil ditambahkan!');
      setShowModal(false);
      setForm({ name: '', quota: '', deadline: '', amount: '' });
    },
    onError: () => toast.error('Gagal menambahkan program')
  });

  // Update Application Status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await api.put(`/social-aids/applications/${id}/status`, { status });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['social-aid-applications']);
      const labels = { approved: 'disetujui', rejected: 'ditolak', distributed: 'tersalurkan' };
      toast.success(`Pengajuan berhasil ${labels[variables.status] || 'diperbarui'}.`);
    }
  });

  const filteredApps = applications.filter(a =>
    a.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.social_aid?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateProgram = () => {
    if (!form.name || !form.quota || !form.deadline) {
      toast.error('Mohon lengkapi semua kolom wajib.');
      return;
    }
    createProgramMutation.mutate({
      ...form,
      quota: parseInt(form.quota, 10),
      amount: form.amount ? parseFloat(form.amount) : null
    });
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Bantuan Sosial</h1>
          <p className="page-subtitle">Kelola program dan distribusi bantuan sosial masyarakat</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Tambah Program Baru
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Program', value: programs.length, color: '#6366f1' },
          { label: 'Total Pendaftar', value: applications.length, color: '#06b6d4' },
          { label: 'Disetujui', value: applications.filter(a => a.status === 'approved' || a.status === 'distributed').length, color: '#10b981' },
          { label: 'Menunggu', value: applications.filter(a => a.status === 'pending' || a.status === 'under_review').length, color: '#f59e0b' },
          { label: 'Ditolak', value: applications.filter(a => a.status === 'rejected').length, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {[{ key: 'programs', label: 'Program Bantuan' }, { key: 'applications', label: 'Pendaftaran' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '0.625rem 1.25rem', fontWeight: 600, fontSize: '0.875rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: tab === t.key ? 'var(--primary-400)' : 'var(--text-muted)',
            borderBottom: `2px solid ${tab === t.key ? 'var(--primary-500)' : 'transparent'}`,
            transition: 'all 0.15s ease', marginBottom: '-1px',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'programs' && (
        <>
          {loadingPrograms ? (
            <div className="p-8 text-center"><Loader className="animate-spin inline mr-2"/> Memuat Program...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {programs.map(p => {
                const registered = applications.filter(a => a.social_aid_id === p.id).length;
                const status = new Date() > new Date(p.deadline) ? 'closed' : 'open';

                return (
                  <div key={p.id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                      <span className="code" style={{ fontSize: '0.6875rem' }}>BANSOS-{p.id.substring(0,6)}</span>
                      <span className={`badge ${AID_STATUS[status].class}`}>{AID_STATUS[status].label}</span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{p.name}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.875rem' }}>
                      <div>
                        <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nilai Bantuan</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(p.amount)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Batas Pendaftaran</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{new Date(p.deadline).toLocaleDateString('id-ID')}</div>
                      </div>
                    </div>
                    {/* Progress */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                        <span>Kuota Terisi</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{registered} / {p.quota}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--bg-muted)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min((registered / p.quota) * 100, 100)}%`,
                          background: registered >= p.quota ? '#10b981' : '#6366f1',
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              {programs.length === 0 && <div className="text-center p-8 w-full col-span-full">Tidak ada program bantuan sosial.</div>}
            </div>
          )}
        </>
      )}

      {tab === 'applications' && (
        <>
          <div className="card" style={{ padding: '1rem' }}>
            <div className="input-with-icon">
              <Search size={16} className="input-icon" />
              <input className="input" placeholder="Cari nama pendaftar atau nama program..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          {loadingApps ? (
            <div className="p-8 text-center"><Loader className="animate-spin inline mr-2"/> Memuat Pendaftar...</div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Pendaftar</th>
                    <th>NIK</th>
                    <th>Program</th>
                    <th>Status</th>
                    <th>Tgl Daftar</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map(app => (
                    <tr key={app.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={14} color="#818cf8" />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{app.user?.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>{app.user?.nik || '-'}</td>
                      <td style={{ fontSize: '0.8125rem' }}>{app.social_aid?.name}</td>
                      <td><span className={`badge ${APP_STATUS[app.status]?.class || 'badge-muted'}`}>{APP_STATUS[app.status]?.label || app.status}</span></td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{new Date(app.created_at).toLocaleString('id-ID')}</td>
                      <td>
                        {(app.status === 'pending' || app.status === 'verified') && (
                          <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <button className="btn btn-success btn-sm" onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'approved' })} disabled={updateStatusMutation.isPending}>
                              <CheckCircle size={12} /> Setuju
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'rejected' })} disabled={updateStatusMutation.isPending}>
                              <XCircle size={12} /> Tolak
                            </button>
                          </div>
                        )}
                        {app.status === 'approved' && (
                          <button className="btn btn-primary btn-sm" onClick={() => updateStatusMutation.mutate({ id: app.id, status: 'distributed' })} disabled={updateStatusMutation.isPending}>
                            <Heart size={12} /> Salurkan
                          </button>
                        )}
                        {(app.status === 'distributed' || app.status === 'rejected') && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredApps.length === 0 && (
                    <tr><td colSpan="6" className="text-center p-4">Tidak ada pendaftar yang ditemukan.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Create Program Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tambah Program Bantuan Baru</h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost" style={{ padding: 4 }}><XCircle size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div className="input-group">
                <label className="input-label">Nama Program *</label>
                <input className="input" placeholder="Contoh: Bantuan Sembako" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div className="input-group">
                  <label className="input-label">Kuota *</label>
                  <input className="input" type="number" placeholder="0" value={form.quota} onChange={e => setForm(p => ({ ...p, quota: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Batas Pendaftaran *</label>
                  <input className="input" type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Nilai Bantuan (Rp) - Opsional</label>
                <input className="input" type="number" placeholder="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={createProgramMutation.isPending}>Batal</button>
              <button className="btn btn-primary" onClick={handleCreateProgram} disabled={createProgramMutation.isPending}>
                {createProgramMutation.isPending ? <Loader size={14} className="animate-spin" /> : <Plus size={14} />}
                Buat Program
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
