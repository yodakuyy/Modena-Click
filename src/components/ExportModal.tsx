import React, { useState } from 'react';
import type { UserGuide } from '../utils/storage';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  Code, 
  FileText, 
  Sparkles,
  BookOpen
} from 'lucide-react';

interface ExportModalProps {
  guide: UserGuide;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ guide, onClose }) => {
  const [activeExportTab, setActiveExportTab] = useState<'md' | 'html' | 'pdf'>('md');
  const [copied, setCopied] = useState(false);

  const getMarkdownContent = () => {
    let md = `# ${guide.title}\n\n`;
    md += `> **Deskripsi**: ${guide.description}\n`;
    md += `> **Kategori**: ${guide.category} | **Dibuat Oleh**: ${guide.author} | **Tanggal**: ${new Date(guide.createdAt).toLocaleDateString('id-ID')}\n\n`;
    md += `---\n\n`;

    guide.steps.forEach((step, idx) => {
      md += `## Langkah ${idx + 1}: ${step.title}\n\n`;
      md += `${step.description}\n\n`;
      
      if (step.inputValue) {
        md += `* **Nilai Input**: \`${step.inputValue}\`\n`;
      }
      
      md += `* **Target Interaksi**: \`${step.targetElement}\` (Lokasi: X: ${step.xPercent}%, Y: ${step.yPercent}%)\n\n`;

      if (step.calloutType && step.calloutText) {
        const typeEmoji = step.calloutType === 'info' ? 'ℹ️' : step.calloutType === 'warning' ? '⚠️' : step.calloutType === 'tip' ? '💡' : '📌';
        md += `> ${typeEmoji} **Catatan**: ${step.calloutText}\n\n`;
      }

      md += `*Screenshot State: ${step.sandboxState ? `${step.sandboxState.tab.toUpperCase()} Tab` : 'External Application'}*\n\n`;
      md += `---\n\n`;
    });

    md += `*Panduan ini dibuat secara otomatis menggunakan aplikasi **By M-Click - Scribe Clone**.*`;
    return md;
  };

  const getHtmlContent = () => {
    let html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${guide.title}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #f8fafc;
      margin: 0;
      padding: 2rem 1rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 2.5rem;
      border-radius: 1.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    }
    h1 {
      color: #0f172a;
      font-size: 2.25rem;
      margin-bottom: 0.5rem;
    }
    .metadata {
      font-size: 0.875rem;
      color: #64748b;
      border-bottom: 2px solid #f1f5f9;
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .step-card {
      border: 1px solid #e2e8f0;
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      background-color: #fff;
    }
    .step-num {
      background: #6366f1;
      color: white;
      font-weight: bold;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      display: inline-block;
      margin-bottom: 1rem;
    }
    .step-title {
      font-size: 1.25rem;
      font-weight: bold;
      margin: 0 0 0.5rem;
      color: #0f172a;
    }
    .step-desc {
      font-size: 0.95rem;
      color: #475569;
      margin-bottom: 1rem;
    }
    .callout {
      border-left: 4px solid #6366f1;
      background: #f5f3ff;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-top: 1rem;
      font-size: 0.875rem;
    }
    .footer {
      text-align: center;
      margin-top: 3rem;
      font-size: 0.75rem;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${guide.title}</h1>
    <div class="metadata">
      Kategori: <strong>${guide.category}</strong> | Dibuat oleh: <strong>${guide.author}</strong> | Tanggal: ${new Date(guide.createdAt).toLocaleDateString('id-ID')}
      <p>${guide.description}</p>
    </div>
`;

    guide.steps.forEach((step, idx) => {
      html += `
    <div class="step-card">
      <span class="step-num">Langkah ${idx + 1}</span>
      <h3 class="step-title">${step.title}</h3>
      <p class="step-desc">${step.description}</p>
      
      <div style="font-size:0.8rem; color:#64748b;">
        Target: <code>${step.targetElement}</code>
        ${step.inputValue ? `| Input: <code>${step.inputValue}</code>` : ''}
        | Tab: <strong>${step.sandboxState ? step.sandboxState.tab.toUpperCase() : 'EXTERNAL'}</strong>
      </div>
`;
      if (step.calloutType && step.calloutText) {
        html += `
      <div class="callout">
        <strong>Catatan:</strong> ${step.calloutText}
      </div>
`;
      }
      html += `    </div>\n`;
    });

    html += `
    <div class="footer">
      Dibuat otomatis menggunakan aplikasi By M-Click - Scribe Clone
    </div>
  </div>
</body>
</html>`;
    return html;
  };

  const handleCopy = () => {
    const text = activeExportTab === 'md' ? getMarkdownContent() : getHtmlContent();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtmlFile = () => {
    const element = document.createElement("a");
    const file = new Blob([getHtmlContent()], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = `${guide.title.toLowerCase().replace(/\s+/g, '_')}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const triggerPrintWindow = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600/30 p-2 rounded-xl text-purple-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Ekspor Panduan Operasional</h3>
              <p className="text-xs text-slate-400">Pilih format output yang paling sesuai untuk tim Anda.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 bg-slate-850 hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-slate-850 gap-2 mb-6">
          <button
            onClick={() => setActiveExportTab('md')}
            className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeExportTab === 'md'
                ? 'text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Copy Markdown</span>
          </button>

          <button
            onClick={() => setActiveExportTab('html')}
            className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeExportTab === 'html'
                ? 'text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>Download HTML Document</span>
          </button>

          <button
            onClick={() => setActiveExportTab('pdf')}
            className={`pb-3 px-4 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeExportTab === 'pdf'
                ? 'text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Print to PDF</span>
          </button>
        </div>

        {/* Tab content */}
        <div className="space-y-4">
          
          {/* TAB 1: MARKDOWN PREVIEW */}
          {activeExportTab === 'md' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Sempurna untuk disalin langsung ke dokumentasi internal Wiki tim, Gitlab, Github, Notion, atau obsidian.
              </p>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 h-60 overflow-y-auto font-mono text-[10px] text-slate-300 leading-relaxed scrollbar">
                <pre className="whitespace-pre-wrap">{getMarkdownContent()}</pre>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCopy}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition cursor-pointer active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: HTML EXPORT */}
          {activeExportTab === 'html' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Unduh file HTML mandiri (self-contained) lengkap dengan struktur responsif. Bisa langsung dibuka di browser apa saja.
              </p>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 h-60 overflow-y-auto font-mono text-[10px] text-slate-300 leading-relaxed scrollbar">
                <pre className="whitespace-pre-wrap">{getHtmlContent()}</pre>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCopy}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied Source!' : 'Copy Source HTML'}</span>
                </button>
                <button
                  onClick={downloadHtmlFile}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .html File</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PRINT TO PDF */}
          {activeExportTab === 'pdf' && (
            <div className="bg-slate-950/40 border border-indigo-500/20 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <Printer className="w-10 h-10 text-indigo-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Cetak Berkas Fisik atau Simpan PDF</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Sistem telah diatur menggunakan stylesheet khusus cetak (@media print).</p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs text-slate-300 space-y-2">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Tips Mencetak yang Rapi:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>Klik tombol "Buka Dialog Cetak" di bawah.</li>
                  <li>Ubah tujuan (Destination) menjadi <strong>"Save as PDF"</strong> atau <strong>"Microsoft Print to PDF"</strong>.</li>
                  <li>Di menu More Settings, pastikan centang <strong>"Background graphics"</strong> aktif agar warna header dan panel termuat.</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={triggerPrintWindow}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition cursor-pointer active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Buka Dialog Cetak</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
