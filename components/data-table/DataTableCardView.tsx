'use client'

import React from 'react'
import { useDataTable } from './context'
import { cn } from './utils/cn'

export function DataTableCardView() {
    const {
        columns,
        columnState,
        slots,
        serverData,
        selectedRowIds,
        toggleRowSelection,
        getRowId,
    } = useDataTable()

    const { Card, Skeleton } = slots

    // Get visible columns
    const visibleColumns = columnState.order
        .filter(id => columnState.visibility[id] !== false)
        .map(id => columns.find(c => c.id === id))
        .filter((c): c is typeof columns[0] => !!c)

    // Loading state
    if (serverData.isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="p-4">
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div key={j} className="flex justify-between items-center">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        )
    }

    // Empty state
    if (serverData.data.length === 0) {
        return (
            <Card className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <p className="font-medium text-gray-900">No data available</p>
                    <p className="text-sm text-gray-500 mt-1">There are no records to display.</p>
                </div>
            </Card>
        )
    }

    return (
        <div className={cn("space-y-4", serverData.isRefetching && "opacity-60")}>
            {serverData.data.map((row, rowIndex) => {
                const rowId = getRowId(row)
                const isSelected = selectedRowIds.has(rowId)

                return (
                    <Card
                        key={rowId}
                        onClick={() => toggleRowSelection(rowId)}
                        className={cn(
                            "transition-all",
                            isSelected && "ring-2 ring-blue-500 bg-blue-50"
                        )}
                    >
                        <div className="space-y-3">
                            {visibleColumns.map((column) => {
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

                                const headerText = typeof column.header === 'string'
                                    ? column.header
                                    : column.id.replace(/_/g, ' ')

                                return (
                                    <div key={column.id} className="flex justify-between items-start gap-4">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider shrink-0">
                                            {headerText}
                                        </span>
                                        <span className="text-sm text-gray-900 text-right">
                                            {content}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}
