import type {
    MinimizeTarget,
    ResizeDirection,
    WindowPosition,
    WindowSize
} from "@/components/System/Window/window.type.ts";
import React, {type ReactNode, useCallback, useEffect, useState} from "react";
import {useDraggable} from "@dnd-kit/core";
import {CSS} from "@dnd-kit/utilities";
import {ArrowsPointingInIcon, ArrowsPointingOutIcon, MinusIcon, XMarkIcon} from "@heroicons/react/24/outline";

export interface WindowProps {
    id: string
    title: string
    icon: string
    position: WindowPosition
    size: WindowSize
    minSize?: WindowSize
    maxSize?: WindowSize
    isActive?: boolean
    isMinimized?: boolean
    isMaximized?: boolean
    zIndex?: number
    children?: ReactNode
    onClose?: () => void
    onMinimize?: () => void
    onMaximize?: () => void
    onRestore?: () => void
    onFocus?: () => void
    onPositionChange?: (position: WindowPosition) => void
    onSizeChange?: (size: WindowSize) => void
}

const Window: React.FC<WindowProps> = (
    {
        id,
        title,
        icon,
        position,
        size,
        minSize = {width: 200, height: 113},
        maxSize = {width: window.innerWidth, height: window.innerHeight},
        isActive = false,
        isMinimized = false,
        isMaximized = false,
        zIndex = 0,
        children,
        onClose,
        onMinimize,
        onMaximize,
        onRestore,
        onFocus,
        onPositionChange,
        onSizeChange,
    }
) => {
    const [isResizing, setIsResizing] = useState(false)
    const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null)
    const [initialSize, setInitialSize] = useState<WindowSize>(size)
    const [initialPosition, setInitialPosition] = useState<WindowPosition>(position)
    const [initialMousePosition, setInitialMousePosition] = useState<WindowPosition>({x: 0, y: 0})
    const [minimizeTarget, setMinimizeTarget] = useState<MinimizeTarget | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)
    const [previousPosition, setPreviousPosition] = useState<WindowPosition>(position)
    const [previousSize, setPreviousSize] = useState<WindowSize>(size)

    const validateSize = useCallback(
        (size: WindowSize): WindowSize => {
            return {
                width: Math.max(minSize.width, Math.min(maxSize.width, size.width)),
                height: Math.max(minSize.height, Math.min(maxSize.height, size.height)),
            }
        },
        [minSize, maxSize]
    )

    const validatePosition = useCallback(
        (pos: WindowPosition): WindowPosition => {
            return {
                x: Math.max(0, Math.min(window.innerWidth - size.width, pos.x)),
                y: Math.max(0, Math.min(window.innerHeight - size.height, pos.y)),
            }
        },
        [size.width, size.height]
    )

    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: `draggable-${id}`,
        disabled: isMinimized || isMaximized || isResizing
    })

    // 最小化处理
    const handleMinimize = useCallback(() => {
        setPreviousPosition(position)
        setPreviousSize(size)

        setIsAnimating(true)

        requestAnimationFrame(() => {
            onMinimize?.()

            Promise.resolve().then(() => {
                requestAnimationFrame(() => {
                    const targetElement = document.querySelector(`[data-window-target="${id}"]`)
                    if (!targetElement) {
                        setIsAnimating(false)
                        return
                    }

                    const targetRect = targetElement.getBoundingClientRect()
                    setMinimizeTarget({
                        x: targetRect.left,
                        y: targetRect.top,
                        width: targetRect.width,
                        height: targetRect.height,
                    })

                    const handleTransitionEnd = () => {
                        setIsAnimating(false)
                        setMinimizeTarget(null)
                        window.removeEventListener('transitionend', handleTransitionEnd)
                    }

                    window.addEventListener('transitionend', handleTransitionEnd, {once: true})
                })
            })
        })
    }, [id, position, size, onMinimize])

    // 从最小化恢复处理
    const handleRestore = useCallback(() => {
        const targetElement = document.querySelector(`[data-window-target="${id}"]`)
        if (!targetElement || !previousPosition || !previousSize) {
            onRestore?.()
            return
        }

        const targetRect = targetElement.getBoundingClientRect()

        setMinimizeTarget({
            x: targetRect.left,
            y: targetRect.top,
            width: targetRect.width,
            height: targetRect.height,
        })

        setIsAnimating(true)

        requestAnimationFrame(() => {
            setMinimizeTarget({
                x: previousPosition.x,
                y: previousPosition.y,
                width: previousSize.width,
                height: previousSize.height,
            })
        })

        setTimeout(() => {
            setIsAnimating(false)
            setMinimizeTarget(null)
            onRestore?.()
        }, 300)
    }, [id, previousPosition, previousSize, onRestore])

    const handleResizeStart = useCallback(
        (e: React.MouseEvent, direction: ResizeDirection) => {
            if (isMaximized) return

            e.preventDefault()
            e.stopPropagation()

            setIsResizing(true)
            setResizeDirection(direction)
            setInitialSize(size)
            setInitialPosition(position)
            setInitialMousePosition({x: e.clientX, y: e.clientY})
        }, [isMaximized, size, position]
    )

    const handleResize = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !resizeDirection) return

            const deltaX = e.clientX - initialMousePosition.x
            const deltaY = e.clientY - initialMousePosition.y

            let newWidth = initialSize.width
            let newHeight = initialSize.height
            let newX = initialPosition.x
            let newY = initialPosition.y

            // 水平方向调整
            if (resizeDirection.includes('e')) {
                newWidth = initialSize.width + deltaX
            } else if (resizeDirection.includes('w')) {
                const widthDelta = -deltaX
                const possibleWidth = initialSize.width + widthDelta

                if (possibleWidth >= minSize.width && possibleWidth <= maxSize.width) {
                    newWidth = possibleWidth
                    newX = initialPosition.x - widthDelta
                }
            }

            // 垂直方向调整
            if (resizeDirection.includes('s')) {
                newHeight = initialSize.height + deltaY
            } else if (resizeDirection.includes('n')) {
                const heightDelta = -deltaY
                const possibleHeight = initialSize.height + heightDelta

                if (possibleHeight >= minSize.height && possibleHeight <= maxSize.height) {
                    newHeight = possibleHeight
                    newY = initialPosition.y - heightDelta
                }
            }

            // 验证并应用新的尺寸
            const validatedSize = validateSize({width: newWidth, height: newHeight})
            const validatedPosition = validatePosition({x: newX, y: newY})

            onSizeChange?.(validatedSize)
            onPositionChange?.(validatedPosition)
        },
        [isResizing, resizeDirection, initialSize, initialPosition, initialMousePosition, minSize, maxSize, onSizeChange, onPositionChange, validateSize, validatePosition]
    )

    const handleResizeEnd = useCallback(() => {
        setIsResizing(false)
        setResizeDirection(null)
    }, [])

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleResize, {passive: false})
            window.addEventListener('mouseup', handleResizeEnd)

            return () => {
                window.removeEventListener('mousemove', handleResize)
                window.removeEventListener('mouseup', handleResizeEnd)
            }
        }
    }, [isResizing, handleResize, handleResizeEnd])

    const windowStyle: React.CSSProperties = {
        position: 'absolute',
        left: isMaximized ? 0 : (minimizeTarget?.x ?? position.x),
        top: isMaximized ? 0 : (minimizeTarget?.y ?? position.y),
        width: isMaximized ? '100%' : (minimizeTarget?.width ?? size.width),
        height: isMaximized ? '100%' : (minimizeTarget?.height ?? size.height),
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        zIndex,
        touchAction: 'none',
        transition: isAnimating ? 'left 0.3s ease-in-out, top 0.3s ease-in-out, width 0.3s ease-in-out, height 0.3s ease-in-out, opacity 0.3s ease-in-out' : undefined,
        opacity: isAnimating ? 0.8 : 1,
    }

    const resizeHandleClassName =
        'absolute bg-transparent hover:bg-blue-200 opacity-0 hover:opacity-20 transition-opacity duration-200'

    return (
        <div
            className={`absolute bg-transparent shadow-md rounded-xl overflow-hidden flex flex-col ${isActive ? 'ring-0 ring-blue-100 shadow-xl shadow-sky-200/40' : ''} ${isAnimating ? 'will-change-transform gpu-acceleration' : ''}`}
            style={{
                ...windowStyle,
                visibility: isMinimized && !isAnimating ? 'hidden' : 'visible',
                pointerEvents: isMinimized || isAnimating ? 'none' : 'auto',
            }}
            onClick={onFocus}
        >
            {/* Header */}
            <div
                ref={setNodeRef}
                {...attributes}
                {...listeners}
                onMouseDown={(e) => {
                    e.stopPropagation()
                    onFocus?.()
                }}
                className="shrink-0 flex items-center justify-between px-2 py-1 bg-slate-100/80 backdrop-blur-xs cursor-move select-none"
                onDoubleClick={isMaximized ? handleRestore : onMaximize}
            >
                <div className="flex items-center gap-2">
                    <div className="cursor-pointer hover:bg-white/10 rounded overflow-hidden">
                        <img src={icon} alt={title} className="w-4 h-4 object-cover"/>
                    </div>
                    <div className="text-sm font-medium">{title}</div>
                </div>
                {/* 窗口控制器 */}
                <div className="flex items-center gap-2">
                    <div className="flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
                        <button onClick={handleMinimize} onPointerDown={(e) => e.stopPropagation()}
                                className="cursor-pointer w-5 h-5 transition bg-transparent hover:bg-slate-200/60 rounded">
                            <MinusIcon
                                className="w-full h-full object-cover text-slate-500 hover:text-green-600 font-medium opacity-100 hover:opacity-80 transition-opacity duration-200"
                                strokeWidth={3}
                            />
                        </button>
                        {isMaximized ? (
                            <button onClick={handleRestore} onPointerDown={(e) => e.stopPropagation()}
                                    className="cursor-pointer w-5 h-5 transition bg-transparent hover:bg-slate-200/60 rounded">
                                <ArrowsPointingInIcon
                                    className="w-full h-full object-cover text-slate-500 hover:text-sky-500 font-medium opacity-100 hover:opacity-80 transition-opacity duration-200"
                                    strokeWidth={3}
                                />
                            </button>
                        ) : (
                            <button onClick={onMaximize} onPointerDown={(e) => e.stopPropagation()}
                                    className="cursor-pointer p-0.5 w-5 h-5 transition bg-transparent hover:bg-slate-200/60 rounded">
                                <ArrowsPointingOutIcon
                                    className="w-full h-full object-cover text-slate-500 hover:text-sky-500 font-medium opacity-100 hover:opacity-80 transition-opacity duration-200"
                                    strokeWidth={3}
                                />
                            </button>
                        )}
                        <button onClick={onClose} onPointerDown={(e) => e.stopPropagation()}
                                className="cursor-pointer w-5 h-5 transition bg-transparent hover:bg-slate-200/60 rounded">
                            <XMarkIcon
                                className="w-full h-full object-cover text-slate-500 hover:text-red-500 font-medium opacity-100 hover:opacity-80 transition-colors duration-200"
                                strokeWidth={3}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div
                className="grow flex flex-col min-h-0"
                style={{
                    pointerEvents: isMinimized ? 'none' : 'auto',
                }}
            >
                {!isActive && (
                    <div className="absolute inset-0 z-50 bg-transparent" onClick={(e) => {
                        e.stopPropagation()
                        onFocus?.()
                    }}/>
                )}
                {children}
            </div>

            {/* Footer */}
            <div className="shrink-0 h-0"></div>

            {/* Resize Handler */}
            {!isMaximized && (
                <>
                    <div
                        className={`${resizeHandleClassName} right-0 top-0 bottom-0 w-2 cursor-e-resize`}
                        onMouseDown={(e) => handleResizeStart(e, 'e')}
                    />
                    <div
                        className={`${resizeHandleClassName} left-0 top-0 bottom-0 w-2 cursor-w-resize`}
                        onMouseDown={(e) => handleResizeStart(e, 'w')}
                    />
                    <div
                        className={`${resizeHandleClassName} top-0 left-0 right-0 h-2 cursor-n-resize`}
                        onMouseDown={(e) => handleResizeStart(e, 'n')}
                    />
                    <div
                        className={`${resizeHandleClassName} bottom-0 left-0 right-0 h-2 cursor-s-resize`}
                        onMouseDown={(e) => handleResizeStart(e, 's')}
                    />

                    {/* 角落调整手柄 */}
                    <div
                        className={`${resizeHandleClassName} right-0 bottom-0 w-2 h-2 cursor-se-resize`}
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                    />
                    <div
                        className={`${resizeHandleClassName} left-0 bottom-0 w-2 h-2 cursor-sw-resize`}
                        onMouseDown={(e) => handleResizeStart(e, 'sw')}
                    />
                    <div
                        className={`${resizeHandleClassName} left-0 top-0 w-2 h-2 cursor-nw-resize`}
                        onMouseDown={(e) => handleResizeStart(e, 'nw')}
                    />
                    <div
                        className={`${resizeHandleClassName} right-0 top-0 w-2 h-2 cursor-ne-resize`}
                        onMouseDown={(e) => handleResizeStart(e, 'ne')}
                    />
                </>
            )}
        </div>
    )
}

export default Window
