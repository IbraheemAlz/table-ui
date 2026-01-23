"use client";

import { cn } from "../../lib/utils/cn";

// ============================================================================
// ExpandButton Component
// ============================================================================

interface ExpandButtonProps {
    /** Whether the row is currently expanded */
    expanded: boolean;
    /** Click handler to toggle expansion */
    onClick: (e: React.MouseEvent) => void;
    /** Additional class name */
    className?: string;
    /** Disable the button */
    disabled?: boolean;
}

export function ExpandButton({
    expanded,
    onClick,
    className,
    disabled = false,
}: ExpandButtonProps) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation(); // Prevent row click
                onClick(e);
            }}
            disabled={disabled}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse row" : "Expand row"}
            className={cn(
                "inline-flex items-center justify-center",
                "h-6 w-6 rounded-md",
                "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
                "transition-all duration-200 ease-out",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            <svg
                className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    expanded && "rotate-90"
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                />
            </svg>
        </button>
    );
}
