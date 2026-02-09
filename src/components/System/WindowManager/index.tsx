import React, {createContext, useContext, useState} from 'react'
import type {
    CreateWindowProps,
    WindowManagerContextType,
    WindowManagerState
} from "@/components/System/WindowManager/windowManager.type.ts";
import Window, {type WindowProps} from "@/components/System/Window";
import {DndContext, type DragEndEvent} from "@dnd-kit/core";
import {restrictToWindowEdges} from "@dnd-kit/modifiers";
import {v4 as uuidv4} from "uuid";
import Application from "@/components/System/Application";

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
        dockedApplications: [
            {
                id: "test",
                title: "测试应用",
                icon: "https://hexgl.bkcore.com/play/css/title.png",
                // children: <Application type={'builtin'} children={<TestApp/>}/>,
                // children: <Application type={'third'} href="/app/test"/>,
                href: "/app/test"
            },
            {
                id: 'genshin',
                title: "原神",
                singleton: true,
                icon: "https://i04piccdn.sogoucdn.com/a72804451f0e9825",
                href: "https://genshin.titlecan.cn/"
                // size: {width: 1440, height: 900},
                // children: <Application type={'third'} href="https://genshin.titlecan.cn/"/>,
            }
        ],
        desktopApplications: [
            {
                id: "hero-icon",
                title: "HeroIcon",
                icon: "https://heroicons.com/_next/static/media/apple-touch-icon.822687be.png",
                href: "https://heroicons.com/outline",
                size: {width: 1440, height: 900}
            },
            {
                id: "hero-ui",
                title: "HeroUI",
                icon: "https://www.heroui.com/apple-touch-icon.png",
                href: "https://www.heroui.com/docs/components/button",
                size: {width: 1440, height: 900}
            },
            {
                id: "haowallpaper",
                title: "哲风壁纸",
                icon: "https://haowallpaper.com/favicon.ico",
                href: "https://haowallpaper.com/",
                size: {width: 1440, height: 900}
            },
            {
                id: "youdao",
                title: "有道翻译",
                icon: "https://ydlunacommon-cdn.nosdn.127.net/31cf4b56e6c0b3af668aa079de1a898c.png",
                href: "https://fanyi.youdao.com/#/TextTranslate",
                size: {width: 1440, height: 900}
            },
            {
                id: "doubao",
                title: "豆包",
                icon: "https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/chat/favicon.png",
                href: "https://www.doubao.com/chat/",
                size: {width: 1440, height: 900}
            },
            {
                id: "relationship",
                title: '亲戚计算器',
                icon: 'https://th.bing.com/th/id/OIP.nfFu7l8TPI6fnX5Fb8bJ_QHaHa?rs=1&pid=ImgDetMain',
                size: {width: 338, height: 600},
                href: 'https://passer-by.com/relationship/vue/#/',
            },
            {
                id: 'genshin',
                title: "原神",
                singleton: true,
                icon: "https://i04piccdn.sogoucdn.com/a72804451f0e9825",
                href: "https://genshin.titlecan.cn/"
                // size: {width: 1440, height: 900},
                // children: <Application type={'third'} href="https://genshin.titlecan.cn/"/>,
            },
            {
                id: "hexgl",
                title: 'HexGL赛车',
                icon: 'https://hexgl.bkcore.com/play/css/title.png',
                size: {width: 1280, height: 720},
                href: 'https://hexgl.bkcore.com/play/'
            },
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
    const registerWindow = (initialState: CreateWindowProps) => {
        setState((prev) => {
            const id = initialState.singleton ? initialState.id : uuidv4()
            const windows = new Map(prev.windows)
            const newZIndex = prev.highestZIndex + 1

            const remainingWindows = Array.from(windows.values())
            const filteredWindow = remainingWindows.filter(i => i.id === id)
            const activeWindowId = filteredWindow.length > 0 ? filteredWindow[0].id : null

            if (activeWindowId) {
                updateWindow(activeWindowId, {isMinimized: false})
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
                ...initialState,
                id,
                title: initialState.title || 'Untitled',
                position: {
                    x: (window.innerWidth - size.width) / 2,
                    y: (window.innerHeight - size.height) / 2
                },
                size,
                isActive: true,
                isMaximized: false,
                isMinimized: false,
                icon: initialState.icon,
                zIndex: newZIndex,
                children: <Application type={'third'} key={id} href={initialState.href}/>
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

    const getDockedApplications = () => {
        return state.dockedApplications
    }

    const getDesktopApplications = () => {
        return state.desktopApplications
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

    const refresh = () => {
        console.log("refresh")
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
        getDockedApplications,
        getDesktopApplications,
        subscribe,
        refresh,
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
