export function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(val, max));
}

export function wait(seconds: number): Promise<void> {
  return new Promise((res) => setTimeout(res, seconds * 1000));
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

const PI180th = Math.PI / 180;
const n180PIth = 180 / Math.PI;

export function deg2rad(degrees: number): number {
  return degrees * PI180th;
}

export function rad2deg(radians: number): number {
  return radians * n180PIth;
}
