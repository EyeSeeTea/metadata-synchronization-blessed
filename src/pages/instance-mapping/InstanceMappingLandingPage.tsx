import i18n from "@dhis2/d2-i18n";
import { useD2Api } from "d2-api";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Card, Landing } from "../../components/landing/Landing";
import { TestWrapper } from "../../components/test-wrapper/TestWrapper";
import Instance from "../../models/instance";

const InstanceMappingLandingPage: React.FC = () => {
    const api = useD2Api();
    const history = useHistory();
    const { id } = useParams() as { id: string };

    const [instance, setInstance] = useState<Instance>();

    useEffect(() => {
        Instance.get(api, id).then(setInstance);
    }, [api, id]);

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

    const mainTitle = i18n.t("Instance mapping");
    const instanceTitle = instance ? i18n.t("Destination instance {{name}}", instance) : undefined;
    const title = _.compact([mainTitle, instanceTitle]).join(" - ");

    return (
        <TestWrapper>
            <Landing title={title} cards={cards} onBackClick={backHome} />
        </TestWrapper>
    );
};

export default InstanceMappingLandingPage;
