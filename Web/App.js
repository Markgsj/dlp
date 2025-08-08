const statusEl = document.getElementById('status');
const ridesEl = document.getElementById('rides');
const parkSel = document.getElementById('park');
const refreshBtn = document.getElementById('refresh');
const notifyDown = document.getElementById('notifyDown');
const notifyRain = document.getElementById('notifyRain');

let map, markersLayer;
let lastRideOpenState = new Map();

function initMap() {
  map = L.map('map').setView([48.870, 2.779], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

async function fetchQueueTimes(parkId) {
  const res = await fetch(`/api/queue-times/${parkId}`);
  if (!res.ok) throw new Error('Failed to fetch queue times');
  return res.json();
}

function renderRides(data) {
  ridesEl.innerHTML = '';
  markersLayer.clearLayers();

  const seen = new Set();
  const allRides = [];
  for (const land of data.lands || []) {
    for (const ride of land.rides) {
      if (!seen.has(ride.id)) { seen.add(ride.id); allRides.push(ride); }
    }
  }

  // Sort: open first by shortest wait, closed at bottom
  allRides.sort((a, b) => {
    if (a.is_open && !b.is_open) return -1;
    if (!a.is_open && b.is_open) return 1;
    if (a.is_open && b.is_open) return (a.wait_time || 0) - (b.wait_time || 0);
    return 0;
  });

  for (const ride of allRides) {
    const row = document.createElement('div');
    row.className = 'ride';
    const name = document.createElement('div');
    name.textContent = ride.name;
    const meta = document.createElement('div');
    const open = ride.is_open;
    meta.innerHTML = `<span class="${open ? 'is-open' : 'is-closed'}">${open ? 'Open' : 'Closed'}</span> <span class="badge">${ride.wait_time} min</span>`;
    row.appendChild(name);
    row.appendChild(meta);
    ridesEl.appendChild(row);

    const prev = lastRideOpenState.get(ride.id);
    if (notifyDown.checked && prev !== undefined && prev === true && open === false) notify(`Ride went down: ${ride.name}`);
    lastRideOpenState.set(ride.id, open);

    if (ride.latitude && ride.longitude) {
      const marker = L.marker([Number(ride.latitude), Number(ride.longitude)]).addTo(markersLayer);
      marker.bindPopup(`<strong>${ride.name}</strong><br/>Wait: ${ride.wait_time} min<br/>${open ? 'Open' : 'Closed'}`);
    }
  }
}

async function checkRain() {
  if (!notifyRain.checked) return;
  try {
    const res = await fetch('/api/weather');
    if (!res.ok) return;
    const data = await res.json();
    const nextHours = (data.hourly || []).slice(0, 3);
    const willRain = nextHours.some(h => (h.pop || 0) >= 0.5 || ((h.rain && h.rain['1h']) || 0) > 0);
    if (willRain) notify('Rain expected in the next few hours. Consider indoor attractions.');
  } catch (e) { /* ignore */ }
}

function notify(message) {
  statusEl.textContent = message;
  try {
    if (Notification && Notification.permission === 'granted') new Notification('DLP Trip Assistant', { body: message });
  } catch {}
}

async function refresh() {
  statusEl.textContent = 'Refreshing…';
  try {
    const data = await fetchQueueTimes(parkSel.value);
    renderRides(data);
    statusEl.textContent = 'Up to date.';
  } catch { statusEl.textContent = 'Failed to refresh queue times.'; }
  checkRain();
}

async function init() {
  initMap();
  if ('Notification' in window && Notification.permission !== 'granted') { try { await Notification.requestPermission(); } catch {} }
  await refresh();
  setInterval(refresh, 5 * 60 * 1000);
}
refreshBtn.addEventListener('click', refresh);
parkSel.addEventListener('change', refresh);
init();
