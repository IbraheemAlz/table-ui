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
} from './types'

// Hooks (for advanced usage)
export { useColumnState } from './hooks/useColumnState'
export { useRowSelection } from './hooks/useRowSelection'
export { usePinningOffsets } from './hooks/usePinningOffsets'
export { useResizeObserver } from './hooks/useResizeObserver'
export { useColumnResize } from './hooks/useColumnResize'

// Context (for building custom components)
export { useDataTable, DataTableProvider } from './context'

// Default slots (for reference when building custom slots)
export { defaultSlots } from './defaults'

// Utility
export { cn } from './utils/cn'
