import { useState, useCallback } from 'react'

interface HistoryState<T> {
    past: T[]
    future: T[]
}

interface UseHistoryProps<T> {
    limit?: number
    onUndo?: (action: T) => void
    onRedo?: (action: T) => void
}

export function useHistory<T>({ limit = 20, onUndo, onRedo }: UseHistoryProps<T> = {}) {
    const [history, setHistory] = useState<HistoryState<T>>({
        past: [],
        future: []
    })

    // Record a new action
    const record = useCallback((action: T) => {
        setHistory(prev => {
            const newPast = [...prev.past, action]
            if (limit && newPast.length > limit) {
                newPast.shift() // Remove oldest
            }
            return {
                past: newPast,
                future: [] // Clear future on new action
            }
        })
    }, [limit])

    // Undo: Pop from past, push to future
    const undo = useCallback(() => {
        if (history.past.length === 0) return

        const newPast = [...history.past]
        const action = newPast.pop()!

        // Execute the side effect OUTSIDE the setter
        onUndo?.(action)

        setHistory(prev => ({
            past: newPast,
            future: [action, ...prev.future]
        }))
    }, [history, onUndo])

    // Redo: Pop from future, push to past
    const redo = useCallback(() => {
        if (history.future.length === 0) return

        const newFuture = [...history.future]
        const action = newFuture.shift()!

        // Execute the side effect OUTSIDE the setter
        onRedo?.(action)

        setHistory(prev => ({
            past: [...prev.past, action],
            future: newFuture
        }))
    }, [history, onRedo])

    // Clear history (e.g. on page change)
    const clear = useCallback(() => {
        setHistory({ past: [], future: [] })
    }, [])

    return {
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        record,
        undo,
        redo,
        clear
    }
}
