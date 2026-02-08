import type {WindowProps} from "@/components/System/Window";

export interface WindowManagerState {
    windows: Map<string, WindowProps>
    activeWindowId: string | null
    highestZIndex: number
}

export interface WindowManagerContextType {
    registerWindow: (id: string, initialState: Partial<WindowProps>) => void
    unregisterWindow: (id: string) => void
    updateWindow: (id: string, updates: Partial<WindowProps>) => void
    bringToFront: (id: string) => void
    getMinimizedWindows: () => WindowProps[]
    subscribe: (callback: () => void) => () => void
}
