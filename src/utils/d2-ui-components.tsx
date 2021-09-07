import { ReactNode } from "react";
import _ from "lodash";

export const getValueForCollection = (values: any): ReactNode => {
    const namesToDisplay = _(values)
        .map(value => value.displayName || value.name || value.id)
        .compact()
        .value();

    return (
        <ul>
            {namesToDisplay.map(name => (
                <li key={name}>{name}</li>
            ))}
        </ul>
    );
};
