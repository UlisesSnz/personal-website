import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getProjectSlugs, getSingleProject } from '@/sanity/sanity.query';
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
      const projects = await getProjectSlugs(locale);
      return projects.map(({ slug }) => ({ locale, project: slug }));
    })
  );

  return entries.flat();
}

export async function generateMetadata({ params }) {
  const { locale, project: slug } = await params;
  const { content: project } = await getSingleProject(slug, locale, { stega: false });

  if (!project) return {};

  return buildMetadata({
    seo: project.seo,
    title: project.name,
    description: project.shortDescription,
    pathname: `/projects/${project.slug}`,
    locale,
    alternatePathnames: buildTranslatedPathnames(project.translations, '/projects'),
  });
}

export default async function ProjectPage({ params }) {
  const { locale, project: slug } = await params;
  setRequestLocale(locale);
  const { content: project, sourceExists } = await getSingleProject(slug, locale);
  const isPreview = (await draftMode()).isEnabled;

  if (!project) {
    if (sourceExists) redirect({ href: '/projects', locale });
    notFound();
  }

  if (project.slug !== slug) {
    permanentRedirect({ href: `/projects/${project.slug}`, locale });
  }

  const shareUrl = `${siteMetadata.siteUrl}/${locale}/projects/${project.slug}`;
  const translatedPathnames = buildTranslatedPathnames(project.translations, '/projects');
  const alternatePathnames = {
    es: translatedPathnames.es || '/projects',
    en: translatedPathnames.en || '/projects',
    [locale]: `/projects/${project.slug}`,
  };

  return (
    <>
      <LocalePathRegistration pathnames={alternatePathnames} />
      <Post
        isPreview={isPreview}
        postId={project._id}
        contentType="project"
        title={project.name || (locale === 'en' ? 'Untitled draft' : 'Borrador sin título')}
        estimatedReadingTime={project.estimatedReadingTime}
        coverImage={project.coverImage}
        headings={project.headings}
        description={project.description || []}
        githubUrl={project.githubUrl}
        projectUrl={project.projectUrl}
        categories={project.categories}
        slug={project.slug}
        date={project.date}
        shareUrl={shareUrl}
      />
    </>
  );
}
