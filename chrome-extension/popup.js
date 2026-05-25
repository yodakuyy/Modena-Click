// popup.js

const btnStart = document.getElementById('btn-start');
const btnPause = document.getElementById('btn-pause');
const btnStop = document.getElementById('btn-stop');
const statusLabel = document.getElementById('status-label');
const stepsCount = document.getElementById('steps-count');
const recordingDot = document.getElementById('recording-dot');

// Initialize states
chrome.storage.local.get(['isRecording', 'steps'], (result) => {
  const isRecording = !!result.isRecording;
  const steps = result.steps || [];
  updateUI(isRecording, steps.length);
});

// Listen to step updates from background worker
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'stepsUpdated') {
    stepsCount.innerText = `${message.count} Steps Captured`;
  }
});

btnStart?.addEventListener('click', () => {
  chrome.storage.local.set({ isRecording: true, steps: [] }, () => {
    updateUI(true, 0);
  });
});

btnPause?.addEventListener('click', () => {
  chrome.storage.local.get(['isRecording'], (result) => {
    const nextState = !result.isRecording;
    chrome.storage.local.set({ isRecording: nextState }, () => {
      updateUI(nextState, null);
    });
  });
});

btnStop?.addEventListener('click', () => {
  chrome.storage.local.get(['steps'], (result) => {
    const steps = result.steps || [];
    if (steps.length === 0) return;

    const guide = {
      id: `guide-chrome-${Date.now()}`,
      title: `Panduan Otomatis Modena - ${new Date().toLocaleDateString('id-ID')}`,
      description: `Panduan operasional Modena yang otomatis direkam menggunakan Chrome Extension By M-Click.`,
      author: 'Yogi Fermana',
      category: 'IT Operations',
      tags: ['M-Click', 'Modena', 'AutoRecord'],
      createdAt: new Date().toISOString(),
      steps: steps
    };

    // Store guide and clear records
    chrome.storage.local.set({ lastRecordedGuide: guide, steps: [], isRecording: false }, () => {
      updateUI(false, 0);
      // Open By M-Click local web dashboard
      chrome.tabs.create({ url: 'http://localhost:3000' });
    });
  });
});

function updateUI(isRecording, count) {
  if (isRecording) {
    statusLabel.innerText = 'RECORDER RUNNING';
    recordingDot?.classList.remove('inactive');
    recordingDot?.classList.add('animate-pulse');
    
    btnStart.style.display = 'none';
    btnPause.style.display = 'block';
    btnPause.innerText = '⏸️ Pause';
    btnStop.style.display = 'block';
  } else {
    statusLabel.innerText = 'RECORDER IDLE';
    recordingDot?.classList.add('inactive');
    recordingDot?.classList.remove('animate-pulse');
    
    btnStart.style.display = 'block';
    btnStart.innerText = '🔴 Start New Recording';
    btnPause.style.display = 'none';
    btnStop.style.display = 'none';
  }

  if (count !== null) {
    stepsCount.innerText = `${count} Steps Captured`;
  }
}
