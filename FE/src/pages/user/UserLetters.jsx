import React, { useState } from 'react';
import { FileText, Plus, Clock, CheckCircle, XCircle, Download, Search, Loader, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

const LETTER_TYPES = [
  { value: 'domisili',    label: 'Surat Domisili',           desc: 'Keterangan tempat tinggal' },
  { value: 'usaha',       label: 'Surat Keterangan Usaha',   desc: 'Keterangan usaha/bisnis' },
  { value: 'keterangan',  label: 'Surat Keterangan Umum',    desc: 'Keterangan keperluan umum' },
  { value: 'tidak_mampu', label: 'Surat Tidak Mampu',        desc: 'Keterangan ekonomi lemah' },
];

const STATUS_CFG = {
  submitted:    { label: 'Diajukan',     class: 'badge-info',    icon: Clock,       color: '#3b82f6' },
  under_review: { label: 'Ditinjau',     class: 'badge-warning', icon: Clock,       color: '#f59e0b' },
  approved:     { label: 'Disetujui',    class: 'badge-success', icon: CheckCircle, color: '#10b981' },
  rejected:     { label: 'Ditolak',      class: 'badge-danger',  icon: XCircle,     color: '#ef4444' },
};

const STEPS = ['Diajukan', 'Ditinjau', 'Selesai'];

export default function UserLetters() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: '', purpose: '', notes: '' });
  const [file, setFile] = useState(null);
  const [tracking, setTracking] = useState('');

  // Fetch user's letters
  const { data: letters = [], isLoading } = useQuery({
    queryKey: ['letters'],
    queryFn: async () => {
      const res = await api.get('/letters');
      return res.data.data;
    }
  });

  // Create Letter Mutation
  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post('/letters', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['letters']);
      toast.success(`Pengajuan berhasil! Nomor tracking: ${data.data.tracking_code}`);
      setShowForm(false);
      setForm({ type: '', purpose: '', notes: '' });
      setFile(null);
    },
  });

  const submit = () => {
    if (!form.type || !form.purpose) { 
      toast.error('Jenis surat dan keperluan wajib diisi.'); 
      return; 
    }

    const formData = new FormData();
    formData.append('type', form.type);
    formData.append('purpose', form.purpose);
    if (form.notes) formData.append('notes', form.notes);
    if (file) formData.append('attachment', file);

    createMutation.mutate(formData);
  };

  const getStepIndex = (status) => {
    if (status === 'submitted') return 1;
    if (status === 'under_review') return 2;
    if (status === 'approved' || status === 'rejected') return 3;
    return 1;
  };

  const filteredLetters = letters.filter(l => l.tracking_code.toLowerCase().includes(tracking.toLowerCase()));

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Layanan Surat</h1>
          <p className="page-subtitle">Ajukan dan pantau status surat secara online</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> {showForm ? 'Tutup Form' : 'Ajukan Surat Baru'}
        </button>
      </div>

      {/* Application Form */}
      {showForm && (
        <div className="card" style={{ border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.04)', animation: 'fadeIn 0.3s ease' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>📝 Form Pengajuan Surat</h3>
          
          {/* Letter type selection */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="input-label" style={{ display: 'block', marginBottom: '0.75rem' }}>Jenis Surat</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {LETTER_TYPES.map(lt => (
                <div
                  key={lt.value}
                  onClick={() => setForm(p => ({ ...p, type: lt.value }))}
                  style={{
                    padding: '0.875rem',
                    background: form.type === lt.value ? 'rgba(99,102,241,0.15)' : 'var(--bg-muted)',
                    border: `2px solid ${form.type === lt.value ? 'var(--primary-500)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: form.type === lt.value ? 'var(--primary-400)' : 'var(--text-primary)' }}>{lt.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{lt.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label className="input-label">Keperluan Surat</label>
            <input className="input" placeholder="Contoh: Pendaftaran BPJS, Melamar Pekerjaan, dll." value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} />
          </div>

          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label className="input-label">Lampiran / Berkas Pendukung (Opsional, Maks 3MB)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                <UploadCloud size={16} /> Pilih File
                <input type="file" style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files[0])} />
              </label>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {file ? file.name : 'Tidak ada file terpilih'}
              </span>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '1.25rem' }}>
            <label className="input-label">Catatan Tambahan (opsional)</label>
            <textarea className="input" rows={3} placeholder="Informasi tambahan yang perlu diketahui petugas..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={createMutation.isPending}>Batal</button>
            <button className="btn btn-primary" onClick={submit} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader size={14} className="animate-spin" /> : <FileText size={14} />}
              Submit Pengajuan
            </button>
          </div>
        </div>
      )}

      {/* Tracking */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="input-with-icon" style={{ flex: 1 }}>
            <Search size={16} className="input-icon" />
            <input className="input" placeholder="Masukkan nomor tracking (SURAT-XXXX)..." value={tracking} onChange={e => setTracking(e.target.value)} />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-8"><Loader className="animate-spin inline mr-2" /> Memuat data surat...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filteredLetters.map((letter, i) => {
            const typeLabel = LETTER_TYPES.find(t => t.value === letter.type)?.label || letter.type;
            const st = STATUS_CFG[letter.status] || STATUS_CFG['submitted'];
            const currentStep = getStepIndex(letter.status);

            return (
              <div key={letter.id} className="card" style={{ animation: `fadeIn 0.3s ${i * 60}ms ease both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '10px', background: st.color + '20', border: `1px solid ${st.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <st.icon size={18} color={st.color} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{typeLabel}</div>
                        <span className="code" style={{ fontSize: '0.6875rem' }}>{letter.tracking_code}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>Keperluan: {letter.purpose}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>Diajukan: {new Date(letter.created_at).toLocaleString('id-ID')}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                    <span className={`badge ${st.class}`}>{st.label}</span>
                    {letter.status === 'approved' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => toast.success('Fitur download PDF segera hadir.')}>
                        <Download size={14} /> Unduh Surat
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {STEPS.map((step, idx) => {
                      const done = idx < currentStep;
                      const current = idx === currentStep - 1;
                      return (
                        <React.Fragment key={step}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: done ? '#6366f1' : current ? 'rgba(99,102,241,0.3)' : 'var(--bg-muted)',
                              border: `2px solid ${done || current ? '#6366f1' : 'var(--border)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.3s ease',
                            }}>
                              {done ? <CheckCircle size={12} color="white" /> : <span style={{ fontSize: '0.6875rem', color: done || current ? '#818cf8' : 'var(--text-disabled)' }}>{idx + 1}</span>}
                            </div>
                            <span style={{ fontSize: '0.5875rem', color: done || current ? 'var(--primary-400)' : 'var(--text-disabled)', textAlign: 'center', whiteSpace: 'nowrap' }}>{step}</span>
                          </div>
                          {idx < STEPS.length - 1 && (
                            <div style={{ flex: 1, height: 2, background: idx < currentStep - 1 ? '#6366f1' : 'var(--border)', margin: '0 4px', marginBottom: '14px', transition: 'background 0.3s ease' }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          {!isLoading && filteredLetters.length === 0 && (
            <div className="text-center p-8 text-gray-400">Tidak ada pengajuan surat yang ditemukan.</div>
          )}
        </div>
      )}
    </div>
  );
}
