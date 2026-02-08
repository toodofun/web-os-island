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
        <>
            {type === 'builtin' && children}
            {type === 'third' && (
                <iframe
                    className="w-full h-full will-change-auto"
                    allow="camera;microphone;clipboard-write;clipboard-read;"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-storage-access-by-user-activation allow-downloads"
                    referrerPolicy="origin"
                    src={href}
                ></iframe>
            )}
        </>
    )
}

export default Application
