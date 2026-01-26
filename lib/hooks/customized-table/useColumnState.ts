/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { ColumnDef, ColumnState, ViewState } from 'customized-table'
import { useState, useCallback, useMemo } from 'react'

interface UseColumnStateProps {
    columns: ColumnDef<any>[]
    initialView?: Partial<ViewState>
    onViewChange?: (view: ViewState) => void
}

export function useColumnState({ columns, initialView, onViewChange }: UseColumnStateProps) {
    // Initialize column order from columns prop or initial view
    const defaultOrder = useMemo(() => columns.map(c => c.id), [columns])

    const [state, setState] = useState<ColumnState>(() => ({
        visibility: initialView?.columnVisibility ?? {},
        widths: initialView?.columnWidths ?? {},
        pinning: initialView?.columnPinning ?? { left: [], right: [] },
        order: initialView?.columnOrder ?? defaultOrder,
    }))

    // Notify parent of view changes
    const notifyChange = useCallback((newState: ColumnState) => {
        onViewChange?.({
            columnVisibility: newState.visibility,
            columnWidths: newState.widths,
            columnPinning: newState.pinning,
            columnOrder: newState.order,
        })
    }, [onViewChange])

    // Set column visibility
    const setColumnVisibility = useCallback((columnId: string, visible: boolean) => {
        setState(prev => {
            const newState = {
                ...prev,
                visibility: { ...prev.visibility, [columnId]: visible },
            }
            notifyChange(newState)
            return newState
        })
    }, [notifyChange])

    // Set column width
    const setColumnWidth = useCallback((columnId: string, width: number) => {
        setState(prev => {
            const newState = {
                ...prev,
                widths: { ...prev.widths, [columnId]: width },
            }
            notifyChange(newState)
            return newState
        })
    }, [notifyChange])

    // Toggle column pinning
    const toggleColumnPin = useCallback((columnId: string, position: 'left' | 'right' | false) => {
        setState(prev => {
            const newPinning = {
                left: prev.pinning.left.filter(id => id !== columnId),
                right: prev.pinning.right.filter(id => id !== columnId),
            }

            if (position === 'left') {
                newPinning.left.push(columnId)
            } else if (position === 'right') {
                newPinning.right.push(columnId)
            }

            const newState = { ...prev, pinning: newPinning }
            notifyChange(newState)
            return newState
        })
    }, [notifyChange])

    // Move column in order
    const moveColumn = useCallback((columnId: string, direction: 'left' | 'right' | 'start' | 'end') => {
        setState(prev => {
            const order = [...prev.order]
            const currentIndex = order.indexOf(columnId)
            if (currentIndex === -1) return prev

            let newIndex: number
            switch (direction) {
                case 'left':
                    newIndex = Math.max(0, currentIndex - 1)
                    break
                case 'right':
                    newIndex = Math.min(order.length - 1, currentIndex + 1)
                    break
                case 'start':
                    newIndex = 0
                    break
                case 'end':
                    newIndex = order.length - 1
                    break
            }

            if (newIndex === currentIndex) return prev

            // Remove from current position
            order.splice(currentIndex, 1)
            // Insert at new position
            order.splice(newIndex, 0, columnId)

            const newState = { ...prev, order }
            notifyChange(newState)
            return newState
        })
    }, [notifyChange])

    // Set absolute column order (for Undo/Redo)
    const setColumnOrder = useCallback((newOrder: string[]) => {
        setState(prev => {
            const newState = { ...prev, order: newOrder }
            notifyChange(newState)
            return newState
        })
    }, [notifyChange])

    // Get visible columns in order
    const visibleColumns = useMemo(() => {
        return state.order
            .map(id => columns.find(c => c.id === id))
            .filter((col): col is ColumnDef<any> => {
                if (!col) return false
                // Check if column is visible (default to true)
                return state.visibility[col.id] !== false
            })
    }, [columns, state.order, state.visibility])

    // Get ordered columns with pinned first
    const orderedColumns = useMemo(() => {
        const leftPinned = state.pinning.left
            .map(id => visibleColumns.find(c => c.id === id))
            .filter((c): c is ColumnDef<any> => !!c)

        const rightPinned = state.pinning.right
            .map(id => visibleColumns.find(c => c.id === id))
            .filter((c): c is ColumnDef<any> => !!c)

        const unpinned = visibleColumns.filter(
            c => !state.pinning.left.includes(c.id) && !state.pinning.right.includes(c.id)
        )

        return [...leftPinned, ...unpinned, ...rightPinned]
    }, [visibleColumns, state.pinning])

    // Get column width (use explicit size or default)
    const getColumnWidth = useCallback((columnId: string) => {
        const col = columns.find(c => c.id === columnId)
        return state.widths[columnId] ?? col?.size ?? undefined
    }, [columns, state.widths])

    // Check if column is pinned
    const getColumnPinning = useCallback((columnId: string): 'left' | 'right' | false => {
        if (state.pinning.left.includes(columnId)) return 'left'
        if (state.pinning.right.includes(columnId)) return 'right'
        return false
    }, [state.pinning])

    // Get view state for serialization
    const getViewState = useCallback((): ViewState => ({
        columnVisibility: state.visibility,
        columnWidths: state.widths,
        columnPinning: state.pinning,
        columnOrder: state.order,
    }), [state])

    // Reset to defaults
    const resetView = useCallback(() => {
        const newState: ColumnState = {
            visibility: {},
            widths: {},
            pinning: { left: [], right: [] },
            order: defaultOrder,
        }
        setState(newState)
        notifyChange(newState)
    }, [defaultOrder, notifyChange])

    return {
        columnState: state,
        visibleColumns,
        orderedColumns,
        setColumnVisibility,
        setColumnWidth,
        toggleColumnPin,
        moveColumn,
        setColumnOrder,
        getColumnWidth,
        getColumnPinning,
        getViewState,
        resetView,
    }
}
