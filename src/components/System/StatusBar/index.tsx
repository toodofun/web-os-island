import React, {useEffect, useState} from "react";
import {useWindowManager} from "@/components/System/WindowManager";
import type {WindowProps} from "@/components/System/Window";
import {Tooltip} from "@heroui/react";

const StatusBar: React.FC = () => {
    const windowManager = useWindowManager()
    const [minimizedWindows, setMinimizedWindows] = useState<WindowProps[]>([])

    useEffect(() => {
        const updateMinimizedWindows = () => {
            const windows = windowManager.getMinimizedWindows()
            setMinimizedWindows(windows)
        }

        updateMinimizedWindows()

        const unsubscribe = windowManager.subscribe(updateMinimizedWindows)

        return () => unsubscribe()
    }, [windowManager])

    return (
        <div className="flex items-center justify-between h-full px-4 bg-white/20 backdrop-blur-xs">
            <div className="flex items-end gap-2">
                {minimizedWindows.map((window) => (
                    <Tooltip key={window.id} content={window.title} showArrow={true}>
                        <div
                            className="bg-white/30 rounded"
                            key={window.id}
                            data-window-target={window.id}
                            onClick={() => {
                                windowManager.updateWindow(window.id, {isMinimized: false})
                                windowManager.bringToFront(window.id)
                            }}
                        >
                            <div
                                className="cursor-pointer hover:bg-white/50 bg-white/30 h-7 p-0 rounded overflow-hidden"
                                style={{aspectRatio: 1}}>
                                <img src={window.icon} alt={window.title}
                                     className="w-full h-full rounded-md object-contain"/>
                            </div>
                        </div>
                    </Tooltip>
                ))}
            </div>
        </div>
    )
}

export default StatusBar
