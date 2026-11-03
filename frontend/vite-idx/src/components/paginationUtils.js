export function clampPage(page, totalPages) {
  const safeTotalPages = Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1;
  const safePage = Number.isFinite(page) ? Number(page) : 1;

  return Math.min(Math.max(safePage, 1), safeTotalPages);
}

export function getVisiblePages(currentPage, totalPages) {
  const safeTotalPages = Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1;
  const activePage = clampPage(currentPage, safeTotalPages);

  if (safeTotalPages <= 7) {
    return Array.from({ length: safeTotalPages }, (_, index) => index + 1);
  }

  if (activePage <= 3) {
    return [1, 2, 3, null, safeTotalPages];
  }

  if (activePage >= safeTotalPages - 2) {
    return [1, null, safeTotalPages - 2, safeTotalPages - 1, safeTotalPages];
  }

  return [1, null, activePage - 1, activePage, activePage + 1, null, safeTotalPages];
}

export function getOffset(page, itemsPerPage) {
  const safeItemsPerPage = Number.isFinite(itemsPerPage) && itemsPerPage > 0 ? itemsPerPage : 20;
  return Math.max(0, (clampPage(page, Number.MAX_SAFE_INTEGER) - 1) * safeItemsPerPage);
}

export function scrollToListingsTop() {
  const listingsElement =
    typeof document !== 'undefined'
      ? document.getElementById('listings-page') || document.querySelector('.listings-page')
      : null;

  if (listingsElement) {
    listingsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return true;
}

export function scrollToListingsTopAfterRender() {
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => {
      scrollToListingsTop();
    });
    return true;
  }

  return scrollToListingsTop();
}
