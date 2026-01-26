'use client'

import React, { useState, useMemo } from 'react'
import { DataTable } from '@/components/data-table'
import { ColumnDef, ServerDataConfig } from 'customized-table'

// Simplified User type
interface User {
    id: string
    name: string
    email: string
    role: string
    status: 'active' | 'inactive'
}

//🍎🍎🍎🍎 Generate smaller dataset
function generateUsers(count: number): User[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: ['Admin', 'User', 'Editor'][i % 3],
        status: i % 2 === 0 ? 'active' : 'inactive',
    }))
}

const allUsers = generateUsers(50)

//🍎🍎🍎🍎 set columns headers
const columns: ColumnDef<User>[] = [
    { id: 'name', header: 'Name', accessorKey: 'name', size: 180 },
    { id: 'email', header: 'Email', accessorKey: 'email', size: 220 },
    { id: 'role', header: 'Role', accessorKey: 'role', size: 120 },
    {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        size: 100,
        cell: ({ value }) => (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                {value as string}
            </span>
        )
    },
]

export function BasicTableDemo() {
    //🍎🍎🍎🍎 api query params
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [sortColumn, setSortColumn] = useState<string | undefined>()
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | undefined>()

    //🍎🍎🍎🍎 Client-side sorting handling (it will be replace the backend logic)
    const processedData = useMemo(() => {
        const data = [...allUsers]
        if (sortColumn && sortDirection) {
            data.sort((a, b) => {
                const aVal = a[sortColumn as keyof User]
                const bVal = b[sortColumn as keyof User]
                return sortDirection === 'asc'
                    ? String(aVal).localeCompare(String(bVal))
                    : String(bVal).localeCompare(String(aVal))
            })
        }
        return data
    }, [sortColumn, sortDirection])

    //🍎🍎🍎🍎 Client-side pagination handling (it will be replace the backend logic)
    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize
        return processedData.slice(start, start + pageSize)
    }, [processedData, page, pageSize])

    //🍎🍎🍎🍎 final passed object to the Table Shared component
    const serverData: ServerDataConfig<User> = {
        data: paginatedData,
        totalCount: processedData.length,
        page,
        pageSize,
        sortColumn,
        sortDirection,
        onPageChange: setPage,
        onPageSizeChange: (size) => { setPageSize(size); setPage(1) },
        onSortChange: (col, dir) => { setSortColumn(col || undefined); setSortDirection(dir || undefined) },
    }

    return (
        <div className="space-y-4">
            <div className="prose max-w-none">
                <h3>1. Basic Table</h3>
                <p className="text-gray-600 text-sm">
                    A standard configuration with sorting, pagination, and custom cell rendering.
                    Ideal for simple data management lists.
                </p>
            </div>
            <div className="rounded-lg shadow-sm bg-white overflow-hidden">
                <DataTable
                    columns={columns}
                    serverData={serverData}
                    getRowId={(row) => row.id}
                    pageSizeOptions={[5, 10, 20]}
                />
            </div>
        </div>
    )
}
