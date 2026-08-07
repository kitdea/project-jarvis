// "What's new in marketing" brief cards — Step 6. Fetches stored briefs on
// load, listens for live ones pushed over WebSocket (see app.js's
// 'jarvis-brief' CustomEvent, sourced from briefs.js server-side), and lets
// the user dismiss cards or trigger a fresh one on demand.
(function () {
  const cardsEl = document.getElementById('cards');
  const newBtn = document.getElementById('brief-new');
  const clearBtn = document.getElementById('cards-clear');

  function timeAgo(ts) {
    const sec = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (sec < 60) return 'just now';
    const min = Math.round(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return `${Math.round(hr / 24)}d ago`;
  }

  function renderCard(brief) {
    const el = document.createElement('div');
    el.className = 'card';
    el.dataset.id = brief.id;
    el.innerHTML =
      `<div class="card-header">` +
      `<span class="card-title">${brief.title}</span>` +
      `<span class="card-time">${timeAgo(brief.createdAt)}</span>` +
      `<button type="button" class="card-close" title="Dismiss">×</button>` +
      `</div>` +
      `<div class="card-body"></div>`;
    el.querySelector('.card-body').textContent = brief.text || '(empty)';
    el.querySelector('.card-close').addEventListener('click', async () => {
      el.remove();
      try {
        await fetch(`/api/briefs/${encodeURIComponent(brief.id)}`, { method: 'DELETE' });
      } catch {
        // Already removed from view; a failed server-side delete just means
        // it reappears on next full reload — not worth surfacing an error for.
      }
      renderEmptyStateIfNeeded();
    });
    return el;
  }

  function renderEmptyStateIfNeeded() {
    if (cardsEl.children.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'card-empty';
      empty.textContent = 'No briefs yet — click "+ New Brief" or wait for the daily one.';
      cardsEl.appendChild(empty);
    }
  }

  function clearEmptyState() {
    const empty = cardsEl.querySelector('.card-empty');
    if (empty) empty.remove();
  }

  function prependCard(brief) {
    clearEmptyState();
    cardsEl.insertBefore(renderCard(brief), cardsEl.firstChild);
  }

  async function loadBriefs() {
    try {
      const res = await fetch('/api/briefs');
      const data = await res.json();
      cardsEl.innerHTML = '';
      for (const brief of data.briefs || []) {
        cardsEl.appendChild(renderCard(brief));
      }
      renderEmptyStateIfNeeded();
    } catch (err) {
      cardsEl.innerHTML = `<div class="card-empty">Couldn't load briefs: ${err.message}</div>`;
    }
  }

  window.addEventListener('jarvis-brief', (e) => prependCard(e.detail));

  newBtn.addEventListener('click', async () => {
    newBtn.disabled = true;
    newBtn.textContent = 'Generating…';
    try {
      const res = await fetch('/api/briefs/refresh', { method: 'POST' });
      const data = await res.json();
      if (data.brief) prependCard(data.brief);
      else if (data.error) throw new Error(data.error);
    } catch (err) {
      prependCard({ id: `err_${Date.now()}`, title: 'Brief failed', text: err.message, createdAt: Date.now() });
    } finally {
      newBtn.disabled = false;
      newBtn.textContent = '+ New Brief';
    }
  });

  clearBtn.addEventListener('click', async () => {
    cardsEl.innerHTML = '';
    renderEmptyStateIfNeeded();
    try {
      await fetch('/api/briefs/clear', { method: 'POST' });
    } catch {
      // View already cleared; a failed server-side clear just means old
      // briefs reappear on next reload.
    }
  });

  loadBriefs();
})();
