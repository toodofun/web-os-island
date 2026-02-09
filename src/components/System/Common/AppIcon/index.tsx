import React from "react";

export interface AppIconProps {
    icon: string;
    size?: number;
    title: string;
    onClick?: () => void;
    onContextMenu?: (e: React.MouseEvent) => void;
}

const AppIcon: React.FC<AppIconProps> = (
    {
        icon,
        size = 80,
        title,
        onClick,
        onContextMenu,
    }) => {
    return (
        <div
            className="flex flex-col gap-0.75 items-center justify-start cursor-pointer active:opacity-80 hover:opacity-90 transition-opacity bg-transparent overflow-hidden rounded-lg outline-none aspect-square"
            style={{
                width: size,
            }}
            onClick={() => onClick?.()}
            onContextMenu={(e) => onContextMenu?.(e)}
        >
            <div className="flex items-center justify-center bg-slate-100 rounded-xl overflow-hidden aspect-square"
                 style={{width: size * 0.7}}>
                <img alt={title} src={icon}/>
            </div>
            <div
                className="text-xs font-medium truncate w-full text-center leading-tight text-white mix-blend-difference">
                {title}
            </div>
        </div>
    )
}

export default AppIcon;
