'use client'

import React, { useState, useMemo } from 'react'
import { DataTable } from '@/components/data-table'
import { ColumnDef, RowHeight, ServerDataConfig } from 'customized-table'

interface Employee {
    id: string
    fullName: string
    jobTitle: string
    department: string
    salary: number
    location: string
    startDate: string
}

const generateData = (count: number): Employee[] =>
    Array.from({ length: count }, (_, i) => ({
        id: `emp-${i}`,
        fullName: ['Ahmed Ali', 'Sara Smith', 'John Doe', 'Fatima Hassan', 'Chen Wei'][i % 5] + ` (${i + 1})`,
        jobTitle: ['Software Engineer', 'Product Manager', 'Designer', 'HR Specialist', 'Analyst'][i % 5],
        department: ['Engineering', 'Product', 'Design', 'HR', 'Finance'][i % 5],
        salary: 60000 + (i * 1500),
        location: ['Dubai', 'New York', 'London', 'Singapore', 'Riyadh'][i % 5],
        startDate: '2023-01-15'
    }))

const columns: ColumnDef<Employee>[] = [
    // Pin 'fullName' to the left (start)
    {
        id: 'fullName',
        header: 'Full Name',
        accessorKey: 'fullName',
        size: 180,
        enablePinning: true
    },
    { id: 'jobTitle', header: 'Job Title', accessorKey: 'jobTitle', size: 160 },
    { id: 'department', header: 'Department', accessorKey: 'department', size: 140 },
    { id: 'location', header: 'Location', accessorKey: 'location', size: 130 },
    {
        id: 'salary',
        header: 'Salary',
        accessorKey: 'salary',
        size: 120,
        cell: ({ value }) => `$${(value as number).toLocaleString()}`
    },
    { id: 'startDate', header: 'Start Date', accessorKey: 'startDate', size: 120 },
]

export function RTLComplexTableDemo() {
    const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr')
    const [density, setDensity] = useState<RowHeight>('medium')
    const [striped, setStriped] = useState(true)
    const [showGrid, setShowGrid] = useState(false)

    const data = useMemo(() => generateData(20), [])

    const serverData: ServerDataConfig<Employee> = {
        data: data,
        totalCount: data.length,
        page: 1,
        pageSize: 20,
        onPageChange: () => { },
        onPageSizeChange: () => { },
        onSortChange: () => { },
    }

    return (
        <div className="space-y-4">
            <div className="prose max-w-none">
                <h3>2. Advanced Layout & RTL</h3>
                <p className="text-gray-600 text-sm">
                    Demonstrates Right-to-Left support, row density, striped rows, and column pinning.
                    Notice how -Full Name- pinned to the left moves to the right in RTL mode.
                </p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Direction:</span>
                    <select
                        value={direction}
                        onChange={(e) => setDirection(e.target.value as 'ltr' | 'rtl')}
                        className="border rounded px-2 py-1"
                    >
                        <option value="ltr">LTR (Left-to-Right)</option>
                        <option value="rtl">RTL (Right-to-Left)</option>
                    </select>
                </label>

                <label className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Density:</span>
                    <select
                        value={density}
                        onChange={(e) => setDensity(e.target.value as RowHeight)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="tall">Tall</option>
                        <option value="extra-tall">Extra Tall</option>
                    </select>
                </label>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={striped}
                        onChange={(e) => setStriped(e.target.checked)}
                        className="rounded text-blue-600"
                    />
                    <span className="font-medium">Striped Rows</span>
                </label>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                        className="rounded text-blue-600"
                    />
                    <span className="font-medium">Grid Lines</span>
                </label>
            </div>

            <div className="rounded-lg shadow-sm bg-white overflow-hidden" dir={direction}>
                <DataTable
                    columns={columns}
                    serverData={serverData}
                    getRowId={(row) => row.id}
                    direction={direction}
                    rowDensity={density}
                    stripedRows={striped}
                    showGridLines={showGrid}
                    initialView={{
                        columnPinning: { left: ['fullName'], right: [] }
                    }}
                />
            </div>
        </div>
    )
}
