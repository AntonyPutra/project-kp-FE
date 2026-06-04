import React, { useState } from 'react';
import { Activity, User, Clock, Shield, Globe, Filter } from 'lucide-react';

const LOGS = [
  { id: 1,   user: 'Admin Kelurahan',  action: 'LOGIN',           module: 'auth',        desc: 'Login berhasil dari browser Chrome',        ip: '192.168.1.100', code: 200, time: '2026-06-04 10:35:12' },
  { id: 2,   user: 'Admin Kelurahan',  action: 'LETTER_APPROVE',  module: 'community',   desc: 'Menyetujui Surat Domisili SURAT-2026-0101', ip: '192.168.1.100', code: 200, time: '2026-06-04 10:30:15' },
  { id: 3,   user: 'Petugas Lapangan', action: 'AID_VERIFY',      module: 'social-aid',  desc: 'Memverifikasi pendaftaran bantuan ID #54',  ip: '192.168.1.102', code: 200, time: '2026-06-04 09:15:44' },
  { id: 4,   user: 'Budi Santoso',     action: 'LETTER_SUBMIT',   module: 'community',   desc: 'Mengajukan Surat Domisili baru',            ip: '110.45.22.18',  code: 201, time: '2026-06-04 09:00:01' },
  { id: 5,   user: 'Budi Santoso',     action: 'LOGIN',           module: 'auth',        desc: 'Login dengan MFA berhasil',                 ip: '110.45.22.18',  code: 200, time: '2026-06-04 08:58:30' },
  { id: 6,   user: 'Unknown',          action: 'LOGIN_FAILED',    module: 'auth',        desc: '5x percobaan login gagal - akun dikunci',  ip: '103.10.55.200', code: 401, time: '2026-06-04 08:40:00' },
  { id: 7,   user: 'Admin Kelurahan',  action: 'ASSET_CREATE',    module: 'assets',      desc: 'Menambahkan aset baru AST-ELEK-006',        ip: '192.168.1.100', code: 201, time: '2026-06-03 16:20:11' },
  { id: 8,   user: 'Super Admin',      action: 'USER_CREATE',     module: 'users',       desc: 'Membuat akun baru: Rudi Hartono',           ip: '192.168.1.1',   code: 201, time: '2026-06-03 15:00:00' },
];

const ACTION_CONFIG = {
  LOGIN:          { label: 'Login',          color: '#6366f1' },
  LOGIN_FAILED:   { label: 'Login Gagal',    color: '#ef4444' },
  LETTER_SUBMIT:  { label: 'Ajukan Surat',   color: '#06b6d4' },
  LETTER_APPROVE: { label: 'Setujui Surat',  color: '#10b981' },
  AID_VERIFY:     { label: 'Verifikasi Aid', color: '#f59e0b' },
  ASSET_CREATE:   { label: 'Buat Aset',      color: '#a78bfa' },
  USER_CREATE:    { label: 'Buat User',      color: '#8b5cf6' },
};

export default function ActivityLogs() {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filtered = LOGS.filter(l => {
    const matchSearch = l.user.toLowerCase().includes(search.toLowerCase()) ||
                        l.action.toLowerCase().includes(search.toLowerCase()) ||
                        l.desc.toLowerCase().includes(search.toLowerCase());
    const matchModule = moduleFilter === 'all' || l.module === moduleFilter;
    return matchSearch && matchModule;
  });

  return (
    <div className="page-content">
      <div>
        <h1 className="page-title">Activity Logs</h1>
        <p className="page-subtitle">Rekam jejak semua aktivitas pengguna dalam sistem</p>
      </div>

      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-with-icon" style={{ flex: 1, minWidth: 200 }}>
            <Activity size={16} className="input-icon" />
            <input className="input" placeholder="Cari user, aksi, atau deskripsi..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input" style={{ width: 'auto' }} value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}>
            <option value="all">Semua Modul</option>
            {['auth', 'community', 'social-aid', 'assets', 'users', 'blockchain'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Pengguna</th>
              <th>Aksi</th>
              <th>Modul</th>
              <th>Deskripsi</th>
              <th>IP Address</th>
              <th>Kode</th>
              <th>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, i) => {
              const cfg = ACTION_CONFIG[log.action] || { label: log.action, color: '#6366f1' };
              return (
                <tr key={log.id} style={{ animation: `fadeIn 0.2s ${i * 30}ms ease both` }}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-disabled)' }}>{log.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '7px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User size={12} color="#818cf8" />
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 500 }}>{log.user}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 700,
                      padding: '0.2rem 0.625rem',
                      background: cfg.color + '15',
                      color: cfg.color,
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${cfg.color}33`,
                      whiteSpace: 'nowrap',
                    }}>
                      {cfg.label}
                    </span>
                  </td>
                  <td><span className="badge badge-muted" style={{ fontSize: '0.625rem' }}>{log.module}</span></td>
                  <td style={{ fontSize: '0.8125rem', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.desc}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Globe size={12} color="var(--text-muted)" />
                      <span className="code" style={{ fontSize: '0.75rem' }}>{log.ip}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700,
                      color: log.code >= 400 ? '#f87171' : log.code >= 200 ? '#34d399' : 'var(--text-muted)',
                    }}>
                      {log.code}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Clock size={12} />
                      {log.time}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
