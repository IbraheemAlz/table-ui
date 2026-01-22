# DataTable Props:

```ts
export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  serverData: ServerDataConfig<T>;
  getRowId: (row: T) => string;
  slots?: Partial<DataTableSlots>;
  initialView?: Partial<ViewState>;
  onViewChange?: (view: ViewState) => void;
  enableRowSelection?: boolean;
  selectionMode?: "single" | "multiple";
  selectedRowIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  className?: string;
  mobileBreakpoint?: number;
  pageSizeOptions?: number[];
  stickyHeader?: boolean;
  rowDensity?: RowHeight;
  stripedRows?: boolean;
  showGridLines?: boolean;
  direction?: "ltr" | "rtl";
  onRowClick?: (row: T) => void;
  cardRenderer?: (row: T) => React.ReactNode;
}
```

## 💡 1. columns:

Array of columns headers

### type:

```ts
export interface ColumnDef<T> {
  id: string;
  header: string | (() => React.ReactNode);
  accessorKey?: keyof T;
  accessorFn?: (row: T) => unknown;
  cell?: (info: {
    value: unknown;
    row: T;
    rowIndex: number;
  }) => React.ReactNode;
  size?: number;
  minSize?: number;
  maxSize?: number;
  enableResizing?: boolean;
  enableHiding?: boolean;
  enablePinning?: boolean;
  enableSorting?: boolean;
}
```

- 🟡`header`:

  Column title (static label or custom JSX)

- 🟡`accessorKey` & `accessorFn`:

  Both are ways to extract the cell value from a row. You use one or the other, not both

  `accessorKey`:

  ```ts
  interface User {
    id: string;
    name: string;
    email: string;
  }

  const columns: ColumnDef<User>[] = [
    { id: "name", header: "Name", accessorKey: "name" },
    //                                          ↑
    //                            row.name → "John Doe"
  ];
  ```

  `accessorFn:` A function for more complex value extraction (computed values, nested objects, formatting).

  ```ts
  interface User {
    id: string;
    firstName: string;
    lastName: string;
    address: { city: string; country: string };
  }

  const columns: ColumnDef<User>[] = [
    // Computed value (combine fields)
    {
      id: "fullName",
      header: "Full Name",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    },

    // Nested object access
    {
      id: "location",
      header: "Location",
      accessorFn: (row) => row.address.city,
    },
  ];
  ```

- 🟡`cell`:

  custom Row content(cell)

  ```ts
  {
      id: 'status',

      // Header: static, no data needed
      header: 'Status',  // or: () => <span>Status <InfoIcon /></span>

      // Cell: dynamic, receives each row's data
      cell: ({ value, row }) => (
          <Badge color={value === 'active' ? 'green' : 'gray'}>
          {value}
          </Badge>
      )
  }
  ```

## 💡 2. serverData:

final passed object to the Table Shared component

```ts
export interface ServerData {
  data: T[];
  totalCount: number;
  isLoading?: boolean;
  isRefetching?: boolean;
  page: number;
  pageSize: number;
  sortColumn?: string;
  sortDirection?: "asc" | "de
  searchQuery?: string;
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number
  onSortChange: (
    column: string | null,
    direction: "asc" | "desc" | null,
  ) => void;
  onSearchChange?: (query: string) => void;
}
```

## 💡 3. getRowId:

is a function that tells the DataTable how to extract a unique identifier from each row. If your data uses a different ID field (like uuid or \_id), you'd adjust accordingly:

```ts
getRowId={(row) => row.uuid}
// or
getRowId={(row) => row._id}
```

## 💡 4. pageSizeOptions:

Page size options (default: [10, 20, 50, 100])

## 💡 5. slots (customSlots):

customizing the UI components used inside the DataTable. It lets you swap out the default HTML elements/components with your own (e.g., from shadcn/ui, Radix, Material UI, etc.). If you don't provide a slot, the default implementation from defaults.tsx is used.

```ts
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'

<DataTable
  columns={columns}
  serverData={serverData}
  getRowId={(row) => row.id}
  slots={{
    // Replace default checkbox with shadcn/ui checkbox
    Checkbox: ({ checked, onChange, indeterminate }) => (
      <Checkbox
        checked={indeterminate ? 'indeterminate' : checked}
        onCheckedChange={onChange}
      />
    ),
    // Replace default menu with Radix dropdown
    ColumnMenu: ({ trigger, children }) => (
      <DropdownMenu trigger={trigger}>
        {children}
      </DropdownMenu>
    ),
  }}
/>
```

## 💡 6. initialView:

sets the starting state of the table's layout when it first renders.

```ts
<DataTable
  columns={columns}
  serverData={serverData}
  getRowId={(row) => row.id}
  initialView={{
    // Hide the email column by default
    columnVisibility: { email: false },

    // Set custom widths
    columnWidths: { name: 250, status: 100 },

    // Pin 'name' to the left
    columnPinning: { left: ['name'], right: [] },

    // Custom column order
    columnOrder: ['name', 'status', 'role', 'email'],
  }}
/>
```

## 💡 7. onViewChange:

is a callback that fires whenever the user modifies the table's layout. It receives the complete ViewState object so you can persist it.

```ts
// example1:
<DataTable
  columns={columns}
  serverData={serverData}
  getRowId={(row) => row.id}
  onViewChange={(view) => {
    console.log('View changed:', view)
    // view = {
    //   columnVisibility: { email: false, name: true, ... },
    //   columnWidths: { name: 250, email: 200, ... },
    //   columnPinning: { left: ['name'], right: [] },
    //   columnOrder: ['name', 'status', 'role', 'email']
    // }
  }}
/>
```

```ts
// example2:
<DataTable
  columns={columns}
  serverData={serverData}
  getRowId={(row) => row.id}
  onViewChange={(view) => {
    localStorage.setItem('usersTableView', JSON.stringify(view))
  }}
/>
```

## 💡 8. enableRowSelection:

default is false

## 💡 9. selectionMode:

default is single

## 💡 10. selectedRowIds:

Currently selected row IDs (controlled)

## 💡 11. onSelectionChange:

Callback when selection changes

## 💡 12. className:

Additional class name for container

## 💡 13. mobileBreakpoint:

Breakpoint for mobile card view (default: 640)

## 💡 14. stickyHeader:

Stick header when scrolling (default: true)

## 💡 15. rowDensity:

Row density/height (default: 'medium')

## 💡 16. stripedRows:

Show striped rows (default: false)

## 💡 17. showGridLines:

Show vertical grid lines (for columns) (default: false)

## 💡 18. direction:

Layout direction (default: 'ltr')

## 💡 19. onRowClick:

Callback when row is clicked

## 💡 20. cardRenderer:

Custom card renderer for mobile view

# DataTable Custom hook & helpers:
