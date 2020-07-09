import MappingInstancePageObject from "./common/MappingInstancePageObject";

class MappingAggregatedPageObject extends MappingInstancePageObject {
    constructor(cy) {
        super(cy, "aggregated");
    }
}

export default MappingAggregatedPageObject;
