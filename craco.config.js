/* Required for CRA 4, see https://github.com/welldone-software/why-did-you-render/issues/154#issuecomment-773905769 */

module.exports = {
    babel: {
        loaderOptions: babelLoaderOptions => {
            const origBabelPresetCRAIndex = babelLoaderOptions.presets.findIndex(preset => {
                return preset[0].includes("babel-preset-react-app");
            });

            const origBabelPresetCRA = babelLoaderOptions.presets[origBabelPresetCRAIndex];

            babelLoaderOptions.presets[origBabelPresetCRAIndex] = function overridenPresetCRA(api, opts, env) {
                const babelPresetCRAResult = require(origBabelPresetCRA[0])(api, origBabelPresetCRA[1], env);

                babelPresetCRAResult.presets.forEach(preset => {
                    // detect @babel/preset-react with {development: true, runtime: 'automatic'}
                    const isReactPreset =
                        preset && preset[1] && preset[1].runtime === "automatic" && preset[1].development === true;
                    if (isReactPreset) {
                        preset[1].importSource = "@welldone-software/why-did-you-render";
                    }
                });

                return babelPresetCRAResult;
            };

            return babelLoaderOptions;
        },
    },
};
