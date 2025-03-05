import { SchedulerContract } from "../../domain/scheduler/entities/SchedulerContract";
import { SchedulerCLI } from "../SchedulerCLI";
import { CompositionRoot } from "../../presentation/CompositionRoot";
import { Logger } from "../../domain/scheduler/entities/Logger";
import { MockScheduler } from "./mocks/MockScheduler";
import { MockLogger } from "./mocks/MockLogger";
import { SynchronizationRule } from "../../domain/rules/entities/SynchronizationRule";
import { SchedulerExecutionInfo } from "../../domain/scheduler/entities/SchedulerExecutionInfo";
import { SyncRuleJobConfig } from "../../domain/scheduler/entities/SyncRuleJobConfig";
import { PrepareSyncError } from "../../domain/synchronization/usecases/PrepareSyncUseCase";
import { Either } from "../../domain/common/entities/Either";
import { FutureData, Future } from "../../domain/common/entities/Future";
import { getSynchronizationRule } from "./data/getSynchronizationRule";
import { getSyncRuleJobConfig } from "./data/getSyncRuleJobConfig";

// NOTICE: This file is refactored.

const API_PATH = "baseUrl/api/";

describe("SchedulerCLI", () => {
    let schedulerCLI: SchedulerCLI;
    let mockScheduler: SchedulerContract;
    let mockCompositionRoot: CompositionRoot;
    let mockLogger: Logger;

    beforeEach(() => {
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

    describe("initialize", () => {
        it("should fetch tasks, schedule a job and log a message", async () => {
            const spyGetSyncRuleJobConfigs = jest.spyOn(mockCompositionRoot.scheduler, "getSyncRuleJobConfigs");
            const spyScheduleJob = jest.spyOn(mockScheduler, "scheduleJob");
            const spyLoggerInfo = jest.spyOn(mockLogger, "info");

            schedulerCLI.initialize(API_PATH);

            expect(spyGetSyncRuleJobConfigs).toHaveBeenCalled();
            expect(spyScheduleJob).toHaveBeenCalled();
            expect(spyLoggerInfo).toHaveBeenCalledWith("main", "Loading synchronization rules from remote server");
        });
    });
});

/**
 * @deprecated this is only a workaround, we need to replace this by a correct implementation of testing CompositionRoot
 */
class MockCompositionRoot {
    rules = {
        get(): Promise<SynchronizationRule | undefined> {
            return Promise.resolve(getSynchronizationRule());
        },
    };

    scheduler = {
        getSyncRuleJobConfigs(): FutureData<SyncRuleJobConfig[]> {
            return Future.success([getSyncRuleJobConfig()]);
        },

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
