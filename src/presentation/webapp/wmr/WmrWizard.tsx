import React from "react";
import { Wizard, WizardStep } from "@eyeseetea/d2-ui-components";
import i18n from "../../../utils/i18n";
import { InstallMetadataPackage } from "./InstallMetadataPackage";
import { MapWmrData } from "./MapWmrData";
import { SyncAndCheckWmr } from "./SyncAndCheckWmr";
import { SubmitWmr } from "./SubmitWmr";
import { useWmrContext } from "./context/WmrContext";

export type WmrWizardProps = {};

export function WmrWizard() {
    const { requisitesReady, syncRule } = useWmrContext();

    const onStepChangeRequest = React.useCallback(
        async (currentStep: WizardStep) => {
            if (currentStep.key === "metadata-package" && !requisitesReady) {
                return [i18n.t("Please complete the prerequisites before proceeding.")];
            } else if (currentStep.key === "map-server-data" && !syncRule?.localDataSetId) {
                return [i18n.t("Please select a source data set before proceeding.")];
            } else if (currentStep.key === "check-data" && !syncRule?.rule.metadataIds.length) {
                return [i18n.t("Please Sync your server data to the WMR Country Sync form before proceeding.")];
            }
            return undefined;
        },
        [requisitesReady, syncRule?.localDataSetId, syncRule?.rule.metadataIds.length]
    );

    const steps = React.useMemo((): WizardStep[] => {
        return [
            {
                component: () => <InstallMetadataPackage />,
                key: "metadata-package",
                label: i18n.t("Metadata package"),
            },
            {
                component: () => <MapWmrData />,
                key: "map-server-data",
                label: i18n.t("Map Server data"),
            },
            {
                component: () => <SyncAndCheckWmr />,
                key: "check-data",
                label: i18n.t("Sync & Check Data"),
            },
            {
                component: () => <SubmitWmr />,
                key: "submit-data",
                label: i18n.t("Submit Data"),
            },
        ];
    }, []);

    return (
        <Wizard
            useSnackFeedback
            steps={steps}
            initialStepKey="metadata-package"
            onStepChangeRequest={onStepChangeRequest}
        />
    );
}
