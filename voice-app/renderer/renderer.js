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

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
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
    if (reply) speak(reply);
  } catch (err) {
    statusEl.remove();
    addMessage(`Error: ${err.message || err}`, 'assistant');
  } finally {
    sendBtn.disabled = false;
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  sendPrompt(input.value);
});

// Mic button: Web Speech API STT, built into Chromium/Electron's renderer.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognizer = null;

if (SpeechRecognition) {
  recognizer = new SpeechRecognition();
  recognizer.lang = 'en-US';
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;

  recognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    sendPrompt(transcript);
  };

  recognizer.onend = () => micBtn.classList.remove('recording');
  recognizer.onerror = () => micBtn.classList.remove('recording');

  micBtn.addEventListener('click', () => {
    if (micBtn.classList.contains('recording')) {
      recognizer.stop();
      return;
    }
    micBtn.classList.add('recording');
    recognizer.start();
  });
} else {
  micBtn.disabled = true;
  micBtn.title = 'Speech recognition not available in this build';
}
