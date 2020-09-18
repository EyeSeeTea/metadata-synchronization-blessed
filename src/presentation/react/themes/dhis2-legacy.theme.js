import {
    cyan100,
    cyan500,
    cyan700,
    darkBlack,
    grey100,
    grey400,
    grey500,
    orange500,
    white,
} from "material-ui/styles/colors";
import { fade } from "material-ui/utils/colorManipulator";
import Spacing from "material-ui/styles/spacing";
import getMuiTheme from "material-ui/styles/getMuiTheme";

const theme = {
    spacing: Spacing,
    fontFamily: "Roboto, sans-serif",
    palette: {
        primary1Color: cyan500,
        primary2Color: cyan700,
        primary3Color: cyan100,
        accent1Color: orange500,
        accent2Color: grey100,
        accent3Color: grey500,
        textColor: darkBlack,
        alternateTextColor: white,
        canvasColor: white,
        borderColor: grey400,
        disabledColor: fade(darkBlack, 0.3),
    },
};

function createAppTheme(style) {
    return {
        sideBar: {
            backgroundColor: "#F3F3F3",
            backgroundColorItem: "transparent",
            backgroundColorItemActive: style.palette.accent2Color,
            textColor: style.palette.textColor,
            textColorActive: "#276696",
            borderStyle: "1px solid #e1e1e1",
        },
        forms: {
            minWidth: 350,
            maxWidth: 900,
        },
        formFields: {
            secondaryColor: style.palette.accent4Color,
        },
        tabs: {
            backgroundColor: "#E4E4E4",
            inkBarColor: style.palette.accent1Color,
            textColor: "#666666",
        },
    };
}

const muiTheme = getMuiTheme(theme);
const appTheme = createAppTheme(muiTheme);

export default Object.assign({}, muiTheme, appTheme);
