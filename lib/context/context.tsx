'use client'

import { createContext, useContext } from 'react'
import { defaultSlots } from '../../components/data-table/defaults'
import { ColumnDef, ColumnState, DataTableSlots, PinningOffsets, RowHeight, ServerDataConfig } from 'customized-table';

// ============================================================================
// Context Types
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataTableContextValue<T = any> {
    // Column definitions
    columns: ColumnDef<T>[]

    // Ordered visible columns (pinned left -> unpinned -> pinned right)
    orderedColumns: ColumnDef<T>[]

    // Column state
    columnState: ColumnState
    setColumnVisibility: (columnId: string, visible: boolean) => void
    setColumnWidth: (columnId: string, width: number) => void
    toggleColumnPin: (columnId: string, position: 'left' | 'right' | false) => void
    moveColumn: (columnId: string, direction: 'left' | 'right' | 'start' | 'end') => void

    // Pinning offsets
    pinningOffsets: PinningOffsets

    // Server data
    serverData: ServerDataConfig<T>

    // Row selection
    selectedRowIds: Set<string>
    setSelectedRowIds: (ids: Set<string>) => void
    toggleRowSelection: (rowId: string) => void
    toggleAllRows: (selected: boolean) => void
    isRowSelected: (rowId: string) => boolean

    // Slots
    slots: Required<DataTableSlots>

    // Config
    enableRowSelection: boolean
    selectionMode: 'single' | 'multiple'
    getRowId: (row: T) => string
    stickyHeader: boolean
    rowDensity?: RowHeight
    stripedRows?: boolean
    showGridLines?: boolean
    direction: 'ltr' | 'rtl'
    focusTable: () => void

    // Row Expansion
    enableRowExpansion: boolean
    expandedRowIds: Set<string>
    toggleRowExpansion: (rowId: string) => void
    isRowExpanded: (rowId: string) => boolean
    collapseAllRows: () => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    renderExpandedRow?: (row: any) => React.ReactNode
}

// ============================================================================
// Context
// ============================================================================

const DataTableContext = createContext<DataTableContextValue | null>(null)

export function DataTableProvider<T>({
    children,
    value
}: {
    children: React.ReactNode
    value: DataTableContextValue<T>
}) {
    return (
        <DataTableContext.Provider value={value as DataTableContextValue}>
            {children}
        </DataTableContext.Provider>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDataTable<T = any>(): DataTableContextValue<T> {
    const context = useContext(DataTableContext)
    if (!context) {
        throw new Error('useDataTable must be used within a DataTableProvider')
    }
    return context as DataTableContextValue<T>
}

// ============================================================================
// Merge slots helper
// ============================================================================

export function mergeSlots(customSlots?: Partial<DataTableSlots>): Required<DataTableSlots> {
    if (!customSlots) return defaultSlots
    return { ...defaultSlots, ...customSlots }
}
