// Artistic fluid motion: seconds, SVG units, anchored waves and viscous drift.
export const motionProfiles = {
 general: {amplitude: 11, frequency: .16, waves: 1.2, drift: .018},
 p80: {amplitude: 17, frequency: .11, waves: 1, drift: .015},
 p90: {amplitude: 13, frequency: .19, waves: 1.5, drift: .020},
 p00: {amplitude: 9, frequency: .27, waves: 2, drift: .024},
 p10: {amplitude: 6, frequency: .35, waves: 2.5, drift: .028},
};
export function linePhase(a, b) {
 let hash = 0;
 for (const char of [a, b].sort().join(':')) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
 hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
 hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
 hash = (hash ^ (hash >>> 16)) >>> 0;
 return hash / 4294967296 * Math.PI * 2;
}
export function wavePath(a, b, phase, clock, profile) {
 const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
 const nx = length ? -dy / length : 0, ny = length ? dx / length : 0;
 const amplitude = profile.amplitude * Math.min(1, length / 140);
 const points = Array.from({length: 33}, (_, i) => {
  const u = i / 32;
  const wave = Math.sin(u * Math.PI * 2 * profile.waves - clock + phase);
  const offset = (i === 0 || i === 32) ? 0 : amplitude * Math.sin(Math.PI * u) * wave;
  return {x: a.x + dx * u + nx * offset, y: a.y + dy * u + ny * offset};
 });
 let path = `M ${a.x} ${a.y}`;
 for (let i = 1; i < points.length - 1; i++) {
  const p = points[i], next = points[i + 1];
  path += ` Q ${p.x.toFixed(2)} ${p.y.toFixed(2)} ${((p.x + next.x) / 2).toFixed(2)} ${((p.y + next.y) / 2).toFixed(2)}`;
 }
 return path + ` L ${b.x} ${b.y}`;
}
