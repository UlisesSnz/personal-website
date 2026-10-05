import 'server-only';

import { groq } from 'next-sanity';
import { draftMode } from 'next/headers';
import { sanityFetch } from './lib/live';
import { getSeoDocumentId } from './seoPages';

const localizedFilter = groq`(
  language == $locale ||
  ($locale == "es" && !defined(language))
)`;

const categoryFields = groq`
  _id,
  name,
  "key": coalesce(key, slug.current),
  "slug": slug.current,
  language
`;

const categoryProjection = groq`{ ${categoryFields} }`;

const categoryDetailProjection = groq`{
  ${categoryFields},
  "translations": *[
    _type == "translation.metadata" && references(^._id)
  ][0].translations[].value->{ language, "slug": slug.current }
}`;

const cardFields = groq`
  _id,
  _type,
  name,
  "slug": slug.current,
  shortDescription,
  coverImage {
    alt,
    "image": asset->url,
    "imageWidth": asset->metadata.dimensions.width,
    "imageHeight": asset->metadata.dimensions.height
  },
  githubUrl,
  projectUrl,
  "date": date,
  categories[]-> ${categoryProjection}
`;

const cardProjection = groq`{ ${cardFields} }`;

const detailProjection = groq`{
  _id,
  _type,
  name,
  "slug": slug.current,
  language,
  shortDescription,
  "seo": {
    "title": coalesce(seo.title, name),
    "description": coalesce(seo.description, shortDescription),
    "image": coalesce(seo.image, coverImage)
  },
  coverImage {
    alt,
    "image": asset->url,
    "imageWidth": asset->metadata.dimensions.width,
    "imageHeight": asset->metadata.dimensions.height
  },
  githubUrl,
  projectUrl,
  description[]{
    ...,
    _type == "portableVideo" => {
      file { asset->{_id, _type, url, mimeType, extension, size} },
      poster { ..., "url": asset->url },
      captions[]{
        _key, language, label,
        file { asset->{_id, _type, url, extension, size} }
      }
    },
    _type == "image" => {
      "image": asset->url,
      alt,
      caption,
      "imageWidth": asset->metadata.dimensions.width,
      "imageHeight": asset->metadata.dimensions.height
    }
  },
  "headings": description[style in ["h2", "h3"]],
  "estimatedReadingTime": round(length(pt::text(description)) / 5 / 180),
  categories[]-> ${categoryProjection},
  "date": date,
  "translations": *[
    _type == "translation.metadata" && references(^._id)
  ][0].translations[].value->{
    language,
    "slug": slug.current
  }
}`;

async function fetchPublished(query, params = {}) {
  const { data } = await sanityFetch({
    query,
    params,
    perspective: 'published',
    stega: false,
  });

  return data;
}

async function fetchPageContent(query, params = {}, { stega = true } = {}) {
  const preview = (await draftMode()).isEnabled;
  if (preview && !process.env.SANITY_API_READ_TOKEN) {
    throw new Error('Preview habilitado sin SANITY_API_READ_TOKEN.');
  }

  const { data } = await sanityFetch({
    query,
    params,
    perspective: preview ? 'drafts' : 'published',
    stega: preview && stega,
  });

  return data;
}

const PAGE_SEO_QUERY = groq`{
  "title": coalesce(
    *[_id == $pageId][0].seo.title,
    *[_id == $defaultId][0].seo.title
  ),
  "description": coalesce(
    *[_id == $pageId][0].seo.description,
    *[_id == $defaultId][0].seo.description
  ),
  "image": coalesce(
    *[_id == $pageId][0].seo.image,
    *[_id == $defaultId][0].seo.image
  )
}`;

export async function getPageSeo(pageKey, locale) {
  return fetchPageContent(PAGE_SEO_QUERY, {
    pageId: getSeoDocumentId(pageKey, locale),
    defaultId: getSeoDocumentId('default', locale),
  }, { stega: false });
}

export async function getDefaultSeo(locale) {
  const defaultId = getSeoDocumentId('default', locale);
  return fetchPageContent(PAGE_SEO_QUERY, { pageId: defaultId, defaultId }, { stega: false });
}

export async function getPublishedContentVersion(locale) {
  const documents = await fetchPublished(
    groq`*[
      _type in $types &&
      (
        _type == "translation.metadata" ||
        language == $locale ||
        ($locale == "es" && !defined(language))
      )
    ] | order(_id asc){ _id, _updatedAt }`,
    {
      locale,
      types: [
        'article',
        'category',
        'education',
        'job',
        'profile',
        'project',
        'seoPage',
        'translation.metadata',
      ],
    }
  );

  return JSON.stringify(documents);
}

export async function getCategorySeo(slug, locale) {
  return fetchPageContent(
    groq`{
      "title": coalesce(
        *[_type == "category" && ${localizedFilter} && slug.current == $slug][0].seo.title,
        *[_type == "category" && ${localizedFilter} && slug.current == $slug][0].name
      ),
      "description": coalesce(
        *[_type == "category" && ${localizedFilter} && slug.current == $slug][0].seo.description,
        *[_id == $categoriesId][0].seo.description,
        *[_id == $defaultId][0].seo.description
      ),
      "image": coalesce(
        *[_type == "category" && ${localizedFilter} && slug.current == $slug][0].seo.image,
        *[_id == $categoriesId][0].seo.image,
        *[_id == $defaultId][0].seo.image
      )
    }`,
    {
      slug,
      locale,
      categoriesId: getSeoDocumentId('categories', locale),
      defaultId: getSeoDocumentId('default', locale),
    },
    { stega: false }
  );
}

export async function getProfile(locale) {
  return fetchPageContent(
    groq`*[_type == "profile" && ${localizedFilter}][0]{
      _id,
      fullName,
      headline,
      shortBiography,
      "resumeURL": resumeURL.asset->url,
      profileImage {
        alt,
        "image": asset->url,
        "imageWidth": asset->metadata.dimensions.width,
        "imageHeight": asset->metadata.dimensions.height
      },
      fullBiography,
      developerStatistic,
      skills
    }`,
    { locale }
  );
}

export async function getJob(locale) {
  return fetchPageContent(
    groq`*[_type == "job" && ${localizedFilter}] | order(years.startYear desc){
      _id,
      name,
      jobTitle,
      location,
      url,
      description,
      years
    }`,
    { locale }
  );
}

export async function getEducation(locale) {
  return fetchPageContent(
    groq`*[_type == "education" && ${localizedFilter}] | order(years.startYear desc){
      _id,
      name,
      studyCenter,
      "certificateURL": certificateURL.asset->url,
      description,
      years
    }`,
    { locale }
  );
}

export async function getProjects(locale) {
  return fetchPageContent(
    groq`*[_type == "project" && ${localizedFilter} && defined(slug.current)] | order(date desc) ${cardProjection}`,
    { locale }
  );
}

async function getLocalizedDetail(type, slug, locale, options) {
  const result = await fetchPageContent(
    groq`{
      "direct": *[
        _type == $type && ${localizedFilter} && slug.current == $slug
      ][0] ${detailProjection},
      "translated": *[
        _type == "translation.metadata" &&
        count(translations[value->_type == $type && value->slug.current == $slug]) > 0
      ][0].translations[language == $locale][0].value-> ${detailProjection},
      "sourceExists": count(*[_type == $type && slug.current == $slug]) > 0
    }`,
    { type, slug, locale },
    options
  );

  return {
    content: result?.direct || result?.translated || null,
    sourceExists: Boolean(result?.sourceExists),
  };
}

export function getSingleProject(slug, locale, options) {
  return getLocalizedDetail('project', slug, locale, options);
}

export async function getCategories(locale) {
  return fetchPageContent(
    groq`*[_type == "category" && ${localizedFilter} && defined(slug.current)] | order(name asc) ${categoryProjection}`,
    { locale }
  );
}

export async function getCategoryBySlug(slug, locale, options) {
  const result = await fetchPageContent(
    groq`{
      "direct": *[
        _type == "category" && ${localizedFilter} && slug.current == $slug
      ][0] ${categoryDetailProjection},
      "translated": *[
        _type == "translation.metadata" &&
        count(translations[value->_type == "category" && value->slug.current == $slug]) > 0
      ][0].translations[language == $locale][0].value-> ${categoryDetailProjection},
      "sourceExists": count(*[_type == "category" && slug.current == $slug]) > 0
    }`,
    { slug, locale },
    options
  );

  return {
    content: result?.direct || result?.translated || null,
    sourceExists: Boolean(result?.sourceExists),
  };
}

export async function getPostsBySlug(slug, locale) {
  return fetchPageContent(
    groq`*[
      _type in ["project", "article"] &&
      ${localizedFilter} &&
      defined(slug.current) &&
      $slug in categories[]->slug.current
    ] | order(date desc) {
      ${cardFields},
      "slug": "/" + select(
        _type == "article" => "blog",
        _type == "project" => "projects"
      ) + "/" + slug.current
    }`,
    { slug, locale }
  );
}

export async function getArticles(locale) {
  return fetchPageContent(
    groq`*[_type == "article" && ${localizedFilter} && defined(slug.current)] | order(date desc) ${cardProjection}`,
    { locale }
  );
}

export function getSingleArticle(slug, locale, options) {
  return getLocalizedDetail('article', slug, locale, options);
}

export async function getRecentPosts(locale) {
  return fetchPageContent(
    groq`*[
      _type in ["project", "article"] && ${localizedFilter} && defined(slug.current)
    ] | order(date desc) [0..4] {
      ${cardFields},
      "slug": "/" + select(
        _type == "article" => "blog",
        _type == "project" => "projects"
      ) + "/" + slug.current
    }`,
    { locale }
  );
}

export async function getArticleSlugs(locale) {
  return fetchPublished(
    groq`*[_type == "article" && ${localizedFilter} && defined(slug.current)]{
      "slug": slug.current
    }`,
    { locale }
  );
}

export async function getProjectSlugs(locale) {
  return fetchPublished(
    groq`*[_type == "project" && ${localizedFilter} && defined(slug.current)]{
      "slug": slug.current
    }`,
    { locale }
  );
}

export async function getSitemapContent() {
  return fetchPublished(groq`*[
    _type in ["article", "project", "category"] &&
    defined(slug.current)
  ]{
    _id,
    _type,
    "language": coalesce(language, "es"),
    "slug": slug.current,
    _updatedAt,
    "translations": *[
      _type == "translation.metadata" && references(^._id)
    ][0].translations[].value->{ language, "slug": slug.current }
  }`);
}
