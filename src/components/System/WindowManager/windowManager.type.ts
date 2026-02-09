import type {WindowProps} from "@/components/System/Window";
import type {WindowSize} from "@/components/System/Window/window.type.ts";

export type CreateWindowProps = {
    id: string;
    title: string;
    icon: string;
    href: string;
    size?: WindowSize;
    minSize?: WindowSize;
    maxSize?: WindowSize;
    singleton?: boolean;
}

export interface WindowManagerState {
    windows: Map<string, WindowProps>
    dockedApplications: CreateWindowProps[]
    desktopApplications: CreateWindowProps[]
    activeWindowId: string | null
    highestZIndex: number
}

export interface WindowManagerContextType {
    registerWindow: (initialState: CreateWindowProps) => void
    unregisterWindow: (id: string) => void
    updateWindow: (id: string, updates: Partial<WindowProps>) => void
    bringToFront: (id: string) => void
    getMinimizedWindows: () => WindowProps[]
    getDockedApplications: () => CreateWindowProps[]
    getDesktopApplications: () => CreateWindowProps[]
    subscribe: (callback: () => void) => () => void
    refresh: () => void
}
