import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n/config';
import { routing } from '@/i18n/routing';

const handleI18nRouting = createMiddleware(routing);

const pathnameHasLocale = (pathname) =>
  SUPPORTED_LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const previewCookiePresent = Boolean(request.cookies.get('__prerender_bypass')?.value);

  if (!pathnameHasLocale(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(redirectUrl, 308);
  }

  if (
    process.env.ENGLISH_ENABLED !== 'true' &&
    (pathname === '/en' || pathname.startsWith('/en/')) &&
    !previewCookiePresent
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/es${pathname.slice(3)}`;
    return NextResponse.redirect(redirectUrl, 307);
  }

  const response = handleI18nRouting(request);
  if (previewCookiePresent) {
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return response;
}

export const config = {
  matcher: '/((?!api|studio|_next|_vercel|.*\\..*).*)',
};
