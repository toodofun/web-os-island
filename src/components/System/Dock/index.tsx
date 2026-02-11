import React from 'react';
import { useWindowManager } from '@/components/System/WindowManager';
import type { CreateWindowProps } from '@/components/System/WindowManager/windowManager.type';
import { Tooltip } from '@heroui/react';

const Dock: React.FC = () => {
    const windowManager = useWindowManager();
    const dockApplications = windowManager.dockApplications;
    const minimizedWindows = windowManager.minimizedWindows;

    return (
        <div className="flex items-center justify-between gap-3 h-full px-4 bg-white/20 backdrop-blur-xs">
            <div className="flex items-end gap-2">
                {dockApplications.map((app: CreateWindowProps) => (
                    <Tooltip key={app.id} content={app.title} showArrow={true}>
                        <div
                            className="bg-white rounded-lg overflow-hidden"
                            key={app.id}
                            data-window-target={app.id}
                            onClick={() => windowManager.registerWindow(app)}
                        >
                            <div
                                className="cursor-pointer hover:bg-white/80 bg-white h-7 p-0"
                                style={{ aspectRatio: 1 }}
                            >
                                <img
                                    src={app.icon}
                                    alt={app.title}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    </Tooltip>
                ))}
            </div>
            {minimizedWindows.length > 0 && (
                <>
                    <div className="h-[60%] rounded-xl w-0.75 bg-white/30"></div>
                    <div className="flex items-end gap-2">
                        {minimizedWindows.map((w) => (
                            <Tooltip key={w.id} content={w.title} showArrow={true}>
                                <div
                                    className="bg-white rounded"
                                    data-window-target={w.id}
                                    onClick={() => {
                                        windowManager.updateWindow(w.id, { isMinimized: false });
                                        windowManager.bringToFront(w.id);
                                    }}
                                >
                                    <div
                                        className="cursor-pointer hover:bg-white/80 bg-white h-7 p-0 rounded overflow-hidden"
                                        style={{ aspectRatio: 1 }}
                                    >
                                        <img
                                            src={w.icon}
                                            alt={w.title}
                                            className="w-full h-full rounded-md object-contain"
                                        />
                                    </div>
                                </div>
                            </Tooltip>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Dock;
