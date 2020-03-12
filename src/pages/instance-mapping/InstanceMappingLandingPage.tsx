import i18n from "@dhis2/d2-i18n";
import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Card, Landing } from "../../components/landing/Landing";
import { TestWrapper } from "../../components/test-wrapper/TestWrapper";
import Instance from "../../models/instance";
import { D2 } from "../../types/d2";
import { useD2 } from "d2-api";

const InstanceMappingLandingPage: React.FC = () => {
    const d2 = useD2();
    const history = useHistory();
    const { id } = useParams() as { id: string };

    const [instance, setInstance] = useState<Instance>();

    useEffect(() => {
        Instance.get(d2 as D2, id).then(setInstance);
    }, [d2, id]);

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
                    name: i18n.t("Programs (events)"),
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
                        "Map global category options, category combos, options and tracker data elements between instances"
                    ),
                    listAction: () => history.push(`/instances/mapping/${id}/global`),
                },
            ],
        },
    ];

    const backHome = () => {
        history.push("/instances");
    };

    const title = i18n.t("Instance mapping");

    return (
        <TestWrapper>
            <Landing
                title={instance ? `${title} - Destination instance: ${instance?.name}` : title}
                cards={cards}
                onBackClick={backHome}
            />
        </TestWrapper>
    );
};

export default InstanceMappingLandingPage;
