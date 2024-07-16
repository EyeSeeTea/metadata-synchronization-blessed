import { useLoading } from "@eyeseetea/d2-ui-components";
import React, { useEffect } from "react";
import i18n from "../../../../../locales";

interface DeletetingHistoryProps {
    deleting: Boolean;
}

export const DeletingHistory: React.FC<DeletetingHistoryProps> = ({ deleting }) => {
    const loading = useLoading();

    useEffect(() => {
        if (deleting) {
            loading.show(true, i18n.t("Deleting history"));
        } else {
            loading.reset();
        }
    }, [deleting, loading]);

    return <React.Fragment />;
};
