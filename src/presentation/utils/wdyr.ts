/// <reference types="@welldone-software/why-did-you-render" />

import React from "react";
import { config } from "../../utils/Config";

if (config.isDevelopment) {
    import("@welldone-software/why-did-you-render").then(whyDidYouRenderModule => {
        const whyDidYouRender = whyDidYouRenderModule.default;

        whyDidYouRender(React, {
            trackAllPureComponents: true,
        });
    });
}
