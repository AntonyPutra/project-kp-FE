import React, { useState } from 'react';
import { FileText, Search, CheckCircle, XCircle, Clock, Eye, Download, ChevronRight, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

const STATUS_CONFIG = {
  submitted:    { label: 'Diajukan',        class: 'badge-info',    step: 1 },
  under_review: { label: 'Sedang Ditinjau', class: 'badge-warning', step: 2 },
  approved:     { label: 'Disetujui',       class: 'badge-success', step: 3 },
  rejected:     { label: 'Ditolak',         class: 'badge-danger',  step: 0 },
};

const LETTER_TYPES = {
  domisili:     'Surat Domisili',
  usaha:        'Surat Keterangan Usaha',
  keterangan:   'Surat Keterangan Umum',
  tidak_mampu:  'Surat Tidak Mampu',
};

const STEPS = ['Diajukan', 'Ditinjau', 'Selesai'];

export default function LetterManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  // Fetch letters (Admin sees all letters)
  const { data: letters = [], isLoading } = useQuery({
    queryKey: ['letters', 'admin'],
    queryFn: async () => {
      const res = await api.get('/letters');
      return res.data;
    }
  });

  // Mutation to update status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await api.put(`/letters/${id}/status`, { status });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['letters']);
      toast.success(variables.status === 'rejected' ? 'Pengajuan ditolak.' : 'Pengajuan disetujui/diteruskan.');
      setSelected(null);
    },
    onError: () => {
      toast.error('Gagal memperbarui status.');
    }
  });

  const filtered = letters.filter(l => {
    const userName = l.user?.name || '';
    const matchSearch = userName.toLowerCase().includes(search.toLowerCase()) ||
                        l.tracking_code.toLowerCase().includes(search.toLowerCase()) ||
                        (LETTER_TYPES[l.type] || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const approve = (id, currentStatus) => {
    const nextStatus = currentStatus === 'submitted' ? 'under_review' : 'approved';
    updateStatusMutation.mutate({ id, status: nextStatus });
  };

  const reject = (id) => {
    updateStatusMutation.mutate({ id, status: 'rejected' });
  };

  const getStepIndex = (status) => {
    if (status === 'submitted') return 1;
    if (status === 'under_review') return 2;
    if (status === 'approved' || status === 'rejected') return 3;
    return 1;
  };

  if (isLoading) {
    return <div className="p-8 text-center"><Loader className="animate-spin inline mr-2"/> Memuat Data Surat...</div>;
  }

  return (
    <div className="page-content">
      <div>
        <h1 className="page-title">Layanan Surat</h1>
        <p className="page-subtitle">Kelola pengajuan dan persetujuan surat masyarakat</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <div key={k} className="card" style={{ padding: '1rem', textAlign: 'center', cursor: 'pointer' }}
            onClick={() => setStatusFilter(statusFilter === k ? 'all' : k)}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {letters.filter(l => l.status === k).length}
            </div>
            <div style={{ marginTop: '0.375rem' }}>
              <span className={`badge ${v.class}`} style={{ fontSize: '0.625rem' }}>{v.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="input-with-icon" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} className="input-icon" />
            <input className="input" placeholder="Cari nama pemohon, nomor tracking..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Semua Status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>No. Tracking</th>
              <th>Pemohon</th>
              <th>Jenis Surat</th>
              <th>Keperluan</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(letter => {
              const currentStep = getStepIndex(letter.status);
              return (
                <tr key={letter.id}>
                  <td><span className="code" style={{ fontSize: '0.75rem' }}>{letter.tracking_code}</span></td>
                  <td style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{letter.user?.name || 'Unknown'}</td>
                  <td style={{ fontSize: '0.8125rem' }}>{LETTER_TYPES[letter.type] || letter.type}</td>
                  <td style={{ fontSize: '0.8125rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{letter.purpose}</td>
                  <td><span className={`badge ${STATUS_CONFIG[letter.status]?.class || 'badge-muted'}`}>{STATUS_CONFIG[letter.status]?.label || letter.status}</span></td>
                  <td>
                    {/* Mini progress */}
                    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                      {STEPS.map((s, i) => (
                        <div key={i} style={{ width: 20, height: 4, borderRadius: 2, background: i < currentStep ? '#6366f1' : letter.status === 'rejected' ? (i === 0 ? '#ef4444' : 'var(--bg-muted)') : 'var(--bg-muted)', transition: 'background 0.3s' }} />
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(letter.created_at).toLocaleString('id-ID')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelected(letter)} title="Detail">
                        <Eye size={14} />
                      </button>
                      {(letter.status === 'submitted' || letter.status === 'under_review') && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => approve(letter.id, letter.status)} style={{ fontSize: '0.75rem' }} disabled={updateStatusMutation.isPending}>
                            <CheckCircle size={12} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => reject(letter.id)} style={{ fontSize: '0.75rem' }} disabled={updateStatusMutation.isPending}>
                            <XCircle size={12} />
                          </button>
                        </>
                      )}
                      {letter.status === 'approved' ? (
                        <button className="btn btn-ghost btn-sm" style={{ color: '#06b6d4' }}>
                          <Download size={14} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan="8" className="text-center p-4">Tidak ada pengajuan ditemukan.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Detail Pengajuan Surat</h3>
                <span className="code" style={{ fontSize: '0.75rem' }}>{selected.tracking_code}</span>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost" style={{ padding: 4 }}><XCircle size={18} /></button>
            </div>
            <div className="modal-body">
              {/* Timeline */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '16px', left: 0, right: 0, height: 2, background: 'var(--border)', zIndex: 0 }} />
                {STEPS.map((step, i) => {
                  const currentStep = getStepIndex(selected.status);
                  const done = i < currentStep && selected.status !== 'rejected';
                  const current = i === currentStep - 1 && selected.status !== 'rejected';
                  return (
                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', zIndex: 1 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: done ? '#6366f1' : current ? 'rgba(99,102,241,0.3)' : 'var(--bg-muted)',
                        border: `2px solid ${done || current ? '#6366f1' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {done ? <CheckCircle size={14} color="white" /> : <span style={{ fontSize: '0.75rem', color: done || current ? '#818cf8' : 'var(--text-muted)' }}>{i + 1}</span>}
                      </div>
                      <span style={{ fontSize: '0.625rem', color: done || current ? 'var(--primary-400)' : 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap' }}>{step}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                {[
                  { label: 'Pemohon', value: selected.user?.name },
                  { label: 'Jenis Surat', value: LETTER_TYPES[selected.type] || selected.type },
                  { label: 'Keperluan', value: selected.purpose },
                  { label: 'Status', value: STATUS_CONFIG[selected.status]?.label || selected.status },
                  { label: 'Tanggal Pengajuan', value: new Date(selected.created_at).toLocaleString('id-ID') },
                  { label: 'No. Tracking', value: selected.tracking_code },
                  { label: 'Catatan', value: selected.notes || '-' },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>{f.label}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              {(selected.status === 'submitted' || selected.status === 'under_review') && (
                <>
                  <button className="btn btn-danger" onClick={() => reject(selected.id)} disabled={updateStatusMutation.isPending}>
                    <XCircle size={14} /> Tolak
                  </button>
                  <button className="btn btn-success" onClick={() => approve(selected.id, selected.status)} disabled={updateStatusMutation.isPending}>
                    <CheckCircle size={14} /> Setujui & Teruskan
                  </button>
                </>
              )}
              {selected.status === 'approved' && (
                <button className="btn btn-primary">
                  <Download size={14} /> Download Surat
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
