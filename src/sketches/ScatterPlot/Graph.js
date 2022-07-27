import {Vec4} from 'sketches/vectors';
import {setRender} from '../engine';

/** @typedef {import('types/graph').GraphTextElement} TextElement */
/** @typedef {import('types/graph').GraphUnitsElement} UnitsElement */
/** @typedef {import('types/graph').GraphLineElement} LineElement */
/** @typedef {import('types/graph').GraphElements} Elements */
/** @typedef {"x"|"y"|"yTitle"|"xTitle"|"mainTitle"} GraphShowElementsNonUnits */
/** @typedef {import('types/sketches').Paint} Paint */

const grid = {
    width: 300,
    height: 150,
    xUnits: 32,
    yUnits: 18,
    unitWidth: 300 / 32,
    unitHeight: 150 / 18,
};

/** @param {HTMLCanvasElement} canvas */
const setGrid = canvas => {
    grid.width = canvas.width;
    grid.height = canvas.height;
    grid.unitWidth = canvas.width / 32;
    grid.unitHeight = canvas.height / 18;
};

const defaults = {
    text: {
        text: '',
        size: 24,
        weight: 'normal',
        color: 'black',
        font: 'sans-serif',
        /** @type {CanvasTextAlign} */
        align: 'center',
        /** @type {CanvasTextBaseline} */
        baseline: 'middle',
        /** @type {'text'} */
        paint: 'text',
    },
    units: {
        /** @type {TextElement[]} */
        units: [],
        max: 0,
        min: 0,
        lengthX: 0,
        lengthY: 0,
        startX: 0,
        startY: 0,
        offset: {x1: 0, y1: 0, x2: 0, y2: 0},
    },
};

/** @type {Elements} */
export const elements = {
    x: {
        pos: {x1: 0, y1: 0, x2: 0, y2: 0},
        color: 'black',
        weight: 4,
        paint: 'line',
    },
    y: {
        pos: {x1: 0, y1: 0, x2: 0, y2: 0},
        color: 'black',
        weight: 4,
        paint: 'line',
    },
    xTitle: {
        ...defaults.text,
        pos: {x: 0, y: 0},
    },
    yTitle: {
        ...defaults.text,
        pos: {x: 0, y: 0},
        angle: -Math.PI / 2,
    },
    mainTitle: {
        ...defaults.text,
        text: 'Scatterplot',
        pos: {x: 0, y: 0},
        size: 32,
        weight: 'bold',
    },
    xUnits: {
        ...defaults.units,
    },
    yUnits: {
        ...defaults.units,
    },
};

/**
 * @param {number} x
 * @param {number} y
 * @param {string} text
 */
const Unit = (x, y, text) => ({
    ...defaults.text,
    pos: {x, y},
    text,
    size: 16,
});

const setPositions = () => {
    elements.x.pos = {
        x1: grid.unitWidth * 4,
        y1: grid.unitHeight * 14,
        x2: grid.unitWidth * 28,
        y2: grid.unitHeight * 14,
    };
    elements.y.pos = {
        x1: grid.unitWidth * 4,
        y1: grid.unitHeight * 14,
        x2: grid.unitWidth * 4,
        y2: grid.unitHeight * 4,
    };
    elements.xTitle.pos = {x: grid.unitWidth * 16, y: grid.unitHeight * 16};
    elements.yTitle.pos = {x: grid.unitWidth * 2, y: grid.unitHeight * 9};
    elements.mainTitle.pos = {x: grid.width * 0.5, y: grid.unitHeight * 2};
};

/**
 * Scatter Plot -> TypeX (Weather type (unit of Measurement)) / TypeY (Presence (%))
 * @param {import('types/sketches').Sketch} sketch
 * @returns
 */
export const createGraph = sketch => {
    setGrid(sketch.context.canvas);
    setPositions();
    setUnitOffsets();
    setRender({
        id: 'graph',
        show: () => show(sketch.paint),
    });
};

/** @param {Paint} paint */
const show = paint => {
    // for every element: paint value is type of draw with paint object
    Object.keys(elements).forEach(key => {
        if (key === 'xUnits' || key === 'yUnits') elements[key].units.forEach(el => paint[el.paint](el));
        else showElements(key, paint);
    });
};

/**
 *
 * @param {string} key
 * @param {Paint} paint
 */
const showElements = (key, paint) => {
    const element = elements[key];
    if (element.paint === 'line') paint[element.paint](element);
    else if (element.paint === 'text') paint[element.paint](element);
};

/**
 * X or Y-axis units
 * @param {import('types/vectors').Vec4d} pos
 * @param {number} steps
 * @param {import('types/graph').GraphData["data"]} data
 * @returns
 */
const units = (pos, steps, data) => {
    if (!data) return;
    const max = data.reduce((a, {value}) => Math.max(a, value), 0);
    const min = data.reduce((a, {value}) => Math.min(a, value), max);
    const minRounded = min - (min % steps);
    const maxRounded = max - (max % steps) + steps;
    const range = maxRounded - minRounded;
    const amount = range / steps;

    const units = [];
    for (let i = 0; i <= amount; i++) {
        units.push(
            Unit(
                pos.x1 + ((pos.x2 - pos.x1) / amount) * i,
                pos.y1 + ((pos.y2 - pos.y1) / amount) * i,
                (minRounded + ((maxRounded - minRounded) / amount) * i).toFixed(0),
            ),
        );
    }
    return {
        units,
        min: minRounded,
        max: maxRounded,
        lengthX: pos.x2 - pos.x1,
        lengthY: pos.y2 - pos.y1,
        startX: pos.x1,
        startY: pos.y1,
    };
};

const setUnitOffsets = () => {
    elements.xUnits.offset = {
        x1: grid.unitWidth * 0.25,
        y1: grid.unitHeight * 0.5,
        x2: -grid.unitWidth * 0.25,
        y2: grid.unitHeight * 0.5,
    };
    elements.yUnits.offset = {
        x1: -grid.unitWidth * 0.5,
        y1: -grid.unitHeight * 0.25,
        x2: -grid.unitWidth * 0.5,
        y2: grid.unitHeight * 0.25,
    };
};

/**
 *
 * @param {import('types/graph').GraphData} data
 * @param {TextElement} title
 * @param {LineElement} axis
 * @param {UnitsElement} unit
 */
export const setGraph = (data, title, axis, unit) => {
    title.text = `${data.title} (${data.unitOfMeasure})`;
    elements.mainTitle.text = `Scatterplot voor ${elements.yTitle.text
        .split(' ')[0]
        .toLowerCase()} vs ${elements.xTitle.text.split(' ')[0].toLowerCase()}`;
    const units_ = units(Vec4.add(axis.pos, unit.offset), data.steps, data.data);
    Object.assign(unit, units_);
};
