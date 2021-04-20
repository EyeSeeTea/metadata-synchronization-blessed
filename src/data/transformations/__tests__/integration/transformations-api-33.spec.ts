import { sync } from "./helpers";

describe("Transformation 2.30 -> 2.33", () => {
    beforeAll(() => {
        jest.setTimeout(30000);
    });

    it("Transforms mapViews", async () => {
        const metadata = {
            mapViews: [
                {
                    id: "mapView1",
                    labls: true,
                },
            ],
        };

        const { mapViews } = await sync({
            from: "2.30",
            to: "2.33",
            metadata,
            models: ["mapViews"],
        });
        const mapView = mapViews["mapView1"];
        expect(mapView).toBeDefined();

        expect(mapView.renderingStrategy).toEqual("SINGLE");
    });
});

export {};
