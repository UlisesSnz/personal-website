import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getArticleSlugs, getSingleArticle } from '@/sanity/sanity.query';
import Post from '@/components/Post';
import siteMetadata from '@/utils/siteMetaData';
import { buildMetadata, buildTranslatedPathnames } from '@/utils/seoMetadata';
import { permanentRedirect, redirect } from '@/i18n/navigation';
import { LocalePathRegistration } from '@/components/Navbar/LocalePathContext';
import { draftMode } from 'next/headers';
import { isEnglishEnabled } from '@/i18n/runtime';

export async function generateStaticParams() {
  const entries = await Promise.all(
    (isEnglishEnabled() ? ['es', 'en'] : ['es']).map(async (locale) => {
      const articles = await getArticleSlugs(locale);
      return articles.map(({ slug }) => ({ locale, article: slug }));
    })
  );

  return entries.flat();
}

export async function generateMetadata({ params }) {
  const { locale, article: slug } = await params;
  const { content: article } = await getSingleArticle(slug, locale, { stega: false });

  if (!article) return {};

  return buildMetadata({
    seo: article.seo,
    title: article.name,
    description: article.shortDescription,
    pathname: `/blog/${article.slug}`,
    locale,
    type: 'article',
    alternatePathnames: buildTranslatedPathnames(article.translations, '/blog'),
  });
}

export default async function ArticlePage({ params }) {
  const { locale, article: slug } = await params;
  setRequestLocale(locale);
  const { content: article, sourceExists } = await getSingleArticle(slug, locale);
  const isPreview = (await draftMode()).isEnabled;

  if (!article) {
    if (sourceExists) redirect({ href: '/blog', locale });
    notFound();
  }

  if (article.slug !== slug) {
    permanentRedirect({ href: `/blog/${article.slug}`, locale });
  }

  const shareUrl = `${siteMetadata.siteUrl}/${locale}/blog/${article.slug}`;
  const translatedPathnames = buildTranslatedPathnames(article.translations, '/blog');
  const alternatePathnames = {
    es: translatedPathnames.es || '/blog',
    en: translatedPathnames.en || '/blog',
    [locale]: `/blog/${article.slug}`,
  };

  return (
    <>
      <LocalePathRegistration pathnames={alternatePathnames} />
      <Post
        isPreview={isPreview}
        postId={article._id}
        contentType="article"
        title={article.name || (locale === 'en' ? 'Untitled draft' : 'Borrador sin título')}
        estimatedReadingTime={article.estimatedReadingTime}
        coverImage={article.coverImage}
        headings={article.headings}
        description={article.description || []}
        categories={article.categories}
        slug={article.slug}
        date={article.date}
        shareUrl={shareUrl}
      />
    </>
  );
}
