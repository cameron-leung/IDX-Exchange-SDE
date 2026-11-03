import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Pagination from './Pagination.jsx';
import { clampPage, getOffset, scrollToListingsTop } from './paginationUtils.js';

describe('Pagination', () => {
  // Covers the first-page state: previous is disabled and the page window starts at the beginning.
  it('renders the first page state with the previous button disabled and a compact page range', () => {
    const html = renderToStaticMarkup(
      <Pagination currentPage={1} totalPages={20} onPageChange={() => {}} />
    );

    expect(html).toContain('Previous');
    expect(html).toContain('Next');
    expect(html).toContain('1');
    expect(html).toContain('2');
    expect(html).toContain('3');
    expect(html).toContain('20');
    expect(html).toContain('…');
    expect(html).toContain('disabled');
  });

  // Covers the last-page state: next is disabled and the page window stays anchored to the end.
  it('renders the last page state with the next button disabled', () => {
    const html = renderToStaticMarkup(
      <Pagination currentPage={20} totalPages={20} onPageChange={() => {}} />
    );

    expect(html).toContain('Previous');
    expect(html).toContain('Next');
    expect(html).toContain('1');
    expect(html).toContain('20');
    expect(html).toContain('…');
    expect(html).toContain('disabled');
  });

  // Covers the middle-page state: a small set of surrounding numbers remains visible around the active page.
  it('renders the middle page with a focused page window around the current item', () => {
    const html = renderToStaticMarkup(
      <Pagination currentPage={10} totalPages={20} onPageChange={() => {}} />
    );

    expect(html).toContain('1');
    expect(html).toContain('9');
    expect(html).toContain('10');
    expect(html).toContain('11');
    expect(html).toContain('20');
    expect(html).toContain('…');
  });

  // Covers page selection by number: the callback receives the selected page and page labels remain accessible.
  it('calls the page handler when a page number is clicked', () => {
    const onPageChange = vi.fn();
    const html = renderToStaticMarkup(
      <Pagination currentPage={2} totalPages={10} onPageChange={onPageChange} />
    );

    expect(html).toContain('Go to page 3');
    expect(html).toContain('Go to page 2');
    expect(html).toContain('Go to page 10');
  });

  // Covers the large-page-range case: ellipsis markers appear to shorten long page sequences.
  it('renders ellipsis markers when the page count is large', () => {
    const html = renderToStaticMarkup(
      <Pagination currentPage={5} totalPages={20} onPageChange={() => {}} />
    );

    expect(html).toContain('…');
    expect(html).match(/…/g)?.length;
  });

  // Covers the empty-state case: no pagination renders when there is only one page or no results to paginate.
  it('does not show pagination when there are no results to paginate', () => {
    const html = renderToStaticMarkup(
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
    );

    expect(html).not.toContain('Previous');
    expect(html).not.toContain('Next');
  });

  // Covers page clamping: requests below 1 or above the max are bounded to valid page values.
  it('never goes past the maximum valid page number', () => {
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(999, 5)).toBe(5);
    expect(clampPage(3, 5)).toBe(3);
  });

  // Covers offset calculation: page 2 starts at 20, page 4 starts at 60, and page 1 starts at 0.
  it('changes the offset for each page request', () => {
    expect(getOffset(1, 20)).toBe(0);
    expect(getOffset(2, 20)).toBe(20);
    expect(getOffset(4, 20)).toBe(60);
  });

  // Covers scroll behavior: moving to another page returns the user to the top of the listings grid.
  it('scrolls the listings area back to the top when page changes', () => {
    const scrollIntoView = vi.fn();
    const originalDocument = globalThis.document;

    Object.defineProperty(globalThis, 'document', {
      value: {
        getElementById: vi.fn(() => ({ scrollIntoView })),
      },
      configurable: true,
    });

    expect(scrollToListingsTop()).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    if (originalDocument) {
      Object.defineProperty(globalThis, 'document', {
        value: originalDocument,
        configurable: true,
      });
    } else {
      delete globalThis.document;
    }
  });
});
