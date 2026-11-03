import { clampPage } from './paginationUtils.js';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
    const pageCount = Math.max(1, Number.isFinite(totalPages) ? Number(totalPages) : 1);
    const activePage = clampPage(currentPage, pageCount);

    if (pageCount <= 1) {
        return null;
    }

    const getVisiblePages = () => {
        if (pageCount <= 7) {
            return Array.from({ length: pageCount }, (_, index) => index + 1);
        }

        const surroundingPages = [activePage - 1, activePage, activePage + 1].filter((page) => page > 1 && page < pageCount);

        if (activePage <= 2) {
            return [1, 2, 3, null, pageCount];
        }

        if (activePage >= pageCount - 1) {
            return [1, null, pageCount - 2, pageCount - 1, pageCount];
        }

        return [1, null, ...surroundingPages, null, pageCount];
    };

    const visiblePages = getVisiblePages();

    const handlePageChange = (nextPage) => {
        if (!onPageChange) {
            return;
        }

        onPageChange(clampPage(nextPage, pageCount));
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
                padding: '16px 20px 28px',
                fontFamily: 'Inter, Arial, sans-serif',
            }}
        >
            <button
                type="button"
                onClick={() => handlePageChange(activePage - 1)}
                disabled={activePage <= 1}
                aria-label="Previous page"
                style={{
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    background: activePage <= 1 ? '#f6f8fa' : '#fff',
                    cursor: activePage <= 1 ? 'not-allowed' : 'pointer',
                    fontFamily: 'Inter, Arial, sans-serif',
                }}
            >
                Previous
            </button>

            {visiblePages.map((page, index) => {
                if (page === null) {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            aria-hidden="true"
                            style={{
                                padding: '0 4px',
                                color: '#666',
                                fontFamily: 'Inter, Arial, sans-serif',
                            }}
                        >
                            …
                        </span>
                    );
                }

                const isCurrent = page === activePage;

                return (
                    <button
                        key={`page-${page}`}
                        type="button"
                        onClick={() => handlePageChange(page)}
                        aria-label={`Go to page ${page}`}
                        aria-current={isCurrent ? 'page' : undefined}
                        style={{
                            minWidth: '36px',
                            height: '36px',
                            padding: '0 10px',
                            border: 'none',
                            borderRadius: '6px',
                            background: isCurrent ? '#1f6feb' : '#fff',
                            color: isCurrent ? '#fff' : '#1f2328',
                            fontWeight: isCurrent ? 700 : 500,
                            cursor: 'pointer',
                            fontFamily: 'Inter, Arial, sans-serif',
                        }}
                    >
                        {page}
                    </button>
                );
            })}

            <button
                type="button"
                onClick={() => handlePageChange(activePage + 1)}
                disabled={activePage >= pageCount}
                aria-label="Next page"
                style={{
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    background: activePage >= pageCount ? '#f6f8fa' : '#fff',
                    cursor: activePage >= pageCount ? 'not-allowed' : 'pointer',
                    fontFamily: 'Inter, Arial, sans-serif',
                }}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
