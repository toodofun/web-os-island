import type {CreateWindowProps} from '@/components/System/WindowManager/windowManager.type';

const TERMINAL_PROTOCOL = 'terminal://';
const TERMINAL_DEFAULT_ICON = 'https://hexgl.bkcore.com/play/css/title.png';

function resolveTerminalProtocol(href: string): CreateWindowProps | null {
    const payload = href.slice(TERMINAL_PROTOCOL.length);
    if (!payload) return null;
    return {
        id: crypto.randomUUID(),
        title: '终端',
        icon: TERMINAL_DEFAULT_ICON,
        href: `/app/terminal?payload=${encodeURIComponent(payload)}`,
        size: {width: 800, height: 500},
        singleton: false,
    };
}

/** 按协议头分发，将协议 href 转为窗口参数；不支持或解析失败返回 null */
export function resolveProtocolHrefToWindowProps(href: string): CreateWindowProps | null {
    if (!href) return null;
    if (href.startsWith(TERMINAL_PROTOCOL)) return resolveTerminalProtocol(href);
    // 后续协议在此扩展，例如：
    // if (href.startsWith('other://')) return resolveOtherProtocol(href);
    return null;
}
