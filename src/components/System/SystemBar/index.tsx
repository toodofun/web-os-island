import React from "react";
import DateTime from "@/components/System/Common/DateTime";
import {Cog6ToothIcon, SparklesIcon, WifiIcon} from "@heroicons/react/24/outline";
import {Tooltip} from "@heroui/react";
import {useWindowManager} from "@/components/System/WindowManager";
import SystemButton from "@/components/System/Common/SystemButton";

const SystemBar: React.FC = () => {
    const windowManager = useWindowManager();
    return (
        <div className="px-4 py-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <SystemButton/>
                <div>{windowManager.getActiveWindow()?.title || 'TOS'}</div>
            </div>
            <div className="flex items-center gap-4">
                {/* 最小化图标栏 */}
                <div className="flex items-center gap-3">
                    <Tooltip content="智能助手" showArrow>
                        <button onPointerDown={(e) => e.stopPropagation()}
                                className="w-4 h-4 transition rounded-full cursor-pointer">
                            <SparklesIcon
                                className="w-full h-full object-cover font-medium"
                                strokeWidth={2}/>
                        </button>
                    </Tooltip>
                    <button onPointerDown={(e) => e.stopPropagation()}
                            className="w-4 h-4 transition rounded-full cursor-pointer">
                        <Cog6ToothIcon
                            className="w-full h-full object-cover font-medium"
                            strokeWidth={2}/>
                    </button>
                    <button onPointerDown={(e) => e.stopPropagation()}
                            className="w-4 h-4 transition rounded-full cursor-pointer">
                        <WifiIcon
                            className="w-full h-full object-cover font-medium"
                            strokeWidth={2}/>
                    </button>
                </div>
                {/* 系统信息 */}
                <div className="flex items-center gap-3">
                    <DateTime/>
                </div>
            </div>
        </div>
    )
}

export default SystemBar
