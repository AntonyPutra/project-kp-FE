import React, { useState } from 'react';
import { Package, Plus, Search, QrCode, Edit2, Trash2, CheckCircle, XCircle, ArrowRightLeft, MapPin, Tag, Loader } from 'lucide-react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

const CONDITION_CONFIG = {
  excellent: { label: 'Sangat Baik', class: 'badge-success', color: '#10b981' },
  good:      { label: 'Baik',        class: 'badge-success', color: '#34d399' },
  fair:      { label: 'Cukup',       class: 'badge-warning', color: '#f59e0b' },
  poor:      { label: 'Buruk',       class: 'badge-danger',  color: '#ef4444' },
};

const STATUS_CONFIG = {
  available:   { label: 'Tersedia',       class: 'badge-success', dot: 'online' },
  borrowed:    { label: 'Dipinjam',       class: 'badge-warning', dot: 'pending' },
  maintenance: { label: 'Pemeliharaan',   class: 'badge-muted',   dot: 'idle' },
  lost:        { label: 'Hilang',         class: 'badge-danger',  dot: 'offline' },
};

function formatCurrency(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

export default function AssetManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [showQR, setShowQR] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Elektronik', location: '', condition: 'good', status: 'available', price: '', purchase_date: '' });

  // Fetch Assets
  const { data: assets = [], isLoading, isError } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const res = await api.get('/assets');
      return res.data;
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newAsset) => api.post('/assets', newAsset),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets']);
      toast.success('Aset berhasil ditambahkan!');
      setShowModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/assets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets']);
      toast.success('Aset berhasil diperbarui!');
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/assets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['assets']);
      toast.success('Aset berhasil dihapus.');
    },
  });

  // Filter Logic
  const filtered = assets.filter(a => {
    const matchSearch = a.name?.toLowerCase().includes(search.toLowerCase()) ||
                        a.code?.toLowerCase().includes(search.toLowerCase()) ||
                        a.category?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = Object.entries(STATUS_CONFIG).map(([k, v]) => ({
    status: k, label: v.label,
    count: assets.filter(a => a.status === k).length,
    ...v,
  }));

  const openCreate = () => {
    setEditAsset(null);
    setForm({ name: '', category: 'Elektronik', location: '', condition: 'good', status: 'available', price: '', purchase_date: '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name) { toast.error('Nama aset wajib diisi.'); return; }
    
    // Prepare payload
    const payload = {
      name: form.name,
      category: form.category,
      location: form.location,
      condition: form.condition,
      status: form.status,
      price: Number(form.price) || 0,
      purchase_date: form.purchase_date || null
    };

    if (editAsset) {
      updateMutation.mutate({ id: editAsset.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) return <div className="p-8 text-center"><Loader className="animate-spin inline mr-2"/> Memuat Data Aset...</div>;

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Manajemen Aset</h1>
          <p className="page-subtitle">Kelola inventaris aset komunitas dengan QR Code</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          Tambah Aset
        </button>
      </div>

      {/* Status summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        {stats.map(s => (
          <div key={s.status} className="card" style={{ padding: '1rem', cursor: 'pointer', textAlign: 'center' }}
            onClick={() => setStatusFilter(statusFilter === s.status ? 'all' : s.status)}>
            <div className={`status-dot ${s.dot}`} style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{s.count}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{assets.length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total Aset</div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="input-with-icon" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} className="input-icon" />
            <input className="input" placeholder="Cari nama, kode, atau kategori..." value={search} onChange={e => setSearch(e.target.value)} />
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
              <th>Kode Aset</th>
              <th>Nama Aset</th>
              <th>Kategori</th>
              <th>Lokasi</th>
              <th>Kondisi</th>
              <th>Status</th>
              <th>Harga</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(asset => (
              <tr key={asset.id}>
                <td><span className="code">{asset.code}</span></td>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{asset.name}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Tag size={12} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.8125rem' }}>{asset.category}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <MapPin size={12} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.8125rem' }}>{asset.location}</span>
                  </div>
                </td>
                <td><span className={`badge ${CONDITION_CONFIG[asset.condition]?.class || 'badge-muted'}`}>{CONDITION_CONFIG[asset.condition]?.label || asset.condition}</span></td>
                <td><span className={`badge ${STATUS_CONFIG[asset.status]?.class || 'badge-muted'}`}>{STATUS_CONFIG[asset.status]?.label || asset.status}</span></td>
                <td style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>{formatCurrency(asset.price)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowQR(asset)} title="QR Code" style={{ color: '#a78bfa' }}>
                      <QrCode size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditAsset(asset); setForm({ ...asset, purchase_date: asset.purchase_date?.split('T')[0] || '' }); setShowModal(true); }} title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" title="Hapus" style={{ color: '#f87171' }}
                      onClick={() => { if(confirm('Hapus aset ini?')) deleteMutation.mutate(asset.id); }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>Tidak ada aset yang ditemukan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 340, textAlign: 'center' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>QR Code Aset</h3>
              <button onClick={() => setShowQR(null)} className="btn-ghost" style={{ padding: 4 }}><XCircle size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'inline-block', margin: '0.5rem 0' }}>
                <QRCode
                  value={`${window.location.origin}/public/asset/${showQR.code}`}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div style={{ marginTop: '0.875rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>{showQR.name}</div>
                <span className="code" style={{ display: 'inline-block', marginTop: '0.375rem' }}>{showQR.code}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>Scan QR Code untuk melihat detail aset</p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn btn-primary btn-sm">
                <QrCode size={14} />
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {editAsset ? 'Edit Aset' : 'Tambah Aset Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost" style={{ padding: 4 }}><XCircle size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div className="input-group">
                <label className="input-label">Nama Aset</label>
                <input className="input" placeholder="Nama aset" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div className="input-group">
                  <label className="input-label">Kategori</label>
                  <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {['Elektronik', 'Furniture', 'Kendaraan', 'Peralatan', 'Dokumen', 'Infrastruktur'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Kondisi</label>
                  <select className="input" value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}>
                    {Object.entries(CONDITION_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Lokasi</label>
                <input className="input" placeholder="Lokasi penyimpanan" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                <div className="input-group">
                  <label className="input-label">Harga (Rp)</label>
                  <input className="input" type="number" placeholder="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Tanggal Beli</label>
                  <input className="input" type="date" value={form.purchase_date} onChange={e => setForm(p => ({ ...p, purchase_date: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={createMutation.isPending || updateMutation.isPending}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {editAsset ? 'Simpan' : 'Tambah Aset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
