'use client'

import { Icon } from '@iconify/react'
import { useDataTable } from '../../lib/context/context'

export function DataTableToolbar() {
    const {
        columns,
        columnState,
        slots,
        serverData,
        setColumnVisibility,
        selectedRowIds
    } = useDataTable()

    const { Button, Popover } = slots

    // Count hidden columns
    const hiddenColumnsCount = Object.values(columnState.visibility).filter(v => v === false).length

    return (
        <div className="flex items-center justify-between gap-4 px-4 pt-2 relative" style={{ zIndex: 200 }}>
            {/* Left side: rows count & Selection info */}
            <div className="text-sm text-gray-500">
                {selectedRowIds.size > 0 ? (
                    <span>{selectedRowIds.size} row(s) selected</span>
                ) : (
                    <span>{serverData?.totalCount} total row(s)</span>
                )}
            </div>

            {/* Right side: Column visibility */}
            <div className="flex items-center gap-2">
                <Popover
                    trigger={
                        <Button variant="outline" size="sm" className="h-9 gap-1.5">
                            <Icon icon="lucide:columns-2" className="h-4 w-4" />
                            View
                            {hiddenColumnsCount > 0 && (
                                <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                                    {hiddenColumnsCount} hidden
                                </span>
                            )}
                        </Button>
                    }
                    align="end"
                >
                    <div className="w-[200px]">
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
                            <span className="text-sm font-medium">Toggle columns</span>
                            <button
                                onClick={() => {
                                    // Show all columns
                                    columns.forEach(col => {
                                        if (columnState.visibility[col.id] === false) {
                                            setColumnVisibility(col.id, true)
                                        }
                                    })
                                }}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Show all
                            </button>
                        </div>
                        <div className="space-y-1 max-h-[300px] overflow-auto">
                            {columns.map((column) => {
                                if (column.enableHiding === false) return null

                                const isVisible = columnState.visibility[column.id] !== false
                                const headerText = typeof column.header === 'string'
                                    ? column.header
                                    : column.id.replace(/_/g, ' ')

                                return (
                                    <label
                                        key={column.id}
                                        className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isVisible}
                                            onChange={(e) => setColumnVisibility(column.id, e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm capitalize">{headerText}</span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>
                </Popover>
            </div>
        </div>
    )
}
