import { defineLocations } from 'sanity/presentation';

const localeOf = (document) => document?.language === 'en' ? 'en' : 'es';
const location = (title, href) => ({ title, href });
const missingSlug = (locale, section) => `/${locale}/${section === 'search' ? 'blog' : section}?previewNotice=missing-slug`;

function detailLocations(section, title) {
  return defineLocations({
    select: { name: 'name', slug: 'slug.current', language: 'language' },
    resolve: (document) => {
      const locale = localeOf(document);
      return {
        locations: [
          location(
            document?.name || title,
            document?.slug ? `/${locale}/${section}/${document.slug}` : missingSlug(locale, section)
          ),
          location(section === 'blog' ? 'Blog' : section === 'projects' ? 'Proyectos' : 'Categorías',
            `/${locale}/${section === 'search' ? 'blog' : section}`),
        ],
      };
    },
  });
}

const aboutLocations = defineLocations({
  select: { language: 'language' },
  resolve: (document) => ({ locations: [location('Sobre mí', `/${localeOf(document)}/about`)] }),
});

export const resolve = {
  locations: {
    article: detailLocations('blog', 'Artículo'),
    project: detailLocations('projects', 'Proyecto'),
    category: detailLocations('search', 'Categoría'),
    profile: defineLocations({
      select: { language: 'language' },
      resolve: (document) => ({
        locations: [
          location('Inicio', `/${localeOf(document)}`),
          location('Sobre mí', `/${localeOf(document)}/about`),
        ],
      }),
    }),
    job: aboutLocations,
    education: aboutLocations,
    seoPage: defineLocations({
      select: { _id: '_id', language: 'language' },
      resolve: (document) => {
        const locale = localeOf(document);
        const pageKey = document?._id?.replace(/^drafts\./, '').replace(/^seo-/, '').replace(/-(es|en)$/, '');
        const paths = {
          default: '', home: '', about: '/about', contact: '/contact',
          projects: '/projects', blog: '/blog', categories: '/blog',
        };
        return { locations: [location('Página', `/${locale}${paths[pageKey] ?? ''}`)] };
      },
    }),
  },
};
