import Instance from '../instance';

const instance = Instance.create();

describe("Instance", () => {
    describe("Validations", () => {
        it("requires a name", () => {
            const messages = instance.validate();
            expect(messages).toEqual(expect.objectContaining({
                name: {
                    key: "cannot_be_blank",
                    namespace: {"field": "name"},
                }
            }));
        });

        it("requires a url", () => {
            const messages = instance.validate();
            expect(messages).toEqual(expect.objectContaining({
                url: {
                    key: "cannot_be_blank",
                    namespace: {"field": "url"},
                }
            }));
        });

        it("requires a username", () => {
            const messages = instance.validate();
            expect(messages).toEqual(expect.objectContaining({
                username: {
                    key: "cannot_be_blank",
                    namespace: {"field": "username"},
                }
            }));
        });

        it("requires a password", () => {
            const messages = instance.validate();
            expect(messages).toEqual(expect.objectContaining({
                password: {
                    key: "cannot_be_blank",
                    namespace: {"field": "password"},
                }
            }));
        });
    });
});

export {}