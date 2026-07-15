import { Id } from "../../common/entities/Schemas";

export type Visualization = {
    id: Id;
    rows: VisualizationRow[];
};

type VisualizationRow = {
    id: string;
    dimension: string;
    items: VisualizationRowItem[];
};

type VisualizationRowItem = {
    id: string;
    name: string;
};
