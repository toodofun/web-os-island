import type {WindowProps} from "@/components/System/Window";

export type CreateWindowProps = Partial<WindowProps> & {
    singleton?: boolean;
}

export interface WindowManagerState {
    windows: Map<string, WindowProps>
    dockedWindows: CreateWindowProps[]
    activeWindowId: string | null
    highestZIndex: number
}

export interface WindowManagerContextType {
    registerWindow: (id: string, initialState: Partial<WindowProps>) => void
    unregisterWindow: (id: string) => void
    updateWindow: (id: string, updates: Partial<WindowProps>) => void
    bringToFront: (id: string) => void
    getMinimizedWindows: () => WindowProps[]
    getDockedWindows: () => CreateWindowProps[]
    subscribe: (callback: () => void) => () => void
}
