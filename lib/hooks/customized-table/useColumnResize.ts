'use client'

import { useRef, useCallback } from 'react'

interface UseColumnResizeProps {
    columnId: string
    minWidth?: number
    maxWidth?: number
    onResizeEnd: (width: number) => void
    direction?: 'ltr' | 'rtl'
    tableId: string // Scoped table ID
}

export function useColumnResize({
    columnId,
    minWidth = 50,
    maxWidth = 500,
    onResizeEnd,
    direction = 'ltr',
    tableId,
}: UseColumnResizeProps) {
    const isResizing = useRef(false)
    const startX = useRef(0)
    const startWidth = useRef(0)

    const handleMouseDown = useCallback((e: React.MouseEvent, currentWidth: number) => {
        e.preventDefault()
        e.stopPropagation()

        isResizing.current = true
        startX.current = e.clientX
        startWidth.current = currentWidth

        // Track the last calculated width for accuracy on mouse up
        let lastCalculatedWidth = currentWidth

        const guide = document.getElementById(`table-resize-guide-${tableId}`)
        // Find the resizing handle's parent cell info to position guide correctly
        const headerCell = (e.target as HTMLElement).closest('th')
        const headerRect = headerCell?.getBoundingClientRect()
        // We look for the overflow-auto container which is the relative parent of the guide
        const tableContainer = headerCell?.closest('.overflow-auto')
        const containerRect = tableContainer?.getBoundingClientRect()

        if (guide && headerRect && containerRect && tableContainer) {
            guide.style.opacity = '1'
            // Initial position relative to container
            // We want the guide at the right edge of the column being resized
            // But actually we are dragging the handle, so let's follow the mouse cursor relative to container
            let initialLeft = e.clientX - containerRect.left + tableContainer.scrollLeft
            initialLeft = Math.max(0, Math.min(initialLeft, tableContainer.scrollWidth - 2))
            guide.style.left = `${initialLeft}px`
            guide.style.height = `${tableContainer.scrollHeight}px`
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing.current) return

            const rawDelta = e.clientX - startX.current
            const delta = direction === 'rtl' ? -rawDelta : rawDelta

            const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth.current + delta))
            lastCalculatedWidth = newWidth

            // Direct DOM manipulation for fast feedback on the column itself
            // Update both width and minWidth to ensure the style takes effect
            document.querySelectorAll(`[data-column-id="${columnId}"]`).forEach(el => {
                (el as HTMLElement).style.width = `${newWidth}px`
                    ; (el as HTMLElement).style.minWidth = `${newWidth}px`
            })

            // Update guide position
            if (guide && containerRect && tableContainer) {
                let currentLeft = e.clientX - containerRect.left + tableContainer.scrollLeft
                // Clamp to container bounds to prevent auto-scrolling
                currentLeft = Math.max(0, Math.min(currentLeft, tableContainer.scrollWidth - 2))
                guide.style.left = `${currentLeft}px`
            }
        }

        const handleMouseUp = () => {
            if (!isResizing.current) return

            isResizing.current = false

            if (guide) {
                guide.style.opacity = '0'
            }

            // Use the last calculated width for accuracy instead of recalculating
            onResizeEnd(lastCalculatedWidth)

            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }, [columnId, minWidth, maxWidth, onResizeEnd, direction])

    // Double-click to auto-fit (reset to min width or original)
    const handleDoubleClick = useCallback((e: React.MouseEvent, originalWidth?: number) => {
        e.preventDefault()
        e.stopPropagation()
        onResizeEnd(originalWidth ?? minWidth)
    }, [minWidth, onResizeEnd])

    return {
        handleMouseDown,
        handleDoubleClick,
    }
}
