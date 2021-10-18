// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createProxyMiddleware } = require("http-proxy-middleware");

/* react-script automatically executes src/setupProxy.js on init. Tasks:

    - Proxy requests from /dhis2/xyz to $REACT_APP_DHIS2_BASE_URL/xyz. Reason: Avoid problems with
      CORS and cross-domain cookies, as the app connects only to the local development server.

    - Redirect paths in `redirectPaths` to the original DHIS2 URL. Reason: some apps, i.e. Pivot Table App,
      do not work through the proxy. Tipically, these links are rendered on iframed dashboards.
*/

const redirectPaths = ["/dhis-web-pivot", "/dhis-web-data-visualizer"];

const dhis2UrlVar = "REACT_APP_DHIS2_BASE_URL";
const dhis2AuthVar = "REACT_APP_DHIS2_AUTH";
const proxyLogLevel = "REACT_APP_PROXY_LOG_LEVEL";

module.exports = function (app) {
    const targetUrl = process.env[dhis2UrlVar];
    const auth = process.env[dhis2AuthVar];
    const logLevel = process.env[proxyLogLevel] || "warn";

    if (!targetUrl) {
        console.error(`Set ${dhis2UrlVar} to base DHIS2 URL`);
        process.exit(1);
    }

    const proxy = createProxyMiddleware({
        target: targetUrl,
        auth,
        logLevel,
        changeOrigin: true,
        pathRewrite: { "^/dhis2/": "/" },
        onProxyReq: function (proxyReq, req, res) {
            const { path } = proxyReq;
            const shouldRedirect = redirectPaths.some(redirectPath => path.startsWith(redirectPath));

            if (shouldRedirect) {
                const redirectUrl = targetUrl.replace(/\/$/, "") + path;
                res.location(redirectUrl);
                res.sendStatus(302);
            }
        },
    });

    app.use(["/dhis2"], proxy);
};
