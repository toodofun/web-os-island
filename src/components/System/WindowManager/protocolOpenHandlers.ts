import type {CreateWindowProps} from '@/components/System/WindowManager/windowManager.type';

const TERMINAL_PROTOCOL = 'terminal://';
const TERMINAL_DEFAULT_ICON = 'https://hexgl.bkcore.com/play/css/title.png';
const TERMINAL_DEFAULT_TITLE = '终端';

/** 协议打开时的可选覆盖（如标题） */
export interface ProtocolOpenOverrides {
    title?: string;
}

function resolveTerminalProtocol(href: string, overrides?: ProtocolOpenOverrides): CreateWindowProps | null {
    const payload = href.slice(TERMINAL_PROTOCOL.length);
    if (!payload) return null;
    return {
        id: crypto.randomUUID(),
        title: overrides?.title ?? TERMINAL_DEFAULT_TITLE,
        icon: TERMINAL_DEFAULT_ICON,
        href: `/app/terminal?payload=${encodeURIComponent(payload)}`,
        size: {width: 800, height: 500},
        singleton: false,
    };
}

/** 按协议头分发，将协议 href 转为窗口参数；overrides 可覆盖标题等；不支持或解析失败返回 null */
export function resolveProtocolHrefToWindowProps(
    href: string,
    overrides?: ProtocolOpenOverrides
): CreateWindowProps | null {
    if (!href) return null;
    if (href.startsWith(TERMINAL_PROTOCOL)) return resolveTerminalProtocol(href, overrides);
    // 后续协议在此扩展，例如：
    // if (href.startsWith('other://')) return resolveOtherProtocol(href, overrides);
    return null;
}
