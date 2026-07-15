import { Instance } from "../../domain/instance/entities/Instance";
import { getD2ApiBaseUrl, removeTrailingSlash } from "../d2-utils";

describe("removeTrailingSlash", () => {
    it("removes trailing slashes from a URL", () => {
        expect(removeTrailingSlash("https://play.dhis2.org/dev/")).toBe("https://play.dhis2.org/dev");
        expect(removeTrailingSlash("https://play.dhis2.org/dev///")).toBe("https://play.dhis2.org/dev");
    });
});

describe("getD2ApiBaseUrl", () => {
    it("keeps the local base URL normalized", () => {
        const localInstance = Instance.build({ type: "local", name: "Local", url: "https://example.com/dhis2/" });

        expect(getD2ApiBaseUrl(localInstance)).toBe("https://example.com/dhis2");
        expect(getD2ApiBaseUrl(localInstance, localInstance)).toBe("https://example.com/dhis2");
    });

    it("builds route URLs without duplicate slashes", () => {
        const localInstance = Instance.build({ type: "local", name: "Local", url: "https://example.com/dhis2/" });
        const remoteInstance = Instance.build({ id: "sEb6mlyEQkL", name: "Remote", url: "https://remote.example.com" });

        expect(getD2ApiBaseUrl(localInstance, remoteInstance)).toBe(
            "https://example.com/dhis2/api/routes/sEb6mlyEQkL/run/"
        );
    });
});
