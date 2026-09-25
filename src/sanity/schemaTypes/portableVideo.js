import { defineArrayMember, defineField, defineType } from 'sanity';
import { PlayIcon } from '@sanity/icons';
import { getVideoAssetRefs, validateVideoSource } from '../../utils/portableVideo';

export default defineType({
  name: 'portableVideo',
  title: 'Video',
  type: 'object',
  icon: PlayIcon,
  initialValue: { source: 'file' },
  fields: [
    defineField({
      name: 'source', title: 'Origen', type: 'string',
      options: { layout: 'radio', list: [{ title: 'Archivo en Sanity', value: 'file' }, { title: 'YouTube', value: 'youtube' }] },
    }),
    defineField({
      name: 'title', title: 'Título', type: 'string',
      description: 'Identifica el video en el editor y en los controles de accesibilidad.',
      validation: (rule) => rule.required().custom((value) => !value || value.trim() ? true : 'Escribe un título para el video.'),
    }),
    defineField({
      name: 'file', title: 'Archivo MP4', type: 'file',
      options: { accept: 'video/mp4' },
      hidden: ({ parent }) => parent?.source !== 'file',
      description: 'Máximo 100 MB. El tamaño se valida después de subir el archivo y antes de publicar. Usa MP4 optimizado con H.264/AAC; Sanity no convierte ni comprime este video.',
    }),
    defineField({
      // Validate at object level so hidden, unfinished URLs cannot block file videos.
      name: 'youtubeUrl', title: 'Enlace de YouTube', type: 'string',
      hidden: ({ parent }) => parent?.source !== 'youtube',
      description: 'Enlace normal, youtu.be, Shorts o embed. Se reproduce desde el principio; no se importan parámetros ni listas.',
    }),
    defineField({ name: 'poster', title: 'Portada', type: 'image', options: { hotspot: true }, description: 'Opcional. YouTube usa su miniatura cuando no hay una portada personalizada.' }),
    defineField({ name: 'caption', title: 'Pie de video', type: 'string', validation: (rule) => rule.max(180) }),
    defineField({
      name: 'captions', title: 'Subtítulos', type: 'array',
      hidden: ({ parent }) => parent?.source !== 'file',
      description: 'Opcionales. Adjunta archivos WebVTT; no se generan automáticamente.',
      of: [defineArrayMember({
        name: 'videoCaption', title: 'Pista de subtítulos', type: 'object',
        fields: [
          defineField({ name: 'language', title: 'Idioma', type: 'string', options: { list: [{ title: 'Español', value: 'es' }, { title: 'English', value: 'en' }] } }),
          defineField({ name: 'label', title: 'Etiqueta', type: 'string', description: 'Nombre visible en el selector de subtítulos, por ejemplo: Español.' }),
          defineField({ name: 'file', title: 'Archivo WebVTT', type: 'file', options: { accept: '.vtt,text/vtt' } }),
        ],
        preview: { select: { title: 'label', subtitle: 'language' } },
      })],
    }),
  ],
  validation: (rule) => rule.custom(async (value, context) => {
    const ids = getVideoAssetRefs(value);
    try {
      const assets = ids.length ? await context.getClient({ apiVersion: '2024-10-09' }).fetch(
        '*[_id in $ids]{_id, _type, mimeType, extension, size}', { ids },
      ) : [];
      return validateVideoSource(value, assets);
    } catch {
      return 'No se pudieron verificar los archivos. Revisa la conexión y vuelve a intentarlo antes de publicar.';
    }
  }),
  preview: {
    select: { title: 'title', source: 'source', media: 'poster' },
    prepare: ({ title, source, media }) => ({ title: title || 'Video', subtitle: source === 'youtube' ? 'YouTube' : 'Archivo en Sanity', media }),
  },
});
