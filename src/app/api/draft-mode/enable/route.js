import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { client } from '@/sanity/lib/client';
import { safePreviewPath } from '@/sanity/previewPaths.mjs';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!token) return new Response('Preview no configurado.', { status: 503, headers: { 'Cache-Control': 'no-store' } });

  const url = new URL(request.url);
  const pathname = url.searchParams.get('sanity-preview-pathname');
  if (pathname !== null && !safePreviewPath(pathname)) {
    return new Response('Destino de preview inválido.', { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  const secret = url.searchParams.get('sanity-preview-secret');
  if (!secret) return new Response('No autorizado.', { status: 401, headers: { 'Cache-Control': 'no-store' } });

  const previewClient = client.withConfig({ token, apiVersion: '2025-02-19', useCdn: false });
  let privateSecretExists;
  try {
    privateSecretExists = await previewClient.fetch(
      `count(*[
        _type == "sanity.previewUrlSecret" &&
        secret == $secret &&
        dateTime(_updatedAt) > dateTime(now()) - 3600
      ]) > 0`,
      { secret },
      { perspective: 'raw', cache: 'no-store', stega: false }
    );
  } catch {
    return new Response('Preview temporalmente no disponible.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  if (!privateSecretExists) return new Response('No autorizado.', { status: 401, headers: { 'Cache-Control': 'no-store' } });

  const { GET: enableDraftMode } = defineEnableDraftMode({ client: previewClient });
  return enableDraftMode(request);
}
