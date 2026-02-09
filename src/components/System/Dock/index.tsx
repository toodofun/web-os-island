import React, {useEffect, useState} from "react";
import {useWindowManager} from "@/components/System/WindowManager";
import type {WindowProps} from "@/components/System/Window";
import {Tooltip} from "@heroui/react";
import type {CreateWindowProps} from "@/components/System/WindowManager/windowManager.type.ts";

const Dock: React.FC = () => {
    const windowManager = useWindowManager()
    const [minimizedWindows, setMinimizedWindows] = useState<WindowProps[]>([])
    const [dockedWindows, setDockedWindows] = useState<CreateWindowProps[]>([])

    useEffect(() => {
        const updateWindows = () => {
            const minimizedWindows = windowManager.getMinimizedWindows()
            const dockedWindows = windowManager.getDockedApplications()
            setMinimizedWindows(minimizedWindows)
            setDockedWindows(dockedWindows)
        }

        updateWindows()

        const unsubscribe = windowManager.subscribe(updateWindows)

        return () => unsubscribe()
    }, [windowManager])

    return (
        <div className="flex items-center justify-between gap-3 h-full px-4 bg-white/20 backdrop-blur-xs">
            <div className="flex items-end gap-2">
                {dockedWindows.map((window) => (
                    <Tooltip key={window.id} content={window.title} showArrow={true}>
                        <div
                            className="bg-white/30 rounded-lg overflow-hidden"
                            key={window.id}
                            data-window-target={window.id}
                            onClick={() => {
                                windowManager.registerWindow(window)
                            }}
                        >
                            <div
                                className="cursor-pointer hover:bg-white/50 bg-white/30 h-7 p-0"
                                style={{aspectRatio: 1}}>
                                <img src={window.icon} alt={window.title}
                                     className="w-full h-full object-contain"/>
                            </div>
                        </div>
                    </Tooltip>
                ))}
            </div>
            {minimizedWindows.length > 0 && (
                <>
                    <div className="h-[60%] rounded-xl w-0.75 bg-white/30"></div>
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
                </>
            )}
        </div>
    )
}

export default Dock
