import qs from "qs";
import React from "react";

export function useWidget() {
    const { dashboardItemId = "DEVELOPMENT", userOrgUnit } = qs.parse(window.location.search);

    return {
        dashboardItemId,
        userOrgUnits: userOrgUnit?.split(",") ?? [],
    };
}

function Root() {
    const { dashboardItemId } = useWidget();
    return <p>{`Hello World, I'm dashboard item ${dashboardItemId}!`}</p>;
}

export default Root;
