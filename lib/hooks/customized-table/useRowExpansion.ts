"use client";

import { useState, useCallback, useMemo } from "react";

// ============================================================================
// useRowExpansion Hook
// ============================================================================

interface UseRowExpansionOptions {
    /** Controlled expanded row IDs */
    controlledExpandedIds?: string[];
    /** Callback when expansion changes */
    onExpandedChange?: (ids: string[]) => void;
    /** Allow multiple rows expanded at once (default: true) */
    allowMultiple?: boolean;
}

interface UseRowExpansionReturn {
    /** Set of currently expanded row IDs */
    expandedRowIds: Set<string>;
    /** Toggle expansion for a specific row */
    toggleRowExpansion: (rowId: string) => void;
    /** Check if a row is expanded */
    isRowExpanded: (rowId: string) => boolean;
    /** Collapse all expanded rows */
    collapseAll: () => void;
    /** Expand specific rows */
    expandRows: (rowIds: string[]) => void;
    /** Count of expanded rows */
    expandedCount: number;
}

export function useRowExpansion({
    controlledExpandedIds,
    onExpandedChange,
    allowMultiple = true,
}: UseRowExpansionOptions = {}): UseRowExpansionReturn {
    // Internal state for uncontrolled mode
    const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(
        new Set()
    );

    // Use controlled or internal state
    const isControlled = controlledExpandedIds !== undefined;
    const expandedRowIds = useMemo(() => {
        return isControlled
            ? new Set(controlledExpandedIds)
            : internalExpandedIds;
    }, [isControlled, controlledExpandedIds, internalExpandedIds]);

    // Update function that handles both controlled and uncontrolled
    const updateExpanded = useCallback(
        (newIds: Set<string>) => {
            if (!isControlled) {
                setInternalExpandedIds(newIds);
            }
            onExpandedChange?.(Array.from(newIds));
        },
        [isControlled, onExpandedChange]
    );

    // Toggle expansion for a row
    const toggleRowExpansion = useCallback(
        (rowId: string) => {
            const newIds = new Set(expandedRowIds);

            if (newIds.has(rowId)) {
                // Collapse
                newIds.delete(rowId);
            } else {
                // Expand
                if (!allowMultiple) {
                    // Single mode: clear others first
                    newIds.clear();
                }
                newIds.add(rowId);
            }

            updateExpanded(newIds);
        },
        [expandedRowIds, allowMultiple, updateExpanded]
    );

    // Check if a row is expanded
    const isRowExpanded = useCallback(
        (rowId: string) => expandedRowIds.has(rowId),
        [expandedRowIds]
    );

    // Collapse all rows
    const collapseAll = useCallback(() => {
        updateExpanded(new Set());
    }, [updateExpanded]);

    // Expand specific rows
    const expandRows = useCallback(
        (rowIds: string[]) => {
            const newIds = allowMultiple
                ? new Set([...expandedRowIds, ...rowIds])
                : new Set(rowIds.slice(0, 1)); // Only first one in single mode
            updateExpanded(newIds);
        },
        [expandedRowIds, allowMultiple, updateExpanded]
    );

    return {
        expandedRowIds,
        toggleRowExpansion,
        isRowExpanded,
        collapseAll,
        expandRows,
        expandedCount: expandedRowIds.size,
    };
}
