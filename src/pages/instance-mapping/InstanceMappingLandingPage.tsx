import i18n from "@dhis2/d2-i18n";
import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Card, Landing } from "../../components/landing/Landing";
import { TestWrapper } from "../../components/test-wrapper/TestWrapper";

const InstanceMappingLandingPage: React.FC = () => {
    const history = useHistory();
    const { id } = useParams() as { id: string };

    const cards: Card[] = [
        {
            key: "mapping",
            children: [
                {
                    name: i18n.t("Aggregated"),
                    description: i18n.t(
                        "Map data elements, category options and option sets for aggregated data between instances"
                    ),
                    listAction: () => history.push(`/instances/mapping/${id}/aggregated`),
                },
                {
                    name: i18n.t("Events"),
                    description: i18n.t(
                        "Map data elements, category options and option sets for tracker data between instances"
                    ),
                    listAction: () => history.push(`/instances/mapping/${id}/tracker`),
                },
                {
                    name: i18n.t("Organisation units"),
                    description: i18n.t("Map organisation units between instances"),
                    listAction: () => history.push(`/instances/mapping/${id}/orgUnit`),
                },
                {
                    name: i18n.t("Global"),
                    description: i18n.t(
                        "Map global category options, category combos and options between instances"
                    ),
                    listAction: () => history.push(`/instances/mapping/${id}/global`),
                },
            ],
        },
    ];

    const backHome = () => {
        history.push("/instances");
    };

    return (
        <TestWrapper>
            <Landing title={i18n.t("Instance mapping")} cards={cards} onBackClick={backHome} />
        </TestWrapper>
    );
};

export default InstanceMappingLandingPage;
