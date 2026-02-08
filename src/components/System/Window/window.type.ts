export interface WindowPosition {
    x: number;
    y: number;
}

export interface WindowSize {
    width: number;
    height: number;
}

export interface MinimizeTarget extends WindowPosition, WindowSize {
}

export type ResizeDirection = 'e' | 's' | 'se' | 'sw' | 'w' | 'nw' | 'n' | 'ne'

