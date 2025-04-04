import { Table, TableBody, TableCell, TableHead, TableRow } from "@material-ui/core";
import _ from "lodash";
import { SynchronizationStats } from "../../../../../domain/reports/entities/SynchronizationResult";
import i18n from "../../../../../utils/i18n";

export const SummaryTable: React.FC<{ stats: SynchronizationStats[] }> = props => {
    const { stats } = props;

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>{i18n.t("Type")}</TableCell>
                    <TableCell>{i18n.t("Imported")}</TableCell>
                    <TableCell>{i18n.t("Updated")}</TableCell>
                    <TableCell>{i18n.t("Deleted")}</TableCell>
                    <TableCell>{i18n.t("Ignored")}</TableCell>
                    <TableCell>{i18n.t("Total")}</TableCell>
                </TableRow>
            </TableHead>

            <TableBody>
                {stats.map(({ type, imported, updated, deleted, ignored, total }, i) => (
                    <TableRow key={`row-${i}`}>
                        <TableCell>{type}</TableCell>
                        <TableCell>{imported}</TableCell>
                        <TableCell>{updated}</TableCell>
                        <TableCell>{deleted}</TableCell>
                        <TableCell>{ignored}</TableCell>
                        <TableCell>{total || _.sum([imported, deleted, ignored, updated])}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
