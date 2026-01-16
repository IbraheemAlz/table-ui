# Headless React Data Table

> **Note:** This project is currently in **Beta**. It is a fresh implementation and has not yet been battle-tested in production environments.

A **hyper-lightweight**, professional-grade Data Table component for React.

Designed to be copied directly into your project, it gives you complete control over your codebase without locking you into a heavy external library. It is built with **Tailwind CSS** and **TypeScript**, supporting **Next.js**, **Vite**, **Remix**, and any other React framework.

## ⚡️ Key Features

*   **Zero "Heavy" Dependencies**: No HeroUI, No Material UI, No Framer Motion. Just standard React.
*   **Fully Type-Safe**: Extensive TypeScript support for columns, rows, and customizations.
*   **Ready-to-Use Examples**: Check the `examples/` folder for copy-pasteable templates (`Basic`, `Advanced`, `Interactive`).
*   **Advanced Layouts**:
    *   Right-to-Left (RTL) Support 🇸🇦
    *   Column Pinning (Left & Right)
    *   Column Resizing
    *   Sticky Headers
*   **Rich Interactions**:
    *   Row Selection (Single/Multi) with **Floating Action Bar**
    *   Server-Side Pagination & Sorting support
    *   Column Visibility Toggles
*   **Visual Customization**:
    *   Toggleable Grid Lines
    *   Striped Rows
    *   Adjustable Row Density (`short`, `medium`, `tall`)
*   **Slot Architecture**: Replace any internal component (buttons, checkboxes, inputs) with your own design system (e.g., Shadcn UI).

## 📦 Installation

This component follows the "Copy & Paste" philosophy (like shadcn/ui).

### 1. Install Utilities
We rely on two tiny, industry-standard utilities for class merging.

```bash
npm install clsx tailwind-merge
```

### 2. Copy Source
Copy the `components/data-table` directory into your project:

```
src/
  components/
    data-table/  <-- Copy this folder
```

---

## 🛠 Framework Integration

### Next.js (App Router)
1.  Ensure **Tailwind CSS** is configured.
2.  Copy the folder to `components/data-table`.
3.  Import and use:
    ```tsx
    import { DataTable } from '@/components/data-table'
    ```

### Vite / React
1.  Ensure **Tailwind CSS** is configured.
2.  Copy the folder to `src/components/data-table`.
3.  Import and use:
    ```tsx
    import { DataTable } from './components/data-table'
    ```

### Remix / Astro / Others
As long as you have **React** and **Tailwind CSS** set up, this component will work out of the box.

---

## 🚀 Quick Start

```tsx
import { DataTable, type ColumnDef } from '@/components/data-table'

// 1. Define Columns
type User = { id: string; name: string; role: string }

const columns: ColumnDef<User>[] = [
  { id: 'name', header: 'Name', accessorKey: 'name' },
  { id: 'role', header: 'Role', accessorKey: 'role' },
]

// 2. Use Component
export default function UserTable() {
    const data = [{ id: '1', name: 'John Doe', role: 'Admin' }]

    return (
        <DataTable
            columns={columns}
            serverData={{
                data: data,
                totalCount: 1,
                page: 1,
                pageSize: 10,
                onPageChange: () => {},
                onPageSizeChange: () => {},
                onSortChange: () => {}
            }}
            getRowId={(row) => row.id}
            rowDensity="medium"
            showGridLines={true}
            stripedRows={true}
        />
    )
}
```

## 🧩 Slots (BYO Custom Components)

Want to use your own **UI Library** (like Shadcn, Chakra, or custom HTML)? Use `slots`:

```tsx
<DataTable
    // ...
    slots={{
        // Replace default checkbox with your own
        Checkbox: ({ checked, onChange }) => (
            <MyCustomCheckbox isChecked={checked} onToggle={onChange} />
        ),
        // Replace default buttons
        Button: ({ children, onClick, variant }) => (
            <MyLibraryButton variant={variant} onClick={onClick}>
                {children}
            </MyLibraryButton>
        )
    }}
/>
```

## 📂 File Structure

The project may contain an `examples/` folder, but you only need to copy `components/data-table`.

*   **`components/data-table/`** (The Core Library) -> **COPY THIS**
    *   `index.ts`: Main export.
    *   `DataTable.tsx`: Core logic.
    *   `hooks/`: Interaction logic.
    *   `icons.tsx`: Lightweight SVG icons.
*   **`examples/`** (Reference Impls) -> **DON'T COPY (unless needed)**
    *   `BasicTableDemo.tsx`: Simple usage.
    *   `RTLComplexTableDemo.tsx`: Advanced config.
    *   `InteractiveTableDemo.tsx`: Selection & Actions.

---
*Built for performance and flexibility.*
