'use client'

import { useState, useCallback, useMemo } from 'react'

interface UseRowSelectionProps {
    mode: 'single' | 'multiple'
    controlledSelectedIds?: string[]
    onSelectionChange?: (ids: string[]) => void
}

export function useRowSelection({
    mode,
    controlledSelectedIds,
    onSelectionChange
}: UseRowSelectionProps) {
    // Internal state for uncontrolled mode
    const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set())

    // Use controlled or uncontrolled state
    const selectedIds = useMemo(() => {
        if (controlledSelectedIds !== undefined) {
            return new Set(controlledSelectedIds)
        }
        return internalSelectedIds
    }, [controlledSelectedIds, internalSelectedIds])

    // Update selection
    const updateSelection = useCallback((newIds: Set<string>) => {
        if (controlledSelectedIds === undefined) {
            setInternalSelectedIds(newIds)
        }
        onSelectionChange?.(Array.from(newIds))
    }, [controlledSelectedIds, onSelectionChange])

    // Toggle single row
    const toggleRowSelection = useCallback((rowId: string) => {
        const newSet = new Set(selectedIds)

        if (mode === 'single') {
            // Single mode: only one row can be selected
            if (newSet.has(rowId)) {
                newSet.delete(rowId)
            } else {
                newSet.clear()
                newSet.add(rowId)
            }
        } else {
            // Multiple mode: toggle the row
            if (newSet.has(rowId)) {
                newSet.delete(rowId)
            } else {
                newSet.add(rowId)
            }
        }

        updateSelection(newSet)
    }, [mode, selectedIds, updateSelection])

    // Select/deselect all rows
    const toggleAllRows = useCallback((selected: boolean, allRowIds?: string[]) => {
        if (mode === 'single') return // Not applicable for single mode

        if (selected && allRowIds) {
            updateSelection(new Set(allRowIds))
        } else {
            updateSelection(new Set())
        }
    }, [mode, updateSelection])

    // Check if row is selected
    const isRowSelected = useCallback((rowId: string) => {
        return selectedIds.has(rowId)
    }, [selectedIds])

    // Check if all rows are selected
    const isAllSelected = useCallback((allRowIds: string[]) => {
        if (allRowIds.length === 0) return false
        return allRowIds.every(id => selectedIds.has(id))
    }, [selectedIds])

    // Check if some (but not all) rows are selected
    const isSomeSelected = useCallback((allRowIds: string[]) => {
        if (allRowIds.length === 0) return false
        const selectedCount = allRowIds.filter(id => selectedIds.has(id)).length
        return selectedCount > 0 && selectedCount < allRowIds.length
    }, [selectedIds])

    // Clear selection
    const clearSelection = useCallback(() => {
        updateSelection(new Set())
    }, [updateSelection])

    return {
        selectedRowIds: selectedIds,
        setSelectedRowIds: updateSelection,
        toggleRowSelection,
        toggleAllRows,
        isRowSelected,
        isAllSelected,
        isSomeSelected,
        clearSelection,
        selectedCount: selectedIds.size,
    }
}
