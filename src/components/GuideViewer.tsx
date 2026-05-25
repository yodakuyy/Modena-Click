import React, { useState } from 'react';
import type { UserGuide } from '../utils/storage';
import { CanvasAnnotator } from './CanvasAnnotator';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Layers, 
  Info, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2,
  Maximize2
} from 'lucide-react';

interface GuideViewerProps {
  guide: UserGuide;
  onClose: () => void;
}

export const GuideViewer: React.FC<GuideViewerProps> = ({ guide, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  const stepsCount = guide.steps.length;
  const currentStep = stepsCount > 0 ? guide.steps[currentIdx] : null;
  const progressPercent = Math.round(((currentIdx + 1) / stepsCount) * 100);

  const nextStep = () => {
    if (currentIdx < stepsCount - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const prevStep = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Fullscreen Player Header */}
      <header className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-4 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <div>
            <h1 className="text-sm font-black tracking-wide text-white uppercase flex items-center gap-1.5">
              <span>PLAYING GUIDE:</span> 
              <span className="text-indigo-400 normal-case font-bold">{guide.title}</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Bimbingan Interaktif Langkah demi Langkah</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress Tracker Pill */}
          <span className="bg-slate-800 border border-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-full text-[10px] tracking-wide flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Langkah {currentIdx + 1} dari {stepsCount} ({progressPercent}%)</span>
          </span>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-400 rounded-xl transition cursor-pointer"
            title="Keluar Presentasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Fullscreen Player Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-8 items-center justify-center overflow-hidden">
        {currentStep ? (
          <>
            {/* LEFT SIDE: Instructions and Callout */}
            <div className="w-full lg:w-96 flex flex-col justify-center space-y-6">
              {/* Step indicator Card */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between min-h-[220px]">
                <div>
                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/35 text-[10px] font-extrabold px-3 py-1 rounded-full w-fit tracking-wider uppercase mb-4 block">
                    Langkah {currentIdx + 1}
                  </span>

                  <h3 className="text-xl font-bold text-white tracking-tight mb-3">
                    {currentStep.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentStep.description}
                  </p>
                </div>

                {currentStep.inputValue && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-[10px]">
                    <span className="text-slate-400 font-bold">Input Value:</span>
                    <code className="bg-slate-950 px-2 py-0.5 rounded text-indigo-400 font-mono font-bold border border-slate-800/80">
                      {currentStep.inputValue}
                    </code>
                  </div>
                )}
              </div>

              {/* Step Scribe-style Callout if available */}
              {currentStep.calloutType && currentStep.calloutText && (
                <div className={`p-5 rounded-2xl border flex gap-3 text-xs animate-in slide-in-from-bottom-2 duration-300 ${
                  currentStep.calloutType === 'info'
                    ? 'bg-blue-950/30 border-blue-900/40 text-blue-300'
                    : currentStep.calloutType === 'warning'
                    ? 'bg-amber-950/30 border-amber-900/40 text-amber-300'
                    : currentStep.calloutType === 'tip'
                    ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-300'
                    : 'bg-purple-950/30 border-purple-900/40 text-purple-300'
                }`}>
                  <div className="mt-0.5">
                    {currentStep.calloutType === 'info' && <Info className="w-5 h-5 text-blue-400" />}
                    {currentStep.calloutType === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                    {currentStep.calloutType === 'tip' && <Lightbulb className="w-5 h-5 text-emerald-400" />}
                    {currentStep.calloutType === 'success' && <CheckCircle2 className="w-5 h-5 text-purple-400" />}
                  </div>
                  <div>
                    <p className="font-bold text-[10px] uppercase tracking-wider mb-1">
                      {currentStep.calloutType === 'info' && 'Informasi Penting'}
                      {currentStep.calloutType === 'warning' && 'Perhatian / Warning'}
                      {currentStep.calloutType === 'tip' && 'Tips & Trick'}
                      {currentStep.calloutType === 'success' && 'Key Note'}
                    </p>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      {currentStep.calloutText}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDE: Realtime Dynamic Screenshot preview */}
            <div className="flex-1 w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl relative flex items-center justify-center">
              <CanvasAnnotator 
                step={currentStep} 
                onChangeCoordinates={() => {}} 
                readOnly={true} 
              />
              <div className="absolute top-4 right-4 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800 text-[9px] text-slate-400 flex items-center gap-1.5">
                <Maximize2 className="w-3 h-3 text-indigo-400" />
                <span>State: <strong>{currentStep.sandboxState ? currentStep.sandboxState.tab.toUpperCase() : 'EXTERNAL'}</strong></span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h4 className="text-lg font-bold">Guide ini tidak memiliki langkah</h4>
          </div>
        )}
      </main>

      {/* Fullscreen Player Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 px-6 py-5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          {/* Stepper Dot Indicators */}
          <div className="hidden sm:flex gap-1.5">
            {guide.steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIdx ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-700'
                }`}
              ></span>
            ))}
          </div>

          {currentIdx < stepsCount - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/35 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Selesai Membaca</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};
