export interface Settings {
    weatherTypes: WeatherTypes,
    trendLines: Trendlines[],
}

export interface TrendLines {
    key: string,
    name: string,
}

export type WeatherTypeKeys = 'precip'|'temp'|'windspeed'|'cloudcover'|'pressure';

export interface WeatherTypes {
    [key: string]: WeatherTypesProperties,
    WeatherTypeKeys: string,
}

export interface ReportData {
    morning_schedule_id: number | null,
    afternoon_schedule_id: number | null,
    evening_schedule_id: number | null,
    morning_present: number | null,
    afternoon_present: number | null,
    evening_present: number | null,
    date: string,
}

export interface VisualCrossingData {
    days: WeatherData[],
    queryCost: number,
}

export interface WeatherData {
    [key: string],
    datetime: string,
    datetimeEpoch: number,
    tzoffset: number,
    tempmax: number,
    tempmin: number,
    temp: number,
    feelslikemax: number,
    feelslikemin: number,
    feelslike: number,
    dew: number,
    humidity: number,
    precip: number,
    precipprob: null,
    precipcover: number,
    preciptype: null,
    snow: null,
    snowdepth: null,
    windgust: number,
    windspeed: number,
    winddir: number,
    pressure: number,
    cloudcover: number,
    visibility: number,
    solarradiation: number,
    solarenergy: number,
    uvindex: number,
    sunrise: string,
    sunriseEpoch: number,
    sunset: number,
    sunsetEpoch: number,
    moonphase: number,
    conditions: string,
    description: string,
    icon: string,
    stations: Array<string>,
    source: string,
}