export interface Paint {
    [key: string],
}

export interface Sketch {
    context: CanvasRenderingContext2D,
    paint: Paint,
    start: () => void,
    stop: () => void,
}

export interface SketchOptions {
    size?: 'full',
    x?: number,
    y?: number,
    w?: number,
    h?: number,
    pos?: 'center'|'absolute',
    rows? : number,
    cols? : number,
    border?: boolean,
    clear?: boolean,
}

export interface Grid {
    properties: {
        width: number,
        height: number,
        xUnits: number,
        yUnits: number,
        unitWidth: number,
        unitHeight: number,
    },
    show: () => void,
}
