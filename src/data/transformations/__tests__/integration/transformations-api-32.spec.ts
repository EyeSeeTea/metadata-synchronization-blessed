import { Request, Server } from "miragejs";
import { AnyRegistry } from "miragejs/-types";
import Schema from "miragejs/orm/schema";
import { Repositories, RepositoryFactory } from "../../../../domain/common/factories/RepositoryFactory";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { MetadataSyncUseCase } from "../../../../domain/metadata/usecases/MetadataSyncUseCase";
import { SynchronizationBuilder } from "../../../../domain/synchronization/entities/SynchronizationBuilder";
import { startDhis } from "../../../../utils/dhisServer";
import { ConfigAppRepository } from "../../../config/ConfigAppRepository";
import { InstanceD2ApiRepository } from "../../../instance/InstanceD2ApiRepository";
import { MetadataD2ApiRepository } from "../../../metadata/MetadataD2ApiRepository";
import { TransformationD2ApiRepository } from "../../../transformations/TransformationD2ApiRepository";

const repositoryFactory = buildRepositoryFactory();

describe("Sync metadata", () => {
    let local: Server;
    let remote: Server;

    beforeAll(() => {
        jest.setTimeout(30000);
    });

    beforeEach(() => {
        local = startDhis({ urlPrefix: "http://origin.test" });
        remote = startDhis(
            {
                urlPrefix: "http://destination.test",
                pretender: local.pretender,
            },
            { version: "2.32" }
        );

        local.get("/metadata", async () => ({
            maps: [{ id: "map1", mapViews: [{ id: "mapView1" }, { id: "mapView2" }] }],
            mapViews: [
                { id: "mapView1", name: "Map view1" },
                { id: "mapView2", name: "Map view2" },
                { id: "mapView3", name: "Map view3" },
            ],
            organisationUnits: [
                {
                    id: "ou_id1",
                    name: "Test org unit",
                    dimensionItemType: "ORGANISATION_UNIT",
                    featureType: "NONE",
                },
                {
                    id: "ou_id2",
                    name: "Test org unit",
                    dimensionItemType: "ORGANISATION_UNIT",
                    coordinates: "[22.0123,-1.9012]",
                    featureType: "POINT",
                },
                {
                    id: "ou_id3",
                    name: "Test org unit",
                    dimensionItemType: "ORGANISATION_UNIT",
                    coordinates:
                        "[[[[-12.0931,8.507],[-12.09,8.5025],[-12.0875,8.4996],[-12.0814,8.4934],[-12.0779,8.4897],[-12.0753,8.4859],[-12.0735,8.4844],[-12.0679,8.4816],[-12.0629,8.48],[-12.0612,8.4781],[-12.0606,8.4756],[-12.0605,8.4729],[-12.0605,8.4623],[-12.0607,8.4585],[-12.0612,8.4558],[-12.0634,8.4505],[-12.0638,8.448],[-12.0636,8.4445],[-12.0624,8.4396],[-12.0638,8.4336],[-12.0637,8.4297],[-12.0626,8.4274],[-12.0603,8.4258],[-12.0571,8.4255],[-12.0524,8.4276],[-12.0481,8.4281],[-12.0451,8.4274],[-12.0399,8.4236],[-12.0376,8.4228],[-12.0356,8.4232],[-12.0306,8.4255],[-12.0272,8.4275],[-12.0239,8.428],[-12.021,8.4265],[-12.0195,8.4241],[-12.0196,8.4212],[-12.0216,8.4169],[-12.0233,8.4111],[-12.0253,8.4068],[-12.0255,8.4032],[-12.0242,8.4007],[-12.0225,8.3994],[-12.0194,8.3986],[-12.0166,8.3985],[-12.0088,8.3988],[-12.005,8.3987],[-12.0017,8.398],[-11.9999,8.3964],[-11.9979,8.3938],[-11.9916,8.3869],[-11.9904,8.3834],[-11.9914,8.3807],[-11.9937,8.3772],[-11.9982,8.3731],[-12.0036,8.3677],[-12.0093,8.3641],[-12.021,8.358],[-12.0268,8.3539],[-12.0322,8.3507],[-12.0363,8.347],[-12.0399,8.3428],[-12.0442,8.333],[-12.049,8.3247],[-12.0529,8.319],[-12.0544,8.3152],[-12.0545,8.311],[-12.0527,8.3072],[-12.0499,8.3041],[-12.0465,8.3017],[-12.0403,8.2993],[-12.0371,8.2974],[-12.0348,8.2947],[-12.032,8.2896],[-12.0307,8.2841],[-12.0296,8.272],[-12.0268,8.2613],[-12.0265,8.2561],[-12.0272,8.2529],[-12.0299,8.2496],[-12.0337,8.2478],[-12.0366,8.2474],[-12.0411,8.2474],[-12.0456,8.248],[-12.0485,8.2489],[-12.0522,8.2513],[-12.0609,8.2593],[-12.0643,8.2617],[-12.0734,8.2657],[-12.0833,8.267],[-12.0874,8.2685],[-12.0911,8.2711],[-12.1011,8.2806],[-12.1059,8.2842],[-12.1136,8.2877],[-12.1225,8.2896],[-12.1262,8.2914],[-12.1294,8.2941],[-12.1322,8.2973],[-12.1356,8.3026],[-12.1407,8.3093],[-12.1441,8.3145],[-12.1458,8.3168],[-12.149,8.3197],[-12.1514,8.3213],[-12.1578,8.3238],[-12.1651,8.328],[-12.1692,8.3293],[-12.1765,8.3299],[-12.1945,8.3299],[-12.2003,8.3322],[-12.2046,8.3331],[-12.2151,8.334],[-12.2192,8.335],[-12.2257,8.3379],[-12.2321,8.3413],[-12.2414,8.3475],[-12.2467,8.3502],[-12.2504,8.3516],[-12.2547,8.3522],[-12.2606,8.3525],[-12.265,8.3523],[-12.2679,8.3518],[-12.2718,8.3502],[-12.2762,8.3467],[-12.2788,8.3436],[-12.2821,8.3384],[-12.284,8.3362],[-12.2863,8.3343],[-12.2903,8.3321],[-12.2937,8.3306],[-12.2966,8.3299],[-12.2997,8.3296],[-12.3073,8.3298],[-12.3115,8.3307],[-12.3194,8.3341],[-12.3387,8.344],[-12.3464,8.3474],[-12.3506,8.3483],[-12.3564,8.3483],[-12.3605,8.3475],[-12.3671,8.3445],[-12.3718,8.3412],[-12.3773,8.3359],[-12.387,8.3259],[-12.3899,8.3224],[-12.3943,8.3166],[-12.4044,8.3079],[-12.4087,8.3051],[-12.4121,8.3044],[-12.4158,8.3054],[-12.4183,8.3077],[-12.4213,8.3141],[-12.424,8.3172],[-12.427,8.3182],[-12.4304,8.3164],[-12.4319,8.313],[-12.4322,8.3012],[-12.4325,8.2982],[-12.4345,8.2908],[-12.4364,8.2813],[-12.439,8.2729],[-12.4475,8.2802],[-12.4526,8.2869],[-12.4581,8.2906],[-12.4626,8.2909],[-12.4702,8.2894],[-12.4842,8.2882],[-12.4949,8.2854],[-12.4995,8.2849],[-12.5043,8.2848],[-12.5105,8.2853],[-12.5147,8.2865],[-12.5211,8.2896],[-12.5271,8.2935],[-12.5309,8.2953],[-12.549,8.2983],[-12.5523,8.2977],[-12.5597,8.2941],[-12.564,8.293],[-12.5702,8.2924],[-12.57,8.2998],[-12.5696,8.3041],[-12.5671,8.314],[-12.567,8.3193],[-12.5685,8.3254],[-12.5703,8.3288],[-12.5741,8.3334],[-12.5786,8.3375],[-12.5833,8.3406],[-12.5899,8.3437],[-12.5964,8.3459],[-12.605,8.3508],[-12.6163,8.3545],[-12.6261,8.356],[-12.63,8.3572],[-12.6329,8.3593],[-12.6364,8.3635],[-12.639,8.3659],[-12.6464,8.371],[-12.6502,8.3731],[-12.6543,8.3741],[-12.6585,8.3744],[-12.6644,8.3742],[-12.6719,8.3735],[-12.668,8.3838],[-12.666,8.3876],[-12.6611,8.3934],[-12.6545,8.3996],[-12.6521,8.4014],[-12.6495,8.4028],[-12.6466,8.4037],[-12.6393,8.4053],[-12.6306,8.4096],[-12.6265,8.4132],[-12.6238,8.4164],[-12.6202,8.4214],[-12.6181,8.4234],[-12.6144,8.4254],[-12.6076,8.4272],[-12.6036,8.43],[-12.6022,8.433],[-12.6018,8.4378],[-12.6027,8.4433],[-12.6057,8.4505],[-12.6055,8.4546],[-12.6036,8.4574],[-12.5999,8.4595],[-12.589,8.4612],[-12.5809,8.464],[-12.5731,8.4643],[-12.571,8.4629],[-12.5657,8.4552],[-12.5607,8.4508],[-12.5562,8.4454],[-12.5536,8.443],[-12.5498,8.4404],[-12.5471,8.4379],[-12.545,8.4351],[-12.5417,8.4296],[-12.5397,8.4278],[-12.5355,8.4264],[-12.5315,8.4264],[-12.5284,8.4276],[-12.5264,8.4294],[-12.5241,8.4332],[-12.5221,8.4386],[-12.5184,8.4517],[-12.5149,8.4551],[-12.511,8.4563],[-12.5068,8.4564],[-12.5025,8.4557],[-12.4966,8.4537],[-12.4924,8.453],[-12.4866,8.4529],[-12.4824,8.4536],[-12.4666,8.4587],[-12.4638,8.4593],[-12.4568,8.4602],[-12.4515,8.462],[-12.4471,8.4653],[-12.4444,8.4685],[-12.4411,8.4738],[-12.4375,8.4782],[-12.4303,8.4854],[-12.4223,8.4916],[-12.4201,8.4944],[-12.4188,8.4973],[-12.4049,8.4969],[-12.4005,8.4961],[-12.3959,8.4947],[-12.3904,8.4945],[-12.3756,8.498],[-12.372,8.4999],[-12.3689,8.5027],[-12.3662,8.5059],[-12.3621,8.5121],[-12.3593,8.5152],[-12.3559,8.5176],[-12.352,8.519],[-12.341,8.5211],[-12.3364,8.5241],[-12.3328,8.5283],[-12.3275,8.5383],[-12.3247,8.5406],[-12.3206,8.5418],[-12.3103,8.5426],[-12.3062,8.5435],[-12.2962,8.5469],[-12.2877,8.5519],[-12.2812,8.5542],[-12.2696,8.5588],[-12.265,8.5572],[-12.2621,8.5537],[-12.2598,8.552],[-12.2559,8.5501],[-12.2485,8.5446],[-12.2454,8.5432],[-12.241,8.5408],[-12.2378,8.5394],[-12.2335,8.5371],[-12.2303,8.5357],[-12.2259,8.5335],[-12.2199,8.5321],[-12.2146,8.5298],[-12.2086,8.5284],[-12.2033,8.5261],[-12.1965,8.5244],[-12.1929,8.5226],[-12.1876,8.5216],[-12.1799,8.5215],[-12.1749,8.5209],[-12.1685,8.5185],[-12.1646,8.5179],[-12.1574,8.5178],[-12.1544,8.5175],[-12.1515,8.5169],[-12.147,8.515],[-12.1441,8.5145],[-12.1374,8.514],[-12.1336,8.5135],[-12.1282,8.5113],[-12.1223,8.5098],[-12.116,8.5073],[-12.1122,8.5067],[-12.1071,8.5066],[-12.098,8.5067],[-12.0931,8.507]]]]",
                    featureType: "POLYGON",
                },
            ],
        }));

        remote.get("/metadata", async () => ({}));

        local.get("/dataStore/metadata-synchronization/instances", async () => [
            {
                type: "local",
                id: "LOCAL",
                name: "This instance",
                description: "",
                url: "http://origin.test",
            },
            {
                type: "dhis",
                id: "DESTINATION",
                name: "Destination test",
                url: "http://destination.test",
                username: "test",
                password: "",
                description: "",
            },
        ]);

        local.get("/dataStore/metadata-synchronization/instances-LOCAL", async () => ({}));
        local.get("/dataStore/metadata-synchronization/instances-DESTINATION", async () => ({}));

        local.get("/dataStore/metadata-synchronization/instances-LOCAL/metaData", async () => ({
            created: "2021-03-30T01:59:59.191",
            lastUpdated: "2021-04-20T09:34:00.780",
            externalAccess: false,
            publicAccess: "rw------",
            user: { id: "H4atNsEuKxP" },
            userGroupAccesses: [],
            userAccesses: [],
            lastUpdatedBy: { id: "s5EVHUwoFKu" },
            namespace: "metadata-synchronization",
            key: "instances-LOCAL",
            value: "",
            favorite: false,
            id: "Db5532sXKXT",
        }));

        local.get("/dataStore/metadata-synchronization/instances-DESTINATION/metaData", async () => ({
            created: "2021-03-30T01:59:59.191",
            lastUpdated: "2021-04-20T09:34:00.780",
            externalAccess: false,
            publicAccess: "rw------",
            user: { id: "H4atNsEuKxP" },
            userGroupAccesses: [],
            userAccesses: [],
            lastUpdatedBy: { id: "s5EVHUwoFKu" },
            namespace: "metadata-synchronization",
            key: "instances-DESTINATION",
            value: "",
            favorite: false,
            id: "Db5532sXKX1",
        }));

        const addMetadataToDb = async (schema: Schema<AnyRegistry>, request: Request) => {
            schema.db.metadata.insert(JSON.parse(request.requestBody));

            return {
                status: "OK",
                stats: { created: 1, updated: 0, deleted: 0, ignored: 0, total: 1 },
                typeReports: [],
            };
        };

        local.db.createCollection("metadata", []);
        local.post("/metadata", addMetadataToDb);

        remote.db.createCollection("metadata", []);
        remote.post("/metadata", addMetadataToDb);
    });

    afterEach(() => {
        local.shutdown();
        remote.shutdown();
    });

    it("Local server to remote - organisationUnits featureType type NONE to geometry - API 30 to API 32", async () => {
        const localInstance = Instance.build({
            url: "http://origin.test",
            name: "Testing",
            version: "2.32",
        });

        const builder: SynchronizationBuilder = {
            originInstance: "LOCAL",
            targetInstances: ["DESTINATION"],
            metadataIds: ["ou_id1"],
            excludedIds: [],
        };

        const useCase = new MetadataSyncUseCase(builder, repositoryFactory, localInstance);

        const payload = await useCase.buildPayload();
        expect(payload.organisationUnits?.find(({ id }) => id === "ou_id1")).toBeDefined();

        for await (const _sync of useCase.execute()) {
            // no-op
        }

        // Assert object has been created on remote
        const response = remote.db.metadata.find(1);
        expect(response.organisationUnits[0].id).toEqual("ou_id1");
        expect(response.organisationUnits[0].name).toEqual("Test org unit");
        expect(response.organisationUnits[0].dimensionItemType).toEqual("ORGANISATION_UNIT");

        // Assert old properties are not anymore
        expect(response.organisationUnits[0].featureType).toBeUndefined();
        expect(response.organisationUnits[0].coordinates).toBeUndefined();

        // Assert new properties have the correct values
        expect(response.organisationUnits[0].geometry).toBeUndefined();

        // Assert we have not updated local metadata
        expect(local.db.metadata.find(1)).toBeNull();
    });

    it("Local server to remote - organisationUnits geometry type Point to featureType and coordinates - API 30 to API 32", async () => {
        const localInstance = Instance.build({
            url: "http://origin.test",
            name: "Testing",
            version: "2.30",
        });

        const builder: SynchronizationBuilder = {
            originInstance: "LOCAL",
            targetInstances: ["DESTINATION"],
            metadataIds: ["ou_id2"],
            excludedIds: [],
        };

        const useCase = new MetadataSyncUseCase(builder, repositoryFactory, localInstance);

        const payload = await useCase.buildPayload();
        expect(payload.organisationUnits?.find(({ id }) => id === "ou_id2")).toBeDefined();

        for await (const _sync of useCase.execute()) {
            // no-op
        }

        // Assert object has been created on remote
        const response = remote.db.metadata.find(1);
        expect(response.organisationUnits[1].id).toEqual("ou_id2");
        expect(response.organisationUnits[1].name).toEqual("Test org unit");
        expect(response.organisationUnits[1].dimensionItemType).toEqual("ORGANISATION_UNIT");

        // Assert old properties are not anymore
        expect(response.organisationUnits[1].featureType).toBeUndefined();
        expect(response.organisationUnits[1].coordinates).toBeUndefined();

        // Assert new properties have the correct values
        expect(response.organisationUnits[1].geometry.type).toEqual("Point");
        const expectedValue = JSON.parse("[22.0123,-1.9012]");
        expect(response.organisationUnits[1].geometry.coordinates).toEqual(expectedValue);

        // Assert we have not updated local metadata
        expect(local.db.metadata.find(1)).toBeNull();
    });

    it("Local server to remote - organisationUnits geometry type POLYGON to featureType and coordinates - API 30 to API 32", async () => {
        const localInstance = Instance.build({
            url: "http://origin.test",
            name: "Testing",
            version: "2.30",
        });

        const builder: SynchronizationBuilder = {
            originInstance: "LOCAL",
            targetInstances: ["DESTINATION"],
            metadataIds: ["ou_id3"],
            excludedIds: [],
        };

        const useCase = new MetadataSyncUseCase(builder, repositoryFactory, localInstance);

        const payload = await useCase.buildPayload();
        expect(payload.organisationUnits?.find(({ id }) => id === "ou_id3")).toBeDefined();

        for await (const _sync of useCase.execute()) {
            // no-op
        }

        // Assert object has been created on remote
        const response = remote.db.metadata.find(1);
        expect(response.organisationUnits[2].id).toEqual("ou_id3");
        expect(response.organisationUnits[2].name).toEqual("Test org unit");
        expect(response.organisationUnits[2].dimensionItemType).toEqual("ORGANISATION_UNIT");

        // Assert old properties are not anymore
        expect(response.organisationUnits[2].featureType).toBeUndefined();
        expect(response.organisationUnits[2].coordinates).toBeUndefined();

        // Assert new properties have the correct values
        expect(response.organisationUnits[2].geometry.type).toEqual("Polygon");
        const expectedValue = JSON.parse(
            "[[[[-12.0931,8.507],[-12.09,8.5025],[-12.0875,8.4996],[-12.0814,8.4934],[-12.0779,8.4897],[-12.0753,8.4859],[-12.0735,8.4844],[-12.0679,8.4816],[-12.0629,8.48],[-12.0612,8.4781],[-12.0606,8.4756],[-12.0605,8.4729],[-12.0605,8.4623],[-12.0607,8.4585],[-12.0612,8.4558],[-12.0634,8.4505],[-12.0638,8.448],[-12.0636,8.4445],[-12.0624,8.4396],[-12.0638,8.4336],[-12.0637,8.4297],[-12.0626,8.4274],[-12.0603,8.4258],[-12.0571,8.4255],[-12.0524,8.4276],[-12.0481,8.4281],[-12.0451,8.4274],[-12.0399,8.4236],[-12.0376,8.4228],[-12.0356,8.4232],[-12.0306,8.4255],[-12.0272,8.4275],[-12.0239,8.428],[-12.021,8.4265],[-12.0195,8.4241],[-12.0196,8.4212],[-12.0216,8.4169],[-12.0233,8.4111],[-12.0253,8.4068],[-12.0255,8.4032],[-12.0242,8.4007],[-12.0225,8.3994],[-12.0194,8.3986],[-12.0166,8.3985],[-12.0088,8.3988],[-12.005,8.3987],[-12.0017,8.398],[-11.9999,8.3964],[-11.9979,8.3938],[-11.9916,8.3869],[-11.9904,8.3834],[-11.9914,8.3807],[-11.9937,8.3772],[-11.9982,8.3731],[-12.0036,8.3677],[-12.0093,8.3641],[-12.021,8.358],[-12.0268,8.3539],[-12.0322,8.3507],[-12.0363,8.347],[-12.0399,8.3428],[-12.0442,8.333],[-12.049,8.3247],[-12.0529,8.319],[-12.0544,8.3152],[-12.0545,8.311],[-12.0527,8.3072],[-12.0499,8.3041],[-12.0465,8.3017],[-12.0403,8.2993],[-12.0371,8.2974],[-12.0348,8.2947],[-12.032,8.2896],[-12.0307,8.2841],[-12.0296,8.272],[-12.0268,8.2613],[-12.0265,8.2561],[-12.0272,8.2529],[-12.0299,8.2496],[-12.0337,8.2478],[-12.0366,8.2474],[-12.0411,8.2474],[-12.0456,8.248],[-12.0485,8.2489],[-12.0522,8.2513],[-12.0609,8.2593],[-12.0643,8.2617],[-12.0734,8.2657],[-12.0833,8.267],[-12.0874,8.2685],[-12.0911,8.2711],[-12.1011,8.2806],[-12.1059,8.2842],[-12.1136,8.2877],[-12.1225,8.2896],[-12.1262,8.2914],[-12.1294,8.2941],[-12.1322,8.2973],[-12.1356,8.3026],[-12.1407,8.3093],[-12.1441,8.3145],[-12.1458,8.3168],[-12.149,8.3197],[-12.1514,8.3213],[-12.1578,8.3238],[-12.1651,8.328],[-12.1692,8.3293],[-12.1765,8.3299],[-12.1945,8.3299],[-12.2003,8.3322],[-12.2046,8.3331],[-12.2151,8.334],[-12.2192,8.335],[-12.2257,8.3379],[-12.2321,8.3413],[-12.2414,8.3475],[-12.2467,8.3502],[-12.2504,8.3516],[-12.2547,8.3522],[-12.2606,8.3525],[-12.265,8.3523],[-12.2679,8.3518],[-12.2718,8.3502],[-12.2762,8.3467],[-12.2788,8.3436],[-12.2821,8.3384],[-12.284,8.3362],[-12.2863,8.3343],[-12.2903,8.3321],[-12.2937,8.3306],[-12.2966,8.3299],[-12.2997,8.3296],[-12.3073,8.3298],[-12.3115,8.3307],[-12.3194,8.3341],[-12.3387,8.344],[-12.3464,8.3474],[-12.3506,8.3483],[-12.3564,8.3483],[-12.3605,8.3475],[-12.3671,8.3445],[-12.3718,8.3412],[-12.3773,8.3359],[-12.387,8.3259],[-12.3899,8.3224],[-12.3943,8.3166],[-12.4044,8.3079],[-12.4087,8.3051],[-12.4121,8.3044],[-12.4158,8.3054],[-12.4183,8.3077],[-12.4213,8.3141],[-12.424,8.3172],[-12.427,8.3182],[-12.4304,8.3164],[-12.4319,8.313],[-12.4322,8.3012],[-12.4325,8.2982],[-12.4345,8.2908],[-12.4364,8.2813],[-12.439,8.2729],[-12.4475,8.2802],[-12.4526,8.2869],[-12.4581,8.2906],[-12.4626,8.2909],[-12.4702,8.2894],[-12.4842,8.2882],[-12.4949,8.2854],[-12.4995,8.2849],[-12.5043,8.2848],[-12.5105,8.2853],[-12.5147,8.2865],[-12.5211,8.2896],[-12.5271,8.2935],[-12.5309,8.2953],[-12.549,8.2983],[-12.5523,8.2977],[-12.5597,8.2941],[-12.564,8.293],[-12.5702,8.2924],[-12.57,8.2998],[-12.5696,8.3041],[-12.5671,8.314],[-12.567,8.3193],[-12.5685,8.3254],[-12.5703,8.3288],[-12.5741,8.3334],[-12.5786,8.3375],[-12.5833,8.3406],[-12.5899,8.3437],[-12.5964,8.3459],[-12.605,8.3508],[-12.6163,8.3545],[-12.6261,8.356],[-12.63,8.3572],[-12.6329,8.3593],[-12.6364,8.3635],[-12.639,8.3659],[-12.6464,8.371],[-12.6502,8.3731],[-12.6543,8.3741],[-12.6585,8.3744],[-12.6644,8.3742],[-12.6719,8.3735],[-12.668,8.3838],[-12.666,8.3876],[-12.6611,8.3934],[-12.6545,8.3996],[-12.6521,8.4014],[-12.6495,8.4028],[-12.6466,8.4037],[-12.6393,8.4053],[-12.6306,8.4096],[-12.6265,8.4132],[-12.6238,8.4164],[-12.6202,8.4214],[-12.6181,8.4234],[-12.6144,8.4254],[-12.6076,8.4272],[-12.6036,8.43],[-12.6022,8.433],[-12.6018,8.4378],[-12.6027,8.4433],[-12.6057,8.4505],[-12.6055,8.4546],[-12.6036,8.4574],[-12.5999,8.4595],[-12.589,8.4612],[-12.5809,8.464],[-12.5731,8.4643],[-12.571,8.4629],[-12.5657,8.4552],[-12.5607,8.4508],[-12.5562,8.4454],[-12.5536,8.443],[-12.5498,8.4404],[-12.5471,8.4379],[-12.545,8.4351],[-12.5417,8.4296],[-12.5397,8.4278],[-12.5355,8.4264],[-12.5315,8.4264],[-12.5284,8.4276],[-12.5264,8.4294],[-12.5241,8.4332],[-12.5221,8.4386],[-12.5184,8.4517],[-12.5149,8.4551],[-12.511,8.4563],[-12.5068,8.4564],[-12.5025,8.4557],[-12.4966,8.4537],[-12.4924,8.453],[-12.4866,8.4529],[-12.4824,8.4536],[-12.4666,8.4587],[-12.4638,8.4593],[-12.4568,8.4602],[-12.4515,8.462],[-12.4471,8.4653],[-12.4444,8.4685],[-12.4411,8.4738],[-12.4375,8.4782],[-12.4303,8.4854],[-12.4223,8.4916],[-12.4201,8.4944],[-12.4188,8.4973],[-12.4049,8.4969],[-12.4005,8.4961],[-12.3959,8.4947],[-12.3904,8.4945],[-12.3756,8.498],[-12.372,8.4999],[-12.3689,8.5027],[-12.3662,8.5059],[-12.3621,8.5121],[-12.3593,8.5152],[-12.3559,8.5176],[-12.352,8.519],[-12.341,8.5211],[-12.3364,8.5241],[-12.3328,8.5283],[-12.3275,8.5383],[-12.3247,8.5406],[-12.3206,8.5418],[-12.3103,8.5426],[-12.3062,8.5435],[-12.2962,8.5469],[-12.2877,8.5519],[-12.2812,8.5542],[-12.2696,8.5588],[-12.265,8.5572],[-12.2621,8.5537],[-12.2598,8.552],[-12.2559,8.5501],[-12.2485,8.5446],[-12.2454,8.5432],[-12.241,8.5408],[-12.2378,8.5394],[-12.2335,8.5371],[-12.2303,8.5357],[-12.2259,8.5335],[-12.2199,8.5321],[-12.2146,8.5298],[-12.2086,8.5284],[-12.2033,8.5261],[-12.1965,8.5244],[-12.1929,8.5226],[-12.1876,8.5216],[-12.1799,8.5215],[-12.1749,8.5209],[-12.1685,8.5185],[-12.1646,8.5179],[-12.1574,8.5178],[-12.1544,8.5175],[-12.1515,8.5169],[-12.147,8.515],[-12.1441,8.5145],[-12.1374,8.514],[-12.1336,8.5135],[-12.1282,8.5113],[-12.1223,8.5098],[-12.116,8.5073],[-12.1122,8.5067],[-12.1071,8.5066],[-12.098,8.5067],[-12.0931,8.507]]]]"
        );
        expect(response.organisationUnits[2].geometry.coordinates).toEqual(expectedValue);

        // Assert we have not updated local metadata
        expect(local.db.metadata.find(1)).toBeNull();
    });

    it("Local server to remote - mapViews in maps contain the full object - API 30 to API 32", async () => {
        const localInstance = Instance.build({
            url: "http://origin.test",
            name: "Testing",
            version: "2.30",
        });

        const builder: SynchronizationBuilder = {
            originInstance: "LOCAL",
            targetInstances: ["DESTINATION"],
            metadataIds: ["ou_id2"],
            excludedIds: [],
        };

        const useCase = new MetadataSyncUseCase(builder, repositoryFactory, localInstance);

        await useCase.buildPayload();

        for await (const _sync of useCase.execute()) {
            // no-op
        }

        const response = remote.db.metadata.find(1);
        expect(response).toBeDefined();
        const map = response.maps[0];
        expect(map).toBeDefined();
        expect(map.mapViews).toHaveLength(2);
        expect(map.mapViews[0]).toMatchObject({
            categoryDimensions: [],
            filterDimensions: ["pe"],
            id: "mapView1",
            name: "Map view1",
        });

        expect(map.mapViews[1]).toMatchObject({
            categoryDimensions: [],
            filterDimensions: ["pe"],
            id: "mapView2",
            name: "Map view2",
        });

        // Assert we have not updated local metadata
        expect(local.db.metadata.find(1)).toBeNull();
    });
});

function buildRepositoryFactory() {
    const repositoryFactory: RepositoryFactory = new RepositoryFactory("");
    repositoryFactory.bind(Repositories.InstanceRepository, InstanceD2ApiRepository);
    repositoryFactory.bind(Repositories.ConfigRepository, ConfigAppRepository);
    repositoryFactory.bind(Repositories.MetadataRepository, MetadataD2ApiRepository);
    repositoryFactory.bind(Repositories.TransformationRepository, TransformationD2ApiRepository);
    return repositoryFactory;
}

export {};
