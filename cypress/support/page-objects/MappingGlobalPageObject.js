import MappingInstancePageObject from "./common/MappingInstancePageObject";

class MappingGlobalPageObject extends MappingInstancePageObject {
    constructor(cy) {
        super(cy, "global");
    }
}

export default MappingGlobalPageObject;
