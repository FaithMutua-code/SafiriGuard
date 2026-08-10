const DataTable = ({
  columns,
  data,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📭</span>
        <h3>No data available</h3>
        <p>There are no records to display.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <span
            style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}
          >
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              className="btn btn-outline"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              style={{ padding: "0.25rem 0.75rem" }}
            >
              Prev
            </button>
            <button
              className="btn btn-outline"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              style={{ padding: "0.25rem 0.75rem" }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
