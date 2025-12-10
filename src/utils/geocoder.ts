export type LatLng = { lat: number; lng: number };

export const DEFAULT_COORD: LatLng = { lat: 40.807535, lng: -73.962572 }; // 116th & Broadway

const cache = new Map<string, LatLng>();

type Suggestion = { label: string; tokens: string[]; coord: LatLng };

// Static fallbacks for common Columbia / Barnard locations (approximate but realistic)
const STATIC_SUGGESTIONS: Suggestion[] = [
  { label: 'Butler Library', tokens: ['butler', 'library'], coord: { lat: 40.806047, lng: -73.962669 } },
  { label: 'Lerner Hall', tokens: ['lerner'], coord: { lat: 40.806744, lng: -73.963226 } },
  { label: 'Ferris Booth Commons', tokens: ['ferris'], coord: { lat: 40.806937, lng: -73.963355 } },
  { label: 'Low Steps', tokens: ['low', 'steps'], coord: { lat: 40.807630, lng: -73.963556 } },
  { label: 'College Walk', tokens: ['college', 'walk'], coord: { lat: 40.80792, lng: -73.96313 } },
  { label: 'Alma Mater', tokens: ['alma', 'mater'], coord: { lat: 40.80794, lng: -73.96344 } },
  { label: 'Mudd Building', tokens: ['mudd'], coord: { lat: 40.810046, lng: -73.960698 } },
  { label: 'CEPSR', tokens: ['cepsr'], coord: { lat: 40.809042, lng: -73.959629 } },
  { label: 'Pupin Hall', tokens: ['pupin'], coord: { lat: 40.810829, lng: -73.960219 } },
  { label: 'NoCo (Northwest Corner)', tokens: ['noco'], coord: { lat: 40.810774, lng: -73.959059 } },
  { label: 'Blue Java', tokens: ['blue', 'java'], coord: { lat: 40.806685, lng: -73.96325 } },
  { label: 'Dodge Hall', tokens: ['dodge'], coord: { lat: 40.80711, lng: -73.96393 } },
  { label: 'Avery Hall', tokens: ['avery'], coord: { lat: 40.80662, lng: -73.96193 } },
  { label: 'Schermerhorn Hall', tokens: ['schermerhorn'], coord: { lat: 40.80821, lng: -73.95995 } },
  { label: 'Barnard Diana Center', tokens: ['barnard', 'diana'], coord: { lat: 40.80867, lng: -73.96485 } },
  { label: 'Barnard Milstein Center', tokens: ['barnard', 'milstein'], coord: { lat: 40.80903, lng: -73.96445 } },
  { label: 'Riverside Park', tokens: ['riverside'], coord: { lat: 40.810256, lng: -73.96392 } },
  { label: 'John Jay Hall', tokens: ['john', 'jay'], coord: { lat: 40.807382, lng: -73.96361 } },
  { label: 'Hartley Hall', tokens: ['hartley'], coord: { lat: 40.80724, lng: -73.96382 } },
  { label: 'Wien Hall', tokens: ['wein', 'wien'], coord: { lat: 40.80843, lng: -73.96288 } },
  { label: 'East Campus', tokens: ['ec', 'east', 'campus'], coord: { lat: 40.80799, lng: -73.96142 } },
  { label: 'Package Center', tokens: ['package', 'center'], coord: { lat: 40.80508, lng: -73.96565 } },
  { label: 'Riverside Church', tokens: ['riverside', 'church'], coord: { lat: 40.810805, lng: -73.963469 } },
  { label: 'Heights Deli', tokens: ['heights', 'deli'], coord: { lat: 40.810145, lng: -73.96377 } },
  { label: '116th & Broadway', tokens: ['116', 'broadway'], coord: { lat: 40.807535, lng: -73.962572 } },
];

export async function geocodeLocation(
  location: string,
  fallback: LatLng = DEFAULT_COORD,
  options: { online?: boolean } = {},
): Promise<LatLng> {
  const key = location.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key)!;

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
      const data = (await res.json()) as any[];
      if (Array.isArray(data) && data.length > 0 && data[0]?.lat && data[0]?.lon) {
        const coord: LatLng = { lat: Number(data[0].lat), lng: Number(data[0].lon) };
        cache.set(key, coord);
        return coord;
      }
    }
  } catch (error) {
    // Ignore network/geocode errors; fallback below.
    console.warn('Geocode failed, using fallback', error);
  }

  cache.set(key, fallback);
  return fallback;
}

export function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function matchStatic(loc: string): LatLng | null {
  for (const entry of STATIC_SUGGESTIONS) {
    if (entry.tokens.every((k) => loc.includes(k))) return entry.coord;
  }
  return null;
}

export function suggestLocations(query: string, limit = 6): Suggestion[] {
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

