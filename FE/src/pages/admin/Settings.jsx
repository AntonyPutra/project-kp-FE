import React from 'react';
import { Settings as SettingsIcon, Shield, Bell, Key, Database, UserCheck, Loader } from 'lucide-react';

export default function Settings() {
  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Pengaturan Sistem</h1>
          <p className="page-subtitle">Konfigurasi dan preferensi aplikasi SICAMS</p>
        </div>
      </div>

      <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(148,163,184,0.1)',
          border: '1px solid rgba(148,163,184,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <SettingsIcon size={36} color="#94a3b8" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Fitur Sedang Dikembangkan</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
          Menu Pengaturan Global sedang dalam tahap pengembangan. Semua konfigurasi penting akan dipusatkan di sini.
        </p>
        <button className="btn btn-secondary" style={{ marginTop: '2rem' }} disabled>
          <Loader size={16} className="animate-spin" />
          Coming Soon
        </button>
      </div>
    </div>
  );
}
