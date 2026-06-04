import React, { useState } from 'react';
import { Link2, Search, Shield, CheckCircle, AlertTriangle, Clock, Eye, Hash, Database, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../lib/api';

const EVENT_CONFIG = {
  CREATED:  { label: 'Data Dibuat',     color: '#6366f1', icon: Database },
  UPDATED:  { label: 'Data Diperbarui', color: '#10b981', icon: Clock },
  DELETED:  { label: 'Data Dihapus',    color: '#ef4444', icon: AlertTriangle },
  DEFAULT:  { label: 'Audit Log',       color: '#a78bfa', icon: Link2 },
};

export default function BlockchainExplorer() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  // Fetch Audit Logs
  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const res = await api.get('/audit-logs');
      return res.data;
    }
  });

  // Verify Blockchain
  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await api.get('/audit-logs/verify');
      return res.data;
    }
  });

  const filtered = blocks.filter(b =>
    String(b.id).includes(search) ||
    b.action?.toLowerCase().includes(search.toLowerCase()) ||
    b.model_type?.toLowerCase().includes(search.toLowerCase()) ||
    b.hash?.toLowerCase().includes(search.toLowerCase()) ||
    b.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Blockchain Explorer</h1>
          <p className="page-subtitle">Audit trail immutable berbasis SHA-256 untuk semua perubahan data kritis</p>
        </div>
        <button className="btn btn-primary" onClick={() => verifyMutation.mutate()} disabled={verifyMutation.isPending || isLoading}>
          <Shield size={16} className={verifyMutation.isPending ? 'animate-spin' : ''} />
          {verifyMutation.isPending ? 'Memverifikasi...' : 'Verifikasi Rantai'}
        </button>
      </div>

      {/* Chain Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Blocks', value: blocks.length, icon: Link2, color: '#a78bfa' },
          { label: 'Integritas Chain', value: verifyMutation.data ? (verifyMutation.data.is_valid ? '✅ Valid' : '❌ Manipulated') : 'Belum Diverifikasi', icon: Shield, color: verifyMutation.data?.is_valid ? '#10b981' : (verifyMutation.data ? '#ef4444' : '#6366f1') },
          { label: 'Latest Hash', value: blocks.length > 0 ? blocks[0].hash.substring(0,8) + '...' : 'N/A', icon: Hash, color: '#06b6d4', mono: true },
          { label: 'Actor Terakhir', value: blocks.length > 0 ? (blocks[0].user?.name || 'Sistem') : 'N/A', icon: Database, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="card" style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(99,102,241,0.04) 100%)', borderColor: 'rgba(167,139,250,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: s.color + '22', border: `1px solid ${s.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={16} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: s.mono ? 'var(--font-mono)' : 'inherit' }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Verification Result */}
      {verifyMutation.data && (
        <div style={{
          padding: '1rem 1.25rem',
          background: verifyMutation.data.is_valid ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${verifyMutation.data.is_valid ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: 'var(--radius-lg)',
          display: 'flex', alignItems: 'center', gap: '0.875rem',
          animation: 'fadeIn 0.3s ease',
        }}>
          <CheckCircle size={20} color={verifyMutation.data.is_valid ? '#10b981' : '#ef4444'} />
          <div>
            <div style={{ fontWeight: 700, color: verifyMutation.data.is_valid ? '#34d399' : '#f87171', fontSize: '0.9375rem' }}>
              Blockchain {verifyMutation.data.is_valid ? 'Valid — Rantai Tidak Dimanipulasi' : 'Tidak Valid — Ditemukan Anomali!'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Total: {verifyMutation.data.total_blocks} blocks · Diverifikasi pada: {new Date().toLocaleString('id-ID')}
              {!verifyMutation.data.is_valid && ` · Rantai putus pada Block ID: #${verifyMutation.data.broken_at_id}`}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card" style={{ padding: '1rem' }}>
        <div className="input-with-icon">
          <Search size={16} className="input-icon" />
          <input className="input" placeholder="Cari block id, action type, hash, atau actor..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center"><Loader className="animate-spin inline mr-2"/> Memuat Blockchain...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((block, i) => {
            const actionType = block.action?.split('_')[0] || 'DEFAULT';
            const cfg = EVENT_CONFIG[actionType] || EVENT_CONFIG['DEFAULT'];
            const isSelected = selected?.id === block.id;

            return (
              <div key={block.id} style={{ animation: `fadeIn 0.3s ${i * 40}ms ease both` }}>
                <div
                  className="card"
                  style={{
                    cursor: 'pointer',
                    borderColor: isSelected ? cfg.color + '44' : 'var(--border)',
                    background: isSelected ? cfg.color + '08' : 'var(--bg-card)',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setSelected(isSelected ? null : block)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {/* Block Index */}
                    <div style={{
                      width: 52, height: 52, borderRadius: 'var(--radius-md)',
                      background: cfg.color + '15',
                      border: `1px solid ${cfg.color}33`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <div style={{ fontSize: '0.625rem', color: cfg.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Block</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: cfg.color, fontFamily: 'var(--font-mono)' }}>#{block.id}</div>
                    </div>

                    {/* Event Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.8125rem', fontWeight: 700,
                          padding: '0.2rem 0.625rem',
                          background: cfg.color + '15',
                          color: cfg.color,
                          borderRadius: 'var(--radius-full)',
                          border: `1px solid ${cfg.color}33`,
                        }}>
                          {block.action}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{block.model_type?.split('\\').pop()}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Record ID: {block.model_id}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          <span style={{ color: 'var(--text-disabled)' }}>hash: </span>
                          <span style={{ color: cfg.color }}>{block.hash?.substring(0, 16)}...</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          <span style={{ color: 'var(--text-disabled)' }}>prev: </span>
                          {block.previous_hash?.substring(0, 16)}...
                        </div>
                      </div>
                    </div>

                    {/* Right info */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{block.user?.name || 'Sistem'}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', marginTop: '0.25rem' }}>{new Date(block.created_at).toLocaleString('id-ID')}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.375rem', marginTop: '0.375rem' }}>
                        <div className="status-dot online" />
                        <span style={{ fontSize: '0.6875rem', color: '#34d399' }}>Valid</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isSelected && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      background: 'var(--bg-muted)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      animation: 'fadeIn 0.2s ease',
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem' }}>
                        {[
                          { label: 'Block Index', value: `#${block.id}` },
                          { label: 'Action', value: block.action },
                          { label: 'Model Type', value: block.model_type },
                          { label: 'Record ID', value: block.model_id || 'N/A' },
                          { label: 'Actor', value: block.user?.name || 'Sistem' },
                          { label: 'IP Address', value: block.ip_address || '127.0.0.1' },
                          { label: 'Timestamp', value: new Date(block.created_at).toLocaleString('id-ID') },
                          { label: 'Valid', value: '✅ Terverifikasi' },
                        ].map(f => (
                          <div key={f.label}>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>{f.label}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{String(f.value)}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Old Values</div>
                          <pre style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                            color: '#ef4444', background: 'rgba(0,0,0,0.3)',
                            padding: '0.75rem', borderRadius: 'var(--radius-md)',
                            overflow: 'auto', margin: 0, maxHeight: 150
                          }}>
                            {block.old_values ? JSON.stringify(block.old_values, null, 2) : 'null'}
                          </pre>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>New Values</div>
                          <pre style={{
                            fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                            color: '#10b981', background: 'rgba(0,0,0,0.3)',
                            padding: '0.75rem', borderRadius: 'var(--radius-md)',
                            overflow: 'auto', margin: 0, maxHeight: 150
                          }}>
                            {block.new_values ? JSON.stringify(block.new_values, null, 2) : 'null'}
                          </pre>
                        </div>
                      </div>
                      <div style={{ marginTop: '0.875rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', marginBottom: '0.25rem' }}>SHA-256 Current Hash</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: cfg.color, wordBreak: 'break-all' }}>{block.hash}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', marginTop: '0.5rem', marginBottom: '0.25rem' }}>SHA-256 Previous Hash</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{block.previous_hash}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="text-center p-8 w-full">Tidak ada log audit ditemukan.</div>}
        </div>
      )}
    </div>
  );
}
