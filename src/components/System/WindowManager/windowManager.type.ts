import type {WindowProps} from '@/components/System/Window';
import type {WindowSize} from '@/components/System/Window/window.type';

export type CreateWindowProps = {
    id: string;
    title: string;
    icon: string;
    href: string;
    size?: WindowSize;
    minSize?: WindowSize;
    maxSize?: WindowSize;
    singleton?: boolean;
};

export interface WindowManagerState {
    windows: Map<string, WindowProps>;
    dockedApplications: CreateWindowProps[];
    desktopApplications: CreateWindowProps[];
    activeWindowId: string | null;
    highestZIndex: number;
}

export type MinimizedWindowItem = Pick<WindowProps, 'id' | 'title' | 'icon' | 'position' | 'size' | 'isMinimized' | 'zIndex'>;

/** 子应用通过 postMessage 关闭窗口时使用的 message type（主应用监听 window message） */
export const WINDOW_MANAGER_MESSAGE_TYPE_CLOSE = 'windowmanager:closeWindow' as const;

/** 子应用 iframe 向主应用 postMessage 的 payload 类型 */
export interface WindowManagerCloseMessage {
    type: typeof WINDOW_MANAGER_MESSAGE_TYPE_CLOSE;
    windowId: string;
}

export interface WindowManagerContextType {
    registerWindow: (initialState: CreateWindowProps) => void;
    unregisterWindow: (id: string) => void;
    updateWindow: (id: string, updates: Partial<WindowProps>) => void;
    bringToFront: (id: string) => void;
    minimizedWindows: MinimizedWindowItem[];
    getActiveWindow: () => Pick<WindowProps, 'id' | 'title' | 'icon' | 'position' | 'size' | 'isMinimized' | 'zIndex'> | null;
    dockApplications: CreateWindowProps[];
    desktopApplications: CreateWindowProps[];
    getMinimizedWindows: () => MinimizedWindowItem[];
    getDockedApplications: () => CreateWindowProps[];
    getDesktopApplications: () => CreateWindowProps[];
    refresh: () => void;
    /** 清空所有窗口并清除本地持久化缓存 */
    clearWindowCache: () => void;
}
