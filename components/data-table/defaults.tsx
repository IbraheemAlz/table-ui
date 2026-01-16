'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from './utils/cn'
import type { DataTableSlots } from './types'

// ============================================================================
// Default Slot Implementations (Native HTML)
// ============================================================================

// Context to share the close function with menu items
const MenuCloseContext = React.createContext<(() => void) | null>(null)

// Simple dropdown menu using native HTML
const DefaultColumnMenu: DataTableSlots['ColumnMenu'] = ({ trigger, children, align = 'start' }) => {
    const [open, setOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    const closeMenu = useCallback(() => {
        setOpen(false)
        // Restore focus to trigger so keyboard shortcuts (Ctrl+Z) work immediately
        triggerRef.current?.focus()
    }, [])

    return (
        <div ref={menuRef} className="relative h-full" style={{ zIndex: open ? 9999 : undefined }}>
            <div
                ref={triggerRef}
                tabIndex={0}
                onClick={() => setOpen(!open)}
                className="cursor-pointer h-full outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 rounded-sm"
            >
                {trigger}
            </div>
            {open && (
                <div
                    className={cn(
                        "absolute top-full mt-1 min-w-[160px] bg-white border border-gray-200 rounded-md shadow-lg py-1",
                        align === 'end' ? 'right-0' : 'left-0'
                    )}
                    style={{ zIndex: 9999 }}
                >
                    <MenuCloseContext.Provider value={closeMenu}>
                        {children}
                    </MenuCloseContext.Provider>
                </div>
            )}
        </div>
    )
}

const DefaultMenuItem: DataTableSlots['MenuItem'] = ({ children, onClick, icon, active, disabled }) => {
    const closeMenu = React.useContext(MenuCloseContext)

    return (
        <button
            onClick={(e) => {
                e.stopPropagation()
                if (!disabled && onClick) {
                    onClick()
                }
                closeMenu?.()
            }}
            disabled={disabled}
            className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors",
                "hover:bg-gray-100",
                active && "bg-gray-100",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
            {children}
        </button>
    )
}

const DefaultMenuSeparator: DataTableSlots['MenuSeparator'] = () => (
    <div className="h-px bg-gray-200 my-1" />
)

const DefaultPopover: DataTableSlots['Popover'] = ({ trigger, children, align = 'start' }) => {
    const [open, setOpen] = useState(false)
    const popoverRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    return (
        <div ref={popoverRef} className="relative">
            <div onClick={() => setOpen(!open)} className="cursor-pointer">
                {trigger}
            </div>
            {open && (
                <div
                    className={cn(
                        "absolute top-full mt-1 min-w-[200px] bg-white border border-gray-200 rounded-md shadow-lg z-50 p-3",
                        align === 'end' ? 'right-0' : 'left-0'
                    )}
                >
                    {children}
                </div>
            )}
        </div>
    )
}

const DefaultButton: DataTableSlots['Button'] = ({
    children,
    onClick,
    disabled,
    variant = 'default',
    size = 'md',
    className
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
            "inline-flex items-center justify-center rounded-md font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            // Variants
            variant === 'default' && "bg-gray-900 text-white hover:bg-gray-800",
            variant === 'outline' && "border border-gray-300 bg-white hover:bg-gray-50",
            variant === 'ghost' && "hover:bg-gray-100",
            // Sizes
            size === 'sm' && "h-8 px-3 text-xs",
            size === 'md' && "h-9 px-4 text-sm",
            size === 'lg' && "h-10 px-6 text-base",
            // Disabled
            disabled && "opacity-50 cursor-not-allowed",
            className
        )}
    >
        {children}
    </button>
)

const DefaultCheckbox: DataTableSlots['Checkbox'] = ({ checked, onChange, indeterminate, disabled }) => {
    const ref = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = !!indeterminate
        }
    }, [indeterminate])

    return (
        <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className={cn(
                "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        />
    )
}

const DefaultSkeleton: DataTableSlots['Skeleton'] = ({ className }) => (
    <div className={cn("bg-gray-200 animate-pulse rounded", className)} />
)

const DefaultInput: DataTableSlots['Input'] = ({ value, onChange, placeholder, className }) => (
    <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
            "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            className
        )}
    />
)

// Table layout defaults
const DefaultTable: DataTableSlots['Table'] = ({ children, className, style }) => (
    <table className={cn("w-full border-collapse table-fixed", className)} style={style}>
        {children}
    </table>
)

const DefaultThead: DataTableSlots['Thead'] = ({ children, className, style }) => (
    <thead className={cn("bg-gray-50", className)} style={style}>{children}</thead>
)

const DefaultTbody: DataTableSlots['Tbody'] = ({ children, className }) => (
    <tbody className={className}>{children}</tbody>
)

const DefaultTr: DataTableSlots['Tr'] = ({ children, onClick, className, ...props }) => (
    <tr
        onClick={onClick}
        className={cn("border-b border-gray-200", className)}
        {...props}
    >
        {children}
    </tr>
)

const DefaultTh: DataTableSlots['Th'] = ({ children, className, style }) => (
    <th className={cn("h-10 px-3 text-left text-xs font-medium text-gray-600", className)} style={style}>
        {children}
    </th>
)

const DefaultTd: DataTableSlots['Td'] = ({ children, className, style }) => (
    <td className={cn("px-3 py-2 text-sm", className)} style={style}>
        {children}
    </td>
)

const DefaultCard: DataTableSlots['Card'] = ({ children, className, onClick }) => (
    <div
        onClick={onClick}
        className={cn(
            "rounded-lg border border-gray-200 bg-white p-4 shadow-sm",
            onClick && "cursor-pointer hover:shadow-md transition-shadow",
            className
        )}
    >
        {children}
    </div>
)

// ============================================================================
// Export Default Slots
// ============================================================================

export const defaultSlots: Required<DataTableSlots> = {
    Table: DefaultTable,
    Thead: DefaultThead,
    Tbody: DefaultTbody,
    Tr: DefaultTr,
    Th: DefaultTh,
    Td: DefaultTd,
    ColumnMenu: DefaultColumnMenu,
    MenuItem: DefaultMenuItem,
    MenuSeparator: DefaultMenuSeparator,
    Popover: DefaultPopover,
    Button: DefaultButton,
    Checkbox: DefaultCheckbox,
    Skeleton: DefaultSkeleton,
    Input: DefaultInput,
    Card: DefaultCard,
}
