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

const INITIAL_USERS = [
  { id: 1, name: 'Super Administrator', email: 'superadmin@sicams.id', nik: '3201000000000001', role: 'super-admin', status: true,  created: '2026-01-01', lastLogin: '5 mnt lalu',   avatar: 'SA' },
  { id: 2, name: 'Admin Kelurahan',      email: 'admin@sicams.id',      nik: '3201000000000002', role: 'admin',       status: true,  created: '2026-01-05', lastLogin: '1 jam lalu',    avatar: 'AK' },
  { id: 3, name: 'Petugas Lapangan',     email: 'petugas@sicams.id',     nik: '3201000000000003', role: 'petugas',     status: true,  created: '2026-01-10', lastLogin: '3 jam lalu',    avatar: 'PL' },
  { id: 4, name: 'Budi Santoso',         email: 'budi@example.com',      nik: '3201234567890001', role: 'masyarakat',  status: true,  created: '2026-02-15', lastLogin: '2 hari lalu',   avatar: 'BS' },
  { id: 5, name: 'Siti Rahayu',          email: 'siti@example.com',      nik: '3201234567890002', role: 'masyarakat',  status: true,  created: '2026-02-20', lastLogin: '1 hari lalu',   avatar: 'SR' },
  { id: 6, name: 'Ahmad Fauzi',          email: 'ahmad@example.com',     nik: '3201234567890003', role: 'masyarakat',  status: false, created: '2026-03-01', lastLogin: '2 minggu lalu', avatar: 'AF' },
  { id: 7, name: 'Kepala Kelurahan',     email: 'pimpinan@sicams.id',    nik: '3201000000000005', role: 'pimpinan',    status: true,  created: '2026-01-01', lastLogin: '30 mnt lalu',   avatar: 'KK' },
  { id: 8, name: 'Dewi Lestari',         email: 'dewi@example.com',      nik: '3201234567890004', role: 'masyarakat',  status: true,  created: '2026-03-10', lastLogin: '3 hari lalu',   avatar: 'DL' },
];

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
      {user.avatar}
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', nik: '', role: 'masyarakat', status: true });

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase()) ||
                        u.nik.includes(search);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openCreate = () => {
    setEditUser(null);
    setForm({ name: '', email: '', nik: '', role: 'masyarakat', status: true });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, nik: user.nik, role: user.role, status: user.status });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) { toast.error('Nama dan email wajib diisi.'); return; }
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...form } : u));
      toast.success('Data pengguna berhasil diperbarui!');
    } else {
      const newUser = {
        ...form, id: Date.now(), created: new Date().toLocaleDateString('id-ID'),
        lastLogin: '-', avatar: form.name.slice(0, 2).toUpperCase(),
      };
      setUsers(prev => [newUser, ...prev]);
      toast.success('Pengguna baru berhasil ditambahkan!');
    }
    setShowModal(false);
  };

  const toggleStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: !u.status } : u));
    const user = users.find(u => u.id === id);
    toast.success(`Akun ${user.name} ${user.status ? 'dinonaktifkan' : 'diaktifkan'}.`);
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success('Pengguna berhasil dihapus.');
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
                    <div className={`status-dot ${user.status ? 'online' : 'offline'}`} />
                    <span style={{ fontSize: '0.8125rem', color: user.status ? '#34d399' : '#f87171' }}>
                      {user.status ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </td>
                <td style={{ fontSize: '0.8125rem' }}>{user.created}</td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{user.lastLogin}</td>
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
                <label className="input-label">NIK</label>
                <input className="input" placeholder="16 digit NIK" maxLength={16} value={form.nik} onChange={e => setForm(p => ({ ...p, nik: e.target.value }))} />
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
              <button className="btn btn-primary" onClick={handleSave}>
                <CheckCircle size={14} />
                {editUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
