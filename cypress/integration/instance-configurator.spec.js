import InstancePageObject from "../support/page-objects/common/InstancePageObject";

context("Destination Settings", function() {
    const page = new InstancePageObject(cy);

    beforeEach(() => {
        page.open();
    });

    it("should have the correct title", function() {
        page.assertTitle(title => title.contains("Destination Instance Settings"));
    });

    it("should have the localhost instance", function() {
        page.findInstance("this instance (8080)");
    });
});
