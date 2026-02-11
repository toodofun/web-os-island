import '@xterm/xterm/css/xterm.css'
import {type ComponentPropsWithoutRef} from 'react'
import {useXTerm, type UseXTermProps} from './useXTerm.tsx'

export interface XTermProps
    extends Omit<ComponentPropsWithoutRef<'div'>, 'onResize' | 'onScroll'>,
        UseXTermProps {
}

export function XTerm({className = '', options, url, ...props}: XTermProps) {
    const {ref} = useXTerm({
        options,
        url,
    })

    return <div className={className} ref={ref} {...props} />
}

export default XTerm
