/**
 * Browser-side CSV Exporter using Blob URLs.
 * Genuinely downloads formatted CSV files directly to the client filesystem.
 */

export interface ExportColumn<T> {
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
}

export function exportToCsv<T>(
  filename: string,
  columns: ExportColumn<T>[],
  data: T[]
): void {
  if (!data || data.length === 0) {
    alert('No records available to export.');
    return;
  }

  // 1. Build CSV Header
  const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',');

  // 2. Build CSV Rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const val = col.accessor(row);
        if (val === null || val === undefined) return '""';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',');
  });

  const csvContent = [headers, ...rows].join('\r\n');

  // 3. Create Blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
