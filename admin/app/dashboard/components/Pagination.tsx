type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '16px 0' }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        style={{
          padding: '6px 12px', borderRadius: '6px', border: '1px solid #2A2A2A',
          background: page <= 1 ? '#111' : '#1A1A1A', color: page <= 1 ? '#444' : '#FEFEFE',
          fontSize: '12px', cursor: page <= 1 ? 'not-allowed' : 'pointer',
        }}
      >
        Prev
      </button>

      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        let pageNum: number;
        if (totalPages <= 5) {
          pageNum = i + 1;
        } else if (page <= 3) {
          pageNum = i + 1;
        } else if (page >= totalPages - 2) {
          pageNum = totalPages - 4 + i;
        } else {
          pageNum = page - 2 + i;
        }
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            aria-current={page === pageNum ? 'page' : undefined}
            style={{
              padding: '6px 10px', borderRadius: '6px', border: 'none',
              background: page === pageNum ? '#FED800' : '#1A1A1A',
              color: page === pageNum ? '#000' : '#FEFEFE',
              fontSize: '12px', fontWeight: page === pageNum ? '700' : '400',
              cursor: 'pointer', minWidth: '32px',
            }}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        style={{
          padding: '6px 12px', borderRadius: '6px', border: '1px solid #2A2A2A',
          background: page >= totalPages ? '#111' : '#1A1A1A', color: page >= totalPages ? '#444' : '#FEFEFE',
          fontSize: '12px', cursor: page >= totalPages ? 'not-allowed' : 'pointer',
        }}
      >
        Next
      </button>

      <span style={{ fontSize: '11px', color: '#666', marginLeft: '8px' }}>
        Page {page} of {totalPages}
      </span>
    </div>
  );
}
