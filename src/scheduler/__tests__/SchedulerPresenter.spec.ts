import { SchedulerContract } from "../entities/SchedulerContract";
import { SchedulerPresenter } from "../SchedulerPresenter";
import { CompositionRoot } from "../../presentation/CompositionRoot";
import { Logger } from "../entities/Logger";
import { MockScheduler } from "./mocks/MockScheduler";
import { MockLogger } from "./mocks/MockLogger";
import { SynchronizationRule, SynchronizationRuleData } from "../../domain/rules/entities/SynchronizationRule";
import { SchedulerExecutionInfo } from "../../domain/scheduler/entities/SchedulerExecutionInfo";
import { SyncRuleJobConfig } from "../../domain/scheduler/entities/SyncRuleJobConfig";
import { PrepareSyncError } from "../../domain/synchronization/usecases/PrepareSyncUseCase";
import { Either } from "../../domain/common/entities/Either";

const API_PATH = "baseUrl/api/";

describe("SchedulerPresenter", () => {
    let schedulerPresenter: SchedulerPresenter;
    let mockScheduler: SchedulerContract;
    let mockCompositionRoot: CompositionRoot;
    let mockLogger: Logger;

    beforeEach(() => {
        jest.clearAllMocks();
        mockScheduler = new MockScheduler();
        mockCompositionRoot = new MockCompositionRoot() as unknown as CompositionRoot;
        mockLogger = new MockLogger();

        schedulerPresenter = new SchedulerPresenter({
            scheduler: mockScheduler,
            compositionRoot: mockCompositionRoot as unknown as CompositionRoot,
            logger: mockLogger,
        });
    });

    describe("initialize", () => {
        it("should fetch tasks, schedule a job and log a message", async () => {
            const spyGetSyncRuleJobConfigs = jest.spyOn(mockCompositionRoot.scheduler, "getSyncRuleJobConfigs");
            const spyScheduleJob = jest.spyOn(mockScheduler, "scheduleJob");
            const spyLoggerInfo = jest.spyOn(mockLogger, "info");

            schedulerPresenter.initialize(API_PATH);

            expect(spyGetSyncRuleJobConfigs).toHaveBeenCalled();
            expect(spyScheduleJob).toHaveBeenCalled();
            expect(spyLoggerInfo).toHaveBeenCalledWith("main", "Loading synchronization rules from remote server");
        });
    });
});

function getSynchronizationRule(): SynchronizationRule {
    const data: SynchronizationRuleData = {
        id: "sync-rule-id",
        code: "Sync Rule",
        name: "Sync Rule",
        type: "metadata",
        user: { id: "user-id", name: "User Name" },
        created: new Date(),
        enabled: true,
        frequency: "0 */2 * * * *",
        description: "Sync Rule",
        lastUpdated: new Date(),
        lastExecuted: new Date(),
        publicAccess: "rw------",
        userAccesses: [],
        lastUpdatedBy: { id: "user-id", name: "User Name" },
        lastExecutedBy: { id: "user-id", name: "User Name" },
        targetInstances: ["target-instance-id"],
        userGroupAccesses: [],
        lastSuccessfulSync: new Date(),
        builder: {
            dataParams: {
                dryRun: false,
                allTEIs: true,
                strategy: "NEW_AND_UPDATES",
                allEvents: true,
                enableAggregation: false,
                allAttributeCategoryOptions: true,
            },
            syncParams: {
                mergeMode: "MERGE",
                atomicMode: "ALL",
                importMode: "COMMIT",
                enableMapping: false,
                importStrategy: "CREATE_AND_UPDATE",
                metadataModelsSyncAll: [],
                includeSharingSettings: true,
                removeOrgUnitReferences: false,
                useDefaultIncludeExclude: true,
            },
            excludedIds: [],
            filterRules: [],
            metadataIds: ["metadata-ids"],
            metadataTypes: ["optionSets"],
            originInstance: "LOCAL",
            targetInstances: ["target-instance-id"],
        },
    };

    return SynchronizationRule.build(data);
}

function getSyncRuleJobConfig(): SyncRuleJobConfig {
    return {
        id: "sync-rule-id",
        name: "Sync Rule",
        frequency: "0 */2 * * * *",
    };
}

// TODO: this is only a workaround, we need to replace this by a correct implementation of testing CompositionRoot
class MockCompositionRoot {
    rules = {
        get(): Promise<SynchronizationRule | undefined> {
            return Promise.resolve(getSynchronizationRule());
        },
    };

    scheduler = {
        getSyncRuleJobConfigs(): Promise<SyncRuleJobConfig[]> {
            return Promise.resolve([getSyncRuleJobConfig()]);
        },

        getLastExecutionInfo(): Promise<SchedulerExecutionInfo> {
            return Promise.resolve({ nextExecution: new Date() });
        },

        updateExecutionInfo(_executionInfo: SchedulerExecutionInfo): Promise<void> {
            return Promise.resolve();
        },
    };

    sync = {
        prepare(): Promise<Either<PrepareSyncError, void>> {
            return Promise.resolve(Either.success(undefined));
        },

        metadata() {
            return {
                execute: async function* () {
                    yield { message: "Task started", done: false };
                    yield { message: "Task finished", done: true, syncReport: { id: "report1" } };
                },
            };
        },
    };

    reports = {
        save(): Promise<void> {
            return Promise.resolve();
        },
    };
}
