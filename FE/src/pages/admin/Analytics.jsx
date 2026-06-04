import React from 'react';
import { BarChart2, TrendingUp, Users, Activity, Loader } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Statistik dan analisis data komunitas yang mendalam</p>
        </div>
      </div>

      <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(251,146,60,0.1)',
          border: '1px solid rgba(251,146,60,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <BarChart2 size={36} color="#fb923c" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Fitur Sedang Dikembangkan</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
          Halaman Analytics Lanjutan sedang dalam tahap pengembangan. Nantinya Anda dapat melihat laporan prediktif menggunakan AI di sini.
        </p>
        <button className="btn btn-secondary" style={{ marginTop: '2rem' }} disabled>
          <Loader size={16} className="animate-spin" />
          Coming Soon
        </button>
      </div>
    </div>
  );
}
