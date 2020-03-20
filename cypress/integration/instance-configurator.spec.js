import InstanceDetailPageObject from "../support/page-objects/InstanceDetailPageObject";

context("Destination Settings", function() {
    const page = new InstanceDetailPageObject(cy);

    beforeEach(() => {
        page.open();
    });

    it("has the correct title", function() {
        page.assertTitle(title => title.contains("Destination Instance Settings"));
    });

    it("has the localhost instance", function() {
        page.findInstance("this instance (8080)");
    });
});
