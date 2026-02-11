import React from "react";
import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@heroui/react";
import {CogIcon} from "@heroicons/react/24/outline";
import {useWindowManager} from "@/components/System/WindowManager";

const SystemButton: React.FC = () => {
    const windowManager = useWindowManager();
    return (
        <Dropdown>
            <DropdownTrigger>
                <div className="w-5 h-5 cursor-pointer transition hover:opacity-80">
                    <CogIcon
                        className="w-full h-full object-cover"
                        strokeWidth={2}
                    />
                </div>
            </DropdownTrigger>
            <DropdownMenu aria-label="系统控制" onAction={(key) => {
                console.log(key)
                switch (key) {
                    case "clear-window-cache": {
                        windowManager.clearWindowCache();
                        break
                    }
                }
            }}>
                <DropdownItem key="about" showDivider>关于本机</DropdownItem>
                <DropdownItem key="setting">系统设置</DropdownItem>
                <DropdownItem key="app-store" showDivider>应用商店</DropdownItem>
                <DropdownItem key="clear-window-cache" showDivider
                              description="关闭已经打开的应用">重启TOS</DropdownItem>
                <DropdownItem key="logout" className="text-danger" color="danger">
                    锁定屏幕
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}

export default SystemButton
