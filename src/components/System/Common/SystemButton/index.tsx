import React from "react";
import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@heroui/react";
import {CogIcon} from "@heroicons/react/24/outline";

const SystemButton: React.FC = () => {
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
            <DropdownMenu aria-label="系统控制" onAction={(key) => console.log(key)}>
                <DropdownItem key="about" showDivider>关于本机</DropdownItem>
                <DropdownItem key="setting">系统设置</DropdownItem>
                <DropdownItem key="app-store" showDivider>应用商店</DropdownItem>
                <DropdownItem key="logout" className="text-danger" color="danger">
                    锁定屏幕
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}

export default SystemButton
