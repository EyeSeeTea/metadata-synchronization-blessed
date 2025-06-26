import { UseCase } from "../../common/entities/UseCase";
import { SettingsRepository } from "../../settings/SettingsRepository";
import { ReportsRepository } from "../repositories/ReportsRepository";
import moment from "moment";

export class DeleteOldSyncReportUseCase implements UseCase {
    constructor(private reportsRepository: ReportsRepository, private settingsRepository: SettingsRepository) {}

    public async execute(): Promise<void> {
        const settings = await this.settingsRepository.get().toPromise();

        const retentionDays = settings.historyRetentionDays;

        if (!retentionDays) return;

        const history = await this.reportsRepository.list();

        const historyToRemove = history.filter(historyObj => {
            const start = moment(historyObj.date);
            const end = moment(new Date());
            const daysDifference = end.diff(start, "days");

            return daysDifference > retentionDays;
        });

        const historyIdsToRemove = historyToRemove.map(historyObj => historyObj.id);

        if (historyToRemove.length > 0) {
            await this.reportsRepository.deleteByIds(historyIdsToRemove);
        }
    }
}
