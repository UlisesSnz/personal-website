import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_VIDEO_BYTES, getVideoAssetRefs, parseYouTubeId, resolveVideoSource,
  validateMp4Asset, validateVideoSource, validateVttAsset,
} from './portableVideo.js';

const id = 'M7lc1UVf-VE';
const mp4 = { _id: 'file-mp4', _type: 'sanity.fileAsset', mimeType: 'video/mp4', extension: 'mp4', size: 12_000, url: 'https://cdn.sanity.io/files/project/production/video.mp4' };
const vtt = { _id: 'file-vtt', _type: 'sanity.fileAsset', mimeType: 'text/plain', extension: 'vtt', size: 150, url: 'https://cdn.sanity.io/files/project/production/captions.vtt' };
const ref = (asset) => ({ asset: { _ref: asset._id } });
const caption = { _key: 'es', language: 'es', label: 'Español', file: ref(vtt) };

test('accepts supported YouTube links and extracts only the video id', () => {
  for (const url of [
    `https://www.youtube.com/watch?v=${id}&list=ignored&t=12s`,
    `https://youtube.com/watch?v=${id}`, `http://m.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}?si=ignored`, `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/embed/${id}`, `https://www.youtube-nocookie.com/embed/${id}`,
  ]) assert.equal(parseYouTubeId(url), id, url);
});

test('rejects deceptive domains, credentials, non-web URLs and malformed ids', () => {
  for (const url of [undefined, null, '', id, '<iframe src="https://youtube.com">',
    `https://youtube.com.evil.test/watch?v=${id}`, `https://notyoutube.com/watch?v=${id}`,
    `https://youtube.com@evil.test/watch?v=${id}`, `https://evil.test@youtube.com/watch?v=${id}`,
    `javascript:alert(1)`, `ftp://youtube.com/watch?v=${id}`, `https://youtu.be/${id}/extra`,
    `https://youtube.com:8080/watch?v=${id}`, `https://youtube.com/playlist?list=${id}`,
    'https://youtube.com/watch?v=short', 'https://youtu.be/abcdefghij%22',
  ]) assert.equal(parseYouTubeId(url), null, String(url));
});

test('validates MP4 metadata and the exact decimal 100 MB limit', () => {
  assert.equal(validateMp4Asset({ ...mp4, size: MAX_VIDEO_BYTES }), true);
  for (const asset of [null, {}, { ...mp4, size: MAX_VIDEO_BYTES + 1 }, { ...mp4, size: 0 },
    { ...mp4, size: NaN }, { ...mp4, size: '12000' }, { ...mp4, mimeType: 'video/quicktime' },
    { ...mp4, extension: 'mov' }, { ...mp4, _type: 'sanity.imageAsset' },
  ]) assert.notEqual(validateMp4Asset(asset), true);
});

test('validates only the active source, including when switching away from unfinished files', () => {
  const video = { source: 'file', file: ref(mp4), youtubeUrl: 'invalid', captions: [caption] };
  assert.equal(validateVideoSource(video, [mp4, vtt]), true);
  assert.deepEqual(getVideoAssetRefs(video), [mp4._id, vtt._id]);
  const youtube = { ...video, source: 'youtube', youtubeUrl: `https://youtu.be/${id}`, captions: [{}] };
  assert.equal(validateVideoSource(youtube), true);
  assert.deepEqual(getVideoAssetRefs(youtube), []);
  assert.notEqual(validateVideoSource({ ...video, file: undefined }, [mp4, vtt]), true);
  assert.notEqual(validateVideoSource(video, [vtt]), true);
  assert.notEqual(validateVideoSource({ source: 'other' }), true);
});

test('validates VTT references, labels, supported languages and uniqueness', () => {
  assert.equal(validateVttAsset(vtt), true);
  assert.equal(validateVttAsset({ ...vtt, mimeType: 'application/octet-stream' }), true);
  assert.notEqual(validateVttAsset({ ...vtt, extension: 'srt' }), true);
  assert.notEqual(validateVttAsset({ ...vtt, size: 0 }), true);
  for (const captions of [[caption, caption], [{ ...caption, language: 'fr' }],
    [{ ...caption, label: '   ' }], [{ ...caption, file: undefined }],
  ]) assert.notEqual(validateVideoSource({ source: 'file', file: ref(mp4), captions }, [mp4, vtt]), true);
});

test('frontend resolves only the active source and rejects missing or unsafe assets', () => {
  const video = { source: 'file', file: { asset: mp4 }, youtubeUrl: `https://youtu.be/${id}` };
  assert.equal(resolveVideoSource(video).url, mp4.url);
  assert.deepEqual(resolveVideoSource({ ...video, source: 'youtube' }), { source: 'youtube', id, url: `https://www.youtube.com/watch?v=${id}` });
  for (const asset of [undefined, { _ref: mp4._id }, { ...mp4, size: MAX_VIDEO_BYTES + 1 },
    { ...mp4, url: 'javascript:alert(1)' }, { ...mp4, url: 'https://cdn.sanity.io.evil.test/files/p/d/v.mp4' },
  ]) assert.equal(resolveVideoSource({ ...video, file: { asset } }), null);
  assert.equal(resolveVideoSource({ ...video, source: 'youtube', youtubeUrl: 'invalid' }), null);
  assert.equal(resolveVideoSource(null), null);
});

test('frontend preserves valid subtitles and safely discards broken or duplicate tracks', () => {
  const valid = { ...caption, file: { asset: vtt } };
  const source = resolveVideoSource({ source: 'file', file: { asset: mp4 }, captions: [null, valid, valid, { ...valid, language: 'en', file: { asset: null } }] });
  assert.deepEqual(source.captions, [{ key: 'es', language: 'es', label: 'Español', url: vtt.url }]);
});
