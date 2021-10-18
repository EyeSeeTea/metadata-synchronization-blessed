import { ConfirmationDialog, ConfirmationDialogProps } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FixedSizeList } from "react-window";
import styled from "styled-components";
import { NamedRef, Ref } from "../../../../../domain/common/entities/Ref";
import { DataSource } from "../../../../../domain/instance/entities/DataSource";
import { MetadataMappingDictionary, MetadataOverlap } from "../../../../../domain/mapping/entities/MetadataMapping";
import { MetadataPackage } from "../../../../../domain/metadata/entities/MetadataEntities";
import { useAppContext } from "../../contexts/AppContext";
import { EXCLUDED_KEY } from "../mapping-table/utils";
import { OverlappingEditor } from "./OverlappingEditor";

export const OverlappedMappingDialog = (props: OverlappedMappingDialogProps) => {
    const { originInstance, destinationInstance, mapping, program, onSave, ...extraProps } = props;

    const { compositionRoot } = useAppContext();

    const [originMetadata, setOriginMetadata] = useState<NamedRef[]>();
    const [destinationMetadata, setDestinationMetadata] = useState<NamedRef[]>();
    const [overlaps, setOverlaps] = useState<MetadataOverlap>(mapping.eventPrograms[program]?.overlaps ?? {});

    const overlappedMappings = useMemo(
        () =>
            _(mapping.programDataElements)
                .pickBy((_value, key) => key.startsWith(program))
                .mapValues((value, key) => ({ ...value, key }))
                .groupBy(item => item?.mappedId)
                .pickBy((value, key) => key !== EXCLUDED_KEY && value.length > 1)
                .mapValues(value => value?.map(({ key }) => key) ?? [])
                .value(),
        [mapping, program]
    );

    const updateOverlaps = useCallback((destinationDataElement: string, replacer: string) => {
        setOverlaps(overlaps => ({ ...overlaps, [destinationDataElement]: { type: "replace", replacer } }));
    }, []);

    const exit = useCallback(() => onSave(overlaps), [onSave, overlaps]);

    useEffect(() => {
        const destinationDataElements = _.keys(overlappedMappings);
        const originDataElements = _.keys(mapping.programDataElements).flatMap(item => item.split("-"));

        compositionRoot.metadata
            .getByIds(destinationDataElements, destinationInstance)
            .then(metadata => setDestinationMetadata(packageToNamedRef(metadata)));

        compositionRoot.metadata
            .getByIds(originDataElements, originInstance)
            .then(metadata => setOriginMetadata(packageToNamedRef(metadata)));
    }, [compositionRoot, mapping, originInstance, destinationInstance, overlappedMappings]);

    if (!originMetadata || !destinationMetadata) return null;

    return (
        <ConfirmationDialog {...extraProps} onSave={exit}>
            <FixedSizeList
                height={600}
                width={"100%"}
                itemSize={320}
                itemCount={_.keys(overlappedMappings).length}
                itemData={{ overlappedMappings, destinationMetadata, originMetadata, overlaps, updateOverlaps }}
            >
                {Row}
            </FixedSizeList>
        </ConfirmationDialog>
    );
};

export interface OverlappedMappingDialogProps extends Omit<ConfirmationDialogProps, "onSave"> {
    originInstance: DataSource;
    destinationInstance: DataSource;
    mapping: MetadataMappingDictionary;
    program: string;
    onSave: (overlaps: MetadataOverlap) => void;
}

const Item = styled.div`
    margin: 4px 0;
    padding: 10px;
    height: 200px;
`;

const Row: React.FC<RowItemProps & { style: object }> = ({ style, ...props }) => (
    <div style={style}>
        <RowItem {...props} />
    </div>
);

interface RowItemProps {
    data: {
        overlappedMappings: Record<string, string[]>;
        destinationMetadata: NamedRef[];
        originMetadata: NamedRef[];
        overlaps: MetadataOverlap;
        updateOverlaps: (destinationDataElement: string, replacer: string) => void;
    };
    index: number;
}

const RowItem: React.FC<RowItemProps> = ({ data, index }) => {
    const { originMetadata, destinationMetadata, overlappedMappings, overlaps, updateOverlaps } = data;

    const id = _.keys(overlappedMappings)[index];
    const { name } = destinationMetadata?.find(item => item.id === id) ?? {};
    const title = `${name} (${id})`;

    const variables = _.compact(overlappedMappings[id]?.map(item => _.last(item.split("-"))));
    const defaultString = variables?.map(item => `#{${item}}`).join("-");
    const value = overlaps[id]?.replacer ?? defaultString;

    return (
        <Item>
            <h3>{title}</h3>

            <OverlappingEditor
                variables={variables}
                metadata={originMetadata}
                value={value}
                onChange={update => {
                    const replacer = _.isFunction(update) ? update(value) : update;
                    updateOverlaps(id, replacer ?? defaultString);
                }}
            />
        </Item>
    );
};

function packageToNamedRef(metadata: MetadataPackage): NamedRef[] {
    return _(metadata)
        .values()
        .flatten()
        .compact()
        .uniqBy((item: Ref) => item.id)
        .value()
        .map(({ id, name }) => ({ id, name }));
}
