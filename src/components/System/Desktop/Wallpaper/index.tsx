import React from "react";

interface WallpaperProps {
    src: string
    type?: 'img' | 'video'
}

const Wallpaper: React.FC<WallpaperProps> = (
    {
        src,
        type = "img",
    }) => {
    return (
        <div className="z-0 absolute inset-0">
            {type == 'img' && (
                <img
                    alt="desktop wallpaper image"
                    src={src}
                    className="w-full h-full object-cover"
                />
            )}
            {type == 'video' && (
                <video
                    src={src}
                    muted={true}
                    loop={true}
                    autoPlay={true}
                    className="object-cover absolute inset-0 w-full h-full"
                />
            )}
        </div>
    )
}

export default Wallpaper;
