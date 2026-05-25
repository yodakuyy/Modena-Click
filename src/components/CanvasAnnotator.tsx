import React, { useRef } from 'react';
import type { GuideStep } from '../utils/storage';
import { 
  Sparkles, 
  Layers, 
  Users, 
  Settings, 
  FileText
} from 'lucide-react';

interface CanvasAnnotatorProps {
  step: GuideStep;
  onChangeCoordinates: (x: number, y: number) => void;
  readOnly?: boolean;
}

export const CanvasAnnotator: React.FC<CanvasAnnotatorProps> = ({ 
  step, 
  onChangeCoordinates,
  readOnly = false 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sandboxState = step.sandboxState || { tab: 'dashboard' };

  // Handle click on the visual mockup to reposition target coordinates
  const handleMockupClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPercent = Math.round((clickX / rect.width) * 100);
    const yPercent = Math.round((clickY / rect.height) * 100);

    onChangeCoordinates(xPercent, yPercent);
  };

  // Render dummy tickets for mockup
  const mockTickets = [
    { id: 'T-101', subject: 'Integrasi Payment Gateway Gagal', category: 'Billing', priority: 'high', status: 'Open' },
    { id: 'T-102', subject: 'Pertanyaan Mengenai SLA Kerja', category: 'Support', priority: 'low', status: 'In Progress' },
    { id: 'T-103', subject: 'Database Overload / Lambat', category: 'Technical', priority: 'high', status: 'Open' },
    { id: 'T-104', subject: 'Request Custom Export Report', category: 'Feedback', priority: 'medium', status: 'Closed' },
  ];

  const currentFormData = sandboxState.formData || {
    subject: 'Server Utama Mengalami Down / Overload',
    category: 'Technical',
    priority: 'high',
    description: 'Tolong eskalasi segera ke Devops, database overload.'
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          {readOnly ? 'Visual Step Representation' : 'Klik di mana saja pada gambar untuk memindahkan Titik Klik'}
        </span>
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
          X: {step.xPercent}% | Y: {step.yPercent}%
        </span>
      </div>

      {/* Vector Mockup Container */}
      <div 
        ref={containerRef}
        onClick={handleMockupClick}
        className={`relative w-full h-[360px] bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden select-none shadow-md ${
          readOnly ? '' : 'cursor-crosshair hover:border-indigo-500/60 dark:hover:border-indigo-400/60'
        } transition`}
      >
        
        {step.customScreenshot ? (
          <img 
            src={step.customScreenshot} 
            alt={step.title}
            className="w-full h-full object-contain bg-slate-950"
            draggable={false}
          />
        ) : (
          /* Mock Screen Content (Matches step.sandboxState.tab) */
          <div className="absolute inset-0 flex flex-col w-full h-full text-[10px] text-slate-300">
            
            {/* Mock Header */}
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800/80 flex justify-between items-center text-white">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="bg-indigo-600 text-white font-extrabold text-[9px] px-1 rounded">ZT</span>
                <span>ZetaCRM Client</span>
              </div>
              <div className="flex items-center gap-2 text-[8px] text-slate-400">
                <span className="bg-slate-800 px-2 py-0.5 rounded-full">yogi.fermana@company.com</span>
                <div className="w-5 h-5 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-[8px]">YF</div>
              </div>
            </div>

          {/* Mock Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Mock Sidebar */}
            <div className="w-28 bg-slate-950/70 border-r border-slate-800/50 p-2 space-y-1">
              <div className={`px-2 py-1.5 rounded-lg flex items-center gap-1.5 ${sandboxState.tab === 'dashboard' ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-900/40' : 'opacity-40'}`}>
                <Layers className="w-3 h-3" />
                <span>Dashboard</span>
              </div>
              <div className={`px-2 py-1.5 rounded-lg flex items-center gap-1.5 ${sandboxState.tab === 'tickets' ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-900/40' : 'opacity-40'}`}>
                <FileText className="w-3 h-3" />
                <span>Tickets</span>
              </div>
              <div className={`px-2 py-1.5 rounded-lg flex items-center gap-1.5 ${sandboxState.tab === 'customers' ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-900/40' : 'opacity-40'}`}>
                <Users className="w-3 h-3" />
                <span>Customers</span>
              </div>
              <div className={`px-2 py-1.5 rounded-lg flex items-center gap-1.5 ${sandboxState.tab === 'settings' ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-900/40' : 'opacity-40'}`}>
                <Settings className="w-3 h-3" />
                <span>Settings</span>
              </div>
            </div>

            {/* Mock Sub-tab canvas */}
            <div className="flex-1 bg-slate-900 p-4 overflow-hidden relative">
              
              {/* Dashboard Content */}
              {sandboxState.tab === 'dashboard' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-white text-xs">Overview Dashboard</h5>
                    <span className="text-[7px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">Live Data</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-[7px] text-slate-500 uppercase font-bold">SLA Perf</span>
                      <p className="text-xs font-black text-emerald-400 mt-1">98.4%</p>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-[7px] text-slate-500 uppercase font-bold">Active SLA</span>
                      <p className="text-xs font-black text-rose-400 mt-1">14 Tickets</p>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-[7px] text-slate-500 uppercase font-bold">Completed</span>
                      <p className="text-xs font-black text-indigo-400 mt-1">9 Today</p>
                    </div>
                  </div>

                  {/* Chart Line Mockup */}
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80 h-16 flex items-end justify-between px-2 pt-4">
                    <div className="bg-indigo-600/40 w-4 h-6 rounded-t"></div>
                    <div className="bg-indigo-600/40 w-4 h-10 rounded-t"></div>
                    <div className="bg-indigo-600/40 w-4 h-8 rounded-t"></div>
                    <div className="bg-indigo-600/40 w-4 h-12 rounded-t"></div>
                  </div>
                </div>
              )}

              {/* Tickets Content */}
              {sandboxState.tab === 'tickets' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-white text-xs">Service Tickets Queue</h5>
                      <p className="text-[8px] text-slate-500">Kelola SLA pengerjaan tiket disini.</p>
                    </div>
                    <button className="bg-indigo-600 text-white font-bold px-2 py-1 rounded text-[8px] flex items-center gap-0.5">
                      + Create Ticket
                    </button>
                  </div>

                  <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80">
                    <table className="w-full text-left text-[8px]">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-500">
                          <th className="p-2">ID</th>
                          <th className="p-2">Subject</th>
                          <th className="p-2">Priority</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockTickets.map(t => (
                          <tr key={t.id} className="border-b border-slate-800/40 hover:bg-slate-900/20">
                            <td className="p-2 font-mono text-slate-400">{t.id}</td>
                            <td className="p-2 font-semibold text-white truncate max-w-[80px]">{t.subject}</td>
                            <td className="p-2 text-rose-400 uppercase font-bold">{t.priority}</td>
                            <td className="p-2">{t.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Customers Content */}
              {sandboxState.tab === 'customers' && (
                <div className="space-y-3">
                  <h5 className="font-bold text-white text-xs">Clients Database</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-4 h-4 rounded-full bg-rose-600/30 text-rose-400 flex items-center justify-center font-bold text-[8px] mb-1">T</div>
                      <h6 className="font-bold text-white text-[9px]">PT Telkom Indonesia</h6>
                      <p className="text-[7px] text-slate-500">Enterprise SLA Tier</p>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-4 h-4 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-[8px] mb-1">G</div>
                      <h6 className="font-bold text-white text-[9px]">Gojek Indonesia</h6>
                      <p className="text-[7px] text-slate-500">Enterprise SLA Tier</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Content */}
              {sandboxState.tab === 'settings' && (
                <div className="space-y-3">
                  <h5 className="font-bold text-white text-xs">SLA Config Settings</h5>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3 text-[8px]">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>High SLA (Hours)</span>
                        <span className="text-indigo-400">2 Hours</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded relative">
                        <div className="w-1/4 h-full bg-indigo-500 rounded"></div>
                        <div className="absolute w-2 h-2 rounded-full bg-white top-1/2 -translate-y-1/2 left-1/4 shadow border border-slate-900"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Medium SLA (Hours)</span>
                        <span className="text-indigo-400">6 Hours</span>
                      </div>
                      <div className="h-1 bg-slate-800 rounded relative">
                        <div className="w-1/2 h-full bg-indigo-500 rounded"></div>
                        <div className="absolute w-2 h-2 rounded-full bg-white top-1/2 -translate-y-1/2 left-1/2 shadow border border-slate-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* CRM Modal Popup Mockup if open */}
          {sandboxState.modalOpen && (
            <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center p-3 z-30">
              <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-[240px] shadow-2xl overflow-hidden text-[8px]">
                <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 flex justify-between items-center text-white">
                  <span className="font-bold uppercase tracking-wider text-indigo-400">Buat Tiket Baru</span>
                  <span>✕</span>
                </div>

                <div className="p-3 space-y-2 text-[7px]">
                  <div>
                    <label className="block text-slate-500 mb-0.5">Subject</label>
                    <div className="w-full bg-slate-950 border border-slate-800 text-white rounded px-1.5 py-0.5 truncate">
                      {currentFormData.subject || 'Server Down'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-500 mb-0.5">Category</label>
                      <div className="w-full bg-slate-950 border border-slate-800 text-white rounded px-1.5 py-0.5">
                        {currentFormData.category || 'Technical'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-0.5">Priority</label>
                      <div className="w-full bg-slate-950 border border-slate-800 text-rose-400 font-bold rounded px-1.5 py-0.5">
                        {(currentFormData.priority || 'medium').toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-1 pt-1.5 border-t border-slate-800">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded cursor-pointer">Cancel</span>
                    <span className="bg-indigo-600 text-white px-2 py-0.5 rounded cursor-pointer">Submit</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

        {/* Pulsating Red Target click pointer overlay */}
        <div 
          className="absolute w-8 h-8 rounded-full border-2 border-rose-500 bg-rose-500/20 text-white pointer-events-none flex items-center justify-center font-black text-[9px] shadow-lg shadow-rose-500/30 pulsate-target"
          style={{ 
            left: `${step.xPercent}%`, 
            top: `${step.yPercent}%`
          }}
        >
          {/* Target Center Dot */}
          <div className="w-2 h-2 rounded-full bg-rose-500"></div>
        </div>

      </div>
    </div>
  );
};
