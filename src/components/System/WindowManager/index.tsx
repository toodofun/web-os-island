import React, {createContext, useCallback, useContext, useEffect, useMemo} from 'react';
import type {
    WindowManagerCloseMessage,
    WindowManagerContextType,
} from '@/components/System/WindowManager/windowManager.type';
import {WINDOW_MANAGER_MESSAGE_TYPE_CLOSE} from '@/components/System/WindowManager/windowManager.type';
import Window, {type WindowProps} from '@/components/System/Window';
import {DndContext, type DragEndEvent} from '@dnd-kit/core';
import {restrictToWindowEdges} from '@dnd-kit/modifiers';
import Application from '@/components/System/Application';
import {useShallow} from 'zustand/react/shallow';
import {useAppsStore} from '@/stores/appsStore';
import {type PersistedWindow, useWindowsStore} from '@/stores/windowsStore';

export interface WindowManagerProps {
    children?: React.ReactNode;
    defaultActiveWindow?: string;
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useWindowManager = () => {
    const context = useContext(WindowManagerContext);
    if (!context) {
        throw new Error('useWindowManager must be used within WindowManager');
    }
    return context;
};

function persistedToWindowProps(
    w: PersistedWindow,
    callbacks: {
        onClose: () => void;
        onFocus: () => void;
        onMinimize: () => void;
        onMaximize: () => void;
        onRestore: () => void;
        onPositionChange: (p: { x: number; y: number }) => void;
        onSizeChange: (s: { width: number; height: number }) => void;
    }
): WindowProps {
    return {
        id: w.id,
        title: w.title,
        icon: w.icon,
        position: w.position,
        size: w.size,
        minSize: w.minSize,
        maxSize: w.maxSize,
        isActive: w.isActive ?? false,
        isMinimized: w.isMinimized ?? false,
        isMaximized: w.isMaximized ?? false,
        zIndex: w.zIndex ?? 0,
        children: <Application type="third" href={w.href} windowId={w.id}/>,
        ...callbacks,
    };
}

export const WindowManager: React.FC<WindowManagerProps> = ({children}) => {
    const windows = useWindowsStore((s) => s.windows);
    const activeWindowId = useWindowsStore((s) => s.activeWindowId);
    const minimizedWindows = useWindowsStore(
        useShallow((s) =>
            Object.values(s.windows)
                .filter((w) => w.isMinimized)
                .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
        )
    );
    const registerWindow = useWindowsStore((s) => s.registerWindow);
    const unregisterWindow = useWindowsStore((s) => s.unregisterWindow);
    const updateWindow = useWindowsStore((s) => s.updateWindow);
    const bringToFront = useWindowsStore((s) => s.bringToFront);
    const dockApplications = useAppsStore((s) => s.dockApplications);
    const desktopApplications = useAppsStore((s) => s.desktopApplications);

    useEffect(() => {
        void useWindowsStore.persist.rehydrate();
        void useAppsStore.getState().refresh();
    }, []);

    // 监听子应用 iframe 通过 postMessage 发出的关闭窗口请求（子应用无法访问主应用 context）
    useEffect(() => {
        const handler = (event: MessageEvent) => {
            const data = event.data as WindowManagerCloseMessage | undefined;
            if (data?.type === WINDOW_MANAGER_MESSAGE_TYPE_CLOSE) {
                unregisterWindow(data.windowId);
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, [unregisterWindow]);

    const refresh = useCallback(() => {
        useAppsStore.getState().refresh();
    }, []);

    const clearWindowCache = useCallback(() => {
        useWindowsStore.getState().clearWindowCache();
        useWindowsStore.persist.clearStorage();
    }, []);

    const getActiveWindow = useCallback(() => {
        const id = activeWindowId;
        return id && windows[id] ? windows[id] : null;
    }, [activeWindowId, windows]);

    const contextValue: WindowManagerContextType = useMemo(
        () => ({
            registerWindow,
            unregisterWindow,
            updateWindow,
            bringToFront,
            minimizedWindows,
            getActiveWindow,
            dockApplications,
            desktopApplications,
            getMinimizedWindows: () => minimizedWindows,
            getDockedApplications: () => dockApplications,
            getDesktopApplications: () => desktopApplications,
            refresh,
            clearWindowCache,
        }),
        [
            registerWindow,
            unregisterWindow,
            updateWindow,
            bringToFront,
            getActiveWindow,
            refresh,
            clearWindowCache,
            minimizedWindows,
            dockApplications,
            desktopApplications,
        ]
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, delta} = event;
        const id = active.id.toString().replace('draggable-', '');
        const window = windows[id];
        if (window) {
            updateWindow(id, {
                position: {
                    x: window.position.x + (delta?.x ?? 0),
                    y: window.position.y + (delta?.y ?? 0),
                },
            });
        }
    };

    const windowList = Object.values(windows);

    return (
        <WindowManagerContext.Provider value={contextValue}>
            <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
                {windowList.map((w) => {
                    const props = persistedToWindowProps(w, {
                        onClose: () => {
                            unregisterWindow(w.id);
                        },
                        onFocus: () => bringToFront(w.id),
                        onMinimize: () => updateWindow(w.id, {isMinimized: true}),
                        onMaximize: () => updateWindow(w.id, {isMaximized: true}),
                        onRestore: () => updateWindow(w.id, {isMaximized: false}),
                        onPositionChange: (position) => updateWindow(w.id, {position}),
                        onSizeChange: (size) => updateWindow(w.id, {size}),
                    });
                    return <Window key={w.id} {...props} />;
                })}
                {children}
            </DndContext>
        </WindowManagerContext.Provider>
    );
};

export default WindowManager;
