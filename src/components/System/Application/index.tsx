import React from 'react'

export interface ApplicationProps {
    type: 'builtin' | 'third'
    href?: string
    children?: React.ReactNode
}

const Application: React.FC<ApplicationProps> = (
    {
        type = 'builtin',
        href,
        children,
    }
) => {
    return (
        <div className="bg-slate-100/20 w-full h-full">
            {type === 'builtin' && children}
            {type === 'third' && (
                <iframe
                    className="w-full h-full will-change-auto select-none"
                    allow="camera;microphone;clipboard-write;clipboard-read;"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-storage-access-by-user-activation allow-downloads"
                    referrerPolicy="origin"
                    src={href}
                ></iframe>
            )}
        </div>
    )
}

export default Application
