import React, {useMemo} from 'react'
import {useSearchParams} from 'react-router-dom'
import {useXTerm} from '@/components/Common/Terminal'

function parsePayloadToWsUrl(payloadEncoded: string | null): string | null {
    if (!payloadEncoded) return null
    try {
        const raw = atob(decodeURIComponent(payloadEncoded))
        const data = JSON.parse(raw) as { url?: string }
        if (typeof data?.url === 'string' && (data.url.startsWith('ws://') || data.url.startsWith('wss://'))) {
            return data.url
        }
        return null
    } catch {
        return null
    }
}

const Terminal: React.FC = () => {
    const [searchParams] = useSearchParams()
    const payload = searchParams.get('payload')

    const url = useMemo(() => {
        const parsed = parsePayloadToWsUrl(payload)
        return parsed ?? 'ws://localhost:8765'
    }, [payload])

    const {ref} = useXTerm({url})

    return (
        <div
            ref={ref}
            className="h-full w-full bg-[#101420] box-border overflow-hidden"
        />
    )
}

export default Terminal
