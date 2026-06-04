import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, MapPin, Calendar, Activity, CheckCircle, Shield, AlertTriangle, Loader } from 'lucide-react';
import api from '../../lib/api';

export default function PublicAsset() {
  const { code } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await api.get(`/public/assets/${code}`);
        setAsset(res.data);
      } catch (err) {
        setError('Aset tidak ditemukan atau sistem sedang sibuk.');
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [code]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)' }}>
        <Loader size={48} color="var(--primary-400)" className="animate-spin" style={{ marginBottom: '1rem' }} />
        <div style={{ color: 'var(--text-muted)' }}>Mencari Aset...</div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', padding: '2rem' }}>
        <div className="card" style={{ maxWidth: 400, textAlign: 'center', padding: '3rem 2rem' }}>
          <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Aset Tidak Ditemukan</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>{error}</p>
          <Link to="/" className="btn btn-primary" style={{ width: '100%' }}>Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-surface)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '16px',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 24px rgba(99,102,241,0.4)',
            margin: '0 auto 1rem',
          }}>
            <Shield size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>SICAMS Asset Tracking</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Verifikasi Aset Komunitas</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem', borderTop: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{asset.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span className="code" style={{ fontSize: '0.75rem', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: 'none' }}>{asset.code}</span>
                <span className="badge badge-info">{asset.category}</span>
              </div>
            </div>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(52,211,153,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle size={24} color="#34d399" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-muted)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Activity size={18} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Kondisi Saat Ini</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>{asset.condition === 'good' ? 'Baik / Layak Pakai' : asset.condition === 'broken' ? 'Rusak' : 'Dalam Perbaikan'}</div>
              </div>
            </div>
            <div style={{ width: '100%', height: 1, background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <MapPin size={18} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Lokasi Penempatan</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>{asset.location}</div>
              </div>
            </div>
            <div style={{ width: '100%', height: 1, background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Calendar size={18} color="var(--text-muted)" />
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', textTransform: 'uppercase' }}>Tanggal Pembelian</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>{asset.purchase_date}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Data ini disinkronkan secara real-time dari sistem SICAMS dan dilindungi oleh Blockchain Audit Log.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
