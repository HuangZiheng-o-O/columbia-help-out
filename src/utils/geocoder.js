export const DEFAULT_COORD = { lat: 40.807535, lng: -73.962572 }; // 116th & Broadway

const cache = new Map();

// Static fallbacks for common Columbia / Barnard locations
const STATIC_SUGGESTIONS = [
  { label: 'Butler Library', tokens: ['butler', 'library'], coord: { lat: 40.806047, lng: -73.962669 } },
  { label: 'Lerner Hall', tokens: ['lerner'], coord: { lat: 40.806744, lng: -73.963226 } },
  { label: 'Ferris Booth Commons', tokens: ['ferris'], coord: { lat: 40.806937, lng: -73.963355 } },
  { label: 'Low Steps', tokens: ['low', 'steps'], coord: { lat: 40.807630, lng: -73.963556 } },
  { label: 'College Walk', tokens: ['college', 'walk'], coord: { lat: 40.80792, lng: -73.96313 } },
  { label: 'Mudd Building', tokens: ['mudd'], coord: { lat: 40.810046, lng: -73.960698 } },
  { label: 'NoCo (Northwest Corner)', tokens: ['noco'], coord: { lat: 40.810774, lng: -73.959059 } },
  { label: 'Package Center', tokens: ['package', 'center'], coord: { lat: 40.80508, lng: -73.96565 } },
  { label: '116th & Broadway', tokens: ['116', 'broadway'], coord: { lat: 40.807535, lng: -73.962572 } },
];

/**
 * Geocode a location string
 * @param {string} location
 * @param {object} fallback
 * @param {object} options
 * @returns {Promise<{lat: number, lng: number}>}
 */
export async function geocodeLocation(location, fallback = DEFAULT_COORD, options = {}) {
  const key = location.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key);

  const staticHit = matchStatic(key);
  if (staticHit) {
    cache.set(key, staticHit);
    return staticHit;
  }

  if (options.online === false) {
    cache.set(key, fallback);
    return fallback;
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0]?.lat && data[0]?.lon) {
        const coord = { lat: Number(data[0].lat), lng: Number(data[0].lon) };
        cache.set(key, coord);
        return coord;
      }
    }
  } catch (error) {
    console.warn('Geocode failed, using fallback', error);
  }

  cache.set(key, fallback);
  return fallback;
}

/**
 * Calculate distance between two coordinates in meters
 * @param {object} a
 * @param {object} b
 * @returns {number}
 */
export function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function matchStatic(loc) {
  for (const entry of STATIC_SUGGESTIONS) {
    if (entry.tokens.every((k) => loc.includes(k))) return entry.coord;
  }
  return null;
}

/**
 * Suggest locations based on query
 * @param {string} query
 * @param {number} limit
 * @returns {object[]}
 */
export function suggestLocations(query, limit = 6) {
  const q = query.trim().toLowerCase();
  if (!q) return STATIC_SUGGESTIONS.slice(0, limit);
  const scored = STATIC_SUGGESTIONS.map((s) => {
    const hit = s.tokens.some((t) => q.includes(t) || t.includes(q));
    const starts = s.label.toLowerCase().startsWith(q);
    const score = (starts ? 2 : 0) + (hit ? 1 : 0);
    return { s, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.s);
  return scored;
}

export const STATIC_LOCATION_LABELS = STATIC_SUGGESTIONS.map((s) => s.label);

