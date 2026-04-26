/* ================================================
   MADRID REFUGIO — PROTOTYPE SCRIPT
   ================================================ */

// ── NAV SCROLL SHADOW ───────────────────────────
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 10);
});

// ── MOBILE NAV TOGGLE ───────────────────────────
const toggle     = document.querySelector('.nav__toggle');
const mobileMenu = document.querySelector('.nav__mobile');
toggle?.addEventListener('click', () => mobileMenu?.classList.toggle('open'));

// Close mobile menu on link click
mobileMenu?.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => mobileMenu.classList.remove('open'))
);

// ── COUNTUP ─────────────────────────────────────
function animateCount(el) {
  const target   = parseFloat(el.dataset.target);
  const duration = 1500;
  const start    = performance.now();
  const isFloat  = target % 1 !== 0;
  const prefix   = el.dataset.prefix || '';
  const suffix   = el.dataset.suffix || '';

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = target * eased;
    el.textContent = prefix +
      (isFloat ? current.toFixed(1) : Math.floor(current).toLocaleString('es-ES')) +
      suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── INTERSECTION OBSERVER (reveal + countup) ────
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('visible');
    if (el.dataset.target !== undefined) animateCount(el);
    io.unobserve(el);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in, [data-target]').forEach(el => io.observe(el));

// ── ROUTE PLANNER DEMO ──────────────────────────
const routeForm   = document.getElementById('route-form');
const routeResult = document.getElementById('route-result');

routeForm?.addEventListener('submit', e => {
  e.preventDefault();
  const origin = document.getElementById('origin')?.value?.trim();
  if (!origin) return;

  const profile = document.getElementById('profile')?.value || 'elderly';
  const profiles = {
    elderly:  { time: '22', shadow: '78', delta: '−5', refuges: '4' },
    walking:  { time: '15', shadow: '71', delta: '−4', refuges: '3' },
    cycling:  { time: '8',  shadow: '62', delta: '−3', refuges: '2' },
  };
  const p = profiles[profile] || profiles.walking;

  if (routeResult) {
    routeResult.innerHTML = `
      <div class="route-result__header">✓ Ruta optimizada encontrada</div>
      <div class="route-result__stat">Distancia total      <strong>1.4 km</strong></div>
      <div class="route-result__stat">Tiempo estimado      <strong>${p.time} min</strong></div>
      <div class="route-result__stat">Refugios en ruta     <strong>${p.refuges}</strong></div>
      <div class="route-result__stat">Cobertura de sombra  <strong>${p.shadow} %</strong></div>
      <div class="route-result__stat">Temperatura percibida <strong>${p.delta} °C</strong></div>
    `;
    routeResult.classList.add('visible');
  }
});

// ── LEAFLET MAP HELPERS ──────────────────────────
function initLeaflet(containerId, lat, lng, zoom) {
  if (typeof L === 'undefined') return null;
  const el = document.getElementById(containerId);
  if (!el) return null;
  const map = L.map(containerId, { zoomControl: !containerId.includes('hero'), attributionControl: false })
               .setView([lat, lng], zoom);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors, © CARTO',
    maxZoom: 19
  }).addTo(map);
  return map;
}

function heatColor(t) {
  // cyan → amber → terracotta
  if (t < 0.5) {
    const u = t * 2;
    return `rgb(${Math.round(79 + 150*u)},${Math.round(188 - 23*u)},${Math.round(212 - 119*u)})`;
  }
  const u = (t - 0.5) * 2;
  return `rgb(${Math.round(229 - 32*u)},${Math.round(165 - 107*u)},${Math.round(93 - 35*u)})`;
}

// Possible property names for the heat/vulnerability index
function getPropValue(props) {
  return props.vulnerability_index ?? props.INDICE_CALOR ?? props.indice_calor ??
         props.heat_index ?? props.HEAT_INDEX ?? props.VULNERABILITY ??
         props.vulnerability ?? props.priority_score_norm ?? 0;
}
function getPropName(props) {
  return props.NOMBRE ?? props.nombre ?? props.BARRIO ?? props.barrio ??
         props.name ?? props.NAME ?? '—';
}

function loadGeoJSON(map, rankingListId, isHero) {
  // Try local copy first (prototype/data/), then parent project path as fallback
  const paths = [
    './data/barrios_merged.geojson',
    '../frontend/public/data/barrios_merged.geojson',
  ];

  function tryLoad(idx) {
    if (idx >= paths.length) {
      showFallback(map._container.id);
      return;
    }
    fetch(paths[idx])
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(geojson => renderGeoJSON(map, geojson, rankingListId, isHero))
      .catch(() => tryLoad(idx + 1));
  }
  tryLoad(0);
}

function renderGeoJSON(map, geojson, rankingListId, isHero) {
  const vals = geojson.features.map(f => getPropValue(f.properties)).filter(v => v > 0);
  if (!vals.length) { showFallback(map._container.id); return; }
  const min = Math.min(...vals);
  const max = Math.max(...vals);

  const layer = L.geoJSON(geojson, {
    style: f => {
      const v = getPropValue(f.properties);
      return {
        fillColor:   heatColor((v - min) / (max - min || 1)),
        fillOpacity: isHero ? 0.6 : 0.7,
        color:       '#ffffff',
        weight:      isHero ? 0.5 : 1,
      };
    },
    onEachFeature: (f, lyr) => {
      const name = getPropName(f.properties);
      const val  = getPropValue(f.properties);
      lyr.bindTooltip(
        `<strong>${name}</strong><br>Índice: ${typeof val === 'number' ? val.toFixed(1) : val}`,
        { sticky: true, className: 'map-tooltip' }
      );
    }
  }).addTo(map);

  map.fitBounds(layer.getBounds(), { padding: [8, 8] });

  // Build ranking
  if (rankingListId) {
    const listEl = document.getElementById(rankingListId);
    if (listEl) {
      const sorted = [...geojson.features]
        .filter(f => getPropValue(f.properties) > 0)
        .sort((a, b) => getPropValue(b.properties) - getPropValue(a.properties))
        .slice(0, 10);

      listEl.innerHTML = sorted.map((f, i) => {
        const name = getPropName(f.properties);
        const val  = getPropValue(f.properties);
        const pct  = Math.round((val - min) / (max - min) * 100);
        return `
          <div class="ranking-item">
            <span class="ranking-item__rank">${String(i + 1).padStart(2, '0')}</span>
            <span class="ranking-item__name">${name}</span>
            <div class="score-bar"><div class="score-bar__fill" style="width:${pct}%"></div></div>
            <span class="ranking-item__score">${typeof val === 'number' ? val.toFixed(1) : val}</span>
          </div>`;
      }).join('');
    }
  }
}

function showFallback(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100%;
                color:var(--text-muted);font-size:.84rem;flex-direction:column;gap:.65rem;
                background:var(--surface);">
      <span style="font-size:2rem">🗺️</span>
      <span>Mapa interactivo — versión web</span>
      <span style="font-size:.72rem;opacity:.65;text-align:center;max-width:22ch;">
        Abre el prototipo con un servidor local para cargar los datos geográficos
      </span>
    </div>`;
}

// ── INIT MAPS ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (typeof L !== 'undefined') {
    const heroMap = initLeaflet('hero-map', 40.4168, -3.7038, 11);
    if (heroMap) loadGeoJSON(heroMap, null, true);

    const mainMap = initLeaflet('main-map', 40.4168, -3.7038, 11);
    if (mainMap) loadGeoJSON(mainMap, 'ranking-list', false);
  }
});
