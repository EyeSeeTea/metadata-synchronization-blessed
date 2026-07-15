import { Id } from "../../domain/common/entities/Schemas";
import { Instance } from "../../domain/instance/entities/Instance";
import { Visualization } from "../../domain/visualization/entities/Visualization";
import { VisualizationRepository } from "../../domain/visualization/repositories/VisualizationRepository";
import { D2Api, MetadataPick } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-utils";

export class VisualizationD2Repository implements VisualizationRepository {
    private api: D2Api;

    constructor(localInstance: Instance, targetInstance: Instance) {
        this.api = getD2APiFromInstance(localInstance, targetInstance);
    }

    async getByIds(ids: Id[]): Promise<Visualization[]> {
        if (ids.length === 0) return [];

        const d2Visualizations = await this.api.models.visualizations
            .get({
                fields: visualizationFields,
                filter: { id: { in: ids } },
            })
            .getData();

        return d2Visualizations.objects.map(d2Visualization => this.mapD2VisualizationToVisualization(d2Visualization));
    }

    private mapD2VisualizationToVisualization(d2Visualization: D2Visualization): Visualization {
        return {
            id: d2Visualization.id,
            // NOTE: This type assertion is needed because rows in unknown[] in d2-api
            rows: (d2Visualization.rows as D2VisualizationRow[]).map(row => ({
                id: row.id,
                dimension: row.dimension,
                items: row.items.map(item => ({
                    id: item.id,
                    name: item.name,
                })),
            })),
        };
    }
}

const visualizationFields = {
    id: true,
    rows: {
        id: true,
        dimension: true,
        items: {
            id: true,
            name: true,
        },
    },
} as const;

type D2VisualizationRow = {
    id: string;
    dimension: string;
    items: Array<{
        id: string;
        name: string;
    }>;
};

export type D2Visualization = MetadataPick<{
    visualizations: { fields: typeof visualizationFields };
}>["visualizations"][number];
