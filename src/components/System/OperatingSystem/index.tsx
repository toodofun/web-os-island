import React from 'react'
import WindowManager from "@/components/System/WindowManager";
import Desktop from "@/components/System/Desktop";
import Dock from "@/components/System/Dock";

const OperatingSystem: React.FC = () => {
    return (
        <div className="w-screen h-screen overflow-hidden relative">
            <WindowManager>
                <div className="absolute z-10 bottom-2 mx-auto right-0 left-0 w-fit rounded-xl overflow-hidden h-10">
                    <Dock/>
                </div>
                <div className="absolute z-0 inset-0">
                    <Desktop/>
                </div>
            </WindowManager>
        </div>
    )
}

export default OperatingSystem
