import React from "react";
import { mount as enzymeMount } from "enzyme";
import fetch from "node-fetch";
import _ from "./lodash";
import sinon from "sinon";
import { generateUid } from "d2/uid";
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { MuiThemeProvider } from "@material-ui/core/styles";

import { muiTheme } from "../dhis2.theme";
import SnackbarProvider from "../components/feedback/SnackbarProvider";

// DHIS2 expects a browser environment, add some required keys to the global node namespace
Object.assign(global, {
    Headers: fetch.Headers,
    window: {},
});

export function mount(component) {
    const wrappedComponent = enzymeMount(
        <MuiThemeProvider theme={muiTheme}>
            <OldMuiThemeProvider>
                <SnackbarProvider>{component}</SnackbarProvider>
            </OldMuiThemeProvider>
        </MuiThemeProvider>
    );

    //return wrappedComponent.find(component.type);
    return wrappedComponent;
}

const mocks = {
    api: {
        get: sinon.stub(),
        update: sinon.stub(),
        post: sinon.stub(),
        delete: sinon.stub(),
    },
};

export function getD2Stub(partialD2 = {}) {
    return _.deepMerge(
        {
            Api: {
                getApi: () => mocks.api,
            },
            system: {
                systemInfo: {},
            },
            currentUser: {
                id: "M5zQapPyTZI",
                displayName: "John Traore",
            },
            mocks,
            models: {},
        },
        partialD2
    );
}

export function getNewUser(partialUser) {
    const userId = generateUid();

    const baseUser = {
        firstName: "Test",
        surname: "User",
        email: "test@dhis2.org",
        id: userId,
        userCredentials: {
            username: "test",
            password: "Test123$",
            userInfo: {
                id: userId,
            },
        },
    };

    return _.merge(baseUser, partialUser);
}

export async function getTestUser(d2, { auth, userAttributes }) {
    const api = d2.Api.getApi();
    const partialUser = _.merge(
        {
            password: auth.password,
            userCredentials: {
                username: auth.username,
            },
        },
        userAttributes
    );
    const user = getNewUser(partialUser);
    const existingTestUser = (await api.get("/users", {
        fields: ":owner",
        filter: "userCredentials.username:eq:" + auth.username,
    })).users[0];

    let response, returnUser;

    if (existingTestUser) {
        const customizer = (objValue, srcValue) =>
            _(srcValue).isPlainObject() ? { ...objValue, ...srcValue } : srcValue;
        returnUser = _.mergeWith(existingTestUser, userAttributes, customizer);
        response = await api.update(`/users/${existingTestUser.id}`, returnUser);
    } else {
        returnUser = user;
        response = await api.post("/users", returnUser);
    }
    if (response.status !== "OK") throw new Error(`Cannot create test use: ${response}`);

    return returnUser;
}
