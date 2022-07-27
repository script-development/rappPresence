/* eslint-env node */

import {renderPage} from 'vite-plugin-ssr';
import express from 'express';
import vite from 'vite';
import path from 'path';
import {deploy} from './services/serverData.js';
import {getSelectedWeather, getSelectedReports} from './services/clientData.js';

await deploy();

const isProduction = process.env.NODE_ENV === 'production';
const root = path.resolve(path.dirname(''));

(async function startServer() {
    const app = express();

    if (isProduction) {
        app.use(express.static(`${root}/dist/client`));
    } else {
        const viteDevMiddleware = (
            await vite.createServer({
                root,
                server: {middlewareMode: 'ssr'},
            })
        ).middlewares;
        app.use(viteDevMiddleware);
    }

    app.get('/api/weather/:type/:from-:to', async (req, res) => {
        const requestData = getSelectedWeather(req.params.type, req.params.from, req.params.to);
        res.send(requestData);
    });
    app.get('/api/reports/:from-:to', async (req, res) => {
        const requestData = getSelectedReports(req.params.from, req.params.to);
        res.send(requestData);
    });

    app.get('*', async (req, res, next) => {
        const url = req.originalUrl;
        const pageContextInit = {url};
        const pageContext = await renderPage(pageContextInit);
        const {httpResponse} = pageContext;
        if (!httpResponse) return next();
        const {body, statusCode, contentType} = httpResponse;
        res.status(statusCode).type(contentType).send(body);
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running at http://localhost:${port}`)); // eslint-disable-line no-console
})();
