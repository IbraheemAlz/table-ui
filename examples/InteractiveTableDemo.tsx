'use client'

import { useState } from 'react'
import { DataTable, FloatingActionBar } from '@/components/data-table'
import { ColumnDef, ServerDataConfig } from 'customized-table'

interface Product {
    id: string
    name: string
    sku: string
    price: number
    stock: number
    category: string
}

const generateProducts = (count: number): Product[] =>
    Array.from({ length: count }, (_, i) => ({
        id: `prod-${i}`,
        name: ['Wireless Mouse', 'Gaming Keyboard', 'HD Monitor', 'USB-C Cable', 'Laptop Stand'][i % 5] + ` ${i + 1}`,
        sku: `SKU-${1000 + i}`,
        price: 25 + (i * 5),
        stock: i * 12,
        category: ['Electronics', 'Accessories', 'Office', 'Peripherals'][i % 4],
    }))

export function InteractiveTableDemo() {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [products] = useState(() => generateProducts(15))

    const handleBulkDelete = () => {
        alert(`Deleting ${selectedIds.length} items: ${selectedIds.join(', ')}`)
        setSelectedIds([])
    }

    const columns: ColumnDef<Product>[] = [
        { id: 'name', header: 'Product Name', accessorKey: 'name', size: 200 },
        { id: 'sku', header: 'SKU', accessorKey: 'sku', size: 120 },
        { id: 'category', header: 'Category', accessorKey: 'category', size: 120 },
        {
            id: 'price',
            header: 'Price',
            accessorKey: 'price',
            size: 100,
            cell: ({ value }) => `$${(value as number).toFixed(2)}`
        },
        {
            id: 'stock',
            header: 'Stock',
            accessorKey: 'stock',
            size: 100,
            cell: ({ value }) => (
                <span className={(value as number) < 10 ? 'text-red-600 font-bold' : 'text-gray-900'}>
                    {value as number} units
                </span>
            )
        },
        {
            id: 'actions',
            header: 'Actions',
            size: 140,
            enableSorting: false,
            enableResizing: false,
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); alert(`Editing ${row.name}`) }}
                        className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                    >
                        Edit
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); alert(`Deleting ${row.name}`) }}
                        className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100"
                    >
                        Delete
                    </button>
                </div>
            )
        }
    ]

    const serverData: ServerDataConfig<Product> = {
        data: products,
        totalCount: products.length,
        page: 1,
        pageSize: 15, // Single page for demo
        onPageChange: () => { },
        onPageSizeChange: () => { },
        onSortChange: () => { },
    }

    return (
        <div className="space-y-4">
            <div className="prose max-w-none">
                <h3>3. Interactive Actions & Selection</h3>
                <p className="text-gray-600 text-sm">
                    Showcases multiple row selection and custom action buttons per row.
                    Try selecting rows to enable the bulk action button.
                </p>
            </div>

            {/* Floating Action Bar */}
            <FloatingActionBar
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
            >
                <button
                    onClick={() => alert(`Update Status for ${selectedIds.length} items`)}
                    className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                    Status
                </button>
                <div className="h-4 w-px bg-gray-200 mx-1" />
                <button
                    onClick={() => alert(`Update Style for ${selectedIds.length} items`)}
                    className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                    Style
                </button>
                <div className="h-4 w-px bg-gray-200 mx-1" />
                <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm"
                >
                    Delete
                </button>
            </FloatingActionBar>

            <div className="rounded-lg shadow-sm bg-white overflow-hidden">
                <DataTable
                    columns={columns}
                    serverData={serverData}
                    getRowId={(row) => row.id}
                    enableRowSelection={true}
                    selectionMode="multiple"
                    selectedRowIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                />
            </div>
        </div>
    )
}
