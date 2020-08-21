import MappingInstancePageObject from "./common/MappingInstancePageObject";

class MappingEventPageObject extends MappingInstancePageObject {
    constructor(cy) {
        super(cy, "tracker");
    }
}

export default MappingEventPageObject;
