import '@/styles/globals.css';
import { Montserrat } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import { draftMode } from 'next/headers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import siteMetadata from '@/utils/siteMetaData';
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/next"
import { getDefaultSeo, getPublishedContentVersion } from '@/sanity/sanity.query';
import { SanityLive } from '@/sanity/lib/live';
import { refreshPublishedContent } from '@/sanity/lib/liveAction';
import { SanityLiveTabSync } from '@/sanity/lib/SanityLiveTabSync';
import { buildMetadata } from '@/utils/seoMetadata';
import { routing } from '@/i18n/routing';
import { getLocaleDefinition } from '@/i18n/config';
import { isEnglishEnabled } from '@/i18n/runtime';
import { LocalePathProvider } from '@/components/Navbar/LocalePathContext';
import PreviewControls from '@/components/Preview/PreviewControls';

const montserrat = Montserrat({
    subsets: ["latin"],
    variable: "--font-mont",
});

export function generateStaticParams() {
    return routing.locales
        .filter((locale) => locale !== 'en' || isEnglishEnabled())
        .map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
    const { locale } = await params;
    const isPreview = (await draftMode()).isEnabled;
    const t = await getTranslations({ locale, namespace: 'Metadata' });
    let seo;

    try {
        seo = await getDefaultSeo(locale);
    } catch {
        console.error('No fue posible cargar el SEO predeterminado.');
    }

    const brandTitle = seo?.title || siteMetadata.title;
    const metadata = buildMetadata({
        seo,
        title: brandTitle,
        description: t('siteDescription'),
        pathname: '/',
        locale,
        absoluteTitle: true,
    });

    return {
        ...metadata,
        metadataBase: new URL(siteMetadata.siteUrl),
        title: {
            template: `%s | ${brandTitle}`,
            default: brandTitle,
        },
        robots: isPreview
            ? { index: false, follow: false, googleBot: { index: false, follow: false } }
            : {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    noimageindex: true,
                    "max-video-preview": -1,
                    "max-image-preview": "large",
                    "max-snippet": -1,
                },
            },
    };
}

export default async function RootLayout({ children, params }) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    const isPreview = (await draftMode()).isEnabled;
    if (locale === 'en' && !isEnglishEnabled() && !isPreview) redirect('/es');

    setRequestLocale(locale);
    const messages = await getMessages();
    const localeDefinition = getLocaleDefinition(locale);
    const englishEnabled = isEnglishEnabled();
    const isProduction = process.env.VERCEL_ENV === 'production';
    const contentVersion = isProduction && !isPreview
        ? await getPublishedContentVersion(locale)
        : undefined;

    return (
        <html lang={localeDefinition.regionalLocale} data-scroll-behavior="smooth" suppressHydrationWarning>
            <body className={`${montserrat.variable} font-mont bg-light dark:bg-dark w-full min-h-screen`}>
                <Script id='theme-switcher' strategy='afterInteractive'>
                    {`
                        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                            document.documentElement.classList.add('dark')
                        } else {
                            document.documentElement.classList.remove('dark')
                        }
                    `}
                </Script>
                <NextIntlClientProvider messages={messages}>
                    <LocalePathProvider>
                        <Navbar englishEnabled={englishEnabled || isPreview} />
                        {isPreview && <PreviewControls />}
                        {children}
                        <Footer />
                    </LocalePathProvider>
                </NextIntlClientProvider>
                <div id='modal' />
                <Analytics />
                {isPreview ? null : isProduction ? (
                    <>
                        <SanityLive
                            includeDrafts={false}
                            waitFor="function"
                            action="refresh"
                        />
                        <SanityLiveTabSync version={contentVersion} />
                    </>
                ) : (
                    <SanityLive
                        includeDrafts={false}
                        action={refreshPublishedContent}
                    />
                )}
            </body>
        </html>
    );
}
