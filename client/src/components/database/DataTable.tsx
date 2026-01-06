interface DataTableProps {
  data: any[];
  maxRows?: number;
}

export default function DataTable({ data, maxRows = 10 }: DataTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        No data available
      </div>
    );
  }

  const displayData = maxRows ? data.slice(0, maxRows) : data;
  const headers = Object.keys(data[0]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {headers.map((header) => (
                  <td key={header} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                    {typeof row[header] === 'object' && row[header] !== null
                      ? JSON.stringify(row[header])
                      : String(row[header] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {maxRows && data.length > maxRows && (
        <div className="bg-gray-50 px-4 py-3 text-sm text-gray-600 text-center border-t">
          Showing {maxRows} of {data.length} records
        </div>
      )}
    </div>
  );
}
