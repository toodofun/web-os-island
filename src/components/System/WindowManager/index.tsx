import React, {createContext, useContext, useState} from 'react'
import type {
    WindowManagerContextType,
    WindowManagerState
} from "@/components/System/WindowManager/windowManager.type.ts";
import Window, {type WindowProps} from "@/components/System/Window";
import {DndContext, type DragEndEvent} from "@dnd-kit/core";
import {restrictToWindowEdges} from "@dnd-kit/modifiers";
import Application from "@/components/System/Application";
import Loading from "@/components/Common/Loading";

export interface WindowManagerProps {
    children?: React.ReactNode
    defaultActiveWindow?: string
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(
    null
)

export // eslint-disable-next-line react-refresh/only-export-components
const useWindowManager = () => {
    const context = useContext(WindowManagerContext)
    if (!context) {
        throw new Error('useWindowManager must be used within WindowManager')
    }
    return context
}

export const WindowManager: React.FC<WindowManagerProps> = (
    {
        children,
        defaultActiveWindow,
    }) => {
    const [state, setState] = useState<WindowManagerState>({
        windows: new Map(),
        activeWindowId: defaultActiveWindow || null,
        dockedWindows: [
            {
                title: "测试应用",
                icon: "https://hexgl.bkcore.com/play/css/title.png",
                children: <Application type={'builtin'} children={<Loading/>}/>,
            },
            {
                id: 'genshin',
                title: "原神",
                singleton: true,
                icon: "https://i04piccdn.sogoucdn.com/a72804451f0e9825",
                // size: {width: 1440, height: 900},
                children: <Application type={'third'} href="https://genshin.titlecan.cn/"/>,
            }
        ],
        highestZIndex: 1000,
    })

    const [subscribers] = useState<Set<() => void>>(new Set())

    const notifySubscribers = () => {
        subscribers.forEach((callback) => callback())
    }

    const subscribe = (callback: () => void) => {
        subscribers.add(callback)
        return () => {
            subscribers.delete(callback)
        }
    }

    // 注册窗口
    const registerWindow = (id: string, initialState: Partial<WindowProps>) => {
        setState((prev) => {
            const windows = new Map(prev.windows)
            const newZIndex = prev.highestZIndex + 1

            const remainingWindows = Array.from(windows.values())
            const filteredWindow = remainingWindows.filter(i => i.id === id)
            const activeWindowId = filteredWindow.length > 0 ? filteredWindow[0].id : null

            if (activeWindowId) {
                bringToFront(activeWindowId)
                return prev
            }

            // 更新其他窗口状态
            for (const [windowId, window] of windows.entries()) {
                if (window.isActive) {
                    windows.set(windowId, {...window, isActive: false})
                }
            }

            // 添加新窗口
            const definedSize = initialState.size || {width: 800, height: 500}
            const size = {
                width: Math.min(window.innerWidth, definedSize.width),
                height: Math.min(window.innerHeight, definedSize.height)
            }

            windows.set(id, {
                id,
                title: initialState.title || 'Untitled',
                position: initialState.position || {
                    x: (window.innerWidth - size.width) / 2,
                    y: (window.innerHeight - size.height) / 2
                },
                size,
                isActive: true,
                isMaximized: false,
                isMinimized: false,
                icon: initialState.icon || '',
                zIndex: newZIndex,
                ...initialState,
            })

            return {
                ...prev,
                windows,
                activeWindowId: id,
                highestZIndex: newZIndex,
            }
        })
    }

    // 注销窗口
    const unregisterWindow = (id: string) => {
        setState((prev) => {
            const windows = new Map(prev.windows)
            windows.delete(id)

            const {windows: newWindows, activeWindowId: newActiveWindowId} = bringMaxZIndexToFront(windows)

            return {
                ...prev,
                windows: newWindows,
                activeWindowId: newActiveWindowId,
            }
        })
    }

    // 更新窗口状态
    const updateWindow = (id: string, updates: Partial<WindowProps>) => {
        setState((prev) => {
            const windows = new Map(prev.windows)
            const currentWindow = windows.get(id)
            if (!currentWindow) return prev

            windows.set(id, {...currentWindow, ...updates})

            const {windows: newWindows, activeWindowId: newActiveWindowId} = bringMaxZIndexToFront(windows)

            const newState = {...prev, windows: newWindows, activeWindowId: newActiveWindowId}
            setTimeout(() => notifySubscribers(), 0)

            return newState
        })
    }

    const bringMaxZIndexToFront = (windows: Map<string, WindowProps>) => {
        // 确定新的 activeWindowId
        const remainingWindows = Array.from(windows.values())
        const sortedWindow = remainingWindows.filter(i => !i.isMinimized).sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0))
        const newActiveWindowId = sortedWindow.length > 0 ? sortedWindow[0].id : null

        // 将新选中的窗口设置为 active，其他窗口设置为非 active
        for (const [windowId, window] of windows.entries()) {
            if (windowId === newActiveWindowId) {
                windows.set(windowId, {...window, isActive: true})
            } else {
                windows.set(windowId, {...window, isActive: false})
            }
        }

        return {
            windows,
            activeWindowId: newActiveWindowId,
        }
    }

    const getMinimizedWindows = () => {
        const minimizedWindows: WindowProps[] = []

        const sortedWindows = Array.from(state.windows.values()).sort((a, b) => {
            return (a.zIndex || 0) - (b.zIndex || 0)
        })

        for (const window of sortedWindows) {
            if (window.isMinimized) {
                minimizedWindows.push(window)
            }
        }

        return minimizedWindows
    }

    const getDockedWindows = () => {
        return state.dockedWindows
    }

    const bringToFront = (id: string) => {
        setState((prev) => {
            const windows = new Map(prev.windows)
            const window = windows.get(id)
            if (!window) return prev

            const newZIndex = prev.highestZIndex + 1
            windows.set(id, {...window, isActive: true, zIndex: newZIndex})

            for (const [otherId, otherWindow] of windows.entries()) {
                if (otherId !== id && otherWindow.isActive) {
                    windows.set(otherId, {...otherWindow, isActive: false})
                }
            }

            return {
                ...prev,
                windows,
                activeWindowId: id,
                highestZIndex: newZIndex,
            }
        })
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, delta} = event
        const id = active.id.toString().replace('draggable-', '')
        const window = state.windows.get(id)

        if (window) {
            const newPosition = {
                x: window.position.x + (delta?.x || 0),
                y: window.position.y + (delta?.y || 0),
            }
            updateWindow(id, {position: newPosition})
        }
    }

    const contextValue: WindowManagerContextType = {
        registerWindow,
        unregisterWindow,
        updateWindow,
        bringToFront,
        getMinimizedWindows,
        getDockedWindows,
        subscribe,
    }

    return (
        <WindowManagerContext.Provider value={contextValue}>
            <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
                {Array.from(state.windows.values()).map((window) => (
                    <Window
                        key={window.id}
                        {...window}
                        onClose={() => {
                            unregisterWindow(window.id)
                            window.onClose?.()
                        }}
                        onFocus={() => {
                            bringToFront(window.id)
                            window.onFocus?.()
                        }}
                        onMinimize={() => {
                            updateWindow(window.id, {isMinimized: true})
                            window.onMinimize?.()
                        }}
                        onMaximize={() => {
                            updateWindow(window.id, {isMaximized: true})
                            window.onMaximize?.()
                        }}
                        onRestore={() => {
                            updateWindow(window.id, {isMaximized: false})
                            window.onRestore?.()
                        }}
                        onPositionChange={(position) => {
                            updateWindow(window.id, {position})
                            window.onPositionChange?.(position)
                        }}
                        onSizeChange={(size) => {
                            updateWindow(window.id, {size})
                            window.onSizeChange?.(size)
                        }}
                    />
                ))}
                {children}
            </DndContext>
        </WindowManagerContext.Provider>
    )
}

export default WindowManager
