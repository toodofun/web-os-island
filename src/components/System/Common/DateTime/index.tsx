import React, {useEffect, useState} from 'react'
import dayjs from "dayjs";
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const DATE_FORMAT = 'M月D日 ddd HH:mm:ss';
const UPDATE_INTERVAL = 200;

const DateTime: React.FC = () => {
    const [currentTime, setCurrentTime] = useState<string>(() =>
        dayjs().format(DATE_FORMAT)
    );

    useEffect(() => {
        // 定时器更新时间
        const timer = setInterval(() => {
            setCurrentTime(dayjs().format(DATE_FORMAT));
        }, UPDATE_INTERVAL);

        // 组件卸载时清除定时器，防止内存泄漏
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="tabular-nums text-sm select-none">
            {currentTime}
        </div>
    )
}

export default DateTime
