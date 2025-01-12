import React, { useMemo } from 'react';
import DataGrid, { DataGridProps } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';

interface BCDataGridProps<R, SR = unknown, K extends React.Key = React.Key> extends DataGridProps<R, SR, K> {
  isLoading?: boolean;
  containerClassName?: string;
}

function BCDataGrid<R, SR = unknown, K extends React.Key = React.Key>({ 
  isLoading, 
  containerClassName,
  ...props 
}: BCDataGridProps<R, SR, K>) {
  const gridClassNames = useMemo(() => ({
    grid: 'w-full h-full text-black bg-white border-stroke dark:text-white dark:bg-boxdark dark:border-strokedark',
    row: (row: R) => 
      `hover:bg-gray dark:hover:bg-meta-4 ${
        props.rows.indexOf(row) % 2 === 0 
          ? 'bg-white dark:bg-boxdark'
          : 'bg-gray-2 dark:bg-boxdark-2'
      }`,
    headerRow: 'bg-gray-2 text-black dark:bg-meta-4 dark:text-white',
  }), [props.rows]);

  return (
    <div className={`relative h-full ${containerClassName || ''}`}>
      <DataGrid
        {...props}
        columns={props.columns}
        className={gridClassNames.grid}
        rowClass={gridClassNames.row}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 dark:bg-boxdark dark:bg-opacity-70">
          <div className="text-lg font-medium text-black dark:text-white">
            로딩 중...
          </div>
        </div>
      )}
    </div>
  );
}

export default BCDataGrid;
