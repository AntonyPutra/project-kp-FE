import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Search, X, User, Mic, RefreshCw } from 'lucide-react';

const FAQS = [
  'Bagaimana cara mengajukan surat domisili?',
  'Dokumen apa yang dibutuhkan untuk bantuan sosial?',
  'Berapa lama proses persetujuan surat?',
  'Bagaimana cara tracking status surat?',
  'Apa saja program bantuan yang tersedia?',
  'Cara meminjam aset komunitas?',
];

const AI_RESPONSES = {
  'surat domisili': '**Cara Mengajukan Surat Domisili:**\n\n1. Login ke akun SICAMS Anda\n2. Pilih menu **Layanan Surat** → **Surat Domisili**\n3. Isi formulir dengan data lengkap:\n   - Nama sesuai KTP\n   - NIK\n   - Alamat lengkap\n   - Keperluan surat\n4. Upload dokumen: KTP & KK\n5. Submit pengajuan\n\n📋 Nomor tracking akan dikirim ke email Anda\n⏱️ Proses: 1-3 hari kerja',
  'bantuan sosial': '**Syarat Pendaftaran Bantuan Sosial:**\n\n📄 Dokumen yang dibutuhkan:\n- KTP & KK (wajib)\n- Surat Keterangan Tidak Mampu\n- Slip gaji/bukti penghasilan\n- Foto rumah (opsional)\n\n✅ Kriteria penerima:\n- Penghasilan < Rp 3.000.000/bulan\n- Memiliki tanggungan keluarga\n- Berdomisili di wilayah kelurahan\n- Belum pernah menerima bantuan serupa',
  'tracking': '**Cara Tracking Status Surat:**\n\n🔍 Ada 2 cara:\n\n**1. Login → Dashboard:**\n- Buka menu Layanan Surat\n- Lihat status di kolom "Status"\n\n**2. Tracking Publik:**\n- Kunjungi sicams.id/track\n- Masukkan nomor tracking (format: SURAT-YYYY-XXXX)\n- Klik "Cek Status"\n\n**Status yang ada:**\n- 📤 Diajukan\n- 🔍 Sedang Ditinjau\n- ✅ Disetujui\n- ❌ Ditolak',
  'default': '🤖 Saya adalah **AI Assistant SICAMS**!\n\nSaya dapat membantu Anda dengan:\n- Panduan pengajuan surat\n- Informasi program bantuan sosial\n- Cara tracking status\n- Informasi peminjaman aset\n- FAQ umum sistem\n\nSilakan ketik pertanyaan Anda atau pilih topik di bawah ini.',
};

function findResponse(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('domisili') || lower.includes('surat')) return AI_RESPONSES['surat domisili'];
  if (lower.includes('bantuan') || lower.includes('sosial') || lower.includes('syarat')) return AI_RESPONSES['bantuan sosial'];
  if (lower.includes('tracking') || lower.includes('status') || lower.includes('cek')) return AI_RESPONSES['tracking'];
  return `💬 Terima kasih atas pertanyaan Anda tentang **"${msg}"**.\n\nBerdasarkan sistem kami, berikut informasi yang relevan:\n\n- Layanan surat tersedia 24/7 secara online\n- Proses persetujuan 1-3 hari kerja\n- Notifikasi dikirim via email & Telegram\n\n❓ Apakah ada yang bisa saya bantu lebih lanjut?`;
}

function MarkdownText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p style={{ lineHeight: 1.7, whiteSpace: 'pre-line', fontSize: '0.875rem' }}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: AI_RESPONSES['default'], time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [smartSearch, setSmartSearch] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (msg) => {
    const text = msg || input.trim();
    if (!text) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));

    const aiResponse = findResponse(text);
    setMessages(prev => [...prev, {
      id: Date.now() + 1, role: 'ai', text: aiResponse,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([{ id: 1, role: 'ai', text: AI_RESPONSES['default'], time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }]);
  };

  return (
    <div className="page-content">
      <div>
        <h1 className="page-title">AI Assistant</h1>
        <p className="page-subtitle">Asisten cerdas berbasis AI untuk panduan dan smart search</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Chat */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 600 }}>
          {/* Header */}
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99,102,241,0.4)',
              animation: 'pulse-glow 2s infinite',
            }}>
              <Bot size={18} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>SICAMS AI</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#34d399' }}>
                <div className="status-dot online" /> Online
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={clearChat}>
              <RefreshCw size={14} /> Reset
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '0.625rem',
                animation: 'fadeIn 0.3s ease',
              }}>
                {msg.role === 'ai' && (
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Bot size={14} color="white" />
                  </div>
                )}
                <div style={{ maxWidth: '80%' }}>
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user'
                      ? 'var(--gradient-primary)'
                      : 'var(--bg-muted)',
                    border: msg.role === 'ai' ? '1px solid var(--border)' : 'none',
                    color: msg.role === 'user' ? 'white' : 'var(--text-secondary)',
                  }}>
                    <MarkdownText text={msg.text} />
                  </div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-disabled)', marginTop: '0.25rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</div>
                </div>
                {msg.role === 'user' && (
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <User size={14} color="#818cf8" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={14} color="white" />
                </div>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8', animation: `float 1s ${i * 0.2}s ease-in-out infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <input
                className="input"
                placeholder="Ketik pertanyaan Anda..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-primary"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                style={{ padding: '0.75rem 1rem' }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: FAQ + Smart Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Smart Search */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <Search size={16} color="#06b6d4" />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Smart Search</h3>
            </div>
            <div className="input-with-icon" style={{ marginBottom: '0.875rem' }}>
              <Search size={14} className="input-icon" />
              <input className="input" placeholder="Cari di seluruh sistem..." value={smartSearch} onChange={e => setSmartSearch(e.target.value)} style={{ fontSize: '0.8125rem' }} />
            </div>
            {smartSearch && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', animation: 'fadeIn 0.2s ease' }}>
                {['Surat Domisili (101 hasil)', 'Pengguna: ' + smartSearch + ' (3 hasil)', 'Aset terkait (2 hasil)'].map((r, i) => (
                  <div key={i} style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                  >
                    🔍 {r}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Questions */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <Sparkles size={16} color="#a78bfa" />
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Pertanyaan Umum</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {FAQS.map((faq, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(faq)}
                  style={{
                    padding: '0.625rem 0.875rem',
                    background: 'var(--bg-muted)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    lineHeight: 1.4,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.color = 'var(--primary-400)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  💬 {faq}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
