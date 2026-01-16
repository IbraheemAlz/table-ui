'use client'

import { useState, useEffect, useRef } from 'react'

interface UseResizeObserverProps {
    onResize?: (width: number, height: number) => void
}

export function useResizeObserver<T extends HTMLElement = HTMLDivElement>({
    onResize
}: UseResizeObserverProps = {}) {
    const ref = useRef<T>(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0]
            if (entry) {
                const { width, height } = entry.contentRect
                setDimensions({ width, height })
                onResize?.(width, height)
            }
        })

        observer.observe(element)
        return () => observer.disconnect()
    }, [onResize])

    return { ref, ...dimensions }
}
