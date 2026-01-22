'use client'

import React from 'react'
import { cn } from '../../lib/utils/cn'
import { Z_INDEX } from '../../lib/types/customized-table'

interface ResizeHandleProps {
    onMouseDown: (e: React.MouseEvent) => void
    onDoubleClick: (e: React.MouseEvent) => void
    isResizing?: boolean
    className?: string
}

export function ResizeHandle({ onMouseDown, onDoubleClick, isResizing, className }: ResizeHandleProps) {
    return (
        <div
            onMouseDown={onMouseDown}
            onDoubleClick={onDoubleClick}
            className={cn(
                "absolute right-0 top-0 h-full w-4 cursor-col-resize select-none touch-none",
                className,
                "flex items-center justify-center",
                "flex items-center justify-center",
                "opacity-0 group-hover:opacity-100 hover:bg-blue-100/50 transition-all",
                isResizing && "opacity-100 bg-blue-100"
            )}
            style={{ zIndex: Z_INDEX.resizeHandle }}
        >
            <div
                className={cn(
                    "h-4 w-0.5 rounded-full transition-colors",
                    isResizing ? "bg-blue-600" : "bg-gray-300 group-hover:bg-gray-400"
                )}
            />
        </div>
    )
}
