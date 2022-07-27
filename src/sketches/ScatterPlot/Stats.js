/**
 * @typedef {import("types/graph").Stat} Stat
 * @typedef {import('types/graph').GraphData} GraphData
 * @typedef {import('types/sketches').Sketch} SketchAPI
 */
import {setRender, unsetRender} from 'sketches/engine';
import {ref} from 'vue';
import {elements} from './Graph';
import {linearRegression} from './regression';
import {regressionLoess} from 'd3-regression';

/** @type {CanvasRenderingContext2D} */
let ctx;

/** @type {Array<Stat>} */
const stats = [];

/** @type {import('@vue/runtime-core').Ref<boolean>} */
export const statsActive = ref(false);

/** @type {GraphData} */
let dataX;

/** @type {GraphData} */
let dataY;

/** @type {import('types/sketches').Paint} */
let paint;

/**
 * Create Statistic objects from x & y-axis data
 * @param {SketchAPI} sketch
 */
export const createStats = sketch => {
    ctx = sketch.context;
    paint = sketch.paint;
    setRender({
        id: 'stats',
        show: () => {
            for (const stat of stats) stat.show();
        },
    });
};

/** @param {GraphData} data */
export const setStatsX = data => {
    dataX = data;
    makeStats();
};

/** @param {GraphData} data */
export const setStatsY = data => {
    dataY = data;
    makeStats();
};

const getLinearRegressionData = () => {
    /** @type {Array<{x: number, y: number}>} */
    const data = [];
    stats.forEach(stat => data.push({x: stat.valueX, y: stat.valueY}));
    return data;
};

/** @param {import('types/sketches').Paint} paint */
const showRegression = paint => paint.line(regressionElement);

/** @type {import('types/graph').GraphLineElement} */
const regressionElement = {
    pos: {x1: 0, y1: 0, x2: 0, y2: 0},
    color: 'red',
    weight: 2,
    paint: 'line',
};

const showLinearRegression = () => {
    regressionElement.pos.x1 = elements.x.pos.x1;
    regressionElement.pos.x2 = elements.x.pos.x2;
    const data = getLinearRegressionData();
    const regression = linearRegression(data);
    const yValue1 = regression(elements.xUnits.min);
    const yValue2 = regression(elements.xUnits.max);
    regressionElement.pos.y1 = getPosY(elements.yUnits, yValue1);
    regressionElement.pos.y2 = getPosY(elements.yUnits, yValue2);
    setRender({
        id: 'linear-regression',
        show: () => showRegression(paint),
    });
};

let bandwidth = 0.3; // [default] smoothing parameter

const showLoessRegression = () => {
    const regressionGenerator = regressionLoess()
        // @ts-ignore no type declaration available for d3-regression package
        .x(d => d.valueX)
        // @ts-ignore no type declaration available for d3-regression package
        .y(d => d.valueY)
        .bandwidth(bandwidth);
    const lines = regressionGenerator(stats);
    /** @type {import('types/graph').GraphLineElement[]} */
    const linesConverted = [];
    for (let i = 0; i < lines.length - 1; i++) {
        linesConverted.push({
            pos: {
                x1: getPosX(elements.xUnits, lines[i][0]),
                y1: getPosY(elements.yUnits, lines[i][1]),
                x2: getPosX(elements.xUnits, lines[i + 1][0]),
                y2: getPosY(elements.yUnits, lines[i + 1][1]),
            },
            color: 'orange',
            weight: 2,
            paint: 'line',
        });
    }
    setRender({
        id: 'loess-regression',
        show: () => linesConverted.forEach(el => paint.line(el)),
    });
};

/** @type {HTMLElement} */
let span;

/** @type {HTMLInputElement} */
let slider;

/**
 * @param {"linearRegression"|"loessRegression"|"none"} newKey
 * @param {"linearRegression"|"loessRegression"|"none"} oldKey
 */
export const changeRegression = (newKey, oldKey) => {
    if (oldKey != 'none') {
        if (oldKey === 'loessRegression') {
            // remove slider and reset bandwidth
            document.body.removeChild(span);
            document.body.removeChild(slider);
            // optional: remove to keep value after selection changes or make it an option
            bandwidth = 0.3;
        }
        unsetRender(oldKey);
    }
    if (newKey != 'none') setRegression(newKey);
};

/** @param {"linearRegression"|"loessRegression"} type */
const setRegression = type => {
    if (type === 'linearRegression') showLinearRegression();
    if (type === 'loessRegression') {
        showLoessRegression();

        // create slider
        span = document.createElement('span');
        slider = document.createElement('input');
        Object.assign(slider, {
            type: 'range',
            min: 0,
            max: 1,
            step: 0.01,
            class: 'slider',
            id: 'myRange',
        });
        slider.value = '0.3';
        slider.className = 'absolute bottom-22 mb-24 xl:w-96 z-1';
        span.innerHTML = `bandwidth: ${slider.value}`;
        span.className = 'absolute bottom-18 mb-24 xl:w-96 z-1';
        slider.addEventListener('input', evt => {
            const target = /** @type {HTMLInputElement} */ (evt.target);
            span.innerHTML = `bandwidth: ${target.value}`;
            bandwidth = parseFloat(target.value);
            unsetRender('loess-regression');
            showLoessRegression();
        });
        document.body.appendChild(slider);
        document.body.appendChild(span);
    }
};

/**
 * Create all statistics objects from x-axis & y-axis data
 */
const makeStats = () => {
    if (!dataX || !dataY) return;
    stats.length = 0;
    let id = 1;
    // color and radius hardcoded for the moment
    const color = [0, 100, 0];
    const radius = 4;
    dataY.data.forEach(y => {
        const x = dataX.data.find(x => x.date === y.date);
        if (!x) return;
        const pos = {
            x: getPosX(elements.xUnits, x.value),
            y: getPosY(elements.yUnits, y.value),
        };
        stats.push(Statistic(pos, x.value, y.value, y.date, id, color, radius));
        id++;
    });
    statsActive.value = true;
};

/**
 * @param {{x: number, y: number}} pos
 * @param {number} valueX
 * @param {number} valueY
 * @param {string} date
 * @param {number} id
 * @param {Array<number>} color
 * @param {number} radius
 * @returns {Stat}
 */
const Statistic = (pos, valueX, valueY, date, id, color, radius) => ({
    valueX,
    valueY,
    date,
    pos,
    id,
    update: () => update(),
    show: () => show(color, pos, radius),
});

/**
 * @param {import('types/graph').GraphUnitsElement} unitsElement
 * @param {number} statValue
 */
const getPosX = (unitsElement, statValue) => {
    const range = unitsElement.max - unitsElement.min;
    const leftOver = statValue - unitsElement.min;
    const posPercentage = leftOver / range;
    const posLength = posPercentage * unitsElement.lengthX;
    return posLength + unitsElement.startX;
};

/**
 * @param {import('types/graph').GraphUnitsElement} unitsElement
 * @param {number} statValue
 */
const getPosY = (unitsElement, statValue) => {
    const range = unitsElement.max - unitsElement.min;
    const leftOver = statValue - unitsElement.min;
    const posPercentage = leftOver / range;
    const posLength = posPercentage * unitsElement.lengthY;
    return posLength + unitsElement.startY;
};

const update = () => {
    //
};

/**
 * @param {Array<number>} color
 * @param {{x: number, y: number}} pos
 * @param {number} radius
 */
const show = (color, pos, radius) => {
    ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fill();
};
