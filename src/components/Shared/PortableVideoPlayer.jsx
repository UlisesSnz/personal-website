'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function PortableVideoPlayer({ source, title, poster }) {
  const t = useTranslations('Video');
  const [activated, setActivated] = useState(false);
  const [failed, setFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-dark/15 bg-black dark:border-light/20">
      {source.source === 'file' ? (
        failed ? (
          <p role="status" className="flex h-full items-center justify-center p-6 text-center text-sm text-white">{t('playbackError')}</p>
        ) : (
          <video
            src={source.url}
            poster={poster}
            aria-label={title}
            controls
            playsInline
            preload="none"
            crossOrigin="anonymous"
            onError={() => setFailed(true)}
            className="h-full w-full object-contain"
          >
            {source.captions.map((track) => (
              <track key={track.key} kind="subtitles" src={track.url} srcLang={track.language} label={track.label} />
            ))}
            {t('unsupported')}
          </video>
        )
      ) : activated ? (
        <>
          {!loaded && <p role="status" className="absolute inset-0 flex items-center justify-center text-sm text-white">{t('loading')}</p>}
          <iframe
            ref={(node) => { if (node) node.focus(); }}
            src={`https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1&playsinline=1`}
            title={title}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setLoaded(true)}
            className="absolute inset-0 h-full w-full border-0"
          />
        </>
      ) : (
        <button
          type="button"
          onClick={() => setActivated(true)}
          aria-label={t('play', { title })}
          className="group relative flex h-full w-full items-center justify-center focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-primary dark:focus-visible:outline-primaryDark"
        >
          {!imageFailed && (
            <Image
              src={poster || `https://i.ytimg.com/vi/${source.id}/hqdefault.jpg`}
              alt=""
              fill
              sizes="(max-width: 1023px) 100vw, 75vw"
              className={poster ? 'object-contain' : 'object-cover'}
              onError={() => setImageFailed(true)}
            />
          )}
          <span aria-hidden="true" className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
          <span aria-hidden="true" className="relative flex h-16 w-16 items-center justify-center rounded-full bg-dark/90 text-light shadow-lg group-hover:bg-primary dark:group-hover:bg-primaryDark dark:group-hover:text-dark sm:h-12 sm:w-12">
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 sm:h-6 sm:w-6" fill="currentColor"><path d="M7 4.5v15l12-7.5Z" /></svg>
          </span>
        </button>
      )}
    </div>
  );
}
