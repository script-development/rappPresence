/** @typedef {import('types/sketches').SketchOptions} SketchOptions */
/** @typedef {import('types/sketches').Paint} Paint */

import Paint from './paint';
import engine from './engine';
import {setRender} from './engine';

/**
 * Make a new Sketch API for a canvas element
 * @param {string} id the id of the canvas element
 * @param {SketchOptions} [options]
 * @returns {import('types/sketches').Sketch}
 */
export default (id, options) => {
    const context = getContext(id);
    const paint = Paint(context);
    if (options) setOptions(options, context.canvas, paint);
    return {
        context,
        paint,
        start: () => engine.start(),
        stop: () => engine.stop(),
    };
};

/**
 * get canvas element and extract context2D
 * @param {string} id canvas element id
 * @returns {CanvasRenderingContext2D}
 */
const getContext = id => {
    const canvas = document.getElementById(id);
    if (canvas === null) throw new Error(`HTMLCanvasElement with id ${id} not found`);
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error(`HTMLElement with id ${id} is not a canvas`);

    const context = canvas.getContext('2d');
    if (!context) throw new Error(`CanvasRenderingContext2D not found on HTMLCanvasElement with id ${id}`);

    return context;
};

/**
 * @param {SketchOptions} options
 * @param {HTMLCanvasElement} canvas
 * @param {Paint} paint
 */
const setOptions = (options, canvas, paint) => {
    setXYWH(options, canvas);
    if (options.size) setSize(options.size, canvas);
    if (options.pos) setPos(options.pos, canvas);
    if (options.border) canvas.style.border = '1px solid black';
    if (options.clear) setClear(paint);
};

/**
 * @param {SketchOptions} options
 * @param {HTMLCanvasElement} canvas
 */
const setXYWH = ({x, y, w, h}, canvas) => {
    if (x) canvas.style.left = x + 'px';
    if (y) canvas.style.height = y + 'px';
    if (w) canvas.width = w;
    if (h) canvas.height = h;
};

/**
 * @param {SketchOptions["size"]} size
 * @param {HTMLCanvasElement} canvas
 */
const setSize = (size, canvas) => {
    if (size === 'full') {
        canvas.style.position = 'absolute';
        canvas.style.top = '0px';
        canvas.style.left = '0px';
        canvas.width = innerWidth;
        canvas.height = innerHeight;
    }
};

/**
 * @param {SketchOptions["pos"]} pos
 * @param {HTMLCanvasElement} canvas
 */
const setPos = (pos, canvas) => {
    if (pos === 'absolute') canvas.style.position = 'absolute';
    if (pos === 'center') {
        canvas.style.position = 'absolute';
        canvas.style.left = (innerWidth - canvas.width) / 2 + 'px';
        canvas.style.top = (innerHeight - canvas.height) / 2 + 'px';
    }
};

/**
 * This must always be the first render in the engine (sketch has to be made before anything else)
 * @param {import('types/sketches').Paint} paint
 */
const setClear = paint => {
    setRender({
        id: 'clear',
        show: () => paint.clear(),
    });
};
