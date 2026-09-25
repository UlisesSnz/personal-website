import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { toPlainText } from 'next-sanity';
import slugify from 'slugify';
import PortableTextCodeBlock from './PortableTextCodeBlock';
import PortableVideo from './PortableVideo';
import siteMetadata from '@/utils/siteMetaData';

const tableAlignmentClassMap = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const normalizeTableRows = (rows) => {
  const safeRows = Array.isArray(rows) ? rows : [];
  const columnCount = safeRows.reduce((maxColumns, row) => {
    const cells = Array.isArray(row?.cells) ? row.cells : [];
    return Math.max(maxColumns, cells.length);
  }, 0);

  if (!safeRows.length || !columnCount) {
    return {
      columnCount: 0,
      rows: [],
    };
  }

  const normalizedRows = safeRows.map((row) => {
    const cells = Array.isArray(row?.cells) ? row.cells : [];
    const missingCells = Array(Math.max(0, columnCount - cells.length)).fill('');
    return [...cells, ...missingCells];
  });

  return {
    columnCount,
    rows: normalizedRows,
  };
};

const getColumnAlignmentClass = (columnAlignments, columnIndex) => {
  const alignment = Array.isArray(columnAlignments) ? columnAlignments[columnIndex] : undefined;
  return tableAlignmentClassMap[alignment] || tableAlignmentClassMap.left;
};

const renderTable = ({ rows, hasHeader = true, columnAlignments = [] }) => {
  const normalizedTable = normalizeTableRows(rows);

  if (!normalizedTable.rows.length || !normalizedTable.columnCount) {
    return null;
  }

  const useHeaderRow = hasHeader && normalizedTable.rows.length > 1;
  const headerCells = useHeaderRow ? normalizedTable.rows[0] : [];
  const bodyRows = useHeaderRow ? normalizedTable.rows.slice(1) : normalizedTable.rows;

  return (
    <div className="my-10 overflow-x-auto rounded-xl border border-dark/15 bg-light/30 dark:border-light/20 dark:bg-dark/20 sm:my-8">
      <table className="w-full min-w-[560px] border-collapse text-sm sm:min-w-[460px] sm:text-xs">
        {useHeaderRow && (
          <thead className="bg-dark/[0.04] dark:bg-light/[0.08]">
            <tr>
              {headerCells.map((cell, index) => {
                const alignmentClass = getColumnAlignmentClass(columnAlignments, index);

                return (
                  <th
                    key={`table-head-${index}`}
                    scope="col"
                    className={`border-b border-dark/15 px-4 py-3 font-semibold leading-6 text-dark dark:border-light/20 dark:text-light ${alignmentClass}`}
                  >
                    {cell || '-'}
                  </th>
                );
              })}
            </tr>
          </thead>
        )}
        <tbody>
          {bodyRows.map((row, rowIndex) => (
            <tr
              key={`table-row-${rowIndex}`}
              className="border-b border-dark/10 even:bg-dark/[0.02] last:border-b-0 dark:border-light/15 even:dark:bg-light/[0.04]"
            >
              {row.map((cell, cellIndex) => {
                const alignmentClass = getColumnAlignmentClass(columnAlignments, cellIndex);

                return (
                  <td
                    key={`table-cell-${rowIndex}-${cellIndex}`}
                    className={`px-4 py-3 align-top leading-6 text-dark/90 dark:text-light/90 ${alignmentClass}`}
                  >
                    <span className="block break-words whitespace-pre-line">{cell || '-'}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PortableImage = ({ value }) => {
  const t = useTranslations('Code');
  const caption = value?.caption?.trim();

  return (
    <figure className="my-10 sm:my-8">
      <Image
        src={value.image}
        alt={value.alt || t('imageAlt')}
        width={value.imageWidth || 1200}
        height={value.imageHeight || 675}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
        className="rounded-xl w-full h-auto"
      />
      {caption && (
        <figcaption className="mt-4 text-sm leading-6 italic text-dark/70 dark:text-light/70">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

const PortableLink = ({ children, value }) => {
  const href = value?.href || '#';
  let internalHref = href.startsWith('/') ? href : null;

  if (href.startsWith('http')) {
    try {
      const target = new URL(href);
      const site = new URL(siteMetadata.siteUrl);
      if (target.hostname.replace(/^www\./, '') === site.hostname.replace(/^www\./, '')) {
        internalHref = `${target.pathname.replace(/^\/(es|en)(?=\/|$)/, '') || '/'}${target.search}${target.hash}`;
      }
    } catch {
      internalHref = null;
    }
  }

  const isExternal = href.startsWith('http') && !internalHref;
  const className = 'underline underline-offset-4 hover:opacity-80 transition';

  if (internalHref) {
    return <Link href={internalHref} className={className}>{children}</Link>;
  }

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className={className}
    >
      {children}
    </a>
  );
};

const PortableTextComponents = {
  types: {
    portableVideo: PortableVideo,
    portableTable: ({ value }) => renderTable({
      rows: value?.table?.rows,
      hasHeader: value?.hasHeader !== false,
      columnAlignments: value?.columnAlignments,
    }),
    code: ({ value }) => (
      <PortableTextCodeBlock value={value} />
    ),
    image: PortableImage,
  },

  block: {
    h2: ({ children, value }) => {
      const slug = slugify(toPlainText(value), { lower: true });
      return (
        <h2 id={slug} className="mt-14 mb-6 scroll-mt-4 font-bold text-4xl sm:mt-10 sm:mb-5 sm:text-2xl xs:text-xl first:mt-0">
          {children}
        </h2>
      );
    },
    h3: ({ children, value }) => {
      const slug = slugify(toPlainText(value), { lower: true });
      return (
        <h3 id={slug} className="mt-10 mb-4 scroll-mt-4 font-bold text-2xl sm:mt-8 sm:mb-3 sm:text-xl xs:text-lg first:mt-0">
          {children}
        </h3>
      );
    },
    normal: ({ children }) => (
      <p className="mb-7 text-balance leading-8 sm:mb-6 sm:leading-7">{children}</p>
    ),
  },

  list: {
    bullet: ({ children }) => (
      <ul className="my-8 ml-7 list-disc list-outside space-y-3 sm:my-7 sm:ml-6 sm:space-y-2">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="my-8 ml-7 list-decimal list-outside space-y-3 sm:my-7 sm:ml-6 sm:space-y-2">{children}</ol>
    ),
  },

  listItem: {
    bullet: ({ children }) => (
      <li className="pl-1 leading-8 sm:leading-7">{children}</li>
    ),
    number: ({ children }) => (
      <li className="pl-1 leading-8 sm:leading-7">{children}</li>
    ),
  },

  marks: {
    code: ({ children }) => (
      <code className="rounded-md bg-dark/10 px-1.5 py-0.5 font-mono text-[0.95em] text-dark dark:bg-light/10 dark:text-light">
        {children}
      </code>
    ),
    link: PortableLink,
  },
};

export default PortableTextComponents;
