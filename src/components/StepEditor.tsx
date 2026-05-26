import React, { useState, useEffect, useRef } from 'react';
import type { UserGuide, GuideStep } from '../utils/storage';
import { CanvasAnnotator } from './CanvasAnnotator';
import Swal from 'sweetalert2';
import { 
  ArrowLeft, 
  Trash2, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Eye,
  Download,
  Save,
  Sparkles,
  Heading,
  Upload
} from 'lucide-react';

interface StepEditorProps {
  guide: UserGuide;
  onSave: (updatedGuide: UserGuide) => void;
  onBack: () => void;
  onPlay: (updatedGuide: UserGuide) => void;
  onExport: (updatedGuide: UserGuide) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  categories: string[];
}

export const StepEditor: React.FC<StepEditorProps> = ({
  guide,
  onSave,
  onBack,
  onPlay,
  onExport,
  darkMode,
  setDarkMode,
  categories
}) => {
  const [editedGuide, setEditedGuide] = useState<UserGuide>({ ...guide });
  const [selectedStepId, setSelectedStepId] = useState<string>(
    guide.steps.length > 0 ? guide.steps[0].id : ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global Clipboard paste handler
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Img = event.target?.result as string;
            if (!base64Img) return;

            const newStep: GuideStep = {
              id: `step-clipboard-${Date.now()}`,
              title: 'Langkah Clipboard Baru',
              description: 'Langkah ini diunggah dengan menyalin tangkapan layar dari clipboard.',
              actionType: 'click',
              targetElement: 'Area Klik',
              xPercent: 50,
              yPercent: 50,
              customScreenshot: base64Img
            };

            setEditedGuide(prev => ({
              ...prev,
              steps: [...prev.steps, newStep]
            }));
            setSelectedStepId(newStep.id);

            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Screenshot ditempel dari clipboard!',
              showConfirmButton: false,
              timer: 2000,
              background: darkMode ? '#0f172a' : '#ffffff',
              color: darkMode ? '#f3f4f6' : '#1f2937',
            });
          };
          reader.readAsDataURL(file);
          e.preventDefault();
          break;
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => {
      window.removeEventListener('paste', handleGlobalPaste);
    };
  }, [darkMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Img = event.target?.result as string;
      if (!base64Img) return;

      const newStep: GuideStep = {
        id: `step-upload-${Date.now()}`,
        title: 'Langkah Unggah Baru',
        description: 'Langkah ini diunggah dari berkas lokal komputer Anda.',
        actionType: 'click',
        targetElement: 'Area Klik',
        xPercent: 50,
        yPercent: 50,
        customScreenshot: base64Img
      };

      setEditedGuide(prev => ({
        ...prev,
        steps: [...prev.steps, newStep]
      }));
      setSelectedStepId(newStep.id);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Screenshot berhasil diunggah!',
        showConfirmButton: false,
        timer: 2000,
        background: darkMode ? '#0f172a' : '#ffffff',
        color: darkMode ? '#f3f4f6' : '#1f2937',
      });
    };
    reader.readAsDataURL(file);
  };

  // Active step details
  const activeStepIndex = editedGuide.steps.findIndex(s => s.id === selectedStepId);
  const activeStep = activeStepIndex >= 0 ? editedGuide.steps[activeStepIndex] : null;

  const updateGuideMetadata = (key: keyof UserGuide, value: any) => {
    setEditedGuide(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStepValueChange = (stepId: string, key: keyof GuideStep, value: any) => {
    setEditedGuide(prev => {
      const updatedSteps = prev.steps.map(s => {
        if (s.id === stepId) {
          return { ...s, [key]: value };
        }
        return s;
      });
      return { ...prev, steps: updatedSteps };
    });
  };

  const deleteStep = (stepId: string) => {
    setEditedGuide(prev => {
      const filtered = prev.steps.filter(s => s.id !== stepId);
      // Auto-select another step if the current active is deleted
      if (selectedStepId === stepId && filtered.length > 0) {
        setSelectedStepId(filtered[0].id);
      }
      return { ...prev, steps: filtered };
    });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= editedGuide.steps.length) return;

    setEditedGuide(prev => {
      const updated = [...prev.steps];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, steps: updated };
    });
  };

  const addNewManualStep = () => {
    const newStep: GuideStep = {
      id: `step-manual-${Date.now()}`,
      title: 'Langkah Manual Baru',
      description: 'Deskripsikan langkah bantuan baru di sini secara mendetail.',
      actionType: 'click',
      targetElement: 'Tombol Contoh',
      xPercent: 50,
      yPercent: 50,
      sandboxState: {
        tab: 'dashboard'
      }
    };

    setEditedGuide(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
    setSelectedStepId(newStep.id);
  };

  const triggerSave = () => {
    onSave(editedGuide);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col">
      {/* Editor Topbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onBack}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Editor Ruang Kerja</span>
              <span>/</span>
              <span className="font-semibold text-indigo-500">{editedGuide.category}</span>
            </div>
            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 line-clamp-1">
              {editedGuide.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          <button
            onClick={() => onPlay(editedGuide)}
            className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white text-indigo-600 dark:text-indigo-400 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Player</span>
          </button>

          <button
            onClick={() => onExport(editedGuide)}
            className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white text-purple-600 dark:text-purple-400 font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={triggerSave}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/25 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Guide</span>
          </button>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Step Outline list */}
        <aside className="w-full lg:w-80 bg-white dark:bg-slate-900/60 border-r border-slate-200 dark:border-slate-800/80 flex flex-col h-[400px] lg:h-auto">
          {/* Metadata Controls */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Judul Guide</label>
              <input
                type="text"
                value={editedGuide.title}
                onChange={(e) => updateGuideMetadata('title', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Kategori</label>
                <select
                  value={editedGuide.category}
                  onChange={(e) => updateGuideMetadata('category', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Pembuat</label>
                <input
                  type="text"
                  value={editedGuide.author}
                  onChange={(e) => updateGuideMetadata('author', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900/30 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Langkah-langkah ({editedGuide.steps.length})</span>
            <div className="flex gap-1.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer transition active:scale-95"
                title="Unggah screenshot dari berkas komputer"
              >
                <Upload className="w-3.5 h-3.5 text-purple-400" />
                <span>Upload</span>
              </button>
              <button
                onClick={addNewManualStep}
                className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-indigo-100 dark:border-indigo-900/40 cursor-pointer transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah
              </button>
            </div>
          </div>

          <div className="p-2.5 px-4 bg-indigo-500/10 border-b border-slate-200 dark:border-slate-800 text-[9px] text-indigo-500 dark:text-indigo-300 font-medium">
            💡 <strong>Tip:</strong> Tekan <strong>Ctrl+V</strong> di mana saja untuk menempel screenshot langsung dari clipboard!
          </div>

          {/* Steps Timeline Stack */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {editedGuide.steps.map((step, idx) => (
              <div
                key={step.id}
                onClick={() => setSelectedStepId(step.id)}
                className={`group border rounded-2xl p-3.5 cursor-pointer transition flex justify-between items-start gap-2 relative ${
                  selectedStepId === step.id
                    ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex gap-2">
                  {/* Step Num badge */}
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight line-clamp-1">
                      {step.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px] mt-0.5">
                      {step.targetElement || 'Langkah Kustom'}
                    </p>
                  </div>
                </div>

                {/* Move & Delete Quick bar */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition absolute right-2 top-2 bg-white dark:bg-slate-900 shadow-sm p-0.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveStep(idx, 'up'); }}
                    disabled={idx === 0}
                    className="p-1 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 rounded cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveStep(idx, 'down'); }}
                    disabled={idx === editedGuide.steps.length - 1}
                    className="p-1 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 rounded cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteStep(step.id); }}
                    className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Side: Step detailing panel */}
        <main className="flex-1 bg-slate-50 dark:bg-slate-950/20 p-6 overflow-y-auto">
          {activeStep ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Step Editor Panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
                <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900/40 uppercase tracking-widest w-fit block mb-4">
                  Step {activeStepIndex + 1}
                </span>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 font-bold uppercase mb-1.5 flex items-center gap-1">
                      <Heading className="w-3.5 h-3.5" /> Judul Langkah
                    </label>
                    <input
                      type="text"
                      value={activeStep.title}
                      onChange={(e) => handleStepValueChange(activeStep.id, 'title', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 font-bold uppercase mb-1.5">Deskripsi Panduan</label>
                    <textarea
                      value={activeStep.description}
                      onChange={(e) => handleStepValueChange(activeStep.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 font-bold uppercase mb-1.5">Action Target</label>
                      <input
                        type="text"
                        value={activeStep.targetElement}
                        onChange={(e) => handleStepValueChange(activeStep.id, 'targetElement', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 font-bold uppercase mb-1.5">Captured Input Value</label>
                      <input
                        type="text"
                        value={activeStep.inputValue || ''}
                        placeholder="(Kosong / Tidak ada input)"
                        onChange={(e) => handleStepValueChange(activeStep.id, 'inputValue', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Screenshot Visualizer with clickable dot */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
                <CanvasAnnotator
                  step={activeStep}
                  onChangeCoordinates={(x, y) => {
                    handleStepValueChange(activeStep.id, 'xPercent', x);
                    handleStepValueChange(activeStep.id, 'yPercent', y);
                  }}
                />
              </div>

              {/* Callouts Addition Panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
                <h4 className="text-sm font-bold text-white mb-3">Tambahkan Callout Pendukung (Scribe Style)</h4>
                
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {[
                    { type: null, label: 'None', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
                    { type: 'info', label: 'Info', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' },
                    { type: 'warning', label: 'Warning', color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' },
                    { type: 'tip', label: 'Tip', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' },
                    { type: 'success', label: 'Key Note', color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400' }
                  ].map(c => (
                    <button
                      key={c.type || 'none'}
                      onClick={() => handleStepValueChange(activeStep.id, 'calloutType', c.type)}
                      className={`py-2 rounded-xl text-xs font-semibold cursor-pointer border text-center transition ${
                        activeStep.calloutType === c.type
                          ? 'border-indigo-500 scale-[1.03] shadow'
                          : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${c.color}`}>{c.label}</span>
                    </button>
                  ))}
                </div>

                {activeStep.calloutType && (
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1.5">Rincian Teks Catatan</label>
                    <input
                      type="text"
                      placeholder="Masukkan catatan pendukung langkah..."
                      value={activeStep.calloutText || ''}
                      onChange={(e) => handleStepValueChange(activeStep.id, 'calloutText', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div>
                <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h4 className="text-lg font-bold">Langkah Panduan Kosong</h4>
                <p className="text-xs text-slate-400 mt-1">Tambahkan langkah manual atau silakan rekam ulang guide di Sandbox.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
