import { useTranslations } from 'next-intl';
import { urlFor } from '@/sanity/lib/image';
import { resolveVideoSource } from '@/utils/portableVideo';
import PortableVideoPlayer from './PortableVideoPlayer';

export default function PortableVideo({ value }) {
  const t = useTranslations('Video');
  const source = resolveVideoSource(value);
  const title = (typeof value?.title === 'string' && value.title.trim()) || t('untitled');
  const caption = typeof value?.caption === 'string' ? value.caption.trim() : '';
  let poster;
  if (value?.poster?.asset?._ref) {
    try {
      poster = urlFor(value.poster).width(1200).fit('max').auto('format').quality(80).url();
    } catch {
      // A deleted or malformed optional poster must not prevent playback.
    }
  }

  return (
    <figure className="my-10 w-full min-w-0 sm:my-8">
      {source ? (
        <PortableVideoPlayer key={`${source.source}:${source.url}`} source={source} title={title} poster={poster} />
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-xl border border-dark/15 bg-dark/5 p-6 text-center text-sm text-dark/70 dark:border-light/20 dark:bg-light/5 dark:text-light/70">
          {t('unavailable')}
        </div>
      )}
      {caption && <figcaption className="mt-4 text-sm leading-6 italic text-dark/70 dark:text-light/70">{caption}</figcaption>}
      {source && (
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block rounded-sm text-sm text-dark/70 underline underline-offset-4 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-light/70 dark:hover:text-primaryDark">
          {t(source.source === 'youtube' ? 'openYouTube' : 'openFile')}
          <span className="sr-only">: {title} ({t('newTab')})</span>
        </a>
      )}
    </figure>
  );
}
