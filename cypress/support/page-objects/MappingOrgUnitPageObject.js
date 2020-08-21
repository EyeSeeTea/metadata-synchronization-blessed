import MappingInstancePageObject from "./common/MappingInstancePageObject";

class MappingGlobalPageObject extends MappingInstancePageObject {
    constructor(cy) {
        super(cy, "orgUnit");
    }
}

export default MappingGlobalPageObject;
