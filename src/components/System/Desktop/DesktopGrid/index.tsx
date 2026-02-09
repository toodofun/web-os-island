import React, {useEffect, useRef, useState} from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import AppIcon from "@/components/System/Common/AppIcon";
import type {CreateWindowProps} from "@/components/System/WindowManager/windowManager.type.ts";
import {useWindowManager} from "@/components/System/WindowManager";

const CELL_SIZE = 80;
const GAP = 12;

type Props = {
    items?: CreateWindowProps[];
};

function IconCell({
                      item,
                      onOpen,
                  }: {
    item: CreateWindowProps;
    onOpen: () => void;
}) {
    const handleContextMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
    };
    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger asChild>
                <AppIcon onContextMenu={handleContextMenu} onClick={onOpen} key={item.title} icon={item.icon}
                         title={item.title}/>
            </ContextMenu.Trigger>
            <ContextMenu.Portal>
                <ContextMenu.Content
                    className="min-w-35 rounded-lg bg-neutral-800 shadow-xl border border-neutral-600/60 py-1.5 z-50">
                    <ContextMenu.Item
                        className="px-3 py-2 text-sm text-neutral-100 cursor-pointer outline-none rounded mx-1 hover:bg-white/10 data-highlighted:bg-white/10 select-none"
                        onSelect={() => onOpen()}
                    >
                        打开
                    </ContextMenu.Item>
                </ContextMenu.Content>
            </ContextMenu.Portal>
        </ContextMenu.Root>
    );
}

const DesktopGrid = ({items: initialItems = []}: Props) => {
    const windowManager = useWindowManager()
    const wrapRef = useRef<HTMLDivElement>(null);
    const [cols, setCols] = useState(0);
    const [rows, setRows] = useState(0);
    const [applications, setApplications] = useState<CreateWindowProps[]>(initialItems);

    useEffect(() => {
        const updateApplication = () => {
            const desktopApplication = windowManager.getDesktopApplications()
            setApplications(desktopApplication)
        }
        updateApplication()

        const unsubscribe = windowManager.subscribe(updateApplication)
        return () => unsubscribe()
    }, [windowManager]);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;

        const update = () => {
            const w = el.clientWidth;
            const h = el.clientHeight;
            setCols(Math.max(1, Math.floor((w - GAP) / (CELL_SIZE + GAP))));
            setRows(Math.max(1, Math.floor((h - GAP) / (CELL_SIZE + GAP))));
        };

        update();
        const ro = new ResizeObserver(() => requestAnimationFrame(update));
        ro.observe(el);
        const onWindowResize = () => requestAnimationFrame(update);
        window.addEventListener('resize', onWindowResize);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', onWindowResize);
        };
    }, []);

    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger asChild>
                <div
                    ref={wrapRef}
                    className="w-full h-full overflow-hidden px-4 py-6 relative box-border rounded-lg outline-none select-none"
                >
                    <div
                        className="grid h-full max-w-full"
                        style={{
                            gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
                            gridTemplateRows: rows ? `repeat(${rows}, 1fr)` : 'none',
                            gridAutoFlow: 'column',
                            gap: GAP,
                        }}
                    >
                        {applications.map((item) => (
                            <IconCell
                                key={item.id}
                                item={item}
                                onOpen={() => windowManager.registerWindow(item)}
                            />
                        ))}
                    </div>
                </div>
            </ContextMenu.Trigger>
            <ContextMenu.Portal>
                <ContextMenu.Content
                    className="min-w-35 rounded-lg bg-neutral-800 shadow-xl border border-neutral-600/60 py-1.5 z-50">
                    <ContextMenu.Item
                        className="px-3 py-2 text-sm text-neutral-100 cursor-pointer outline-none rounded mx-1 hover:bg-white/10 data-highlighted:bg-white/10 select-none"
                        onSelect={windowManager.refresh}
                    >
                        刷新
                    </ContextMenu.Item>
                </ContextMenu.Content>
            </ContextMenu.Portal>
        </ContextMenu.Root>
    );
};

export default DesktopGrid;
