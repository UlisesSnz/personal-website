import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link, permanentRedirect, redirect } from '@/i18n/navigation';
import AnimatedText from '@/components/Animations/AnimatedText';
import PostCard from '@/components/Post/PostCard';
import Layout from '@/components/Shared/Layout';
import ContentTypeControls from '@/components/Shared/ContentTypeControls';
import SortControls from '@/components/Shared/SortControls';
import { CanaryActionController } from '@/components/Canary';
import {
  getCategories,
  getCategoryBySlug,
  getCategorySeo,
  getPostsBySlug,
  getRecentPosts,
} from '@/sanity/sanity.query';
import ListCard from '@/components/Post/ListCard';
import { normalizeContentSort, sortContentItems } from '@/utils/contentSort';
import { filterContentItemsByType, normalizeContentTypeFilter } from '@/utils/contentTypeFilter';
import { buildMetadata, buildTranslatedPathnames } from '@/utils/seoMetadata';
import { LocalePathRegistration } from '@/components/Navbar/LocalePathContext';

export async function generateMetadata({ params }) {
  const { locale, posts: requestedSlug } = await params;
  const { content: category } = await getCategoryBySlug(requestedSlug, locale, { stega: false });
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  if (!category) return {};

  let seo;
  try {
    seo = await getCategorySeo(category.slug, locale);
  } catch {
    console.error(`No fue posible cargar el SEO de la categoría ${category.slug}.`);
  }

  return buildMetadata({
    seo,
    title: category.name,
    description: t('categoriesDescription'),
    pathname: `/search/${category.slug}`,
    locale,
    alternatePathnames: buildTranslatedPathnames(category.translations, '/search'),
  });
}

export default async function PostsPage({ params, searchParams }) {
  const [{ locale, posts: requestedSlug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  setRequestLocale(locale);
  const t = await getTranslations('Search');
  const activeSort = normalizeContentSort(resolvedSearchParams?.sort);
  const activeType = normalizeContentTypeFilter(resolvedSearchParams?.type);
  const { content: category, sourceExists } = await getCategoryBySlug(requestedSlug, locale);

  if (!category) {
    if (sourceExists) redirect({ href: '/blog', locale });
    notFound();
  }

  if (category.slug !== requestedSlug) {
    permanentRedirect({ href: `/search/${category.slug}`, locale });
  }

  const [categories, recentPosts, postsBySlug] = await Promise.all([
    getCategories(locale),
    getRecentPosts(locale),
    getPostsBySlug(category.slug, locale),
  ]);
  const posts = sortContentItems(
    filterContentItemsByType(postsBySlug, activeType),
    activeSort,
    locale
  );
  const translatedPathnames = buildTranslatedPathnames(category.translations, '/search');
  const alternatePathnames = {
    es: translatedPathnames.es || '/blog',
    en: translatedPathnames.en || '/blog',
    [locale]: `/search/${category.slug}`,
  };

  return (
    <main className="w-full mb-16 flex flex-col items-center justify-center dark:text-light">
      <LocalePathRegistration pathnames={alternatePathnames} />
      <Layout className="pt-16">
        <AnimatedText
          text={category.name}
          className="mb-8 lg:!text-7xl sm:mb-6 sm:!text-6xl xs:!text-4xl"
        />
        <div className="mb-12 flex w-full items-center justify-between gap-6 sm:mb-8 sm:gap-3">
          <CanaryActionController
            context={{
              pageType: 'search',
              totalCount: posts.length,
              categoryName: category.name,
              activeType,
              activeSort,
            }}
            className="canary-toolbar flex-1"
          />
          <div className="flex shrink-0 items-center justify-end gap-1">
            <ContentTypeControls
              activeType={activeType}
              basePath={`/search/${category.slug}`}
              query={{ sort: activeSort }}
            />
            <SortControls
              activeSort={activeSort}
              basePath={`/search/${category.slug}`}
              query={{ type: activeType }}
            />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-y-8 gap-16 xl:gap-8 md:gap-x-0 mt-8">
          <div className="col-span-2 lg:col-span-12">
            <details
              className="border-[1px] border-solid border-dark dark:border-light rounded-xl p-4 sticky top-6 max-h-[80vh] overflow-hidden overflow-y-auto"
              open
            >
              <summary className="text-lg font-bold cursor-pointer">{t('categories')}</summary>
              <ul className="mt-4 text-base">
                {categories.map((item) => (
                  <li key={item.slug} className="py-1">
                    <Link
                      href={{
                        pathname: `/search/${item.slug}`,
                        query: { sort: activeSort, type: activeType },
                      }}
                      className="flex items-center justify-start transform transition-transform duration-300 hover:translate-x-2"
                    >
                      <span className={item.slug === category.slug ? 'underline underline-offset-2' : ''}>
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </div>
          <div className="col-span-10 lg:col-span-12 font-medium max-w-max">
            <div className="grid grid-cols-3 lg:grid-cols-2 sm:grid-cols-1 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  title={post.name}
                  summary={post.shortDescription}
                  categories={post.categories}
                  img={post.coverImage}
                  link={post.slug}
                  github={post.githubUrl}
                />
              ))}
            </div>
          </div>
        </div>
        <h2 className="font-bold text-4xl w-full text-center my-16 mt-32">{t('recent')}</h2>
        <ul>
          {recentPosts.map((post) => (
            <ListCard
              key={post._id}
              title={post.name}
              date={post.date}
              img={post.coverImage}
              link={post.slug}
            />
          ))}
        </ul>
      </Layout>
    </main>
  );
}
