import React from "react";
import { DhisRelease } from "../../../../domain/dhis-releases/entities/DhisRelease";
import { useAppContext } from "../contexts/AppContext";

export function useGetSupportedVersions() {
    const { compositionRoot } = useAppContext();
    const [supportedVersions, setSupportedVersions] = React.useState<DhisRelease[]>([]);

    React.useEffect(() => {
        compositionRoot.dhisReleases.getSupportedDhisVersions().then(result => setSupportedVersions(result));
    }, [compositionRoot]);

    return { supportedVersions };
}
