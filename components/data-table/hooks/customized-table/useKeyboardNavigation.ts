import { useState, useCallback, useRef, useEffect } from 'react'

interface UseKeyboardNavigationProps<T> {
    data: T[]
    selectedRowIds: string[]
    onSelectionChange: (ids: string[]) => void
    getRowId: (row: T) => string
}

export function useKeyboardNavigation<T>({
    data,
    selectedRowIds,
    onSelectionChange,
    getRowId
}: UseKeyboardNavigationProps<T>) {
    const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null)
    const [anchorRowIndex, setAnchorRowIndex] = useState<number | null>(null)
    const rowRefs = useRef<(HTMLTableRowElement | null)[]>([])

    // Initialize refs array
    useEffect(() => {
        rowRefs.current = rowRefs.current.slice(0, data.length)
    }, [data])

    // Scroll into view when focus changes
    useEffect(() => {
        if (focusedRowIndex !== null && rowRefs.current[focusedRowIndex]) {
            const row = rowRefs.current[focusedRowIndex]
            row?.focus()
            row?.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            })
        }
    }, [focusedRowIndex])

    const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
        // Only handle navigation keys
        if (!['ArrowDown', 'ArrowUp', ' ', 'Enter', 'Escape'].includes(e.key)) {
            return
        }

        switch (e.key) {
            case 'ArrowDown': {
                e.preventDefault()
                const nextIndex = Math.min(index + 1, data.length - 1)
                setFocusedRowIndex(nextIndex)

                // If Shift is held, extend selection
                if (e.shiftKey && anchorRowIndex !== null) {
                    const start = Math.min(anchorRowIndex, nextIndex)
                    const end = Math.max(anchorRowIndex, nextIndex)
                    const newSelection = new Set(selectedRowIds)

                    // Add range to selection
                    for (let i = start; i <= end; i++) {
                        newSelection.add(getRowId(data[i]))
                    }
                    onSelectionChange(Array.from(newSelection))
                }
                break
            }
            case 'ArrowUp': {
                e.preventDefault()
                const prevIndex = Math.max(index - 1, 0)
                setFocusedRowIndex(prevIndex)

                // If Shift is held, extend selection
                if (e.shiftKey && anchorRowIndex !== null) {
                    const start = Math.min(anchorRowIndex, prevIndex)
                    const end = Math.max(anchorRowIndex, prevIndex)
                    const newSelection = new Set(selectedRowIds)

                    // Add range to selection
                    for (let i = start; i <= end; i++) {
                        newSelection.add(getRowId(data[i]))
                    }
                    onSelectionChange(Array.from(newSelection))
                }
                break
            }
            case ' ': {
                e.preventDefault()
                const rowId = getRowId(data[index])
                const isSelected = selectedRowIds.includes(rowId)

                let newSelection: string[]
                if (isSelected) {
                    newSelection = selectedRowIds.filter(id => id !== rowId)
                } else {
                    newSelection = [...selectedRowIds, rowId]
                }

                onSelectionChange(newSelection)
                setAnchorRowIndex(index) // Update anchor on explicit selection
                break
            }
            case 'Escape': {
                e.preventDefault()
                onSelectionChange([]) // Clear all
                break
            }
        }
    }, [data, selectedRowIds, anchorRowIndex, onSelectionChange, getRowId])

    // Reset anchor when focus is set via mouse (optional, or handle in onClick)
    const handleRowClick = useCallback((index: number) => {
        setFocusedRowIndex(index)
        setAnchorRowIndex(index)
    }, [])

    return {
        focusedRowIndex,
        setFocusedRowIndex,
        handleKeyDown,
        handleRowClick,
        rowRefs
    }
}
