import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';

export default function DataTable({
  rows = [],
  columns = [],
  pageSize = 10,
  rowCount = 0,
  page = 0,
  onPageChange,
  loading = false,
}) {
  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={pageSize}
        rowCount={rowCount}
        page={page}
        onPageChange={onPageChange}
        paginationMode="server"
        rowsPerPageOptions={[pageSize]}
        loading={loading}
        disableSelectionOnClick
        getRowId={(row) => row.id || row.contact_id || row.person_id || row.category_id}
      />
    </Box>
  );
}
