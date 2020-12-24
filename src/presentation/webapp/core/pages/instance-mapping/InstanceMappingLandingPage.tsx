import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import i18n from "../../../../../locales";
import { useAppContext } from "../../../../react/core/contexts/AppContext";
import { Card, Landing } from "../../../../react/core/components/landing/Landing";
import { TestWrapper } from "../../../../react/core/components/test-wrapper/TestWrapper";

const InstanceMappingLandingPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();
    const { id } = useParams() as { id: string };

    const [instance, setInstance] = useState<Instance>();

    useEffect(() => {
        compositionRoot.instances.getById(id).then(result =>
            result.match({
                success: setInstance,
                error: () => {},
            })
        );
    }, [compositionRoot, id]);

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
    const instanceTitle = instance ? i18n.t("Between this instance and {{name}}", instance) : null;
    const title = _.compact([mainTitle, instanceTitle]).join(" - ");

    return (
        <TestWrapper>
            <Landing title={title} cards={cards} onBackClick={backHome} />
        </TestWrapper>
    );
};

export default InstanceMappingLandingPage;
