import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { CreateWindowProps } from '@/components/System/WindowManager/windowManager.type';
import type { WindowPosition, WindowSize } from '@/components/System/Window/window.type';

/** 可持久化的窗口状态（不含 React 节点） */
export interface PersistedWindow {
    id: string;
    title: string;
    icon: string;
    href: string;
    position: WindowPosition;
    size: WindowSize;
    minSize?: WindowSize;
    maxSize?: WindowSize;
    isActive?: boolean;
    isMinimized?: boolean;
    isMaximized?: boolean;
    zIndex?: number;
    singleton?: boolean;
}

interface WindowsState {
    windows: Record<string, PersistedWindow>;
    activeWindowId: string | null;
    highestZIndex: number;
    registerWindow: (initial: CreateWindowProps) => void;
    unregisterWindow: (id: string) => void;
    updateWindow: (id: string, updates: Partial<PersistedWindow>) => void;
    bringToFront: (id: string) => void;
    getMinimizedWindows: () => PersistedWindow[];
    getWindowsMap: () => Record<string, PersistedWindow>;
    /** 清空所有窗口并清除本地持久化缓存 */
    clearWindowCache: () => void;
}

function bringMaxZIndexToFront(
    windows: Record<string, PersistedWindow>
): { windows: Record<string, PersistedWindow>; activeWindowId: string | null } {
    const entries = Object.entries(windows);
    const sorted = entries
        .filter(([, w]) => !w.isMinimized)
        .sort(([, a], [, b]) => (b.zIndex ?? 0) - (a.zIndex ?? 0));
    const newActiveId = sorted.length > 0 ? sorted[0][0] : null;
    const next: Record<string, PersistedWindow> = {};
    for (const [id, w] of entries) {
        next[id] = { ...w, isActive: id === newActiveId };
    }
    return { windows: next, activeWindowId: newActiveId };
}

const PERSIST_KEY = 'island-windows';

export const useWindowsStore = create<WindowsState>()(
    persist(
        (set, get) => ({
            windows: {},
            activeWindowId: null,
            highestZIndex: 1000,

            registerWindow: (initial: CreateWindowProps) => {
                const id = initial.singleton ? initial.id : uuidv4();
                set((state) => {
                    const windows = { ...state.windows };
                    const existingId = initial.singleton ? initial.id : null;
                    const existing = existingId ? windows[existingId] : undefined;
                    if (existing) {
                        const next = { ...windows };
                        next[existingId!] = { ...next[existingId!], isMinimized: false };
                        const newZ = state.highestZIndex + 1;
                        next[existingId!] = { ...next[existingId!], zIndex: newZ, isActive: true };
                        for (const k of Object.keys(next)) {
                            if (k !== existingId) next[k] = { ...next[k], isActive: false };
                        }
                        return { windows: next, activeWindowId: existingId!, highestZIndex: newZ };
                    }

                    const definedSize = initial.size ?? { width: 800, height: 500 };
                    const size: WindowSize = {
                        width: Math.min(typeof window !== 'undefined' ? window.innerWidth : 800, definedSize.width),
                        height: Math.min(typeof window !== 'undefined' ? window.innerHeight : 500, definedSize.height),
                    };
                    const newZ = state.highestZIndex + 1;
                    const position: WindowPosition =
                        typeof window !== 'undefined'
                            ? {
                                  x: (window.innerWidth - size.width) / 2,
                                  y: (window.innerHeight - size.height) / 2,
                              }
                            : { x: 0, y: 0 };

                    const next = { ...windows };
                    for (const k of Object.keys(next)) {
                        next[k] = { ...next[k], isActive: false };
                    }
                    next[id] = {
                        id,
                        title: initial.title || 'Untitled',
                        icon: initial.icon,
                        href: initial.href,
                        position,
                        size,
                        minSize: initial.minSize,
                        maxSize: initial.maxSize,
                        isActive: true,
                        isMinimized: false,
                        isMaximized: false,
                        zIndex: newZ,
                        singleton: initial.singleton,
                    };
                    return { windows: next, activeWindowId: id, highestZIndex: newZ };
                });
            },

            unregisterWindow: (id: string) => {
                set((state) => {
                    const windows = { ...state.windows };
                    delete windows[id];
                    const { windows: next, activeWindowId } = bringMaxZIndexToFront(windows);
                    return { windows: next, activeWindowId };
                });
            },

            updateWindow: (id: string, updates: Partial<PersistedWindow>) => {
                set((state) => {
                    const current = state.windows[id];
                    if (!current) return state;
                    const windows = { ...state.windows, [id]: { ...current, ...updates } };
                    const { windows: next, activeWindowId } = bringMaxZIndexToFront(windows);
                    return { windows: next, activeWindowId };
                });
            },

            bringToFront: (id: string) => {
                set((state) => {
                    const current = state.windows[id];
                    if (!current) return state;
                    const newZ = state.highestZIndex + 1;
                    const windows = { ...state.windows };
                    windows[id] = { ...current, zIndex: newZ, isActive: true };
                    for (const k of Object.keys(windows)) {
                        if (k !== id) windows[k] = { ...windows[k], isActive: false };
                    }
                    return { windows, activeWindowId: id, highestZIndex: newZ };
                });
            },

            getMinimizedWindows: () => {
                const { windows } = get();
                return Object.values(windows)
                    .filter((w) => w.isMinimized)
                    .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
            },

            getWindowsMap: () => get().windows,

            clearWindowCache: () => {
                set({ windows: {}, activeWindowId: null, highestZIndex: 1000 });
            },
        }),
        {
            name: PERSIST_KEY,
            partialize: (state) => ({
                windows: state.windows,
                activeWindowId: state.activeWindowId,
                highestZIndex: state.highestZIndex,
            }),
            skipHydration: true,
        }
    )
);
