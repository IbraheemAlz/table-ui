'use client'

import React, { useState } from 'react'
import { useDataTable } from '../../lib/context/context'
import { ColumnMenu } from './ColumnMenu'
import { ResizeHandle } from './ResizeHandle'
import { useColumnResize } from './hooks/customized-table/useColumnResize'
import { cn } from '../../lib/utils/cn'
import { Z_INDEX } from '../../lib/types/customized-table'

export function DataTableHeader() {
    const {
        orderedColumns,
        columnState,
        slots,
        pinningOffsets,
        stickyHeader,
        enableRowSelection,
        selectionMode,
        selectedRowIds,
        toggleAllRows,
        serverData,
        setColumnWidth,
        getRowId,
        direction,
        enableRowExpansion,
    } = useDataTable()

    const { Thead, Tr, Th, Checkbox } = slots
    const isRTL = direction === 'rtl'

    // Get all current row IDs for select all - use getRowId for consistency
    const allRowIds = serverData.data.map(row => getRowId(row))

    const isAllSelected = allRowIds.length > 0 && allRowIds.every(id => selectedRowIds.has(id))
    const isSomeSelected = allRowIds.some(id => selectedRowIds.has(id)) && !isAllSelected

    return (
        <Thead className={cn(stickyHeader && "sticky top-0")} style={{ zIndex: 100 }}>
            <Tr className="border-b border-gray-200 bg-gray-50">
                {/* Expand button column header - empty header for alignment */}
                {enableRowExpansion && (
                    <Th
                        className="w-10 px-2 text-center bg-gray-50"
                        style={{
                            position: 'sticky',
                            [isRTL ? 'right' : 'left']: 0,
                            zIndex: Z_INDEX.stickyHeaderColumn
                        }}
                    >
                        <></>
                    </Th>
                )}

                {/* Row number / Selection column - always sticky start */}
                {enableRowSelection && (
                    <Th
                        className="w-12 px-3 text-center bg-gray-50"
                        style={{
                            position: 'sticky',
                            [isRTL ? 'right' : 'left']: enableRowExpansion ? 40 : 0,
                            zIndex: Z_INDEX.stickyHeaderColumn
                        }}
                    >
                        {selectionMode === 'multiple' ? (
                            <Checkbox
                                checked={isAllSelected}
                                indeterminate={isSomeSelected}
                                onChange={(checked) => toggleAllRows(checked)}
                            />
                        ) : (
                            <span className="text-xs font-medium text-gray-500">#</span>
                        )}
                    </Th>
                )}

                {/* Data columns */}
                {orderedColumns.map((column, index) => {
                    const isLast = index === orderedColumns.length - 1

                    const pinning = columnState.pinning.left.includes(column.id)
                        ? 'left'
                        : columnState.pinning.right.includes(column.id)
                            ? 'right'
                            : null

                    const width = columnState.widths[column.id] ?? column.size
                    const expandOffset = enableRowExpansion ? 40 : 0
                    const selectionOffset = enableRowSelection ? 48 : 0
                    const offset = pinning === 'left'
                        ? (pinningOffsets.left[column.id] ?? 0) + selectionOffset + expandOffset
                        : pinning === 'right'
                            ? pinningOffsets.right[column.id]
                            : undefined

                    return (
                        <HeaderCell
                            key={column.id}
                            column={column}
                            width={width}
                            pinning={pinning}
                            offset={offset}
                            isLast={isLast}
                            onWidthChange={(w) => setColumnWidth(column.id, w)}
                            isRTL={isRTL}
                        />
                    )
                })}
            </Tr>
        </Thead>
    )
}

// Separate component for header cell to manage resize state
function HeaderCell({
    column,
    width,
    pinning,
    offset,
    isLast,
    onWidthChange,
    isRTL,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    column: any
    width?: number
    pinning: 'left' | 'right' | null
    offset?: number
    isLast: boolean
    onWidthChange: (width: number) => void
    isRTL: boolean
}) {
    const { slots, rowDensity, showGridLines } = useDataTable()
    const { Th } = slots

    const densityHeight = {
        'short': 'h-8',
        'medium': 'h-10',
        'tall': 'h-12',
        'extra-tall': 'h-14',
    }[rowDensity ?? 'medium']

    const [isResizing, setIsResizing] = useState(false)

    const canResize = column.enableResizing !== false
    const minWidth = column.minSize ?? 50
    const maxWidth = column.maxSize ?? 500
    const defaultWidth = column.size ?? 'auto'

    const { handleMouseDown, handleDoubleClick } = useColumnResize({
        columnId: column.id,
        minWidth,
        maxWidth,
        onResizeEnd: (w) => {
            setIsResizing(false)
            onWidthChange(w)
        },
        direction: isRTL ? 'rtl' : 'ltr',
    })

    const style: React.CSSProperties = {
        width: 'auto',
        minWidth: width ?? defaultWidth,
        maxWidth: maxWidth,
        ...(pinning === 'left' && {
            position: 'sticky',
            [isRTL ? 'right' : 'left']: offset,
            zIndex: Z_INDEX.stickyHeaderColumn
        }),
        ...(pinning === 'right' && {
            position: 'sticky',
            [isRTL ? 'left' : 'right']: offset,
            zIndex: Z_INDEX.stickyHeaderColumn
        }),
        // Ensure text alignment follows direction
        textAlign: isRTL ? 'right' : 'left',
    }

    return (
        <Th
            className={cn(
                "relative group p-0",
                densityHeight,
                showGridLines && (isRTL ? "border-l border-gray-200 last:border-l-0" : "border-r border-gray-200 last:border-r-0"),
                "bg-gray-50",
                pinning && "bg-gray-50"
            )}
            style={style}
            data-column-id={column.id}
        >
            {/* Column menu fills entire cell */}
            <ColumnMenu column={column} align={isLast ? 'end' : 'start'} />

            {/* Resize handle positioned absolutely */}
            {canResize && (
                <ResizeHandle
                    isResizing={isResizing}
                    className={isRTL ? "left-0" : "right-0"}
                    onMouseDown={(e) => {
                        setIsResizing(true)
                        handleMouseDown(e, width ?? defaultWidth)
                    }}
                    onDoubleClick={(e) => handleDoubleClick(e, column.size)}
                />
            )}
        </Th>
    )
}
