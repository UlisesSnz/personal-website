'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\src\app\studio\[[...tool]]\page.jsx` route
 */

import {visionTool} from '@sanity/vision'
import {codeInput} from '@sanity/code-input'
import {table} from '@sanity/table'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {documentInternationalization} from '@sanity/document-internationalization'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemaTypes'
import {structure} from './src/sanity/structure'
import {LOCALE_DEFINITIONS, TRANSLATED_SCHEMA_TYPES} from './src/i18n/config'
import {resolve} from './src/sanity/presentation'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema: {
    ...schema,
    templates: (templates) => [
      ...templates.filter((template) => template.schemaType !== 'seoPage'),
      ...LOCALE_DEFINITIONS.map(({id, title}) => ({
        id: `seoPage-${id}`,
        title: `SEO · ${title}`,
        schemaType: 'seoPage',
        value: {language: id},
      })),
    ],
  },
  document: {
    newDocumentOptions: (prev, {creationContext}) => {
      if (creationContext.type !== 'global') return prev

      return prev.filter((item) => {
        const schemaType = item.schemaType || item.templateId

        if (!TRANSLATED_SCHEMA_TYPES.includes(schemaType)) return true
        if (schemaType === 'seoPage' || schemaType === 'profile') return false

        return item.parameters?.language === 'es' || item.templateId?.endsWith('-es')
      })
    },
    actions: (actions, context) => context.schemaType === 'seoPage'
      ? actions.filter((action) => action.action !== 'duplicate')
      : actions,
  },
  plugins: [
    documentInternationalization({
      supportedLanguages: LOCALE_DEFINITIONS.map(({id, title}) => ({id, title})),
      schemaTypes: TRANSLATED_SCHEMA_TYPES,
      languageField: 'language',
      weakReferences: false,
      allowCreateMetaDoc: true,
      apiVersion,
    }),
    structureTool({structure}),
    presentationTool({
      resolve,
      previewUrl: {
        initial: '/es',
        previewMode: {enable: '/api/draft-mode/enable', shareAccess: false},
      },
    }),
    codeInput(),
    table(),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
