let isRecording = false;
let hudElement = null;

// ==========================================
// 1. SLEEK FLOATING CAPTURE HUD WIDGET
// ==========================================

function createHUD() {
  if (hudElement || !document.body) return;

  hudElement = document.createElement('div');
  hudElement.id = 'by-m-click-hud';
  hudElement.style.cssText = `
    position: fixed !important;
    bottom: 24px !important;
    left: 24px !important;
    z-index: 2147483647 !important;
    background: rgba(15, 23, 42, 0.95) !important;
    border: 1.5px solid rgba(99, 102, 241, 0.6) !important;
    border-radius: 16px !important;
    padding: 12px 18px !important;
    color: #f3f4f6 !important;
    font-family: system-ui, -apple-system, sans-serif !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(99, 102, 241, 0.25) !important;
    backdrop-filter: blur(10px) !important;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
    pointer-events: none !important;
    letter-spacing: 0.3px !important;
  `;

  // Pulsing recording dot
  const dot = document.createElement('span');
  dot.style.cssText = `
    width: 9px !important;
    height: 9px !important;
    background-color: #ef4444 !important;
    border-radius: 50% !important;
    display: inline-block !important;
    box-shadow: 0 0 10px #ef4444 !important;
  `;
  dot.animate([
    { opacity: 0.3 },
    { opacity: 1 },
    { opacity: 0.3 }
  ], {
    duration: 1600,
    iterations: Infinity
  });

  const label = document.createElement('span');
  label.innerText = 'By M-Click Recorder';
  label.style.cssText = `
    color: #f3f4f6 !important;
    font-weight: 700 !important;
  `;

  const countBadge = document.createElement('span');
  countBadge.id = 'by-m-click-hud-count';
  countBadge.style.cssText = `
    background: linear-gradient(135deg, #6366f1, #a855f7) !important;
    color: white !important;
    padding: 3px 9px !important;
    border-radius: 8px !important;
    font-size: 10px !important;
    font-weight: 800 !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
  `;
  countBadge.innerText = '0 Steps';

  hudElement.appendChild(dot);
  hudElement.appendChild(label);
  hudElement.appendChild(countBadge);
  document.body.appendChild(hudElement);
}

function updateHUDCount(count) {
  if (!hudElement) createHUD();
  const countBadge = document.getElementById('by-m-click-hud-count');
  if (countBadge) {
    countBadge.innerText = `${count} Steps`;
  }
  
  // Fancy flash overlay visual feedback!
  if (hudElement) {
    hudElement.style.transform = 'scale(1.1)';
    hudElement.style.borderColor = '#e879f9';
    hudElement.style.boxShadow = '0 10px 30px -5px rgba(0, 0, 0, 0.6), 0 0 25px rgba(232, 121, 249, 0.5)';
    
    setTimeout(() => {
      hudElement.style.transform = 'scale(1)';
      hudElement.style.borderColor = 'rgba(99, 102, 241, 0.6)';
      hudElement.style.boxShadow = '0 10px 30px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(99, 102, 241, 0.25)';
    }, 400);
  }
}

function removeHUD() {
  if (hudElement) {
    hudElement.remove();
    hudElement = null;
  }
}

// ==========================================
// 2. ADVANCED ELEMENT PARSING & SELECTORS
// ==========================================

function getLabelForInput(input) {
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label.innerText.trim();
  }
  const closestLabel = input.closest('label');
  if (closestLabel) return closestLabel.innerText.trim();
  
  let sibling = input.previousElementSibling;
  while (sibling) {
    if (sibling.tagName === 'LABEL') return sibling.innerText.trim();
    sibling = sibling.previousElementSibling;
  }
  if (input.type === 'submit' || input.type === 'button') {
    return input.value;
  }
  return '';
}

function getElementName(target) {
  const tagName = target.tagName;
  let text = '';
  
  if (tagName === 'BUTTON' || target.closest('button')) {
    const btn = target.closest('button');
    text = btn.getAttribute('aria-label') || btn.title || btn.innerText?.trim() || '';
    if (!text) {
      const svg = btn.querySelector('svg');
      if (svg && svg.getAttribute('aria-label')) {
        text = svg.getAttribute('aria-label');
      } else {
        text = btn.name || btn.className?.split(' ')[0] || 'Tombol';
      }
    }
    return `Tombol "${text}"`;
  }
  
  if (tagName === 'A' || target.closest('a')) {
    const link = target.closest('a');
    text = link.getAttribute('aria-label') || link.title || link.innerText?.trim() || '';
    if (!text) {
      text = link.name || link.className?.split(' ')[0] || 'Tautan';
    }
    return `Tautan "${text}"`;
  }

  if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
    const labelText = getLabelForInput(target);
    text = labelText || target.placeholder || target.name || target.id || 'Kolom Input';
    return `Kolom "${text}"`;
  }

  if (tagName === 'SELECT') {
    const labelText = getLabelForInput(target);
    text = labelText || target.name || target.id || 'Dropdown';
    return `Menu Dropdown "${text}"`;
  }

  text = target.innerText?.trim() || target.getAttribute('aria-label') || target.title || target.className?.split(' ')[0] || tagName.toLowerCase();
  if (text.length > 30) text = text.substring(0, 30) + '...';
  return `Elemen "${text}"`;
}

// ==========================================
// 3. LISTENERS AND CAPTURE LOGIC
// ==========================================

// Check recording status from storage
chrome.storage.local.get(['isRecording', 'steps'], (result) => {
  isRecording = !!result.isRecording;
  const steps = result.steps || [];
  if (isRecording) {
    createHUD();
    updateHUDCount(steps.length);
  }
});

// Listen to storage changes to toggle recording status live
chrome.storage.onChanged.addListener((changes) => {
  if (changes.isRecording) {
    isRecording = !!changes.isRecording.newValue;
    if (isRecording) {
      chrome.storage.local.get(['steps'], (res) => {
        const steps = res.steps || [];
        createHUD();
        updateHUDCount(steps.length);
      });
    } else {
      removeHUD();
    }
  }
  if (changes.steps && isRecording) {
    const steps = changes.steps.newValue || [];
    updateHUDCount(steps.length);
  }
});

// Click Listener (Intercept in capture phase)
document.addEventListener('click', (e) => {
  if (!isRecording) return;

  const target = e.target;
  if (!target) return;

  const xPercent = Math.round((e.clientX / window.innerWidth) * 100);
  const yPercent = Math.round((e.clientY / window.innerHeight) * 100);

  const targetElement = getElementName(target);
  const title = `Klik ${targetElement}`;
  const description = `Tekan ${targetElement.toLowerCase()} pada aplikasi kantor Modena Anda untuk melanjutkan.`;

  // Send message to background script to trigger screenshot capture and save step!
  chrome.runtime.sendMessage({
    action: 'captureStep',
    step: {
      title,
      description,
      actionType: 'click',
      targetElement,
      xPercent,
      yPercent,
      inputValue: '',
      timestamp: Date.now()
    }
  });
}, true);

// Listen to input changes (Blur event)
document.addEventListener('blur', (e) => {
  if (!isRecording) return;
  const target = e.target;
  if (!target) return;

  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    const value = target.value;
    if (!value) return;

    const labelText = getLabelForInput(target);
    const label = labelText || target.placeholder || target.name || target.id || 'Kolom Teks';
    
    chrome.runtime.sendMessage({
      action: 'captureStep',
      step: {
        title: `Ketik "${value}" di ${label}`,
        description: `Masukkan teks "${value}" ke dalam kolom "${label}".`,
        actionType: 'input',
        targetElement: `Kolom Input "${label}"`,
        inputValue: value,
        xPercent: 50,
        yPercent: 50,
        timestamp: Date.now()
      }
    });
  }
}, true);

// Check if we are on By M-Click web app dashboard to sync recorded guides!
if (window.location.origin === 'http://localhost:3000') {
  chrome.storage.local.get(['lastRecordedGuide'], (result) => {
    if (result.lastRecordedGuide) {
      // Dispatch recorded guide to the React app
      window.postMessage({ 
        source: 'by-click-extension', 
        guide: result.lastRecordedGuide 
      }, '*');
      
      // Clear storage so we don't sync it again on reload
      chrome.storage.local.remove(['lastRecordedGuide']);
    }
  });
}
