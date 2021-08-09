import { useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useState } from "react";
import Dropzone from "react-dropzone";
import i18n from "../../../../../locales";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import CloudDoneIcon from "@material-ui/icons/CloudDone";
import { makeStyles } from "@material-ui/core";
import { MetadataPackage } from "../../../../../domain/metadata/entities/MetadataEntities";

interface MetadataDropZoneProps {
    onChange: (fileName: string, metadataPackage: MetadataPackage) => void;
}

const MetadataDropZone: React.FC<MetadataDropZoneProps> = ({ onChange }) => {
    const classes = useStyles();
    const [file, setFile] = useState<File>();
    const snackbar = useSnackbar();

    const onDrop = async (files: File[]) => {
        const file = files[0];
        if (!file) {
            snackbar.error(i18n.t("Cannot read file"));
            return;
        }

        const contentsFile = await file.text();
        const contentsJson = JSON.parse(contentsFile);
        delete contentsJson.date;
        delete contentsJson.package;

        onChange(file.name, contentsJson as MetadataPackage);
        setFile(file);
    };

    return (
        <Dropzone accept={"application/json"} onDrop={onDrop} multiple={false}>
            {({ getRootProps, getInputProps }) => (
                <section>
                    <div
                        {...getRootProps({
                            className: classes.dropzone,
                        })}
                    >
                        <input {...getInputProps()} />
                        <div className={classes.dropzoneTextStyle} hidden={file !== undefined}>
                            <p className={classes.dropzoneParagraph}>{i18n.t("Drag and drop file to import")}</p>
                            <br />
                            <CloudUploadIcon className={classes.uploadIconSize} />
                        </div>
                        <div className={classes.dropzoneTextStyle} hidden={file === undefined}>
                            {file !== undefined && <p className={classes.dropzoneParagraph}>{file.name}</p>}
                            <br />
                            <CloudDoneIcon className={classes.uploadIconSize} />
                        </div>
                    </div>
                </section>
            )}
        </Dropzone>
    );
};

export default MetadataDropZone;

const useStyles = makeStyles({
    dropzoneTextStyle: { textAlign: "center", top: "15%", position: "relative" },
    dropzoneParagraph: { fontSize: 20 },
    uploadIconSize: { width: 50, height: 50, color: "#909090" },
    dropzone: {
        position: "relative",
        width: "100%",
        height: 270,
        backgroundColor: "#f0f0f0",
        border: "dashed",
        borderColor: "#c8c8c8",
        cursor: "pointer",
    },
    stripes: {
        width: "100%",
        height: 270,
        cursor: "pointer",
        border: "solid",
        borderColor: "#c8c8c8",
        "-webkit-animation": "progress 2s linear infinite !important",
        "-moz-animation": "progress 2s linear infinite !important",
        animation: "progress 2s linear infinite !important",
        backgroundSize: "150% 100%",
    },
});
