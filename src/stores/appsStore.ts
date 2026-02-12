import {create} from 'zustand';
import type {CreateWindowProps} from '@/components/System/WindowManager/windowManager.type';

// Mock 接口：后续替换为真实 API
async function fetchDesktopApplications(): Promise<CreateWindowProps[]> {
    // 模拟网络延迟
    await new Promise((r) => setTimeout(r, 300));
    return [
        {
            id: 'hero-icon',
            title: 'HeroIcon',
            icon: 'https://heroicons.com/_next/static/media/apple-touch-icon.822687be.png',
            href: 'https://heroicons.com/outline',
            size: {width: 1440, height: 900}
        },
        {
            id: 'hero-ui',
            title: 'HeroUI',
            icon: 'https://www.heroui.com/apple-touch-icon.png',
            href: 'https://www.heroui.com/docs/components/button',
            size: {width: 1440, height: 900}
        },
        {
            id: 'haowallpaper',
            title: '哲风壁纸',
            icon: 'https://haowallpaper.com/favicon.ico',
            href: 'https://haowallpaper.com/',
            size: {width: 1440, height: 900}
        },
        {
            id: 'youdao',
            title: '有道翻译',
            icon: 'https://ydlunacommon-cdn.nosdn.127.net/31cf4b56e6c0b3af668aa079de1a898c.png',
            href: 'https://fanyi.youdao.com/#/TextTranslate',
            size: {width: 1440, height: 900}
        },
        {
            id: 'doubao',
            title: '豆包',
            icon: 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/chat/favicon.png',
            href: 'https://www.doubao.com/chat/',
            size: {width: 1440, height: 900}
        },
        {
            id: 'relationship',
            title: '亲戚计算器',
            icon: 'https://th.bing.com/th/id/OIP.nfFu7l8TPI6fnX5Fb8bJ_QHaHa?rs=1&pid=ImgDetMain',
            size: {width: 338, height: 600},
            href: 'https://passer-by.com/relationship/vue/#/'
        },
        {
            id: 'genshin',
            title: '原神',
            singleton: true,
            icon: 'https://i04piccdn.sogoucdn.com/a72804451f0e9825',
            href: 'https://genshin.titlecan.cn/'
        },
        {
            id: 'hexgl',
            title: 'HexGL赛车',
            icon: 'https://hexgl.bkcore.com/play/css/title.png',
            size: {width: 1280, height: 720},
            href: 'https://hexgl.bkcore.com/play/'
        },
        {
            id: 'zhongguose',
            title: '中国色',
            icon: 'https://zhongguose.com/apple-touch-icon.png',
            size: {width: 1280, height: 720},
            href: 'https://zhongguose.com/'
        },
        {
            id: 'excalidraw',
            title: 'Excalidraw',
            icon: 'https://excalidraw.com/apple-touch-icon.png',
            size: {width: 1280, height: 720},
            href: 'https://excalidraw.com/'
        },
        {
            id: 'terminal',
            title: '终端',
            icon: '/icons/terminal.svg',
            href: '/app/terminal',
            size: {width: 800, height: 480}
        },
    ];
}

async function fetchDockApplications(): Promise<CreateWindowProps[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [
        {id: 'test', title: '测试应用', icon: 'https://hexgl.bkcore.com/play/css/title.png', href: '/app/test'},
        {id: 'terminal', title: '终端', icon: '/icons/terminal.svg', href: '/app/terminal'},
        {
            id: 'genshin',
            title: '原神',
            singleton: true,
            icon: 'https://i04piccdn.sogoucdn.com/a72804451f0e9825',
            href: 'https://genshin.titlecan.cn/'
        },
    ];
}

interface AppsState {
    desktopApplications: CreateWindowProps[];
    dockApplications: CreateWindowProps[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export const useAppsStore = create<AppsState>((set) => ({
    desktopApplications: [],
    dockApplications: [],
    loading: false,
    error: null,

    refresh: async () => {
        set({loading: true, error: null});
        try {
            const [desktop, dock] = await Promise.all([
                fetchDesktopApplications(),
                fetchDockApplications(),
            ]);
            set({desktopApplications: desktop, dockApplications: dock});
        } catch (e) {
            set({error: e instanceof Error ? e.message : 'Failed to fetch apps'});
        } finally {
            set({loading: false});
        }
    },
}));
