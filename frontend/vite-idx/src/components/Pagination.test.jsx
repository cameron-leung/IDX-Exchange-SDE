import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Pagination from './Pagination.jsx';
import { clampPage, getOffset, scrollToListingsTop } from './paginationUtils.js';

describe('Pagination', () => {
  it('renders previous and next buttons and a compact page window for large counts', () => {
    const html = renderToStaticMarkup(
      <Pagination currentPage={5} totalPages={20} onPageChange={() => {}} />
    );

    expect(html).toContain('Previous');
    expect(html).toContain('Next');
    expect(html).toContain('1');
    expect(html).toContain('5');
    expect(html).toContain('20');
    expect(html).toContain('…');
    expect(html).toContain('4');
    expect(html).toContain('6');
  });

  it('does not show pagination when there are no results to paginate', () => {
    const html = renderToStaticMarkup(
      <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
    );

    expect(html).not.toContain('Previous');
    expect(html).not.toContain('Next');
  });

  it('never goes past the maximum valid page number', () => {
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(999, 5)).toBe(5);
    expect(clampPage(3, 5)).toBe(3);
  });

  it('changes the offset for each page request', () => {
    expect(getOffset(1, 20)).toBe(0);
    expect(getOffset(2, 20)).toBe(20);
    expect(getOffset(4, 20)).toBe(60);
  });

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
