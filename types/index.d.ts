import {PageContextBuiltIn} from 'vite-plugin-ssr';

export interface PageContext extends PageContextBuiltIn{
    documentProps: {
        title: string,
        description: string,
    },
    params: Record<string, string>,
    url: string,
    weatherData: Array<WeatherData>,
    reportData: {
        reportsForMonth: Array<ReportData>,
        message: string,
    },
    weatherOptions: {
        key: string,
        name: string,
        unitOfMeasure: string,
    }
    pageProps: PageProps,
    urlNormalized: string,
    urlParsed: {
        pathName: string,
        search: {
            [key: string]: string,
        } | null,
        hash: string | null,
    },
}

export type ErrorBag = {
    default: string,
    [key: string]: string,
}