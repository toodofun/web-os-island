import {type ITerminalInitOnlyOptions, type ITerminalOptions, Terminal,} from '@xterm/xterm'
import {useEffect, useRef, useState} from 'react'
import {FitAddon} from 'xterm-addon-fit'
import {AttachAddon} from 'xterm-addon-attach'
import {SerializeAddon} from 'xterm-addon-serialize'
import {Unicode11Addon} from 'xterm-addon-unicode11'
import {WebLinksAddon} from 'xterm-addon-web-links'

export interface UseXTermProps {
    url: string
    options?: ITerminalOptions & ITerminalInitOnlyOptions
}

export function useXTerm({options, url}: UseXTermProps) {
    const terminalRef = useRef<HTMLDivElement>(null)
    const [terminalInstance, setTerminalInstance] = useState<Terminal | null>(
        null
    )
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (terminalInstance) return
        const instance = new Terminal({
            fontFamily:
                'operator mono,SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace',
            fontSize: 14,
            theme: {
                background: '#101420',
            },
            convertEol: true,
            cursorWidth: 2,
            screenReaderMode: true,
            rightClickSelectsWord: true,
            cursorStyle: 'bar',
            cursorBlink: true,
            allowProposedApi: true,
            ...options,
        })

        const fitAddon = new FitAddon()
        let ws: WebSocket | null = null

        const resizeTerm = () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(
                    JSON.stringify({
                        operate: 'resize',
                        cols: instance.cols,
                        rows: instance.rows,
                    })
                )
            }
        }

        const onResize = () => {
            fitAddon.fit()
            resizeTerm()
            fitAddon.fit()
        }

        const initTerminal = () => {
            const attachAddon = new AttachAddon(ws as WebSocket)
            const serializeAddon = new SerializeAddon()
            const unicode11Addon = new Unicode11Addon()
            const webLinksAddon = new WebLinksAddon()

            instance.loadAddon(attachAddon)
            instance.loadAddon(fitAddon)
            instance.loadAddon(serializeAddon)
            instance.loadAddon(unicode11Addon)
            instance.loadAddon(webLinksAddon)
            instance.open(terminalRef.current as HTMLDivElement)
            instance.focus()
            onResize()
        }

        const initSocket = () => {
            ws = new WebSocket(url)

            instance.onKey((e) => {
                // ctrl+v
                if (e.key === '\x16') {
                    navigator.clipboard.readText().then((t) => {
                        ws?.send(t)
                    })
                } else if (e.key === '\x03' && instance.hasSelection()) {
                    navigator.clipboard.writeText(instance.getSelection())
                    instance.clearSelection()
                    e.domEvent.stopPropagation()
                } else {
                    // Nothing
                }
            })

            ws.onopen = () => {
                initTerminal()
                setLoading(false)
            }

            ws.onclose = () => {
                instance.writeln('connection closed')
            }

            ws.onerror = () => {
                instance.dispose()
                initSocket()
            }

            const resizeObserver = new ResizeObserver(onResize)
            if (terminalRef.current) {
                resizeObserver.observe(terminalRef.current)
            }

            return () => {
                resizeObserver.disconnect()
            }
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTerminalInstance(instance)

        const cleanupSocket = initSocket()

        return () => {
            cleanupSocket()
            ws?.close()
            instance.dispose()
            setTerminalInstance(null)
        }
    }, [terminalRef, options, url])

    return {
        ref: terminalRef,
        loading: loading,
        instance: terminalInstance,
    }
}
