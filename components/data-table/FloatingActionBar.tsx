'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import { cn } from './utils/cn'

interface FloatingActionBarProps {
    /** Number of selected items */
    selectedCount: number
    /** Callback to clear selection */
    onClearSelection: () => void
    /** Custom actions to display */
    children?: React.ReactNode
    /** Custom class name */
    className?: string
}

export function FloatingActionBar({
    selectedCount,
    onClearSelection,
    children,
    className
}: FloatingActionBarProps) {
    if (selectedCount === 0) return null

    // Use portal to ensure it floats above everything (optional, but good for z-index)
    // For now, simpler to just render in place but with fixed positioning
    // If we use portal, we need to ensure document is available (useEffect)
    // Let's stick to fixed positioning for simplicity and portability first.

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <div
                className={cn(
                    "flex items-center gap-2 px-2 py-2 bg-white rounded-full shadow-xl border border-gray-200",
                    "animate-in slide-in-from-bottom-4 fade-in duration-200",
                    className
                )}
            >
                {/* Count Badge */}
                <div className="flex items-center gap-2 pl-2 pr-1">
                    <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        {selectedCount} selected
                    </span>

                    {/* Clear Button */}
                    <button
                        onClick={onClearSelection}
                        className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                        title="Clear selection"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-gray-200 mx-1" />

                {/* Actions */}
                <div className="flex items-center gap-1 pr-1">
                    {children}
                </div>
            </div>
        </div>
    )
}
