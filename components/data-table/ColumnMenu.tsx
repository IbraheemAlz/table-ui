'use client'

import React from 'react'
import { Icon } from '@iconify/react'
import { useDataTable } from './context'
import type { ColumnDef } from '../../lib/types/customized-table'

interface ColumnMenuProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    column: any // Typed as any for now to avoid complexity with generics
    align?: 'start' | 'end'
}

export function ColumnMenu({ column, align = 'start' }: ColumnMenuProps) {
    const {
        slots,
        serverData,
        columnState,
        setColumnVisibility,
        toggleColumnPin,
        moveColumn,
        focusTable,
    } = useDataTable()

    const { ColumnMenu: Menu, MenuItem, MenuSeparator } = slots

    const currentSort = serverData.sortColumn === column.id ? serverData.sortDirection : null
    const currentPinning = columnState.pinning.left.includes(column.id)
        ? 'left'
        : columnState.pinning.right.includes(column.id)
            ? 'right'
            : null

    const canSort = column.enableSorting !== false
    const canHide = column.enableHiding !== false
    const canPin = column.enablePinning !== false

    const handleSort = (direction: 'asc' | 'desc') => {
        if (currentSort === direction) {
            // Clear sort if clicking same direction
            serverData.onSortChange(null, null)
        } else {
            serverData.onSortChange(column.id, direction)
        }
    }

    // Get header text
    const headerText = typeof column.header === 'string'
        ? column.header
        : column.id.replace(/_/g, ' ')

    return (
        <Menu
            trigger={
                <div className="flex items-center gap-1 h-10 w-full px-3 hover:bg-gray-100/50 transition-colors cursor-pointer select-none">
                    <span className="text-xs font-medium text-gray-600 truncate flex-1">
                        {headerText}
                    </span>
                    {currentSort === 'asc' && <Icon icon="lucide:chevron-up" className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                    {currentSort === 'desc' && <Icon icon="lucide:chevron-down" className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                </div>
            }
            align={align}
        >
            {/* Sorting */}
            {canSort && (
                <>
                    <MenuItem
                        onClick={() => handleSort('asc')}
                        icon={<Icon icon="lucide:chevron-up" className="h-4 w-4" />}
                        active={currentSort === 'asc'}
                    >
                        Sort ascending
                    </MenuItem>
                    <MenuItem
                        onClick={() => handleSort('desc')}
                        icon={<Icon icon="lucide:chevron-down" className="h-4 w-4" />}
                        active={currentSort === 'desc'}
                    >
                        Sort descending
                    </MenuItem>
                    <MenuSeparator />
                </>
            )}

            {/* Pinning */}
            {canPin && (
                <>
                    <MenuItem
                        onClick={() => toggleColumnPin(column.id, currentPinning === 'left' ? false : 'left')}
                        icon={<Icon icon="lucide:pin" className="h-4 w-4 rotate-[-45deg]" />}
                        active={currentPinning === 'left'}
                    >
                        {currentPinning === 'left' ? 'Unpin from left' : 'Pin to left'}
                    </MenuItem>
                    <MenuItem
                        onClick={() => toggleColumnPin(column.id, currentPinning === 'right' ? false : 'right')}
                        icon={<Icon icon="lucide:pin" className="h-4 w-4 rotate-45" />}
                        active={currentPinning === 'right'}
                    >
                        {currentPinning === 'right' ? 'Unpin from right' : 'Pin to right'}
                    </MenuItem>
                    <MenuSeparator />
                </>
            )}

            {/* Reordering */}
            <MenuItem
                onClick={() => moveColumn(column.id, 'left')}
                icon={<Icon icon="lucide:move-left" className="h-4 w-4" />}
            >
                Move left
            </MenuItem>
            <MenuItem
                onClick={() => moveColumn(column.id, 'right')}
                icon={<Icon icon="lucide:move-right" className="h-4 w-4" />}
            >
                Move right
            </MenuItem>
            <MenuItem
                onClick={() => moveColumn(column.id, 'start')}
                icon={<Icon icon="lucide:arrow-left-to-line" className="h-4 w-4" />}
            >
                Move to start
            </MenuItem>
            <MenuItem
                onClick={() => moveColumn(column.id, 'end')}
                icon={<Icon icon="lucide:arrow-right-to-line" className="h-4 w-4" />}
            >
                Move to end
            </MenuItem>
            <MenuSeparator />

            {/* Hide */}
            {canHide && (
                <MenuItem
                    onClick={() => {
                        setColumnVisibility(column.id, false)
                        focusTable() // Restore focus to table since this column will disappear
                    }}
                    icon={<Icon icon="lucide:eye-off" className="h-4 w-4" />}
                >
                    Hide column
                </MenuItem>
            )}
        </Menu>
    )
}
