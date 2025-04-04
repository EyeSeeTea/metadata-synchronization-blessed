import React from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { MarkdownViewer } from "../../../../react/core/components/markdown/MarkdownViewer";
import PageHeader from "../../../../react/core/components/page-header/PageHeader";
import i18n from "../../../../../utils/i18n";

export const AboutPage: React.FC = React.memo(() => {
    const history = useHistory();

    const contents = [
        `#### ${i18n.t("Distributed under GNU GLPv3")}`,
        i18n.t(
            "MetadataSync (MDSync) is the metadata & data synchronization solution for DHIS2. It allows easy metadata mapping, distribution and the automatization of synchronization of data and metadata. MDSync is also a versatile solution for DHIS2 metadata packages generation, validation and distribution, providing graphical interfaces for such time-consuming operations."
        ),
        i18n.t(
            "This application has been funded by the WHO Global Malaria Programme, Medecins Sans Frontières (MSF), Samaritan’s Purse, Health Information Systems Program South Africa and the U.S. President’s Malaria Initiative (PMI)  to support countries in strengthening the collection and use of health data by using DHIS2. The application has been developed by [EyeSeeTea SL](http://eyeseetea.com). Source code, documentation and release notes can be found at the [EyeSeetea GitHub Project Page](https://eyeseetea.github.io/metadata-synchronization-blessed/metadatasync/)",
            { nsSeparator: false }
        ),
        i18n.t(
            "If you wish to contribute to the development of MetadataSync with new features, please contact [EyeSeeTea](mailto:hello@eyeseetea.com).",
            { nsSeparator: false }
        ),
    ].join("\n\n");

    const goBack = React.useCallback(() => {
        history.goBack();
    }, [history]);

    return (
        <StyledLanding>
            <PageHeader title={i18n.t("About MetaData Synchronization App")} onBackClick={goBack} />
            <div className="about-content">
                <MarkdownViewer source={contents} center={true} />
                <LogoWrapper>
                    <div>
                        <Logo alt={i18n.t("World Health Organization")} src="img/logo-who.svg" />
                    </div>
                    <div>
                        <Logo alt={i18n.t("EyeSeeTea")} src="img/logo-eyeseetea.png" />
                    </div>
                    <div>
                        <Logo size="large" alt={i18n.t("Samaritan's Purse")} src="img/logo-samaritans.svg" />
                    </div>
                    <div>
                        <Logo size="small" alt={i18n.t("Médicos Sin Fronteras")} src="img/logo-msf.svg" />
                    </div>
                    <div>
                        <Logo
                            size="small"
                            alt={i18n.t("Health Information Systems Program - South Africa")}
                            src="img/logo-hisp.png"
                        />
                    </div>
                    <div>
                        <Logo size="large" alt={i18n.t("U.S. President's Malaria Initiative")} src="img/logo-pmi.png" />
                    </div>
                </LogoWrapper>
            </div>
        </StyledLanding>
    );
});

const StyledLanding = styled.div`
    & > div.about-content {
        background-color: rgb(39, 102, 150);
        padding: 0px;
        border-radius: 18px;
        margin: 1em 10px 20px 10px;
        box-shadow: rgba(0, 0, 0, 0.14) 0px 8px 10px 1px, rgba(0, 0, 0, 0.12) 0px 3px 14px 2px,
            rgba(0, 0, 0, 0.2) 0px 5px 5px -3px;
    }

    ${MarkdownViewer} {
        padding: 1rem 2.25rem 0 2.25rem;
        text-align-last: unset;
    }
`;

const LogoWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    row-gap: 2em;
    margin: 0 1em;
    padding: 3em 0;
    justify-content: center;
    div {
        display: flex;
        align-items: center;
    }
`;

interface LogoProps {
    size?: "small" | "default" | "large";
}

const Logo = styled.img<LogoProps>`
    width: ${({ size }) => (size === "large" ? "250px" : size === "small" ? "150px" : "200px")};
    margin: 0 50px;
`;
