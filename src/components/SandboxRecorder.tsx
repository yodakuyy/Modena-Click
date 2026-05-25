import React, { useState, useRef } from 'react';
import type { GuideStep } from '../utils/storage';
import Swal from 'sweetalert2';
import { 
  Circle, 
  Pause, 
  Play,
  Check, 
  X, 
  Plus, 
  Layers, 
  HelpCircle, 
  Settings, 
  Users, 
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  ChevronRight,
  Sparkles,
  Upload,
  Video,
  Film,
  ArrowLeft,
  Trash2
} from 'lucide-react';

interface SandboxRecorderProps {
  onSave: (title: string, desc: string, category: string, tags: string[], steps: GuideStep[]) => void;
  onCancel: () => void;
}

export const SandboxRecorder: React.FC<SandboxRecorderProps> = ({ onSave, onCancel }) => {
  // Mode selection state: null, 'sandbox', 'video'
  const [recorderMode, setRecorderMode] = useState<'sandbox' | 'video' | null>(null);

  // General Recorder states
  const [isRecording, setIsRecording] = useState(false);
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [guideTitle, setGuideTitle] = useState('');
  const [guideDesc, setGuideDesc] = useState('');
  const [guideCategory, setGuideCategory] = useState('IT Operations');
  const [guideTagsText, setGuideTagsText] = useState('OfficeApp, Guide');

  // Video Mode specific states
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUploaderRef = useRef<HTMLInputElement>(null);

  // Simulator Mode specific states
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, tickets, customers, settings
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'Technical',
    priority: 'medium',
    description: ''
  });

  const [tickets, setTickets] = useState([
    { id: 'T-101', subject: 'Integrasi Payment Gateway Gagal', category: 'Billing', priority: 'high', status: 'Open', date: 'Hari ini, 10:15' },
    { id: 'T-102', subject: 'Pertanyaan Mengenai SLA Kerja', category: 'Support', priority: 'low', status: 'In Progress', date: 'Hari ini, 09:30' },
    { id: 'T-103', subject: 'Database Overload / Lambat', category: 'Technical', priority: 'high', status: 'Open', date: 'Kemarin' },
    { id: 'T-104', subject: 'Request Custom Export Report', category: 'Feedback', priority: 'medium', status: 'Closed', date: 'Kemarin' },
  ]);

  // Click ripple effects state
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const sandboxRef = useRef<HTMLDivElement>(null);

  // Play a beautiful, synthetic retro-futuristic audio chirp on recording captures!
  const playCaptureSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, audioCtx.currentTime); // Pitch
      osc.frequency.exponentialRampToValueAtTime(1300, audioCtx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (err) {
      console.log('Audio disabled or blocked by browser policy');
    }
  };

  // Add click ripple inside the sandbox bounds
  const addRipple = (x: number, y: number) => {
    const id = Date.now() + Math.random();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  };

  // ==========================================
  // 1. VIDEO SNAPPER MODE LOGIC
  // ==========================================
  
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoPlaying(false);
    setVideoCurrentTime(0);
    setSteps([]);
  };

  const togglePlayVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (videoPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setVideoPlaying(!videoPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setVideoCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setVideoCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const captureVideoFrame = () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Img = canvas.toDataURL('image/jpeg', 0.85);

      playCaptureSound();

      const newStep: GuideStep = {
        id: `step-video-${Date.now()}-${steps.length + 1}`,
        title: `Langkah ke-${steps.length + 1} dari Video`,
        description: `Tindakan pengerjaan aplikasi kantor pada detik ke-${Math.round(video.currentTime)}.`,
        actionType: 'click',
        targetElement: 'Area Klik',
        xPercent: 50,
        yPercent: 50,
        customScreenshot: base64Img
      };

      setSteps(prev => [...prev, newStep]);

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Frame berhasil disimpan sebagai langkah!',
        showConfirmButton: false,
        timer: 1500,
        background: '#0f172a',
        color: '#f3f4f6'
      });
    } catch (err) {
      console.error('Video capture failed', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal mengambil frame',
        text: 'Format video ini mungkin terproteksi atau tidak disupport oleh browser.',
        background: '#0f172a',
        color: '#f3f4f6'
      });
    }
  };

  const deleteSnappedStep = (id: string) => {
    setSteps(prev => prev.filter(s => s.id !== id));
  };

  // ==========================================
  // 2. SIMULATOR SANDBOX MODE LOGIC
  // ==========================================

  const handleInteraction = (
    e: React.MouseEvent<HTMLElement>, 
    actionType: 'click' | 'input' | 'select' | 'nav', 
    targetElement: string, 
    valueOverride?: string
  ) => {
    if (sandboxRef.current) {
      const rect = sandboxRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      addRipple(clickX, clickY);
      
      if (isRecording) {
        playCaptureSound();

        const xPercent = Math.round((clickX / rect.width) * 100);
        const yPercent = Math.round((clickY / rect.height) * 100);

        let title = '';
        let description = '';

        if (actionType === 'nav') {
          title = `Navigasi ke Tab ${targetElement}`;
          description = `Klik pada menu tab sidebar "${targetElement}" untuk beralih halaman panel aplikasi.`;
        } else if (actionType === 'click') {
          title = `Klik ${targetElement}`;
          description = `Tekan tombol "${targetElement}" untuk melanjutkan proses.`;
        } else if (actionType === 'input') {
          title = `Isi input ${targetElement}`;
          description = `Ketik nilai "${valueOverride || ''}" pada kolom input "${targetElement}".`;
        } else if (actionType === 'select') {
          title = `Ubah dropdown ${targetElement}`;
          description = `Pilih opsi "${valueOverride || ''}" dari dropdown menu "${targetElement}".`;
        }

        const newStep: GuideStep = {
          id: `step-${Date.now()}-${steps.length + 1}`,
          title,
          description,
          actionType,
          targetElement,
          xPercent,
          yPercent,
          inputValue: valueOverride,
          sandboxState: {
            tab: activeTab,
            modalOpen: modalOpen,
            formData: { ...formData },
            selectedTicketId: selectedTicketId
          }
        };

        setSteps(prev => [...prev, newStep]);
      }
    }
  };

  const recordInputField = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, fieldName: string) => {
    if (!isRecording) return;
    const value = e.target.value;
    if (!value) return;

    const targetText = fieldName === 'subject' ? 'Subject' : 'Description';
    const rect = e.target.getBoundingClientRect();
    const sandboxRect = sandboxRef.current?.getBoundingClientRect();
    
    if (sandboxRect) {
      const clickX = (rect.left + rect.width / 2) - sandboxRect.left;
      const clickY = (rect.top + rect.height / 2) - sandboxRect.top;
      const xPercent = Math.round((clickX / sandboxRect.width) * 100);
      const yPercent = Math.round((clickY / sandboxRect.height) * 100);

      const newStep: GuideStep = {
        id: `step-${Date.now()}-${steps.length + 1}`,
        title: `Ketik "${value}" di ${targetText}`,
        description: `Masukkan detail teks deskripsi ke dalam field "${targetText}".`,
        actionType: 'input',
        targetElement: `Kolom Input "${targetText}"`,
        inputValue: value,
        xPercent,
        yPercent,
        sandboxState: {
          tab: activeTab,
          modalOpen: modalOpen,
          formData: { ...formData, [fieldName]: value }
        }
      };

      setSteps(prev => [...prev, newStep]);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setSteps([]);
    if (sandboxRef.current) {
      const initialStep: GuideStep = {
        id: `step-start`,
        title: 'Buka Halaman Dashboard Utama',
        description: 'Buka aplikasi ZetaCRM dan pastikan Anda berada di halaman ringkasan kerja.',
        actionType: 'nav',
        targetElement: 'Dashboard Utama',
        xPercent: 50,
        yPercent: 50,
        sandboxState: {
          tab: 'dashboard',
          modalOpen: false
        }
      };
      setSteps([initialStep]);
    }
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject) return;

    const newT = {
      id: `T-${100 + tickets.length + 1}`,
      subject: formData.subject,
      category: formData.category,
      priority: formData.priority,
      status: 'Open',
      date: 'Baru Saja'
    };
    setTickets(prev => [newT, ...prev]);
    setModalOpen(false);

    setFormData({
      subject: '',
      category: 'Technical',
      priority: 'medium',
      description: ''
    });
  };

  const triggerSaveGuide = () => {
    if (steps.length === 0) return;
    
    if (recorderMode === 'video') {
      setGuideTitle(`Panduan Aplikasi Kantor - ${new Date().toLocaleDateString('id-ID')}`);
      setGuideDesc('Panduan operasional eksternal yang diunggah dan disnap melalui video tim.');
    } else {
      setGuideTitle(`Panduan Menggunakan ZetaCRM - ${new Date().toLocaleDateString('id-ID')}`);
      setGuideDesc('Panduan operasional otomatis yang direkam melalui Interactive Sandbox.');
    }
    
    setShowSaveDialog(true);
  };

  const handleFinalSave = () => {
    const parsedTags = guideTagsText.split(',').map(t => t.trim()).filter(Boolean);
    onSave(guideTitle, guideDesc, guideCategory, parsedTags, steps);
    setShowSaveDialog(false);
  };

  // ==========================================
  // 3. UI RENDERING LOGIC
  // ==========================================

  // MODE CHOOSER (INITIAL STATE)
  if (recorderMode === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100 font-sans">
        <div className="max-w-3xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-300">
          <div className="space-y-3">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full border border-indigo-500/35 uppercase tracking-widest flex items-center gap-1.5 w-fit mx-auto">
              <Sparkles className="w-4 h-4 animate-pulse" /> Scribe Builder Suite
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Pilih Mode Perekaman Guide
            </h1>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Apakah lo mau merekam di Sandbox interaktif bawaan kita, atau mau mendokumentasikan aplikasi kantor lo sendiri lewat rekaman video?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Sandbox Option Card */}
            <div 
              onClick={() => {
                setRecorderMode('sandbox');
                setIsRecording(true);
                // Seed initial step
                setSteps([{
                  id: `step-start`,
                  title: 'Buka Halaman Dashboard Utama',
                  description: 'Buka aplikasi ZetaCRM dan pastikan Anda berada di halaman ringkasan kerja.',
                  actionType: 'nav',
                  targetElement: 'Dashboard Utama',
                  xPercent: 50,
                  yPercent: 50,
                  sandboxState: {
                    tab: 'dashboard',
                    modalOpen: false
                  }
                }]);
              }}
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-950/20 hover:-translate-y-1.5 flex flex-col justify-between h-64 group"
            >
              <div className="space-y-4">
                <div className="bg-indigo-600/20 text-indigo-400 p-3 rounded-2xl w-fit group-hover:scale-110 transition">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition">ZetaCRM Simulator</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Mulai merekam otomatis di aplikasi CRM dummy interaktif bawaan. Bagus buat demo cepat, latihan tim, dan eksperimen fitur.
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1">
                Jalankan Sandbox Bawaan <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Video Snapper Option Card */}
            <div 
              onClick={() => {
                setRecorderMode('video');
                setIsRecording(true);
                setSteps([]);
              }}
              className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-6 text-left cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-purple-950/20 hover:-translate-y-1.5 flex flex-col justify-between h-64 group"
            >
              <div className="space-y-4">
                <div className="bg-purple-600/20 text-purple-400 p-3 rounded-2xl w-fit group-hover:scale-110 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition">Rekam Aplikasi Kantor Lain</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Unggah file rekaman video aplikasi kantor lo sendiri (.mp4/.webm). Scrub timeline videonya, lalu **ambil tangkapan screenshot langkah secara instan!**
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1">
                Mulai Unggah Rekaman Video <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-300 underline pt-4 cursor-pointer"
          >
            Kembali ke Dashboard Utama
          </button>
        </div>
      </div>
    );
  }

  // VIEW 1: VIDEO SNAPPER RECORDING DASHBOARD
  if (recorderMode === 'video') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 font-sans">
        
        {/* Floating Topbar */}
        <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 shadow-xl">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setRecorderMode(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-white font-bold text-sm tracking-wide flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-purple-400" />
                  <span>EXTERNAL VIDEO CAPTURE</span>
                </h2>
                <p className="text-xs text-slate-400">Unggah rekaman mp4 lo, geser timeline, lalu klik Capture Frame untuk mencatat langkah!</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="bg-slate-800 border border-slate-700 text-slate-300 font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>{steps.length} Steps Captured</span>
              </span>

              <button
                onClick={triggerSaveGuide}
                disabled={steps.length === 0}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 disabled:pointer-events-none text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer transition active:scale-95"
              >
                <Check className="w-4 h-4" /> Stop & Finish
              </button>

              <button
                onClick={onCancel}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 p-2.5 rounded-xl text-xs cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Workspace content split: Left player, Right sidebar timeline list */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
          
          {/* Left panel uploader & player */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-center items-center min-h-[480px] shadow-2xl relative">
            <input 
              type="file" 
              ref={videoUploaderRef} 
              onChange={handleVideoUpload} 
              accept="video/mp4, video/webm" 
              className="hidden" 
            />

            {!videoUrl ? (
              <div 
                onClick={() => videoUploaderRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-purple-500/60 rounded-3xl p-16 text-center max-w-md w-full cursor-pointer transition bg-slate-950/40 hover:bg-slate-900/20 space-y-4"
              >
                <div className="bg-purple-500/10 text-purple-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                  <Video className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Unggah Rekaman Layar Kantor</h3>
                  <p className="text-xs text-slate-400 mt-1leading-relaxed">
                    Klik di sini untuk mengunggah file video rekaman langkah aplikasi kantor Anda (.mp4 atau .webm).
                  </p>
                </div>
                <span className="inline-block text-[10px] bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider">
                  Pilih File Video
                </span>
              </div>
            ) : (
              <div className="w-full flex flex-col justify-between h-full space-y-6">
                {/* Visual Video */}
                <div className="relative bg-black border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex-1 flex items-center justify-center">
                  <video 
                    ref={videoRef}
                    src={videoUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    className="w-full max-h-[380px] object-contain"
                  />
                  
                  {/* Floating capture trigger overlay */}
                  <div className="absolute bottom-4 right-4 z-10">
                    <button
                      onClick={captureVideoFrame}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 animate-pulse active:scale-95 transition cursor-pointer"
                    >
                      <Circle className="w-3 h-3 fill-current" />
                      <span>Capture Frame</span>
                    </button>
                  </div>
                </div>

                {/* Timeline Scrub deck */}
                <div className="bg-slate-950/80 p-4 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlayVideo}
                      className="p-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-bold transition text-xs"
                    >
                      {videoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>

                    {/* Timeline range scrub slider */}
                    <input 
                      type="range"
                      min="0"
                      max={videoDuration || 100}
                      step="0.05"
                      value={videoCurrentTime}
                      onChange={handleScrub}
                      className="flex-1 accent-purple-500 bg-slate-850 h-2 rounded-lg cursor-pointer"
                    />

                    {/* Scrub Duration formatting */}
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      {Math.round(videoCurrentTime)}s / {Math.round(videoDuration)}s
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-850">
                    <button 
                      onClick={() => {
                        setVideoUrl(null);
                        setSteps([]);
                      }}
                      className="text-rose-500 hover:underline"
                    >
                      Ganti Video Uploader
                    </button>
                    <span>💡 Geser slider untuk mencari detik aksi lo, lalu klik <strong>Capture Frame</strong>!</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right panel captured list */}
          <aside className="w-full lg:w-80 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col h-[480px] lg:h-auto">
            <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Daftar Langkah ({steps.length})</span>
            </h3>

            {steps.length === 0 ? (
              <div className="flex-1 border border-dashed border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <Film className="w-8 h-8 text-slate-700 mb-2" />
                <p>Belum ada langkah.</p>
                <p className="text-[10px] mt-0.5">Mulai play video & capture untuk mengisi timeline.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar">
                {steps.map((step, idx) => (
                  <div 
                    key={step.id}
                    className="group border border-slate-800 bg-slate-950/60 rounded-2xl p-2.5 flex items-start gap-2.5 relative"
                  >
                    {/* Visual Card frame */}
                    {step.customScreenshot && (
                      <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-800 flex-shrink-0 bg-slate-900">
                        <img 
                          src={step.customScreenshot} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Langkah {idx + 1}</span>
                      <h4 className="text-[11px] font-bold text-white mt-1.5 truncate">{step.title}</h4>
                      <p className="text-[9px] text-slate-500 line-clamp-1 mt-0.5">{step.description}</p>
                    </div>

                    <button
                      onClick={() => deleteSnappedStep(step.id)}
                      className="absolute right-2 top-2 p-1 text-slate-500 hover:text-rose-500 hover:bg-slate-900 rounded opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Hapus langkah"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </main>

        {/* SAVE DIALOG MODAL (VIDEO MODE) */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 text-slate-100 animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                <span>Simpan Hasil Tangkapan Guide</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Rangkaian tangkapan frame Anda berhasil dikompresi menjadi <strong>{steps.length} langkah operasional</strong>. Lengkapi metadata berikut untuk menyimpannya ke pustaka.
              </p>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Judul Guide</label>
                  <input
                    type="text"
                    placeholder="e.g. Cara Membuat Tiket di ZetaCRM"
                    value={guideTitle}
                    onChange={(e) => setGuideTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Deskripsi Singkat</label>
                  <textarea
                    placeholder="Panduan ini memuat tata cara..."
                    rows={3}
                    value={guideDesc}
                    onChange={(e) => setGuideDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Kategori</label>
                    <select
                      value={guideCategory}
                      onChange={(e) => setGuideCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Customer Service">Customer Service</option>
                      <option value="IT Operations">IT Operations</option>
                      <option value="QA Testing">QA Testing</option>
                      <option value="Billing & Finance">Billing & Finance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Tags (pisahkan koma)</label>
                    <input
                      type="text"
                      value={guideTagsText}
                      onChange={(e) => setGuideTagsText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-800 mt-6">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition"
                >
                  Kembali Edit
                </button>
                <button
                  onClick={handleFinalSave}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/35 cursor-pointer transition"
                >
                  Simpan & Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // VIEW 2: INTERACTIVE SANDBOX RECORDRING DASHBOARD
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
      {/* Top Floating Scribe Bar */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setRecorderMode(null)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <span className="flex h-3.5 w-3.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 ${isRecording ? '' : 'hidden'}`}></span>
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isRecording ? 'bg-rose-500' : 'bg-slate-600'}`}></span>
            </span>
            <div>
              <h2 className="text-white font-bold text-sm tracking-wide uppercase">
                {isRecording ? 'ZETACRM RECORDER ACTIVE' : 'ZETACRM RECORDER IDLE'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRecording 
                  ? `Sedang merekam... Lakukan tindakan di panel ZetaCRM di bawah.` 
                  : 'Klik "Start Recording" untuk mulai merekam workflow Anda.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-slate-800 border border-slate-700 text-slate-300 font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>{steps.length} Steps Captured</span>
            </span>

            {!isRecording ? (
              <button
                onClick={startRecording}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition active:scale-95"
              >
                <Circle className="w-3 h-3 fill-current text-white animate-pulse" />
                <span>Start Recording</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRecording(false)}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
                >
                  <Pause className="w-3 h-3 inline mr-1" /> Pause
                </button>
                <button
                  onClick={triggerSaveGuide}
                  disabled={steps.length === 0}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 disabled:pointer-events-none text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                >
                  <Check className="w-4 h-4" /> Stop & Finish
                </button>
              </div>
            )}

            <button
              onClick={onCancel}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 p-2 rounded-xl text-xs cursor-pointer transition"
              title="Keluar dari Sandbox"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Sandbox Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col justify-center items-center">
        <p className="text-xs text-slate-400 mb-2 self-start flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Interactive Simulation Box (ZetaCRM Client v2.4)</span>
        </p>

        {/* Embedded CRM Shell */}
        <div 
          ref={sandboxRef}
          className="relative w-full h-[650px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Waves Ripple Render */}
          {ripples.map(ripple => (
            <div
              key={ripple.id}
              className="ripple-effect"
              style={{ left: ripple.x, top: ripple.y }}
            />
          ))}

          {/* CRM Header Bar */}
          <div className="bg-slate-950 border-b border-slate-800/80 px-6 py-3.5 flex justify-between items-center text-white">
            <div className="flex items-center gap-2.5">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white font-black text-xs tracking-wider">
                ΖT
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-slate-100">ZetaCRM</span>
                <span className="text-[10px] bg-indigo-900/60 border border-indigo-800/60 text-indigo-300 font-bold px-1.5 py-0.5 rounded ml-2">Internal SLA High</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="text-[11px] text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/50">User: <strong>yogi.fermana@company.com</strong></span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                YF
              </div>
            </div>
          </div>

          {/* CRM Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-60 bg-slate-950/80 border-r border-slate-800/50 p-4 flex flex-col justify-between">
              <div className="space-y-1">
                <button
                  onClick={(e) => {
                    setActiveTab('dashboard');
                    handleInteraction(e, 'nav', 'Dashboard Menu');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                    activeTab === 'dashboard'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Dashboard Overview</span>
                </button>

                <button
                  onClick={(e) => {
                    setActiveTab('tickets');
                    handleInteraction(e, 'nav', 'Tickets Menu');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                    activeTab === 'tickets'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Service Tickets</span>
                  <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-auto">
                    {tickets.filter(t => t.status === 'Open').length}
                  </span>
                </button>

                <button
                  onClick={(e) => {
                    setActiveTab('customers');
                    handleInteraction(e, 'nav', 'Customers Menu');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                    activeTab === 'customers'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Clients Database</span>
                </button>

                <button
                  onClick={(e) => {
                    setActiveTab('settings');
                    handleInteraction(e, 'nav', 'Settings Menu');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                    activeTab === 'settings'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>SLA Config Settings</span>
                </button>
              </div>

              {/* Sidebar bottom */}
              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 text-[10px] text-slate-500">
                <HelpCircle className="w-4 h-4 text-slate-400 mb-1.5" />
                <p className="font-semibold text-slate-300">Butuh Bantuan Zeta?</p>
                <p className="mt-0.5">Hubungi support internal IT atau akses repositori tim.</p>
              </div>
            </div>

            {/* Client Canvas Area */}
            <div className="flex-1 bg-slate-900 p-6 overflow-y-auto text-slate-200">
              
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Overview Dashboard</h3>
                      <p className="text-xs text-slate-400">Selamat datang kembali! Ini rangkuman performa SLA tiket Anda hari ini.</p>
                    </div>
                    <span className="bg-slate-800 text-slate-300 text-[10px] px-3 py-1.5 rounded-xl border border-slate-700/60 font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" /> Live Data
                    </span>
                  </div>

                  {/* Summary row */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">SLA Performance</span>
                      <h4 className="text-2xl font-black text-emerald-400 mt-2">98.4%</h4>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Queue</span>
                      <h4 className="text-2xl font-black text-rose-400 mt-2">14 Tickets</h4>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Closed Today</span>
                      <h4 className="text-2xl font-black text-indigo-400 mt-2">9 Completed</h4>
                    </div>
                  </div>

                  {/* Dummy Visual Chart */}
                  <div className="bg-slate-950 border border-slate-800/80 p-5 rounded-2xl mb-6">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Grafik Beban Tiket Harian</h4>
                    <div className="h-28 flex items-end justify-between gap-1 px-4 relative">
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                        <div className="border-b border-white w-full"></div>
                        <div className="border-b border-white w-full"></div>
                        <div className="border-b border-white w-full"></div>
                      </div>
                      <div className="bg-indigo-600/40 border-t-2 border-indigo-400 w-10 h-12 rounded-t-lg transition hover:bg-indigo-600"></div>
                      <div className="bg-indigo-600/40 border-t-2 border-indigo-400 w-10 h-20 rounded-t-lg transition hover:bg-indigo-600"></div>
                      <div className="bg-indigo-600/40 border-t-2 border-indigo-400 w-10 h-16 rounded-t-lg transition hover:bg-indigo-600"></div>
                      <div className="bg-indigo-600/40 border-t-2 border-indigo-400 w-10 h-28 rounded-t-lg transition hover:bg-indigo-600"></div>
                      <div className="bg-indigo-600/40 border-t-2 border-indigo-400 w-10 h-24 rounded-t-lg transition hover:bg-indigo-600"></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 mt-2 px-1">
                      <span>Senin</span><span>Selasa</span><span>Rabu</span><span>Kamis</span><span>Jumat</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TICKETS MENU */}
              {activeTab === 'tickets' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Antrean Layanan Pelanggan</h3>
                      <p className="text-xs text-slate-400">Kelola tiket troubleshooting IT dan request bantuan di sini.</p>
                    </div>
                    <button
                      onClick={(e) => {
                        setModalOpen(true);
                        handleInteraction(e, 'click', 'Tombol "Create Ticket"');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Ticket</span>
                    </button>
                  </div>

                  {/* Tickets Table */}
                  <div className="bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="p-4">ID</th>
                          <th className="p-4">Subject</th>
                          <th className="p-4">Kategori</th>
                          <th className="p-4">Prioritas</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {tickets.map(ticket => (
                          <tr key={ticket.id} className="hover:bg-slate-900/40 transition">
                            <td className="p-4 font-mono font-bold text-slate-400">{ticket.id}</td>
                            <td className="p-4 font-semibold text-white">{ticket.subject}</td>
                            <td className="p-4">
                              <span className="bg-slate-800/60 text-slate-300 border border-slate-700/50 px-2 py-0.5 rounded">
                                {ticket.category}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded font-bold ${
                                ticket.priority === 'high' 
                                  ? 'bg-rose-950/60 text-rose-400 border border-rose-900/60' 
                                  : ticket.priority === 'medium'
                                  ? 'bg-amber-950/60 text-amber-400 border border-amber-900/60'
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {ticket.priority.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  ticket.status === 'Open' ? 'bg-emerald-400' : ticket.status === 'In Progress' ? 'bg-amber-400' : 'bg-slate-600'
                                }`}></span>
                                {ticket.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <button 
                                onClick={(e) => {
                                  setSelectedTicketId(ticket.id);
                                  handleInteraction(e, 'click', `Aksi Detail "${ticket.id}"`);
                                }}
                                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 cursor-pointer"
                              >
                                View <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Detail Panel if selected */}
                  {selectedTicketId && (
                    <div className="bg-slate-950 border border-indigo-500/30 p-5 rounded-2xl mt-6 relative">
                      <button 
                        onClick={() => setSelectedTicketId(undefined)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
                      >
                        ✕
                      </button>
                      <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-1.5 mb-2">
                        <AlertCircle className="w-4 h-4" /> Detail Tiket Aktif - {selectedTicketId}
                      </h4>
                      <p className="text-xs text-white font-semibold">
                        {tickets.find(t => t.id === selectedTicketId)?.subject}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-2">
                        Ditugaskan ke: <strong>IT Service DevOps Team</strong> <br/>
                        SLA Terhitung: <strong>Tersisa 1 Jam 40 Menit</strong> (SLA Terjaga)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CUSTOMERS */}
              {activeTab === 'customers' && (
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight mb-2">Database Pelanggan Zeta</h3>
                  <p className="text-xs text-slate-400 mb-6">Daftar kontak organisasi korporat aktif yang menggunakan layanan berbayar tier Enterprise.</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      onClick={(e) => handleInteraction(e, 'click', 'Card Pelanggan PT Telkom')}
                      className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-5 rounded-2xl cursor-pointer transition hover:border-slate-700"
                    >
                      <div className="w-8 h-8 rounded-full bg-rose-600/30 text-rose-400 flex items-center justify-center font-bold text-xs mb-3">T</div>
                      <h4 className="text-sm font-bold text-white">PT Telkom Indonesia</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Enterprise Tier • 14 SLA Terdaftar</p>
                    </div>

                    <div 
                      onClick={(e) => handleInteraction(e, 'click', 'Card Pelanggan Gojek')}
                      className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-5 rounded-2xl cursor-pointer transition hover:border-slate-700"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3">G</div>
                      <h4 className="text-sm font-bold text-white">Gojek Indonesia</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Enterprise Tier • 8 SLA Terdaftar</p>
                    </div>

                    <div 
                      onClick={(e) => handleInteraction(e, 'click', 'Card Pelanggan BCA')}
                      className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-5 rounded-2xl cursor-pointer transition hover:border-slate-700"
                    >
                      <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-xs mb-3">B</div>
                      <h4 className="text-sm font-bold text-white">Bank Central Asia (BCA)</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Premium SLA Tier • 24 SLA Terdaftar</p>
                    </div>

                    <div 
                      onClick={(e) => handleInteraction(e, 'click', 'Card Pelanggan Pertamina')}
                      className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-5 rounded-2xl cursor-pointer transition hover:border-slate-700"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-600/30 text-amber-400 flex items-center justify-center font-bold text-xs mb-3">P</div>
                      <h4 className="text-sm font-bold text-white">Pertamina Persero</h4>
                      <p className="text-[11px] text-slate-400 mt-1">Enterprise Tier • 12 SLA Terdaftar</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SETTINGS MENU */}
              {activeTab === 'settings' && (
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight mb-2">Pengaturan SLA Sistem</h3>
                  <p className="text-xs text-slate-400 mb-6">Konfigurasi limit waktu pengerjaan otomatisasi berdasarkan tier prioritas pelanggan.</p>

                  <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-6">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-2">
                        <span>High SLA Threshold (Jam)</span>
                        <span className="text-indigo-400">2 Jam</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="12" 
                        defaultValue="2" 
                        onChange={(e) => {
                          if (isRecording) {
                            const rect = e.target.getBoundingClientRect();
                            const sandboxRect = sandboxRef.current?.getBoundingClientRect();
                            if (sandboxRect) {
                              const clickX = (rect.left + rect.width / 2) - sandboxRect.left;
                              const clickY = (rect.top + rect.height / 2) - sandboxRect.top;
                              const xPercent = Math.round((clickX / sandboxRect.width) * 100);
                              const yPercent = Math.round((clickY / sandboxRect.height) * 100);

                              setSteps(prev => [...prev, {
                                id: `step-${Date.now()}`,
                                title: `Ubah SLA Threshold High menjadi ${e.target.value} Jam`,
                                description: `Mengatur batas waktu pengerjaan SLA prioritas tinggi menjadi ${e.target.value} jam.`,
                                actionType: 'input',
                                targetElement: 'Slider SLA High',
                                inputValue: `${e.target.value} Jam`,
                                xPercent,
                                yPercent,
                                sandboxState: { tab: 'settings' }
                              }]);
                              playCaptureSound();
                            }
                          }
                        }}
                        className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-2">
                        <span>Medium SLA Threshold (Jam)</span>
                        <span className="text-indigo-400">6 Jam</span>
                      </div>
                      <input type="range" min="4" max="24" defaultValue="6" className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer pointer-events-none" />
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                      <div>
                        <h4 className="text-xs font-bold text-white">Eskalasi Slack Otomatis</h4>
                        <p className="text-[10px] text-slate-500">Kirim tiket High langsung ke channel DevOps Slack.</p>
                      </div>
                      <div 
                        onClick={(e) => handleInteraction(e, 'click', 'Toggle Slack Integration')}
                        className="w-11 h-6 bg-indigo-600 rounded-full p-0.5 cursor-pointer flex items-center justify-end"
                      >
                        <span className="bg-white w-5 h-5 rounded-full shadow-md"></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* CRM MOCK CREATE TICKET MODAL */}
          {modalOpen && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-40">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex justify-between items-center text-white">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">Buat Tiket Gangguan Baru</h4>
                  <button 
                    onClick={(e) => {
                      setModalOpen(false);
                      handleInteraction(e, 'click', 'Tutup Modal');
                    }}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateTicketSubmit} className="p-5 space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Pembayaran E-Banking BCA Gagal"
                      value={formData.subject}
                      onBlur={(e) => recordInputField(e, 'subject')}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, category: val });
                          if (isRecording) {
                            const rect = e.target.getBoundingClientRect();
                            const sandboxRect = sandboxRef.current?.getBoundingClientRect();
                            if (sandboxRect) {
                              const clickX = (rect.left + rect.width / 2) - sandboxRect.left;
                              const clickY = (rect.top + rect.height / 2) - sandboxRect.top;
                              const xPercent = Math.round((clickX / sandboxRect.width) * 100);
                              const yPercent = Math.round((clickY / sandboxRect.height) * 100);

                              setSteps(prev => [...prev, {
                                id: `step-${Date.now()}`,
                                title: `Ubah Kategori ke "${val}"`,
                                description: `Memilih kategori layanan "${val}" dari opsi menu dropdown.`,
                                actionType: 'select',
                                targetElement: 'Dropdown Kategori',
                                inputValue: val,
                                xPercent,
                                yPercent,
                                sandboxState: { tab: 'tickets', modalOpen: true }
                              }]);
                              playCaptureSound();
                            }
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="Technical">Technical</option>
                        <option value="Billing">Billing</option>
                        <option value="Support">Support</option>
                        <option value="Feedback">Feedback</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1.5">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, priority: val });
                          if (isRecording) {
                            const rect = e.target.getBoundingClientRect();
                            const sandboxRect = sandboxRef.current?.getBoundingClientRect();
                            if (sandboxRect) {
                              const clickX = (rect.left + rect.width / 2) - sandboxRect.left;
                              const clickY = (rect.top + rect.height / 2) - sandboxRect.top;
                              const xPercent = Math.round((clickX / sandboxRect.width) * 100);
                              const yPercent = Math.round((clickY / sandboxRect.height) * 100);

                              setSteps(prev => [...prev, {
                                id: `step-${Date.now()}`,
                                title: `Ubah Prioritas ke "${val.toUpperCase()}"`,
                                description: `Memilih tingkat prioritas pelayanan "${val.toUpperCase()}" dari menu dropdown.`,
                                actionType: 'select',
                                targetElement: 'Dropdown Prioritas',
                                inputValue: val,
                                xPercent,
                                yPercent,
                                sandboxState: { tab: 'tickets', modalOpen: true }
                              }]);
                              playCaptureSound();
                            }
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1.5">Description</label>
                    <textarea
                      placeholder="Berikan rincian singkat mengenai permasalahan..."
                      rows={3}
                      value={formData.description}
                      onBlur={(e) => recordInputField(e, 'description')}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={(e) => {
                        setModalOpen(false);
                        handleInteraction(e, 'click', 'Tombol "Cancel Form"');
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl font-bold cursor-pointer transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      onClick={(e) => {
                        handleInteraction(e, 'click', 'Tombol "Submit Ticket"');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold cursor-pointer transition"
                    >
                      Submit Ticket
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* SAVE DIALOG MODAL */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <span>Simpan Hasil Rekaman Guide</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Rangkaian interaksi Anda berhasil dikompresi menjadi <strong>{steps.length} langkah operasional</strong>. Lengkapi metadata berikut untuk menyimpannya ke pustaka.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Judul Guide</label>
                <input
                  type="text"
                  placeholder="e.g. Cara Membuat Tiket di ZetaCRM"
                  value={guideTitle}
                  onChange={(e) => setGuideTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Deskripsi Singkat</label>
                <textarea
                  placeholder="Panduan ini memuat tata cara..."
                  rows={3}
                  value={guideDesc}
                  onChange={(e) => setGuideDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Kategori</label>
                  <select
                    value={guideCategory}
                    onChange={(e) => setGuideCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Customer Service">Customer Service</option>
                    <option value="IT Operations">IT Operations</option>
                    <option value="QA Testing">QA Testing</option>
                    <option value="Billing & Finance">Billing & Finance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Tags (pisahkan koma)</label>
                  <input
                    type="text"
                    value={guideTagsText}
                    onChange={(e) => setGuideTagsText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-800 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition"
              >
                Kembali Edit
              </button>
              <button
                onClick={handleFinalSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/35 cursor-pointer transition"
              >
                Simpan & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
