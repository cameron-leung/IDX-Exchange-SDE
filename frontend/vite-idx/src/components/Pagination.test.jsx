import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Pagination from './Pagination.jsx';

describe('Pagination', () => {
  it('renders previous and next buttons and page numbers with ellipsis for large counts', () => {
    const html = renderToStaticMarkup(
      <Pagination
        currentPage={5}
        totalPages={20}
        onPageChange={() => {}}
      />
    );

    expect(html).toContain('Previous');
    expect(html).toContain('Next');
    expect(html).toContain('1');
    expect(html).toContain('5');
    expect(html).toContain('20');
    expect(html).toContain('…');
  });
});
