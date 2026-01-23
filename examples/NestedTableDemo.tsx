"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table";
import type { ColumnDef, ServerDataConfig } from "@/lib/types/customized-table";

// ============================================================================
// Type Definitions
// ============================================================================

interface Order {
    id: string;
    customer: string;
    email: string;
    total: number;
    status: "pending" | "processing" | "shipped" | "delivered";
    orderDate: string;
}

interface OrderItem {
    id: string;
    orderId: string;
    product: string;
    quantity: number;
    price: number;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockOrders: Order[] = [
    { id: "ORD-001", customer: "John Doe", email: "john@example.com", total: 250.00, status: "delivered", orderDate: "2024-01-15" },
    { id: "ORD-002", customer: "Jane Smith", email: "jane@example.com", total: 89.50, status: "shipped", orderDate: "2024-01-16" },
    { id: "ORD-003", customer: "Bob Johnson", email: "bob@example.com", total: 450.00, status: "processing", orderDate: "2024-01-17" },
    { id: "ORD-004", customer: "Alice Brown", email: "alice@example.com", total: 125.75, status: "pending", orderDate: "2024-01-18" },
    { id: "ORD-005", customer: "Charlie Wilson", email: "charlie@example.com", total: 320.00, status: "delivered", orderDate: "2024-01-19" },
];

const mockOrderItems: Record<string, OrderItem[]> = {
    "ORD-001": [
        { id: "ITEM-001", orderId: "ORD-001", product: "Wireless Headphones", quantity: 1, price: 150.00 },
        { id: "ITEM-002", orderId: "ORD-001", product: "USB-C Cable", quantity: 2, price: 25.00 },
        { id: "ITEM-003", orderId: "ORD-001", product: "Phone Case", quantity: 1, price: 50.00 },
    ],
    "ORD-002": [
        { id: "ITEM-004", orderId: "ORD-002", product: "Keyboard", quantity: 1, price: 89.50 },
    ],
    "ORD-003": [
        { id: "ITEM-005", orderId: "ORD-003", product: "Monitor 27\"", quantity: 1, price: 350.00 },
        { id: "ITEM-006", orderId: "ORD-003", product: "HDMI Cable", quantity: 2, price: 50.00 },
    ],
    "ORD-004": [
        { id: "ITEM-007", orderId: "ORD-004", product: "Mouse", quantity: 1, price: 75.75 },
        { id: "ITEM-008", orderId: "ORD-004", product: "Mouse Pad", quantity: 1, price: 25.00 },
        { id: "ITEM-009", orderId: "ORD-004", product: "Webcam", quantity: 1, price: 25.00 },
    ],
    "ORD-005": [
        { id: "ITEM-010", orderId: "ORD-005", product: "Laptop Stand", quantity: 1, price: 120.00 },
        { id: "ITEM-011", orderId: "ORD-005", product: "USB Hub", quantity: 2, price: 100.00 },
    ],
};

// ============================================================================
// Status Badge Component
// ============================================================================

function StatusBadge({ status }: { status: Order["status"] }) {
    const colors = {
        pending: "bg-yellow-100 text-yellow-800",
        processing: "bg-blue-100 text-blue-800",
        shipped: "bg-purple-100 text-purple-800",
        delivered: "bg-green-100 text-green-800",
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

// ============================================================================
// Order Items Sub-Table Component
// ============================================================================

function OrderItemsTable({ orderId }: { orderId: string }) {
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const items = mockOrderItems[orderId] || [];
    const totalCount = items.length;
    const paginatedItems = items.slice((page - 1) * pageSize, page * pageSize);

    const columns: ColumnDef<OrderItem>[] = useMemo(() => [
        { id: "product", header: "Product", accessorKey: "product", size: 200 },
        { id: "quantity", header: "Qty", accessorKey: "quantity", size: 80 },
        {
            id: "price",
            header: "Unit Price",
            accessorKey: "price",
            size: 100,
            cell: ({ value }) => `$${(value as number).toFixed(2)}`,
        },
        {
            id: "subtotal",
            header: "Subtotal",
            size: 100,
            accessorFn: (row) => row.quantity * row.price,
            cell: ({ value }) => `$${(value as number).toFixed(2)}`,
        },
    ], []);

    const serverData: ServerDataConfig<OrderItem> = useMemo(() => ({
        data: paginatedItems,
        totalCount,
        page,
        pageSize,
        onPageChange: setPage,
        onPageSizeChange: () => { },
        onSortChange: () => { },
    }), [paginatedItems, totalCount, page, pageSize]);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📦</span>
                <h4 className="font-semibold text-gray-700">Order Items ({totalCount})</h4>
            </div>

            <DataTable
                columns={columns}
                serverData={serverData}
                getRowId={(row) => row.id}
                rowDensity="short"
                stickyHeader={false}
                enableToolbar={false}
                hidePaginationOnSinglePage={true}
            />
        </div>
    );
}

// ============================================================================
// Main Demo Component
// ============================================================================

export function NestedTableDemo() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Interactive Props State
    const [enableToolbar, setEnableToolbar] = useState(false); // Default false for nested demo as per previous req
    const [enablePagination, setEnablePagination] = useState(true);
    const [enableSelection, setEnableSelection] = useState(false);
    const [stripedRows, setStripedRows] = useState(true);

    // Parent table columns
    const columns: ColumnDef<Order>[] = useMemo(() => [
        { id: "id", header: "Order ID", accessorKey: "id", size: 120 },
        { id: "customer", header: "Customer", accessorKey: "customer", size: 150 },
        { id: "email", header: "Email", accessorKey: "email", size: 200 },
        {
            id: "total",
            header: "Total",
            accessorKey: "total",
            size: 100,
            cell: ({ value }) => `$${(value as number).toFixed(2)}`,
        },
        {
            id: "status",
            header: "Status",
            accessorKey: "status",
            size: 120,
            cell: ({ value }) => <StatusBadge status={value as Order["status"]} />,
        },
        { id: "orderDate", header: "Date", accessorKey: "orderDate", size: 120 },
    ], []);

    // Simulated server data
    const serverData: ServerDataConfig<Order> = useMemo(() => ({
        data: mockOrders.slice((page - 1) * pageSize, page * pageSize),
        totalCount: mockOrders.length,
        page,
        pageSize,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
        onSortChange: () => { },
        onSearchChange: () => { },
    }), [page, pageSize]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">4. Nested Tables (Expandable Rows)</h2>
                    <p className="text-gray-500">
                        Click the chevron icon to expand a row. Interactive controls below allow you to toggle features dynamically.
                    </p>
                </div>

                {/* Control Panel */}
                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Control Panel</h3>
                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enableToolbar}
                                onChange={(e) => setEnableToolbar(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Enable Toolbar</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enablePagination}
                                onChange={(e) => setEnablePagination(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Enable Pagination</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enableSelection}
                                onChange={(e) => setEnableSelection(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Enable Selection</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={stripedRows}
                                onChange={(e) => setStripedRows(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Striped Rows</span>
                        </label>
                    </div>
                </div>
            </div>

            <DataTable
                columns={columns}
                serverData={serverData}
                getRowId={(row) => row.id}
                enableRowExpansion
                renderExpandedRow={(order) => <OrderItemsTable orderId={order.id} />}

                // Controlled Props
                enableToolbar={enableToolbar}
                enablePagination={enablePagination}
                enableRowSelection={enableSelection}
                stripedRows={stripedRows}

                // Other
                hidePaginationOnSinglePage={false} // Always show parent pagination if enabled
            />
        </div>
    );
}
