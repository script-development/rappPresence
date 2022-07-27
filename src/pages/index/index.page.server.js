import Settings from 'services/clientSettings';

export {onBeforeRender};

async function onBeforeRender() {
    return {
        pageContext: {
            pageProps: {settings: Settings},
        },
    };
}
