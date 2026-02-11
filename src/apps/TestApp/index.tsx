import React from 'react'

const TestApp: React.FC = () => {
    const params = new URLSearchParams(window.location.search);
    const windowId = params.get('__windowId__');

    const handleClose = () => {
        if (windowId) {
            window.parent.postMessage(
                {type: 'windowmanager:closeWindow', windowId},
                '*'  // 生产环境建议改为具体 origin，如 'https://主应用域名'
            );
        }
    };

    return (
        <div onClick={handleClose} className="w-screen h-screen bg-red-300 flex items-center justify-center">
            Hello
        </div>
    )
}

export default TestApp
