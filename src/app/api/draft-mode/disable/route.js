import { cookies, draftMode } from 'next/headers';
import { NextResponse } from 'next/server';
import { safePreviewPath } from '@/sanity/previewPaths.mjs';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const path = safePreviewPath(new URL(request.url).searchParams.get('returnTo')) || '/es';
  (await draftMode()).disable();
  (await cookies()).delete('sanity-preview-perspective');
  const response = NextResponse.redirect(new URL(path, request.url));
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
