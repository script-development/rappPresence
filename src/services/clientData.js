/** @typedef {import('types/data.js').ReportData} ReportData */

import {slug2Date} from './dates.js';
import {getData} from './store.js';

/**
 * Get weather data based on weather type and min and max date
 * @param {string} weatherType
 * @param {string} from min date, format: yyyymmdd
 * @param {string} to max date, format: yyyymmdd
 * @returns
 */
export const getSelectedWeather = (weatherType, from, to) =>
    getData('weatherData').reduce(
        (
            /** @type {{date: string, value: number}[]} */ acc,
            /** @type {import('types/data.js').WeatherData} */ weather,
        ) => {
            if (weather.datetime < slug2Date(from) || weather.datetime > slug2Date(to)) return acc;
            acc.push({date: weather.datetime, value: weather[weatherType]});
            return acc;
        },
        [],
    );

/**
 * Get reports from Rapp based on min and max date
 * @param {string} from min date, format: yyyymmdd
 * @param {string} to max date, format: yyyymmdd
 * @returns
 */
export const getSelectedReports = (from, to) =>
    getData('reportData').reduce((/** @type {ReportData[]} */ acc, /** @type {ReportData} */ report) => {
        if (report.date < slug2Date(from) || report.date > slug2Date(to)) return acc;
        acc.push(report);
        return acc;
    }, []);
