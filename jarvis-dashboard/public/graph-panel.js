// Knowledge graph panel: fetches /api/graph (built live from GHL + CallRail
// data server-side, see ../graph.js) and renders it with force-graph
// (served locally from /vendor — see server.js). Independent of app.js's
// chat/voice logic; only shares the page, not any state.
(function () {
  const container = document.getElementById('graph');
  const legendEl = document.getElementById('graph-legend');
  const statusEl = document.getElementById('graph-status');
  const refreshBtn = document.getElementById('graph-refresh');

  const COLORS = {
    Person: '#b98ee0',
    Project: '#4ea1f7',
    Campaign: '#f2a93b',
    Client: '#4ee08a',
    Call: '#5bc8e8',
    Concept: '#e0c23a',
  };
  const DEFAULT_COLOR = '#8a919e';
  const colorFor = (type) => COLORS[type] || DEFAULT_COLOR;

  let fullData = { nodes: [], links: [] };
  const hiddenTypes = new Set();
  let graph = null;

  function filteredData() {
    const nodes = fullData.nodes.filter((n) => !hiddenTypes.has(n.type));
    const nodeIds = new Set(nodes.map((n) => n.id));
    const links = fullData.links.filter((l) => {
      const s = typeof l.source === 'object' ? l.source.id : l.source;
      const t = typeof l.target === 'object' ? l.target.id : l.target;
      return nodeIds.has(s) && nodeIds.has(t);
    });
    return { nodes, links };
  }

  function renderLegend() {
    const counts = {};
    for (const n of fullData.nodes) counts[n.type] = (counts[n.type] || 0) + 1;
    legendEl.innerHTML = '';
    for (const type of Object.keys(counts).sort()) {
      const item = document.createElement('div');
      item.className = 'graph-legend-item' + (hiddenTypes.has(type) ? ' disabled' : '');
      item.innerHTML =
        `<span class="graph-legend-swatch" style="background:${colorFor(type)}"></span>` +
        `<span>${type}</span><span class="graph-legend-count">${counts[type]}</span>`;
      item.addEventListener('click', () => {
        if (hiddenTypes.has(type)) hiddenTypes.delete(type);
        else hiddenTypes.add(type);
        renderLegend();
        if (graph) graph.graphData(filteredData());
      });
      legendEl.appendChild(item);
    }
  }

  function initGraph() {
    graph = ForceGraph()(container)
      .graphData(filteredData())
      .nodeId('id')
      .nodeLabel((n) => `${n.name} (${n.type})`)
      .nodeColor((n) => colorFor(n.type))
      .nodeVal((n) => Math.max(1, n.degree || 0))
      .nodeRelSize(3)
      .linkColor(() => 'rgba(150,160,175,0.25)')
      .linkWidth(0.6)
      .backgroundColor('rgba(0,0,0,0)')
      .width(container.clientWidth)
      .height(container.clientHeight)
      .cooldownTicks(150)
      .onNodeHover((n) => {
        container.style.cursor = n ? 'pointer' : 'default';
      });

    window.addEventListener('resize', () => {
      graph.width(container.clientWidth).height(container.clientHeight);
    });
  }

  async function loadGraph(refresh) {
    statusEl.textContent = refresh ? 'refreshing…' : 'loading…';
    statusEl.classList.remove('error');
    try {
      const res = await fetch(`/api/graph${refresh ? '?refresh=1' : ''}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load graph');

      fullData = data;
      if (!graph) initGraph();
      else graph.graphData(filteredData());
      renderLegend();

      const ageSec = Math.max(0, Math.round((Date.now() - data.cachedAt) / 1000));
      const warnings = data.errors && data.errors.length ? ` · ${data.errors.length} warning(s)` : '';
      statusEl.textContent = `${data.nodes.length} nodes · ${data.links.length} links${warnings} · updated ${ageSec}s ago`;
      if (data.errors && data.errors.length) console.warn('Graph build warnings:', data.errors);
    } catch (err) {
      statusEl.textContent = `Error: ${err.message}`;
      statusEl.classList.add('error');
    }
  }

  refreshBtn.addEventListener('click', () => loadGraph(true));
  loadGraph(false);
})();
