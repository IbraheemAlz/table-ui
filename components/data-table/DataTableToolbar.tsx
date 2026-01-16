'use client'

import React, { useState } from 'react'
import { useDataTable } from './context'
import { cn } from './utils/cn'
import { Icons } from './icons'

export function DataTableToolbar() {
    const {
        columns,
        columnState,
        slots,
        serverData,
        setColumnVisibility,
    } = useDataTable()

    const { Button, Popover, Input, Checkbox } = slots

    const [searchValue, setSearchValue] = useState(serverData.searchQuery ?? '')

    // Handle search with debounce would be ideal, but keeping it simple for now
    const handleSearchChange = (value: string) => {
        setSearchValue(value)
        serverData.onSearchChange?.(value)
    }

    // Count hidden columns
    const hiddenColumnsCount = Object.values(columnState.visibility).filter(v => v === false).length

    return (
        <div className="flex items-center justify-between gap-4 py-2 relative" style={{ zIndex: 200 }}>
            {/* Left side: Search */}
            <div className="flex flex-1 items-center gap-2">
                <div className="relative w-[250px]">
                    <Icons.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Right side: Column visibility */}
            <div className="flex items-center gap-2">
                <Popover
                    trigger={
                        <Button variant="outline" size="sm" className="h-9 gap-1.5">
                            <Icons.Columns className="h-4 w-4" />
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
