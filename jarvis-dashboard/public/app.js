const log = document.getElementById('log');
const form = document.getElementById('form');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const micBtn = document.getElementById('mic');
const resetBtn = document.getElementById('reset');
const connStatus = document.getElementById('conn-status');
const orb = document.getElementById('orb');
const orbState = document.getElementById('orb-state');

function setOrbState(state) {
  orb.classList.remove('idle', 'listening', 'thinking', 'speaking', 'beat');
  orb.classList.add(state);
  orbState.textContent = state.toUpperCase();
}

// Web Speech API's SpeechSynthesis doesn't expose the raw audio buffer, so
// there's no real amplitude/frequency data to visualize. `onboundary` fires
// roughly once per spoken word, which is close enough to drive a short
// "beat" pulse (see .orb.speaking.beat in style.css) so the orb's glow
// tracks actual speech cadence instead of just looping on a fixed timer.
function beatOrb() {
  orb.classList.remove('beat');
  void orb.offsetWidth; // force reflow so the beat animation restarts even mid-pulse
  orb.classList.add('beat');
}

function addMessage(text, role) {
  const el = document.createElement('div');
  el.className = `msg ${role}`;
  el.textContent = text;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}

// --- WebSocket connection to the local server ---
let ws;
let nextId = 1;
const pending = new Map(); // id -> { resolve, reject, statusEl }

function connect() {
  ws = new WebSocket(`ws://${location.host}`);

  ws.onopen = () => {
    connStatus.textContent = 'online';
    connStatus.className = 'conn-status online';
  };

  ws.onclose = () => {
    connStatus.textContent = 'offline — retrying…';
    connStatus.className = 'conn-status offline';
    setTimeout(connect, 1500);
  };

  ws.onerror = () => ws.close();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'ready') return;
    if (msg.type === 'reset-ack') return;
    if (msg.type === 'brief') {
      // Scheduled brief pushed live from the server (see briefs.js) — not a
      // reply to any pending chat ask. brief-cards.js owns rendering it.
      window.dispatchEvent(new CustomEvent('jarvis-brief', { detail: msg.brief }));
      return;
    }

    const entry = pending.get(msg.id);
    if (!entry) return;

    if (msg.type === 'reply') {
      pending.delete(msg.id);
      entry.resolve(msg.text);
    } else if (msg.type === 'error') {
      pending.delete(msg.id);
      entry.reject(new Error(msg.message));
    }
  };
}
connect();

function askServer(prompt) {
  return new Promise((resolve, reject) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      reject(new Error('Not connected to Jarvis server'));
      return;
    }
    const id = nextId++;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ type: 'ask', id, prompt }));
  });
}

// --- Voice: pick the best-sounding available system voice ---
let preferredVoice = null;
function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;
  const rank = (v) => {
    const name = v.name.toLowerCase();
    let score = 0;
    if (v.lang === 'en-US') score += 2;
    else if (v.lang.startsWith('en')) score += 1;
    if (/natural|neural|premium|enhanced/.test(name)) score += 3;
    if (/google|microsoft/.test(name)) score += 1;
    return score;
  };
  preferredVoice = voices.slice().sort((a, b) => rank(b) - rank(a))[0];
}
if ('speechSynthesis' in window) {
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

function speak(text) {
  if (!('speechSynthesis' in window)) return Promise.resolve();
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.rate = 1.0;
  return new Promise((resolve) => {
    utterance.onstart = () => setOrbState('speaking');
    utterance.onboundary = () => beatOrb();
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

// --- Send/receive flow ---
async function sendPrompt(prompt) {
  if (!prompt.trim()) return;
  addMessage(prompt, 'user');
  input.value = '';
  sendBtn.disabled = true;
  const statusEl = addMessage('Thinking...', 'status');
  setOrbState('thinking');

  try {
    const reply = await askServer(prompt);
    statusEl.remove();
    addMessage(reply || '(no response)', 'assistant');
    if (reply) await speak(reply);
  } catch (err) {
    statusEl.remove();
    addMessage(`Error: ${err.message || err}`, 'assistant');
  } finally {
    sendBtn.disabled = false;
    setOrbState(handsFree ? 'listening' : 'idle');
    if (handsFree) armMic();
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  sendPrompt(input.value);
});

resetBtn.addEventListener('click', () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'reset' }));
  }
  log.innerHTML = '';
  addMessage('New conversation started.', 'status');
  setOrbState('idle');
});

// --- Mic: hands-free voice loop (Web Speech API STT) ---

// Mic access requires a "secure context" — https, or the literal hostname
// `localhost`/`127.0.0.1`. If this page was opened via a LAN IP or any
// other hostname, getUserMedia (which SpeechRecognition uses under the
// hood) is silently unavailable — every mic click would fail identically
// with no useful browser error. Catch that case specifically since it's an
// easy trap (e.g. bookmarking a machine's IP instead of "localhost").
if (!window.isSecureContext) {
  addMessage(
    `Voice input needs a secure context, and this page was loaded from "${location.hostname}" which isn't one. ` +
      `Open the dashboard via http://localhost:${location.port || 8720} instead (not an IP address) for the mic to work.`,
    'status',
  );
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognizer = null;
let handsFree = false;
let stoppingIntentionally = false;

// Human-readable messages for SpeechRecognition's error codes — the
// previous version silently ate these (onerror only touched CSS classes),
// so a real failure (mic permission denied, no device, browser blocking the
// speech service — Brave disables it by default) looked identical to "just
// idle": the mic button stayed lit amber with nothing happening and zero
// feedback anywhere, including devtools console.
const MIC_ERROR_MESSAGES = {
  'not-allowed': 'Microphone access was denied. Check your browser\'s site settings (the icon in the address bar) and allow microphone access for this page, then click 🎤 again.',
  'service-not-allowed': 'This browser is blocking the speech-recognition service. If you\'re on Brave, its Shields block Google\'s speech service by default — try Chrome/Edge, or check Brave Shields for this site.',
  'audio-capture': 'No microphone was found. Check that a mic is connected and selected as the input device.',
  'network': 'Speech recognition needs network access (it calls a cloud speech service) and the request failed. Check your internet connection.',
  'language-not-supported': 'The recognizer doesn\'t support the requested language.',
};

function stopHandsFree(message) {
  handsFree = false;
  micBtn.classList.remove('hands-free', 'recording');
  setOrbState('idle');
  if (message) addMessage(message, 'status');
}

function armMic() {
  if (!recognizer || !handsFree) return;
  try {
    recognizer.start();
  } catch (err) {
    // Most commonly thrown when start() is called while already running —
    // harmless. Anything else, surface it instead of failing silently.
    if (err && err.name !== 'InvalidStateError') {
      console.error('SpeechRecognition failed to start:', err);
      stopHandsFree(`Couldn't start the microphone: ${err.message || err}`);
    }
  }
}

if (SpeechRecognition) {
  recognizer = new SpeechRecognition();
  recognizer.lang = 'en-US';
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;

  recognizer.onstart = () => {
    micBtn.classList.add('recording');
    setOrbState('listening');
  };
  recognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    sendPrompt(transcript);
  };
  recognizer.onend = () => {
    micBtn.classList.remove('recording');
  };
  recognizer.onerror = (event) => {
    micBtn.classList.remove('recording');
    console.error('SpeechRecognition error:', event.error);

    if (event.error === 'aborted' && stoppingIntentionally) {
      // We called recognizer.stop() ourselves (user turned hands-free off) —
      // expected, not a failure.
      stoppingIntentionally = false;
      return;
    }
    if (event.error === 'no-speech') {
      // Benign — mic just timed out waiting. Keep the hands-free loop going.
      if (handsFree) setTimeout(armMic, 300);
      return;
    }
    // Anything else is a real failure — stop pretending hands-free mode is
    // still active (the button was staying lit with nothing working) and
    // say why.
    stopHandsFree(MIC_ERROR_MESSAGES[event.error] || `Microphone error: ${event.error}`);
  };

  micBtn.addEventListener('click', () => {
    if (handsFree) {
      stoppingIntentionally = true;
      window.speechSynthesis.cancel();
      recognizer.stop();
      stopHandsFree();
      return;
    }
    handsFree = true;
    micBtn.classList.add('hands-free');
    armMic();
  });
} else {
  micBtn.disabled = true;
  micBtn.title = 'Speech recognition not available in this browser (try Chrome or Edge)';
  addMessage(
    'This browser doesn\'t support voice input (window.SpeechRecognition is unavailable). Try Chrome or Edge, or just type instead.',
    'status',
  );
}
