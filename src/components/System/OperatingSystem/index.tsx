import React from 'react'
import WindowManager from "@/components/System/WindowManager";
import Desktop from "@/components/System/Desktop";
import Dock from "@/components/System/Dock";
import SystemBar from "@/components/System/SystemBar";

const OperatingSystem: React.FC = () => {
    return (
        <div className="w-screen h-screen overflow-hidden relative">
            <WindowManager>
                <div className="absolute z-10 top-0 left-0 right-0 h-6 text-white mix-blend-difference overflow-hidden">
                    <SystemBar/>
                </div>
                <div className="absolute top-6 bottom-14 z-0 inset-0">
                    <Desktop/>
                </div>
                <div
                    className="absolute z-10 bottom-2 mx-auto right-0 left-0 w-fit rounded-xl overflow-hidden h-12">
                    <Dock/>
                </div>
            </WindowManager>
        </div>
    )
}

export default OperatingSystem
