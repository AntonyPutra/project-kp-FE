import React, { useState } from 'react';
import { Users, Plus, Search, Filter, Edit2, Trash2, Eye, MoreVertical, Shield, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
  'super-admin': { label: 'Super Admin', class: 'badge-primary', color: '#6366f1' },
  'admin':       { label: 'Admin',       class: 'badge-primary', color: '#8b5cf6' },
  'petugas':     { label: 'Petugas',     class: 'badge-cyan',    color: '#06b6d4' },
  'masyarakat':  { label: 'Masyarakat',  class: 'badge-success', color: '#10b981' },
  'pimpinan':    { label: 'Pimpinan',    class: 'badge-warning', color: '#f59e0b' },
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

function UserAvatar({ user }) {
  const color = ROLE_CONFIG[user.role]?.color || '#6366f1';
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '10px',
      background: color + '22',
      border: `1px solid ${color}33`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.6875rem', fontWeight: 700, color, flexShrink: 0,
    }}>
      {user.name ? user.name.slice(0, 2).toUpperCase() : '??'}
    </div>
  );
}

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', nik: '', role: 'masyarakat', status: true, password: '' });

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      // Format role matching the ROLE_CONFIG mapping:
      // 'super_admin' from DB becomes 'super-admin' in UI mapping if needed, or we just map it.
      // Let's adjust DB 'super_admin' to 'super-admin' for frontend consistency.
      return res.data.map(u => ({ ...u, role: u.role === 'super_admin' ? 'super-admin' : u.role }));
    }
  });

  const filtered = users.filter(u => {
    const matchSearch = (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
                        (u.nik || '').includes(search);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editUser) {
        // change super-admin back to super_admin for backend
        const payload = { ...data, role: data.role === 'super-admin' ? 'super_admin' : data.role };
        return await api.put(`/users/${editUser.id}`, payload);
      } else {
        const payload = { ...data, role: data.role === 'super-admin' ? 'super_admin' : data.role };
        return await api.post('/users', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success(editUser ? 'Pengguna berhasil diperbarui' : 'Pengguna berhasil ditambahkan');
      setShowModal(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Pengguna berhasil dihapus');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menghapus pengguna');
    }
  });

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: '', email: '', nik: '', role: 'masyarakat', status: true, password: '' });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, nik: user.nik || '', role: user.role, status: user.status ?? true, password: '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) { toast.error('Nama dan email wajib diisi.'); return; }
    saveMutation.mutate(form);
  };

  const toggleStatus = (id) => {
    // Optional: implement status toggle if backend supports it. Currently assuming all true.
    toast.error('Fitur ganti status masih dalam pengembangan (backend belum mendukung).');
  };

  const deleteUser = (id) => {
    if (window.confirm('Yakin ingin menghapus pengguna ini?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Manajemen Pengguna</h1>
          <p className="page-subtitle">Kelola akun pengguna dan hak akses sistem</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          Tambah Pengguna
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
          const count = users.filter(u => u.role === role).length;
          return (
            <div key={role} className="card" style={{ textAlign: 'center', padding: '1rem', borderColor: cfg.color + '33', cursor: 'pointer' }}
              onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: cfg.color }}>{count}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{cfg.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-with-icon" style={{ flex: 1, minWidth: 200 }}>
            <Search size={16} className="input-icon" />
            <input className="input" placeholder="Cari nama, email, atau NIK..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            className="input"
            style={{ width: 'auto', minWidth: 160 }}
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="all">Semua Role</option>
            {Object.entries(ROLE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {filtered.length} dari {users.length} pengguna
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Pengguna</th>
              <th>NIK</th>
              <th>Role</th>
              <th>Status</th>
              <th>Terdaftar</th>
              <th>Login Terakhir</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <UserAvatar user={user} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="code">{user.nik}</span></td>
                <td><span className={`badge ${ROLE_CONFIG[user.role].class}`}>{ROLE_CONFIG[user.role].label}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className={`status-dot online`} />
                    <span style={{ fontSize: '0.8125rem', color: '#34d399' }}>
                      Aktif
                    </span>
                  </div>
                </td>
                <td style={{ fontSize: '0.8125rem' }}>{new Date(user.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>-</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(user)} title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => toggleStatus(user.id)}
                      title={user.status ? 'Nonaktifkan' : 'Aktifkan'}
                      style={{ color: user.status ? '#f87171' : '#34d399' }}
                    >
                      {user.status ? <XCircle size={14} /> : <CheckCircle size={14} />}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => deleteUser(user.id)} title="Hapus" style={{ color: '#f87171' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Users size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p>Tidak ada pengguna yang ditemukan.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {editUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost" style={{ padding: 4 }}><XCircle size={18} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Nama Lengkap</label>
                <input className="input" placeholder="Nama lengkap" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input className="input" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">NIK (Opsional)</label>
                <input className="input" placeholder="16 digit NIK" maxLength={16} value={form.nik} onChange={e => setForm(p => ({ ...p, nik: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Password {editUser ? '(Kosongkan jika tidak ingin diubah)' : '(Opsional, default: Admin123!)'}</label>
                <input className="input" type="password" placeholder="Masukkan password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Role</label>
                <select className="input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  {Object.entries(ROLE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saveMutation.isPending}>
                <CheckCircle size={14} />
                {saveMutation.isPending ? 'Menyimpan...' : editUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
