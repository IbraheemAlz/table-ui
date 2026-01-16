'use client'

import React from 'react'
import { useDataTable } from './context'
import { cn } from './utils/cn'
import { Z_INDEX } from './types'

export function DataTableBody() {
    const {
        columns,
        orderedColumns,
        columnState,
        slots,
        pinningOffsets,
        serverData,
        enableRowSelection,
        selectionMode,
        selectedRowIds,
        toggleRowSelection,
        getRowId,
        rowDensity,
        stripedRows,
        direction,
        showGridLines,
    } = useDataTable()

    const isRTL = direction === 'rtl'

    const densityClasses = {
        'short': 'py-1',
        'medium': 'py-2',
        'tall': 'py-4',
        'extra-tall': 'py-6',
    }[rowDensity ?? 'medium']

    const { Tbody, Tr, Td, Checkbox, Skeleton } = slots

    // Loading state
    if (serverData.isLoading) {
        return (
            <Tbody>
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <Tr key={`skeleton-${rowIndex}`} className="border-b border-gray-200">
                        {enableRowSelection && selectionMode === 'multiple' && (
                            <Td className="w-12 px-3">
                                <Skeleton className="h-4 w-4" />
                            </Td>
                        )}
                        {orderedColumns.map((column) => (
                            <Td key={column.id} className="py-3">
                                <Skeleton className="h-4 w-3/4" />
                            </Td>
                        ))}
                    </Tr>
                ))}
            </Tbody>
        )
    }

    // Empty state
    if (serverData.data.length === 0) {
        const colSpan = orderedColumns.length + (enableRowSelection && selectionMode === 'multiple' ? 1 : 0)
        return (
            <Tbody>
                <tr>
                    <td colSpan={colSpan} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">No data available</p>
                                <p className="text-sm text-gray-500 mt-1">There are no records to display.</p>
                            </div>
                        </div>
                    </td>
                </tr>
            </Tbody>
        )
    }

    return (
        <Tbody className={cn(serverData.isRefetching && "opacity-60 pointer-events-none")}>
            {serverData.data.map((row, rowIndex) => {
                const rowId = getRowId(row)
                const isSelected = selectedRowIds.has(rowId)

                return (
                    <Tr
                        key={rowId}
                        onClick={() => toggleRowSelection(rowId)}
                        data-selected={isSelected}
                        className={cn(
                            "border-b border-gray-200 last:border-b-0 transition-colors",
                            "hover:bg-gray-50 cursor-pointer",
                            isSelected
                                ? "bg-blue-50 hover:bg-blue-100"
                                : stripedRows && "odd:bg-white even:bg-gray-50"
                        )}
                    >
                        {/* Selection checkbox / Row Number */}
                        {enableRowSelection && selectionMode === 'multiple' && (
                            <Td
                                className="w-12 px-3 text-center group relative p-0"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                style={{
                                    position: 'sticky',
                                    [isRTL ? 'right' : 'left']: 0,
                                    zIndex: Z_INDEX.stickyColumn,
                                    backgroundColor: isSelected ? 'rgb(239 246 255)' : 'white', // blue-50 if selected
                                }}
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {/* Number - hidden on hover or if selected */}
                                    <span
                                        className={cn(
                                            "text-xs text-gray-400 font-medium transition-opacity",
                                            (isSelected) ? "opacity-0" : "group-hover:opacity-0"
                                        )}
                                    >
                                        {(serverData.page - 1) * serverData.pageSize + rowIndex + 1}
                                    </span>

                                    {/* Checkbox - visible on hover or if selected */}
                                    <div
                                        className={cn(
                                            "absolute inset-0 flex items-center justify-center transition-opacity opacity-0",
                                            isSelected ? "opacity-100" : "group-hover:opacity-100"
                                        )}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onChange={() => toggleRowSelection(rowId)}
                                        />
                                    </div>
                                </div>
                            </Td>
                        )}

                        {/* Data cells */}
                        {orderedColumns.map((column) => {
                            const pinning = columnState.pinning.left.includes(column.id)
                                ? 'left'
                                : columnState.pinning.right.includes(column.id)
                                    ? 'right'
                                    : null

                            const width = columnState.widths[column.id] ?? column.size
                            const offset = pinning === 'left'
                                ? (pinningOffsets.left[column.id] ?? 0) + (enableRowSelection ? 48 : 0)
                                : pinning === 'right'
                                    ? pinningOffsets.right[column.id]
                                    : undefined

                            // Get cell value
                            let value: unknown
                            if (column.accessorFn) {
                                value = column.accessorFn(row)
                            } else if (column.accessorKey) {
                                value = (row as any)[column.accessorKey]
                            }

                            // Render cell content
                            const content = column.cell
                                ? column.cell({ value, row, rowIndex })
                                : value !== null && value !== undefined
                                    ? String(value)
                                    : <span className="text-gray-400">—</span>

                            const style: React.CSSProperties = {
                                width: width ?? column.size ?? 150,
                                ...(pinning === 'left' && {
                                    position: 'sticky',
                                    [isRTL ? 'right' : 'left']: offset,
                                    zIndex: Z_INDEX.stickyColumn,
                                    backgroundColor: isSelected ? 'rgb(239 246 255)' : 'white',
                                }),
                                ...(pinning === 'right' && {
                                    position: 'sticky',
                                    [isRTL ? 'left' : 'right']: offset,
                                    zIndex: Z_INDEX.stickyColumn,
                                    backgroundColor: isSelected ? 'rgb(239 246 255)' : 'white',
                                }),
                                textAlign: isRTL ? 'right' : 'left', // Ensure text aligns correctly
                            }

                            return (
                                <Td
                                    key={column.id}
                                    className={cn(
                                        densityClasses, "text-sm",
                                        showGridLines && (isRTL ? "border-l border-gray-200 last:border-l-0" : "border-r border-gray-200 last:border-r-0"),
                                        pinning && "bg-white"
                                    )}
                                    style={style}
                                    data-column-id={column.id}
                                >
                                    <div className="truncate">{content}</div>
                                </Td>
                            )
                        })}
                    </Tr>
                )
            })}
        </Tbody>
    )
}
