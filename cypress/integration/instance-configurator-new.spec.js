import InstanceDetailPageObject from "../support/page-objects/InstanceDetailPageObject";

context("New Instance Settings", function() {
    const page = new InstanceDetailPageObject(cy);

    beforeEach(() => {
        page.open();
    });

    it("has the correct title", function() {
        page.assertTitle(title => title.contains("Destination Instance Settings"));
    });

    it("opens a new instance page", function() {
        page.newInstance().assertTitle(title => title.contains("New Instance"));
    });

    it("should show input errors when inputs are empty", function() {
        page.newInstance()
            .save()
            .assertInputError("name")
            .assertInputError("url")
            .assertInputError("username")
            .assertInputError("password")
            .assertError(error => error.contains("Please fix the issues before saving"));
    });

    it("should show test connection error when server is empty", function() {
        page.newInstance()
            .testConnection()
            .assertError(error =>
                error.contains("Please fix the issues before testing the connection")
            );
    });

    it("should show url error when url is not valid", function() {
        page.newInstance()
            .typeUrl("http")
            .unfocus()
            .assertInvalidUrlError()
            .testConnection()
            .assertError(error =>
                error.contains("Please fix the issues before testing the connection")
            );
    });

    it("should connect successfully to instance", function() {
        page.newInstance()
            .typeCreedentials()
            .typeName("test")
            .typeUrl("http://localhost:8080")
            .testConnection()
            .assertError(error => error.contains("Connected successfully to instance"));
    });

    it("should save successfully new instance", function() {
        page.newInstance()
            .typeCreedentials()
            .typeName("test")
            .typeUrl("http://localhost:8080/test")
            .save()
            .findInstance("test");
    });
});
