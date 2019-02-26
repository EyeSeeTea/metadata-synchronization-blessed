import Instance from "../instance";

describe("Instance", () => {
    describe("Instance creation", () => {
        it("Create new Instance", () => {
            const newInstance = new Instance({
                id: "test",
                url: "test",
                username: "test",
                password: "test",
            });
            expect(typeof newInstance).toEqual("object");
        });
    });
});

export {};
