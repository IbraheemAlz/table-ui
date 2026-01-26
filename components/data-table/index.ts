// Main component
export { DataTable } from './DataTable'
export * from './ResizeHandle'
export * from './FloatingActionBar'

// Hooks (for advanced usage)
export { useColumnState } from '../../lib/hooks/customized-table/useColumnState'
export { useRowSelection } from '../../lib/hooks/customized-table/useRowSelection'
export { usePinningOffsets } from '../../lib/hooks/customized-table/usePinningOffsets'
export { useColumnResize } from '../../lib/hooks/customized-table/useColumnResize'

// Context (for building custom components)
export { useDataTable, DataTableProvider } from '../../lib/context/context'

// Default slots (for reference when building custom slots)
export { defaultSlots } from './defaults'

// Utility
export { cn } from '../../lib/utils/cn'
