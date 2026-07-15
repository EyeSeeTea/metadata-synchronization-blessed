import { describe, it, expect } from "vitest";
import { mock, when, anything, instance as resolveMock, verify } from "ts-mockito";
import { SaveInstanceUseCase } from "../SaveInstanceUseCase";
import { InstanceRepository } from "../../repositories/InstanceRepository";
import { ExchangeTargetType, Instance } from "../../entities/Instance";

const LOCAL_URL = "http://localhost:8080";

describe("SaveInstanceUseCase", () => {
    const localInstance = Instance.build({ id: "LOCAL", type: "local", name: "Local Instance", url: LOCAL_URL });

    function buildAdexInstance(params: {
        id: string;
        name: string;
        exchangeTargetType: ExchangeTargetType;
        url: string;
    }): Instance {
        return Instance.build({
            id: params.id,
            name: params.name,
            type: "aggregated-data-exchange",
            url: params.url,
            exchangeTargetType: params.exchangeTargetType,
        });
    }

    function createUseCase(existingInstances: Instance[]) {
        const repository = mock<InstanceRepository>();
        when(repository.getAll(anything())).thenResolve([localInstance, ...existingInstances]);
        when(repository.save(anything())).thenResolve();

        return { useCase: new SaveInstanceUseCase(resolveMock(repository)), repository };
    }

    it("rejects a second internal Aggregated Data Exchange instance", async () => {
        const existingInternal = buildAdexInstance({
            id: "internal1",
            name: "Internal 1",
            exchangeTargetType: "internal",
            url: LOCAL_URL,
        });
        const { useCase, repository } = createUseCase([existingInternal]);

        const newInternal = buildAdexInstance({
            id: "internal2",
            name: "Internal 2",
            exchangeTargetType: "internal",
            url: LOCAL_URL,
        });

        const errors = await useCase.execute(newInternal);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe("exchangeTargetType");
        expect(errors[0].error).toBe("internal_exists");
        verify(repository.save(anything())).never();
    });

    it("allows updating the existing internal instance", async () => {
        const existingInternal = buildAdexInstance({
            id: "internal1",
            name: "Internal 1",
            exchangeTargetType: "internal",
            url: LOCAL_URL,
        });
        const { useCase, repository } = createUseCase([existingInternal]);

        const updatedInternal = buildAdexInstance({
            id: "internal1",
            name: "Internal 1 renamed",
            exchangeTargetType: "internal",
            url: LOCAL_URL,
        });

        const errors = await useCase.execute(updatedInternal);

        expect(errors).toEqual([]);
        verify(repository.save(anything())).once();
    });

    it("allows creating an internal instance when only external ones exist", async () => {
        const existingExternal = buildAdexInstance({
            id: "external1",
            name: "External 1",
            exchangeTargetType: "external",
            url: "https://play.dhis2.org/remote",
        });
        const { useCase, repository } = createUseCase([existingExternal]);

        const newInternal = buildAdexInstance({
            id: "internal1",
            name: "Internal 1",
            exchangeTargetType: "internal",
            url: LOCAL_URL,
        });

        const errors = await useCase.execute(newInternal);

        expect(errors).toEqual([]);
        verify(repository.save(anything())).once();
    });

    it("still rejects two external instances sharing the same URL", async () => {
        const sharedUrl = "https://play.dhis2.org/remote";
        const existingExternal = buildAdexInstance({
            id: "external1",
            name: "External 1",
            exchangeTargetType: "external",
            url: sharedUrl,
        });
        const { useCase, repository } = createUseCase([existingExternal]);

        const newExternal = buildAdexInstance({
            id: "external2",
            name: "External 2",
            exchangeTargetType: "external",
            url: sharedUrl,
        });

        const errors = await useCase.execute(newExternal);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe("url");
        expect(errors[0].error).toBe("url_exists");
        verify(repository.save(anything())).never();
    });

    it("rejects changing the exchange target type of an existing instance", async () => {
        const existingExternal = buildAdexInstance({
            id: "adex1",
            name: "ADEX 1",
            exchangeTargetType: "external",
            url: "https://play.dhis2.org/remote",
        });
        const { useCase, repository } = createUseCase([existingExternal]);

        const switchedToInternal = buildAdexInstance({
            id: "adex1",
            name: "ADEX 1",
            exchangeTargetType: "internal",
            url: LOCAL_URL,
        });

        const errors = await useCase.execute(switchedToInternal);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe("exchangeTargetType");
        expect(errors[0].error).toBe("exchange_target_type_immutable");
        verify(repository.save(anything())).never();
    });

    it("rejects changing the type of an existing instance", async () => {
        const existingExternal = buildAdexInstance({
            id: "adex1",
            name: "ADEX 1",
            exchangeTargetType: "external",
            url: "https://play.dhis2.org/remote",
        });
        const { useCase, repository } = createUseCase([existingExternal]);

        const switchedToDhis = Instance.build({
            id: "adex1",
            name: "ADEX 1",
            type: "dhis",
            url: "https://play.dhis2.org/remote",
            username: "admin",
            password: "district",
        });

        const errors = await useCase.execute(switchedToDhis);

        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe("type");
        expect(errors[0].error).toBe("type_immutable");
        verify(repository.save(anything())).never();
    });

    it("allows saving an existing instance keeping the same exchange target type", async () => {
        const existingExternal = buildAdexInstance({
            id: "adex1",
            name: "ADEX 1",
            exchangeTargetType: "external",
            url: "https://play.dhis2.org/remote",
        });
        const { useCase, repository } = createUseCase([existingExternal]);

        const renamed = buildAdexInstance({
            id: "adex1",
            name: "ADEX 1 renamed",
            exchangeTargetType: "external",
            url: "https://play.dhis2.org/remote",
        });

        const errors = await useCase.execute(renamed);

        expect(errors).toEqual([]);
        verify(repository.save(anything())).once();
    });
});
