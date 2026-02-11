import React, {useMemo} from 'react'
import {useXTerm} from "@/components/Common/Terminal";

const TestTerminal: React.FC<{
    id: string
    pod: string
    namespace: string
    container: string
}> = ({id, pod, container, namespace}) => {
    const url = useMemo((): string => {
        return `${location.protocol === 'http:' ? 'ws' : 'wss'}://${window.location.hostname}:${
            window.location.port
        }/api/v1/cluster/${id}/terminal?pod=${pod}&namespace=${namespace}&container=${container}`
    }, [container, id, namespace, pod])

    const {ref} = useXTerm({url: "ws://localhost:8765"})

    return (
        <div
            ref={ref}
            className="h-full w-full bg-[#101420] box-border overflow-hidden"
        ></div>
    )
}

export default TestTerminal
