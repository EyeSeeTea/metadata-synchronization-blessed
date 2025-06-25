import { Either } from "../../../domain/common/entities/Either";
import { FutureData, Future } from "../../../domain/common/entities/Future";
import { SynchronizationRule } from "../../../domain/rules/entities/SynchronizationRule";
import { ListSyncRuleUseCaseParams } from "../../../domain/rules/usecases/ListSyncRuleUseCase";
import { SchedulerExecutionInfo } from "../../../domain/scheduler/entities/SchedulerExecutionInfo";
import { PrepareSyncError } from "../../../domain/synchronization/usecases/PrepareSyncUseCase";
import { CompositionRoot } from "../../../presentation/CompositionRoot";
import { Logger } from "../Logger";
import { SchedulerCLI, SyncRuleJobConfig } from "../SchedulerCLI";
import { SchedulerContract } from "../SchedulerContract";
import { getSynchronizationRule } from "./data/getSynchronizationRule";
import { MockLogger } from "./mocks/MockLogger";
import { MockScheduler } from "./mocks/MockScheduler";

// TODO: This is the first version of tests, needs a refactor to use ts-mockito instead

const API_PATH = "baseUrl/api/";

describe("SchedulerCLI", () => {
    let schedulerCLI: SchedulerCLI;
    let mockScheduler: SchedulerContract;
    let mockCompositionRoot: CompositionRoot;
    let mockLogger: Logger;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2025-06-12T08:12:50.777Z"));

        jest.clearAllMocks();
        mockScheduler = new MockScheduler();
        mockCompositionRoot = new MockCompositionRoot() as unknown as CompositionRoot;
        mockLogger = new MockLogger();

        schedulerCLI = new SchedulerCLI({
            scheduler: mockScheduler,
            compositionRoot: mockCompositionRoot as unknown as CompositionRoot,
            logger: mockLogger,
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe("initialize", () => {
        it("should fetch tasks, schedule a job and log a message", async () => {
            const spyGetSyncRuleJobConfigs = jest.spyOn(mockCompositionRoot.rules, "list");
            const spyScheduleJob = jest.spyOn(mockScheduler, "scheduleJob");
            const spyLoggerInfo = jest.spyOn(mockLogger, "info");

            schedulerCLI.initialize(API_PATH);

            expect(spyGetSyncRuleJobConfigs).toHaveBeenCalled();
            expect(spyScheduleJob).toHaveBeenCalled();
            expect(spyLoggerInfo).toHaveBeenCalledWith("main", "Loading synchronization rules from remote server");
        });

        it("should call compositionRoot.rules.list with correct params and return correct SyncRuleJobConfig[]", async () => {
            const spyListRules = jest.spyOn(mockCompositionRoot.rules, "list");

            const expectedSyncRules: SynchronizationRule[] = [getSynchronizationRule(true)];

            const result = await schedulerCLI["getEnabledSyncRules"]();

            expect(spyListRules).toHaveBeenCalledWith({
                paging: false,
                filters: { schedulerEnabledFilter: "enabled", allProperties: true },
            });
            expect(result).toEqual(expectedSyncRules);
        });

        it("should call getSyncRuleJobConfigs and return correct SyncRuleJobConfig", async () => {
            const syncRulesEnabled: SynchronizationRule[] = [getSynchronizationRule(true)];
            const expectedSyncRuleJobConfigs: SyncRuleJobConfig[] = [getSyncRuleJobConfig()];

            const result = await schedulerCLI["getSyncRuleJobConfigs"](syncRulesEnabled);

            expect(result).toEqual(expectedSyncRuleJobConfigs);
        });
    });
});

function getSyncRuleJobConfig(): SyncRuleJobConfig {
    return {
        id: "sync-rule-id",
        name: "Sync Rule",
        frequency: "0 */2 * * * *",
        needsUpdateFrequency: false,
    };
}

/**
 * @deprecated this is only a workaround, we need to replace this by a correct implementation of testing CompositionRoot
 */
class MockCompositionRoot {
    rules = {
        get(): Promise<SynchronizationRule | undefined> {
            return Promise.resolve(getSynchronizationRule());
        },

        list(params: ListSyncRuleUseCaseParams): Promise<{ rows: SynchronizationRule[] }> {
            const { schedulerEnabledFilter = null } = params.filters || {};
            const isSchedulerEnabled = schedulerEnabledFilter === "enabled";
            return Promise.resolve({ rows: [getSynchronizationRule(isSchedulerEnabled)] });
        },
    };

    scheduler = {
        getLastExecutionInfo(): FutureData<SchedulerExecutionInfo> {
            return Future.success({ lastExecution: new Date() });
        },

        updateExecutionInfo(_executionInfo: SchedulerExecutionInfo): FutureData<void> {
            return Future.success(undefined);
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
