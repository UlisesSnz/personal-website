import AnimatedText from '@/components/Animations/AnimatedText';
import Layout from '@/components/Shared/Layout';
import SortControls from '@/components/Shared/SortControls';
import TagControls from '@/components/Shared/TagControls';
import FeaturedArticleCard from '@/components/Blog/FeaturedArticleCard';
import { CanaryActionController } from '@/components/Canary';
import { getArticles } from '@/sanity/sanity.query';
import { normalizeContentSort, sortContentItems } from '@/utils/contentSort';
import {
  filterContentItemsByTags,
  formatContentTagsQuery,
  getContentTagOptions,
  normalizeContentTags,
} from '@/utils/contentTagFilter';
import { getStaticPageMetadata } from '@/utils/seoMetadata';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return getStaticPageMetadata('blog', locale);
}

const BlogPage = async ({ params, searchParams }) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Blog');
  const resolvedSearchParams = await searchParams;
  const activeSort = normalizeContentSort(resolvedSearchParams?.sort);
  const allArticles = await getArticles(locale);
  const tagOptions = getContentTagOptions(allArticles, locale);
  const activeTags = normalizeContentTags(resolvedSearchParams?.tags, tagOptions);
  const articles = sortContentItems(
    filterContentItemsByTags(allArticles, activeTags),
    activeSort,
    locale
  );
  const activeTagLabels = activeTags.map(
    (tag) => tagOptions.find((option) => option.value === tag)?.label || tag
  );

  return (
    <>
      <main className="w-full mb-16 flex flex-col items-center justify-center overflow-hidden dark:text-light">
        <Layout className="pt-16">
          <AnimatedText text={t('title')} className="mb-8 lg:!text-7xl sm:mb-6 sm:!text-6xl xs:!text-4xl" />
          <div className="mb-16 flex w-full items-center justify-between gap-6 sm:mb-8 sm:gap-3">
            <CanaryActionController
              context={{
                pageType: "blog",
                totalCount: articles.length,
                activeTags: activeTagLabels,
                activeSort,
              }}
              className="canary-toolbar flex-1"
            />
            <div className="flex shrink-0 items-center justify-end gap-1">
              <TagControls
                activeTags={activeTags}
                basePath="/blog"
                options={tagOptions}
                query={{ sort: activeSort }}
              />
              <SortControls
                activeSort={activeSort}
                basePath="/blog"
                query={{ tags: formatContentTagsQuery(activeTags) }}
              />
            </div>
          </div>
          <ul className="grid grid-cols-4 3xl:grid-cols-3 xl:grid-cols-2 gap-16 lg:gap-8 md:grid-cols-1 md:gap-y-16">
            {articles.map(article => (
              <FeaturedArticleCard
                key={article._id}
                title={article.name}
                summary={article.shortDescription}
                categories={article.categories}
                link={`/blog/${article.slug}`}
                img={article.coverImage}
                date={article.date}
              />
            ))}
          </ul>
        </Layout>
      </main>
    </>
  )
}

export default BlogPage;
