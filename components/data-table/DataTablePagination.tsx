'use client'

import { Icon } from '@iconify/react'
import { useDataTable } from '../../lib/context/context'

interface DataTablePaginationProps {
    pageSizeOptions?: number[]
}

export function DataTablePagination({ pageSizeOptions = [10, 20, 50, 100] }: DataTablePaginationProps) {
    const { serverData, slots } = useDataTable()
    const { Button } = slots

    const { page, pageSize, totalCount, onPageChange, onPageSizeChange } = serverData

    const totalPages = Math.ceil(totalCount / pageSize)
    const canGoPrevious = page > 1
    const canGoNext = page < totalPages

    return (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-200">

            <div />

            <div className="flex items-center gap-6">
                {/* Page size selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Rows per page</span>
                    <select
                        className="h-8 rounded-md border border-gray-200 bg-white px-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Page info */}
                <div className="text-sm text-gray-500">
                    Page {page} of {totalPages || 1}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(1)}
                        disabled={!canGoPrevious}
                        className="h-8 w-8 p-0"
                    >
                        <Icon icon="lucide:chevrons-left" className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page - 1)}
                        disabled={!canGoPrevious}
                        className="h-8 w-8 p-0"
                    >
                        <Icon icon="lucide:chevron-left" className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(page + 1)}
                        disabled={!canGoNext}
                        className="h-8 w-8 p-0"
                    >
                        <Icon icon="lucide:chevron-right" className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(totalPages)}
                        disabled={!canGoNext}
                        className="h-8 w-8 p-0"
                    >
                        <Icon icon="lucide:chevrons-right" className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
