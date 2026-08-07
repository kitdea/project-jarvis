const log = document.getElementById('log');
const form = document.getElementById('form');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const micBtn = document.getElementById('mic');

function addMessage(text, role) {
  const el = document.createElement('div');
  el.className = `msg ${role}`;
  el.textContent = text;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}

// Pick the best-sounding available system voice instead of whatever the
// engine defaults to (often a flat robotic one). Prefer natural/neural-
// labeled en-US voices; voice list loads async on some platforms, so this
// re-picks whenever it changes.
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

// Returns a promise that resolves once speaking finishes (or immediately if
// TTS isn't available), so callers can wait before re-arming the mic —
// otherwise the mic would pick up Jarvis's own voice as new input.
function speak(text) {
  if (!('speechSynthesis' in window)) return Promise.resolve();
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (preferredVoice) utterance.voice = preferredVoice;
  utterance.rate = 1.0;
  return new Promise((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

async function sendPrompt(prompt) {
  if (!prompt.trim()) return;
  addMessage(prompt, 'user');
  input.value = '';
  sendBtn.disabled = true;
  const statusEl = addMessage('Thinking...', 'status');

  try {
    const reply = await window.jarvis.ask(prompt);
    statusEl.remove();
    addMessage(reply || '(no response)', 'assistant');
    if (reply) await speak(reply);
  } catch (err) {
    statusEl.remove();
    addMessage(`Error: ${err.message || err}`, 'assistant');
  } finally {
    sendBtn.disabled = false;
    // Hands-free mode: re-arm the mic now that Jarvis is done talking, so
    // the conversation keeps going without another click.
    if (handsFree) armMic();
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  sendPrompt(input.value);
});

const resetBtn = document.getElementById('reset');
resetBtn.addEventListener('click', async () => {
  await window.jarvis.reset();
  log.innerHTML = '';
  addMessage('New conversation started.', 'status');
});

// Mic button: Web Speech API STT, built into Chromium/Electron's renderer.
// Click once to start a hands-free conversation loop — it listens, sends
// what you said, waits for Jarvis to reply and finish speaking, then
// automatically starts listening again. Click again any time to stop.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognizer = null;
let handsFree = false;

function armMic() {
  if (!recognizer || !handsFree) return;
  try {
    recognizer.start();
  } catch (_err) {
    // Already started — harmless, ignore.
  }
}

if (SpeechRecognition) {
  recognizer = new SpeechRecognition();
  recognizer.lang = 'en-US';
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;

  recognizer.onstart = () => micBtn.classList.add('recording');
  recognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    sendPrompt(transcript);
  };

  recognizer.onend = () => {
    micBtn.classList.remove('recording');
  };

  recognizer.onerror = (event) => {
    micBtn.classList.remove('recording');
    // 'no-speech' just means the mic timed out waiting — keep the loop
    // going in hands-free mode instead of treating it as a hard stop.
    if (handsFree && event.error === 'no-speech') {
      setTimeout(armMic, 300);
    }
  };

  micBtn.addEventListener('click', () => {
    if (handsFree) {
      handsFree = false;
      micBtn.classList.remove('hands-free');
      recognizer.stop();
      window.speechSynthesis.cancel();
      return;
    }
    handsFree = true;
    micBtn.classList.add('hands-free');
    armMic();
  });
} else {
  micBtn.disabled = true;
  micBtn.title = 'Speech recognition not available in this build';
}
