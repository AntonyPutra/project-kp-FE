import React, { useState } from 'react';
import { FileText, Search, CheckCircle, XCircle, Clock, Eye, Download, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  submitted:    { label: 'Diajukan',        class: 'badge-info',    step: 1 },
  under_review: { label: 'Sedang Ditinjau', class: 'badge-warning', step: 2 },
  approved:     { label: 'Disetujui',       class: 'badge-success', step: 3 },
  rejected:     { label: 'Ditolak',         class: 'badge-danger',  step: 0 },
  completed:    { label: 'Selesai',         class: 'badge-cyan',    step: 4 },
};

const LETTER_TYPES = {
  domisili:     'Surat Domisili',
  usaha:        'Surat Keterangan Usaha',
  keterangan:   'Surat Keterangan',
  tidak_mampu:  'Surat Tidak Mampu',
};

const LETTERS = [
  { id: 1, tracking: 'SURAT-2026-0101', user: 'Budi Santoso',  type: 'domisili',    purpose: 'Keperluan BPJS Kesehatan', status: 'submitted',    step: 1, submitted: '2026-06-04 09:00' },
  { id: 2, tracking: 'SURAT-2026-0100', user: 'Siti Rahayu',   type: 'usaha',       purpose: 'Pembukaan Rekening Usaha', status: 'approved',     step: 3, submitted: '2026-06-03 14:00' },
  { id: 3, tracking: 'SURAT-2026-0099', user: 'Ahmad Fauzi',   type: 'keterangan',  purpose: 'Melamar Pekerjaan',        status: 'under_review', step: 2, submitted: '2026-06-03 10:30' },
  { id: 4, tracking: 'SURAT-2026-0098', user: 'Dewi Lestari',  type: 'domisili',    purpose: 'KPR Rumah',                status: 'completed',    step: 4, submitted: '2026-06-02 08:00' },
  { id: 5, tracking: 'SURAT-2026-0097', user: 'Rudi Hartono',  type: 'tidak_mampu', purpose: 'Beasiswa Pendidikan',      status: 'rejected',     step: 0, submitted: '2026-06-01 16:00' },
];

export default function LetterManagement() {
  const [letters, setLetters] = useState(LETTERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = letters.filter(l => {
    const matchSearch = l.user.toLowerCase().includes(search.toLowerCase()) ||
                        l.tracking.toLowerCase().includes(search.toLowerCase()) ||
                        LETTER_TYPES[l.type]?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const approve = (id) => {
    setLetters(prev => prev.map(l => l.id === id ? { ...l, status: l.status === 'submitted' ? 'under_review' : 'approved', step: l.step + 1 } : l));
    toast.success('Pengajuan surat disetujui dan diteruskan.');
    setSelected(null);
  };

  const reject = (id) => {
    setLetters(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected', step: 0 } : l));
    toast.error('Pengajuan surat ditolak.');
    setSelected(null);
  };

  const STEPS = ['Diajukan', 'Petugas', 'Admin', 'Pimpinan', 'Selesai'];

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
            <input className="input" placeholder="Cari nama, nomor tracking..." value={search} onChange={e => setSearch(e.target.value)} />
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
            {filtered.map(letter => (
              <tr key={letter.id}>
                <td><span className="code" style={{ fontSize: '0.75rem' }}>{letter.tracking}</span></td>
                <td style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{letter.user}</td>
                <td style={{ fontSize: '0.8125rem' }}>{LETTER_TYPES[letter.type]}</td>
                <td style={{ fontSize: '0.8125rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{letter.purpose}</td>
                <td><span className={`badge ${STATUS_CONFIG[letter.status].class}`}>{STATUS_CONFIG[letter.status].label}</span></td>
                <td>
                  {/* Mini progress */}
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                    {STEPS.map((s, i) => (
                      <div key={i} style={{ width: 20, height: 4, borderRadius: 2, background: i < letter.step ? '#6366f1' : letter.status === 'rejected' ? (i === 0 ? '#ef4444' : 'var(--bg-muted)') : 'var(--bg-muted)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{letter.submitted}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelected(letter)} title="Detail">
                      <Eye size={14} />
                    </button>
                    {(letter.status === 'submitted' || letter.status === 'under_review') && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => approve(letter.id)} style={{ fontSize: '0.75rem' }}>
                          <CheckCircle size={12} />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => reject(letter.id)} style={{ fontSize: '0.75rem' }}>
                          <XCircle size={12} />
                        </button>
                      </>
                    )}
                    {letter.status === 'approved' || letter.status === 'completed' ? (
                      <button className="btn btn-ghost btn-sm" style={{ color: '#06b6d4' }}>
                        <Download size={14} />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
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
                <span className="code" style={{ fontSize: '0.75rem' }}>{selected.tracking}</span>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost" style={{ padding: 4 }}><XCircle size={18} /></button>
            </div>
            <div className="modal-body">
              {/* Timeline */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '16px', left: 0, right: 0, height: 2, background: 'var(--border)', zIndex: 0 }} />
                {STEPS.map((step, i) => {
                  const done = i < selected.step && selected.status !== 'rejected';
                  const current = i === selected.step - 1 && selected.status !== 'rejected';
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
                  { label: 'Pemohon', value: selected.user },
                  { label: 'Jenis Surat', value: LETTER_TYPES[selected.type] },
                  { label: 'Keperluan', value: selected.purpose },
                  { label: 'Status', value: STATUS_CONFIG[selected.status].label },
                  { label: 'Tanggal Pengajuan', value: selected.submitted },
                  { label: 'No. Tracking', value: selected.tracking },
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
                  <button className="btn btn-danger" onClick={() => reject(selected.id)}>
                    <XCircle size={14} /> Tolak
                  </button>
                  <button className="btn btn-success" onClick={() => approve(selected.id)}>
                    <CheckCircle size={14} /> Setujui & Teruskan
                  </button>
                </>
              )}
              {(selected.status === 'approved' || selected.status === 'completed') && (
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
