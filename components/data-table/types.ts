import type React from 'react'

// ============================================================================
// Column Definition
// ============================================================================

export interface ColumnDef<T> {
    /** Unique identifier for the column */
    id: string
    /** Header content - string or render function */
    header: string | (() => React.ReactNode)
    /** Key to access data from row object */
    accessorKey?: keyof T
    /** Function to extract value from row */
    accessorFn?: (row: T) => unknown
    /** Custom cell renderer */
    cell?: (info: { value: unknown; row: T; rowIndex: number }) => React.ReactNode

    // Sizing
    /** Initial width in pixels (default: auto) */
    size?: number
    /** Minimum width in pixels (default: 50) */
    minSize?: number
    /** Maximum width in pixels (default: 500) */
    maxSize?: number

    // Features (all default to true)
    /** Allow resizing this column */
    enableResizing?: boolean
    /** Allow hiding this column */
    enableHiding?: boolean
    /** Allow pinning this column */
    enablePinning?: boolean
    /** Allow sorting by this column */
    enableSorting?: boolean
}

// ============================================================================
// Server Data Contract
// ============================================================================

export interface ServerDataConfig<T> {
    /** Data rows from API */
    data: T[]
    /** Total count of all rows (for pagination) */
    totalCount: number

    // Loading states
    /** Initial load - show full skeleton */
    isLoading?: boolean
    /** Subsequent loads - show subtle indicator, keep data visible */
    isRefetching?: boolean

    // Current server state (for display)
    /** Current page (1-indexed) */
    page: number
    /** Rows per page */
    pageSize: number
    /** Currently sorted column */
    sortColumn?: string
    /** Sort direction */
    sortDirection?: 'asc' | 'desc'
    /** Current search query */
    searchQuery?: string

    // Callbacks (trigger API refetch)
    /** Called when page changes */
    onPageChange: (page: number) => void
    /** Called when page size changes */
    onPageSizeChange: (size: number) => void
    /** Called when sort changes */
    onSortChange: (column: string | null, direction: 'asc' | 'desc' | null) => void
    /** Called when search query changes */
    onSearchChange?: (query: string) => void
}

// ============================================================================
// View State (Saveable to Backend)
// ============================================================================

export interface ViewState {
    /** Which columns are visible (true = visible) */
    columnVisibility: Record<string, boolean>
    /** Column widths in pixels */
    columnWidths: Record<string, number>
    /** Pinned columns */
    columnPinning: { left: string[]; right: string[] }
    /** Column order (array of column IDs) */
    columnOrder: string[]
}

// ============================================================================
// Row Height Options
// ============================================================================

export type RowHeight = 'short' | 'medium' | 'tall' | 'extra-tall'

// ============================================================================
// Slots (Configurable Components)
// ============================================================================

export interface DataTableSlots {
    // ========== Table Layout Slots (for theming) ==========
    Table?: React.FC<{
        children: React.ReactNode
        className?: string
        style?: React.CSSProperties
    }>
    Thead?: React.FC<{
        children: React.ReactNode
        className?: string
        style?: React.CSSProperties
    }>
    Tbody?: React.FC<{
        children: React.ReactNode
        className?: string
    }>
    Tr?: React.FC<{
        children: React.ReactNode
        onClick?: () => void
        className?: string
        'data-selected'?: boolean
    }>
    Th?: React.FC<{
        children: React.ReactNode
        className?: string
        style?: React.CSSProperties
    }>
    Td?: React.FC<{
        children: React.ReactNode
        className?: string
        style?: React.CSSProperties
        onClick?: (e: React.MouseEvent) => void
    }>

    // ========== Interactive Components ==========
    ColumnMenu?: React.FC<{
        trigger: React.ReactNode
        children: React.ReactNode
        align?: 'start' | 'end'
    }>

    MenuItem?: React.FC<{
        children: React.ReactNode
        onClick: () => void
        icon?: React.ReactNode
        active?: boolean
        disabled?: boolean
    }>

    MenuSeparator?: React.FC<object>

    Popover?: React.FC<{
        trigger: React.ReactNode
        children: React.ReactNode
        align?: 'start' | 'end'
    }>

    Button?: React.FC<{
        children: React.ReactNode
        onClick?: () => void
        disabled?: boolean
        variant?: 'default' | 'outline' | 'ghost'
        size?: 'sm' | 'md' | 'lg'
        className?: string
    }>

    Checkbox?: React.FC<{
        checked: boolean
        onChange: (checked: boolean) => void
        indeterminate?: boolean
        disabled?: boolean
    }>

    Skeleton?: React.FC<{ className?: string }>

    Input?: React.FC<{
        value: string
        onChange: (value: string) => void
        placeholder?: string
        className?: string
    }>

    // ========== Layout Containers ==========
    Card?: React.FC<{
        children: React.ReactNode
        className?: string
        onClick?: () => void
    }>
}

// ============================================================================
// Main DataTable Props
// ============================================================================

export interface DataTableProps<T> {
    // Required
    /** Column definitions */
    columns: ColumnDef<T>[]
    /** Server data configuration */
    serverData: ServerDataConfig<T>
    /** Function to get unique ID for each row */
    getRowId: (row: T) => string

    // Customization
    /** Custom slot components */
    slots?: Partial<DataTableSlots>

    // View state
    /** Initial view configuration */
    initialView?: Partial<ViewState>
    /** Callback when view state changes */
    onViewChange?: (view: ViewState) => void

    // Selection
    /** Enable row selection */
    enableRowSelection?: boolean
    /** Single or multiple selection */
    selectionMode?: 'single' | 'multiple'
    /** Currently selected row IDs (controlled) */
    selectedRowIds?: string[]
    /** Callback when selection changes */
    onSelectionChange?: (ids: string[]) => void

    // Appearance
    /** Additional class name for container */
    className?: string
    /** Breakpoint for mobile card view (default: 640) */
    mobileBreakpoint?: number
    /** Page size options (default: [10, 20, 50, 100]) */
    pageSizeOptions?: number[]
    /** Stick header when scrolling (default: true) */
    stickyHeader?: boolean
    /** Row density/height (default: 'medium') */
    rowDensity?: RowHeight
    /** Show striped rows (default: false) */
    stripedRows?: boolean
    /** Show vertical grid lines (default: false) */
    showGridLines?: boolean
    /** Layout direction (default: 'ltr') */
    direction?: 'ltr' | 'rtl'

    // Events
    /** Callback when row is clicked */
    onRowClick?: (row: T) => void

    // Mobile
    /** Custom card renderer for mobile view */
    cardRenderer?: (row: T) => React.ReactNode
}

// ============================================================================
// Internal Types
// ============================================================================

export interface ColumnState {
    visibility: Record<string, boolean>
    widths: Record<string, number>
    pinning: { left: string[]; right: string[] }
    order: string[]
}

export interface PinningOffsets {
    left: Record<string, number>
    right: Record<string, number>
}

// Z-index hierarchy
export const Z_INDEX = {
    body: 0,
    stickyColumn: 10,
    header: 20,
    stickyHeaderColumn: 30,
    resizeHandle: 40,
    dropdown: 50,
} as const
