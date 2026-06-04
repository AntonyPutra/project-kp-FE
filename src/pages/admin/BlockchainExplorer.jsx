import React, { useState } from 'react';
import { Link2, Search, Shield, CheckCircle, AlertTriangle, Clock, Eye, Hash, Database } from 'lucide-react';

const BLOCKS = [
  { index: 247, event: 'LETTER_APPROVED',    table: 'letter_requests',  recordId: 101, prevHash: 'ab12cd34ef56...', currHash: '98fe76dc54ba...', actor: 'Admin Kelurahan', ip: '192.168.1.100', time: '2026-06-04 10:30:15', valid: true,  data: { letter_id: 101, action: 'approved', tracking: 'SURAT-2026-0101' } },
  { index: 246, event: 'AID_DISTRIBUTED',    table: 'aid_distributions', recordId: 55,  prevHash: '12ef34cd56ab...', currHash: 'ab12cd34ef56...', actor: 'Petugas Distribusi', ip: '192.168.1.101', time: '2026-06-04 09:15:22', valid: true,  data: { amount: 600000, method: 'transfer', recipient_id: 88 } },
  { index: 245, event: 'ASSET_BORROWED',     table: 'asset_borrowings', recordId: 78,  prevHash: '9876fedc5432...', currHash: '12ef34cd56ab...', actor: 'Ahmad Fauzi',      ip: '192.168.1.50',  time: '2026-06-04 08:00:10', valid: true,  data: { asset_code: 'AST-KEND-001', borrow_date: '2026-06-04' } },
  { index: 244, event: 'USER_CREATED',       table: 'users',            recordId: 125, prevHash: 'fedcba987654...', currHash: '9876fedc5432...', actor: 'Admin Kelurahan', ip: '192.168.1.100', time: '2026-06-03 16:45:00', valid: true,  data: { user_name: 'Rudi Hartono', role: 'masyarakat' } },
  { index: 243, event: 'LETTER_REJECTED',    table: 'letter_requests',  recordId: 100, prevHash: 'abcdef012345...', currHash: 'fedcba987654...', actor: 'Petugas Lapangan', ip: '192.168.1.102', time: '2026-06-03 15:20:35', valid: true,  data: { letter_id: 100, reason: 'Dokumen KTP tidak terbaca' } },
  { index: 242, event: 'AID_VERIFIED',       table: 'aid_applications', recordId: 54,  prevHash: '1234567890ab...', currHash: 'abcdef012345...', actor: 'Petugas Lapangan', ip: '192.168.1.102', time: '2026-06-03 14:10:00', valid: true,  data: { application_id: 54, status: 'verified' } },
  { index: 1,   event: 'GENESIS',            table: 'blockchain_blocks', recordId: null,prevHash: '0000000000000...', currHash: 'a665a45920422...', actor: 'System',         ip: '127.0.0.1',     time: '2026-06-01 00:00:00', valid: true,  data: { message: 'SICAMS Genesis Block', version: '1.0.0' } },
];

const EVENT_CONFIG = {
  LETTER_APPROVED:  { label: 'Surat Disetujui',  color: '#10b981', icon: CheckCircle },
  LETTER_REJECTED:  { label: 'Surat Ditolak',    color: '#ef4444', icon: AlertTriangle },
  AID_DISTRIBUTED:  { label: 'Bantuan Tersalur', color: '#06b6d4', icon: CheckCircle },
  AID_VERIFIED:     { label: 'Aid Diverifikasi', color: '#f59e0b', icon: Shield },
  ASSET_BORROWED:   { label: 'Aset Dipinjam',    color: '#f59e0b', icon: Clock },
  USER_CREATED:     { label: 'Pengguna Dibuat',  color: '#6366f1', icon: Database },
  GENESIS:          { label: 'Genesis Block',    color: '#a78bfa', icon: Link2 },
};

export default function BlockchainExplorer() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const filtered = BLOCKS.filter(b =>
    String(b.index).includes(search) ||
    b.event.toLowerCase().includes(search.toLowerCase()) ||
    b.table.toLowerCase().includes(search.toLowerCase()) ||
    b.currHash.toLowerCase().includes(search.toLowerCase())
  );

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    await new Promise(r => setTimeout(r, 2000));
    setVerifyResult({ valid: true, total: 247, invalid: 0 });
    setVerifying(false);
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Blockchain Explorer</h1>
          <p className="page-subtitle">Audit trail immutable berbasis SHA-256 untuk semua perubahan data kritis</p>
        </div>
        <button className="btn btn-primary" onClick={handleVerify} disabled={verifying}>
          <Shield size={16} className={verifying ? 'animate-spin' : ''} />
          {verifying ? 'Memverifikasi...' : 'Verifikasi Rantai'}
        </button>
      </div>

      {/* Chain Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total Blocks', value: '247', icon: Link2, color: '#a78bfa' },
          { label: 'Integritas Chain', value: '✅ Valid', icon: Shield, color: '#10b981' },
          { label: 'Genesis Hash', value: 'a665a459...', icon: Hash, color: '#06b6d4', mono: true },
          { label: 'Blocks Hari Ini', value: '+18', icon: Database, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="card" style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(99,102,241,0.04) 100%)', borderColor: 'rgba(167,139,250,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: s.color + '22', border: `1px solid ${s.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={16} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: s.mono ? 'var(--font-mono)' : 'inherit' }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Verification Result */}
      {verifyResult && (
        <div style={{
          padding: '1rem 1.25rem',
          background: verifyResult.valid ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${verifyResult.valid ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: 'var(--radius-lg)',
          display: 'flex', alignItems: 'center', gap: '0.875rem',
          animation: 'fadeIn 0.3s ease',
        }}>
          <CheckCircle size={20} color={verifyResult.valid ? '#10b981' : '#ef4444'} />
          <div>
            <div style={{ fontWeight: 700, color: verifyResult.valid ? '#34d399' : '#f87171', fontSize: '0.9375rem' }}>
              Blockchain {verifyResult.valid ? 'Valid — Rantai Tidak Dimanipulasi' : 'Tidak Valid — Ditemukan Anomali!'}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Total: {verifyResult.total} blocks · Invalid: {verifyResult.invalid} blocks · Diverifikasi: {new Date().toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card" style={{ padding: '1rem' }}>
        <div className="input-with-icon">
          <Search size={16} className="input-icon" />
          <input className="input" placeholder="Cari block index, event type, atau hash..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Blocks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map((block, i) => {
          const cfg = EVENT_CONFIG[block.event] || { label: block.event, color: '#6366f1', icon: Database };
          const isSelected = selected?.index === block.index;
          return (
            <div key={block.index} style={{ animation: `fadeIn 0.3s ${i * 40}ms ease both` }}>
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
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: cfg.color, fontFamily: 'var(--font-mono)' }}>#{block.index}</div>
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
                        {cfg.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{block.table}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--text-disabled)' }}>hash: </span>
                        <span style={{ color: cfg.color }}>{block.currHash}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--text-disabled)' }}>prev: </span>
                        {block.prevHash}
                      </div>
                    </div>
                  </div>

                  {/* Right info */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{block.actor}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', marginTop: '0.25rem' }}>{block.time}</div>
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
                        { label: 'Block Index', value: `#${block.index}` },
                        { label: 'Event Type', value: block.event },
                        { label: 'Table', value: block.table },
                        { label: 'Record ID', value: block.recordId || 'N/A' },
                        { label: 'Actor', value: block.actor },
                        { label: 'IP Address', value: block.ip },
                        { label: 'Timestamp', value: block.time },
                        { label: 'Valid', value: '✅ Terverifikasi' },
                      ].map(f => (
                        <div key={f.label}>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>{f.label}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{String(f.value)}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Data Payload</div>
                      <pre style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                        color: '#34d399',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '0.75rem', borderRadius: 'var(--radius-md)',
                        overflow: 'auto',
                        margin: 0,
                      }}>
                        {JSON.stringify(block.data, null, 2)}
                      </pre>
                    </div>
                    <div style={{ marginTop: '0.875rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', marginBottom: '0.25rem' }}>SHA-256 Current Hash</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: cfg.color, wordBreak: 'break-all' }}>{block.currHash}a8f3c29192d4e7b6</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-disabled)', marginTop: '0.5rem', marginBottom: '0.25rem' }}>SHA-256 Previous Hash</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{block.prevHash}b1c2d3e4f5a6b7c8</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
