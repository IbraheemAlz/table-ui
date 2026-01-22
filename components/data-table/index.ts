// Main component
export { DataTable } from './DataTable'
export * from './ResizeHandle'
export * from './FloatingActionBar'

// Types
export type {
    ColumnDef,
    ServerDataConfig,
    ViewState,
    DataTableProps,
    DataTableSlots,
    RowHeight,
} from '../../lib/types/customized-table'

// Hooks (for advanced usage)
export { useColumnState } from './hooks/customized-table/useColumnState'
export { useRowSelection } from './hooks/customized-table/useRowSelection'
export { usePinningOffsets } from './hooks/customized-table/usePinningOffsets'
export { useColumnResize } from './hooks/customized-table/useColumnResize'

// Context (for building custom components)
export { useDataTable, DataTableProvider } from './context'

// Default slots (for reference when building custom slots)
export { defaultSlots } from './defaults'

// Utility
export { cn } from '../../lib/utils/cn'
