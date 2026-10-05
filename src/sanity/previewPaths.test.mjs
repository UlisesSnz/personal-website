import test from 'node:test';
import assert from 'node:assert/strict';
import { safePreviewPath } from './previewPaths.mjs';

test('permite solo rutas localizadas del sitio', () => {
  assert.equal(safePreviewPath('/es'), '/es');
  assert.equal(safePreviewPath('/en/blog/translated-slug?sort=date-desc'), '/en/blog/translated-slug?sort=date-desc');
  assert.equal(safePreviewPath('/es/projects/new.draft'), '/es/projects/new.draft');
  assert.equal(safePreviewPath('/es/blog?previewNotice=missing-slug'), '/es/blog?previewNotice=missing-slug');
});

test('rechaza destinos externos, rutas internas y segmentos manipulados', () => {
  for (const path of [
    'https://evil.example/', '//evil.example/path', '/api/comment', '/studio',
    '/es/unknown', '/es/blog/a/extra', '/es/blog/../projects',
    '/en/blog/%2e%2e/projects', '/es/blog/a%2fb', '/es/blog/a\\b',
  ]) {
    assert.equal(safePreviewPath(path), null, path);
  }
});

test('quita cualquier secreto de la URL de destino', () => {
  assert.equal(safePreviewPath('/es/blog/post?sanity-preview-secret=abc&sort=date-desc'), '/es/blog/post?sort=date-desc');
});
