'use client'

import { useRef, useCallback } from 'react'

interface UseColumnResizeProps {
    columnId: string
    minWidth?: number
    maxWidth?: number
    onResizeEnd: (width: number) => void
    direction?: 'ltr' | 'rtl'
}

export function useColumnResize({
    columnId,
    minWidth = 50,
    maxWidth = 500,
    onResizeEnd,
    direction = 'ltr',
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

        const guide = document.getElementById('table-resize-guide')
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

            // Direct DOM manipulation for fast feedback on the column itself
            document.querySelectorAll(`[data-column-id="${columnId}"]`).forEach(el => {
                (el as HTMLElement).style.width = `${newWidth}px`
            })

            // Update guide position
            if (guide && containerRect && tableContainer) {
                let currentLeft = e.clientX - containerRect.left + tableContainer.scrollLeft
                // Clamp to container bounds to prevent auto-scrolling
                currentLeft = Math.max(0, Math.min(currentLeft, tableContainer.scrollWidth - 2))
                guide.style.left = `${currentLeft}px`
            }
        }

        const handleMouseUp = (e: MouseEvent) => {
            if (!isResizing.current) return

            isResizing.current = false

            const rawDelta = e.clientX - startX.current
            const delta = direction === 'rtl' ? -rawDelta : rawDelta

            const finalWidth = Math.min(maxWidth, Math.max(minWidth, startWidth.current + delta))

            if (guide) {
                guide.style.opacity = '0'
            }

            // Update React state only on mouse up
            onResizeEnd(finalWidth)

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
