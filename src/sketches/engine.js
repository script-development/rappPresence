/** @type {{id: string, update: (deltaTime: number) => void}[]} */
export const updates = [];

/** @type {{id: string, show: (interpolate: number) => void}[]} */
export const render = [];

// mainloop
let maxFPS = 120;
let step = 1000 / maxFPS;
let delta = 0;
let lastTimeStamp = 0;
let interpolate = 0;

// start/stop
let requestID = 0;
let running = false;
let started = false;

// logs
let updateCount = 0; // panic counter
let totalUpdates = 0;
let totalFrames = 0;
let returns = 0;

// calculate FPS
let actualFPS = 0;
let lastFPSUpdate = 0;
let framesThisSecond = 0;

/** @param {DOMHighResTimeStamp} timeStamp */
const mainLoop = timeStamp => {
    requestID = requestAnimationFrame(mainLoop);
    // throttle FPS
    if (timeStamp < lastTimeStamp + 1000 / maxFPS) {
        returns++;
        return;
    }
    delta += timeStamp - lastTimeStamp;
    lastTimeStamp = timeStamp;

    calculateFPS(timeStamp);
    simulate();

    interpolate = delta / step;
    for (let i = 0; i < render.length; i++) render[i].show(interpolate);
};

const simulate = () => {
    updateCount = 0;
    while (delta >= step) {
        totalUpdates++;
        for (let i = 0; i < updates.length; i++) updates[i].update(step); // initial render
        delta -= step;
        // spiral of death prevention
        if (++updateCount >= 240) {
            delta = 0;
            break;
        }
    }
};

/** @param {DOMHighResTimeStamp} timeStamp */
const calculateFPS = timeStamp => {
    if (timeStamp > lastFPSUpdate + 100) {
        actualFPS = 0.25 * framesThisSecond + (1 - 0.25) * actualFPS;
        lastFPSUpdate = timeStamp;
        framesThisSecond = 0;
    }
    framesThisSecond++;
    totalFrames++;
};

const start = () => {
    if (!started) {
        started = true; // prevent requesting multiple frames
        requestID = requestAnimationFrame(timeStamp => {
            for (let i = 0; i < render.length; i++) render[i].show(interpolate); // initial render
            running = true;
            lastTimeStamp = timeStamp;
            lastFPSUpdate = timeStamp;
            framesThisSecond = 0;

            requestID = requestAnimationFrame(mainLoop);
        });
    }
};

const stop = () => {
    running = false;
    started = false;
    cancelAnimationFrame(requestID);
};

/**
 * @param {{id: string, show: (interpolate: number) => void}} obj
 * @returns {number} the length of the render array
 */
export const setRender = obj => render.push(obj);

/** @param {string} id */
export const unsetRender = id => {
    const index = render.findIndex(obj => obj.id === id);
    if (index != -1) render.splice(index, 1);
};

/** @param {{id: string, update: (interpolate: number) => void}} obj */
export const setUpdate = obj => updates.push(obj);

export default {
    start: () => start(),
    stop: () => stop(),
    running: () => running,
    frameCount: () => totalFrames,
    updateCount: () => totalUpdates,
    returnCount: () => returns,
    /** @param {number} [fps] */
    frameRate: fps => frameRate(fps),
};

/** @param {number} [fps] */
const frameRate = fps => {
    if (fps != undefined) {
        maxFPS = fps;
        step = 1000 / fps;
        return;
    }
    return (actualFPS * 10).toFixed(0);
};
