'use client';

import { Suspense } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { VisualEditing } from 'next-sanity/visual-editing/client-component';

function Controls() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const missingSlug = searchParams.get('previewNotice') === 'missing-slug';
  const returnTo = pathname || `/${locale}`;

  return (
    <aside className="sticky top-0 z-[100] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-amber-300 px-4 py-2 text-center text-sm font-semibold text-black" aria-label={locale === 'en' ? 'Draft preview' : 'Previsualización de borrador'}>
      <span>{locale === 'en' ? 'Draft preview' : 'Previsualización de borrador'}</span>
      {missingSlug && <span>{locale === 'en' ? 'Add a slug to open this document.' : 'Agrega un slug para abrir este documento.'}</span>}
      <a className="underline underline-offset-2 focus-visible:outline focus-visible:outline-2" href={`/api/draft-mode/disable?returnTo=${encodeURIComponent(returnTo)}`} rel="nofollow">
        {locale === 'en' ? 'Exit preview' : 'Salir de la vista previa'}
      </a>
    </aside>
  );
}

export default function PreviewControls() {
  const router = useRouter();

  const refresh = () => {
    router.refresh();
    return new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <>
      <Suspense fallback={null}><Controls /></Suspense>
      <VisualEditing refresh={refresh} />
    </>
  );
}
