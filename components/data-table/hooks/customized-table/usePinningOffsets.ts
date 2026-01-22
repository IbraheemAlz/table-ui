'use client'

import { useMemo } from 'react'
import type { ColumnState, PinningOffsets } from '../../../../lib/types/customized-table'

interface UsePinningOffsetsProps {
    columnState: ColumnState
    getColumnWidth: (columnId: string) => number | undefined
    defaultWidth?: number
}

export function usePinningOffsets({
    columnState,
    getColumnWidth,
    defaultWidth = 150
}: UsePinningOffsetsProps): PinningOffsets {
    const offsets = useMemo(() => {
        const leftOffsets: Record<string, number> = {}
        const rightOffsets: Record<string, number> = {}

        // Calculate left offsets (cumulative from left edge)
        let leftCumulative = 0
        for (const columnId of columnState.pinning.left) {
            leftOffsets[columnId] = leftCumulative
            const width = getColumnWidth(columnId) ?? defaultWidth
            leftCumulative += width
        }

        // Calculate right offsets (cumulative from right edge)
        let rightCumulative = 0
        // Process right-pinned columns in reverse order
        const rightPinned = [...columnState.pinning.right].reverse()
        for (const columnId of rightPinned) {
            rightOffsets[columnId] = rightCumulative
            const width = getColumnWidth(columnId) ?? defaultWidth
            rightCumulative += width
        }

        return { left: leftOffsets, right: rightOffsets }
    }, [columnState.pinning, getColumnWidth, defaultWidth])

    return offsets
}
