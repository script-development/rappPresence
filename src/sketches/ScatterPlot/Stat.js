/**
 * @typedef {import("types/graph").Stat} Stat
 * @typedef {import('types/graph').GraphData} GraphData
 * @typedef {import('types/sketches').Sketch} SketchAPI
 * @typedef {import('types/graph').Graph["xUnits"]} xUnits
 * @typedef {import('types/graph').Graph["yUnits"]} yUnits
 */

/** set to id of selected stat (mouse hover), else -1 */
let insideId = -1;

/** @type {CanvasRenderingContext2D} */
let ctx;

/** @type {import("types/sketches").Globals} */
let globals;

/** @type {Array<Stat>} */
let stats = [];

/**
 * Create Statistic objects from x & y-axis data
 * @param {GraphData} dataX
 * @param {GraphData} dataY
 * @param {SketchAPI} sketch
 * @returns {Array<Stat>}
 */
export const setStats = (dataX, dataY, sketch) => {
    stats = [];
    globals = sketch.globals;
    ctx = sketch.context;
    let id = 1;
    dataY.data.forEach(y => {
        const x = dataX.data.find(x => x.date === y.date);
        if (!x) return;
        stats.push(makeStat(x.value, y.value, y.date, id));
        id++;
    });
    return stats;
};

/**
 * @param {xUnits} xUnits
 * @param {yUnits} yUnits
 */
export const setStatsPosition = (xUnits, yUnits) => {
    stats.forEach(stat => {
        stat.pos.x = getPos(xUnits.max, xUnits.min, xUnits.unitMin, xUnits.length, stat.valueX);
        stat.pos.y = getPos(yUnits.max, yUnits.min, yUnits.unitMin, yUnits.length, stat.valueY);
    });
};

/**
 * @param {number} valueX
 * @param {number} valueY
 * @param {string} date
 * @param {number} id
 * @returns {Stat}
 */
const makeStat = (valueX, valueY, date, id) => {
    const color = [0, 100, 0];
    const pos = {x: 0, y: 0};
    const radius = 5;

    return {
        valueX,
        valueY,
        date,
        pos,
        update: () => update(id, color, pos, radius),
        show: () => show(color, pos, radius),
        selected: () => showSelected(),
    };
};

/**
 * @param {number} max
 * @param {number} min
 * @param {number} unitMin
 * @param {number} length
 * @param {number} stat
 */
const getPos = (max, min, unitMin, length, stat) => {
    const range = max - min;
    const leftOver = stat - min;
    const posPercentage = leftOver / range;
    const posLength = posPercentage * length;
    return posLength + unitMin;
};

/**
 * @param {{x: number, y: number}} pos
 * @param {number} radius
 */
const mouseInside = (pos, radius) =>
    Math.sqrt(Math.pow(globals.mouseX - pos.x, 2) + Math.pow(globals.mouseY - pos.y, 2)) < radius;

/**
 * @param {number} id
 * @param {Array<number>} color
 * @param {{x: number, y: number}} pos
 * @param {number} radius
 * @returns {number}
 */
const update = (id, color, pos, radius) => {
    if (insideId === id) {
        if (!mouseInside(pos, radius)) {
            insideId = -1;
            color[0] = 0;
            return -1;
        }
    } else if (insideId < 0 && mouseInside(pos, radius)) {
        insideId = id;
        color[0] = 255;
        return id;
    }
    return insideId;
};

const showSelected = () => {
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'magenta';
    ctx.beginPath();
    ctx.moveTo(globals.mouseX, globals.mouseY);
    ctx.lineTo(globals.mouseX + 30, globals.mouseY - 30);
    ctx.stroke();
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.rect(globals.mouseX + 30, globals.mouseY - 110, 200, 80);
    ctx.fill();
    ctx.stroke();
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
