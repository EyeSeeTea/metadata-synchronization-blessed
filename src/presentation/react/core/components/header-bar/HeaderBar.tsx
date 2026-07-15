import styled from "styled-components";
// @ts-ignore
import { HeaderBar as D2HeaderBar } from "@dhis2/ui";

type HeaderBarProps = {
    appName: string;
};

// avoid rendering header for versions > 2.41
//https://developers.dhis2.org/docs/references/global-shell/#header-bars
export const HeaderBar: React.FC<HeaderBarProps> = props => {
    const { appName } = props;
    const shouldRenderHeaderBar = window.self === window.top;
    return shouldRenderHeaderBar ? <StyledHeaderBar appName={appName} /> : null;
};

const StyledHeaderBar = styled(D2HeaderBar)`
    div:first-of-type {
        box-sizing: border-box;
    }
`;
