'use client'

import React, { useMemo } from 'react'
import { DataTableProvider, mergeSlots } from './context'
import { DataTableHeader } from './DataTableHeader'
import { DataTableBody } from './DataTableBody'
import { DataTablePagination } from './DataTablePagination'
import { DataTableToolbar } from './DataTableToolbar'
import { DataTableCardView } from './DataTableCardView'
import { useColumnState } from './hooks/useColumnState'
import { usePinningOffsets } from './hooks/usePinningOffsets'
import { useRowSelection } from './hooks/useRowSelection'
import { useResizeObserver } from './hooks/useResizeObserver'
import { cn } from './utils/cn'
import type { DataTableProps, DataTableSlots } from './types'

export function DataTable<T>({
    columns,
    serverData,
    getRowId,
    slots: customSlots,
    initialView,
    onViewChange,
    enableRowSelection = false,
    selectionMode = 'single',
    selectedRowIds: controlledSelectedIds,
    onSelectionChange,
    className,
    mobileBreakpoint = 640,
    pageSizeOptions = [10, 20, 50, 100],
    stickyHeader = true,
    rowDensity = 'medium',
    stripedRows = false,
    showGridLines = false,
    direction = 'ltr',
    onRowClick,
    cardRenderer,
}: DataTableProps<T>) {
    // Merge custom slots with defaults
    const slots = useMemo(() => mergeSlots(customSlots), [customSlots])

    // Container resize detection
    const { ref: containerRef, width: containerWidth } = useResizeObserver<HTMLDivElement>()
    const isCardView = containerWidth > 0 && containerWidth < mobileBreakpoint

    // Column state management
    const {
        columnState, // ... existing ...
        orderedColumns,
        setColumnVisibility,
        setColumnWidth,
        toggleColumnPin,
        moveColumn,
        getColumnWidth,
        getViewState,
    } = useColumnState({
        columns,
        initialView,
        onViewChange,
    })

    // Pinning offsets calculation
    const pinningOffsets = usePinningOffsets({
        columnState,
        getColumnWidth,
    })

    // Row selection management
    const {
        selectedRowIds,
        toggleRowSelection,
        toggleAllRows,
        isRowSelected,
    } = useRowSelection({
        mode: selectionMode,
        controlledSelectedIds,
        onSelectionChange,
    })

    // Wrapper getRowId to handle index fallback
    const wrappedGetRowId = useMemo(() => {
        return (row: T) => {
            try {
                return getRowId(row)
            } catch {
                // Fallback to index-based ID
                const index = serverData.data.indexOf(row)
                return String(index)
            }
        }
    }, [getRowId, serverData.data])

    // Context value
    const contextValue = useMemo(() => ({
        columns,
        orderedColumns,
        columnState,
        setColumnVisibility,
        setColumnWidth,
        toggleColumnPin,
        moveColumn,
        pinningOffsets,
        serverData,
        selectedRowIds,
        toggleRowSelection: (rowId: string) => {
            toggleRowSelection(rowId)
            if (onRowClick) {
                const row = serverData.data.find(r => wrappedGetRowId(r) === rowId)
                if (row) onRowClick(row)
            }
        },
        toggleAllRows: (selected: boolean) => {
            // Need all row IDs for select all
            const allIds = serverData.data.map(row => wrappedGetRowId(row))
            toggleAllRows(selected, allIds)
        },
        isRowSelected,
        slots,
        enableRowSelection,
        selectionMode,
        getRowId: wrappedGetRowId,
        stickyHeader,
        rowDensity,
        stripedRows,
        showGridLines,
        direction,
    }), [
        columns,
        columnState,
        setColumnVisibility,
        setColumnWidth,
        toggleColumnPin,
        moveColumn,
        pinningOffsets,
        serverData,
        selectedRowIds,
        toggleRowSelection,
        toggleAllRows,
        isRowSelected,
        slots,
        enableRowSelection,
        selectionMode,
        wrappedGetRowId,
        stickyHeader,
        onRowClick,
        pageSizeOptions,
        rowDensity,
        stripedRows,
        showGridLines,
        direction,
    ])

    const { Table } = slots

    return (
        <DataTableProvider value={contextValue}>
            <div dir={direction} ref={containerRef} className={cn("relative w-full flex flex-col gap-2", className)}>
                {/* Toolbar - hidden in card view */}
                {!isCardView && <DataTableToolbar />}

                {/* Mobile search in card view */}
                {isCardView && (
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search..."
                            defaultValue={serverData.searchQuery}
                            onChange={(e) => serverData.onSearchChange?.(e.target.value)}
                            className="h-10 w-full rounded-md border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                )}

                {/* Card View (Mobile) or Table View (Desktop) */}
                {isCardView ? (
                    <DataTableCardView />
                ) : (
                    <div className="relative flex-1 rounded-md border border-gray-200 bg-white overflow-auto isolate min-h-[400px]">
                        {/* Resize Guide Line */}
                        <div
                            id="table-resize-guide"
                            className="absolute top-0 bottom-0 w-0.5 bg-blue-600 z-[9999] opacity-0 pointer-events-none transition-opacity duration-75"
                        />
                        <Table className="w-full h-full" style={{ tableLayout: 'fixed' }}>
                            <DataTableHeader />
                            <DataTableBody />
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                <div className="shrink-0">
                    <DataTablePagination />
                </div>
            </div>
        </DataTableProvider>
    )
}
