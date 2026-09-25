export const MAX_VIDEO_BYTES = 100_000_000;
export const VIDEO_CAPTION_LANGUAGES = ['es', 'en'];

const youtubeHosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com']);
const embedHosts = new Set([...youtubeHosts, 'youtube-nocookie.com', 'www.youtube-nocookie.com']);
const videoIdPattern = /^[a-zA-Z0-9_-]{11}$/;

export function parseYouTubeId(input) {
  if (typeof input !== 'string') return null;

  try {
    const url = new URL(input.trim());
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port) return null;

    const parts = url.pathname.split('/').filter(Boolean);
    let id;
    if (url.hostname === 'youtu.be' && parts.length === 1) {
      id = parts[0];
    } else if (youtubeHosts.has(url.hostname) && url.pathname === '/watch') {
      id = url.searchParams.get('v');
    } else if (embedHosts.has(url.hostname) && parts.length === 2 && parts[0] === 'embed') {
      id = parts[1];
    } else if (youtubeHosts.has(url.hostname) && parts.length === 2 && parts[0] === 'shorts') {
      id = parts[1];
    }

    return videoIdPattern.test(id || '') ? id : null;
  } catch {
    return null;
  }
}

export function validateMp4Asset(asset) {
  if (!asset || asset._type !== 'sanity.fileAsset') return 'Selecciona un archivo de video existente.';
  if (asset.mimeType !== 'video/mp4' || asset.extension?.toLowerCase() !== 'mp4') {
    return 'El video debe ser un archivo MP4, preferentemente H.264/AAC.';
  }
  if (!Number.isSafeInteger(asset.size) || asset.size <= 0) return 'No se pudo comprobar el tamaño del video.';
  if (asset.size > MAX_VIDEO_BYTES) return 'El video supera el límite de 100 MB. Optimízalo o utiliza YouTube.';
  return true;
}

export function validateVttAsset(asset) {
  if (!asset || asset._type !== 'sanity.fileAsset' || asset.extension?.toLowerCase() !== 'vtt') {
    return 'Selecciona un archivo de subtítulos WebVTT (.vtt) existente.';
  }
  // File uploads may be detected as text/plain or application/octet-stream.
  return Number.isSafeInteger(asset.size) && asset.size > 0 ? true : 'El archivo de subtítulos está vacío.';
}

export function getVideoAssetRefs(value) {
  if (value?.source !== 'file') return [];
  return [...new Set([
    value.file?.asset?._ref,
    ...(Array.isArray(value.captions) ? value.captions : []).map((track) => track?.file?.asset?._ref),
  ].filter(Boolean))];
}

export function validateVideoSource(value, assets = []) {
  if (!value) return true;
  if (value.source === 'youtube') {
    return parseYouTubeId(value.youtubeUrl) ? true : 'Introduce un enlace válido de un video de YouTube.';
  }
  if (value.source !== 'file') return 'Selecciona Archivo en Sanity o YouTube.';

  const findAsset = (file) => assets.find((asset) => asset._id === file?.asset?._ref);
  const fileResult = validateMp4Asset(findAsset(value.file));
  if (fileResult !== true) return fileResult;

  const languages = new Set();
  for (const track of Array.isArray(value.captions) ? value.captions : []) {
    if (!VIDEO_CAPTION_LANGUAGES.includes(track?.language)) return 'Selecciona el idioma de cada pista de subtítulos.';
    if (languages.has(track.language)) return 'Solo se permite una pista de subtítulos por idioma.';
    languages.add(track.language);
    if (typeof track.label !== 'string' || !track.label.trim()) return 'Escribe una etiqueta para cada pista de subtítulos.';
    const result = validateVttAsset(findAsset(track.file));
    if (result !== true) return result;
  }
  return true;
}

export function isSanityFileUrl(input) {
  try {
    const url = new URL(input);
    return url.protocol === 'https:' && url.hostname === 'cdn.sanity.io' &&
      !url.username && !url.password && !url.port && /^\/files\/[^/]+\/[^/]+\/[^/]+$/.test(url.pathname);
  } catch {
    return false;
  }
}

/** Resolve only the selected source from the detail query's expanded assets. */
export function resolveVideoSource(value) {
  if (value?.source === 'youtube') {
    const id = parseYouTubeId(value.youtubeUrl);
    return id ? { source: 'youtube', id, url: `https://www.youtube.com/watch?v=${id}` } : null;
  }
  if (value?.source !== 'file') return null;
  const asset = value.file?.asset;
  if (validateMp4Asset(asset) !== true || !isSanityFileUrl(asset.url)) return null;

  const languages = new Set();
  const captions = (Array.isArray(value.captions) ? value.captions : []).filter((track) => {
    const valid = VIDEO_CAPTION_LANGUAGES.includes(track?.language) && !languages.has(track.language) &&
      typeof track.label === 'string' && track.label.trim() &&
      validateVttAsset(track.file?.asset) === true && isSanityFileUrl(track.file.asset.url);
    if (valid) languages.add(track.language);
    return valid;
  }).map((track) => ({ key: track._key || track.language, language: track.language, label: track.label, url: track.file.asset.url }));

  return { source: 'file', url: asset.url, captions };
}
