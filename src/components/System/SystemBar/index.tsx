import React from "react";
import DateTime from "@/components/System/Common/DateTime";
import {Cog6ToothIcon, SparklesIcon, WifiIcon} from "@heroicons/react/24/outline";

const SystemBar: React.FC = () => {
    return (
        <div className="px-4 py-1 flex items-center justify-between">
            <div>Tos</div>
            <div className="flex items-center gap-4">
                {/* 最小化图标栏 */}
                <div className="flex items-center gap-3">
                    <button onPointerDown={(e) => e.stopPropagation()}
                            className="w-4 h-4 transition rounded-full cursor-pointer">
                        <SparklesIcon
                            className="w-full h-full object-cover font-medium"
                            strokeWidth={2}/>
                    </button>
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
