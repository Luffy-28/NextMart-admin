import React, { useState, useMemo } from 'react';

/**
 * DataTable — Stitch-styled reusable table.
 * 
 * Props:
 *  columns      Array<{ key, label, sortable?, render? }>
 *  data         Array<object>
 *  searchFields Array<string>   - keys to search across
 *  placeholder  string
 *  pageSize     number (default 5; 0 = no pagination)
 *  emptyText    string
 *  toolbar      ReactNode       - extra elements in toolbar (e.g. Add button)
 */
const DataTable = ({
  columns = [],
  data = [],
  searchFields = [],
  placeholder = 'Search…',
  pageSize = 5,
  emptyText = 'No records found',
  toolbar = null,
}) => {
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [sort, setSort]           = useState({ key: '', dir: 'asc' });

  const filtered = useMemo(() => {
    if (!search || !searchFields.length) return data;
    const q = search.toLowerCase();
    return data.filter(row =>
      searchFields.some(f => String(row[f] ?? '').toLowerCase().includes(q))
    );
  }, [data, search, searchFields]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (av == null || bv == null) return 0;
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sort]);

  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const paginated  = pageSize > 0 ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted;

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleSort   = (key, sortable) => {
    if (!sortable) return;
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  };

  return (
    <div>
      {/* Toolbar */}
      {(searchFields.length > 0 || toolbar) && (
        <div className="d-flex gap-3 mb-3 align-items-center flex-wrap">
          {searchFields.length > 0 && (
            <div className="nm-input-group" style={{ maxWidth: 380, flex: 1 }}>
              <span className="material-symbols-outlined">search</span>
              <input
                className="nm-input"
                type="text"
                placeholder={placeholder}
                value={search}
                onChange={handleSearch}
              />
            </div>
          )}
          {toolbar && <div className="d-flex gap-2 ms-auto">{toolbar}</div>}
        </div>
      )}

      {/* Table */}
      <div className="nm-table-container">
        <table className="nm-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable !== false)}
                  style={{ cursor: col.sortable !== false ? 'pointer' : 'default', userSelect: 'none' }}
                >
                  <div className="d-flex align-items-center gap-1">
                    {col.label}
                    {col.sortable !== false && (
                      <span className="material-symbols-outlined" style={{ fontSize: 14, opacity: sort.key === col.key ? 1 : 0.25 }}>
                        {sort.key === col.key && sort.dir === 'desc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="nm-empty-state">
                    <span className="material-symbols-outlined">folder_open</span>
                    <p style={{ margin: 0, fontWeight: 600 }}>{emptyText}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr key={row.id ?? i}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row, i) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageSize > 0 && totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span style={{ fontSize: 13, color: 'var(--secondary)' }}>
            Showing <strong>{Math.min(sorted.length, (page - 1) * pageSize + 1)}</strong>–<strong>{Math.min(sorted.length, page * pageSize)}</strong> of <strong>{sorted.length}</strong>
          </span>
          <div className="nm-pagination">
            <button className="nm-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`nm-page-btn${page === i + 1 ? ' active' : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="nm-page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
