'use client'

import React from 'react'
import { useDataTable } from '../../lib/context/context'
import { cn } from '../../lib/utils/cn'
import { Z_INDEX } from '../../lib/types/customized-table'
import { ExpandButton } from './ExpandButton'
import { useKeyboardNavigation } from './hooks/customized-table/useKeyboardNavigation'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DataTableBody<T>() {
    const {
        orderedColumns,
        columnState,
        slots,
        pinningOffsets,
        serverData,
        direction,
        rowDensity,
        stripedRows,
        showGridLines,
        enableRowSelection,
        selectionMode,
        selectedRowIds,
        setSelectedRowIds,
        toggleRowSelection,
        getRowId,
        // Row Expansion
        enableRowExpansion,
        expandedRowIds,
        toggleRowExpansion,
        isRowExpanded,
        renderExpandedRow,
    } = useDataTable()

    const {
        focusedRowIndex,
        handleKeyDown,
        handleRowClick,
        rowRefs
    } = useKeyboardNavigation({
        data: serverData.data,
        selectedRowIds: Array.from(selectedRowIds), // Convert Set to Array
        onSelectionChange: (ids) => setSelectedRowIds(new Set(ids)), // Convert Array to Set
        getRowId
    })

    const isRTL = direction === 'rtl'

    const densityClasses = {
        'short': 'py-1',
        'medium': 'py-2',
        'tall': 'py-4',
        'extra-tall': 'py-6',
    }[rowDensity ?? 'medium']

    const { Tbody, Tr, Td, Checkbox, Skeleton } = slots

    // Calculate total column count for expanded row colspan
    const totalColumns = orderedColumns.length
        + (enableRowSelection ? 1 : 0)
        + (enableRowExpansion ? 1 : 0)

    // Loading state
    if (serverData.isLoading) {
        return (
            <Tbody>
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <Tr key={`skeleton-${rowIndex}`} className="border-b border-gray-200">
                        {enableRowExpansion && (
                            <Td className="w-10 px-2">
                                <Skeleton className="h-4 w-4" />
                            </Td>
                        )}
                        {enableRowSelection && (
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
        const colSpan = orderedColumns.length
            + (enableRowSelection ? 1 : 0)
            + (enableRowExpansion ? 1 : 0)
        return (
            <Tbody>
                <tr>
                    <td colSpan={colSpan} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg className="h-7 w-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <Tbody
            tabIndex={focusedRowIndex === null ? 0 : -1} // Roving TabIndex entry point
            onFocus={() => {
                // If focusing the body (not a row), focus the first row or last known
                if (focusedRowIndex === null) {
                    handleRowClick(0)
                }
            }}
            className={cn(
                '[&_tr:last-child]:border-0',
                serverData.isRefetching && "opacity-60 pointer-events-none"
            )}
        >
            {serverData.data.map((row, rowIndex) => {
                const rowId = getRowId(row)
                const isSelected = selectedRowIds.has(rowId)
                const isFocused = focusedRowIndex === rowIndex
                const isExpanded = enableRowExpansion && isRowExpanded(rowId)

                return (
                    <React.Fragment key={rowId}>
                        <Tr
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            ref={(el: any) => { rowRefs.current[rowIndex] = el }}
                            data-state={isSelected ? 'selected' : undefined}
                            tabIndex={isFocused ? 0 : -1}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onKeyDown={(e: any) => handleKeyDown(e, rowIndex)}
                            onClick={() => {
                                if (!enableRowSelection) return
                                handleRowClick(rowIndex)
                                // Toggle selection on click if enabled
                                if (selectionMode === 'multiple' || selectionMode === 'single') {
                                    toggleRowSelection(rowId)
                                }
                            }}
                            className={cn(
                                // Base styles with enhanced transitions
                                'border-b transition-all duration-150 ease-out',
                                'hover:bg-gray-50/50',
                                // Focus ring
                                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
                                // Striped rows
                                stripedRows && rowIndex % 2 !== 0 && 'bg-gray-50/50',
                                stripedRows && rowIndex % 2 !== 0 && isSelected && 'bg-blue-50/80',
                                // Enhanced selection styling
                                isSelected && [
                                    'bg-gradient-to-r from-blue-50 to-transparent',
                                    'relative',
                                    // Left accent border via box-shadow (works with sticky columns)
                                    'shadow-[inset_3px_0_0_0_rgb(59,130,246)]',
                                    // Subtle glow
                                    'animate-selectionGlow',
                                ],
                            )}
                        >
                            {/* Expand Button */}
                            {enableRowExpansion && (
                                <Td
                                    className="w-10 px-2 text-center"
                                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                    style={{
                                        position: 'sticky',
                                        [isRTL ? 'right' : 'left']: 0,
                                        zIndex: Z_INDEX.stickyColumn,
                                        backgroundColor: isSelected ? 'rgb(239 246 255)' : 'white',
                                    }}
                                >
                                    <ExpandButton
                                        expanded={isExpanded}
                                        onClick={() => toggleRowExpansion(rowId)}
                                    />
                                </Td>
                            )}

                            {/* Selection checkbox / Row Number */}
                            {enableRowSelection && (
                                <Td
                                    className="w-12 px-3 text-center group relative p-0"
                                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                    style={{
                                        position: 'sticky',
                                        [isRTL ? 'right' : 'left']: enableRowExpansion ? 40 : 0,
                                        zIndex: Z_INDEX.stickyColumn,
                                        backgroundColor: isSelected ? 'rgb(239 246 255)' : 'white',
                                    }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {/* Number - always visible in single mode, or transparent in multiple */}
                                        <span
                                            className={cn(
                                                "text-xs text-gray-500 font-medium transition-opacity",
                                                (selectionMode === 'multiple' && (isSelected || "group-hover:opacity-0")) ? "opacity-0" : "opacity-100"
                                            )}
                                        >
                                            {(serverData.page - 1) * serverData.pageSize + rowIndex + 1}
                                        </span>

                                        {/* Checkbox - only for multiple selection */}
                                        {selectionMode === 'multiple' && (
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
                                        )}
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
                                // Adjust offset for expand button column
                                const expandOffset = enableRowExpansion ? 40 : 0
                                const selectionOffset = enableRowSelection ? 48 : 0
                                const offset = pinning === 'left'
                                    ? (pinningOffsets.left[column.id] ?? 0) + selectionOffset + expandOffset
                                    : pinning === 'right'
                                        ? pinningOffsets.right[column.id]
                                        : undefined

                                // Get cell value
                                let value: unknown
                                if (column.accessorFn) {
                                    value = column.accessorFn(row)
                                } else if (column.accessorKey) {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    value = (row as any)[column.accessorKey]
                                }

                                // Render cell content
                                const content = column.cell
                                    ? column.cell({ value, row: row, rowIndex })
                                    : value !== null && value !== undefined
                                        ? String(value)
                                        : <span className="text-gray-500">—</span>

                                const style: React.CSSProperties = {
                                    width: 'auto',
                                    minWidth: width ?? column.size ?? 50,
                                    maxWidth: column.maxSize,
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
                                    textAlign: isRTL ? 'right' : 'left',
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

                        {/* Expanded Row Content */}
                        {(enableRowExpansion && renderExpandedRow) && (
                            <tr>
                                <td
                                    colSpan={totalColumns}
                                    className="p-0 border-b border-gray-200"
                                >
                                    <div
                                        className={cn(
                                            "grid transition-[grid-template-rows] duration-300 ease-in-out",
                                            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                        )}
                                    >
                                        <div className="overflow-hidden">
                                            <div
                                                className={cn(
                                                    "p-4 bg-gray-50/50 border-l-4 border-blue-500 transition-opacity duration-300 delay-75",
                                                    isExpanded ? "opacity-100" : "opacity-0"
                                                )}
                                            >
                                                {renderExpandedRow(row)}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                )
            })}
        </Tbody>
    )
}

