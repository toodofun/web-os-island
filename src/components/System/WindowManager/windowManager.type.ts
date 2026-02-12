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

/** 子应用通过 postMessage 与主应用通信的 message type（主应用监听 window message） */
export const WINDOW_MANAGER_MESSAGE_TYPE_CLOSE = 'windowmanager:closeWindow' as const;
export const WINDOW_MANAGER_MESSAGE_TYPE_MINIMIZE = 'windowmanager:minimizeWindow' as const;
export const WINDOW_MANAGER_MESSAGE_TYPE_MAXIMIZE = 'windowmanager:maximizeWindow' as const;
export const WINDOW_MANAGER_MESSAGE_TYPE_OPEN = 'windowmanager:openWindow' as const;

/** 关闭窗口 */
export interface WindowManagerCloseMessage {
    type: typeof WINDOW_MANAGER_MESSAGE_TYPE_CLOSE;
    windowId: string;
}

/** 最小化窗口 */
export interface WindowManagerMinimizeMessage {
    type: typeof WINDOW_MANAGER_MESSAGE_TYPE_MINIMIZE;
    windowId: string;
}

/** 最大化窗口 */
export interface WindowManagerMaximizeMessage {
    type: typeof WINDOW_MANAGER_MESSAGE_TYPE_MAXIMIZE;
    windowId: string;
}

/** 允许通过 postMessage 打开新窗口的协议白名单（按协议头区分，后续可扩展） */
export const ALLOWED_OPEN_WINDOW_PROTOCOLS = ['terminal://'] as const;

export type AllowedOpenWindowProtocol = (typeof ALLOWED_OPEN_WINDOW_PROTOCOLS)[number];

/** 校验 href 是否属于允许打开的协议 */
export function isAllowedOpenWindowHref(href: string): boolean {
    if (!href) return false;
    return ALLOWED_OPEN_WINDOW_PROTOCOLS.some((protocol) => href.startsWith(protocol));
}

/** 打开新窗口：只传协议 URL，可传窗口标题；各协议在主应用内单独实现打开逻辑 */
export interface WindowManagerOpenMessage {
    type: typeof WINDOW_MANAGER_MESSAGE_TYPE_OPEN;
    /** 协议 URL，如 terminal://<base64_str> */
    href: string;
    /** 可选，窗口标题，不传则使用协议默认标题 */
    title?: string;
}

/** 协议打开逻辑：根据协议 href 返回要打开的窗口参数，不支持则返回 null */
export type ProtocolOpenHandler = (href: string) => CreateWindowProps | null;

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
