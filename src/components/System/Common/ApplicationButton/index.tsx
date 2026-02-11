import React from "react";
import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@heroui/react";
import {useWindowManager} from "@/components/System/WindowManager";

const ApplicationButton: React.FC = () => {
    const windowManager = useWindowManager();
    return windowManager.getActiveWindow()?.title ? (
        <Dropdown>
            <DropdownTrigger>
                <div className="cursor-pointer transition hover:opacity-80">
                    {windowManager.getActiveWindow()?.title || 'TOS'}
                </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="应用控制" onAction={(key) => {
                console.log(key)
                switch (key) {
                    case "close-app": {
                        const id = windowManager.getActiveWindow()?.id
                        if (id) {
                            windowManager.unregisterWindow(id);
                        }
                        break
                    }
                }
            }}>
                <DropdownItem key="close-app" className="text-danger" color="danger">
                    关闭应用
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    ) : (
        <div className="cursor-pointer transition hover:opacity-80">
            {windowManager.getActiveWindow()?.title || 'TOS'}
        </div>
    )
}

export default ApplicationButton
