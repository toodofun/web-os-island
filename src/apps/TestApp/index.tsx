import React from 'react'

const TestApp: React.FC = () => {
    const params = new URLSearchParams(window.location.search);
    const windowId = params.get('__windowId__');

    const handleClose = () => {
        if (windowId) {
            window.parent.postMessage({
                type: 'windowmanager:openWindow',
                href: 'terminal://' + btoa(JSON.stringify({url: 'ws://localhost:8765'})),
                title: '测试一下终端',
            }, '*')
        }
    };

    return (
        <div onClick={handleClose} className="w-screen h-screen bg-red-300 flex items-center justify-center">
            Hello
        </div>
    )
}

export default TestApp
