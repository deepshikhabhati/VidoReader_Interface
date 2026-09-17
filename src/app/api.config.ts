export const API_BASE = 'https://vidoreader.onrender.com';

/** Resolve a public file under src/assets so it works on GitHub Pages and locally. */
export function assetUrl(path: string): string {
  if (!path) {
    return path;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const clean = path.replace(/^\/+/, '');
  const baseHref = document.querySelector('base')?.getAttribute('href') || '/';
  const origin = window.location.origin;
  const base = baseHref.endsWith('/') ? baseHref : `${baseHref}/`;
  return new URL(clean, origin + base).href;
}
