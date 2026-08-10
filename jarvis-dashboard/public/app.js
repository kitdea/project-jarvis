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
// `inFlight` lets a caller start the round-trip early (see submitUtterance) so
// the wait overlaps whatever else it was doing; omitted, the request starts here.
async function sendPrompt(prompt, inFlight) {
  if (!prompt.trim()) return;
  addMessage(prompt, 'user');
  input.value = '';
  sendBtn.disabled = true;
  const statusEl = addMessage('Thinking...', 'status');
  setOrbState('thinking');

  try {
    const reply = await (inFlight || askServer(prompt));
    statusEl.remove();
    addMessage(reply || '(no response)', 'assistant');
    if (reply) await speak(reply);
  } catch (err) {
    statusEl.remove();
    addMessage(`Error: ${err.message || err}`, 'assistant');
  } finally {
    sendBtn.disabled = false;
    setOrbState(handsFree ? 'listening' : 'idle');
    resumeListening(0);
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

const GREETING = 'Good day Sir, What do you need?';
let greeting = null;

// Opening message. Held back until the user actually speaks — Jarvis greets
// in response to being addressed, not the moment the mic is switched on.
// Fires once per hands-free session; the mic toggle clears it. Holding the
// promise rather than a bool means a second caller joins the in-flight
// greeting instead of racing past it.
function greetOnce() {
  if (!greeting) {
    addMessage(GREETING, 'assistant');
    greeting = speak(GREETING);
  }
  return greeting;
}

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

// How long the user has to stay quiet before Jarvis treats the turn as over.
// Long enough to survive a mid-sentence pause, short enough not to feel laggy.
const SILENCE_MS = 1400;

// Accumulated finalized speech for the current turn, submitted only once the
// user has been quiet for SILENCE_MS. Module-scope so that switching
// hands-free off can clear the whole voice-loop state in one place.
let utterance = '';
let silenceTimer = null;

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
  'network': 'Speech recognition needs network access (it calls a cloud speech service) and the request kept failing after several retries. Check your internet connection, then click 🎤 to try again. Typing still works.',
  'language-not-supported': 'The recognizer doesn\'t support the requested language.',
};

// The speech service is a remote call, so it drops out for reasons that have
// nothing to do with the user (wifi hiccup, service blip, laptop waking up).
// Killing hands-free mode on the first one is too harsh — retry with backoff
// and only give up once it's clearly not coming back.
const MAX_NETWORK_RETRIES = 3;
let networkRetries = 0;

function cancelSilenceTimer() {
  clearTimeout(silenceTimer);
  silenceTimer = null;
}

function stopHandsFree(message) {
  handsFree = false;
  cancelSilenceTimer();
  utterance = '';
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

// The single owner of "the recognizer stopped, pick listening back up". Every
// stall — idle timeout, no-speech, a network retry, a finished reply — routes
// through here so the preconditions live in one place. The guard is re-checked
// after the wait, since the user can switch hands-free off (or Jarvis can start
// talking) during it.
function resumeListening(delay = 300) {
  if (!handsFree) return;
  setTimeout(() => {
    if (!handsFree || window.speechSynthesis.speaking) return;
    armMic();
  }, delay);
}

if (SpeechRecognition) {
  recognizer = new SpeechRecognition();
  recognizer.lang = 'en-US';
  // `continuous` keeps the recognizer running across natural pauses instead
  // of firing the moment it thinks one phrase ended, and interim results give
  // us a "still talking" signal. Together they let us wait out mid-sentence
  // breaths rather than cutting the user off after a few words.
  recognizer.continuous = true;
  recognizer.interimResults = true;
  recognizer.maxAlternatives = 1;

  recognizer.onstart = () => {
    micBtn.classList.add('recording');
    setOrbState('listening');
    networkRetries = 0; // the service is reachable again
  };

  function submitUtterance() {
    cancelSilenceTimer();
    const text = utterance.trim();
    utterance = '';
    if (!text) return;
    stoppingIntentionally = true;
    recognizer.stop(); // don't listen to our own reply; sendPrompt re-arms
    // The greeting and the round-trip are independent, so let the request fly
    // while Jarvis is still saying hello rather than stacking them. Catch is
    // attached now, not after the greeting, so a failure during playback isn't
    // an unhandled rejection; sendPrompt re-throws it into its own handler.
    const reply = askServer(text);
    reply.catch(() => {}); // sendPrompt awaits and reports it properly
    greetOnce().then(() => sendPrompt(text, reply));
  }

  recognizer.onresult = (event) => {
    let heard = false;
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result[0].transcript) heard = true;
      if (result.isFinal) utterance += result[0].transcript + ' ';
    }
    // Any speech at all — final or still-forming — means the user is mid-turn,
    // so restart the countdown. Only a genuine silence gap ends the turn.
    cancelSilenceTimer();
    if (heard || utterance) silenceTimer = setTimeout(submitUtterance, SILENCE_MS);
  };
  recognizer.onend = () => {
    micBtn.classList.remove('recording');
    // Spec order is onerror-then-onend, so by here the abort check has already
    // run; clear the flag on a tick so a straggling onerror still sees it.
    setTimeout(() => { stoppingIntentionally = false; }, 0);
    // Recognizers time out on their own. If the user got a phrase out before
    // that happened, treat the cutoff as end-of-turn rather than dropping it;
    // submitUtterance no-ops when nothing was said, so the idle case falls
    // through to simply listening again.
    cancelSilenceTimer();
    if (utterance) submitUtterance();
    else resumeListening();
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
      resumeListening();
      return;
    }
    if (event.error === 'network' && handsFree && networkRetries < MAX_NETWORK_RETRIES) {
      // Transient far more often than not. Back off (1s, 2s, 4s) and re-arm,
      // telling the user what's happening so the amber button isn't a mystery.
      const delay = 1000 * 2 ** networkRetries;
      networkRetries++;
      setOrbState('idle');
      addMessage(
        `Speech service unreachable — retrying in ${delay / 1000}s (attempt ${networkRetries} of ${MAX_NETWORK_RETRIES}).`,
        'status',
      );
      resumeListening(delay);
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
    greeting = null; // greet again at the start of each hands-free session
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
