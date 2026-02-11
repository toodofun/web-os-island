import React, {useEffect, useRef, useState} from 'react';

import Loading from '@/components/Common/Loading';

export interface ApplicationProps {
    type: 'builtin' | 'third';
    href?: string;
    /** 当前窗口 id，会以 query 注入 iframe src，供子应用通过 postMessage 关闭窗口等 */
    windowId?: string;
    children?: React.ReactNode;
}

function buildIframeSrc(href: string, windowId?: string): string {
    if (!windowId) return href;
    try {
        const url = new URL(href, window.location.origin);
        url.searchParams.set('__windowId__', windowId);
        return url.toString();
    } catch {
        return href + (href.includes('?') ? '&' : '?') + `__windowId__=${encodeURIComponent(windowId)}`;
    }
}

const Application: React.FC<ApplicationProps> = ({type = 'builtin', href, windowId, children}) => {
    const [isIframeLoading, setIsIframeLoading] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (type !== 'third' || !href || !iframeRef.current) return;

        const observer = new MutationObserver(mutations => {
            if (mutations.length > 0 && isIframeLoading) {
                setIsIframeLoading(false);
                observer.disconnect();
            }
        });

        const handleIframeLoadStart = () => {
            try {
                const iframeDoc = iframeRef.current?.contentDocument;
                if (iframeDoc) {
                    observer.observe(iframeDoc, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                    });
                }
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                console.debug('跨域 iframe，使用 onLoad 事件降级处理');
            }
        };

        handleIframeLoadStart();

        const timeout = setTimeout(() => {
            if (isIframeLoading) {
                setIsIframeLoading(false);
                observer.disconnect();
            }
        }, 10000);

        return () => {
            observer.disconnect();
            clearTimeout(timeout);
        };
    }, [type, href, isIframeLoading]);

    const handleIframeLoad = () => {
        if (isIframeLoading) {
            setIsIframeLoading(false);
        }
    };

    const handleIframeError = () => {
        setIsIframeLoading(false);
        console.error('Iframe 加载失败:', href);
    };

    return (
        <div className='relative h-full w-full bg-slate-300/60 backdrop-blur-xs'>
            {type === 'builtin' && children}

            {type === 'third' && (
                <>
                    {isIframeLoading && (
                        <div className='absolute inset-0 z-10 flex items-center justify-center bg-slate-300/70'>
                            <Loading/>
                        </div>
                    )}

                    {/* iframe 内容 */}
                    <iframe
                        ref={iframeRef}
                        className='h-full w-full will-change-auto select-none'
                        allow='camera;microphone;clipboard-write;clipboard-read;'
                        sandbox='allow-same-origin allow-scripts allow-popups allow-forms allow-storage-access-by-user-activation allow-downloads'
                        referrerPolicy='origin'
                        src={href ? buildIframeSrc(href, windowId) : undefined}
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                        loading='eager'
                    ></iframe>
                </>
            )}
        </div>
    );
};

export default Application;
