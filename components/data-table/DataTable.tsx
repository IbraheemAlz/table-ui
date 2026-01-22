'use client'

import { useMemo, useEffect, useCallback, useRef } from 'react'
import { DataTableProvider, mergeSlots } from '../../lib/context/context'
import { DataTableHeader } from './DataTableHeader'
import { DataTableBody } from './DataTableBody'
import { DataTablePagination } from './DataTablePagination'
import { DataTableToolbar } from './DataTableToolbar'
import { DataTableCardView } from './DataTableCardView'
import { useColumnState } from './hooks/customized-table/useColumnState'
import { usePinningOffsets } from './hooks/customized-table/usePinningOffsets'
import { useRowSelection } from './hooks/customized-table/useRowSelection'
import { useWindowSize } from './hooks/customized-table/useWindowSize'
import { cn } from '../../lib/utils/cn'
import type { DataTableProps, HistoryAction } from '../../lib/types/customized-table'
import { useHistory } from './hooks/customized-table/useHistory'

export function DataTable<T>({
    serverData,
    columns,
    getRowId,
    pageSizeOptions = [10, 20, 50, 100],
    slots: customSlots,
    initialView,
    onViewChange,
    enableRowSelection = false,
    selectionMode = 'single',
    selectedRowIds: controlledSelectedIds,
    onSelectionChange,
    className,
    mobileBreakpoint = 640,
    stickyHeader = true,
    rowDensity = 'medium',
    stripedRows = false,
    showGridLines = false,
    direction = 'ltr',
    onRowClick,
}: DataTableProps<T>) {
    // Merge custom slots with defaults
    const slots = useMemo(() => mergeSlots(customSlots), [customSlots])

    // Container ref for focus management
    const containerRef = useRef<HTMLDivElement>(null);

    // Focus table container
    const focusTable = useCallback(() => {
        containerRef.current?.focus()
    }, []);

    // Window size detection for responsive card view
    const { viewportWidth } = useWindowSize()
    const isCardView = viewportWidth > 0 && viewportWidth < mobileBreakpoint

    // Raw Column State
    const {
        columnState,
        orderedColumns,
        setColumnVisibility: rawSetVisibility,
        setColumnWidth: rawSetWidth,
        toggleColumnPin: rawTogglePin,
        moveColumn: rawMoveColumn,
        setColumnOrder: rawSetColumnOrder,
        getColumnWidth,
        getColumnPinning,
    } = useColumnState({
        columns,
        initialView,
        onViewChange,
    })

    // Raw Pinning Offsets
    const pinningOffsets = usePinningOffsets({
        columnState,
        getColumnWidth,
    })

    // Raw Selection State
    const {
        selectedRowIds,
        setSelectedRowIds: rawSetSelectedRowIds,
        toggleRowSelection: rawToggleRowSelection,
        toggleAllRows: rawToggleAllRows,
        isRowSelected,
    } = useRowSelection({
        mode: selectionMode,
        controlledSelectedIds,
        onSelectionChange,
    })

    // ------------------------------------------------------------------------
    // HISTORY CONTROLLER
    // ------------------------------------------------------------------------
    const history = useHistory<HistoryAction>({
        limit: 20, // Increased limit per recommendation
        onUndo: (action) => {
            switch (action.type) {
                case 'SELECTION':
                    rawSetSelectedRowIds(new Set(action.prev))
                    break
                case 'PIN':
                    // We need to carefully revert pinning.
                    // rawTogglePin toggles, so we might need a direct 'set' if the hook supported it.
                    // Since it toggles, we check current state vs desired 'prev'.
                    // Optimization: For now, assuming rawTogglePin sets strictly if we match logic.
                    // Actually, rawTogglePin takes a target position.
                    rawTogglePin(action.colId, action.prev)
                    break
                case 'VISIBILITY':
                    rawSetVisibility(action.colId, action.prev)
                    break
                case 'ORDER':
                    rawSetColumnOrder(action.prev)
                    break
                case 'RESIZE':
                    rawSetWidth(action.colId, action.prev)
                    break
            }
        },
        onRedo: (action) => {
            switch (action.type) {
                case 'SELECTION':
                    rawSetSelectedRowIds(new Set(action.next))
                    break
                case 'PIN':
                    rawTogglePin(action.colId, action.next)
                    break
                case 'VISIBILITY':
                    rawSetVisibility(action.colId, action.next)
                    break
                case 'ORDER':
                    rawSetColumnOrder(action.next)
                    break
                case 'RESIZE':
                    rawSetWidth(action.colId, action.next)
                    break
            }
        }
    })

    // Wrapper getRowId to handle index fallback
    const wrappedGetRowId = useMemo(() => {
        return (row: T) => {
            try {
                return getRowId(row)
            } catch {
                return String(serverData.data.indexOf(row))
            }
        }
    }, [getRowId, serverData.data])

    // --- Action Interceptors ---
    const handleColumnVisibility = useCallback((colId: string, visible: boolean) => {
        const current = columnState.visibility[colId] ?? true
        history.record({ type: 'VISIBILITY', colId, prev: current, next: visible })
        rawSetVisibility(colId, visible)
        // Use setTimeout to ensure focus is restored AFTER menu closes and DOM updates
        setTimeout(focusTable, 0)
    }, [columnState.visibility, rawSetVisibility, history, focusTable])

    const handleSetColumnWidth = useCallback((colId: string, width: number) => {
        const current = columnState.widths[colId] ?? columns.find(c => c.id === colId)?.size ?? 150
        history.record({ type: 'RESIZE', colId, prev: current, next: width })
        rawSetWidth(colId, width)
        setTimeout(focusTable, 0)
    }, [columnState.widths, rawSetWidth, history, columns, focusTable])

    const handleTogglePin = useCallback((colId: string, position: 'left' | 'right' | false) => {
        const current = getColumnPinning(colId)
        history.record({ type: 'PIN', colId, prev: current, next: position })
        rawTogglePin(colId, position)
        setTimeout(focusTable, 0)
    }, [getColumnPinning, rawTogglePin, history, focusTable])

    const handleMoveColumn = useCallback((colId: string, dir: 'left' | 'right' | 'start' | 'end') => {
        const prevOrder = [...columnState.order]
        const currentIndex = prevOrder.indexOf(colId)
        if (currentIndex === -1) return

        let newIndex: number
        switch (dir) {
            case 'left': newIndex = Math.max(0, currentIndex - 1); break;
            case 'right': newIndex = Math.min(prevOrder.length - 1, currentIndex + 1); break;
            case 'start': newIndex = 0; break;
            case 'end': newIndex = prevOrder.length - 1; break;
            default: return; // Should not happen
        }

        if (newIndex !== currentIndex) {
            const nextOrder = [...prevOrder]
            nextOrder.splice(currentIndex, 1)
            nextOrder.splice(newIndex, 0, colId)

            history.record({ type: 'ORDER', prev: prevOrder, next: nextOrder })
            rawMoveColumn(colId, dir)
            setTimeout(focusTable, 0)
        }
    }, [columnState.order, rawMoveColumn, history, focusTable])


    // Selection Interceptor
    // We intercept manual toggles.
    const handleToggleRowSelection = useCallback((rowId: string) => {
        const prev = Array.from(selectedRowIds)
        rawToggleRowSelection(rowId)

        // We need the NEXT state to record it?
        // Or we record action: "Toggle row X".
        // Undo: Sync toggle row X.
        // Redo: Sync toggle row X.
        // But 'SELECTION' type uses arrays. Let's compute.
        const next = new Set(prev)
        if (next.has(rowId)) next.delete(rowId); else next.add(rowId)

        history.record({ type: 'SELECTION', prev, next: Array.from(next) })

        if (onRowClick) {
            const row = serverData.data.find(r => wrappedGetRowId(r) === rowId)
            if (row) onRowClick(row)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRowIds, rawToggleRowSelection, history, serverData.data, onRowClick])

    const handleToggleAllRows = useCallback((checked: boolean) => {
        const prev = Array.from(selectedRowIds)
        const allIds = serverData.data.map(row => wrappedGetRowId(row))

        // Compute next
        let next: string[]
        if (checked) {
            // Add all current page IDs to selection
            const set = new Set(prev)
            allIds.forEach(id => set.add(id))
            next = Array.from(set)
        } else {
            // Remove all current page IDs
            const set = new Set(prev)
            allIds.forEach(id => set.delete(id))
            next = Array.from(set)
        }

        history.record({ type: 'SELECTION', prev, next })

        // Call raw
        rawToggleAllRows(checked, allIds)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRowIds, serverData.data, rawToggleAllRows, history])

    // Context value
    const contextValue = useMemo(() => ({
        columns,
        orderedColumns,
        columnState,
        setColumnVisibility: handleColumnVisibility, // INTERCEPTED
        setColumnWidth: handleSetColumnWidth,        // INTERCEPTED
        toggleColumnPin: handleTogglePin,            // INTERCEPTED
        moveColumn: handleMoveColumn,                // INTERCEPTED
        pinningOffsets,
        serverData,
        selectedRowIds,
        setSelectedRowIds: rawSetSelectedRowIds, // Direct set (usually programmatic)
        toggleRowSelection: handleToggleRowSelection, // INTERCEPTED
        toggleAllRows: handleToggleAllRows,           // INTERCEPTED
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [
        // Dependencies including history handlers...
        columns, columnState, handleColumnVisibility, handleSetColumnWidth, handleTogglePin,
        rawMoveColumn, pinningOffsets, serverData, selectedRowIds, rawSetSelectedRowIds,
        handleToggleRowSelection, handleToggleAllRows, isRowSelected, slots, enableRowSelection,
        selectionMode, wrappedGetRowId, stickyHeader, rowDensity, stripedRows, showGridLines, direction
    ])

    // Add focusTable to contextValue
    const finalContextValue = useMemo(() => ({
        ...contextValue,
        focusTable
    }), [contextValue, focusTable])

    const { Table } = slots

    // Clear history when server data (page/sort) changes
    useEffect(() => {
        history.clear()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverData.page, serverData.pageSize, serverData.sortColumn, serverData.sortDirection])

    return (
        <DataTableProvider value={finalContextValue}>
            <div
                dir={direction}
                ref={containerRef}
                className={cn("relative w-full flex flex-col gap-2 focus:outline-none", className)}
                tabIndex={-1} // Allow container to receive focus for keyboard events
                onKeyDown={(e) => {
                    // Check for Z key (either character 'z'/'Z' or physical KeyZ for non-Latin layouts)
                    const isZKey = e.key === 'z' || e.key === 'Z' || e.code === 'KeyZ'

                    // Undo: Ctrl+Z
                    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && isZKey) {
                        e.preventDefault()
                        history.undo()
                    }
                    // Redo: Ctrl+Shift+Z
                    if ((e.ctrlKey || e.metaKey) && e.shiftKey && isZKey) {
                        e.preventDefault()
                        history.redo()
                    }
                    // Escape: Clear Selection
                    if (e.key === 'Escape') {
                        e.preventDefault()
                        handleToggleAllRows(false)
                    }
                }}
            >
                {/* Toolbar - hidden in card view */}
                {!isCardView && <DataTableToolbar />}

                {/* Card View (Mobile) or Table View (Desktop) */}
                {isCardView ? (
                    <DataTableCardView />
                ) : (
                    <div className="relative flex-1 rounded-md border border-gray-200 bg-white overflow-auto isolate min-h-100">
                        {/* Resize Guide Line */}
                        <div
                            id="table-resize-guide"
                            className="absolute top-0 bottom-0 w-0.5 bg-blue-600 z-9999 opacity-0 pointer-events-none transition-opacity duration-75"
                        />
                        <Table className="w-full h-full" style={{ tableLayout: 'fixed' }}>
                            <DataTableHeader />
                            <DataTableBody />
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                <div className="shrink-0">
                    <DataTablePagination pageSizeOptions={pageSizeOptions} />
                </div>
            </div>
        </DataTableProvider>
    )
}
