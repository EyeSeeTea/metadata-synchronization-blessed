import { useSnackbar } from "d2-ui-components";
import _ from "lodash";
import React, { ReactNode, useEffect, useState } from "react";
import { isInstance } from "../../../../../domain/package-import/entities/PackageSource";
import { ListPackage } from "../../../../../domain/packages/entities/Package";
import i18n from "../../../../../locales";
import { isGlobalAdmin } from "../../../../../utils/permissions";
import { useAppContext } from "../../../contexts/AppContext";
import { PackageImportWizardProps } from "../PackageImportWizard";

export const SummaryStep: React.FC<PackageImportWizardProps> = ({ packageImportRule }) => {
    const { api, compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const getPackagesFromInstance = compositionRoot.packages.list;
    const getPackagesFromStore = compositionRoot.packages.listStore;

    const [globalAdmin, setGlobalAdmin] = useState(false);
    const [packages, setPackages] = useState<ListPackage[]>([]);

    useEffect(() => {
        isGlobalAdmin(api).then(setGlobalAdmin);
    }, [api]);

    useEffect(() => {
        if (isInstance(packageImportRule.source)) {
            getPackagesFromInstance(globalAdmin, packageImportRule.source)
                .then(setPackages)
                .catch((error: Error) => {
                    snackbar.error(error.message);
                    setPackages([]);
                });
        } else {
            getPackagesFromStore(packageImportRule.source.id).then(result => {
                result.match({
                    success: setPackages,
                    error: () => {
                        snackbar.error(i18n.t("Can't connect to store"));
                        setPackages([]);
                    },
                });
            });
        }
    }, [getPackagesFromInstance, getPackagesFromStore, packageImportRule, globalAdmin, snackbar]);

    return (
        <React.Fragment>
            <ul>
                <LiEntry
                    label={
                        isInstance(packageImportRule.source)
                            ? i18n.t("Instance")
                            : i18n.t("Play Store")
                    }
                    value={
                        isInstance(packageImportRule.source)
                            ? packageImportRule.source.name
                            : `${packageImportRule.source.account} - ${packageImportRule.source.repository}`
                    }
                />
                <LiEntry label={i18n.t("Packages")}>
                    <ul>
                        {packages.length === 0 ? (
                            <LiEntry label={i18n.t("Loading ...")} />
                        ) : (
                            packageImportRule.packageIds.map(id => {
                                const instancePackage = packages.find(pkg => pkg.id === id);
                                return <LiEntry key={id} label={`${instancePackage?.name}`} />;
                            })
                        )}
                    </ul>
                </LiEntry>
            </ul>
        </React.Fragment>
    );
};

interface Entry {
    label: string;
    value?: string | number;
    children?: ReactNode;
    hide?: boolean;
}

const LiEntry = ({ label, value, children, hide = false }: Entry) => {
    if (hide) return null;

    return (
        <li key={label}>
            {_.compact([label, value]).join(": ")}
            {children}
        </li>
    );
};
