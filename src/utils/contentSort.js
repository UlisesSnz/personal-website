import { stegaClean } from 'next-sanity';

export const DEFAULT_CONTENT_SORT = "date-desc";

export const CONTENT_SORT_OPTIONS = [
  { value: "date-desc", label: "Última actividad" },
  { value: "date-asc", label: "Más antiguos" },
  { value: "name-asc", label: "Alfabético (A-Z)" },
  { value: "name-desc", label: "Alfabético (Z-A)" },
];

const VALID_SORT_VALUES = new Set(CONTENT_SORT_OPTIONS.map(({ value }) => value));
export function normalizeContentSort(sort) {
  const value = Array.isArray(sort) ? sort[0] : sort;

  return VALID_SORT_VALUES.has(value) ? value : DEFAULT_CONTENT_SORT;
}

export function sortContentItems(items, sort = DEFAULT_CONTENT_SORT, locale = "es") {
  const activeSort = normalizeContentSort(sort);
  const nameCollator = new Intl.Collator(locale === "es" ? "es-MX" : "en", {
    numeric: true,
    sensitivity: "base",
  });

  return [...(Array.isArray(items) ? items : [])].sort((itemA, itemB) => {
    if (activeSort === "name-asc") {
      return compareNames(itemA, itemB, nameCollator) || compareDates(itemA, itemB, "desc");
    }

    if (activeSort === "name-desc") {
      return compareNames(itemB, itemA, nameCollator) || compareDates(itemA, itemB, "desc");
    }

    const direction = activeSort === "date-asc" ? "asc" : "desc";
  return compareDates(itemA, itemB, direction) || compareNames(itemA, itemB, nameCollator);
  });
}

function compareNames(itemA, itemB, collator) {
  return collator.compare(stegaClean(itemA?.name || ""), stegaClean(itemB?.name || ""));
}

function compareDates(itemA, itemB, direction) {
  const timestampA = getTimestamp(itemA?.date);
  const timestampB = getTimestamp(itemB?.date);
  const hasDateA = Number.isFinite(timestampA);
  const hasDateB = Number.isFinite(timestampB);

  if (!hasDateA && !hasDateB) return 0;
  if (!hasDateA) return 1;
  if (!hasDateB) return -1;

  return direction === "asc"
    ? timestampA - timestampB
    : timestampB - timestampA;
}

function getTimestamp(date) {
  return Date.parse(date || "");
}
