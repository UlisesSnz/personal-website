import { getTranslations } from 'next-intl/server';
import { getPageSeo } from '@/sanity/sanity.query';
import { urlFor } from '@/sanity/lib/image';
import siteMetadata from '@/utils/siteMetaData';
import { getLocaleDefinition } from '@/i18n/config';
import { isEnglishEnabled } from '@/i18n/runtime';

const PAGE_METADATA_KEYS = {
  home: { title: null, description: 'siteDescription', pathname: '/', absoluteTitle: true },
  about: { title: 'aboutTitle', description: 'aboutDescription', pathname: '/about' },
  contact: { title: 'contactTitle', description: 'contactDescription', pathname: '/contact' },
  projects: { title: 'projectsTitle', description: 'projectsDescription', pathname: '/projects' },
  blog: { title: 'blogTitle', description: 'blogDescription', pathname: '/blog' },
  categories: { title: 'categoriesTitle', description: 'categoriesDescription', pathname: '/search' },
};

const resolveImageUrl = (image) => {
  if (!image) return undefined;
  if (typeof image === 'string') return image;
  if (typeof image.image === 'string') return image.image;
  if (!image.asset) return undefined;

  return urlFor(image).width(1200).height(630).fit('crop').url();
};

const localizedUrl = (locale, pathname = '/') => {
  const suffix = pathname === '/' ? '' : pathname;
  return new URL(`/${locale}${suffix}`, `${siteMetadata.siteUrl}/`).toString();
};

export function buildMetadata({
  seo,
  title,
  description,
  pathname,
  locale,
  type = 'website',
  absoluteTitle = false,
  alternatePathnames,
}) {
  const resolvedTitle = seo?.title || title || siteMetadata.title;
  const resolvedDescription = seo?.description || description;
  const canonical = localizedUrl(locale, pathname);
  const imageUrl = resolveImageUrl(seo?.image);
  const imageAlt = seo?.image?.alt || resolvedTitle;
  const localeDefinition = getLocaleDefinition(locale);
  const enabledLocales = isEnglishEnabled() ? ['es', 'en'] : ['es'];
  const alternateLocales = enabledLocales.filter((targetLocale) =>
    alternatePathnames ? Boolean(alternatePathnames[targetLocale]) : true
  );
  const languageAlternates = Object.fromEntries(
    alternateLocales
      .map((targetLocale) => [
        targetLocale,
        localizedUrl(
          targetLocale,
          alternatePathnames?.[targetLocale] || pathname
        ),
      ])
  );

  const openGraph = {
    title: resolvedTitle,
    description: resolvedDescription,
    url: canonical,
    siteName: siteMetadata.title,
    locale: localeDefinition.openGraphLocale,
    alternateLocale: alternateLocales
      .filter((targetLocale) => targetLocale !== locale)
      .map((targetLocale) => getLocaleDefinition(targetLocale).openGraphLocale),
    type,
  };

  const twitter = {
    card: 'summary_large_image',
    title: resolvedTitle,
    description: resolvedDescription,
  };

  if (imageUrl) {
    openGraph.images = [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt }];
    twitter.images = [imageUrl];
  }

  return {
    title: absoluteTitle ? { absolute: resolvedTitle } : resolvedTitle,
    description: resolvedDescription,
    alternates: {
      canonical,
      languages: languageAlternates,
    },
    openGraph,
    twitter,
  };
}

export async function getStaticPageMetadata(pageKey, locale) {
  const definition = PAGE_METADATA_KEYS[pageKey];
  if (!definition) throw new Error(`No existen metadatos predeterminados para: ${pageKey}`);

  const t = await getTranslations({ locale, namespace: 'Metadata' });
  let seo;

  try {
    seo = await getPageSeo(pageKey, locale);
  } catch {
    console.error(`No fue posible cargar el SEO de ${pageKey}.`);
  }

  return buildMetadata({
    seo,
    locale,
    pathname: definition.pathname,
    absoluteTitle: definition.absoluteTitle,
    title: definition.title ? t(definition.title) : siteMetadata.title,
    description: t(definition.description, { email: siteMetadata.email }),
  });
}

export function buildTranslatedPathnames(translations, basePath) {
  return Object.fromEntries(
    (translations || []).map(({ language, slug }) => [
      language,
      slug ? `${basePath}/${slug}` : null,
    ])
  );
}
