import React from 'react'
import WindowManager from "@/components/System/WindowManager";
import Desktop from "@/components/System/Desktop";

const OperatingSystem: React.FC = () => {
    return (
        <div className="w-screen h-screen overflow-hidden">
            <WindowManager>
                <Desktop/>
            </WindowManager>
        </div>
    )
}

export default OperatingSystem
