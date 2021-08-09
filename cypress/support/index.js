// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "cypress-xpath";
import addContext from "mochawesome/addContext";
import "./commands";

Cypress.on("test:after:run", (test, runnable) => {
    if (test.state === "failed") {
        addContext({ test }, { title: "Video", value: `assets/videos/${Cypress.spec.name}.mp4` });
        addContext(
            { test },
            {
                title: "Screenshot",
                value: `assets/screenshots/${Cypress.spec.name}/${runnable.parent.title} -- ${test.title} ${
                    test.hookName ? `-- ${test.hookName} hook ` : ""
                }(failed).png`,
            }
        );
    }
});
