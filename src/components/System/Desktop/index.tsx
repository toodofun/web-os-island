import React, {useEffect} from 'react'
import Wallpaper from "@/components/System/Desktop/Wallpaper";
import {useWindowManager} from "@/components/System/WindowManager";
import Application from "@/components/System/Application";
import Loading from "@/components/Common/Loading";

const Desktop: React.FC = () => {
    const windowsManager = useWindowManager()

    useEffect(() => {
        windowsManager.registerWindow("123", {
            title: "测试应用",
            icon: "https://hexgl.bkcore.com/play/css/title.png",
            children: <Application type={'builtin'} children={<Loading/>}/>,
        })
        windowsManager.registerWindow("1232", {
            title: "原神",
            icon: "https://i04piccdn.sogoucdn.com/a72804451f0e9825",
            // size: {width: 1440, height: 900},
            children: <Application type={'third'} href="https://genshin.titlecan.cn/"/>,
        })
    }, [])

    return (
        <>
            <Wallpaper src="https://img-baofun.zhhainiao.com/market/5/381773.mp4" type="video"/>
        </>
    )
}
export default Desktop
