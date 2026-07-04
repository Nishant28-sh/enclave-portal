/**
 * Skeleton loading rows for the contacts table.
 * Matches the 8-column structure: #, Image, Name, Email, Subject, Message, Date, Action
 */
function SkeletonTable({ rows = 5 }) {
  return (
    <div className="skeleton-wrapper">
      {/* Header skeleton */}
      <div className="skeleton-header">
        <div className="skeleton-title" />
        <div className="skeleton-badge" />
      </div>

      <div className="skeleton-desc" />

      {/* Table skeleton */}
      <div className="table-wrapper skeleton-table-wrapper">
        <table className="contact-table">
          <thead>
            <tr>
              {["#", "Image", "Name", "Email", "Subject", "Message", "Date", "Action"].map(
                (h) => (
                  <th key={h}>{h}</th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                <td><div className="skeleton-cell skeleton-cell--sm" /></td>
                <td><div className="skeleton-thumb" /></td>
                <td><div className="skeleton-cell" /></td>
                <td><div className="skeleton-cell skeleton-cell--lg" /></td>
                <td><div className="skeleton-cell" /></td>
                <td><div className="skeleton-cell skeleton-cell--lg" /></td>
                <td><div className="skeleton-cell skeleton-cell--sm" /></td>
                <td><div className="skeleton-btn" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SkeletonTable;
