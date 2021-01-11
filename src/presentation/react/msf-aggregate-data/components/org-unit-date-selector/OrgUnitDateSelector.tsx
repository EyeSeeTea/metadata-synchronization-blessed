import { Divider } from "@material-ui/core";
import { DatePicker, OrgUnitsSelector } from "d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { cleanOrgUnitPath } from "../../../../../domain/synchronization/utils";
import i18n from "../../../../../locales";
import { Dictionary } from "../../../../../types/utils";
import { useAppContext } from "../../../core/contexts/AppContext";

export interface NamedDate {
    name: string;
    date: Date | null;
}

export interface OrgUnitDateSelectorProps {
    projectStartDates: Dictionary<NamedDate>;
    onChange(projectStartDates: Dictionary<NamedDate>): void;
}

export const OrgUnitDateSelector: React.FC<OrgUnitDateSelectorProps> = React.memo(props => {
    const { projectStartDates, onChange: updateProjectStartDates } = props;
    const { api, compositionRoot } = useAppContext();

    const [orgUnitRootIds, setOrgUnitRootIds] = useState<string[] | undefined>();
    const [selectedOrgUnitPaths, updateSelectedOrgUnitPaths] = useState<string[]>([]);

    const fetchName = useCallback(
        async (path: string) => {
            const id = cleanOrgUnitPath(path);

            const { objects } = await compositionRoot.metadata.list({
                type: "organisationUnits",
                filterRows: [id],
                fields: { name: true },
            });

            return objects[0]?.name ?? i18n.t("Unknown organisation {{id}}", { id });
        },
        [compositionRoot]
    );

    const addProjectStartDate = useCallback(
        async (project: string, date: Date | null) => {
            const name = await fetchName(project);

            if (!date && !selectedOrgUnitPaths.includes(project)) {
                updateProjectStartDates(_.omit(projectStartDates, [project]));
            } else {
                updateProjectStartDates({ ...projectStartDates, [project]: { name, date } });
            }
        },
        [fetchName, selectedOrgUnitPaths, projectStartDates, updateProjectStartDates]
    );

    const selectOrgUnit = useCallback(
        async (paths: string[]) => {
            updateSelectedOrgUnitPaths(paths);
            if (paths.length === 0) return;

            const name = await fetchName(paths[0]);
            const items = _.omitBy(projectStartDates, item => item.date === null);
            updateProjectStartDates({ [paths[0]]: { name, date: null }, ...items });
        },
        [fetchName, projectStartDates, updateProjectStartDates]
    );

    useEffect(() => {
        compositionRoot.instances
            .getOrgUnitRoots()
            .then(roots => roots.map(({ id }) => id))
            .then(setOrgUnitRootIds);
    }, [compositionRoot]);

    return (
        <Wrapper>
            <FlexBox>
                <Container>
                    <OrgUnitsSelector
                        api={api}
                        fullWidth={false}
                        onChange={selectOrgUnit}
                        selected={selectedOrgUnitPaths}
                        rootIds={orgUnitRootIds}
                        withElevation={false}
                        singleSelection={true}
                        typeInput={"radio"}
                        hideMemberCount={true}
                        controls={{
                            filterByLevel: false,
                            filterByGroup: false,
                            filterByProgram: false,
                            selectAll: false,
                        }}
                    />
                </Container>
                <Divider orientation={"vertical"} flexItem={true} />
                <Container>
                    <FlexBox orientation={"vertical"}>
                        {_.toPairs(projectStartDates).map(([orgUnitPath, item]) => (
                            <React.Fragment key={`date-${orgUnitPath}`}>
                                <h4>{i18n.t("Project {{name}} start date", item)}</h4>
                                <Picker
                                    label={i18n.t("Start date")}
                                    value={item.date}
                                    onChange={(date: Date | null) =>
                                        addProjectStartDate(orgUnitPath, date)
                                    }
                                />
                            </React.Fragment>
                        ))}
                    </FlexBox>
                </Container>
            </FlexBox>
        </Wrapper>
    );
});

const Wrapper = styled.div`
    margin: 25px 0;
`;

const FlexBox = styled.div<{ orientation?: "horizontal" | "vertical" }>`
    display: flex;
    flex: 1;
    flex-direction: ${props => (props.orientation === "vertical" ? "column" : "row")};
`;

const Container = styled.div`
    width: 50%;
    margin: 0 25px;
`;

const Picker = styled(DatePicker)`
    margin: 0;
`;
